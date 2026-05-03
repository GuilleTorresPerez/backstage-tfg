workspace "Prototipo IDP Backstage — Contexto del Sistema" "Diagrama de contexto del prototipo Backstage del TFG: actores y sistemas (reales o mockeados) con los que integra el IDP. Base para la derivación de requisitos de la Fase 2." {

    !identifiers hierarchical

    model {

        // ==========================================================
        // Actores
        // ==========================================================
        developer = person "Desarrollador" "Usuario final del IDP. Descubre componentes en el catálogo, arranca proyectos desde el Scaffolder y consulta TechDocs. Rol Backstage: developer." "Actor"
        platformAdmin = person "Platform Admin (SDA)" "Mantiene el catálogo, las plantillas Scaffolder, las políticas de permisos y el Golden Path. Único rol con permisos de modificación de la configuración del IDP. Rol Backstage: platform-admin." "Actor"
        securityReviewer = person "Security Reviewer" "Aprueba los PRs de bootstrapping generados por el Scaffolder y los cambios sobre archivos de seguridad (CODEOWNERS). Implementa la segregación de funciones (op.acc.3.2) y la autorización de entrada en producción (org.4.3). Rol Backstage: security-reviewer." "Actor"

        // ==========================================================
        // Sistema en scope: el prototipo del TFG
        // ==========================================================
        backstage = softwareSystem "Prototipo IDP Backstage" "Portal Interno de Desarrolladores construido como artefacto del TFG. Capacidades: Software Catalog, Scaffolder con Golden Path DESY/ENS, TechDocs, Permission Framework y audit log. Despliegue local en el contexto del TFG; en producción correría sobre Cloud AST." "IDP"

        // ==========================================================
        // Sistemas externos con los que integra
        // ==========================================================

        gitlab = softwareSystem "GitLab" "Plataforma de repositorios Git del IDP y de los servicios generados. Fuente de verdad para catalog-info.yaml, plantillas Scaffolder, TechDocs en Markdown y código de las aplicaciones departamentales. Branch protection y CODEOWNERS aplican el flujo GitOps que materializa los controles op.exp.5.* y org.4.3." "ExternalSystem"

        mockIdp = softwareSystem "Mock IdP (LDAP + OIDC)" "Stand-in del directorio corporativo del Gobierno de Aragón (389 Directory Server + portal micuenta.aragon.es sobre Keycloak/Red Hat SSO). Provee autenticación OIDC y sincronización de usuarios y grupos vía LDAP. En despliegue real se sustituye por el IdP corporativo gestionado por AST." "MockSystem"

        mockAst = softwareSystem "Mock AST (Cloud target)" "Entorno mockeado que simula la plataforma cloud de AST (certificada ENS ALTA). Recibe los artefactos desplegables generados por el pipeline CI/CD que arranca el Scaffolder. En despliegue real es Cloud AST (modelo cloud-first híbrido)." "MockSystem"

        desy = softwareSystem "DESY — Sistema de Diseño" "Sistema de Diseño del Gobierno de Aragón (EUPL-1.2). El Scaffolder inyecta sus paquetes npm (desy-html, desy-angular) como Golden Path de UI accesible (WCAG 2.1 AA). El portal público (desy.aragon.es) se enlaza desde TechDocs como documentación de referencia." "ExternalSystem"

        opendata = softwareSystem "Aragón Open Data" "Plataforma pública de datos abiertos del Gobierno de Aragón. Sus APIs (GA_OD_Core v2, CKAN, SPARQL) se registran en el Software Catalog como entidades 'kind: API' — caso de uso de demostración del control op.ext.4.2 (documentación y autorización de interconexiones)." "ExternalSystem"

        // ==========================================================
        // Salida del Golden Path
        // ==========================================================
        deptApp = softwareSystem "Aplicación Departamental (generada)" "Servicio creado por un desarrollador a partir de una plantilla Scaffolder del IDP. Hereda dependencias DESY, controles ENS (TLS, headers, CORS, SBOM), configuración GitOps con CODEOWNERS y pipeline de despliegue. Es el artefacto que demuestra el valor del Golden Path en la Fase 4." "Generated"

        // ==========================================================
        // Relaciones — System Context
        // ==========================================================

        // Actores → IDP
        developer -> backstage "Descubre componentes en el catálogo, ejecuta plantillas Scaffolder y consulta TechDocs" "HTTPS"
        platformAdmin -> backstage "Mantiene catálogo, plantillas y políticas de permisos vía Git" "HTTPS / Git"
        securityReviewer -> backstage "Aprueba PRs de bootstrapping y revisa cambios sobre archivos de seguridad" "Git / HTTPS"

        // IDP → Integraciones
        backstage -> gitlab "Descubre catalog-info.yaml automáticamente (RC-DISC-01); descarga esqueletos del Scaffolder (fetch:plain → skeletons/*); crea repositorios con branch protection y MR de bootstrapping (publish:gitlab); sirve TechDocs desde Markdown" "GitLab API / HTTPS"
        backstage -> mockIdp "Autentica usuarios (OIDC) y sincroniza grupos a roles del Permission Framework (LDAP)" "OIDC / LDAP"
        backstage -> desy "Referencia paquetes npm en plantillas y enlaza documentación pública" "npm / HTTPS"
        backstage -> opendata "Registra sus APIs (GA_OD_Core, CKAN, SPARQL) como entidades del catálogo vía Location estática (RC-DISC-02) — demostración op.ext.4.2" "OpenAPI / AsyncAPI"

        // Golden Path: la app generada y sus dependencias
        backstage -> deptApp "Genera el repositorio con boilerplate seguro (DESY + ENS + GitOps + CI/CD)" "Scaffolder template"
        deptApp -> gitlab "Reside como repositorio con branch protection y CODEOWNERS" "Git"
        deptApp -> mockAst "Se despliega vía pipeline CI/CD" "GitLab CI → Cloud target"
        deptApp -> desy "Consume componentes UI accesibles WCAG 2.1 AA en runtime" "npm"

        developer -> deptApp "Trabaja sobre el código generado tras pasar por el Golden Path" "Git / IDE"
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
            element "ExternalSystem" {
                shape RoundedBox
                background #438dd5
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
