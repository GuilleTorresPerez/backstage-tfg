"""
CTT Scraper — Escenario 1: Extracción de slugs del catálogo de soluciones.

Navega a la página del CTT que lista todas las soluciones tecnológicas,
espera a que el challenge TSPD de F5 se resuelva, y extrae los slugs
de cada solución disponible.

Uso:
    python scraper.py
"""

import asyncio
import json
import logging
import re
from pathlib import Path

from playwright.async_api import Page, async_playwright

# --- Constantes ---
BASE_URL = "https://administracionelectronica.gob.es"
SOLUTIONS_PATH = "/ctt/solucionesTodas.htm?verTodas=true"
SOLUTIONS_URL = BASE_URL + SOLUTIONS_PATH

OUTPUT_DIR = Path(__file__).parent / "output"
SLUGS_FILE = OUTPUT_DIR / "slugs.json"

MAX_RETRIES = 3
RETRY_BASE_DELAY = 5  # segundos

SLUG_PATTERN = re.compile(r"^/ctt/([a-zA-Z0-9_-]+)$")

EXCLUDED_SLUGS = {
    "solucionesTodas",
    "solucionesArea",
    "solucionesAdministracion",
    "recursos",
    "pae",
}

KNOWN_SLUGS = {"afirma", "clave", "inside", "fire", "geiser", "sir"}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)


# --- Excepciones ---


class TSPDError(Exception):
    """El challenge TSPD de F5 no se resolvió tras agotar los reintentos."""


# --- Lógica de extracción (pura, sin I/O de disco) ---


def parse_slugs(hrefs: list[str]) -> list[str]:
    """Filtra y deduplica slugs válidos a partir de una lista de hrefs."""
    slugs: set[str] = set()
    for href in hrefs:
        if not href:
            continue
        match = SLUG_PATTERN.match(href)
        if match:
            slug = match.group(1)
            if slug not in EXCLUDED_SLUGS and not slug.startswith("verPestana"):
                slugs.add(slug)
    return sorted(slugs)


# --- Interacción con el browser ---


async def wait_for_real_content(page: Page, timeout_ms: int = 30_000) -> bool:
    """Espera a que el body tenga contenido real (no solo el script TSPD).

    Retorna True si se detectó contenido, False si expiró el timeout.
    """
    try:
        await page.wait_for_function(
            "document.querySelectorAll('a[href*=\"/ctt/\"]').length > 10",
            timeout=timeout_ms,
        )
        return True
    except TimeoutError:
        return False


async def fetch_hrefs(page: Page) -> list[str]:
    """Extrae todos los href que contienen '/ctt/' de la página actual."""
    return await page.eval_on_selector_all(
        'a[href*="/ctt/"]',
        "elements => elements.map(e => e.getAttribute('href'))",
    )


async def navigate_with_retry(page: Page) -> None:
    """Navega a la página de soluciones con reintentos ante TSPD o errores de red."""
    for attempt in range(1, MAX_RETRIES + 1):
        log.info("Intento %d/%d — navegando a %s", attempt, MAX_RETRIES, SOLUTIONS_URL)

        try:
            await page.goto(SOLUTIONS_URL, wait_until="networkidle", timeout=60_000)
        except Exception as exc:
            log.warning("Error en navegación: %s", exc)
            if attempt < MAX_RETRIES:
                await _backoff(attempt)
                continue
            raise

        if await wait_for_real_content(page):
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
        "Prueba con headless=False o playwright-stealth."
    )


async def _backoff(attempt: int) -> None:
    delay = RETRY_BASE_DELAY * attempt
    log.info("Reintentando en %ds…", delay)
    await asyncio.sleep(delay)


# --- Orquestación ---


async def scrape_slugs() -> list[str]:
    """Lanza el browser, navega y extrae los slugs. Retorna la lista o lanza excepción."""
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        try:
            context = await browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                ),
            )
            page = await context.new_page()
            await navigate_with_retry(page)
            hrefs = await fetch_hrefs(page)
        finally:
            await browser.close()

    return parse_slugs(hrefs)


# --- Persistencia y presentación ---


def save_slugs(slugs: list[str], path: Path = SLUGS_FILE) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(slugs, indent=2, ensure_ascii=False))
    log.info("Archivo guardado en: %s", path)


def log_summary(slugs: list[str]) -> None:
    log.info("Total de slugs extraídos: %d", len(slugs))

    found = KNOWN_SLUGS & set(slugs)
    missing = KNOWN_SLUGS - set(slugs)
    if found:
        log.info("Slugs conocidos encontrados: %s", ", ".join(sorted(found)))
    if missing:
        log.warning("Slugs conocidos NO encontrados: %s", ", ".join(sorted(missing)))


# --- Entry point ---


async def main() -> None:
    slugs = await scrape_slugs()
    save_slugs(slugs)
    log_summary(slugs)
    print("\n".join(slugs))


if __name__ == "__main__":
    asyncio.run(main())
