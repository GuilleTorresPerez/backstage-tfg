# ADR-0008: Anotacion security-owner Para Gobernanza De Seguridad

## Estado

Aceptada

## Contexto

El tutor pide distinguir la responsabilidad de seguridad del propietario tecnico. En administracion publica, el responsable de seguridad no siempre coincide con el propietario tecnico. Actualmente el catalogo usa un unico `spec.owner` sin distinguir dimensiones de propiedad.

## Decisiones

### Anotacion security-owner

Anadir la anotacion `aragon.es/security-owner` a las entidades del catalogo para representar el responsable de seguridad, distinto del propietario tecnico (`spec.owner`).

```yaml
metadata:
  annotations:
    aragon.es/security-owner: group:default/security-reviewers
spec:
  owner: group:default/equipo-frontend
```

### Valor por defecto

Todas las entidades del catalogo y todas las plantillas usan `group:default/security-reviewers` como valor por defecto de `security-owner`.

### Aplicacion

- Plantillas `backend-spring-boot` y `frontend-angular-desy`: generar `aragon.es/security-owner` en los `catalog-info.yaml`.
- Entidades existentes en `catalog/seed/`: anadir la anotacion a `system-aragon-idp`, `system-portal-ciudadano`, `portal-ciudadano-frontend`, `portal-ciudadano-backend`.

### No consumo por plugin

La anotacion no se consume con un plugin activo en el prototipo. Se justifica en la memoria:

```text
La anotacion aragon.es/security-owner se genera en los catalog-info.yaml
como metadato de gobernanza. En el prototipo no se consume con un plugin
activo porque el alcance se centra en el modelo organizativo y el catalogo.
Una extension natural seria un plugin que alerte cuando un componente
carezca de security-owner, especialmente en recursos importados de GitLab.
```

### Otras dimensiones de propiedad fuera de alcance

Propiedad funcional, legal y operativa no se modelan en el prototipo. Solo se distingue propietario tecnico (`spec.owner`) y responsable de seguridad (`aragon.es/security-owner`).

## Consecuencias

- El catalogo distingue propietario tecnico y responsable de seguridad.
- Las plantillas generan metadatos de gobernanza completos por defecto.
- La memoria debe justificar por que no se consume la anotacion con un plugin.
- Una extension natural seria un plugin de alertas para componentes sin security-owner.