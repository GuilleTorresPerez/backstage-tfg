#!/usr/bin/env python3
"""Extract ENS security measures from the official BOE XML for RD 311/2022."""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable
from urllib.request import urlopen
from xml.etree import ElementTree as ET


SOURCE_URL = "https://www.boe.es/eli/es/rd/2022/05/03/311/dof/spa/xml"
EXPECTED_MEASURE_COUNT = 73
EXPECTED_SUBMEASURE_COUNT = 208

FRAMEWORKS = {
    "org": "Marco organizativo",
    "op": "Marco operacional",
    "mp": "Medidas de protección",
}

FRAMEWORK_DOCUMENTS = {
    "org": "ens-marco-organizativo.md",
    "op": "ens-marco-operacional.md",
    "mp": "ens-medidas-de-proteccion.md",
}

HEADING_WITH_CODE_RE = re.compile(
    r"^\d+(?:\.\d+)*\.?\s+(.+?)\s+\[([^\]]+)\]\.?$"
)

MEASURE_HEADING_RE = re.compile(r"^\d+(?:\.\d+)+\s+(.+?)\s+\[([^\]]+)\]\.?$")
MAIN_MEASURE_CODE_RE = re.compile(
    r"^(?:org\.\d+|op\.[a-z]+\.\d+|mp\.[a-z]+\.\d+)$"
)
SUBMEASURE_CODE_RE = re.compile(
    r"^((?:org\.\d+|op\.[a-z]+\.\d+|mp\.[a-z]+\.\d+))\.\d+$"
)
CODE_PREFIX_RE = re.compile(r"^(?:[–-]\s*)?\[([^\]]+)\]\s*(.*)$")
REFINEMENT_HEADING_RE = re.compile(r"^Refuerzo R\d+", re.IGNORECASE)
APPLICATION_HEADING_RE = re.compile(r"^Aplicación de la medida", re.IGNORECASE)
GENERIC_SECTION_RE = re.compile(r"^Requisitos\.$", re.IGNORECASE)


@dataclass
class Submeasure:
    codigo: str
    medida: str
    marco: str
    familia: str
    medida_principal: str
    descripcion: list[str] = field(default_factory=list)


@dataclass
class Measure:
    codigo: str
    medida: str
    marco: str
    familia: str
    descripcion: list[str] = field(default_factory=list)
    submedidas: list[Submeasure] = field(default_factory=list)


@dataclass(frozen=True)
class SummaryRow:
    tipo: str
    codigo: str
    medida: str
    marco: str
    familia: str
    medida_principal: str


def normalize_text(element: ET.Element) -> str:
    text = "".join(element.itertext()).replace("\xa0", " ")
    return re.sub(r"\s+", " ", text).strip()


def normalize_code(raw_code: str) -> str:
    code = raw_code.strip().lower()
    code = re.sub(r"\s+", ".", code)
    code = re.sub(r"\.+", ".", code)
    return code.strip(".")


def clean_code_description(raw_description: str) -> str:
    description = raw_description.strip()
    if description.startswith(". "):
        return description[2:].strip()
    return description


def fetch_xml(source_url: str) -> bytes:
    with urlopen(source_url, timeout=30) as response:
        return response.read()


def iter_annex_ii_elements(root: ET.Element) -> Iterable[ET.Element]:
    texto = root.find("texto")
    if texto is None:
        raise RuntimeError("No se encontro el nodo <texto> en el XML del BOE")

    in_annex_ii = False
    for element in texto:
        if element.tag == "p" and element.attrib.get("class") == "anexo_num":
            title = normalize_text(element)
            if title == "ANEXO II":
                in_annex_ii = True
                continue
            if in_annex_ii:
                break

        if in_annex_ii:
            yield element


