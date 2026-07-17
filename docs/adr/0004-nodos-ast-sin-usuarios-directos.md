# ADR-0004: Nodos Organizativos AST Sin Usuarios Directos

## Estado

Aceptada

## Contexto

ADR-0003 coloca los grupos operativos de Keycloak como hijos de las unidades funcionales AST. Queda por decidir si los nodos organizativos (`ast`, `plataforma`, `desarrollo`, `seguridad`) deben listar usuarios propios ademas de sus grupos hijos.

Los usuarios reales ya estan asignados a los grupos operativos en Keycloak (`keycloak/realm-export/aragon-idp-realm.json`, campo `"groups"` por usuario). El plugin sincroniza esa asignacion al catalogo.

## Decision

Los nodos organizativos AST (`ast`, `plataforma`, `desarrollo`, `seguridad`) seran nodos estructurales sin usuarios directos. Solo declaran `spec.children`, nunca `spec.members`.

La afiliacion a un nodo padre se calcula automaticamente por jerarquia: Backstage muestra como miembros de un grupo padre a todos los miembros de sus grupos hijos.

## Consecuencias

- Cero mantenimiento manual de listas de usuarios en YAML estatico.
- Anadir o remover usuarios en Keycloak se refleja automaticamente en la jerarquia AST sin tocar Backstage.
- El modelo asume que toda persona pertenece a un equipo operativo concreto. No representa pertenencia generica a una unidad funcional sin equipo especifico.
- La permission-policy existente no se ve afectada: sigue mapeando por grupos operativos, no por unidades funcionales.
- Si en el futuro se necesita representar jefatura o pertenencia transversal, habra que introducir grupos adicionales.