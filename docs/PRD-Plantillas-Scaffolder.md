# PRD: Alineación de plantillas Scaffolder con requisitos RS-FORM, RS-OUT, RS-STEP y RS-SEED

## Problem Statement

El prototipo de IDP de Backstage para el Gobierno de Aragón tiene dos plantillas de Scaffolder (backend Spring Boot y frontend Angular DESY) que no cumplen completamente los requisitos funcionales del TFG. En concreto:

- El **backend Spring Boot** solo genera `catalog-info.yaml` como overlay; carece de `CODEOWNERS`, `.gitlab-ci.yml`, `mkdocs.yml` y documentación de runbooks, lo que incumple **RS-OUT-02..06**.
- Ambas plantillas publican en GitLab sin proteger la rama `main` ni configurar políticas de merge, lo que incumple **RS-STEP-04/05**.
- El backend no expone `groupId` como campo editable del formulario (**RS-FORM-08**).
- La estructura de parámetros del backend no está dividida en pasos lógicos claros (**RS-FORM-07**).
- Aunque el frontend ya tiene la mayor parte del overlay, su paso `publish:gitlab` también necesita la protección de rama.

## Solution

Alinear ambas plantillas con los requisitos RS-FORM, RS-OUT, RS-STEP y RS-SEED documentados en el TFG:

1. **Completar el overlay del backend** (`content/`) con `CODEOWNERS`, `.gitlab-ci.yml` (Maven, con jobs condicionales por `nivel_ens`), `mkdocs.yml` y el directorio `docs/` (index, runbook, responsabilidades, runbook-bcp condicional).
2. **Añadir `groupId`** como campo editable en el formulario del backend, con regex de package Java y valor por defecto `es.aragon`.
3. **Reestructurar los parámetros** del backend en pasos lógicos (información del servicio, cumplimiento ENS, repositorio destino).
4. **Proteger `main` en ambas plantillas** añadiendo `branches: [{ name: main, protect: true }]` y `settings.only_allow_merge_if_pipeline_succeeds: true` al paso `publish:gitlab`.
5. **Mantener el resto del pipeline** tal cual (orden de fetch, notificaciones broadcast, comportamiento de error por defecto), validando que **RS-STEP-08** ya se cumple sin cambios.
6. **Verificar el seed estático** en `app-config.yaml`: ambas plantillas ya están registradas, por lo que **RS-SEED-01..03** quedan satisfechos tras los cambios de contenido.

## User Stories

1. Como desarrollador de backend, quiero seleccionar el `groupId` Maven desde el formulario, para que el paquete Java generado se ajuste a la nomenclatura de mi departamento.
2. Como arquitecto de seguridad, quiero que el repositorio generado incluya un `CODEOWNERS` que asigne rutas sensibles a `@security-reviewers`, para garantizar que cambios críticos requieren aprobación explícita.
3. Como responsable de calidad, quiero que el `.gitlab-ci.yml` generado incluya jobs de build, test, SBOM y publicación, para que el pipeline esté operativo desde el primer commit.
4. Como responsable de seguridad, quiero que si el `nivel_ens` es medio o alto, el pipeline incluya jobs de SAST y escaneo de vulnerabilidades (Trivy), para cumplir con el Esquema Nacional de Seguridad.
5. Como responsable de continuidad, quiero que si el `nivel_ens` es alto, el repositorio incluya un runbook de continuidad de negocio (BCP), para disponer de un plan de recuperación documentado.
6. Como platform-admin, quiero que la rama `main` del repositorio creado esté protegida contra push directo tras el bootstrap, para evitar modificaciones no auditadas.
7. Como platform-admin, quiero que el MR de bootstrapping se mergee automáticamente sin fricción, porque el contenido proviene de un esqueleto ya revisado.
8. Como desarrollador, quiero que el repositorio incluya un `mkdocs.yml` y documentación inicial (index, runbook, responsabilidades), para que TechDocs del IDP renderice la documentación desde el primer momento.
9. Como solicitante, quiero recibir una notificación in-app cuando mi plantilla termine, para saber que el componente está disponible en el catálogo.
10. Como auditor ENS, quiero que `catalog-info.yaml` incluya la anotación `aragon.es/nivel-ens`, para poder filtrar y auditar componentes por categoría de seguridad.
11. Como auditor ENS, quiero que `catalog-info.yaml` incluya la anotación `aragon.es/skeleton-version`, para trazar qué versión del esqueleto se usó en la generación.
12. Como desarrollador frontend, quiero que mi plantilla también proteja `main` y obligue a pipelines verdes para mergear, para mantener la misma postura de seguridad que el backend.
13. Como platform-admin, quiero que el formulario común de ambas plantillas use `MyGroupsPicker` para el propietario y `EntityPicker` filtrado a `System`, para evitar errores de asociación en el catálogo.
14. Como desarrollador, quiero que el campo `name` valide kebab-case con regex, para mantener la convención de nomenclatura del IDP.
15. Como responsable de compliance, quiero que el `RepoUrlPicker` restrinja hosts y owners permitidos (`gitlab.com`, `aragon-idp/projects`), para evitar publicaciones en repositorios corporativos arbitrarios.
16. Como usuario del IDP, quiero que el formulario esté dividido en pasos lógicos con títulos en castellano, para facilitar la navegación.
17. Como tester del sistema, quiero que si un paso del pipeline falla (por ejemplo, el repo ya existe en GitLab), los pasos posteriores no se ejecuten y la task quede en estado `failed` con log accesible.
18. Como platform-admin, quiero que ambas plantillas estén registradas en el catálogo vía `Location` estática al arrancar el backend, para que estén disponibles sin intervención manual.

