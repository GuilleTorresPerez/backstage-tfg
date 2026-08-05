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
            webApp = container "Aplicación web" "Portal del desarrollador, con tema visual DESY y la interfaz propia de auditoría." "React 17, TypeScript, Material UI v4" "WebApp"

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
        // Nivel 1 — el entorno, en registro conceptual: sin productos.
        // ==========================================================
        scm = softwareSystem "Control de versiones" "Origen del inventario y destino de lo que se genera." "Concepto"
        identity = softwareSystem "Proveedor de identidad" "Resuelve quién accede al portal. El piloto lo emula con un proveedor propio: la identidad corporativa no es federable en este entorno." "Concepto,Limitacion"
        objectStore = softwareSystem "Almacenamiento de objetos" "Conserva la documentación publicada de cada componente." "Concepto"

        // ==========================================================
        // Del nivel 2 hacia abajo, los mismos papeles con producto y
        // nombre. El control de versiones se desdobla porque los dos
        // repositorios no se controlan igual.
        // ==========================================================
        gitlab = softwareSystem "GitLab" "Grupo de la organización: repositorios descubiertos, plantillas y destino de lo generado. Bajo control del prototipo." "Externo"
        bitbucket = softwareSystem "Bitbucket (DESY)" "Repositorio ajeno con el starter Angular del Sistema de Diseño DESY, del que el prototipo solo lee." "Externo"
        keycloak = softwareSystem "Keycloak" "Proveedor OIDC del piloto, autoalojado con un realm propio." "Externo,Limitacion"
        minio = softwareSystem "MinIO" "Almacenamiento compatible con S3 del piloto." "Externo"

        // ==========================================================
        // Relaciones — nivel 1
        // ==========================================================
        developer -> idp "Consulta el inventario, genera componentes y lee sus documentos"
        platformAdmin -> idp "Mantiene el catálogo y la política de permisos"
        securityReviewer -> idp "Revisa el registro de auditoría"
        developer -> scm "Continúa el trabajo sobre el repositorio generado"

        idp -> scm "Descubre el inventario y publica los repositorios generados"
        idp -> identity "Delega el inicio de sesión y sincroniza usuarios y grupos"
        idp -> objectStore "Publica y recupera los documentos"
        scm -> objectStore "Publicará los documentos desde la CI" "" "Futuro"

        // ==========================================================
        // Relaciones — nivel 2
        // ==========================================================
        developer -> idp.webApp "Usa el portal" "HTTP"
        platformAdmin -> idp.webApp "Administra el portal" "HTTP"
        securityReviewer -> idp.webApp "Consulta el registro de auditoría" "HTTP"

        idp.webApp -> idp.backend "Llama a la API" "JSON / HTTP"
        idp.backend -> idp.database "Lee y escribe el inventario, las tareas y la auditoría" "SQL / TCP"
        idp.backend -> gitlab "Descubre el inventario y publica los repositorios" "API de GitLab"
        idp.backend -> bitbucket "Descarga el starter del frontend generado" "HTTP"
        idp.backend -> keycloak "Autentica y sincroniza usuarios y grupos" "OIDC y API de administración"
        idp.backend -> minio "Publica y recupera los documentos" "API S3"
        idp.backend -> developer "Notifica el final de la generación"

        gitlab -> minio "Publicará los documentos desde la CI" "" "Futuro"
        developer -> keycloak "Se autentica" "OIDC con PKCE"
        developer -> gitlab "Continúa el trabajo sobre el repositorio generado" "Git y merge requests"

        // ==========================================================
        // Relaciones — nivel 3
        // ==========================================================
        idp.backend.search -> idp.backend.catalog "Indexa las entidades del catálogo"
        idp.backend.search -> idp.backend.techdocs "Indexa los documentos publicados"

        idp.backend.catalog -> idp.backend.validator "Valida cada entidad"
        idp.backend.auth -> idp.backend.signIn "Resuelve la sesión"
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

        systemContext idp "C4-01-Contexto" "Vista de contexto: el portal, los tres perfiles y los tres papeles del entorno, sin nombrar productos." {
            include developer platformAdmin securityReviewer idp scm identity objectStore
            autolayout tb 150 120
        }

        container idp "C4-02-Contenedores" "Vista de contenedores: la aplicación web y el backend son las dos mitades desplegables de Backstage, con la base de datos y los sistemas del piloto." {
            include developer
            include idp.webApp idp.backend idp.database
            include gitlab bitbucket keycloak minio
            autolayout tb 150 120
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

        dynamic idp "C4-04-Flujo" "Integración del flujo de trabajo: del inicio de sesión al repositorio registrado, y la vida posterior del componente generado." {
            developer -> idp.webApp "Inicia sesión"
            idp.backend -> keycloak "Autentica y resuelve la identidad contra el catálogo"
            developer -> idp.webApp "Elige plantilla y rellena el formulario"
            idp.webApp -> idp.backend "Solicita la generación; autoriza en local"
            idp.backend -> gitlab "Descarga la plantilla y su esqueleto"
            idp.backend -> bitbucket "Descarga el starter ajeno y lo parchea al vuelo"
            idp.backend -> minio "Genera y publica los documentos"
            idp.backend -> gitlab "Crea el repositorio y publica el contenido"
            idp.backend -> idp.database "Da de alta la entidad, ya validada"
            idp.backend -> developer "Notifica el final de la generación"
            developer -> gitlab "Continúa por merge requests"
            idp.backend -> gitlab "Redescubre el inventario cada 30 minutos"
            idp.backend -> idp.webApp "Sirve los documentos al portal"
            gitlab -> minio "Publicará los documentos desde la CI"
            autolayout lr 150 120
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
            }
            element "Actor" {
                shape Person
                background #08427b
                color #ffffff
            }
            element "IDP" {
                shape RoundedBox
                background #1168bd
                color #ffffff
            }
            element "WebApp" {
                shape WebBrowser
                background #1168bd
                color #ffffff
            }
            element "App" {
                shape RoundedBox
                background #1168bd
                color #ffffff
            }
            element "Database" {
                shape Cylinder
                background #1168bd
                color #ffffff
            }
            element "Concepto" {
                shape RoundedBox
                background #6b7f95
                color #ffffff
            }
            element "Externo" {
                shape RoundedBox
                background #6b7f95
                color #ffffff
            }
            element "DeSerie" {
                shape Component
                background #85bbf0
                color #000000
            }
            element "Extendido" {
                shape Component
                background #7e57c2
                color #ffffff
            }
            element "Propio" {
                shape Component
                background #2e7d32
                color #ffffff
            }
            // Código de color de la corrección: gris = limitación asumida,
            // amarillo = reto afrontado con una solución provisional.
            element "Limitacion" {
                background #9e9e9e
                color #000000
                border dashed
            }
            element "Reto" {
                background #f0ad4e
                color #000000
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