def extract_measures(xml_payload: bytes) -> list[Measure]:
    root = ET.fromstring(xml_payload)
    labels: dict[str, str] = {}
    measures: list[Measure] = []
    seen_codes: set[str] = set()
    seen_submeasure_codes: set[str] = set()
    current_measure: Measure | None = None
    current_submeasure: Submeasure | None = None
    skipping_section = False

    for element in iter_annex_ii_elements(root):
        if element.tag != "p":
            continue

        text = normalize_text(element)

        heading_match = HEADING_WITH_CODE_RE.match(text)
        if heading_match:
            title, raw_code = heading_match.groups()
            code = normalize_code(raw_code)
            labels[code] = title

        measure_match = MEASURE_HEADING_RE.match(text)
        if measure_match:
            title, raw_code = measure_match.groups()
            code = normalize_code(raw_code)
            if not MAIN_MEASURE_CODE_RE.match(code):
                current_measure = None
                current_submeasure = None
                skipping_section = False
                continue

            if code in seen_codes:
                raise RuntimeError(f"Codigo duplicado detectado: {code}")

            framework_code = code.split(".", 1)[0]
            family_code = code.rsplit(".", 1)[0]
            framework = labels.get(framework_code, FRAMEWORKS[framework_code])
            family = labels.get(family_code, framework)

            current_measure = Measure(
                codigo=code,
                medida=title,
                marco=framework,
                familia=family,
            )
            measures.append(current_measure)
            seen_codes.add(code)
            current_submeasure = None
            skipping_section = False
            continue

        if current_measure is None:
            continue

        if APPLICATION_HEADING_RE.match(text):
            current_submeasure = None
            skipping_section = True
            continue

        if REFINEMENT_HEADING_RE.match(text):
            current_submeasure = None
            skipping_section = True
            continue

        code_match = CODE_PREFIX_RE.match(text)
        if code_match:
            code = normalize_code(code_match.group(1))
            description = clean_code_description(code_match.group(2))
            submeasure_match = SUBMEASURE_CODE_RE.match(code)
            if submeasure_match:
                parent_code = submeasure_match.group(1)
                if parent_code != current_measure.codigo:
                    raise RuntimeError(
                        f"Submedida {code} encontrada dentro de {current_measure.codigo}"
                    )
                if code in seen_submeasure_codes:
                    raise RuntimeError(f"Codigo de submedida duplicado detectado: {code}")

                current_submeasure = Submeasure(
                    codigo=code,
                    medida=description,
                    marco=current_measure.marco,
                    familia=current_measure.familia,
                    medida_principal=current_measure.codigo,
                    descripcion=[description] if description else [],
                )
                current_measure.submedidas.append(current_submeasure)
                seen_submeasure_codes.add(code)
                skipping_section = False
            else:
                current_submeasure = None
                skipping_section = True
            continue

        if skipping_section or GENERIC_SECTION_RE.match(text):
            continue

        if current_submeasure is not None:
            current_submeasure.descripcion.append(text)
        else:
            current_measure.descripcion.append(text)

    return measures


def validate_measures(
    measures: list[Measure],
    expected_measure_count: int | None,
    expected_submeasure_count: int | None,
) -> None:
    if expected_measure_count is not None and len(measures) != expected_measure_count:
        raise RuntimeError(
            f"Se esperaban {expected_measure_count} medidas principales y se extrajeron {len(measures)}"
        )
    if not measures:
        raise RuntimeError("No se extrajo ninguna medida principal")
    if measures[0].codigo != "org.1" or measures[-1].codigo != "mp.s.4":
        raise RuntimeError(
            "La lista extraida no empieza por org.1 y termina por mp.s.4; "
            "puede haber cambiado el formato del BOE"
        )
    submeasure_count = sum(len(measure.submedidas) for measure in measures)
    if expected_submeasure_count is not None and submeasure_count != expected_submeasure_count:
        raise RuntimeError(
            f"Se esperaban {expected_submeasure_count} submedidas y se extrajeron {submeasure_count}"
        )
    empty_submeasures = [
        submeasure.codigo
        for measure in measures
        for submeasure in measure.submedidas
        if not description_text(submeasure.descripcion)
    ]
    if empty_submeasures:
        raise RuntimeError(
            "Submedidas sin descripcion extraida: " + ", ".join(empty_submeasures)
        )
    empty_measures = [
        measure.codigo for measure in measures if not measure_description_text(measure)
    ]
    if empty_measures:
        raise RuntimeError(
            "Medidas sin descripcion extraida: " + ", ".join(empty_measures)
        )


def description_text(parts: list[str]) -> str:
    return "\n\n".join(part for part in parts if part).strip()


def measure_description_text(measure: Measure) -> str:
    description = description_text(measure.descripcion)
    if description:
        return description
    return description_text(
        [description_text(submeasure.descripcion) for submeasure in measure.submedidas]
    )


def iter_summary_rows(measures: list[Measure]) -> Iterable[SummaryRow]:
    for measure in measures:
        yield SummaryRow(
            tipo="medida",
            codigo=measure.codigo,
            medida=measure.medida,
            marco=measure.marco,
            familia=measure.familia,
            medida_principal="",
        )
        for submeasure in measure.submedidas:
            yield SummaryRow(
                tipo="submedida",
                codigo=submeasure.codigo,
                medida=submeasure.medida,
                marco=submeasure.marco,
                familia=submeasure.familia,
                medida_principal=measure.codigo,
            )


def markdown_cell(value: str) -> str:
    return value.replace("|", "\\|")


def render_markdown(measures: list[Measure], source_url: str) -> str:
    submeasure_count = sum(len(measure.submedidas) for measure in measures)
    lines = [
        "# Resumen de medidas de seguridad ENS RD 311/2022",
        "",
        f"Fuente oficial determinista: {source_url}",
        "",
        f"Total de medidas principales extraidas del Anexo II: {len(measures)}.",
        f"Total de submedidas directas extraidas del Anexo II: {submeasure_count}.",
        "",
        "No se incluyen refuerzos `rN` como submedidas del resumen.",
        "",
        "| Tipo | Codigo | Medida / submedida | Marco | Familia | Medida principal |",
        "|------|--------|--------------------|-------|---------|------------------|",
    ]
    for row in iter_summary_rows(measures):
        lines.append(
            "| "
            f"{row.tipo} | "
            f"`{row.codigo}` | "
            f"{markdown_cell(row.medida)} | "
            f"{markdown_cell(row.marco)} | "
            f"{markdown_cell(row.familia)} | "
            f"{f'`{row.medida_principal}`' if row.medida_principal else ''} |"
        )
    lines.append("")
    return "\n".join(lines)


