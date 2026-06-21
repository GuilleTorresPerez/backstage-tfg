workspace "Prototipo IDP Backstage — Contexto del Sistema" "Diagrama de contexto del prototipo Backstage del TFG: actores y sistemas (reales o mockeados) con los que integra el IDP. Base para la derivación de requisitos de la Fase 2." {

    !identifiers hierarchical

    model {

        // ==========================================================
        // Actores
        // ==========================================================
        developer = person "Desarrollador" "Usuario final del IDP." "Actor"
        platformAdmin = person "Platform Admin (SDA)" "Mantiene catálogo, plantillas y permisos." "Actor"
        securityReviewer = person "Security Reviewer" "Revisa auditoría y estado del catálogo." "Actor"

        // ==========================================================
        // Sistema en scope: el prototipo del TFG
        // ==========================================================
        backstage = softwareSystem "Prototipo IDP Backstage" "Portal Interno de Desarrolladores construido como artefacto del TFG." "IDP" {

            // --- Contenedores del prototipo (C4 nivel 2) ---
            frontend = container "Single-Page Application" "Portal web del IDP con tema visual DESY." "React, TypeScript, Material UI" "WebApp"
            backend = container "Backend" "Aloja los plugins principales del IDP." "Node.js, Express, TypeScript" "App"
            database = container "Base de datos" "Persistencia del catálogo, tareas y auditoría." "PostgreSQL" "Database"
            objectStorage = container "MinIO" "Almacenamiento S3 para TechDocs renderizados." "MinIO / S3 API" "ObjectStorage"
        }

        // ==========================================================
        // Sistemas externos con los que integra
        // ==========================================================

        gitlab = softwareSystem "GitLab" "Repositorios Git y fuente de verdad del catálogo." "ExternalSystem"

        keycloak = softwareSystem "Keycloak (IdP del prototipo)" "Proveedor OIDC local del prototipo." "LocalStandIn"

        desyRepository = softwareSystem "DESY (starters en Bitbucket)" "Repositorios del Sistema de Diseño DESY utilizados como base del frontend generado." "ExternalSystem"

        // ==========================================================
        // Salida del Golden Path
        // ==========================================================
        deptApp = softwareSystem "Aplicación Departamental (generada)" "Servicio generado por el Golden Path." "Generated"

        // ==========================================================
        // Relaciones — System Context
        // ==========================================================

        // Actores → IDP (etiquetas de alto nivel; el detalle técnico vive en la vista Container)
        developer -> backstage "Descubre componentes, ejecuta plantillas y consulta documentación"
        platformAdmin -> backstage "Mantiene catálogo, plantillas y políticas de permisos"
        platformAdmin -> desyRepository "Incorpora los starters DESY al prototipo IDP"
        platformAdmin -> keycloak "Administra usuarios, grupos y roles del prototipo"
        securityReviewer -> backstage "Consulta el registro de auditoría y revisa el catálogo"

        // IDP → Integraciones
        backstage -> gitlab "Descubre entidades de catálogo y publica repositorios generados"
        backstage -> keycloak "Autentica usuarios y sincroniza identidades"
        backstage -> desyRepository "Integra los starters DESY como base del frontend generado"

        // Golden Path: la app generada y sus dependencias
        backstage -> deptApp "Genera el repositorio con boilerplate seguro"

        developer -> deptApp "Trabaja sobre el código generado"

        // ==========================================================
        // Relaciones — Container (nivel C4 2; no afectan al systemContext)
        // ==========================================================

        // Actores → contenedores
        developer -> backstage.frontend "Usa el portal" "HTTPS"
        platformAdmin -> backstage.frontend "Administra el IDP" "HTTPS"
        securityReviewer -> backstage.frontend "Consulta el registro de auditoría" "HTTPS"

        // Frontend → Backend
        backstage.frontend -> backstage.backend "Llama a la API" "JSON / HTTPS"

        // Backend → almacenamiento propio
        backstage.backend -> backstage.database "Lee y escribe" "SQL / TCP"
        backstage.backend -> backstage.objectStorage "Renderiza, publica y sirve TechDocs" "API S3 / HTTPS"

        // Backend → sistemas externos
        backstage.backend -> keycloak "Autentica usuarios y sincroniza identidades" "OIDC / Admin REST API"
        backstage.backend -> gitlab "Descubre el catálogo y publica repositorios" "GitLab API / HTTPS"
        backstage.backend -> desyRepository "Descarga el starter del frontend generado" "Git / HTTPS"
        backstage.backend -> deptApp "Genera la aplicación departamental inicial" "Scaffolder / Golden Path"
    }

    views {

        systemContext backstage "Backstage-Context-01" "Contexto del prototipo Backstage: actores y sistemas (reales o mockeados) con los que integra el IDP" {
            include *
            autolayout lr
        }

        systemLandscape "Prototype-Landscape-01" "Panorama del prototipo: IDP, sistemas externos y salida del Golden Path (aplicación departamental generada)" {
            include *
            autolayout lr
        }

        container backstage "Backstage-Container-01" "Contenedores del prototipo IDP: SPA, backend, base de datos y almacenamiento de objetos, con sus integraciones externas" {
            include developer platformAdmin securityReviewer
            include backstage.frontend backstage.backend backstage.database backstage.objectStorage
            include keycloak gitlab desyRepository deptApp
            autolayout lr
        }

        styles {
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
            element "ObjectStorage" {
                shape Cylinder
                background #1168bd
                color #ffffff
            }
            element "ExternalSystem" {
                shape RoundedBox
                background #438dd5
                color #ffffff
            }
            element "LocalStandIn" {
                shape RoundedBox
                background #17a2b8
                color #ffffff
            }
            element "MockSystem" {
                shape RoundedBox
                background #f0ad4e
                color #000000
            }
            element "Generated" {
                shape RoundedBox
                background #5cb85c
                color #ffffff
            }
        }
        theme default
    }
}
