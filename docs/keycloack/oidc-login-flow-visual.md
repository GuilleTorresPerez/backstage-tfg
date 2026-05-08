# Flujo de Login OIDC: Usuario Humano

> **Ignoramos el flujo de catalogo (backstage-sync). Solo login.**

---

## 0. Las entidades ANTES de empezar

Ya estan creadas en Keycloak y Backstage antes de que Juan haga clic:

```
KEYCLOAK (aragon-idp)
|
|-- CLIENT (Tarjeta Publica)
|   |
|   +-- backstage
|       |-- clientId: "backstage"
|       |-- publicClient: true
|       |-- redirectUris: ["http://localhost:7007/api/auth/oidc/handler/frame"]
|       |-- standardFlowEnabled: true
|       +-- NO tiene secret. NO tiene roles.
|
|-- USUARIO HUMANO
|   |
|   +-- jperez
|       |-- username: "jperez"
|       |-- password: "changeme"
|       |-- email: "jperez@aragon.es"
|       |-- groups: ["/developers"]
|       +-- realmRoles: ["default-roles-aragon-idp", "offline_access", "uma_authorization"]
|
+-- ROLES DEL REALM
    |
    +-- default-roles-aragon-idp  (todos los humanos lo llevan)
    +-- offline_access
    +-- uma_authorization
```

```
BACKSTAGE
|
|-- FRONTEND (React)
|   +-- Tiene un boton "Iniciar sesion con Keycloak"
|
|-- BACKEND (Node.js)
|   |
|   +-- Modulo: oidcAuthProvider.ts
|       |
|       +-- signInResolver:
|           |-- Lee: info.result.fullProfile.userinfo.preferred_username
|           |-- Busca en el catalogo: ctx.signInWithCatalogUser({ entityRef: { name: "jperez" } })
|           +-- Si existe -> Juan entra. Si no -> Error.
```

> **Memoria:** Antes de empezar, Keycloak conoce a Juan y tiene la tarjeta de Backstage. Backstage sabe como leer el nombre de Juan del token.

---

## 1. Juan hace clic en "Iniciar sesion"

```
+-----------------------------------------------------------+
|  NAVEGADOR DE JUAN                                        |
|                                                           |
|  +------------------+                                     |
|  |  Backstage       |                                     |
|  |  (localhost:3000)|                                     |
|  |                  |                                     |
|  |  [Iniciar sesion |                                     |
|  |   con Keycloak]  |  <-- Juan hace clic                 |
|  +------------------+                                     |
|                                                           |
|  Usuario: Juan (humano, aun no autenticado)               |
+-----------------------------------------------------------+
```

> **Entidades:** Solo el **usuario Juan** y el **frontend de Backstage**.

---

## 2. Backstage pide a Keycloak una "pantalla de login"

```
  FRONTEND BACKSTAGE                    KEYCLOAK
  (localhost:3000)                      (localhost:8081)
       |                                     |
       |  "Soy el client backstage."         |
       |  "Dame una URL para que Juan        |
       |   pueda iniciar sesion."            |
       |------------------------------------>|
       |                                     |
       |<------------------------------------|
       |  "Ok. Mandalo a esta URL:           |
       |   /auth?client_id=backstage&        |
       |   redirect_uri=...&scope=openid"    |
       |                                     |
```

**Backstage envia (a traves del navegador):**
- `client_id=backstage`  <-- La tarjeta de identidad
- `redirect_uri=http://localhost:7007/api/auth/oidc/handler/frame`
- `response_type=code`
- `scope=openid profile email`

> **Entidades:**
> - **Client:** `backstage` (se presenta con su clientId)
> - **Usuario:** Juan (aun no autenticado, solo es redirigido)

> **Memoria:** `backstage` es solo un portero que le dice al navegador donde ir. No entra el.

---

## 3. El navegador de Juan va a Keycloak

```
+-----------------------------------------------------------+
|  NAVEGADOR DE JUAN                                        |
|                                                           |
|  +--------------------------------------------------+     |
|  |  KEYCLOAK (localhost:8081)                       |     |
|  |                                                  |     |
|  |  +------------------------------------------+    |     |
|  |  |  Iniciar sesion en Aragon IDP            |    |     |
|  |  |                                          |    |     |
|  |  |  Usuario: [______________]               |    |     |
|  |  |  Contrasena: [___________]               |    |     |
|  |  |                                          |    |     |
|  |  |  [Entrar]                                |    |     |
|  |  +------------------------------------------+    |     |
|  |                                                  |     |
+-----------------------------------------------------------+
```

Keycloak recibe la peticion y piensa:
- "¿Quien me manda a Juan?" -> `client_id=backstage`
- "¿Ese client existe?" -> Si, `backstage` esta registrado.
- "¿La URL de vuelta es valida?" -> Si, coincide con `redirectUris`.
- "Juan, demuestra quien eres."

> **Entidades:**
> - **Client:** `backstage` (validado por Keycloak)
> - **Usuario:** Juan (a punto de autenticarse)

---

## 4. Juan escribe sus credenciales

