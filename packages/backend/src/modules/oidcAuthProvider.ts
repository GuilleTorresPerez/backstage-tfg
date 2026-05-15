import {
  AuditorService,
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import {
  authProvidersExtensionPoint,
  createOAuthProviderFactory,
} from '@backstage/plugin-auth-node';
import { oidcAuthenticator } from '@backstage/plugin-auth-backend-module-oidc-provider';

type SignInInfo = {
  result: {
    fullProfile: {
      userinfo: { preferred_username?: string | null };
    };
  };
};

type SignInCtx = {
  signInWithCatalogUser(args: {
    entityRef: { name: string };
  }): Promise<unknown>;
};

export function createSignInResolver(auditor: AuditorService) {
  return async (info: SignInInfo, ctx: SignInCtx): Promise<unknown> => {
    const preferredUsername =
      info.result.fullProfile.userinfo.preferred_username;

    if (!preferredUsername) {
      const meta = { reason: 'no-preferred-username' };
      const event = await auditor.createEvent({
        eventId: 'user-sign-in',
        severityLevel: 'high',
        meta,
      });
      const error = new Error(
        'OIDC userinfo did not contain a preferred_username claim',
      );
      await event.fail({ meta, error });
      throw error;
    }

    const entityRef = `user:default/${preferredUsername}`;

    try {
      const result = await ctx.signInWithCatalogUser({
        entityRef: { name: preferredUsername },
      });
      const meta = { entityRef };
      const event = await auditor.createEvent({
        eventId: 'user-sign-in',
        severityLevel: 'medium',
        meta,
      });
      await event.success({ meta });
      return result;
    } catch (error) {
      const meta = { reason: 'user-not-in-catalog', entityRef };
      const event = await auditor.createEvent({
        eventId: 'user-sign-in',
        severityLevel: 'high',
        meta,
      });
      await event.fail({
        meta,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  };
}

export const oidcAuthProviderModule = createBackendModule({
  pluginId: 'auth',
  moduleId: 'oidc-provider',
  register(reg) {
    reg.registerInit({
      deps: {
        providers: authProvidersExtensionPoint,
        auditor: coreServices.auditor,
      },
      async init({ providers, auditor }) {
        providers.registerProvider({
          providerId: 'oidc',
          factory: createOAuthProviderFactory({
            authenticator: oidcAuthenticator,
            signInResolver: createSignInResolver(auditor) as any,
          }),
        });
      },
    });
  },
});
