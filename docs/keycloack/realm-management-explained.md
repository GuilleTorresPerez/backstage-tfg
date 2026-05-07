# realm-management: El Client Especial del Sistema

> **Por que `realm-management` es un client y por que sus roles son client roles.**

---

## La pregunta que lo originó todo

> *"`realm-management` se supone que es una tarjeta de identidad (client), pero tambien define roles. En el login, los roles se le ponen directamente al usuario. Pero en la sincronizacion pasan a traves de este client... es como que las definiciones me chirrian."*

La respuesta: **Keycloak modela los permisos de administracion como client roles de un client especial interno.** No es una inconsistencia; es una decision de arquitectura.

---

## 1. Los dos universos de permisos en Keycloak

Keycloak separa rigurosamente dos tipos de permisos:

| Tipo | Analogia | ¿Que controla? | ¿Donde se definen? |
|------|----------|----------------|--------------------|
| **Realm Roles** | Carnets de empleado generales | Acceso a **tu aplicacion** (Backstage) | Directamente en el realm |
| **Client Roles** | Carnets de departamento | Acceso a **otras aplicaciones** | Dentro de cada client |

Pero hay una excepcion: **el propio Keycloak tambien es una "aplicacion"**... la aplicacion de administracion.

---

## 2. realm-management es el "client del sistema"

```
REALM: aragon-idp
|
|-- CLIENT: backstage
|   |-- Para redirigir humanos al login
|   +-- No define roles de administracion
|
|-- CLIENT: backstage-sync
|   |-- Para autenticar robots
|   +-- No define roles de administracion
|
+-- CLIENT: realm-management  <-- ¡ESTE ES EL CLIENT DE KEYCLOAK!
    |-- Representa la API de administracion de Keycloak
    |-- Es INTERNO. No es para usuarios humanos.
    +-- DEFINE client roles:
        |-- view-users      (puede ver fichas de empleados)
        |-- view-groups     (puede ver departamentos)
        |-- query-users     (puede buscar en listado)
        |-- query-groups    (puede buscar departamentos)
        |-- manage-users    (puede crear/borrar empleados)
        |-- manage-realm    (puede configurar el barrio)
        +-- ...
```

> **Memoria:** `realm-management` no es "un departamento mas". Es el **Departamento de Sistemas del propio Keycloak**. Sus carnets son permisos para operar sobre la ciudad, no para salir de ella.

---

## 3. ¿Por que no son realm roles?

Si `view-users` fuera un realm role, significaria:

```
REALM ROLES (carnets generales)
|
+-- default-roles-aragon-idp   <- Lo llevan TODOS los empleados
+-- offline_access             <- Lo pueden llevar algunos
+-- view-users                 <- ¡¿Lo llevarian TODOS?! Desastre.
```

**Problema:** Los realm roles son "del barrio". Si `view-users` fuera un realm role, todo usuario humano tendria acceso a leer el directorio completo.

**Solucion de Keycloak:** Modelar los permisos de administracion como **client roles de `realm-management`**, para que:
1. **No se mezclen** con los roles de negocio de tu aplicacion.
2. **Se asignen de forma granular**: solo a quien los necesite (robots de sincronizacion).
3. **Se agrupen logicamente**: estan bajo el "client del sistema".

---

## 4. Comparacion de los dos flujos

### Flujo de Login (Usuario Humano)

```
Juan (jperez)
|
+-- Realm Roles: [default-roles-aragon-idp, offline_access]
|   |-- Carnets generales de empleado
|   +-- Van en su token OIDC
|
+-- Client Roles de 'backstage': [ninguno]
|   +-- La app 'backstage' (publica) no define roles de admin
|
+-- Client Roles de 'realm-management': [ninguno]
    +-- Juan NO es admin del sistema. No necesita leer el directorio.
```

> **Juan solo tiene realm roles porque solo necesita ENTRAR a Backstage.**

---

### Flujo de Sincronizacion (Service Account)