```
+-----------------------------------------------------------+
|  NAVEGADOR DE JUAN                                        |
|                                                           |
|  +--------------------------------------------------+     |
|  |  KEYCLOAK                                        |     |
|  |                                                  |     |
|  |  Usuario: [  jperez  ]   <-- Juan escribe        |     |
|  |  Contrasena: [ changeme ] <-- Juan escribe       |     |
|  |                                                  |     |
|  |  [Entrar]  <-- Juan hace clic                    |     |
|  +--------------------------------------------------+     |
+-----------------------------------------------------------+
```

Keycloak busca en su directorio:
- "¿Existe `jperez`?" -> Si.
- "¿La contrasena coincide?" -> Si, es `changeme`.
- "¿Esta habilitado?" -> Si, `enabled: true`.

Keycloak encuentra al usuario completo:
```json
{
  "username": "jperez",
  "firstName": "Juan",
  "lastName": "Perez",
  "email": "jperez@aragon.es",
  "groups": ["/developers"],
  "realmRoles": [
    "default-roles-aragon-idp",
    "offline_access",
    "uma_authorization"
  ]
}
```

> **Entidades:**
> - **Usuario:** `jperez` (encontrado y validado)
> - **Roles del realm:** Se cargan para el token

---

## 5. Keycloak genera un Token y redirige al navegador

```
  KEYCLOAK                              NAVEGADOR DE JUAN
       |                                         |
       |  "Juan esta autenticado. Le devuelvo    |
       |   un CODIGO DE AUTORIZACION para que    |
       |   Backstage lo canjee por un TOKEN."    |
       |---------------------------------------->|
       |                                         |
       |  URL: localhost:7007/api/auth/oidc/     |
       |       handler/frame?code=abc123         |
       |                                         |
```

**¿Por qué un codigo y no el token directamente?**
Por seguridad. El navegador no es de confianza. El codigo solo lo entiende el backend.

> **Entidades:**
> - **Usuario:** Juan (autenticado en Keycloak, sesion iniciada)
> - **Client:** `backstage` (quien recibira el codigo)

> **Memoria:** Keycloak no le da el token a Juan. Le da un "vale" que solo Backstage puede canjear.

---

## 6. Backstage backend canjea el codigo por un Token

```
  NAVEGADOR DE JUAN                     BACKEND BACKSTAGE
       |                                   (localhost:7007)
       |  "Toma este codigo: abc123"         |
       |------------------------------------>|
       |                                     |
       |                                     |  "Voy a Keycloak
       |                                     |   a canjear esto"
       |                                     |
       |                                     |-----> KEYCLOAK
       |                                     |       "Canjeo abc123
       |                                     |        por token"
       |                                     |<------ "Aqui tienes:
       |                                     |         access_token..."
       |                                     |
```

**Backstage envia a Keycloak:**
- `client_id=backstage`
- `code=abc123`
- `grant_type=authorization_code`

**Keycloak responde con un TOKEN (JWT):**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "id_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 300
}
```

> **Entidades:**
> - **Client:** `backstage` (intercambia codigo por token)
> - **Usuario:** `jperez` (el token contiene su identidad)

---

## 7. ¿Que hay DENTRO del token?

El `id_token` es un JWT (JSON Web Token). Decodificado, contiene:

```json
{
  "iss": "http://localhost:8081/realms/aragon-idp",
  "sub": "d32f511e-5f61-46ca-b9bd-c6eeee98ed52",
  "preferred_username": "jperez",
  "name": "Juan Perez",
  "given_name": "Juan",
  "family_name": "Perez",
  "email": "jperez@aragon.es",
  "realm_access": {
    "roles": [
      "default-roles-aragon-idp",
      "offline_access",
      "uma_authorization"
    ]
  }
}
```

**Campos importantes:**
| Campo | Significado | Que usa Backstage |
|-------|-------------|-------------------|
| `sub` | ID unico de Juan en Keycloak | No lo usas directamente |
| `preferred_username` | El login de Juan: `jperez` | **¡ESTO es lo que lees!** |
| `name` | Nombre completo | Para mostrar en la UI |
| `email` | Email | Para mostrar en la UI |
| `realm_access.roles` | Los realm roles de Juan | Para permisos (si los usaras) |

> **Memoria:** El token es la "carnet de identidad digital" de Juan. Backstage lo lee para saber quien es.

---

## 8. Backstage ejecuta el signInResolver

```
BACKEND BACKSTAGE
|
|-- Recibe el token
|-- Extrae: info.result.fullProfile.userinfo.preferred_username
|   +-- Valor: "jperez"
|
|-- Ejecuta signInResolver:
|   |
|   |  const preferredUsername =
|   |    info.result.fullProfile.userinfo.preferred_username;
|   |  // -> "jperez"
|   |
|   |  return ctx.signInWithCatalogUser({
|   |    entityRef: { name: "jperez" }
|   |  });
|   |
|   +-- Busca en el Catalogo: ¿Existe una entidad User con name=jperez?
```

> **Entidades:**
> - **Usuario tokenizado:** `preferred_username: "jperez"`
> - **Modulo:** `oidcAuthProvider.ts` (el que lee el token)
> - **Catalogo de Backstage:** Busca una entidad `User` con ese nombre

---

## 9. Backstage busca a Juan en el Catalogo

```
CATALOGO DE BACKSTAGE (SQLite en memoria)
|
|-- Entidades User:
|   |
|   |-- User:default/jperez
|   |   |-- spec.profile.email: jperez@aragon.es
|   |   |-- spec.memberOf: ["group:default/developers"]
|   |   +-- (creada por el plugin de Keycloak al sincronizar)
|   |
|   |-- User:default/agarcia
|   |-- User:default/msanchez
|   +-- ...
|
+-- Entidades Group:
    |-- Group:default/developers
    |-- Group:default/platform-admins
    +-- ...
