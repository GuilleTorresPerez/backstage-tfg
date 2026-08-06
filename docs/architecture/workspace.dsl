workspace "Prototipo IDP Backstage — Modelo C4" "Modelo C4 del prototipo de portal interno de desarrolladores del TFG: contexto, contenedores, componentes del backend y flujo de trabajo post-generación. Cada elemento tiene respaldo en el código del repositorio." {

    !identifiers hierarchical

    model {

        // ==========================================================
        // Actores. Los tres perfiles son literales del código:
        // packages/backend/src/permission-policy.ts:17
        // Los roles son acumulativos, no excluyentes.
        // ==========================================================
        developer = person "Desarrollador" "Consume el catálogo y genera componentes desde las plantillas." "Actor"
        platformAdmin = person "Administrador de plataforma" "Mantiene el catálogo y la política de permisos." "Actor"
        securityReviewer = person "Revisor de seguridad" "Revisa el registro de auditoría y el estado del catálogo." "Actor"

        // ==========================================================
        // El artefacto
        // ==========================================================
        idp = softwareSystem "Portal interno de desarrolladores" "Artefacto del TFG: punto único de entrada al catálogo, a los caminos guiados y a la documentación." "IDP" {

            // --- Nivel 2: contenedores ---
            webApp = container "Aplicación web" "Portal del desarrollador, con tema visual DESY y la interfaz propia de auditoría." "React 18, TypeScript, Material UI v4" "WebApp"

            database = container "Base de datos" "Instancia compartida en la que cada plugin dispone de su propia base lógica." "PostgreSQL 17" "Database"

            // --- Nivel 3: componentes del backend, agrupados por grado de
            //     aportación propia (packages/backend/src/index.ts).
            backend = container "Backend" "Aloja los plugins del portal y expone su API." "Node.js, Express, TypeScript" "App" {

                group "De serie" {
                    search = component "Búsqueda" "Indexa el catálogo y la documentación." "@backstage/plugin-search-backend" "DeSerie"
                    notifications = component "Notificaciones y señales" "Avisa al solicitante cuando la generación termina." "@backstage/plugin-notifications-backend, -signals-backend" "DeSerie"
                    techdocs = component "Servicio de documentación" "Sirve los documentos ya publicados; no los construye." "@backstage/plugin-techdocs-backend" "DeSerie"
                }

                group "Extendidos con módulo propio" {
                    catalog = component "Catálogo" "Inventario del portal: descubre los repositorios del grupo de la organización y sincroniza usuarios y grupos." "@backstage/plugin-catalog-backend" "Extendido"
                    auth = component "Autenticación e identidad" "Gestiona el inicio de sesión OIDC y emite los tokens del portal." "@backstage/plugin-auth-backend" "Extendido"
                    scaffolder = component "Generador de repositorios" "Ejecuta las plantillas: crea el repositorio, da de alta la entidad y avisa." "@backstage/plugin-scaffolder-backend" "Extendido"
                    permission = component "Permisos" "Punto de decisión: consulta la política ante cada petición." "@backstage/plugin-permission-backend" "Extendido"
                }

                group "Propios del TFG" {
                    validator = component "Validador del catálogo" "Rechaza las entidades que no cumplen las listas admitidas." "Módulo propio del catálogo" "Propio"
                    signIn = component "Resolución de identidad" "Resuelve la identidad OIDC contra un usuario del catálogo y audita cada acceso." "Módulo propio de autenticación" "Propio"
                    policy = component "Política de permisos" "Matriz de tres perfiles con denegación por defecto, evaluada en local en cada petición." "Módulo propio de permisos" "Propio"
                    publishDocs = component "Publicación de documentación" "Genera y publica la documentación durante la creación guiada." "Acción propia del generador" "Propio,Reto"
                    audit = component "Auditoría" "Sustituye el servicio de auditoría del portal: recoge los eventos de las piezas propias, los conserva y los expone al revisor." "Plugin propio y servicio de auditoría" "Propio"
                }
            }
        }

        // ==========================================================
        // El entorno. Un solo elemento por sistema, con el mismo nombre en
        // todas las vistas: el papel de arquitectura y, entre paréntesis, el
        // producto que lo realiza en el piloto.
        //
        // Antes había dos juegos de cajas —papeles en el nivel 1, productos del
        // nivel 2 hacia abajo—, y eso rompía el principio del modelo: bajar de
        // nivel es abrir la caja del sistema en alcance, no rebautizar ni
        // descomponer las de alrededor. En el ejemplo canónico de C4, el
        // «E-mail System» y el «Mainframe Banking System» son la misma caja, con
        // el mismo nombre, en los niveles 1, 2 y 3.
        //
        // El control de versiones son dos sistemas, no uno partido en dos: por
        // eso ahora también son dos cajas en el nivel 1.
        // ==========================================================
        gitlab = softwareSystem "Control de versiones (GitLab)" "Grupo de la organización: origen del inventario, de las plantillas y destino de lo que se genera. Bajo control del prototipo." "Externo"
        bitbucket = softwareSystem "Repositorio de terceros (Bitbucket / DESY)" "Repositorio ajeno con el starter Angular del Sistema de Diseño DESY, del que el prototipo solo lee." "Externo"
        // La limitación se marca aquí y solo aquí, porque ahora solo hay una
        // caja: el papel no está comprometido, lo está su realización en el
        // piloto, y las dos viven en el mismo elemento.
        keycloak = softwareSystem "Proveedor de identidad (Keycloak)" "Resuelve quién accede al portal. El piloto lo emula con un proveedor autoalojado y un realm propio: la identidad corporativa no es federable en este entorno." "Externo,Limitacion"
        // La etiqueta «Almacen» no añade significado al código de color: solo le
        // da forma de cilindro, porque un almacén de objetos se lee antes como
        // depósito que como caja.
        minio = softwareSystem "Almacenamiento de objetos (MinIO)" "Conserva la documentación publicada de cada componente. El piloto usa un almacén compatible con S3." "Externo,Almacen"

        // ==========================================================
        // Relaciones — nivel 1
        // ==========================================================
        // Rótulo sin la palabra «componentes»: Structurizr parte el rótulo por
        // píxeles y esa palabra no cabe en una línea, así que se rompía a la
        // mitad. Se dice lo mismo con palabras que sí caben.
        developer -> idp "Consulta el inventario, genera repositorios y lee sus documentos"
        platformAdmin -> idp "Mantiene el catálogo y la política de permisos"
        securityReviewer -> idp "Revisa el registro de auditoría"
        idp -> gitlab "Descubre el inventario y publica los repositorios generados"
        idp -> bitbucket "Descarga y parchea el starter del frontend" "" "Reto"
        idp -> keycloak "Delega el inicio de sesión y sincroniza usuarios y grupos"
        idp -> minio "Publica los documentos al generar el componente" "" "Reto"
        idp -> minio "Recupera los documentos publicados"

        // ==========================================================
        // Relaciones que no dependen del nivel: unen dos elementos que se
        // dibujan igual en las dos vistas, así que se declaran una sola vez y
        // aparecen en ambas. Antes estaban duplicadas, una por registro de
        // nombres; al unificar los elementos, la duplicación se disuelve.
        // ==========================================================
        developer -> gitlab "Continúa el trabajo sobre el repositorio generado" "Git y merge requests"
        // El navegador es redirigido al proveedor y la contraseña se teclea
        // allí: el portal nunca la ve, solo el código de autorización.
        developer -> keycloak "Se autentica" "OIDC con PKCE"
        // Los dos futuros del modelo tienen la misma forma: relaciones entre
        // sistemas del entorno que hoy no existen y que resolverían una
        // limitación del piloto.
        gitlab -> minio "Publicará los documentos desde la CI" "" "Futuro"
        gitlab -> keycloak "Delegará también el inicio de sesión" "" "Futuro"

        // ==========================================================
        // Relaciones — nivel 2
        // ==========================================================
        developer -> idp.webApp "Consulta el inventario y genera repositorios" "HTTP"
        platformAdmin -> idp.webApp "Administra el portal" "HTTP"
        securityReviewer -> idp.webApp "Consulta el registro de auditoría" "HTTP"

        idp.webApp -> idp.backend "Llama a la API" "JSON / HTTP"
        idp.backend -> idp.database "Lee y escribe el inventario, las tareas y la auditoría" "SQL / TCP"
        idp.backend -> gitlab "Descubre el inventario y publica los repositorios" "API de GitLab"
        // Marcada como reto en los tres niveles, por la misma regla que la
        // publicación de documentos: el starter ajeno no encaja tal cual y hay
        // que parchearlo al vuelo. Antes solo salía en ámbar en el nivel 3.
        idp.backend -> bitbucket "Descarga y parchea el starter del frontend" "HTTP" "Reto"
        idp.backend -> keycloak "Autentica y sincroniza usuarios y grupos" "OIDC y API de administración"
        // Desdobladas por la misma razón que en el nivel 1: publicar y recuperar
        // no son lo mismo. La publicación durante la generación es el atajo del
        // piloto y va en ámbar; la lectura es ordinaria y va sin marca.
        idp.backend -> minio "Publica los documentos al generar el componente" "API S3" "Reto"
        idp.backend -> minio "Recupera los documentos publicados" "API S3"
        idp.backend -> developer "Notifica el final de la generación"

        // ==========================================================
        // Relaciones — nivel 3
        // ==========================================================
        idp.backend.search -> idp.backend.catalog "Indexa las entidades del catálogo"
        idp.backend.search -> idp.backend.techdocs "Indexa los documentos publicados"

        // Los rótulos van en la dirección de la flecha: describen lo que hace
        // quien la origina, no lo que hace el destino. Antes decían «Valida
        // cada entidad» y «Resuelve la sesión», que es el trabajo del módulo
        // apuntado, así que se leían al revés del dibujo.
        idp.backend.catalog -> idp.backend.validator "Somete cada entidad a validación"
        idp.backend.auth -> idp.backend.signIn "Delega la resolución de la identidad"
        idp.backend.permission -> idp.backend.policy "Consulta la matriz de permisos"
        idp.backend.scaffolder -> idp.backend.publishDocs "Ejecuta la acción de publicación"
        idp.backend.scaffolder -> idp.backend.notifications "Avisa al solicitante"
        idp.backend.scaffolder -> idp.backend.catalog "Da de alta la entidad generada"
        idp.backend.scaffolder -> idp.backend.permission "Comprueba la autorización"

        idp.backend.signIn -> idp.backend.catalog "Resuelve el usuario contra el catálogo"
        idp.backend.signIn -> idp.backend.audit "Registra cada inicio de sesión"
        idp.backend.policy -> idp.backend.audit "Registra cada denegación"
        idp.backend.validator -> idp.backend.audit "Registra cada violación"

        idp.backend.catalog -> idp.database "Conserva el inventario" "SQL"
        idp.backend.scaffolder -> idp.database "Guarda las tareas en curso" "SQL"
        idp.backend.audit -> idp.database "Conserva la auditoría" "SQL"

        idp.backend.catalog -> gitlab "Descubre repositorios cada 30 min" "API de GitLab"
        idp.backend.catalog -> keycloak "Sincroniza usuarios cada 30 min" "API de administración"
        idp.backend.auth -> keycloak "Delega el inicio de sesión" "OIDC"
        idp.backend.scaffolder -> gitlab "Crea el repositorio y publica" "API de GitLab"
        idp.backend.scaffolder -> bitbucket "Descarga y parchea el starter" "HTTP" "Reto"
        idp.backend.publishDocs -> minio "Publica los documentos" "API S3" "Reto"
        idp.backend.techdocs -> minio "Recupera los documentos" "API S3"
    }

    views {

        systemContext idp "C4-01-Contexto" "Vista de contexto: el portal, los tres perfiles que lo usan y los cuatro sistemas del entorno con los que integra." {
            include developer platformAdmin securityReviewer idp gitlab bitbucket keycloak minio
            autolayout tb 300 60
        }

        container idp "C4-02-Contenedores" "Vista de contenedores: la aplicación web y el backend son las dos mitades desplegables de Backstage, con la base de datos y los sistemas del piloto." {
            include developer platformAdmin securityReviewer
            include idp.webApp idp.backend idp.database
            include gitlab bitbucket keycloak minio
            autolayout tb 380 40
        }

        // La vista de componentes va en dos figuras: dieciséis cajas en una sola
        // salen ilegibles a ancho de texto —el defecto que se le señaló al
        // profesor en su propia figura—. El corte sigue los dos ejes del
        // capítulo: quién entra y qué se inventaria, y qué se genera.
        component idp.backend "C4-03a-Componentes-identidad" "Componentes del backend que resuelven identidad, inventario y autorización." {
            include idp.backend.auth idp.backend.signIn idp.backend.catalog idp.backend.validator
            include idp.backend.permission idp.backend.policy idp.backend.audit
            include idp.database
            autolayout tb 120 90
        }

        component idp.backend "C4-03b-Componentes-generacion" "Componentes del backend que ejecutan la creación guiada y publican y sirven la documentación." {
            include idp.backend.scaffolder idp.backend.publishDocs idp.backend.notifications
            include idp.backend.techdocs idp.backend.search idp.backend.catalog
            include idp.database gitlab bitbucket minio
            exclude "gitlab -> minio"
            autolayout lr 120 90
        }

        // El flujo va a nivel de sistemas, no de contenedores: se lee como la
        // figura de contexto recorrida en orden. Los saltos internos del portal
        // —web al backend, backend a la base de datos— no cuentan nada de la
        // historia y son los que estrangulaban la legibilidad de la figura. El
        // detalle que vivía en ellos (autorización local, validación de la
        // entidad) está donde corresponde: en las vistas de componentes.
        dynamic * "C4-04-Flujo" "Integración del flujo de trabajo: del inicio de sesión al repositorio registrado, y la vida posterior del componente generado." {
            developer -> idp "Inicia sesión en el portal"
            idp -> keycloak "Autentica y resuelve la identidad contra el catálogo"
            developer -> idp "Elige plantilla y solicita la generación"
            idp -> gitlab "Descarga la plantilla y su esqueleto"
            idp -> bitbucket "Descarga el starter ajeno y lo parchea al vuelo"
            idp -> minio "Genera y publica los documentos"
            idp -> gitlab "Crea el repositorio y publica el contenido"
            idp -> developer "Notifica el final de la generación"
            developer -> gitlab "Continúa por merge requests"
            idp -> gitlab "Redescubre el inventario cada 30 minutos"
            idp -> minio "Recupera los documentos publicados"
            gitlab -> minio "Publicará los documentos desde la CI"
            autolayout tb 400 40
        }

        styles {
            // Las cajas no llevan descripción: a ancho de texto solo caben
            // legibles el nombre y la tecnología. Lo que describe cada pieza lo
            // dice la prosa del capítulo.
            element "Element" {
                width 400
                height 220
                description false
            }
            relationship "Relationship" {
                fontSize 34
                color #4d4d4d
            }
            // Las cajas van de trazo, no macizas: relleno muy claro, borde grueso
            // y rótulo del mismo tono. El código de color de D05 no cambia — el
            // tono de cada categoría es exactamente el mismo de siempre, solo que
            // ahora vive en el borde y en el texto en lugar de en el relleno. Se
            // gana en que el nombre se lee en oscuro sobre claro, que a 4,5 pt
            // impresos rinde bastante mejor que blanco sobre color.
            //
            // strokeWidth 10 es el máximo que admite Structurizr; en estas
            // figuras equivale a algo más de 1 pt impreso, que es lo que hace
            // falta para que el borde sostenga el color al reducir.
            element "Actor" {
                shape Person
                background #eef3fa
                stroke #08427b
                strokeWidth 10
                color #08427b
            }
            element "IDP" {
                shape RoundedBox
                background #e9f2fb
                stroke #1168bd
                strokeWidth 10
                color #0d5290
            }
            element "WebApp" {
                shape WebBrowser
                background #e9f2fb
                stroke #1168bd
                strokeWidth 10
                color #0d5290
            }
            element "App" {
                shape RoundedBox
                background #e9f2fb
                stroke #1168bd
                strokeWidth 10
                color #0d5290
            }
            element "Database" {
                shape Cylinder
                background #e9f2fb
                stroke #1168bd
                strokeWidth 10
                color #0d5290
            }
            element "Externo" {
                shape RoundedBox
                background #eff2f5
                stroke #6b7f95
                strokeWidth 10
                color #4a5b6d
            }
            // Un almacén de objetos se dibuja como depósito. Va después de
            // «Externo» para que le gane la forma sin tocarle el color.
            element "Almacen" {
                shape Cylinder
            }
            element "DeSerie" {
                shape Component
                background #eaf4fd
                stroke #85bbf0
                strokeWidth 10
                color #2f76b4
            }
            element "Extendido" {
                shape Component
                background #f1ebfa
                stroke #7e57c2
                strokeWidth 10
                color #5b3b95
            }
            element "Propio" {
                shape Component
                background #e9f3ea
                stroke #2e7d32
                strokeWidth 10
                color #256128
            }
            // Código de color de la corrección: gris = limitación asumida,
            // amarillo = reto afrontado con una solución provisional.
            element "Limitacion" {
                background #f2f2f2
                stroke #9e9e9e
                strokeWidth 10
                color #5e5e5e
                border dashed
            }
            element "Reto" {
                background #fdf2e0
                stroke #f0ad4e
                strokeWidth 10
                color #8f5b10
            }
            relationship "Reto" {
                color #d9821b
                thickness 3
            }
            relationship "Futuro" {
                color #9e9e9e
                dashed true
            }
        }
        theme default
    }
}
