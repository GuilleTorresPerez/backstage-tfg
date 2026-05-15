# audit-backend

Audit log spine for the Aragon IDP. Persists medium / high / critical
auditor events into a PostgreSQL `audit_events` table and exposes a read API
gated by the `audit.event.read` permission.

Built as the first vertical slice of issue [#65](https://github.com/GuilleTorresPerez/backstage-tfg/issues/65)
(ENS `op.exp.8`).

## What this slice provides

- A custom `auditorServiceFactory` that replaces the core `auditor` service.
  It always logs to stdout (preserving the default behavior) and, for events
  of severity `medium` / `high` / `critical`, also inserts a row in
  `audit_events`.
- A root-scoped `auditStoreServiceFactory` that exposes the shared
  `AuditStore` singleton used by both the auditor service and the read API.
- `GET /api/audit/events` with query-param filters and cursor pagination,
  protected by the `audit.event.read` permission.
- A Knex migration that creates the `audit_events` table plus the four
  indexes required for the cursor predicate. Bookkeeping table:
  `audit__knex_migrations`.

The store API is intentionally narrow (`insert` + `query` only). There is
**no** `update` or `delete` exposed — the audit log is append-only by
contract.

## Requirements

This plugin requires **PostgreSQL**. The migration uses `pgcrypto` for UUID
generation and a Postgres-specific row-value comparison (`(ts, id) <
(?, ?)`) for stable cursor pagination. Pointing `backend.database.client`
at SQLite will fail on startup.

## Read API

```
GET /api/audit/events
  ?actor=<entityRef>
  &eventId=<id>
  &severity=<low|medium|high|critical>   (repeatable)
  &status=<initiated|succeeded|failed>
  &from=<ISO ts>
  &to=<ISO ts>
  &cursor=<opaque>
  &limit=<1..200>                        (default 50)
```

Returns `{ items, nextCursor, hasMore }`. Cursor pagination is stable under
concurrent inserts.

Auth:
- `401` if the request is unauthenticated.
- `403` if the permission policy denies `audit.event.read`.
- `200` otherwise.

## Configuration

The plugin honors `backend.auditor.severityLogLevelMappings` from
`app-config.yaml`. The recommended setup keeps `low` events visible in
stdout for debugging even though they are not persisted:

```yaml
backend:
  auditor:
    severityLogLevelMappings:
      low: info
```

## Running tests

Unit tests run normally:

```bash
yarn workspace @internal/backstage-plugin-audit-backend test
```

`AuditStore` has an integration suite that runs against a real PostgreSQL
database. It is gated on the `PG_TEST_URL` environment variable and will
`describe.skip` otherwise.

With the project's `docker-compose.yml` Postgres service running:

```bash
docker compose up -d postgres

PG_TEST_URL=postgres://backstage:<password>@localhost:5432/backstage \
  yarn workspace @internal/backstage-plugin-audit-backend test \
  --watchAll=false --testPathPatterns=AuditStore
```

The credentials come from your `.env` (`POSTGRES_USER`, `POSTGRES_PASSWORD`).
The test suite creates the migration in the same database that Backstage
uses; each test truncates `audit_events` before running, so it is safe to
share the dev database.

## Wiring

In `packages/backend/src/index.ts`:

```ts
import {
  auditStoreServiceFactory,
  auditorServiceFactory,
} from '@internal/backstage-plugin-audit-backend';

backend.add(import('@internal/backstage-plugin-audit-backend'));
backend.add(auditStoreServiceFactory);
backend.add(auditorServiceFactory);
```

The permission `audit.event.read` is granted to `platform-admin` and
`security-reviewer` in `packages/backend/src/permission-policy.ts`.
