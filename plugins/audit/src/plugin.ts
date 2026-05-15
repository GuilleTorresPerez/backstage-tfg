import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { AuditClient, auditApiRef } from './api';
import { rootRouteRef } from './routes';

export const auditPlugin = createPlugin({
  id: 'audit',
  apis: [
    createApiFactory({
      api: auditApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new AuditClient({ discoveryApi, fetchApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const AuditPage = auditPlugin.provide(
  createRoutableExtension({
    name: 'AuditPage',
    component: () => import('./components/AuditPage').then(m => m.AuditPage),
    mountPoint: rootRouteRef,
  }),
);
