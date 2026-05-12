# PRD — Bloque F: TechDocs y Documentación del IDP

## Problem Statement

Como usuario del IDP (desarrollador, revisor del TFG, futuro mantenedor), no tengo manera de leer en línea las convenciones del catálogo, descripción de las Golden Paths del Scaffolder, ni la cobertura ENS del prototipo. Tampoco existe un mecanismo demostrado para que los componentes generados por el Scaffolder traigan documentación visible en Backstage. Esto impide:

- Cumplir RD-SOB-04 y RD-SOB-07 (TechDocs operativo con `builder: external` + publisher S3 sobre MinIO).
- Cumplir RC-VALID-04 y RC-NAME-01..03 (convenciones del catálogo documentadas y accesibles).
- Cumplir RS-VALID-03 (descripción de cada plantilla del Scaffolder con sus parámetros y controles ENS cubiertos).
- Demostrar que el patrón "componente con docs renderizadas" funciona en este IDP.

## Solution

Construir el Bloque F de TechDocs en dos pipelines independientes:

1. **Site estático del IDP** (`aragon-idp-docs`, en este mismo repo): cuatro páginas markdown que cubren landing, convenciones del catálogo, plantillas del Scaffolder y controles ENS. Se publica a MinIO manualmente vía un yarn target (`techdocs:publish-idp`) que invoca `techdocs-cli`. Sirve como demostración visible en Backstage de TechDocs funcionando contra el publisher S3.

2. **Publicación inicial automática para los componentes generados** (spring-boot y angular): los skeletons traen `mkdocs.yml` + `docs/` + anotación `backstage.io/techdocs-ref`. Durante el scaffolding, una nueva acción custom `aragon:techdocs:publish` ejecuta `techdocs-cli generate && publish` contra MinIO usando el endpoint y credenciales del backend. Los mismos `docs/` quedan también commiteados en el repo de GitLab. Se acepta como trade-off del prototipo que las ediciones post-creación NO se sincronizan automáticamente; esto se documenta como trabajo futuro vía CI/runner local.

## User Stories

1. Como desarrollador, quiero ver en Backstage TechDocs la página de inicio del IDP, para entender qué es la plataforma y por dónde empezar.
2. Como desarrollador, quiero consultar las convenciones del catálogo (kinds permitidos, campos obligatorios, regex de nombrado), para crear entidades válidas sin tener que leer el código de validación.
3. Como desarrollador, quiero leer la descripción de cada Golden Path del Scaffolder con sus parámetros, para elegir la plantilla correcta al crear un componente nuevo.
4. Como responsable de cumplimiento ENS, quiero consultar qué controles ENS están implementados en el prototipo y cuáles quedan fuera de alcance, para auditar el estado de conformidad.
5. Como revisor del TFG, quiero abrir la pestaña "Docs" del componente `aragon-idp-docs` y ver las páginas renderizadas, para verificar que TechDocs funciona end-to-end.
6. Como desarrollador, quiero que al ejecutar `yarn techdocs:publish-idp` el site del IDP se publique a MinIO, para iterar el contenido sin tener que conocer la CLI de techdocs.
7. Como desarrollador, quiero crear un componente Spring Boot vía el Scaffolder y abrir su pestaña "Docs" en Backstage justo después de la creación, para ver la documentación inicial sin pasos manuales adicionales.
8. Como desarrollador, quiero crear un componente Angular DESY vía el Scaffolder y obtener el mismo comportamiento de docs iniciales en Backstage.
9. Como desarrollador, quiero que el repo recién scaffoldeado en GitLab contenga el `mkdocs.yml` y la carpeta `docs/` con un `index.md` inicial, para poder iterar los docs en el propio repo.
10. Como mantenedor del IDP, quiero que la acción `aragon:techdocs:publish` lea la configuración de MinIO desde el `Config` del backend (no hardcodeada), para que cambie automáticamente al cambiar `app-config.local.yaml` o `app-config.production.yaml`.
11. Como mantenedor del IDP, quiero que las entidades del IDP (`aragon-idp` System y `aragon-idp-docs` Component) aparezcan en el catálogo al arrancar Backstage, para que estén disponibles sin acciones manuales.
12. Como mantenedor del IDP, quiero que `mkdocs` ignore los ficheros de `docs/architecture/` (DSL de Structurizr) y `docs/PRD-*.md` cuando genera el site, para que el bundle TechDocs contenga solo las páginas oficiales del IDP.
13. Como autor de las plantillas, quiero que `desy-project` quede explícitamente fuera de alcance de TechDocs en este bloque, para no introducir trabajo no decidido.
14. Como autor de las plantillas, quiero que la acción `aragon:techdocs:publish` se ejecute después de `fetch:template` y antes de `publish:gitlab`, para publicar el snapshot a MinIO con los mismos contenidos que se van a commitear.
15. Como revisor del TFG, quiero ver en `plantillas.md` qué publicación queda automatizada y qué no (con la salvedad del refresco post-creación), para entender los límites declarados del prototipo.
16. Como mantenedor del IDP, quiero tests para la acción `aragon:techdocs:publish`, para tener una regresión que detecte si la generación o publicación se rompen en el futuro.
17. Como mantenedor del IDP, quiero que el directorio temporal de salida (`.techdocs-output/`) esté en `.gitignore`, para no contaminar el repo con artefactos generados.
18. Como autor del site del IDP, quiero un `nav:` explícito en `mkdocs.yml`, para controlar el orden de las páginas que ve el lector.

