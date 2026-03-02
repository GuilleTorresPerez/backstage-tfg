workspace "Aragón Digital" "Diagramas de Arquitectura" {
    !identifiers hierarchical
    
    model {
        # Actores
        developer = person "Desarrollador" "Desarrollador que crea y gestiona el ciclo de vida de sus servicios" "Actor"
        admin = person "Administrador" "Define estándares tecnológicos, gestiona el catálogo de servicios y supervisa" "Actor"
        
        # Sistemas
        backstage = softwareSystem "BACKSTAGE" "Portal para crear, gestionar y explorar servicios" "System"
        github = softwareSystem "GITHUB" "Almacena código fuente y ejecuta workflows" "ExternalSystem"
        
        # Relaciones
        developer -> backstage "Utiliza plantillas para crear nuevos servicios y consulta el catálogo."
        admin -> backstage "Define plantillas de software, gestiona la estructura organizativa y audita activos."
        backstage -> github "Crea repositorios y lanza workflows de andamiaje (scaffolding)."
    }

    views {
        systemContext backstage "SystemContext-01" "SYSTEM CONTEXT DIAGRAM - LEVEL 1" {
            include *
            autolayout lr
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
        }
        theme default
    }
}