"""Extractors para cada escenario del CTT scraper."""

from .slugs import extract_slugs
from .fichas import extract_all_fichas
from .descargas import extract_all_descargas

__all__ = ["extract_slugs", "extract_all_fichas", "extract_all_descargas"]
