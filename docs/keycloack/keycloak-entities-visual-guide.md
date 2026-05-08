# Guia Visual de Entidades Keycloak

## La Gran Frase
> **"Las aplicaciones no tienen permisos. Solo los usuarios tienen permisos."**

---

## 1. Keycloak es la ciudad

```
+-----------------------------------------------------+
|                    KEYCLOAK                         |
|                   (La Ciudad)                       |
|          Aqui viven todas las identidades           |
+-----------------------------------------------------+
```

> **Memoria:** Keycloak no es una aplicacion, es la ciudad donde viven todos los actores.

---

## 2. El Realm es el barrio cerrado

```
+-----------------------------------------------------+
|                    KEYCLOAK                         |
|  +-----------------------------------------------+  |
|  |         REALM: aragon-idp                     |  |
|  |           (El Barrio Cerrado)                 |  |
|  |                                               |  |
|  |  Todo lo que hay aqui no sale de aqui.        |  |
|  |  Los vecinos de otros barrios no existen.     |  |
|  +-----------------------------------------------+  |
+-----------------------------------------------------+
```

> **Memoria:** Un realm es un universo paralelo. Cada barrio tiene sus propias casas, llaves y porteros.

---

## 3. Los Clients son las tarjetas de identidad

```
+-----------------------------------------------------+
|              REALM: aragon-idp                      |
|                                                     |
  |  +--------------+  +--------------+  +------------------+   |
  |  |   backstage  |  |backstage-sync|  | realm-management |   |
  |  |  (Tarjeta    |  |  (Tarjeta    |  |  (Client del     |   |
  |  |   Publica)   |  | Confidencial)|  |   Sistema)       |   |
  |  +--------------+  +--------------+  +------------------+   |
|                                                     |
|   > "Soy backstage"      > "Soy backstage-sync"    |
|     No tengo secreto.      Mi secreto es: ***       |
|     Solo redirijo.         Soy un robot.            |
+-----------------------------------------------------+
```

> **Memoria:** Un client es una tarjeta de identidad, no una persona. Solo dice "quien pregunta", no "que puede hacer".

> **Memoria:** Las tarjetas publicas no guardan secretos; las confidenciales si.

---

## 4. Los Usuarios son las personas (humanas o robots)

```
+-----------------------------------------------------+
|              REALM: aragon-idp                      |
|                                                     |
|   USUARIOS HUMANOS              USUARIO ROBOT       |
|                                                     |
|   +--------------+                +----------------+  |
|   |   jperez     |                | service-account|  |
|   |   agarcia    |                | -backstage-sync|  |
|   |   msanchez   |                +----------------+  |
|   +--------------+                                  |
|                                                     |
|   Contrasena: changeme        No tiene contrasena.  |
|                               Se autentica con el   |
|                               secret de su app.     |
+-----------------------------------------------------+
```

> **Memoria:** Las aplicaciones no tienen permisos. Solo los usuarios tienen permisos. El robot es un usuario sin carne.

---

## 5. Los Roles son los carnets de acceso

```
+-----------------------------------------------------+
|              REALM: aragon-idp                      |
|                                                     |
|   ROLES DEL REALM (carnets generales)               |
|      * default-roles-aragon-idp  <- Lo lleva todo   |
|      * offline_access                               |
|      * uma_authorization                            |
|                                                     |
|   ROLES DEL CLIENT realm-management (carnets del SISTEMA) |
|      * view-users        <- Ver ficha completa (API admin) |
|      * view-groups       <- Ver departamentos (API admin)  |
|      * query-users       <- Buscar en listado (API admin)  |
|      * query-groups      <- Buscar departamentos (API admin)|
|                                                     |
+-----------------------------------------------------+
```

> **Memoria:** Los roles son carnets. Unos son del barrio (realm), otros son del departamento (client).

---

## 6. Quien lleva que carnet

```
+-----------------------------------------------------+
|   QUIEN LLEVA QUE CARNET?                           |
|                                                     |
|   jperez (humano)                                   |
|      |-> default-roles-aragon-idp                   |
|      |-> offline_access                             |
|      |-> groups: /developers                        |
|                                                     |
|   service-account-backstage-sync (robot)            |
|      |-> view-users  --|                            |
|      |-> view-groups   |---> "Llevo carnets del     |
|      |-> query-users   |      Sistema"              |
|      |-> query-groups --|     (realm-management)    |
|                                                     |
|   backstage (tarjeta publica)                       |
|      |-> No lleva carnets. Solo redirige.           |
|                                                     |
|   backstage-sync (tarjeta confidencial)             |
|      |-> No lleva carnets. Su robot los lleva.      |
|                                                     |
+-----------------------------------------------------+
```

> **Memoria:** Los usuarios humanos llevan carnets del barrio (realm roles). Los robots llevan carnets del Sistema (`realm-management`). Las tarjetas (clients) no llevan nada.

---

## 8. Tabla resumen de entidades

| Entidad           | Que es                          | Ejemplo                          | Tiene permisos? |
|-------------------|---------------------------------|----------------------------------|-----------------|
| **Keycloak**      | La ciudad                       | El servidor en localhost:8081    | -               |
| **Realm**         | El barrio cerrado               | `aragon-idp`                     | -               |
| **Client**        | La tarjeta de identidad         | `backstage`, `backstage-sync`, `realm-management` | No              |
| **Usuario humano**| La persona                      | `jperez`                         | Si (realm roles)|
| **Service Account**| El robot                       | `service-account-backstage-sync` | Si (client roles)|
| **Role**          | El carnet de acceso             | `view-users`, `default-roles...` | -               |
| **Group**         | El departamento                 | `/developers`                    | -               |

---

## 9. Frases para recordar

1. **"Las aplicaciones no tienen permisos. Solo los usuarios tienen permisos."**
2. **"Un client es una tarjeta de identidad, no una persona."**
3. **"Las tarjetas publicas no guardan secretos; las confidenciales si."**
4. **"realm-management es el 'client del sistema' de Keycloak. Sus roles son permisos de administracion."**
5. **"El Service Account es el robot que actua en nombre de la aplicacion."**
6. **"Los usuarios humanos llevan carnets del barrio; los robots llevan carnets del Sistema (`realm-management`)."**
7. **"backstage redirige; backstage-sync lee."**
8. **"Un realm es un universo paralelo."**
