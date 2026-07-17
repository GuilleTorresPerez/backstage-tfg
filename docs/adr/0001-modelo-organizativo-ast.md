# ADR-0001: Modelo Organizativo AST En El Catalogo

## Estado

Aceptada

## Contexto

El prototipo Backstage incluye usuarios y grupos operativos sincronizados desde Keycloak, pero no representa una organizacion publica responsable como raiz del modelo de gobierno. Esto debilita la explicacion de ownership, trazabilidad y responsabilidad institucional en el catalogo.

## Decision

Modelar AST como organizacion publica ficticia responsable del portal y raiz conceptual del modelo organizativo en Backstage Catalog.

Keycloak seguira representando el directorio corporativo y la fuente maestra de usuarios y grupos operativos. Backstage no sustituye al directorio corporativo: actua como una proyeccion de gobierno para catalogo, ownership, permisos, auditoria y trazabilidad.

## Consecuencias

- El catalogo podra mostrar una organizacion responsable del demostrador, no solo roles operativos planos.
- Las identidades corporativas seguiran dependiendo de Keycloak o del sistema equivalente en un despliegue real.
- Las futuras decisiones de implementacion deberan evitar duplicar usuarios o grupos operativos ya sincronizados desde el directorio corporativo.
