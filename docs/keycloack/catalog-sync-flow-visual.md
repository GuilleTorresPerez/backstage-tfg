# Flujo de Sincronizacion del Catalogo: backstage-sync

> **Ignoramos el flujo de login. Solo sincronizacion de usuarios/grupos.**

---

## 0. Las entidades ANTES de empezar

Ya estan creadas en Keycloak y Backstage antes de que la sincronizacion se ejecute:

```
KEYCLOAK (aragon-idp)
|
|-- CLIENT (Tarjeta Confidencial)
|   |
|   +-- backstage-sync
|       |-- clientId: "backstage-sync"
|       |-- publicClient: false
|       |-- secret: "backstage-sync-secret-change-me"
|       |-- serviceAccountsEnabled: true
|       |-- standardFlowEnabled: false
|       +-- NO redirige. NO es para humanos.
|
|-- CLIENT (Departamento RRHH)
|   |
|   +-- realm-management
|       +-- Define CLIENT ROLES:
|           |-- view-users
|           |-- view-groups
|           |-- query-users
|           +-- query-groups
|
|-- SERVICE ACCOUNT (Robot creado automaticamente)
|   |
|   +-- service-account-backstage-sync
|       |-- username: "service-account-backstage-sync"
|       |-- enabled: true
|       |-- NO tiene contrasena
|       |-- clientRoles:
|       |   +-- realm-management:
|       |       |-- view-users
|       |       |-- view-groups
|       |       |-- query-users
|       |       +-- query-groups
|       +-- groups: []
|
|-- USUARIOS HUMANOS
|   |
|   |-- jperez
|   |   |-- groups: ["/equipo-frontend"]
|   |   +-- realmRoles: ["default-roles-aragon-idp"]
|   |
|   |-- agarcia
|   |   |-- groups: ["/platform-admins"]
|   |   +-- realmRoles: ["default-roles-aragon-idp"]
|   |
|   |-- msanchez
|   |   |-- groups: ["/security-reviewers"]
|   |   +-- realmRoles: ["default-roles-aragon-idp"]
|   |
|   |-- mgarcia
|   |   |-- groups: ["/equipo-frontend", "/security-reviewers"]
|   |   +-- realmRoles: ["default-roles-aragon-idp"]
|   |
|   |-- lruiz
|   |   |-- groups: ["/equipo-spring"]
|   |   +-- realmRoles: ["default-roles-aragon-idp"]
|   |
|   +-- jgomez
|       |-- groups: ["/equipo-spring"]
|       +-- realmRoles: ["default-roles-aragon-idp"]
|
|-- GRUPOS
|   |
|   |-- equipo-frontend
|   |-- equipo-spring
|   |-- platform-admins
|   +-- security-reviewers
|
+-- ROLES DEL REALM
    |
    +-- default-roles-aragon-idp
```

```
BACKSTAGE
|
|-- BACKEND (Node.js)
|   |
|   |-- Plugin: catalog-backend-module-keycloak
|   |   |-- Lee la config: catalog.providers.keycloakOrg
|   |   |-- Conecta con Keycloak como backstage-sync
|   |   |-- Pide lista de usuarios y grupos
|   |   +-- Crea/actualiza entidades User y Group
|   |
|   +-- Config (app-config.yaml):
|       |
|       +-- catalog.providers.keycloakOrg:
|           |-- baseUrl: http://localhost:8081
|           |-- realm: aragon-idp
|           |-- loginRealm: aragon-idp
|           |-- clientId: backstage-sync
|           |-- clientSecret: ${KEYCLOAK_BACKSTAGE_SYNC_SECRET}
|           +-- schedule: cada 30 minutos
|
+-- CATALOGO (SQLite en memoria)
    |
    |-- (Aun vacio o desactualizado antes de la primera sync)
```

> **Memoria:** Antes de empezar, Keycloak tiene al robot con su tarjeta y sus carnets de RRHH. Backstage sabe donde encontrar a Keycloak y con que credenciales.

