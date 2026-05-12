# Plataforma Interna de Desarrollo (IDP) — Gobierno de Aragón

Bienvenido a la documentación de la **Plataforma Interna de Desarrollo (IDP)** del Gobierno de Aragón.

Esta plataforma tiene como objetivo estandarizar, acelerar y hacer más seguro el desarrollo de software en el ámbito de la Administración Pública aragonesa, integrando el Sistema de Diseño DESY y alineándose con los requisitos del Esquema Nacional de Seguridad (ENS).

## Mapa de funcionalidades

- **Catálogo de Software**: descubre y reutiliza componentes, APIs y sistemas existentes.
- **Scaffolder**: genera nuevos proyectos a partir de *Golden Paths* validados.
- **Arquitectura**: consulta los diagramas C4 del sistema en [Structurizr](http://localhost:8080).

## Cómo publicar esta documentación

Desde la raíz del repositorio, con MinIO en ejecución:

```bash
export AWS_ACCESS_KEY_ID=minioadmin
export AWS_SECRET_ACCESS_KEY=minioadmin
yarn techdocs:publish-idp
```

> **Nota de prototipo**: las ediciones posteriores a `docs/` no se reflejan automáticamente en MinIO. Es trabajo futuro automatizarlo mediante CI o un runner local.
