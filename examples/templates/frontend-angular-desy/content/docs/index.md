# ${{ values.name }}

${{ values.description }}

## Información del componente

- **Tipo**: Frontend Angular DESY
- **Sistema**: ${{ values.system or 'sin sistema asociado' }}
- **Propietario**: ${{ values.owner }}
- **Nivel ENS**: ${{ values.nivel_ens }}
- **URL base de la API backend**: `${{ values.apiBaseUrl }}`
- **Versión del esqueleto**: ${{ values.skeletonVersion }}

## Layout generado por el Golden Path

| Parámetro | Valor |
| --- | --- |
| Tipo de cabecera | `${{ values.headerType }}` |
| Posición de la cabecera | `${{ values.headerPosition }}` |
| Selector de aplicaciones | `${{ values.hasAppSelector }}` |
| Subcabecera con pestañas | `${{ values.hasSubheader }}` |
| Sidebar de navegación | `${{ values.hasSidebar }}` |

## Cómo arrancar en local

```bash
npm install --legacy-peer-deps
npm run dev
```

## Pendientes tras el bootstrap

El starter base de Bitbucket trae el nombre `desy-angular-starter` codificado en
varios sitios. Antes del primer release conviene revisar/renombrar:

- `package.json` (`name`)
- `angular.json` (`projects.desy-angular-starter`)
- `karma.conf.js`
- `index.html` (`<title>`)
