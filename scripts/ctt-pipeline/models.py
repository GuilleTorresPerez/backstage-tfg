"""Dataclasses compartidas para el CTT scraper."""

from dataclasses import dataclass, field


@dataclass
class Ficha:
    """Metadata de una solución CTT extraída de su ficha general."""

    slug: str
    nombre_completo: str = ""
    nombre_abreviado: str = ""
    resumen: str = ""
    estado: str = ""
    modo_de_uso: str = ""
    organismo_responsable: str = ""
    tipo_de_solucion: str = ""
    area_tecnica: str = ""
    area_funcional: str = ""
    area_organica: str = ""
    destinatarios: str = ""
    licencia: str = ""
    contacto_caid: str = ""
    raw_pairs: dict[str, str] = field(default_factory=dict)


@dataclass
class Descarga:
    """Un fichero disponible para descarga en la pestaña de descargas."""

    slug: str
    filename: str
    url: str
    extension: str