```

**Busqueda:**
- "¿Existe `User:default/jperez`?" -> Si, existe.
- "¿Coincide el nombre?" -> Si.

**Resultado:** Backstage emite una **sesion de Backstage** para Juan.

> **Entidades:**
> - **Catalogo:** Entidad `User:default/jperez`
> - **Usuario:** Ahora es un "usuario de Backstage" (sesion activa)

---

## 10. Juan ya esta dentro de Backstage

```
+-----------------------------------------------------------+
|  NAVEGADOR DE JUAN                                        |
|                                                           |
|  +--------------------------------------------------+     |
|  |  BACKSTAGE (localhost:3000)                      |     |
|  |                                                  |     |
|  |  Bienvenido, Juan Perez!                         |     |
|  |                                                  |     |
|  |  +------------------------------------------+    |     |
|  |  |  Catalogo de Software                    |    |     |
|  |  |  - Componentes                           |    |     |
|  |  |  - APIs                                  |    |     |
|  |  |  - Plantillas                            |    |     |
|  |  +------------------------------------------+    |     |
|  |                                                  |     |
|  |  Usuario autenticado: jperez                     |     |
|  |  Grupo: developers                               |     |
|  +--------------------------------------------------+     |
+-----------------------------------------------------------+
```

> **Entidades:**
> - **Usuario de Backstage:** `jperez` (con sesion activa)
> - **Roles del catalogo:** Pertenece al grupo `developers` (gracias a la sincronizacion)

> **Memoria:** Juan entro porque Backstage encontro su nombre en el token y coincidio con una entidad en el catalogo.

---

## Resumen del flujo (una linea por paso)

| Paso | Quien actua | Que hace | Entidades clave |
|------|-------------|----------|-----------------|
| 1 | Juan | Hace clic en "Iniciar sesion" | Usuario humano |
| 2 | Frontend Backstage | Pide URL de login a Keycloak | Client `backstage` |
| 3 | Navegador | Va a Keycloak y muestra pantalla | Client `backstage` validado |
| 4 | Juan | Escribe `jperez` / `changeme` | Usuario `jperez`, credenciales |
| 5 | Keycloak | Valida y genera un codigo | Usuario `jperez`, realm roles |
| 6 | Backend Backstage | Canjea codigo por token OIDC | Client `backstage`, token JWT |
| 7 | Token JWT | Contiene `preferred_username: jperez` | Claims del usuario |
| 8 | signInResolver | Lee `preferred_username` del token | Modulo `oidcAuthProvider.ts` |
| 9 | Catalogo | Busca entidad `User` con ese nombre | Entidad `User:default/jperez` |
| 10 | Backstage | Crea sesion y deja entrar a Juan | Usuario autenticado |

---

## Diagrama completo resumido

```
  JUAN (humano)
     |
     | 1. Hace clic en "Iniciar sesion"
     v
  +-------------------------+
  |  FRONTEND BACKSTAGE     |
  |  (React, localhost:3000)|
  |  Client: backstage      |
  +-------------------------+
     |
     | 2. Redirige a Keycloak
     |    "client_id=backstage"
     v
  +-------------------------+
  |  KEYCLOAK               |
  |  (localhost:8081)       |
  |                         |
  |  3. Muestra pantalla    |
  |     de login            |
  |                         |
  |  4. Juan escribe:       |
  |     jperez / changeme   |
  |                         |
  |  Keycloak valida:       |
  |  - Usuario: jperez      |
  |  - Roles: default-...   |
  |                         |
  |  5. Genera CODIGO       |
  |     y redirige          |
  +-------------------------+
     |
     | 6. Codigo al backend
     v
  +-------------------------+
  |  BACKEND BACKSTAGE      |
  |  (Node, localhost:7007) |
  |                         |
  |  7. Canjea codigo por   |
  |     TOKEN OIDC          |
  |                         |
  |  Token contiene:        |
  |  preferred_username:    |
  |    "jperez"             |
  |                         |
  |  8. signInResolver      |
  |     lee "jperez"        |
  |                         |
  |  9. Busca en Catalogo:  |
  |     User:default/jperez |
  |                         |
  |  10. Crea sesion        |
  +-------------------------+
     |
     | "Bienvenido, Juan!"
     v
  JUAN esta dentro
```
