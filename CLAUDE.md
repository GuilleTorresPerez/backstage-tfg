# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Backstage.io Internal Developer Portal (IDP)** built as a TFG (Trabajo Fin de Grado) for Universidad de Zaragoza. The goal is an internal developer platform for the public sector with self-service, software templates, and compliance-by-design.

repo url: https://github.com/GuilleTorresPerez/backstage-tfg

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
docker compose up structurizr
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

### Backend plugins loaded (`packages/backend/src/index.ts`)

- `app-backend`, `proxy-backend`
- `scaffolder-backend` + GitHub and notifications modules
- `techdocs-backend`
- `auth-backend` + guest and GitHub providers
- `catalog-backend` + scaffolder entity model + logs modules
- `permission-backend` + allow-all policy module
- `search-backend` + pg engine + catalog and techdocs collators
- `kubernetes-backend`
- `notifications-backend`, `signals-backend`

### Configuration

- `app-config.yaml` — Base config (development defaults, SQLite in-memory DB).
- `app-config.local.yaml` — Local overrides (GitHub OAuth credentials). Not committed with secrets in production.
- `app-config.production.yaml` — Production config (PostgreSQL via env vars).

Key environment variables:
- `GITHUB_TOKEN` — GitHub integration PAT
- `AUTH_GITHUB_CLIENT_ID` / `AUTH_GITHUB_CLIENT_SECRET` — GitHub OAuth (or use `app-config.local.yaml` for dev)
- `POSTGRES_HOST/PORT/USER/PASSWORD` — Production database

### Auth

GitHub OAuth is the primary sign-in provider. The resolver `usernameMatchingUserEntityName` maps GitHub usernames to catalog User entities. Guest access is also enabled for development.

### Architecture documentation

The `docker-compose.yml` runs a Structurizr Lite server on port 8080, serving the C4 model diagrams from `docs/architecture/`.

## Package manager

This project uses **Yarn 4** (Berry). Always use `yarn` commands, not `npm`.