## Implementation Decisions

### Arquitectura general

- TechDocs queda en modo `builder: external` + `publisher.type: awsS3` (ya configurado en `app-config.yaml` y `app-config.local.yaml`). MinIO local actúa como S3 endpoint vía `http://localhost:9000`, bucket `techdocs`. El servicio `minio-init` de `docker-compose.yml` ya crea el bucket — no hay cambios de infra.
- Dos rutas de publicación coexisten: yarn target para el site estático del IDP, acción del Scaffolder para los componentes generados.

### Módulo A — Acción custom del Scaffolder `aragon:techdocs:publish`

- Action ID: `aragon:techdocs:publish`.
- Implementación: módulo en `packages/backend/src/modules/scaffolder/` que crea la acción vía `createTemplateAction(...)` y se exporta como `BackendFeature` para registrarse con `backend.add(...)`.
- Input schema: `entityRef` (string, requerido, formato `kind:namespace/name`).
- Comportamiento:
  1. Lee del `Config` del backend: `techdocs.publisher.awsS3.bucketName`, `endpoint`, `region`, `credentials.accessKeyId`, `credentials.secretAccessKey`.
  2. Crea un directorio temporal de output bajo `ctx.workspacePath` (p. ej. `.techdocs-output/`).
  3. Invoca `techdocs-cli generate --source-dir <workspacePath> --output-dir <out>`.
  4. Invoca `techdocs-cli publish --publisher-type awsS3 --storage-name <bucketName> --awsBucketAddressing path --awsEndpoint <endpoint> --awsRegion <region> --entity <entityRef> --directory <out>`, inyectando las credenciales por env vars (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).
  5. Si la publicación falla, devuelve error con el `stderr` de la CLI. Si tiene éxito, log informativo con el bucket destino y el `entityRef`.
- Dependencia: `@techdocs/cli` añadida a `packages/backend/package.json` o invocada vía `npx @techdocs/cli@<version-pinned>`. Decisión final durante implementación (preferir dep pineada si añade latencia inaceptable la primera ejecución vía npx).
- Idempotente por diseño: republicar el mismo `entityRef` sobrescribe el contenido anterior en MinIO. Comportamiento natural de `techdocs-cli publish`.

### Módulo B — Seed del catálogo del IDP

- Nuevo fichero: `catalog/seed/system-aragon-idp.yaml`. Contenido: dos entidades separadas por `---`.
  - `System` `aragon-idp`, `spec.owner: group:platform-admins`. (System no tiene `lifecycle`.)
  - `Component` `aragon-idp-docs`, `spec.type: documentation`, `spec.owner: group:platform-admins`, `spec.lifecycle: production`, `spec.system: aragon-idp`, anotación `backstage.io/techdocs-ref: dir:.`.
- Registrar en `app-config.yaml > catalog.locations` añadiendo: `- type: file, target: ../../catalog/seed/system-aragon-idp.yaml`.

### Módulo C — Site `aragon-idp-docs`

- Nuevo `mkdocs.yml` en raíz. Campos clave:
  - `site_name: Plataforma IDP Aragón`
  - `docs_dir: docs`
  - `theme: name: material`
  - `plugins: [techdocs-core]`
  - `exclude_docs:` con patrones que ignoren `architecture/**` y `PRD-*.md`.
  - `nav:` explícito: Inicio → Catálogo → Plantillas → ENS.
