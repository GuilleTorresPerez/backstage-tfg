"""Escenario 1: Extracción de slugs del catálogo de soluciones CTT."""

import logging
import re

from playwright.async_api import BrowserContext

from utils import navigate_with_retry

SOLUTIONS_PATH = "/ctt/solucionesTodas.htm?verTodas=true"
SLUG_PATTERN = re.compile(r"^/ctt/([a-zA-Z0-9_-]+)$")

EXCLUDED_SLUGS = {
    "solucionesTodas",
    "solucionesArea",
    "solucionesAdministracion",
    "recursos",
    "pae",
}

KNOWN_SLUGS = {"afirma", "clave", "inside", "fire", "geiser", "sir"}

log = logging.getLogger(__name__)


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


async def extract_slugs(context: BrowserContext, base_url: str) -> list[str]:
    """Navega a la página de soluciones y extrae todos los slugs."""
    url = base_url + SOLUTIONS_PATH
    content_check = "document.querySelectorAll('a[href*=\"/ctt/\"]').length > 10"

    page = await context.new_page()
    try:
        await navigate_with_retry(page, url, content_check)
        hrefs: list[str] = await page.eval_on_selector_all(
            'a[href*="/ctt/"]',
            "elements => elements.map(e => e.getAttribute('href'))",
        )
    finally:
        await page.close()

    slugs = parse_slugs(hrefs)

    # Log summary
    log.info("Total de slugs extraídos: %d", len(slugs))
    found = KNOWN_SLUGS & set(slugs)
    missing = KNOWN_SLUGS - set(slugs)
    if found:
        log.info("Slugs conocidos encontrados: %s", ", ".join(sorted(found)))
    if missing:
        log.warning("Slugs conocidos NO encontrados: %s", ", ".join(sorted(missing)))

    return slugs
