workspace "Aragón Digital" "Diagramas de Arquitectura" {
    !identifiers hierarchical
    
    model {
        # Actores
        developer = person "Desarrollador" "Crea y mantiene servicios digitales siguiendo los estándares de la organización." "Actor"
        admin = person "Responsable de Gobernanza" "Define estándares tecnológicos, gestiona el catálogo de servicios y supervisa el cumplimiento normativo." "Actor"
        
        # Sistemas
        backstage = softwareSystem "BACKSTAGE" "Portal de autoservicio para desarrolladores que centraliza el catálogo, plantillas y documentación." "System" {
            # Contenedores (Nivel 2)
            frontend = container "Frontend" "Proporciona la interfaz de usuario donde el desarrollador busca en el catálogo, usa plantillas y ve la documentación." "React" "WebBrowser"
            backend = container "Backend" "Orquesta los plugins, gestiona la autenticación, la creación de componentes y se comunica con sistemas externos." "Node.js / Express" "Server"
            database = container "Base de Datos" "Almacena la persistencia de datos de Backstage (entidades, estados, etc.)." "PostgreSQL" "Database"
            storage = container "Cloud Storage" "Almacena la documentación técnica renderizada (TechDocs)." "File Storage" "Storage"
        }
        
        github = softwareSystem "GITHUB" "Plataforma de control de versiones y ejecución de pipelines (CI/CD)." "ExternalSystem"
        
        # Relaciones Contexto (Nivel 1)
        developer -> backstage "Utiliza plantillas y consulta el catálogo"
        admin -> backstage "Gestiona el portal y audita activos"
        backstage -> github "Crea repositorios y lanza workflows" "API/HTTPS"

        # Relaciones Contenedores (Nivel 2)
        developer -> backstage.frontend "Navega y utiliza el portal" "HTTPS"
        admin -> backstage.frontend "Gestiona plantillas y entidades" "HTTPS"
        
        backstage.frontend -> backstage.backend "Realiza llamadas a la API" "JSON/HTTPS"
        backstage.backend -> backstage.database "Lee y escribe datos" "SQL/TCP"
        backstage.backend -> backstage.storage "Sincroniza y almacena documentación" "HTTPS/S3"
        backstage.backend -> github "Crea repositorios" "GitHub API/HTTPS"
        
    }

    views {
        systemContext backstage "SystemContext-01" "SYSTEM CONTEXT DIAGRAM - LEVEL 1" {
            include *
            autolayout lr
        }

        container backstage "Containers-01" "CONTAINER DIAGRAM - LEVEL 2" {
            include *
            autolayout tb
        }
        
        styles {
            element "Actor" {
                shape Person
                background #08427b
                color #ffffff
            }
            element "System" {
                shape RoundedBox
                background #1168bd
                color #ffffff
            }
            element "ExternalSystem" {
                shape RoundedBox
                background #999999
                color #ffffff
            }
            element "Container" {
                background #438dd5
                color #ffffff
            }
            element "WebBrowser" {
                shape WebBrowser
            }
            element "Database" {
                shape Cylinder
            }
            element "Storage" {
                shape Folder
            }
        }
        theme default
    }
}
