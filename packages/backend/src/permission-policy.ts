import { createBackendModule, coreServices } from '@backstage/backend-plugin-api';
import {
  PolicyDecision,
  AuthorizeResult,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import { LoggerService } from '@backstage/backend-plugin-api';

type Role = 'developer' | 'platform-admin' | 'security-reviewer';

const GROUP_TO_ROLE: Record<string, Role> = {
  'group:default/developers': 'developer',
  'group:default/platform-admins': 'platform-admin',
  'group:default/security-reviewers': 'security-reviewer',
  developers: 'developer',
  'platform-admins': 'platform-admin',
  'security-reviewers': 'security-reviewer',
};

export function extractRoles(user?: PolicyQueryUser): Role[] {
  if (!user?.info?.ownershipEntityRefs) {
    return [];
  }

  const roles = new Set<Role>();
  for (const ref of user.info.ownershipEntityRefs) {
    const directRole = GROUP_TO_ROLE[ref];
    if (directRole) {
      roles.add(directRole);
    }

    const match = ref.match(/^group:[^/]+\/(.+)$/);
    if (match) {
      const mappedRole = GROUP_TO_ROLE[match[1]];
      if (mappedRole) {
        roles.add(mappedRole);
      }
    }
  }

  return Array.from(roles);
}

const PERMISSION_MATRIX: Record<string, Role[]> = {
  // Catalog: lectura (todos)
  'catalog.entity.read': ['developer', 'platform-admin', 'security-reviewer'],
  'catalog.location.read': ['developer', 'platform-admin', 'security-reviewer'],

  // Catalog: gestion (solo platform-admin)
  'catalog.entity.create': ['platform-admin'],
  'catalog.entity.delete': ['platform-admin'],
  'catalog.location.create': ['platform-admin'],
  'catalog.location.analyze': ['platform-admin'],
  'catalog.location.delete': ['platform-admin'],

  // Scaffolder: uso (developer + platform-admin)
  'scaffolder.template.parameter.read': ['developer', 'platform-admin'],
  'scaffolder.template.step.read': ['developer', 'platform-admin'],
  'scaffolder.action.execute': ['developer', 'platform-admin'],
  'scaffolder.task.create': ['developer', 'platform-admin'],
  'scaffolder.task.cancel': ['developer', 'platform-admin'],
  'scaffolder.template.management': ['platform-admin'],

  // Scaffolder: auditoria (platform-admin + security-reviewer)
  'scaffolder.task.read': ['platform-admin', 'security-reviewer'],
};

export class AragonPermissionPolicy implements PermissionPolicy {
  constructor(private readonly logger: LoggerService) {}

  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    const roles = extractRoles(user);

    this.logger.info(
      `Permission request: ${request.permission.name}, roles=[${roles.join(', ')}]`,
    );

    if (roles.length === 0) {
      return { result: AuthorizeResult.DENY };
    }

    const allowedRoles = PERMISSION_MATRIX[request.permission.name];

    if (!allowedRoles) {
      return { result: AuthorizeResult.DENY };
    }

    if (roles.some(role => allowedRoles.includes(role))) {
      return { result: AuthorizeResult.ALLOW };
    }

    return { result: AuthorizeResult.DENY };
  }
}

export const permissionPolicyModule = createBackendModule({
  pluginId: 'permission',
  moduleId: 'aragon-permission-policy',
  register(reg) {
    reg.registerInit({
      deps: { policy: policyExtensionPoint, logger: coreServices.logger },
      async init({ policy, logger }) {
        policy.setPolicy(new AragonPermissionPolicy(logger));
      },
    });
  },
});
