"""Escenario 4: Descarga de documentos de cada solución CTT."""

import asyncio
import logging
from pathlib import Path
from urllib.parse import quote, urlparse, urlunparse

from playwright.async_api import BrowserContext

log = logging.getLogger(__name__)

# Tamaño mínimo (bytes) para considerar un fichero válido.
# Las respuestas de error del F5 WAF suelen ser ~245 bytes.
_MIN_FILE_SIZE = 1024


def _encode_url(url: str) -> str:
    """Codifica espacios y caracteres especiales en el path de la URL."""
    parsed = urlparse(url)
    encoded_path = quote(parsed.path, safe="/:@!$&'()*+,;=-._~")
    return urlunparse(parsed._replace(path=encoded_path))


async def download_all_documents(
    context: BrowserContext,
    descargas: list[dict],
    output_dir: Path,
    delay: float = 0.5,
    extensions: set[str] | None = None,
) -> dict[str, int]:
    """Descarga los ficheros de cada solución CTT.

    Usa page.goto() para navegar a cada URL de descarga, lo que permite
    resolver el challenge TSPD de F5 mediante el motor JS del navegador.
    Para ficheros que el browser trata como descarga (DOCX, ZIP, XLSX…)
    se captura el evento ``download``; para los que renderiza inline (PDF)
    se obtiene el body de la respuesta HTTP.

    Retorna dict con contadores: {"downloaded": N, "skipped": M, "failed": K}
    """
    if extensions:
        descargas = [
            d for d in descargas
            if d.get("extension", "").lower() in extensions
        ]
        log.info("Filtrado por extensiones %s: %d descargas", extensions, len(descargas))

    total = len(descargas)
    counters = {"downloaded": 0, "skipped": 0, "failed": 0}

    if total == 0:
        log.warning("No hay descargas que procesar.")
        return counters

    page = await context.new_page()
    try:
        for i, descarga in enumerate(descargas, 1):
            slug = descarga["slug"]
            filename = descarga["filename"]
            url = descarga["url"]
            encoded_url = _encode_url(url)

            slug_dir = output_dir / slug
            slug_dir.mkdir(parents=True, exist_ok=True)
            file_path = slug_dir / filename

            # Skip si ya existe y tiene un tamaño razonable
            if file_path.exists() and file_path.stat().st_size > _MIN_FILE_SIZE:
                log.info("[%d/%d] Skip (ya existe): %s/%s", i, total, slug, filename)
                counters["skipped"] += 1
                continue

            log.info("[%d/%d] Descargando: %s/%s", i, total, slug, filename)

            try:
                saved = await _download_file(page, encoded_url, file_path)
                if saved:
                    size = file_path.stat().st_size
                    counters["downloaded"] += 1
                    log.info("[%d/%d] OK — %s (%d bytes)", i, total, filename, size)
                else:
                    counters["failed"] += 1
            except Exception as exc:
                counters["failed"] += 1
                log.error("[%d/%d] Error descargando %s: %s", i, total, filename, exc)

            if i < total:
                await asyncio.sleep(delay)
    finally:
        await page.close()

    return counters


async def _download_file(page, url: str, file_path: Path) -> bool:
    """Descarga un fichero individual via navegación del browser.

    ``page.goto()`` lanza ``"Download is starting"`` cuando el servidor
    responde con content-disposition: attachment.  Capturamos esa excepción
    dentro de ``expect_download`` para que el evento download se procese.
    """
    async with page.expect_download(timeout=60_000) as dl_info:
        try:
            await page.goto(url, timeout=60_000)
        except Exception as exc:
            if "Download is starting" not in str(exc):
                raise

    download = await dl_info.value
    await download.save_as(str(file_path))
    return file_path.stat().st_size > _MIN_FILE_SIZE
