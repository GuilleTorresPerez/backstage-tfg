# ADR-0002: Implementar Jerarquia Minima AST En El Catalogo

## Estado

Aceptada

## Contexto

El tutor senala que el prototipo no muestra una organizacion responsable en el catalogo. ADR-0001 fija AST como raiz conceptual, pero no decide si esa jerarquia se materializa en el artefacto o solo en la memoria.

## Decision

Implementar una jerarquia minima y demostrable de AST en el catalogo Backstage:

```text
ast
├── plataforma
├── desarrollo
└── seguridad
```

La jerarquia se anade como entidades estaticas de catologo. No se modifican usuarios, permisos ni anotaciones ENS en esta iteracion.

## Consecuencias

- El catalogo mostrara una organizacion responsable visible, no solo roles operativos planos.
- Habra que investigar como los grupos estaticos YAML conviven con los grupos sincronizados desde Keycloak sin duplicar entidades.
- La jerarquia podra ampliarse despues con subunidades, ownership.setToolTip o relaciones adicionales.