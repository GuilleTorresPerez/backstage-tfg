import path from 'path';
import {
  coreServices,
  createServiceFactory,
  createServiceRef,
} from '@backstage/backend-plugin-api';
import { DatabaseManager } from '@backstage/backend-defaults/database';
import { AuditStore } from './AuditStore';

const MIGRATIONS_DIR = path.resolve(__dirname, '..', 'migrations');

export const auditStoreServiceRef = createServiceRef<AuditStore>({
  id: 'audit.store',
  scope: 'root',
});

export const auditStoreServiceFactory = createServiceFactory({
  service: auditStoreServiceRef,
  deps: {
    config: coreServices.rootConfig,
    logger: coreServices.rootLogger,
    lifecycle: coreServices.rootLifecycle,
  },
  async factory({ config, logger, lifecycle }) {
    const dbManager = DatabaseManager.fromConfig(config);
    const dbService = dbManager.forPlugin('audit', { logger, lifecycle });
    const knex = await dbService.getClient();
    await knex.migrate.latest({
      directory: MIGRATIONS_DIR,
      tableName: 'audit__knex_migrations',
    });
    return new AuditStore(knex);
  },
});