---

## 1. Backstage decide: "Toca sincronizar"

```
+-----------------------------------------------------------+
|  BACKSTAGE BACKEND                                        |
|  (localhost:7007)                                         |
|                                                           |
|  Plugin: catalog-backend-module-keycloak                  |
|                                                           |
|  +--------------------------------------------------+     |
|  |  Planificador (cada 30 minutos)                  |     |
|  |                                                  |     |
|  |  [00:00] OK                                      |     |
|  |  [00:30] OK                                      |     |
|  |  [01:00] -> "Toca sincronizar ahora"             |     |
|  +--------------------------------------------------+     |
|                                                           |
|  Entidad activa: El plugin de Keycloak (programa)         |
+-----------------------------------------------------------+
```

> **Entidades:**
> - **Plugin:** `catalog-backend-module-keycloak` (quien inicia)
> - **Schedule:** Configurado en `app-config.yaml`

> **Memoria:** El plugin es un despertador. Cada 30 minutos se despierta y dice: "Voy a mirar si Keycloak tiene usuarios nuevos."

---

## 2. El plugin pide un token usando las credenciales de backstage-sync

```
  PLUGIN KEYCLOAK (Backstage)           KEYCLOAK
  (localhost:7007)                      (localhost:8081)
       |                                     |
       |  "Hola Keycloak."                   |
       |  "Soy la aplicacion backstage-sync" |
       |  "Mi client_id es: backstage-sync"  |
       |  "Mi secret es: ***"                |
       |  "Dame un token para mi robot."     |
       |------------------------------------>|
       |                                     |
       |  Keycloak valida:                   |
       |  - "¿Existe backstage-sync?" -> Si  |
       |  - "¿El secret coincide?" -> Si     |
       |  - "¿Tiene service account?" -> Si  |
       |                                     |
       |  "OK. Genero token para el robot    |
       |   asociado a esta aplicacion."      |
       |                                     |
       |<------------------------------------|
       |  "Token valido para                |
       |   service-account-backstage-sync"   |
       |                                     |
```

**Backstage envia:**
- `client_id: backstage-sync`
- `client_secret: backstage-sync-secret-change-me`
- `grant_type: client_credentials`

**Keycloak valida:**
- "¿Existe `backstage-sync`?" -> Si.
- "¿El secret coincide?" -> Si.
- "¿Tiene service account?" -> Si.
- "¿La cuenta de servicio esta habilitada?" -> Si.

**Keycloak genera un token para el service account:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 300
}
```

**Dentro del token JWT hay:**
```json
{
  "sub": "service-account-backstage-sync",
  "preferred_username": "service-account-backstage-sync"
}
```

> **Entidades:**
> - **Client:** `backstage-sync` (presenta sus credenciales: clientId + secret)
> - **Service Account:** `service-account-backstage-sync` (quien recibe el token y aparece en el JWT)

> **Memoria:** La empresa `backstage-sync` presenta su CIF y firma autorizada. Keycloak le da un pase de acceso a su empleado robot `service-account-backstage-sync`. **La empresa no entra; entra el robot con el pase.**

> **⚠️ Distingue bien:**
> - En el **paso 2**, el **plugin presenta las credenciales de la aplicación** (`client_id` + `client_secret`).
> - En los **pasos 3 y 4**, el **plugin lleva el token que identifica al robot** (`service-account-backstage-sync`).
> - **La aplicación nunca habla en primera persona con Keycloak después de pedir el token.** Siempre habla a través del token de su robot.

---

## 3. El plugin usa el token para pedir la lista de usuarios

```
  PLUGIN KEYCLOAK (Backstage)           KEYCLOAK
  (localhost:7007)                      (localhost:8081)
       |                                     |
       |  "Hola, llevo un token:"            |
       |  "Authorization: Bearer eyJ..."     |
       |                                     |
       |  [Keycloak lee el token:]           |
       |  "Sub: service-account-backstage-   |
       |   sync"                             |
       |  "Dame todos los usuarios del realm"|
       |------------------------------------>|
       |                                     |
       |  Keycloak mira el token:            |
       |  - Sub: service-account-backstage-sync
       |  - Roles: view-users, query-users   |
       |  - "Este robot tiene permiso de     |
       |     RRHH para ver empleados? Si."   |
       |                                     |
       |<------------------------------------|
       |  "Aqui tienes la lista:"            |
       |  [jperez, agarcia, msanchez,        |
       |   mgarcia, lruiz, jgomez, ...]      |
       |                                     |
