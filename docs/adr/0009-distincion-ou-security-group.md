# ADR-0009: Distinción Unidad Organizativa (OU) vs. Grupo de Seguridad Como Principio Rector

## Estado

Aceptada

## Contexto

ADR-0001 a ADR-0008 ya separan, en la práctica, dos tipos de nodo en el catálogo: los 4 `team` sincronizados desde Keycloak (`equipo-frontend`, `equipo-spring`, `platform-admins`, `security-reviewers`) y los 8 nodos estáticos de la jerarquía AST (`ast`, business-units, product-areas). `permission-policy.ts` solo mapea los 4 `team` a roles; los nodos estáticos no otorgan ningún permiso.

Sin embargo, ningún ADR anterior explicita *por qué* esta separación es correcta, ni la conecta con un principio reconocible fuera del prototipo. Esto deja la decisión sin defensa citable: ante la pregunta "¿por qué la jerarquía AST no vive en Keycloak, si en una AAPP los grupos están centralizados en el directorio?", la respuesta implícita hasta ahora ("Keycloak solo modela grupos planos") es circular, porque el propio autor del TFG diseñó el realm de Keycloak.

En un Active Directory (o equivalente), existen dos primitivas distintas que se confunden coloquialmente bajo "grupo":

- **Security groups**: otorgan acceso. Los usuarios son miembros; se referencian directamente en políticas de autorización.
- **Organizational Units (OUs)**: estructura administrativa (el organigrama). Los objetos viven dentro, pero la pertenencia a una OU no otorga acceso a aplicaciones — usar OUs para autorizar produce herencia de permisos no deseada en cascada.

## Decisión

Adoptar la distinción OU / security-group como principio rector, ya materializado por la implementación existente:

- Los 4 `team` (`equipo-frontend`, `equipo-spring`, `platform-admins`, `security-reviewers`) son **security groups**: fuente de acceso, centralizados en Keycloak, consumidos por `permission-policy.ts`.
- Los 8 nodos estáticos de `catalog/seed/org-ast.yaml` (`ast`, business-units, product-areas) son **unidades organizativas (OUs)**: estructura de gobierno, sin permisos propios, materializadas como YAML de catálogo en el prototipo.

La justificación para no reflejar las OUs en Keycloak no es una limitación técnica de Keycloak, sino un principio de diseño: en un AD real las OUs tampoco se modelan como security groups anidados, porque los grupos anidados en Keycloak (y en AD) heredan role-mappings del padre — usar esa primitiva para modelar estructura administrativa sería el antipatrón inverso al que se busca evitar.

Se documenta explícitamente que, en un despliegue real, el organigrama también podría vivir en el directorio corporativo como OUs (el plugin `catalog-backend-module-keycloak` ya soporta `subGroups → children`, mismo mecanismo que `spec.children`); se ha optado por YAML de catálogo en el prototipo por ser una decisión de demostración, no una limitación.

## Consecuencias

- Sustituye la justificación implícita "Keycloak solo modela grupos planos" (nunca escrita como tal en los ADR anteriores, pero presente como razonamiento informal) por un principio citable y defendible.
- ADR-0003 queda marcado como superseded por ADR-0005; ambos son coherentes con este principio.
- La memoria puede citar este ADR para responder a la pregunta "¿por qué los permisos vienen de Keycloak y no del catálogo?" y "¿por qué la jerarquía AST no está en el directorio?".
- Si en el futuro se decide migrar la jerarquía AST al directorio como OUs, la migración es técnicamente trivial (mecanismo ya verificado) y no invalida este ADR: solo cambia dónde se almacena la misma distinción conceptual.
