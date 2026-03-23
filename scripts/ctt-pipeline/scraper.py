"""
CTT Scraper — Extracción de datos del catálogo de soluciones del CTT.

Escenarios:
    1. Extracción de slugs (catálogo completo)
    2. Extracción de fichas/metadata por solución
    3. Extracción de lista de descargas por solución

Uso:
    python scraper.py                           # Solo escenario 1
    python scraper.py --scenarios 2 3           # Escenarios 2 y 3
    python scraper.py --scenarios 2 --limit 5   # 5 primeras fichas
    python scraper.py --scenarios 2 --slugs afirma clave  # solo esos slugs
    python scraper.py --no-headless             # browser visible
"""

import argparse
import asyncio
import json
import logging
from pathlib import Path

from playwright.async_api import Page, async_playwright

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

MAX_RETRIES = 3
RETRY_BASE_DELAY = 5  # segundos

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)


# --- Excepciones ---


class TSPDError(Exception):
    """El challenge TSPD de F5 no se resolvió tras agotar los reintentos."""


# --- Utilidades compartidas ---


async def wait_for_real_content(
    page: Page, content_check: str, timeout_ms: int = 30_000,
) -> bool:
    """Espera a que la página cumpla el content_check JS.

    Retorna True si se detectó contenido, False si expiró el timeout.
    """
    try:
        await page.wait_for_function(content_check, timeout=timeout_ms)
        return True
    except TimeoutError:
        return False


async def navigate_with_retry(
    page: Page, url: str, content_check: str,
) -> None:
    """Navega a una URL con reintentos ante TSPD o errores de red."""
    for attempt in range(1, MAX_RETRIES + 1):
        log.info("Intento %d/%d — navegando a %s", attempt, MAX_RETRIES, url)

        try:
            await page.goto(url, wait_until="networkidle", timeout=60_000)
        except Exception as exc:
            log.warning("Error en navegación: %s", exc)
            if attempt < MAX_RETRIES:
                await _backoff(attempt)
                continue
            raise

        if await wait_for_real_content(page, content_check):
            log.info("Página cargada correctamente.")
            return

        body_text = await page.inner_text("body")
        preview = body_text[:500] if body_text else "(vacío)"
        log.warning("El contenido real no cargó. Preview del body:\n%s", preview)

        if attempt < MAX_RETRIES:
            await _backoff(attempt)
            continue

    raise TSPDError(
        f"No se pudo resolver el challenge TSPD tras {MAX_RETRIES} intentos. "
        "Prueba con --no-headless o playwright-stealth."
    )


async def _backoff(attempt: int) -> None:
    delay = RETRY_BASE_DELAY * attempt
    log.info("Reintentando en %ds…", delay)
    await asyncio.sleep(delay)


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
        choices=[1, 2, 3],
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

    # Importar extractors (import diferido para evitar ciclos)
    from extractors import extract_slugs, extract_all_fichas, extract_all_descargas

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=args.headless)
        context = await browser.new_context(user_agent=USER_AGENT)
        try:
            # Escenario 1 — obtener slugs
            if 1 in scenarios or 2 in scenarios or 3 in scenarios:
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
            if 3 in scenarios:
                log.info("=== Escenario 3: Extracción de descargas ===")
                descargas = await extract_all_descargas(
                    context, BASE_URL, slugs, args.delay,
                )
                save_json(descargas, DESCARGAS_FILE)

        finally:
            await browser.close()

    log.info("Scraper finalizado.")


if __name__ == "__main__":
    asyncio.run(main())
