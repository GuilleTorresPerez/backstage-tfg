# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Backstage.io Internal Developer Portal (IDP)** built as a TFG (Trabajo Fin de Grado) for Universidad de Zaragoza. The goal is an internal developer platform for the public sector with self-service, software templates, and compliance-by-design.

repo url: https://github.com/GuilleTorresPerez/backstage-tfg

### Proposal summary

The full proposal is at `/home/guillermotorres/Documents/TFG/Visión/Propuesta TFG.md`. Key points:

- **Title**: *Evaluación y prototipado de una Plataforma Interna de Desarrollo (IDP) para la Administración Pública basada en Backstage: reingeniería del Sistema de Diseño DESY del Gobierno de Aragón como caso de estudio.*
- **Goal**: Evaluate the technical, regulatory and operational feasibility of building an IDP on Backstage for the public sector, materialized as a functional prototype using the DESY Design System as the main case study.
- **Problems addressed**: fragmentation of documentation and standards, poor discoverability of reusable assets, manual/bureaucratic processes for infrastructure and compliance, costly a-posteriori regulatory audits (ENS), and lack of standardization across teams and vendors.
- **Specific objectives**: analyze the state of the art of developer portals in the public sector; integrate DESY into Backstage as a *Golden Path*; design the IDP architecture (catalog, scaffolder, techdocs); align the platform with ENS compliance (RD 311/2022); explore reuse of public-sector assets in the catalog; document technical, organizational and legal limitations; and evaluate viability through impact metrics.
- **Methodology**: Design Science Research Methodology (DSRM). The artifact is an *instantiation*: a working Backstage prototype.
- **Key tools/standards**: Backstage (Node.js/TypeScript), DESY Design System (WCAG 2.1 AA), ENS (RD 311/2022).
- **SDGs**: ODS 9 (Industry, Innovation and Infrastructure), ODS 16 (Peace, Justice and Strong Institutions), ODS 17 (Partnerships for the Goals).

### Phases

Project phases are documented in `/home/guillermotorres/Documents/TFG/Planificación/Fases/`:
- `Fase 1 - Identificación del Problema y Estado del Arte.md`
- `Fase 2 - Definición de Objetivos de la Solución.md`
- `Fase 3 - Diseño y Desarrollo del Artefacto.md`

### Requirements

Requirements are documented in `/home/guillermotorres/Documents/TFG/Implementación/Requisitos/`:
- `Requisitos de Despliegue.md`
- `Requisitos del Catálogo de Software.md`
- `Requisitos del Permission Framework.md`
- `Requisitos del Scaffolder.md`

## Commands

```bash
# Start the full app (frontend + backend) in development mode
yarn start

# Build the backend only
yarn build:backend

# Build all packages
yarn build:all

# Build Docker image for backend
yarn build-image

# Type checking
yarn tsc
yarn tsc:full   # strict, no cache

# Lint changed files (since origin/master)
yarn lint
yarn lint:all   # lint everything

# Run all tests
yarn test
yarn test:all   # with coverage

# Run e2e tests (Playwright)
yarn test:e2e

# Format check
yarn prettier:check

# Scaffold a new plugin or package
yarn new

# Create architecture docs server (Structurizr on port 8080)
docker compose up structurizr   # alias of `podman compose up structurizr` (see "Container engine" below)
```

To run a single test file:
```bash
yarn workspace <package-name> test --testPathPattern=<file>
# Example:
yarn workspace app test --testPathPattern=App.test
```

## Architecture

This is a standard Backstage monorepo with Yarn workspaces:

- `packages/app/` — React frontend (TypeScript). Entry point: `src/index.tsx`, app wiring in `src/App.tsx`.
- `packages/backend/` — Node.js backend. Entry point: `src/index.ts` using `createBackend()` from `@backstage/backend-defaults`.
- `plugins/` — Empty directory reserved for custom plugins.
- `examples/` — Local catalog data (entities, org, templates) loaded in development.
- `docs/` — Architecture diagrams (Structurizr DSL in `docs/architecture/`) and Obsidian notes.
- `docker-compose.yml` — Defines the local infrastructure stack (PostgreSQL, Keycloak, MinIO) and the Structurizr docs server.

