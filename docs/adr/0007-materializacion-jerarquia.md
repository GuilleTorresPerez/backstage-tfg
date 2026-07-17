# ADR-0007: Materializacion De La Jerarquia AST En El Catalogo

## Estado

Aceptada

## Contexto

ADR-0005 define la jerarquia de 4 niveles. Queda por decidir como se materializan los grupos estaticos en el catalogo y como se registran.

## Decisiones

### Fichero unico

Materializar la jerarquia estatica en un solo fichero `catalog/seed/org-ast.yaml` con los 8 grupos estaticos (`ast`, 3 `business-unit`, 4 `product-area`). Los `team` no van en este fichero: siguen viniendo de Keycloak.

### Registro como location

Registrar `catalog/seed/org-ast.yaml` como `catalog.location` de `type: file` en `app-config.yaml`, coherente con los seeds existentes.

### Mapeo de permission-policy

`equipo-frontend` y `equipo-spring` mapean ambos al rol `developer` en `permission-policy.ts`. Ambos son equipos de desarrollo bajo la misma `business-unit`.

## Consecuencias

- La jerarquia AST es visible en el catalogo con un solo fichero de facil revision.
- Los grupos estaticos no interfieren con la sincronizacion de Keycloak (ADR-0001, ADR-0003).
- La permission-policy actualiza el mapeo de grupos operativos.