```
ROBOT (service-account-backstage-sync)
|
+-- Realm Roles: [] (vacio)
|   +-- No necesita ser "empleado" del realm en el sentido humano
|
+-- Client Roles de 'backstage-sync': [ninguno propio]
|   +-- 'backstage-sync' no define roles propios de admin
|
+-- Client Roles de 'realm-management': [view-users, view-groups, query-users, query-groups]
    |-- Necesita acceder a la API de administracion de Keycloak
    |-- Los pide PRESTADOS al client 'realm-management'
    +-- Keycloak le da acceso a leer el directorio
```

> **El robot no tiene realm roles. Tiene client roles PRESTADOS de `realm-management`.**

---

## 5. La analogia completa

Imagina una empresa con dos tipos de carnets:

### Carnets de empleado (Realm Roles)
- `default-roles-aragon-idp` = Carnet basico de acceso a la oficina
- Se los da RRHH (el realm) directamente al empleado
- Sirven para COSAS GENERALES de la empresa

### Carnets de departamento (Client Roles)
Cada departamento (client) tiene sus propios carnets:

- **Client `backstage`** = Porteria de entrada
  - No emite carnets de admin. Solo deja pasar.

- **Client `backstage-sync`** = Sistema de control de acceso
  - No emite carnets de admin. Su robot los PIDE a otro sitio.

- **Client `realm-management`** = **Departamento de Sistemas / Seguridad**
  - `view-users` = "Puedo consultar el archivo de empleados"
  - `manage-users` = "Puedo dar de alta/baja empleados"
  - `view-groups` = "Puedo ver la estructura de departamentos"
  - Solo el personal autorizado lleva estos carnets.

> **Memoria:** Los realm roles son carnets de empleado generales. Los client roles de `realm-management` son carnets del Departamento de Sistemas. Un robot puede llevar carnets de varios departamentos si necesita acceso a sus sistemas.

---

## 6. ¿Quien habla con Keycloak en cada caso?

### Login: El humano entra a Backstage
```
Juan (humano)
  |
  | "Soy jperez, mi contraseña es changeme"
  v
Keycloak
  |
  | "Token para jperez con sus realm roles"
  v
Backstage (app)
  |
  | "Bienvenido, Juan"
```

### Sincronizacion: El robot lee el directorio
```
Plugin de Backstage
  |
  | "Soy la app backstage-sync, mi secret es ***"
  v
Keycloak
  |
  | "Token para service-account-backstage-sync"
  v
Plugin de Backstage (con token del robot)
  |
  | "Soy service-account-backstage-sync (segun el token)"
  | "Dame la lista de usuarios"
  v
Keycloak
  |
  | "Veo que llevas el carnet view-users de realm-management"
  | "Permitido. Aqui esta la lista."
```

> **Memoria:** El humano entra con sus carnets de empleado. El robot entra con los carnets del Departamento de Sistemas que ha pedido prestados.

---

## 7. Tabla resumen

| Entidad | Flujo de Login | Flujo de Sincronizacion |
|---------|----------------|-------------------------|
| **Actor** | Usuario humano (`jperez`) | Robot (`service-account-backstage-sync`) |
| **Autenticacion** | Usuario + password | Client credentials (`client_id` + `secret`) |
| **Roles en token** | Realm roles (`default-roles...`) | Client roles de `realm-management` (`view-users`...) |
| **Objetivo** | Entrar a Backstage | Leer el directorio de Keycloak |
| **¿Por que `realm-management`?** | No aplica | Porque leer el directorio es una operacion de ADMINISTRACION del sistema |

---

## 8. Frases clave para recordar

1. **`realm-management` es el "client del sistema". Representa la API de administracion de Keycloak.**
2. **Los client roles de `realm-management` son permisos para operar sobre Keycloak, no sobre tu aplicacion.**
3. **Si `view-users` fuera un realm role, todos los usuarios leerian el directorio. Por eso es un client role.**
4. **El robot `service-account-backstage-sync` lleva carnets del Departamento de Sistemas (`realm-management`) para hacer su trabajo de sincronizacion.**
5. **Las tarjetas (clients) no tienen permisos. Los usuarios (humanos o robots) llevan los carnets (roles).**
