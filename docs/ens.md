# Controles ENS en el Prototipo

Esta página resume qué controles del **Esquema Nacional de Seguridad (RD 311/2022)** están reflejados en el IDP y cuáles quedan fuera del alcance del TFG.

> **Alcance del prototipo**: el cumplimiento documentado en esta página se dirige al nivel **ENS MEDIA**. Los requisitos propios del nivel **ALTA** —cadena de integridad criptográfica ([op.exp.10]), sincronización horaria (NTP) explícita, retención automatizada e integración con un SIEM externo— se documentan como trabajo futuro.

## Controles implementados

| Código | Nombre | Implementación en el IDP |
|--------|--------|--------------------------|
| **MP.SI** | Marco de seguridad de la información | Cada plantilla del Scaffolder exige seleccionar un nivel ENS (`basico`, `medio`, `alto`). Este valor se inyecta en el `catalog-info.yaml` del componente generado y condiciona los jobs de seguridad del pipeline. |
| **OP.ACC** | Control de acceso | Autenticación centralizada mediante Keycloak (OIDC Authorization Code + PKCE). Los usuarios y grupos se sincronizan en el catálogo vía `catalog-backend-module-keycloak`. |
| **MP.SW** | Desarrollo seguro | Las plantillas `backend-spring-boot` y `frontend-angular-desy` generan pipelines CI/CD que incluyen SAST y análisis de vulnerabilidades con Trivy cuando el nivel ENS es `medio` o `alto`. |
| **MP.COM** | Protección de las comunicaciones | El microservicio Spring Boot incluye configuración OpenAPI y CSP. El frontend Angular DESY inyecta la directiva `connect-src` en la Content Security Policy (nginx) restringida al dominio `*.aragon.es`. |
| **MP.DM** | Continuidad de negocio | Para nivel ENS `alto`, la plantilla `frontend-angular-desy` genera un `runbook-bcp.md` inicial con el esqueleto del plan de continuidad. |
| **MP.LOG** | Registro de actividad | Los eventos de severidad `medium`/`high`/`critical` se persisten en la tabla PostgreSQL `audit_events` mediante el plugin `audit-backend`; los `low` se emiten únicamente a stdout. Detalle de cumplimiento en [op.exp.8](cumplimiento/op-exp-8.md). |
| **OP.AUD** | Auditoría | Endpoint `GET /api/audit/events` (filtros + paginación por cursor) protegido por el permiso `audit.event.read`, concedido a `platform-admin` y `security-reviewer`. El contrato de `AuditStore` es *append-only* (sólo `insert` / `query`). Detalle en [op.exp.8](cumplimiento/op-exp-8.md). |

## Controles fuera de alcance

| Código | Nombre | Razón / Trabajo futuro |
|--------|--------|------------------------|
| **MP.ALT** | Gestión de activos | No se gestionan inventarios de activos de infraestructura (servidores, redes, etc.). |
| **MP.IF** | Interconexión segura | El prototipo no despliega ni configura VPNs, firewalls ni segmentación de red. |
| **MP.PER** | Gestión de personal | La gestión de usuarios se delega en Keycloak; el IDP no implementa flujos de alta/baja ni revisión periódica de permisos. |
| **OP.EXP.10** | Protección criptográfica de los registros (ALTA) | No se firma criptográficamente la cadena de eventos (hash-chain); es requisito propio del nivel ALTA, no de MEDIA. |
| **Retención automatizada de `audit_events`** | — | La política de retención está documentada en [op.exp.8](cumplimiento/op-exp-8.md) pero no se ejecuta vía cron; los borrados, cuando proceda, son manuales. |
| **Integración con SIEM externo** | — | El plugin emite log JSON estructurado a stdout (compatible con Loki / Elastic / Splunk vía Promtail, Fluent Bit o Filebeat), pero el prototipo no despliega ni configura un colector externo. |
| **Sincronización horaria (NTP)** | — | El timestamp de los eventos se hereda del reloj del host; el prototipo no configura ni verifica NTP explícitamente. |

## Niveles ENS y pipeline

| Nivel | Jobs de CI/CD incluidos |
|-------|------------------------|
| **Básico** | Build, test y publicación de artefacto. |
| **Medio** | Lo anterior + SAST + escaneo de vulnerabilidades (Trivy). |
| **Alto** | Lo anterior + generación de runbook BCP + gates adicionales de aprobación. |

> **Nota**: la generación del SBOM se incluye en el pipeline del microservicio Spring Boot independientemente del nivel ENS, como práctica de *software supply chain*.