```

**Peticion a la API de Keycloak:**
```
GET /admin/realms/aragon-idp/users
Authorization: Bearer <token>
```

**Respuesta:**
```json
[
  {
    "id": "d32f511e-...",
    "username": "jperez",
    "firstName": "Juan",
    "lastName": "Perez",
    "email": "jperez@aragon.es",
    "enabled": true,
    "groups": ["/equipo-frontend"]
  },
  {
    "id": "5d758e24-...",
    "username": "agarcia",
    "firstName": "Ana",
    "lastName": "Garcia",
    "email": "agarcia@aragon.es",
    "enabled": true,
    "groups": ["/platform-admins"]
  },
  {
    "id": "407d8364-...",
    "username": "lruiz",
    "firstName": "Laura",
    "lastName": "Ruiz",
    "email": "lruiz@aragon.es",
    "enabled": true,
    "groups": ["/equipo-spring"]
  }
]
```

> **Entidades:**
> - **Service Account:** `service-account-backstage-sync` (quien pregunta)
> - **Client Roles:** `view-users`, `query-users` (los carnets que permite la peticion)
> - **Usuarios:** Todos los humanos del realm (lo que devuelve Keycloak)

> **Memoria:** El robot muestra su pase de RRHH. Keycloak le deja ver el archivo de empleados.

---

## 4. El plugin usa el token para pedir la lista de grupos

```
  PLUGIN KEYCLOAK (Backstage)           KEYCLOAK
  (localhost:7007)                      (localhost:8081)
       |                                     |
       |  "Llevo el mismo token:"            |
       |  "Authorization: Bearer eyJ..."     |
       |  "Ahora dame todos los grupos."     |
       |------------------------------------>|
       |                                     |
       |  Keycloak mira el token:            |
       |  - Sub: service-account-backstage-sync
       |  - Roles: view-groups, query-groups |
       |  - "Este robot tiene permiso de     |
       |     RRHH para ver departamentos?    |
       |     Si."                            |
       |                                     |
       |<------------------------------------|
       |  "Aqui tienes la lista:"            |
       |  [equipo-frontend, equipo-spring,   |
       |   platform-admins, ...]             |
       |                                     |
