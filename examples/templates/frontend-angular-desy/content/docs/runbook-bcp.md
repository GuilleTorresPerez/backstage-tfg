{% if values.nivel_ens == "alto" -%}
# Runbook de continuidad de negocio (BCP) — ${{ values.name }}

> Componente clasificado como **ENS Alto**. Este runbook es de obligado
> cumplimiento antes de cualquier despliegue a producción (RS-OUT-09).

## Tiempo objetivo de recuperación (RTO)

TODO: definir RTO con la dirección técnica del organismo.

## Punto objetivo de recuperación (RPO)

TODO: definir RPO en función de la criticidad del servicio.

## Procedimiento de failover

1. Identificar el incidente en el dashboard de observabilidad.
2. Activar el rollback del último despliegue conocido (`dist/` artifact).
3. Notificar al canal de incidencias del organismo.
4. Documentar el evento en el sistema de gestión de incidencias.

## Pruebas de continuidad

- **Frecuencia**: cada 6 meses.
- **Responsable**: `${{ values.owner }}` con `@platform-admin` como observador.

## Contactos

- Propietario: `${{ values.owner }}`
- Equipo de plataforma: `@platform-admin`
- Equipo de seguridad: `@security-reviewers`
{%- else -%}
# Runbook de continuidad de negocio

Este componente no está clasificado como ENS Alto, por lo que no aplica un
plan de continuidad formal. Este archivo se conserva como placeholder.
{%- endif %}
