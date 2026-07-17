# ADR-0005: Jerarquia AST De 4 Niveles Con Vocabulario De Gobierno

## Estado

Aceptada

## Contexto

El tutor pide explicitamente una jerarquia organizativa con tipos de unidad diferenciados (team, product-area, business-unit, root) que permita explicar gobierno: permisos, golden paths, flujos de revision y trazabilidad. ADR-0003 definia solo 2 niveles (unidad funcional -> equipo operativo), insuficiente para demonstrar el modelo de gobernanza que el tutor describe.

Para que la jerarquia de 4 niveles tenga masa real y no sea cascaras vacias con un solo hijo cada una, se anaden usuarios y equipos de demostracion a Keycloak.

## Decision

Adoptar una jerarquia de 4 niveles con el vocabulario del tutor:

```text
ast: organization
├── desarrollo: business-unit
│   ├── desarrollo-web: product-area
│   │   └── equipo-frontend: team        — jperez, mgarcia (Keycloak)
│   └── desarrollo-backend: product-area
│       └── equipo-spring: team          — 2 usuarios nuevos (Keycloak)
├── plataforma: business-unit
│   └── sre: product-area
│       └── platform-admins: team        — agarcia (Keycloak)
└── seguridad: business-unit
    └── gobierno-datos: product-area
        └── security-reviewers: team     — msanchez, mgarcia (Keycloak)
```

Vocabulario de `spec.type`:

| Nivel | `spec.type` | Ejemplo |
|---|---|---|
| 1 | `organization` | `ast` |
| 2 | `business-unit` | `desarrollo`, `plataforma`, `seguridad` |
| 3 | `product-area` | `desarrollo-web`, `desarrollo-backend`, `sre`, `gobierno-datos` |
| 4 | `team` | `equipo-frontend`, `equipo-spring`, `platform-admins`, `security-reviewers` |

Implementacion:

- Nodos estaticos YAML (`ast`, `business-unit`, `product-area`): declaran `spec.children`, sin usuarios directos (ADR-0004).
- Nodos `team`: siguen viniendo de Keycloak, no se redefinen en YAML (ADR-0001, ADR-0003).
- Los grupos `developers` se renombra a `equipo-frontend` en Keycloak.
- Se anade `equipo-spring` con 2 usuarios nuevos en Keycloak.

## Consecuencias

- Reemplaza ADR-0003 (jerarquia de 2 niveles) por una jerarquia de 4 niveles alineada con el vocabulario del tutor.
- Impacto en cascada:
  - `keycloak/realm-export/aragon-idp-realm.json`: renombrar `developers` -> `equipo-frontend`, anadir `equipo-spring`, anadir 2 usuarios.
  - `packages/backend/src/permission-policy.ts`: actualizar mapeo `group:default/developers` -> `group:default/equipo-frontend`, anadir `equipo-spring`.
  - `CODEOWNERS` y `catalog-info.yaml` en plantillas: actualizar referencias.
  - `docs/keycloack/catalog-sync-flow-visual.md`: actualizar documentacion.
- El modelo es capaz de soportar mas equipos por product-area si el demostrador crece.
- La memoria puede explicar que el modelo soporta jerarquias profundas y se ha simplificado a 4 niveles para el demostrador.