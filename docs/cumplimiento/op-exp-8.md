# Cumplimiento de [op.exp.8] Registro de actividad

Esta página mapea, requisito por requisito, el control **[op.exp.8] Registro de actividad** del *Anexo II del Real Decreto 311/2022* (Esquema Nacional de Seguridad) al prototipo de IDP del TFG. El alcance documentado es el nivel **ENS MEDIA**.

## Resumen del control

[op.exp.8] exige registrar las actividades de los usuarios reteniendo la información necesaria para *monitorizar, analizar, investigar y documentar* acciones indebidas o no autorizadas, e *identificar a la persona que actúa* en cada momento. Cada registro debe incluir, como mínimo, la identificación del usuario, la acción realizada, fecha y hora, éxito o fracaso y la identificación de los recursos involucrados.

## Mapa requisito → artefacto

| # | Requisito [op.exp.8] | Artefacto en el prototipo |
|---|----------------------|--------------------------|
| 1 | **Estructura del registro de actividad** | Tabla `audit_events` (PostgreSQL) con columnas `ts`, `event_id`, `severity`, `status`, `actor_ref`, `plugin_id`, `source_ip`, `user_agent`, `http_method`, `http_path`, `meta` (JSONB) y `error_message`. Migración: `plugins/audit-backend/migrations/20260514000000_init.js`. Índices sobre `ts DESC`, `actor_ref`, `event_id` y `plugin_id`. |
| 2 | **Identificación del usuario** (actor) | Columna `actor_ref` poblada con el `entityRef` del catálogo (p. ej. `user:default/jdoe`) en `eventToRow` (`plugins/audit-backend/src/auditLogFn.ts`, función `eventToRow`). El actor proviene del token autenticado vía el `httpAuth` core de Backstage. |
| 3 | **Fecha y hora** | Columna `ts TIMESTAMPTZ NOT NULL`. Se asigna en `eventToRow` con `new Date().toISOString()` (`plugins/audit-backend/src/auditLogFn.ts`). |
| 4 | **Acción realizada** y **éxito / fracaso** | Columnas `event_id` (p. ej. `user-sign-in`, `permission-decision`, `entity-validate-tfg`) y `status` (`initiated` / `succeeded` / `failed`). |
| 5 | **Identificación de recursos involucrados** | Columna `meta JSONB` con contexto específico de cada evento: `entityRef`, `permission`, `roles`, `rule`, `reason`, etc. |
| 6 | **Registro de sesión** (inicio / paradas / cambios) | Evento `user-sign-in` emitido desde `createSignInResolver` en `packages/backend/src/modules/oidcAuthProvider.ts`. En el éxito: `severity: 'medium'`, `status: 'succeeded'`, `meta: { entityRef }`. En el fracaso (token sin `preferred_username` o usuario no resoluble en el catálogo): `severity: 'high'`, `status: 'failed'`, `meta: { reason, entityRef? }`. |
| 7 | **Registro de configuración y opciones de seguridad** (decisiones de autorización) | Evento `permission-decision` emitido por `AragonPermissionPolicy.handle` (`packages/backend/src/permission-policy.ts`) **únicamente cuando la decisión es DENY**, con `meta = { permission, roles, reason }` y `reason ∈ { 'no-matching-role', 'unknown-permission', 'no-roles' }`. Las ALLOW no se emiten para mantener la señal/ruido. |
| 8 | **Registro de acciones sobre activos** | Evento `entity-validate-tfg` emitido por `TfgCatalogValidator.emitViolation` (`packages/backend/src/modules/tfgCatalogValidator.ts`) cuando una entidad incumple RC-COMP-05 (system obligatorio), RC-COMP-02 / RC-COMP-03 (listas cerradas) o RC-API-02. `meta` incluye `rule`, `entityRef`, `kind` y `value`. |
| 9 | **Nivel de detalle** del registro | Función pura `shouldPersist` en `plugins/audit-backend/src/AuditEventFilter.ts`: sólo los eventos `medium` / `high` / `critical` se insertan en `audit_events`; los `low` se descartan tras emitirse a stdout. La configuración `backend.auditor.severityLogLevelMappings.low: info` en `app-config.yaml` mantiene esos `low` visibles en los logs de aplicación para depuración. |
| 10 | **Protección contra alteración** (registros íntegros) | El DAO `AuditStore` (`plugins/audit-backend/src/AuditStore.ts`) expone *únicamente* los métodos `insert` y `query`: **no** existen `update` ni `delete` en su superficie pública. Append-only por contrato. UUID PK (`gen_random_uuid()`) evita colisiones tras restauraciones o fusiones. |
| 11 | **Control de acceso a los registros** | Permiso `audit.event.read` declarado en `plugins/audit-backend/src/permissions.ts` y concedido en `PERMISSION_MATRIX` (`packages/backend/src/permission-policy.ts`) a los roles `platform-admin` y `security-reviewer`. La autorización se verifica en cada petición HTTP en `plugins/audit-backend/src/router.ts` mediante `permissions.authorize([{ permission: auditEventReadPermission }])`: 401 si no autenticado, 403 si DENY, 200 en caso contrario. |
| 12 | **Consulta y trazabilidad operativa** | Endpoint `GET /api/audit/events` con filtros (`actor`, `eventId`, `severity` repetible, `status`, `from`, `to`) y paginación por cursor *estable bajo inserciones concurrentes* gracias a la comparación de tuplas `(ts, id) < (cursor.ts, cursor.id)` (`plugins/audit-backend/src/AuditStore.ts`, método `query`). `limit` por defecto 50, máximo 200. UI de consulta: `plugins/audit/src/components/AuditPage/AuditPage.tsx`. |
| 13 | **Retención de las trazas** durante el periodo fijado por el responsable de la seguridad | **Política manual**: las filas de `audit_events` no se borran automáticamente. Cuando proceda según la política de retención del responsable, el equipo de plataforma ejecuta los borrados sobre la base de datos. Ver *Trabajo futuro* para la automatización. |

