import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { auditStoreServiceRef } from './auditStoreService';

export const auditPlugin = createBackendPlugin({
  pluginId: 'audit',
  register(env) {
    env.registerInit({
      deps: {
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        permissions: coreServices.permissions,
        store: auditStoreServiceRef,
      },
      async init({ httpAuth, httpRouter, permissions, store }) {
        httpRouter.use(await createRouter({ store, permissions, httpAuth }));
      },
    });
  },
});
