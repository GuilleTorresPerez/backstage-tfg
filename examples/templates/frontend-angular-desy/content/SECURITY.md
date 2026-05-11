# Política de seguridad del frontend Angular DESY

> Este documento forma parte del cumplimiento del Esquema Nacional de Seguridad
> (ENS) según el Real Decreto 311/2022. Aplica a los proyectos generados con la
> plantilla `frontend-angular-desy` del IDP.

## 1. Headers de seguridad HTTP (nginx)

El despliegue del frontend se realiza como **SPA estática** servida por
**nginx**. La configuración `nginx.conf` incluye los siguientes headers de
seguridad recomendados por OWASP y el ENS:

| Header | Valor | Propósito |
|--------|-------|-----------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | Fuerza HTTPS durante 2 años, incluyendo subdominios (HSTS). |
| `X-Frame-Options` | `DENY` | Protección contra clickjacking. |
| `X-Content-Type-Options` | `nosniff` | Evita que el navegador adivine el MIME type. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limita la información de referrer en peticiones cross-origin. |
| `Permissions-Policy` | Múltiples directivas deshabilitadas | Reduce la superficie de ataque desactivando APIs del navegador no usadas (cámara, micrófono, geolocalización, etc.). |
| `Cross-Origin-Opener-Policy` | `same-origin` | Aisla el contexto de navegación; previene XS-Leaks. |
| `Cross-Origin-Embedder-Policy` | `require-corp` | Solo carga recursos cross-origin que otorguen permiso explícito. |
| `Cross-Origin-Resource-Policy` | `same-origin` | Protege contra ataques de inclusión de recursos cross-origin (XSSI). |
| `X-DNS-Prefetch-Control` | `off` | Deshabilita el DNS prefetch para evitar filtración de dominios visitados. |
| `Content-Security-Policy` | `default-src 'self'; ...` | Política restrictiva de fuentes de contenido. Ver sección 2. |

Todos los headers se envían con la directiva `always` de nginx para garantizar
que se incluyan incluso en respuestas de error (4xx, 5xx).

## 2. Content Security Policy (CSP)

La política CSP restringe de dónde puede cargar recursos el navegador:

- **`default-src 'self'`**: solo recursos del mismo origen.
- **`script-src 'self'`**: solo scripts del build de Angular (no inline,
  no eval).
- **`style-src 'self' 'unsafe-inline'`**: estilos propios; `'unsafe-inline'`
  es necesario para Angular en modo desarrollo. En producción se recomienda
  usar hashes o `nonce` si la toolchain lo permite.
- **`img-src 'self' data:`**: imágenes propias y data URIs.
- **`font-src 'self'`**: fuentes propias.
- **`connect-src 'self' <apiBaseUrl>`**: solo permite conexiones AJAX al
  backend configurado en el formulario del Scaffolder. Esta URL está
  validada para pertenecer al dominio `*.aragon.es`.
- **`frame-ancestors 'none'`**: el sitio no puede ser embebido en frames
  (refuerzo anti-clickjacking).
- **`base-uri 'self'`**: previene la manipulación del elemento `<base>`.
- **`form-action 'self'`**: los formularios solo pueden enviarse a orígenes
  propios.

> **Nota**: Si el backend necesita emitir eventos Server-Sent Events (SSE) o
> WebSockets, la directiva `connect-src` debe ampliarse en `nginx.conf` con la
> URL correspondiente.

## 3. CORS restrictivo (responsabilidad del backend)

**El frontend no gestiona CORS**. El control de acceso cross-origin es
responsabilidad exclusiva del backend (por ejemplo, Spring Boot).

Para mantener la seguridad, el backend debe:

1. **Nunca usar `Access-Control-Allow-Origin: *`** en entornos con autenticación.
2. **Especificar el origen exacto** del frontend en
   `Access-Control-Allow-Origin`.
3. **Controlar los métodos y headers** permitidos mediante
   `Access-Control-Allow-Methods` y `Access-Control-Allow-Headers`.
4. **No reflejar el header `Origin`** sin validación (vulnerabilidad CORS misconfiguration).

Ejemplo de configuración segura en Spring Boot:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://<frontend>.aragon.es")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("Authorization", "Content-Type")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

## 4. Validación de la URL del backend

El formulario del Scaffolder valida que `apiBaseUrl` cumpla el patrón:

```regex
^https://([a-zA-Z0-9_-]+\.)*aragon\.es(/.*)?$
```

Esto garantiza que:

- El protocolo sea **HTTPS**.
- El dominio pertenezca a **`*.aragon.es`**.
- Se eviten redirecciones a dominios externos no controlados.

## 5. Referencias normativas y técnicas

- Real Decreto 311/2022, de 3 de mayo, por el que se regula el Esquema
  Nacional de Seguridad (ENS).
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [OWASP HTTP Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)
- [MDN — Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
- [nginx — ngx_http_headers_module](https://nginx.org/en/docs/http/ngx_http_headers_module.html)
- [MDN — Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)
- [MDN — Permissions-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy)
