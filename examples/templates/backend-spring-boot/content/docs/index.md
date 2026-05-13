# ${{ values.name }}

${{ values.description }}

## Información del servicio

- **Tipo**: Microservicio Spring Boot
- **Sistema**: ${{ values.system or 'sin sistema asociado' }}
- **Propietario**: ${{ values.owner }}
- **Nivel ENS**: ${{ values.nivel_ens }}
- **Versión del esqueleto**: ${{ values.skeletonVersion }}

## Cómo arrancar en local

```bash
./mvnw spring-boot:run
```

## Pendientes tras el bootstrap

- Revisar la configuración de seguridad en `application.yml`
- Configurar la integración con el API gateway del sistema
