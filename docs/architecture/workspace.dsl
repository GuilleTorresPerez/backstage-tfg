workspace "Prototipo IDP Backstage — Contexto del Sistema" "Diagrama de contexto del prototipo Backstage del TFG: actores y sistemas (reales o mockeados) con los que integra el IDP. Base para la derivación de requisitos de la Fase 2." {

    !identifiers hierarchical

    model {

        // ==========================================================
        // Actores
        // ==========================================================
        developer = person "Desarrollador" "Usuario final del IDP. Rol Backstage: developer." "Actor"
        platformAdmin = person "Platform Admin (SDA)" "Mantiene catálogo, plantillas y políticas del IDP. Rol Backstage: platform-admin." "Actor"
        securityReviewer = person "Security Reviewer" "Aprueba MRs de bootstrapping y cambios sobre archivos sensibles. Rol Backstage: security-reviewer." "Actor"

        // ==========================================================
        // Sistema en scope: el prototipo del TFG
        // ==========================================================
        backstage = softwareSystem "Prototipo IDP Backstage" "Portal Interno de Desarrolladores construido como artefacto del TFG." "IDP" {

            // --- Contenedores del prototipo (C4 nivel 2) ---
            frontend = container "Single-Page Application" "Portal web del IDP (catálogo, Scaffolder, TechDocs, auditoría) con tema visual DESY." "React, TypeScript, Material UI" "WebApp"
            backend = container "Backend" "Aloja los plugins del IDP: catálogo, Scaffolder, TechDocs, auth OIDC, permisos, búsqueda y auditoría." "Node.js, Express, TypeScript" "App"
            database = container "Base de datos" "Catálogo, tareas del Scaffolder, índice de búsqueda y eventos de auditoría." "PostgreSQL" "Database"
        }

        // ==========================================================
        // Sistemas externos con los que integra
        // ==========================================================

        gitlab = softwareSystem "GitLab" "Repositorios Git del IDP y de los servicios generados. Fuente de verdad del catálogo (GitOps)." "ExternalSystem"

        keycloak = softwareSystem "Keycloak (IdP del prototipo)" "Servidor OIDC open-source real, desplegado localmente (Docker) con realm versionado. Suple al IdP corporativo del Gobierno de Aragón sin simularlo." "LocalStandIn"

        mockAst = softwareSystem "Mock AST (Cloud target)" "Simula la plataforma cloud de AST (certificada ENS ALTA), destino del despliegue." "MockSystem"

        bitbucketDesy = softwareSystem "BitBucket — Proveedor DESY" "Repositorios BitBucket donde se publican los starters DESY utilizados como base del Golden Path de UI accesible." "ExternalSystem"

        minio = softwareSystem "MinIO" "Almacenamiento de objetos compatible con S3 donde Backstage publica los sitios TechDocs renderizados." "LocalStandIn"

        // ==========================================================
        // Salida del Golden Path
        // ==========================================================
        deptApp = softwareSystem "Aplicación Departamental (generada)" "Servicio generado por una plantilla del Scaffolder, con DESY, controles ENS y GitOps." "Generated"

        // ==========================================================
        // Relaciones — System Context
        // ==========================================================

        // Actores → IDP (etiquetas de alto nivel; el detalle técnico vive en la vista Container)
        developer -> backstage "Descubre componentes, ejecuta plantillas y consulta documentación"
        platformAdmin -> backstage "Mantiene catálogo, plantillas y políticas de permisos"
        platformAdmin -> bitbucketDesy "Incorpora el starter DESY al prototipo IDP"
        securityReviewer -> backstage "Consulta el registro de auditoría y revisa el catálogo"

        // IDP → Integraciones
        backstage -> gitlab "Descubre el catálogo, genera repositorios y sirve documentación"
        backstage -> keycloak "Autentica usuarios y sincroniza identidades"
        backstage -> bitbucketDesy "Integra los starters DESY como base del frontend generado"
        backstage -> minio "Publica y sirve TechDocs renderizados"

        // Golden Path: la app generada y sus dependencias
        backstage -> deptApp "Genera el repositorio con boilerplate seguro"
        deptApp -> gitlab "Reside como repositorio protegido"
        deptApp -> mockAst "Se despliega vía pipeline CI/CD"
        deptApp -> bitbucketDesy "Parte de los starters DESY"

        developer -> deptApp "Trabaja sobre el código generado"

        // Segregación de funciones: la aprobación ocurre en el git host, no en el IDP
        securityReviewer -> gitlab "Aprueba MRs sobre archivos sensibles (CODEOWNERS)"

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
        backstage.backend -> minio "Renderiza, publica y sirve TechDocs" "API S3 / HTTPS"

        // Backend → sistemas externos
        backstage.backend -> keycloak "Autentica usuarios y sincroniza identidades" "OIDC / Admin REST API"
        backstage.backend -> gitlab "Descubre el catálogo y publica repositorios" "GitLab API / HTTPS"
        backstage.backend -> bitbucketDesy "Descarga el starter del frontend generado" "Git / HTTPS"
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
            include backstage.frontend backstage.backend backstage.database
            include keycloak gitlab bitbucketDesy minio
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
