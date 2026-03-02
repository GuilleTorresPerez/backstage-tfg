workspace "Aragón Digital" "Diagramas de Arquitectura" {
    !identifiers hierarchical
    
    model {
        # Actores
        developer = person "Desarrollador" "Desarrollador que crea software para la organización Aragon digital" "Actor"
        admin = person "Administrador" "Funcionario administrador de aragón digital" "Actor"
        
        # Sistemas
        backstage = softwareSystem "BACKSTAGE" "Portal para crear, gestionar y explorar servicios" "System"
        github = softwareSystem "GITHUB" "Almacena código fuente y ejecuta workflows" "ExternalSystem"
        
        # Relaciones
        developer -> backstage "Crea aplicaciones"
        admin -> backstage "Gestiona las aplicaciones"
        github -> backstage "Envía estados de los workflows"
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