```

**Peticion a la API de Keycloak:**
```
GET /admin/realms/aragon-idp/groups
Authorization: Bearer <token>
```

**Respuesta:**
```json
[
  {
    "id": "90b0913c-...",
    "name": "equipo-frontend",
    "path": "/equipo-frontend"
  },
  {
    "id": "db9c171f-...",
    "name": "equipo-spring",
    "path": "/equipo-spring"
  },
  {
    "id": "2ac126ad-...",
    "name": "platform-admins",
    "path": "/platform-admins"
  },
  {
    "id": "c136d9f9-...",
    "name": "security-reviewers",
    "path": "/security-reviewers"
  }
]
```

> **Entidades:**
> - **Service Account:** `service-account-backstage-sync` (quien pregunta)
> - **Client Roles:** `view-groups`, `query-groups` (los carnets que permite la peticion)
> - **Grupos:** Todos los grupos del realm (lo que devuelve Keycloak)

> **Memoria:** El robot muestra su pase de RRHH otra vez. Keycloak le deja ver el archivo de departamentos.

---

## 5. El plugin transforma datos de Keycloak en entidades de Backstage

```
+-----------------------------------------------------------+
|  PLUGIN KEYCLOAK (Backstage)                              |
|                                                           |
|  Datos recibidos de Keycloak -> Entidades del Catalogo    |
|                                                           |
|  Usuario jperez                                           |
|    username: "jperez"                                     |
|    email: "jperez@aragon.es"                              |
|    firstName: "Juan"                                      |
|    lastName: "Perez"                                      |
|    groups: ["/equipo-frontend"]                           |
|       |                                                   |
|       v                                                   |
|  +--------------------------------------------------+     |
|  |  ENTIDAD: User:default/jperez                    |     |
|  |                                                  |     |
|  |  apiVersion: backstage.io/v1alpha1               |     |
|  |  kind: User                                      |     |
|  |  metadata:                                       |     |
|  |    name: jperez                                  |     |
|  |  spec:                                           |     |
|  |    profile:                                      |     |
|  |      displayName: Juan Perez                     |     |
|  |      email: jperez@aragon.es                     |     |
|  |    memberOf: [group:default/equipo-frontend]    |     |
|  +--------------------------------------------------+     |
|                                                           |
|  Grupo equipo-frontend                                    |
|    name: "equipo-frontend"                                |
|    path: "/equipo-frontend"                               |
|       |                                                   |
|       v                                                   |
|  +--------------------------------------------------+     |
|  |  ENTIDAD: Group:default/equipo-frontend          |     |
|  |                                                  |     |
|  |  apiVersion: backstage.io/v1alpha1               |     |
|  |  kind: Group                                     |     |
|  |  metadata:                                       |     |
|  |    name: equipo-frontend                         |     |
|  |  spec:                                           |     |
|  |    type: team                                    |     |
|  |    children: []                                  |     |
|  +--------------------------------------------------+     |
+-----------------------------------------------------------+
```

**Mapeo de campos:**

| Campo Keycloak | Campo Entidad Backstage |
|----------------|-------------------------|
| `username` | `metadata.name` (User) |
| `firstName` + `lastName` | `spec.profile.displayName` |
| `email` | `spec.profile.email` |
| `groups` | `spec.memberOf` |
| `name` (grupo) | `metadata.name` (Group) |

> **Entidades:**
> - **Datos crudos:** JSON de usuarios y grupos de Keycloak
> - **Entidades Backstage:** `User` y `Group` (formato YAML/JSON del catalogo)

> **Memoria:** El plugin es un traductor. Convierte la "lista de empleados de RRHH" al "formato de tarjetas de Backstage".

---

## 6. El plugin escribe/actualiza las entidades en el Catalogo

```
  PLUGIN KEYCLOAK (Backstage)           CATALOGO BACKSTAGE
  (localhost:7007)                      (SQLite en memoria)
       |                                     |
       |  "Registra estas entidades:"        |
       |  - User:default/jperez              |
       |  - User:default/agarcia             |
       |  - User:default/msanchez            |
       |  - User:default/mgarcia             |
       |  - User:default/lruiz               |
       |  - User:default/jgomez              |
       |  - Group:default/equipo-frontend    |
       |  - Group:default/equipo-spring      |
       |  - Group:default/platform-admins    |
       |  - Group:default/security-reviewers |
       |------------------------------------>|
       |                                     |
       |<------------------------------------|
       |  "Entidades registradas.            |
       |   Actualizadas si ya existian."     |
       |                                     |