## Implementation Decisions

### Módulo: Backend template manifest (`template.yaml`)

- Añadir campo `groupId` en el paso de información del servicio: tipo `string`, patrón Maven (`^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$`), valor por defecto `es.aragon`. Pasar este valor al `fetchSkeleton` y al `fetchOverlay`.
- Reestructurar `parameters` en tres pasos lógicos: *Información del servicio*, *Cumplimiento ENS* y *Repositorio destino*, alineado con **RS-FORM-07**.
- Actualizar el paso `publish:gitlab` para incluir:
  - `branches: [{ name: main, protect: true }]` (protege `main` tras el push inicial, usando la API de GitLab vía `@backstage/plugin-scaffolder-backend-module-gitlab`).
  - `settings: { only_allow_merge_if_pipeline_succeeds: true }` (obliga pipelines verdes para MRs posteriores).
- Añadir paso condicional `fs:delete` para eliminar `docs/runbook-bcp.md` cuando `nivel_ens !== 'alto'`, replicando el patrón ya usado en el frontend.

### Módulo: Backend overlay (`content/`)

- `catalog-info.yaml`: mantener anotaciones `aragon.es/nivel-ens` y `aragon.es/skeleton-version`, además de `spec.owner`, `spec.system`, `spec.lifecycle: experimental`.
- `CODEOWNERS`: asignar rutas sensibles (`src/main/java/`, `pom.xml`, `.gitlab-ci.yml`, `catalog-info.yaml`) a `@security-reviewers`; el resto a `@platform-admin`.
- `.gitlab-ci.yml`: pipeline Maven con stages `build`, `test`, `security` (condicional `nivel_ens != basico`), `sbom`, `publish`. Jobs: `mvn package`, `mvn test`, Semgrep SAST, Trivy fs, CycloneDX SBOM (`cyclonedx-maven-plugin`), publish condicional a `main`.
- `mkdocs.yml`: nav con `index.md`, `runbook.md`, `responsabilidades.md`, y `runbook-bcp.md` solo si `nivel_ens == alto`.
- `docs/index.md`: descripción del servicio, metadatos (`groupId`, `nivel_ens`, sistema, propietario), instrucciones de arranque local.
- `docs/runbook.md`: build local, descripción de stages del pipeline, logs/observabilidad.
- `docs/responsabilidades.md`: matriz RACI condicionada por `nivel_ens` (similar al frontend pero adaptado a backend).
- `docs/runbook-bcp.md`: plan de recuperación y continuidad de negocio, generado solo para `nivel_ens == alto`.

### Módulo: Frontend template manifest (`template.yaml`)

- Actualizar `publish:gitlab` con la misma configuración de `branches` y `settings` que el backend, para garantizar paridad en la postura de seguridad del repositorio generado.

### Módulo: Seed estático (`app-config.yaml`)

- Verificar que las `Location` de tipo `file` apuntan a `examples/templates/backend-spring-boot/template.yaml` y `examples/templates/frontend-angular-desy/template.yaml`. No se requieren cambios de ruta; solo validación de que continúan cargando tras las modificaciones.

### Decisiones arquitectónicas

