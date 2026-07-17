# ADR-0003: Grupos Operativos Keycloak Como Hijos De Unidades AST

## Estado

Superseded by ADR-0005 (jerarquía de 2 niveles reemplazada por jerarquía de 4 niveles).

## Contexto

ADR-0002 define una jerarquia minima AST con tres unidades funcionales (`plataforma`, `desarrollo`, `seguridad`). Existen ademas tres grupos operativos sincronizados desde Keycloak (`developers`, `platform-admins`, `security-reviewers`) que actualmente son planos, sin padre organizativo.

La investigacion tecnica confirma que el provider de Keycloak reescribe los campos `spec` de sus grupos cada 30 minutos y no popula `spec.parent`. Redefinir esos grupos en YAML estatico provocaria sobrescrituras alternantes e inestabilidad. La via segura es declarar `spec.children` unicamente en los grupos estaticos padre.

## Decision

Anadir un segundo nivel a la jerarquia AST donde los grupos operativos de Keycloak cuelgan como hijos de las unidades funcionales:

```text
ast
├── plataforma
│   └── platform-admins    (Keycloak)
├── desarrollo
│   └── developers         (Keycloak)
└── seguridad
    └── security-reviewers (Keycloak)
```

Implementacion:

- Los grupos estaticos (`ast`, `plataforma`, `desarrollo`, `seguridad`) se definen en YAML estatico con `spec.children` apuntando a sus hijos.
- Los grupos operativos (`developers`, `platform-admins`, `security-reviewers`) no se redefinen en YAML: siguen viniendo unicamente desde Keycloak.
- Las relaciones `childOf` / `parentOf` se derivan automaticamente desde `spec.children` en el lado del padre estatico.

## Consecuencias

- El catalogo mostrara la cadena de gobierno completa: organizacion publica -> unidad funcional -> equipo operativo.
- No se duplican entidades ni se interfiere con la sincronizacion de Keycloak.
- Si en el futuro se anaden mas grupos operativos en Keycloak, habra que decidir bajo que unidad funcional cuelgan.
- El modelo asume una correspondencia uno-a-uno unidad funcional <-> grupo operativo. Si eso cambia, habra que revisar la jerarquia.