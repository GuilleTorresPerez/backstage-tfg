import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  GroupTransformer,
  keycloakTransformerExtensionPoint,
} from '@backstage-community/plugin-catalog-backend-module-keycloak';

export const customGroupTransformer: GroupTransformer = async (entity, _group, _realm) => {
  return { ...entity, spec: { ...entity.spec, type: 'team' } };
};

export const keycloakGroupTransformerModule = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'keycloak-group-type',
  register(reg) {
    reg.registerInit({
      deps: {
        keycloak: keycloakTransformerExtensionPoint,
      },
      async init({ keycloak }) {
        keycloak.setGroupTransformer(customGroupTransformer);
      },
    });
  },
});
