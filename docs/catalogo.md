# Convenciones del Catálogo de Software

Esta página resume las reglas de nombrado, los *kinds* permitidos y los campos obligatorios para que las entidades del catálogo sean válidas en este IDP.

## Kinds permitidos

El prototipo gestiona exactamente estos *kinds* (ver `app-config.yaml > catalog.rules`):

| Kind | Descripción |
|------|-------------|
| `Component` | Aplicación, servicio o librería desarrollada por un equipo. |
| `API` | Contrato de interfaz (OpenAPI, AsyncAPI, etc.). |
| `System` | Agrupación lógica de componentes y APIs que entregan una capacidad de negocio. |
| `User` | Persona del organigrama (sincronizado desde Keycloak). |
| `Group` | Equipo, departamento o unidad organizativa (sincronizado desde Keycloak). |
| `Template` | Plantilla del Scaffolder (Golden Path). |
| `Location` | Referencia a un fichero o URL que contiene más entidades (usado internamente). |

> `Resource` y `Domain` quedan **fuera de alcance** en este prototipo.

## Reglas de nombrado (RC-NAME)

- **RC-NAME-01**: los identificadores (`metadata.name`) deben usar **kebab-case** (minúsculas, números y guiones).
- **RC-NAME-02**: longitud mínima 3 caracteres, máxima 50.
- **RC-NAME-03**: expresión regular aplicada en los formularios del Scaffolder:
  ```
  ^[a-z0-9-]{3,50}$
  ```

## Campos obligatorios por kind

### Component

| Campo | Descripción | Valores habituales |
|-------|-------------|--------------------|
| `spec.type` | Clase de componente | `service`, `website`, `documentation`, `library` |
| `spec.owner` | Grupo responsable | `group:default/platform-admins`, `group:default/developers`… |
| `spec.lifecycle` | Etapa de madurez | `production`, `experimental`, `deprecated` |
| `spec.system` | Sistema al que pertenece | `aragon-idp`, `portal-ciudadano`… |

### System

| Campo | Descripción |
|-------|-------------|
| `spec.owner` | Grupo responsable del sistema completo |

> `System` **no** lleva `spec.lifecycle`.

### API

| Campo | Descripción |
|-------|-------------|
| `spec.type` | Tipo de API (`openapi`, `asyncapi`, `graphql`, `grpc`) |
| `spec.owner` | Grupo responsable |
| `spec.lifecycle` | Etapa de madurez |
| `spec.definition` | Texto o referencia al contrato |

### Template

| Campo | Descripción |
|-------|-------------|
| `spec.type` | Tipo de plantilla (usualmente `service` o `website`) |
| `spec.owner` | Grupo o usuario responsable |

## Ejemplo de entidad válida

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: mi-servicio-api
  description: Breve descripción del servicio
  tags:
    - spring-boot
    - backend
spec:
  type: service
  owner: group:default/developers
  lifecycle: production
  system: portal-ciudadano
```

## Recursos relacionados

- [Plantillas del Scaffolder](plantillas.md)
- [Controles ENS](ens.md)
