# Runbook operativo — ${{ values.name }}

## Información de despliegue

- URL de la API backend: `${{ values.apiBaseUrl }}`
- Nivel ENS: `${{ values.nivel_ens }}`

## Build local

```bash
npm install --legacy-peer-deps
npm run build-prod
```

Los artefactos quedan en `dist/`.

## Pipeline (.gitlab-ci.yml)

| Stage | Descripción |
| --- | --- |
| install | `npm ci --legacy-peer-deps` |
| test | `test:unit` + `test:e2e` (Playwright) |
| build | `npm run build-prod` |
{%- if values.nivel_ens != "bajo" %}
| security | `eslint-security` + `trivy:fs` (ENS ${{ values.nivel_ens }}) |
{%- endif %}
| sbom | Genera `sbom.json` con CycloneDX |
| publish | Publica al registry interno (rama `main`) |

## Logs y observabilidad

TODO: enlazar al dashboard correspondiente del IDP cuando esté disponible.
