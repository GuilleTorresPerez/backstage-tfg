"""Extractors para cada escenario del CTT scraper."""

from .slugs import extract_slugs
from .fichas import extract_all_fichas
from .descargas import extract_all_descargas
from .documentos import download_all_documents

__all__ = [
    "extract_slugs",
    "extract_all_fichas",
    "extract_all_descargas",
    "download_all_documents",
]