- Nuevos markdowns en `docs/`:
  - `docs/index.md` — landing: qué es el IDP, mapa de funcionalidades, enlaces al catálogo, al Scaffolder y a Structurizr en `http://localhost:8080`.
  - `docs/catalogo.md` — convenciones: lista de kinds usados, tabla de campos obligatorios por kind, regex de nombrado (RC-NAME-01..03), valores permitidos para `spec.type` y `spec.lifecycle`, ejemplo de entidad válida.
  - `docs/plantillas.md` — descripción de las dos Golden Paths (`backend-spring-boot`, `frontend-angular-desy`): parámetros, salida esperada (repo en GitLab + entrada de catálogo + docs auto-publicados), controles ENS cubiertos por cada uno. Nota explícita sobre `desy-project` como template fuera de alcance. Nota sobre el límite del prototipo respecto al refresco post-scaffold.
  - `docs/ens.md` — tabla de controles ENS implementados y tabla de controles fuera de alcance del prototipo. Contenido derivado de `/home/guillermotorres/Documents/TFG/Implementación/Requisitos/`.

### Módulo D — TechDocs scaffolding en skeletons

Para `backend-spring-boot` y `frontend-angular-desy`:

- Añadir `content/mkdocs.yml` con configuración mínima: `site_name: ${{ values.name }}`, theme material, plugin `techdocs-core`, nav con `index`.
- `content/docs/index.md`: ya existe en `frontend-angular-desy`; crear el equivalente para `backend-spring-boot` con placeholders Nunjucks (`${{ values.name }}`, `${{ values.description }}`, parámetros del template).
- En `content/catalog-info.yaml` de ambos, añadir bajo `metadata.annotations`:
  ```yaml
  backstage.io/techdocs-ref: dir:.
  ```
- En `template.yaml` de ambos, insertar entre `fetch:template` y `publish:gitlab`:
  ```yaml
  - id: publish-techdocs
    name: Publicar documentación inicial en TechDocs
    action: aragon:techdocs:publish
    input:
      entityRef: component:default/${{ parameters.name }}
  ```

### Módulo E — Yarn target

En el `package.json` raíz, añadir bajo `"scripts"`:

```json
"techdocs:publish-idp": "npx @techdocs/cli@latest generate --source-dir . --output-dir ./.techdocs-output/idp && npx @techdocs/cli@latest publish --publisher-type awsS3 --storage-name techdocs --awsBucketAddressing path --awsEndpoint http://localhost:9000 --entity component:default/aragon-idp-docs --directory ./.techdocs-output/idp"
```

Credenciales AWS pasan por env vars (el desarrollador exporta `AWS_ACCESS_KEY_ID=minioadmin` y `AWS_SECRET_ACCESS_KEY=minioadmin`, o las sourcea desde un `.env` local no committeado). Documentar la receta en `docs/index.md`.

Añadir `.techdocs-output/` al `.gitignore`.

### Módulo F — Wiring del backend

- En `packages/backend/src/index.ts`, registrar el nuevo módulo de scaffolder con `backend.add(import('./modules/scaffolder/techdocsPublishModule'))`.
- Añadir `@techdocs/cli` a `packages/backend/package.json` si se opta por invocación local. Si se prefiere `npx`, pin de versión en la acción para evitar resoluciones inestables.

### Orden de implementación recomendado

A → F → B → C → E → D. Razones:

- A y F son condición necesaria para que D funcione end-to-end (la acción debe existir y estar registrada antes de wirearla en los templates).
- B y C son independientes y se pueden hacer en paralelo; juntos permiten validar el site del IDP.
- E es prerequisito útil para iterar contenido de C.
- D se hace al final, cuando todo lo demás está estable.

## Testing Decisions

### Filosofía

Solo se escriben tests automatizados para la acción `aragon:techdocs:publish` (Módulo A), por ser la única pieza con lógica real. El resto (config, contenido markdown, wiring, seed YAML, plantillas) se verifica manualmente arrancando el backend y ejecutando los flujos.

### Qué hace un buen test aquí

- Verificar **comportamiento externo**: dado un `entityRef` y un workspace con `mkdocs.yml` + `docs/`, la acción ejecuta la cadena `generate → publish` y deja el resultado correcto en el endpoint S3 configurado.
- **No** testar implementación interna: ningún assert sobre flags exactos pasados a la CLI ni sobre números concretos de invocaciones — eso es fragilidad.
- Errores: si la CLI devuelve código de salida ≠ 0, la acción debe propagar un error visible para el scaffolder. Test asegurando esa propagación.

