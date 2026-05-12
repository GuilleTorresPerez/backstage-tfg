# Plantillas del Scaffolder (Golden Paths)

El Scaffolder ofrece *Golden Paths* validados para crear nuevos componentes con la configuración, el layout y los controles de seguridad predefinidos del Gobierno de Aragón.

## Plantillas disponibles

### `backend-spring-boot` — Microservicio Spring Boot

Crea un microservicio Java con configuración de seguridad ENS, OpenAPI y pipeline CI/CD con SBOM.

**Parámetros principales**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `name` | string | Nombre del servicio (kebab-case, 3-50 caracteres). |
| `description` | string | Breve descripción. |
| `owner` | string | Grupo responsable (selector de tus grupos). |
| `system` | string | Sistema al que pertenece (selector de tipo `System`). |
| `nivel_ens` | string | Nivel ENS: `basico`, `medio`, `alto`. |
| `javaVersion` | string | Versión de Java (fijada a `21` LTS). |
| `repoUrl` | string | Repositorio destino en `gitlab.com/aragon-idp/projects`. |

**Salida esperada**

1. Repositorio creado en GitLab con el esqueleto Spring Boot.
2. Paquete renombrado a `es.aragon`.
3. `catalog-info.yaml` registrado en el catálogo de Backstage.
4. Documentación inicial (`mkdocs.yml` + `docs/index.md`) commiteada en el repo.

**Controles ENS cubiertos**

- **MP.SI**: clasificación por nivel ENS (básico/medio/alto).
- **OP.ACC**: autenticación integrada con Keycloak (OIDC).
- **MP.SW / MP.COM**: pipeline CI/CD con generación de SBOM.

---

### `frontend-angular-desy` — Frontend Angular DESY

Genera un frontend Angular alineado con el Sistema de Diseño DESY. El layout (cabecera, posición, sidebar, subcabecera, selector de aplicaciones) se configura desde el formulario.

**Parámetros principales**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `name` | string | Nombre del componente (kebab-case, 3-50 caracteres). |
| `description` | string | Breve descripción. |
| `owner` | string | Grupo responsable. |
| `system` | string | Sistema al que pertenece. |
| `nivel_ens` | string | Nivel ENS. En `medio` añade SAST y Trivy; en `alto` añade runbook BCP. |
| `apiBaseUrl` | string | URL base del backend (debe pertenecer a `*.aragon.es`). |
| `headerType` | string | `minimal`, `standard`, `advanced`, `edit`. |
| `headerPosition` | string | `relative`, `fixed`, `headroom` (para `edit` solo `fixed`). |
| `hasAppSelector` | boolean | Incluir selector de aplicaciones en la cabecera. |
| `hasSubheader` | boolean | Incluir subcabecera con pestañas. |
| `hasSidebar` | boolean | Incluir navegación lateral. |
| `repoUrl` | string | Repositorio destino en `gitlab.com/aragon-idp/projects`. |

**Salida esperada**

1. Repositorio creado en GitLab con el starter de `desy-angular`.
2. Layout aplicado según los parámetros seleccionados.
3. `catalog-info.yaml` registrado en el catálogo.
4. Documentación inicial commiteada.

**Controles ENS cubiertos**

- **MP.SI**: clasificación por nivel ENS.
- **OP.ACC**: autenticación OIDC/Keycloak.
- **MP.SW**: SAST y análisis de vulnerabilidades (Trivy) para nivel medio/alto.
- **MP.DM**: runbook de continuidad de negocio (BCP) para nivel alto.

---

### `desy-project` — Proyecto DESY (fuera de alcance de TechDocs)

Esta plantilla crea proyectos basados en el Sistema de Diseño DESY con múltiples tecnologías (HTML, Angular, Ionic, React). En este bloque **no se incluye TechDocs automática**; si se decide añadirla en el futuro, se replicará el mismo patrón de publicación inicial.

## Límites del prototipo

- **Publicación inicial automática**: al crear un componente con `backend-spring-boot` o `frontend-angular-desy`, la documentación se genera y publica en TechDocs/MinIO durante el propio scaffolding.
- **Sin sincronización post-creación**: las ediciones que hagas a `docs/` en el repositorio de GitLab **no** se reflejan automáticamente en MinIO. Para actualizar los docs deberás volver a publicar manualmente (o configurar un GitLab Runner local en trabajo futuro).
- **CI/CD como trabajo futuro**: el patrón recomendado es registrar un GitLab Runner local contra el grupo `aragon-idp` y añadir un `.gitlab-ci.yml` por repositorio que ejecute `techdocs-cli generate && publish` en cada push a `main`.
