# ADR-0006: Cambios En Cascada Del Renombrado De Equipos

## Estado

Aceptada

## Contexto

ADR-0005 redefine la jerarquia organizativa con 4 niveles y renombra `developers` a `equipo-frontend`, anade `equipo-spring` con 2 usuarios nuevos, y mantiene `platform-admins` y `security-reviewers`. Esto requiere cambios en cascada en varios ficheros del repositorio.

## Decisiones

### Usuarios nuevos de equipo-spring

Anadir 2 usuarios a Keycloak:

| Username | Nombre | Email | Grupo |
|---|---|---|---|
| `lruiz` | Laura Ruiz | `lruiz@aragon.es` | `/equipo-spring` |
| `jgomez` | Javier Gomez | `jgomez@aragon.es` | `/equipo-spring` |

Credenciales `changeme`, consistentes con los usuarios existentes.

### mgarcia en multiples equipos

Mantener a `mgarcia` en `/equipo-frontend` y `/security-reviewers`. Demuestra que una persona puede pertenecer a equipos operativos en unidades funcionales distintas.

### Ownership de entidades a nivel team

El `spec.owner` de entidades del catalogo (`System`, `Component`, `API`, `Resource`) apunta al `team` concreto, no a `business-unit` o `product-area`. La jerarquia permite inferir la cadena de gobierno sin necesidad de apuntar mas arriba.

### CODEOWNERS por plantilla

- `frontend-angular-desy`: `* @equipo-frontend`
- `backend-spring-boot`: `* @equipo-spring`

### Valores por defecto de plantillas

- `backend-spring-boot/template.yaml`: `owner: group:default/equipo-spring`
- `frontend-angular-desy/template.yaml`: `owner: group:default/equipo-frontend`
- `desy-project/template.yaml`: `owner: user:guest` (sin cambio, plantilla de ejemplo)

## Consecuencias

- `keycloak/realm-export/aragon-idp-realm.json`: renombrar `developers` -> `equipo-frontend`, anadir `equipo-spring`, anadir `lruiz` y `jgomez`, actualizar `mgarcia`.
- `packages/backend/src/permission-policy.ts`: actualizar mapeo de grupos.
- `examples/templates/*/content/CODEOWNERS`: actualizar referencias.
- `examples/templates/*/template.yaml`: actualizar valores por defecto.
- `catalog/seed/system-*.yaml`: revisar referencias a `developers` -> `equipo-frontend`.
- `docs/keycloack/catalog-sync-flow-visual.md`: actualizar documentacion.