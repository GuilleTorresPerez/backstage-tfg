"""
CTT Scraper — Extracción de datos del catálogo de soluciones del CTT.

Escenarios:
    1. Extracción de slugs (catálogo completo)
    2. Extracción de fichas/metadata por solución
    3. Extracción de lista de descargas por solución
    4. Descarga de documentos (ficheros reales)

Uso:
    python scraper.py                           # Solo escenario 1
    python scraper.py --scenarios 2 3           # Escenarios 2 y 3
    python scraper.py --scenarios 2 --limit 5   # 5 primeras fichas
    python scraper.py --scenarios 2 --slugs afirma clave  # solo esos slugs
    python scraper.py --scenarios 3 4 --slugs acceda      # extraer + descargar
    python scraper.py --scenarios 4 --extensions pdf docx  # solo ciertos tipos
    python scraper.py --no-headless             # browser visible
"""

import argparse
import asyncio
import json
import logging
from pathlib import Path

from playwright.async_api import async_playwright

from extractors import (
    extract_slugs, extract_all_fichas,
    extract_all_descargas, download_all_documents,
)

# --- Constantes ---
BASE_URL = "https://administracionelectronica.gob.es"

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)

OUTPUT_DIR = Path(__file__).parent / "output"
SLUGS_FILE = OUTPUT_DIR / "slugs.json"
FICHAS_FILE = OUTPUT_DIR / "fichas.json"
DESCARGAS_FILE = OUTPUT_DIR / "descargas.json"
DESCARGAS_DIR = OUTPUT_DIR / "descargas"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)


def save_json(data, path: Path) -> None:
    """Guarda datos como JSON con indentación."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    log.info("Archivo guardado en: %s (%d elementos)", path, len(data))


def load_slugs_from_disk() -> list[str] | None:
    """Carga slugs desde disco si existen."""
    if SLUGS_FILE.exists():
        slugs = json.loads(SLUGS_FILE.read_text())
        log.info("Slugs cargados desde disco: %d", len(slugs))
        return slugs
    return None


def apply_filters(
    slugs: list[str], limit: int | None, selected_slugs: list[str] | None,
) -> list[str]:
    """Filtra slugs según --limit y --slugs."""
    if selected_slugs:
        slugs = [s for s in slugs if s in set(selected_slugs)]
        log.info("Filtrado por --slugs: %d slugs seleccionados", len(slugs))
    if limit:
        slugs = slugs[:limit]
        log.info("Filtrado por --limit: %d slugs", len(slugs))
    return slugs


# --- CLI ---


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="CTT Scraper — Extracción de datos del catálogo de soluciones.",
    )
    parser.add_argument(
        "--scenarios",
        nargs="+",
        type=int,
        default=[1],
        choices=[1, 2, 3, 4],
        help="Escenarios a ejecutar (default: 1)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limitar el número de slugs a procesar",
    )
    parser.add_argument(
        "--slugs",
        nargs="+",
        default=None,
        help="Procesar solo estos slugs específicos",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=1.0,
        help="Delay en segundos entre peticiones (default: 1.0)",
    )
    parser.add_argument(
        "--extensions",
        nargs="+",
        default=None,
        help="Filtrar descargas por extensión (ej: pdf docx zip)",
    )
    parser.add_argument(
        "--headless",
        action="store_true",
        default=True,
        dest="headless",
        help="Ejecutar en modo headless (default)",
    )
    parser.add_argument(
        "--no-headless",
        action="store_false",
        dest="headless",
        help="Ejecutar con browser visible",
    )
    return parser.parse_args()


# --- Orquestación ---


async def main() -> None:
    args = parse_args()
    scenarios = set(args.scenarios)

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=args.headless)
        context = await browser.new_context(user_agent=USER_AGENT)
        try:
            # Escenario 1 — obtener slugs
            if scenarios & {1, 2, 3, 4}:
                # Intentar cargar de disco si no se necesita re-extraer
                slugs = None
                if 1 not in scenarios:
                    slugs = load_slugs_from_disk()

                if slugs is None:
                    slugs = await extract_slugs(context, BASE_URL)
                    save_json(slugs, SLUGS_FILE)

            # Aplicar filtros
            slugs = apply_filters(slugs, args.limit, args.slugs)

            if not slugs:
                log.error("No hay slugs para procesar.")
                return

            # Escenario 2 — fichas
            if 2 in scenarios:
                log.info("=== Escenario 2: Extracción de fichas ===")
                fichas = await extract_all_fichas(
                    context, BASE_URL, slugs, args.delay,
                )
                save_json(fichas, FICHAS_FILE)

            # Escenario 3 — descargas
            descargas = None
            if 3 in scenarios:
                log.info("=== Escenario 3: Extracción de descargas ===")
                descargas = await extract_all_descargas(
                    context, BASE_URL, slugs, args.delay,
                )
                save_json(descargas, DESCARGAS_FILE)

            # Escenario 4 — descarga de documentos
            if 4 in scenarios:
                log.info("=== Escenario 4: Descarga de documentos ===")

                # Cargar descargas desde memoria o disco
                if descargas is None:
                    if DESCARGAS_FILE.exists():
                        descargas = json.loads(DESCARGAS_FILE.read_text())
                        log.info(
                            "Descargas cargadas desde disco: %d",
                            len(descargas),
                        )
                    else:
                        log.error(
                            "No hay descargas disponibles. "
                            "Ejecuta el escenario 3 primero.",
                        )
                        return

                # Filtrar por slugs seleccionados
                if args.slugs:
                    slug_set = set(args.slugs)
                    descargas = [
                        d for d in descargas if d["slug"] in slug_set
                    ]

                ext_filter = (
                    {e.lower().lstrip(".") for e in args.extensions}
                    if args.extensions else None
                )
                counters = await download_all_documents(
                    context, descargas, DESCARGAS_DIR,
                    delay=args.delay, extensions=ext_filter,
                )
                log.info(
                    "Resumen descargas — descargados: %d, "
                    "saltados: %d, fallidos: %d",
                    counters["downloaded"],
                    counters["skipped"],
                    counters["failed"],
                )

        finally:
            await browser.close()

    log.info("Scraper finalizado.")


if __name__ == "__main__":
    asyncio.run(main())
