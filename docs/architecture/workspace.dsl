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
            
            backend = container "Backend" "Orquesta los plugins, gestiona la autenticación y se comunica con sistemas externos." "Node.js / Express" "Server" {
                # Componentes (Nivel 3)
                catalog = component "Software Catalog" "Gestiona los metadatos del software y el grafo de entidades dentro de Backstage." "Node.js"
                scaffolder = component "Software Templates" "Orquesta la creación de proyectos, inyecta el Kit de IA y utiliza Custom Actions de DESY." "Node.js"
                search = component "Search Service" "Gestiona la indexación y búsqueda de la documentación y el catálogo." "Node.js"
                auth = component "Auth Service" "Gestiona la autenticación y el flujo de identidad con proveedores externos." "Node.js"
                techdocs = component "TechDocs Engine" "Lee y centraliza la documentación técnica siguiendo el paradigma docs-as-code." "Node.js"
                ctt = component "CTT Explorer Plugin" "Obtiene y guarda la documentación de la forja del CTT (Centro de Transferencia de Tecnología)." "Node.js"
                desy = component "DESY Explorer Plugin" "Obtiene y guarda la documentación de la forja de DESY" "Node.js"
                compliance = component "Compliance & Auditor Plugin" "Actúa como auditor continuo, verificando versiones y estándares (DESY Pills) en los repositorios." "Node.js"
            }
            
            database = container "Base de Datos" "Almacena la persistencia de datos de Backstage (entidades, estados, etc.)." "PostgreSQL" "Database"
            storage = container "Cloud Storage" "Almacena la documentación técnica renderizada (TechDocs)." "File Storage" "Storage"
        }
        
        github = softwareSystem "GITHUB" "Plataforma de control de versiones y ejecución de pipelines (CI/CD)." "ExternalSystem"

        bitbucket = softwareSystem "BITBUCKET" "Forja de código del Gobierno de Aragón donde residen los starters oficiales." "ExternalSystem"
        
        # Relaciones Contexto (Nivel 1)
        developer -> backstage "Utiliza plantillas y consulta el catálogo"
        admin -> backstage "Gestiona el portal y audita activos"
        admin -> github "Define y versiona plantillas de software (YAML)" "HTTPS"
        backstage -> github "Crea repositorios y lanza workflows" "API/HTTPS"
        

        # Relaciones Contenedores (Nivel 2)
        developer -> backstage.frontend "Navega y utiliza el portal" "HTTPS"
        admin -> backstage.frontend "Gestiona plantillas y entidades" "HTTPS"
        
        backstage.frontend -> backstage.backend "Realiza llamadas a la API" "JSON/HTTPS"
        backstage.backend -> backstage.database "Lee y escribe datos" "SQL/TCP"
        backstage.backend -> backstage.storage "Sincroniza y almacena documentación" "HTTPS/S3"
        backstage.backend -> github "Crea repositorios y andamiaje" "GitHub API/HTTPS"
        
        developer -> backstage.storage "Lee documentación técnica (TechDocs)" "HTTPS"

        # Relaciones Componentes (Nivel 3)
        backstage.frontend -> backstage.backend.catalog "Consulta el inventario" "JSON/HTTPS"
        backstage.frontend -> backstage.backend.scaffolder "Solicita nuevo proyecto" "JSON/HTTPS"
        backstage.frontend -> backstage.backend.search "Busca información" "JSON/HTTPS"
        backstage.frontend -> backstage.backend.auth "Inicia sesión" "JSON/HTTPS"
        backstage.frontend -> backstage.backend.techdocs "Accede a manuales" "JSON/HTTPS"
        backstage.frontend -> backstage.backend.compliance "Visualiza cumplimiento y Píldoras DESY" "JSON/HTTPS"

        backstage.backend.catalog -> backstage.database "Persiste entidades" "SQL/TCP"
        backstage.backend.catalog -> github "Lee definiciones de plantillas y entidades" "GitHub API/HTTPS"
        backstage.backend.catalog -> bitbucket "Descubre entidades de catálogo" "Bitbucket API/HTTPS"
        backstage.backend.scaffolder -> github "Crea nuevos repositorios" "GitHub API/HTTPS"
        backstage.backend.scaffolder -> bitbucket "Descarga Starters oficiales" "HTTPS"
        backstage.backend.techdocs -> backstage.storage "Lee/Escribe archivos" "HTTPS/S3"
        backstage.backend.ctt -> backstage.storage "Guarda docs de forja" "HTTPS/S3"
        backstage.backend.desy -> backstage.storage "Guarda docs de DESY" "HTTPS/S3"
        backstage.backend.ctt -> github "Consulta la forja" "GitHub API/HTTPS"
        backstage.backend.compliance -> bitbucket "Consulta versiones de referencia (Starters)" "Bitbucket API/HTTPS"
        backstage.backend.compliance -> github "Audita versiones en repositorios destino" "GitHub API/HTTPS"
        backstage.backend.compliance -> backstage.backend.catalog "Obtiene lista de servicios a auditar" "In-process"
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

        component backstage.backend "Components-01" "COMPONENT DIAGRAM - LEVEL 3 (BACKEND)" {
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
            element "Component" {
                background #85bbf0
                color #000000
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