```

**El Catalogo de Backstage ahora contiene:**
```
CATALOGO DE BACKSTAGE (SQLite)
|
|-- User:default/jperez
|   |-- spec.profile.displayName: "Juan Perez"
|   |-- spec.profile.email: "jperez@aragon.es"
|   +-- spec.memberOf: ["group:default/equipo-frontend"]
|
|-- User:default/agarcia
|   |-- spec.profile.displayName: "Ana Garcia"
|   |-- spec.profile.email: "agarcia@aragon.es"
|   +-- spec.memberOf: ["group:default/platform-admins"]
|
|-- User:default/msanchez
|   |-- spec.profile.displayName: "Maria Sanchez"
|   |-- spec.profile.email: "msanchez@aragon.es"
|   +-- spec.memberOf: ["group:default/security-reviewers"]
|
|-- User:default/mgarcia
|   |-- spec.profile.displayName: "Manuel Garcia"
|   |-- spec.profile.email: "mgarcia@aragon.es"
|   +-- spec.memberOf: ["group:default/equipo-frontend",
|                       "group:default/security-reviewers"]
|
|-- User:default/lruiz
|   |-- spec.profile.displayName: "Laura Ruiz"
|   |-- spec.profile.email: "lruiz@aragon.es"
|   +-- spec.memberOf: ["group:default/equipo-spring"]
|
|-- User:default/jgomez
|   |-- spec.profile.displayName: "Javier Gomez"
|   |-- spec.profile.email: "jgomez@aragon.es"
|   +-- spec.memberOf: ["group:default/equipo-spring"]
|
|-- Group:default/equipo-frontend
|   +-- spec.type: "team"
|
|-- Group:default/equipo-spring
|   +-- spec.type: "team"
|
|-- Group:default/platform-admins
|   +-- spec.type: "team"
|
+-- Group:default/security-reviewers
    +-- spec.type: "team"