def render_csv(measures: list[Measure], output) -> None:
    writer = csv.DictWriter(
        output,
        fieldnames=["tipo", "codigo", "medida", "marco", "familia", "medida_principal"],
    )
    writer.writeheader()
    for row in iter_summary_rows(measures):
        writer.writerow(row.__dict__)


def render_json(measures: list[Measure]) -> str:
    return json.dumps(
        [
            {
                "codigo": measure.codigo,
                "medida": measure.medida,
                "marco": measure.marco,
                "familia": measure.familia,
                "descripcion": measure_description_text(measure),
                "submedidas": [
                    {
                        "codigo": submeasure.codigo,
                        "medida": submeasure.medida,
                        "marco": submeasure.marco,
                        "familia": submeasure.familia,
                        "medida_principal": submeasure.medida_principal,
                        "descripcion": description_text(submeasure.descripcion),
                    }
                    for submeasure in measure.submedidas
                ],
            }
            for measure in measures
        ],
        ensure_ascii=False,
        indent=2,
    )


def render_framework_markdown(
    measures: list[Measure], framework_code: str, source_url: str
) -> str:
    framework = FRAMEWORKS[framework_code]
    framework_measures = [
        measure for measure in measures if measure.codigo.split(".", 1)[0] == framework_code
    ]
    submeasure_count = sum(len(measure.submedidas) for measure in framework_measures)
    lines = [
        f"# {framework}",
        "",
        f"Fuente oficial determinista: {source_url}",
        "",
        f"Medidas principales: {len(framework_measures)}.",
        f"Submedidas directas: {submeasure_count}.",
        "",
        "No se incluyen refuerzos `rN`; se documentan solo medidas principales y submedidas directas.",
        "",
    ]
    for measure in framework_measures:
        lines.extend(
            [
                f"## `{measure.codigo}` {measure.medida}",
                "",
                f"**Familia:** {measure.familia}",
                "",
            ]
        )
        description = measure_description_text(measure)
        if description:
            lines.extend(["**Descripción de la fuente:**", "", description, ""])
        if measure.submedidas:
            lines.extend(["### Submedidas", ""])
            for submeasure in measure.submedidas:
                lines.extend(
                    [
                        f"#### `{submeasure.codigo}`",
                        "",
                        description_text(submeasure.descripcion),
                        "",
                    ]
                )
    return "\n".join(lines).rstrip() + "\n"


def write_framework_documents(
    measures: list[Measure], output_dir: Path, source_url: str
) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    for framework_code, filename in FRAMEWORK_DOCUMENTS.items():
        output_path = output_dir / filename
        output_path.write_text(
            render_framework_markdown(measures, framework_code, source_url),
            encoding="utf-8",
        )


def write_text(content: str, output_path: Path | None) -> None:
    if output_path is None:
        sys.stdout.write(content)
        return
    output_path.write_text(content, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extrae las medidas principales del Anexo II del ENS desde el XML oficial del BOE."
    )
    parser.add_argument("--source-url", default=SOURCE_URL)
    parser.add_argument(
        "--format",
        choices=("markdown", "csv", "json"),
        default="markdown",
        help="Formato de salida.",
    )
    parser.add_argument("--output", type=Path, help="Ruta de salida. Si no se indica, imprime por stdout.")
    parser.add_argument(
        "--expected-count",
        type=int,
        default=EXPECTED_MEASURE_COUNT,
        help="Conteo esperado para validar que la extraccion no ha cambiado. Use 0 para desactivar.",
    )
    parser.add_argument(
        "--expected-submeasure-count",
        type=int,
        default=EXPECTED_SUBMEASURE_COUNT,
        help="Conteo esperado de submedidas directas. Use 0 para desactivar.",
    )
    parser.add_argument(
        "--framework-output-dir",
        type=Path,
        help="Directorio en el que escribir un documento Markdown por marco ENS.",
    )
    args = parser.parse_args()

    xml_payload = fetch_xml(args.source_url)
    measures = extract_measures(xml_payload)
    validate_measures(
        measures,
        None if args.expected_count == 0 else args.expected_count,
        None if args.expected_submeasure_count == 0 else args.expected_submeasure_count,
    )

    if args.format == "markdown":
        write_text(render_markdown(measures, args.source_url), args.output)
    elif args.format == "json":
        write_text(render_json(measures), args.output)
    else:
        if args.output is None:
            render_csv(measures, sys.stdout)
        else:
            with args.output.open("w", encoding="utf-8", newline="") as output:
                render_csv(measures, output)

    if args.framework_output_dir is not None:
        write_framework_documents(measures, args.framework_output_dir, args.source_url)


if __name__ == "__main__":
    main()
