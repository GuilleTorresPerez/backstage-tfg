# Controles ENS en el Prototipo

Esta página resume qué controles del **Esquema Nacional de Seguridad (RD 311/2022)** están reflejados en el IDP y cuáles quedan fuera del alcance del TFG.

## Controles implementados

| Código | Nombre | Implementación en el IDP |
|--------|--------|--------------------------|
| **MP.SI** | Marco de seguridad de la información | Cada plantilla del Scaffolder exige seleccionar un nivel ENS (`basico`, `medio`, `alto`). Este valor se inyecta en el `catalog-info.yaml` del componente generado y condiciona los jobs de seguridad del pipeline. |
| **OP.ACC** | Control de acceso | Autenticación centralizada mediante Keycloak (OIDC Authorization Code + PKCE). Los usuarios y grupos se sincronizan en el catálogo vía `catalog-backend-module-keycloak`. |
| **MP.SW** | Desarrollo seguro | Las plantillas `backend-spring-boot` y `frontend-angular-desy` generan pipelines CI/CD que incluyen SAST y análisis de vulnerabilidades con Trivy cuando el nivel ENS es `medio` o `alto`. |
| **MP.COM** | Protección de las comunicaciones | El microservicio Spring Boot incluye configuración OpenAPI y CSP. El frontend Angular DESY inyecta la directiva `connect-src` en la Content Security Policy (nginx) restringida al dominio `*.aragon.es`. |
| **MP.DM** | Continuidad de negocio | Para nivel ENS `alto`, la plantilla `frontend-angular-desy` genera un `runbook-bcp.md` inicial con el esqueleto del plan de continuidad. |

## Controles fuera de alcance

| Código | Nombre | Razón / Trabajo futuro |
|--------|--------|------------------------|
| **MP.ALT** | Gestión de activos | No se gestionan inventarios de activos de infraestructura (servidores, redes, etc.). |
| **OP.AUD** | Auditoría | No hay generación automática de registros de auditoría del IDP ni de los componentes scaffoldeados. |
| **MP.IF** | Interconexión segura | El prototipo no despliega ni configura VPNs, firewalls ni segmentación de red. |
| **MP.PER** | Gestión de personal | La gestión de usuarios se delega en Keycloak; el IDP no implementa flujos de alta/baja ni revisión de permisos periódica. |
| **MP.LOG** | Registro de actividad | Aunque Backstage genera logs de aplicación, no hay centralización ni retención específica alineada con ENS. |

## Niveles ENS y pipeline

| Nivel | Jobs de CI/CD incluidos |
|-------|------------------------|
| **Básico** | Build, test y publicación de artefacto. |
| **Medio** | Lo anterior + SAST + escaneo de vulnerabilidades (Trivy). |
| **Alto** | Lo anterior + generación de runbook BCP + gates adicionales de aprobación. |

> **Nota**: la generación del SBOM se incluye en el pipeline del microservicio Spring Boot independientemente del nivel ENS, como práctica de *software supply chain*.
