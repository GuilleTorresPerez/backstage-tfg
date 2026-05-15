import knex, { Knex } from 'knex';
import { resolvePackagePath } from '@backstage/backend-plugin-api';

export const PG_TEST_URL = process.env.PG_TEST_URL;

export const itIfPg = PG_TEST_URL ? describe : describe.skip;

const MIGRATIONS_DIR = resolvePackagePath(
  '@internal/backstage-plugin-audit-backend',
  'migrations',
);

export async function createTestKnex(): Promise<Knex> {
  if (!PG_TEST_URL) {
    throw new Error('PG_TEST_URL not set');
  }
  const db = knex({
    client: 'pg',
    connection: PG_TEST_URL,
    pool: { min: 0, max: 5 },
  });
  await db.migrate.latest({
    directory: MIGRATIONS_DIR,
    tableName: 'audit__knex_migrations',
  });
  return db;
}

export async function resetAuditEvents(db: Knex): Promise<void> {
  await db('audit_events').delete();
}
