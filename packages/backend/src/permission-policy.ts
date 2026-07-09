import {
  createBackendModule,
  coreServices,
} from '@backstage/backend-plugin-api';
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
import { AuditorService, LoggerService } from '@backstage/backend-plugin-api';

type Role = 'developer' | 'platform-admin' | 'security-reviewer';

const GROUP_TO_ROLE: Record<string, Role> = {
  'group:default/equipo-frontend': 'developer',
  'group:default/equipo-spring': 'developer',
  'group:default/platform-admins': 'platform-admin',
  'group:default/security-reviewers': 'security-reviewer',
  'equipo-frontend': 'developer',
  'equipo-spring': 'developer',
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

  // Catalog: gestion (platform-admin + developer para scaffolder)
  'catalog.entity.create': ['platform-admin', 'developer'],
  'catalog.entity.delete': ['platform-admin'],
  'catalog.location.create': ['platform-admin', 'developer'],
  'catalog.location.analyze': ['platform-admin'],
  'catalog.location.delete': ['platform-admin'],

  // Scaffolder: uso (developer + platform-admin)
  'scaffolder.template.parameter.read': ['developer', 'platform-admin'],
  'scaffolder.template.step.read': ['developer', 'platform-admin'],
  'scaffolder.action.execute': ['developer', 'platform-admin'],
  'scaffolder.task.create': ['developer', 'platform-admin'],
  'scaffolder.task.cancel': ['developer', 'platform-admin'],
  'scaffolder.template.management': ['platform-admin'],

  // Scaffolder: auditoria (todos los roles)
  'scaffolder.task.read': ['developer', 'platform-admin', 'security-reviewer'],

  // Audit log: lectura (platform-admin + security-reviewer)
  'audit.event.read': ['platform-admin', 'security-reviewer'],
};

export type DenyReason = 'no-roles' | 'unknown-permission' | 'no-matching-role';

export class AragonPermissionPolicy implements PermissionPolicy {
  constructor(
    private readonly logger: LoggerService,
    private readonly auditor: AuditorService,
  ) {}

  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    const roles = extractRoles(user);
    const permission = request.permission.name;

    this.logger.info(
      `Permission request: ${permission}, roles=[${roles.join(', ')}]`,
    );

    let denyReason: DenyReason | undefined;
    if (roles.length === 0) {
      denyReason = 'no-roles';
    } else {
      const allowedRoles = PERMISSION_MATRIX[permission];
      if (!allowedRoles) {
        denyReason = 'unknown-permission';
      } else if (!roles.some(role => allowedRoles.includes(role))) {
        denyReason = 'no-matching-role';
      }
    }

    if (denyReason) {
      const event = await this.auditor.createEvent({
        eventId: 'permission-decision',
        severityLevel: 'medium',
        meta: { permission, roles, reason: denyReason },
      });
      await event.fail({
        meta: { permission, roles, reason: denyReason },
        error: new Error(`DENY: ${denyReason}`),
      });
      return { result: AuthorizeResult.DENY };
    }

    return { result: AuthorizeResult.ALLOW };
  }
}

export const permissionPolicyModule = createBackendModule({
  pluginId: 'permission',
  moduleId: 'aragon-permission-policy',
  register(reg) {
    reg.registerInit({
      deps: {
        policy: policyExtensionPoint,
        logger: coreServices.logger,
        auditor: coreServices.auditor,
      },
      async init({ policy, logger, auditor }) {
        policy.setPolicy(new AragonPermissionPolicy(logger, auditor));
      },
    });
  },
});
