import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  authProvidersExtensionPoint,
  createOAuthProviderFactory,
} from '@backstage/plugin-auth-node';
import { oidcAuthenticator } from '@backstage/plugin-auth-backend-module-oidc-provider';

export const oidcAuthProviderModule = createBackendModule({
  pluginId: 'auth',
  moduleId: 'oidc-provider',
  register(reg) {
    reg.registerInit({
      deps: { providers: authProvidersExtensionPoint },
      async init({ providers }) {
        providers.registerProvider({
          providerId: 'oidc',
          factory: createOAuthProviderFactory({
            authenticator: oidcAuthenticator,
            async signInResolver(info, ctx) {
              const preferredUsername =
                info.result.fullProfile.userinfo.preferred_username;
              if (!preferredUsername) {
                throw new Error(
                  'OIDC userinfo did not contain a preferred_username claim',
                );
              }
              return ctx.signInWithCatalogUser({
                entityRef: { name: preferredUsername },
              });
            },
          }),
        });
      },
    });
  },
});
