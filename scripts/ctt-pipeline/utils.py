"""Utilidades compartidas para el CTT scraper."""

import asyncio
import logging

from playwright.async_api import Page

log = logging.getLogger(__name__)

MAX_RETRIES = 3
RETRY_BASE_DELAY = 5  # segundos


class TSPDError(Exception):
    """El challenge TSPD de F5 no se resolvió tras agotar los reintentos."""


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
