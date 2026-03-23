"""Escenario 2: Extracción de fichas/metadata de cada solución CTT."""

import asyncio
import logging
from dataclasses import asdict

from playwright.async_api import BrowserContext

from models import Ficha
from utils import navigate_with_retry

log = logging.getLogger(__name__)

# Mapeo de labels del DOM a campos del dataclass Ficha.
# Las claves se normalizan a minúsculas y sin espacios extra.
LABEL_MAP: dict[str, str] = {
    "nombre completo": "nombre_completo",
    "nombre abreviado": "nombre_abreviado",
    "nombre": "nombre_completo",
    "resumen": "resumen",
    "descripción": "resumen",
    "estado": "estado",
    "modo de uso": "modo_de_uso",
    "organismo responsable": "organismo_responsable",
    "tipo de solución": "tipo_de_solucion",
    "tipo solución": "tipo_de_solucion",
    "área técnica": "area_tecnica",
    "area técnica": "area_tecnica",
    "área funcional": "area_funcional",
    "area funcional": "area_funcional",
    "área orgánica": "area_organica",
    "area orgánica": "area_organica",
    "destinatarios": "destinatarios",
    "licencia": "licencia",
    "tipo de licencia": "licencia",
    "contacto caid": "contacto_caid",
    "contacto": "contacto_caid",
}

# JavaScript multi-estrategia para extraer pares label/value del DOM.
EXTRACT_PAIRS_JS = """
() => {
    const pairs = {};
    const normalize = (s) => s.replace(/\\s+/g, ' ').trim();

    // Estrategia 1: <dt>/<dd> pairs
    const dts = document.querySelectorAll('dt');
    for (const dt of dts) {
        const dd = dt.nextElementSibling;
        if (dd && dd.tagName === 'DD') {
            const label = normalize(dt.innerText);
            const value = normalize(dd.innerText);
            if (label && value) pairs[label] = value;
        }
    }

    // Estrategia 2: <th>/<td> en misma fila
    const rows = document.querySelectorAll('tr');
    for (const row of rows) {
        const th = row.querySelector('th');
        const td = row.querySelector('td');
        if (th && td) {
            const label = normalize(th.innerText);
            const value = normalize(td.innerText);
            if (label && value) pairs[label] = value;
        }
    }

    // Estrategia 3: Divs con clases tipo label/value
    const labelDivs = document.querySelectorAll(
        '.label, .field-label, [class*="label"], [class*="Label"]'
    );
    for (const labelDiv of labelDivs) {
        const valueDiv = labelDiv.nextElementSibling;
        if (valueDiv) {
            const label = normalize(labelDiv.innerText);
            const value = normalize(valueDiv.innerText);
            if (label && value && label.length < 100) pairs[label] = value;
        }
    }

    // Estrategia 4: Fallback regex sobre texto del body
    if (Object.keys(pairs).length < 3) {
        const text = document.body.innerText;
        const regex = /^([A-ZÁÉÍÓÚÑa-záéíóúñ ]+):\\s*(.+)$/gm;
        let match;
        while ((match = regex.exec(text)) !== null) {
            const label = normalize(match[1]);
            const value = normalize(match[2]);
            if (label.length < 80 && value.length < 500) {
                pairs[label] = value;
            }
        }
    }

    return pairs;
}
"""


def parse_ficha(raw_pairs: dict[str, str], slug: str) -> Ficha:
    """Mapea pares label/value crudos a un dataclass Ficha."""
    ficha = Ficha(slug=slug, raw_pairs=dict(raw_pairs))

    for label, value in raw_pairs.items():
        normalized = label.lower().strip().rstrip(":")
        field_name = LABEL_MAP.get(normalized)
        if field_name and hasattr(ficha, field_name):
            setattr(ficha, field_name, value)

    return ficha


async def extract_all_fichas(
    context: BrowserContext,
    base_url: str,
    slugs: list[str],
    delay: float = 1.0,
) -> list[dict]:
    """Extrae la ficha de cada solución CTT. Retorna lista de dicts."""
    content_check = "document.querySelector('body').innerText.length > 200"
    total = len(slugs)
    fichas: list[dict] = []

    page = await context.new_page()
    try:
        for i, slug in enumerate(slugs, 1):
            url = f"{base_url}/ctt/{slug}"
            log.info("[%d/%d] Extrayendo ficha: %s", i, total, slug)

            try:
                await navigate_with_retry(page, url, content_check)
                raw_pairs = await page.evaluate(EXTRACT_PAIRS_JS)
                ficha = parse_ficha(raw_pairs, slug)
                fichas.append(asdict(ficha))
                log.info(
                    "[%d/%d] %s — %d pares extraídos",
                    i, total, slug, len(raw_pairs),
                )
            except Exception as exc:
                log.error("[%d/%d] Error en %s: %s", i, total, slug, exc)
                fichas.append(asdict(Ficha(slug=slug)))

            if i < total:
                await asyncio.sleep(delay)
    finally:
        await page.close()

    log.info("Fichas extraídas: %d/%d", len(fichas), total)
    return fichas
