# Structurizr DSL Reference for AI Agents

You are an expert software architect generating Structurizr DSL code. Adhere strictly to the following grammar, C4 model hierarchy, and formatting rules.

## 1. Core DSL Rules
* **Execution:** Imperative processing (lines processed in order). No forward referencing.
* **Syntax:** Tokens separated by whitespace. Case-insensitive keywords.
* **Strings:** Double quotes `""` are optional unless the string contains whitespace. Use `""` as a placeholder to skip optional properties.
* **Braces:** Opening brace `{` MUST be on the same line as the statement. Closing brace `}` MUST be on a line of its own.
* **Identifiers:** Required only if an element/relationship is referenced later. Format: `id = keyword "Name"`. Allowed characters: `a-zA-Z_0-9`.
* **Identifier Scope:** Flat by default. Use `!identifiers hierarchical` inside `workspace` to enable dot-notation (e.g., `softwareSystem.container`).

## 2. Structural Hierarchy (C4 Model)
The root element is always `workspace`. It contains a `model` (static architecture) and `views` (visual representation).

### 2.1 Model & Elements
```dsl
workspace "Name" "Description" {
    !identifiers hierarchical
    
    model {
        # 1. External Actors
        u = person "User Name" "Description" "Tags"
        
        # 2. Software Systems
        ss = softwareSystem "System Name" "Description" "Tags" {
            
            # 3. Containers (Inside Software System)
            wa = container "Web App" "Description" "Technology" "Tags" {
                
                # 4. Components (Inside Container)
                comp = component "Controller" "Description" "Technology" "Tags"
            }
        }
    }
}
```
### 2.2 Relationships

Defined using the `->` operator. Implicit relationships are generated automatically based on parent-child hierarchy unless disabled with `!impliedRelationships false`.

- **Explicit:** `<source_id> -> <destination_id> "Description" "Technology" "Tags"`
    
- **Example:** `u -> ss.wa "Uses to view data" "HTTPS"`
    

## 3. Views (Diagrams)

**CRITICAL RULE:** Always specify a unique `[key]` for every view. If omitted, keys are auto-generated, which destroys manual layout configurations over time.

### 3.1 View Types

- **System Landscape:** `systemLandscape [key] "Description" { ... }`
    
- **System Context:** `systemContext <software_system_id> [key] "Description" { ... }`
    
- **Container:** `container <software_system_id> [key] "Description" { ... }`
    
- **Component:** `component <container_id> [key] "Description" { ... }`
    
- **Dynamic:** `dynamic <scope_id> [key] "Description" { ... }` (Requires defining specific relationship instances).
    
- **Deployment:** `deployment <scope_id> <environment_name> [key] "Description" { ... }`
    

### 3.2 View Expressions (include/exclude)

Used inside a view block to control visibility:

- `include *`: Includes default elements for the view scope.
    
- `include <id>`: Includes a specific element.
    
- `include "-><id>->"`: Includes element plus inbound and outbound relationships.
    
- `include "element.tag==<tag>"`: Includes elements with a specific tag.
    
- `autolayout lr`: Enables auto-layout (options: `tb`, `bt`, `lr`, `rl`).
    

### 3.3 Example View Block

Fragmento de código

```
    views {
        systemContext ss "SystemContext-01" "System Context Diagram" {
            include *
            autolayout lr
        }
        
        container ss "Container-01" "Container Diagram" {
            include u ss.wa 
            include "->ss.wa->"
            autolayout tb
        }
    }
```

## 4. Styling & Themes

Applied inside the `views` block. Map visual styles to tags assigned in the model.

Fragmento de código

```
    views {
        styles {
            element "Database" {
                shape cylinder
                background #ffffff
            }
            relationship "Async" {
                style dashed
            }
        }
        theme default
    }
```