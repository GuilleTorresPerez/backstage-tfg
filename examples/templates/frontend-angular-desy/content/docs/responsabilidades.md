# Matriz de responsabilidades — ${{ values.name }}

| Rol | Responsabilidad |
| --- | --- |
| ${{ values.owner }} | Mantenimiento del código y releases |
| @security-reviewers | Revisión de `src/environments/`, `*.config.ts` y `.gitlab-ci.yml` |
| @platform-admin | Gestión del scaffolder y del esqueleto base |

## Nivel ENS: ${{ values.nivel_ens }}

{% if values.nivel_ens == "alto" -%}
Este componente está clasificado como **ENS Alto**. Aplica:

- Auditoría continua del pipeline.
- Revisión del plan de continuidad cada 6 meses (ver `runbook-bcp.md`).
- Doble revisión obligatoria en cada Merge Request.
{%- elif values.nivel_ens == "medio" -%}
Este componente está clasificado como **ENS Medio**. Aplica:

- Análisis estático (SAST) y escaneo de dependencias en cada MR.
- Revisión periódica de versiones de dependencias.
{%- else -%}
Este componente está clasificado como **ENS Bajo**. Aplica:

- Buenas prácticas estándar de desarrollo.
- Tests unitarios y revisión por pares.
{%- endif %}