### Estrategia

Test unitario que mockea la invocación a `child_process.spawn/exec` (o equivalente si se usa la API programable de `@techdocs/cli`) y verifica:

1. Que la acción lee correctamente endpoint, bucket y credenciales del `Config` mock.
2. Que ante un workspace válido, la acción completa sin error y devuelve metadata visible (entityRef + bucket destino).
3. Que ante un fallo del subprocess, la acción lanza error con el `stderr` propagado.

### Prior art

No hay tests previos de acciones custom del Scaffolder en este repo (`plugins/` está vacío). Referencias externas:

- Documentación oficial Backstage sobre custom scaffolder actions: `https://backstage.io/docs/features/software-templates/writing-custom-actions`.
- Tests del módulo OIDC en `packages/backend/src/modules/` (si existen) como referencia de cómo se testean módulos backend en este repo.

## Out of Scope

- **Auto-render de docs en push** (CI/CD con GitLab Runner). Queda fuera. Documentado en `plantillas.md` como trabajo futuro (patrón: GitLab Runner local registrado contra el grupo `aragon-idp` de gitlab.com, con `.gitlab-ci.yml` por repo que publique en MinIO).
- **Sincronización post-creación**: las ediciones a `docs/` en el repo de GitLab después del scaffolding NO se reflejan en MinIO. Límite del prototipo aceptado.
- **TechDocs para `desy-project`**: el tercer template queda fuera. Si se decide incluirlo más adelante, se replica el patrón del Módulo D.
- **TechDocs para los Components seed** (`portal-ciudadano-frontend/backend`): fuera. Si se quieren docs visibles, se añaden al `catalog/seed/system-portal-ciudadano.yaml` con `techdocs-ref` apuntando a nuevas carpetas en este repo.
- **Tests e2e con Playwright**: no se escriben. Verificación end-to-end manual.
- **Tests para módulos B, C, D, E, F**: no se escriben.
- **Migración de `desy-project` a GitLab** (sigue con `github.com/project-slug`): no es alcance de este bloque.

## Further Notes

- **Requisitos cubiertos**: RD-SOB-04, RD-SOB-07, RC-VALID-04, RC-NAME-01..03, RS-VALID-03.
- **Idioma**: contenido en español, identificadores y configs en inglés (consistente con el resto del repo).
- **Theme y plugins**: `material` + `techdocs-core` únicamente. No se añaden plugins extra.
- **Owner**: `group:platform-admins` para ambas entidades nuevas, consistente con `portal-ciudadano`.
- **Riesgo conocido — latencia de `npx`**: `@techdocs/cli` invocado vía `npx` puede tardar varios segundos la primera vez (descarga del paquete). Para la acción del Scaffolder, considerar pinear la versión o instalarla como dep del backend para evitar penalización por cada scaffold.
- **Riesgo conocido — credenciales en env**: el yarn target depende de que el desarrollador exporte `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`. Documentar receta en el README del repo o en `docs/index.md`. La acción del backend lee del `Config` así que no tiene esta dependencia.

## Verificación end-to-end

Pasos manuales tras implementación:

1. `docker compose up -d` (postgres + keycloak + minio + minio-init).
2. `toolbox run -c backstage-dev yarn install` (si hubo cambios de deps).
3. `toolbox run -c backstage-dev yarn tsc` debe pasar.
4. `toolbox run -c backstage-dev yarn start` y dejar arrancar.
5. `toolbox run -c backstage-dev yarn techdocs:publish-idp` (con `AWS_ACCESS_KEY_ID=minioadmin` y `AWS_SECRET_ACCESS_KEY=minioadmin` exportados). Verificar en `http://localhost:9001` (MinIO Console) que existen objetos bajo `techdocs/default/component/aragon-idp-docs/`.
6. En Backstage, abrir el componente `aragon-idp-docs`, pestaña Docs. Las cuatro páginas (Inicio, Catálogo, Plantillas, ENS) deben renderizarse correctamente.
7. Scaffoldear un componente desde "Backend Spring Boot". Tras el wizard, abrir el componente nuevo, pestaña Docs. Debe mostrarse el `index.md` inicial.
8. Repetir con la plantilla "Frontend Angular DESY".
9. `toolbox run -c backstage-dev yarn workspace backend test --testPathPattern=techdocsPublish` debe pasar (test unitario de la acción).