### Backend plugins loaded (`packages/backend/src/index.ts`)

- `app-backend`, `proxy-backend`
- `scaffolder-backend` + GitHub and notifications modules
- `techdocs-backend`
- `auth-backend` + guest provider + custom OIDC (Keycloak) provider module
- `catalog-backend` + scaffolder entity model + logs + GitHub + Keycloak (`@backstage-community/plugin-catalog-backend-module-keycloak`) modules
- `permission-backend` + allow-all policy module
- `search-backend` + pg engine + catalog and techdocs collators
- `kubernetes-backend`
- `notifications-backend`, `signals-backend`

### Configuration

- `app-config.yaml` — Base config (development defaults, SQLite in-memory DB).
- `app-config.local.yaml` — Local overrides and secrets. Listed in `.gitignore`, not committed.
- `app-config.production.yaml` — Production config (PostgreSQL via env vars).

Key environment variables:
- `GITHUB_TOKEN` — GitHub integration PAT (still used for `catalog-backend-module-github` and scaffolder until Bloque C migrates to GitLab)
- `AUTH_OIDC_METADATA_URL` / `AUTH_OIDC_CLIENT_ID` / `AUTH_OIDC_CLIENT_SECRET` — Keycloak OIDC provider for sign-in
- `KEYCLOAK_BACKSTAGE_SYNC_SECRET` — service-account secret for the `backstage-sync` confidential client used by the `keycloakOrg` catalog provider
- `POSTGRES_HOST/PORT/USER/PASSWORD` — Production database

### Auth

Keycloak (Docker container, realm `aragon-idp`) is the primary sign-in provider via OIDC Authorization Code + PKCE. The custom resolver in `packages/backend/src/modules/oidcAuthProvider.ts` extracts `preferred_username` from the id_token and resolves it against the catalog via `signInWithCatalogUser`. The Keycloak realm is exported in `keycloak/realm-export/aragon-idp-realm.json` and auto-imported on container startup. User and group entities are synchronized from Keycloak by `@backstage-community/plugin-catalog-backend-module-keycloak`. Guest access is also enabled for development.

### Architecture documentation

The `docker-compose.yml` runs a Structurizr Lite server on port 8080, serving the C4 model diagrams from `docs/architecture/`.

## Package manager

This project uses **Yarn 4** (Berry). Always use `yarn` commands, not `npm`.

## Dev environment — host + Fedora Toolbox

Claude Code runs **on the host**. Project dev dependencies (Node 22, Yarn 4, etc.) live inside a Fedora Toolbox named `backstage-dev`. The host does not have Node/Yarn installed — running `yarn ...` directly from the host will fail.

When a command depends on the toolbox toolchain (anything in the Commands section above: `yarn start`, `yarn build:*`, `yarn tsc`, `yarn test`, `yarn lint`, etc.), prefix it with:

```bash
toolbox run -c backstage-dev <command>
```

Examples:
```bash
toolbox run -c backstage-dev yarn install
toolbox run -c backstage-dev yarn tsc
toolbox run -c backstage-dev yarn workspace app test --testPathPattern=App.test
```

Commands that do **not** need the toolbox (run directly on the host):
- `git`, `gh`
- `docker` / `docker compose` (the container engine lives on the host, not in the toolbox)
- File edits, `grep`, `find`, etc.

Rule of thumb: if it touches `node_modules`, `yarn`, `node`, or the project's TypeScript/build pipeline → wrap in `toolbox run -c backstage-dev`. Otherwise run it directly.

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`GuilleTorresPerez/backstage-tfg`). See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