- El overlay (`./content`) se mantiene como **módulo profundo** (deep module): una interfaz declarativa simple (directorio de plantillas Nunjucks con variables) que encapsula toda la lógica condicional por `nivel_ens`. El esqueleto remoto permanece genérico; el overlay es el único punto donde el IDP inyecta determinismo.
- `MyGroupsPicker` se conserva como picker nativo de Backstage (campo `ui:field: MyGroupsPicker`), sin necesidad de extensión custom.
- `fetch:template` remoto del backend se conserva tal cual (sin cambiar a `fetch:plain`), porque el esqueleto de GitLab contiene tokens Nunjucks (`${{ values.artifactId }}`) que deben renderizarse antes del overlay.
- `notification:send` se deja con `recipients: broadcast` y mensaje genérico, ya que el solicitante no requiere personalización adicional para este alcance.
- `continueOnError` no se añade en ningún paso; Backstage aborta el pipeline por defecto ante errores, cumpliendo **RS-STEP-08**.

## Testing Decisions

- **Buen test = comportamiento observable, no implementación interna.**
  - No se testean las plantillas como unidades de código TypeScript (no es el patrón de Backstage).
  - Se valida que los YAML generados por el overlay son sintácticamente correctos y que las condiciones Nunjucks (`{%- if ... %}`) no producen estructuras inválidas.

- **Módulos a testar**
  - **Backend `content/`**: validar que al renderizar el overlay con valores de ejemplo (todos los `nivel_ens`) se producen archivos válidos (`catalog-info.yaml`, `.gitlab-ci.yml`, `mkdocs.yml`, `CODEOWNERS`).
  - **Backend `template.yaml`**: validar que el schema de parámetros es correcto (la CLI de Backstage `backstage-cli template:lint` o validación manual contra JSON Schema de Template).
  - **Frontend `template.yaml`**: verificar que el cambio en `publish:gitlab` no rompe la sintaxis.

- **Prior art en el repositorio**
  - No hay suite de tests automatizada para templates en el repo actual. La verificación se hará mediante:
    1. `toolbox run -c backstage-dev yarn tsc` (compilación del backend sin errores).
    2. Ejecución manual de ambas plantillas en el Scaffolder de desarrollo y revisión del workspace temporal.
    3. Validación visual de que los repos creados contienen los archivos esperados y que `main` aparece protegida en GitLab.

## Out of Scope

- **RS-OUT-04/05** (configuración de seguridad dentro del esqueleto Spring Boot/Angular): el esqueleto remoto ya contiene `SecurityConfig.java`, headers Nginx, etc. No se modifica el contenido del esqueleto, solo el overlay.
- **RS-OUT-07** (branch protection con aprobación obligatoria de `@security-reviewers` en MRs posteriores): la protección de rama (`protect: true`) se aplica, pero la configuración granular de aprobadores por CODEOWNERS en GitLab (requerir aprobación de grupo específico) depende de la edición de GitLab y no está expuesta en `publish:gitlab` de Backstage 0.11.5. Se documenta como limitación conocida.
- **RS-STEP-05** (auto-merge explícito del MR de bootstrapping): `publish:gitlab` no abre MR en el bootstrapping; hace push directo a `main` y luego protege la rama. Esto satisface la intención del requisito (contenido inicial en `main` sin fricción), pero no es un "auto-merge de MR".
- **Canales externos de notificación** (Slack, email): se mantiene in-app únicamente.
- **Pruebas E2E automatizadas** del Scaffolder (Playwright): el repo tiene `yarn test:e2e`, pero no se añaden tests nuevos para las plantillas.
- **Migración del frontend a GitLab** (el starter sigue en Bitbucket): no se toca.

## Further Notes

- La versión instalada de `@backstage/plugin-scaffolder-backend-module-gitlab` es `^0.11.5`. Su acción `publish:gitlab` soporta `branches` (array con `name`, `protect`, `create`, `ref`) y `settings` (objeto con propiedades de proyecto GitLab como `only_allow_merge_if_pipeline_succeeds`). No soporta `protectDefaultBranch` ni `autoMerge` como parámetros de primer nivel.
- El campo `MyGroupsPicker` es nativo de `@backstage/plugin-scaffolder` desde la versión 1.24+. No requiere registro en `App.tsx` ni instalación adicional.
- `groupId` en el backend se propaga tanto al esqueleto remoto (`fetchSkeleton.values.groupId`) como al overlay (`fetchOverlay.values.groupId`), permitiendo que futuras versiones del esqueleto usen la variable y que el overlay la documente en `docs/index.md`.
- Los runbooks BCP (`docs/runbook-bcp.md`) siguen el mismo patrón condicional que el frontend: se generan en el overlay y se eliminan vía `fs:delete` cuando `nivel_ens != alto`. Esto es más robusto que condicionar el `fetch:template` a nivel de URL, porque mantiene el directorio `docs/` siempre presente.