```

> **Entidades:**
> - **Catalogo:** Ahora contiene entidades `User` y `Group` sincronizadas
> - **Relaciones:** `jperez` pertenece a `equipo-frontend`, `agarcia` a `platform-admins`, `lruiz` y `jgomez` a `equipo-spring`, etc.

> **Memoria:** El catalogo es la agenda de contactos de Backstage. Ahora tiene copiados todos los empleados y departamentos de RRHH.

---

## 7. El Catalogo ya esta listo para el login

```
+-----------------------------------------------------------+
|  CATALOGO DE BACKSTAGE                                    |
|                                                           |
|  +--------------------------------------------------+     |
|  |  Entidades disponibles para login                |     |
|  |                                                  |     |
|  |  Cuando Juan inicie sesion con OIDC:             |     |
|  |                                                  |     |
|  |  signInResolver busca: User:default/jperez       |     |
|  |  -> ENCONTRADO                                   |     |
|  |  -> Juan puede entrar                            |     |
|  |  -> Se sabe que es del grupo equipo-frontend     |     |
|  |                                                  |     |
|  |  Si no estuviera sincronizado:                   |     |
|  |  -> User:default/jperez NO EXISTE                |     |
|  |  -> Juan NO puede entrar (error 401)             |     |
|  +--------------------------------------------------+     |
+-----------------------------------------------------------+
```

> **Entidades:**
> - **Login OIDC:** Depende de que estas entidades existan
> - **Usuario:** `jperez` solo puede entrar si `User:default/jperez` existe en el catalogo

> **Memoria:** El catalogo sincronizado es la lista de invitados. Si tu nombre no esta en la lista, el portero no te deja entrar.

---

## Resumen del flujo (una linea por paso)

| Paso | Quien actua | Que hace | Entidades clave |
|------|-------------|----------|-----------------|
| 1 | Planificador Backstage | "Toca sincronizar" (cada 30 min) | Plugin `catalog-backend-module-keycloak`, Schedule |
| 2 | Plugin Keycloak | Presenta credenciales de `backstage-sync` y pide token | Client `backstage-sync`, Secret |
| 3 | Plugin Keycloak (con token del robot) | Pide lista de usuarios | Service Account `service-account-backstage-sync`, Client Roles `view-users`, `query-users` |
| 4 | Plugin Keycloak (con token del robot) | Pide lista de grupos | Service Account `service-account-backstage-sync`, Client Roles `view-groups`, `query-groups` |
| 5 | Plugin Keycloak | Transforma JSON de Keycloak en entidades | Datos crudos -> Entidades `User`/`Group` |
| 6 | Plugin Keycloak | Escribe entidades en el Catalogo | Catalogo Backstage (SQLite) |
| 7 | Catalogo | Listo para que el login funcione | Entidades `User`/`Group` disponibles |

---

## Diagrama completo resumido

```
  PLANIFICADOR BACKSTAGE
  "Cada 30 minutos..."
     |
     | 1. "Toca sincronizar"
     v
  +-------------------------+
  |  PLUGIN KEYCLOAK        |
  |  (catalog-backend-      |
  |   module-keycloak)      |
  |                         |
  |  2. Presenta credencia- |
  |     les de backstage-   |
  |     sync:               |
  |     client_id + secret  |
  +-------------------------+
     |
     | "Soy la aplicacion"
     | "backstage-sync"
     | "Secret: ***"
     | "Dame token para mi robot"
     v
  +-------------------------+
  |  KEYCLOAK               |
  |  (localhost:8081)       |
  |                         |
  |  Valida:                |
  |  - Client: backstage-sync
  |  - Secret: OK           |
  |  - Service Account: OK  |
  |                         |
  |  Genera TOKEN para:     |
  |  service-account-       |
  |  backstage-sync         |
  +-------------------------+
     |
     | "Token: eyJ..."
     | "Sub: service-account-"
     | "    backstage-sync"
     v
  +-------------------------+
  |  PLUGIN KEYCLOAK        |
  |  (Backstage)            |
  |  (lleva el token del    |
  |   robot)                |
  |                         |
  |  3. "Dame usuarios"     |
  |     [Token identifica   |
  |      al robot]          |
  |-----------------------> |
  |  KEYCLOAK               |
  |  "Aqui: jperez,        |
  |   agarcia, msanchez,   |
  |   mgarcia, lruiz,      |
  |   jgomez..."           |
  |<----------------------- |
  |                         |
  |  4. "Dame grupos"       |
  |     [Token identifica   |
  |      al robot]          |
  |-----------------------> |
  |  KEYCLOAK               |
  |  "Aqui: equipo-        |
  |   frontend, equipo-    |
  |   spring, platform-    |
  |   admins..."           |
  |<----------------------- |
  +-------------------------+
     |
     | 5. Transforma datos
     |    en entidades
     v
  +-------------------------+
  |  CATALOGO BACKSTAGE     |
  |  (SQLite en memoria)    |
  |                         |
  |  6. Registra/Actualiza: |
  |     User:default/jperez |
  |     User:default/agarcia|
  |     User:default/lruiz  |
  |     User:default/jgomez |
  |     Group:default/...   |
  |                         |
  |  7. Listo para login    |
  +-------------------------+
     |
     | "Catalogo actualizado"
     v
  PROXIMA SINCRONIZACION
  en 30 minutos
```

---

## Relacion con el flujo de login

```
SINCRONIZACION (backstage-sync)          LOGIN (backstage)
     |                                          |
     | Paso 6                                   | Paso 9
     | Crea entidades                           | Busca entidades
     v                                          v
  +------------------+                    +------------------+
  | Catalogo Backstage|  <-------------->  | Catalogo Backstage|
  | User:default/...  |    "¿Existe      | User:default/...  |
  | Group:default/... |     jperez?"     | Group:default/... |
  +------------------+                    +------------------+
     |                                          |
     | "Entidad creada"                         | "Entidad encontrada"
     v                                          v
  Listo para ser usada                      Juan entra
```

> **La frase mas importante:**
> **"La sincronizacion es como copiar la lista de invitados de RRHH a la agenda del portero. El login es cuando el portero mira la agenda para dejar pasar a alguien. Sin la sincronizacion, la agenda esta vacia y nadie entra."**