## Trabajo futuro (fuera de alcance del TFG)

Los siguientes elementos son requisitos propios del nivel **ENS ALTA** o mejoras operativas que no condicionan el cumplimiento MEDIA:

- **Retención automatizada**. Actualmente la retención es manual. Una tarea programada (cron / `scheduler` de Backstage) que ejecute `DELETE FROM audit_events WHERE ts < now() - INTERVAL '<n> días'` cerraría el lazo. Para preservar el contrato append-only del DAO el privilegio `DELETE` debe asignarse a un rol de base de datos distinto del usuario de aplicación.
- **Cadena de integridad criptográfica ([op.exp.10] ALTA)**. Encadenar cada fila con `HMAC(prev_hash || row)` y publicar `tail_hash` periódicamente permitiría detectar alteraciones *a posteriori*. No es requisito en MEDIA.
- **Integración con SIEM externo (Loki / Elastic / Splunk)**. El `auditLogFn` (`plugins/audit-backend/src/auditLogFn.ts`) ya emite log estructurado JSON a stdout vía el `logger` de Backstage, por lo que cualquier *log shipper* (Promtail, Fluent Bit, Filebeat) puede colectarlo sin cambios en el código. El prototipo no despliega ni configura el colector.
- **Sincronización horaria (NTP)**. El `ts` se hereda del reloj del host. En producción debe garantizarse NTP en el host o clúster (`chronyd`, `systemd-timesyncd`); el prototipo no gestiona la sincronización ni la audita.
- **Autoservicio RGPD Art. 15** (acceso del interesado a sus propios registros). El modelo permite separar `audit.event.read` del propietario del evento: un permiso adicional `audit.event.read.own`, junto con un decorador que fije `filter.actor = credentials.principal.userEntityRef` en el router, habilitaría a cada usuario consultar únicamente sus propios registros. Extensión natural del marco actual.

## Referencias

- **Real Decreto 311/2022**, *Anexo II — Medidas de seguridad*, control [op.exp.8] *Registro de actividad*.
- Issue [#65](https://github.com/GuilleTorresPerez/backstage-tfg/issues/65) — `audit-log: backend plugin spine with REST endpoint and read permission`.
- Issue [#67](https://github.com/GuilleTorresPerez/backstage-tfg/issues/67) — `audit-log: emit custom events from oidcAuthProvider, permission-policy, tfgCatalogValidator`.
- README del plugin: `plugins/audit-backend/README.md`.
- Resumen general de controles ENS: [../ens.md](../ens.md).
