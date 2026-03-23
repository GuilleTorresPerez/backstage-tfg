"""Escenario 3: Extracción de descargas de cada solución CTT."""

import asyncio
import logging
import re
from dataclasses import asdict
from pathlib import PurePosixPath

from playwright.async_api import BrowserContext

from models import Descarga
from utils import navigate_with_retry

log = logging.getLogger(__name__)

# JavaScript para extraer enlaces de descarga.
EXTRACT_LINKS_JS = """
() => {
    const links = [];
    const anchors = document.querySelectorAll('a[href]');
    for (const a of anchors) {
        const href = a.getAttribute('href');
        if (href && (href.includes('/Descargas/') || href.includes('/descargas/')
                     || href.includes('download') || href.endsWith('.pdf')
                     || href.endsWith('.zip') || href.endsWith('.doc')
                     || href.endsWith('.docx') || href.endsWith('.odt'))) {
            links.push({
                href: href,
                text: a.innerText.trim()
            });
        }
    }
    return links;
}
"""


def parse_descargas(
    raw_links: list[dict], slug: str, base_url: str,
) -> list[dict]:
    """Extrae filename y extensión de cada enlace de descarga."""
    descargas: list[dict] = []
    seen_urls: set[str] = set()

    for link in raw_links:
        href = link.get("href", "")
        if not href:
            continue

        # Construir URL absoluta si es relativa
        if href.startswith("/"):
            url = base_url + href
        elif href.startswith("http"):
            url = href
        else:
            url = base_url + "/" + href

        if url in seen_urls:
            continue
        seen_urls.add(url)

        # Extraer filename de la URL
        path = PurePosixPath(re.sub(r"\?.*$", "", href))
        filename = path.name or link.get("text", "unknown")
        extension = path.suffix.lstrip(".").lower() if path.suffix else ""

        descargas.append(asdict(Descarga(
            slug=slug,
            filename=filename,
            url=url,
            extension=extension,
        )))

    return descargas


async def extract_all_descargas(
    context: BrowserContext,
    base_url: str,
    slugs: list[str],
    delay: float = 1.0,
) -> list[dict]:
    """Extrae las descargas de cada solución CTT. Retorna lista de dicts."""
    content_check = "document.querySelector('body').innerText.length > 100"
    total = len(slugs)
    all_descargas: list[dict] = []

    page = await context.new_page()
    try:
        for i, slug in enumerate(slugs, 1):
            url = (
                f"{base_url}/ctt/verPestanaDescargas.htm"
                f"?idIniciativa={slug}&idioma=es"
            )
            log.info("[%d/%d] Extrayendo descargas: %s", i, total, slug)

            try:
                await navigate_with_retry(page, url, content_check)
                raw_links = await page.evaluate(EXTRACT_LINKS_JS)
                descargas = parse_descargas(raw_links, slug, base_url)
                all_descargas.extend(descargas)
                log.info(
                    "[%d/%d] %s — %d descargas encontradas",
                    i, total, slug, len(descargas),
                )
            except Exception as exc:
                log.error("[%d/%d] Error en %s: %s", i, total, slug, exc)

            if i < total:
                await asyncio.sleep(delay)
    finally:
        await page.close()

    log.info("Total descargas extraídas: %d (de %d slugs)", len(all_descargas), total)
    return all_descargas
