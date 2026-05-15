/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */

import { createBackend } from '@backstage/backend-defaults';
import {
  auditStoreServiceFactory,
  auditorServiceFactory,
} from '@internal/backstage-plugin-audit-backend';
import { oidcAuthProviderModule } from './modules/oidcAuthProvider';
import { tfgCatalogValidatorModule } from './modules/tfgCatalogValidator';
import { permissionPolicyModule } from './permission-policy';
import { techdocsPublishModule } from './modules/scaffolder/techdocsPublishModule';

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));

// scaffolder plugin
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-gitlab'));
backend.add(
  import('@backstage/plugin-scaffolder-backend-module-notifications'),
);
backend.add(techdocsPublishModule);

// techdocs plugin
backend.add(import('@backstage/plugin-techdocs-backend'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
// See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
backend.add(oidcAuthProviderModule);
// See https://backstage.io/docs/auth/guest/provider

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);

// See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// RC-DISC-01: descubrimiento automático sobre el grupo aragon-idp de GitLab.com
backend.add(import('@backstage/plugin-catalog-backend-module-gitlab'));

// Validador custom del prototipo:
// - RC-COMP-05 / RC-VALID-01: spec.system obligatorio en Component (error bloqueante)
// - RC-COMP-02 / RC-COMP-03 / RC-API-02 / RC-VALID-02: listas cerradas (warning)
backend.add(tfgCatalogValidatorModule);

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));
backend.add(permissionPolicyModule);

// search plugin
backend.add(import('@backstage/plugin-search-backend'));

// search engine
// See https://backstage.io/docs/features/search/search-engines
backend.add(import('@backstage/plugin-search-backend-module-pg'));

// search collators
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// kubernetes plugin
backend.add(import('@backstage/plugin-kubernetes-backend'));

// notifications and signals plugins
backend.add(import('@backstage/plugin-notifications-backend'));
backend.add(import('@backstage/plugin-signals-backend'));

backend.add(
  import('@backstage-community/plugin-catalog-backend-module-keycloak'),
);

// audit-log plugin (issue #65)
// - audit-backend mounts GET /api/audit/events
// - auditStoreServiceFactory exposes a shared AuditStore singleton
// - auditorServiceFactory replaces the core auditor: stdout + persistence
backend.add(import('@internal/backstage-plugin-audit-backend'));
backend.add(auditStoreServiceFactory);
backend.add(auditorServiceFactory);

backend.start();
