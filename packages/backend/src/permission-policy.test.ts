import { AragonPermissionPolicy, extractRoles } from './permission-policy';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import {
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  child: jest.fn(),
};

function makeQuery(name: string): PolicyQuery {
  return {
    permission: { name, attributes: { action: 'read' } },
  } as PolicyQuery;
}

function makeUser(refs: string[]): PolicyQueryUser {
  return {
    info: {
      ownershipEntityRefs: refs,
      userEntityRef: 'user:default/test',
      type: 'user',
    },
  } as unknown as PolicyQueryUser;
}

describe('extractRoles', () => {
  it('extracts developer from group:default/developers', () => {
    expect(extractRoles(makeUser(['group:default/developers']))).toEqual([
      'developer',
    ]);
  });

  it('extracts platform-admin from group:default/platform-admins', () => {
    expect(extractRoles(makeUser(['group:default/platform-admins']))).toEqual([
      'platform-admin',
    ]);
  });

  it('extracts security-reviewer from group:default/security-reviewers', () => {
    expect(
      extractRoles(makeUser(['group:default/security-reviewers'])),
    ).toEqual(['security-reviewer']);
  });

  it('returns empty array for unknown groups', () => {
    expect(extractRoles(makeUser(['group:default/unknown']))).toEqual([]);
  });

  it('returns empty array when user is undefined', () => {
    expect(extractRoles(undefined)).toEqual([]);
  });

  it('returns empty array when ownershipEntityRefs is empty', () => {
    expect(extractRoles(makeUser([]))).toEqual([]);
  });

  it('returns union of multiple roles (OR semantics)', () => {
    const roles = extractRoles(
      makeUser([
        'group:default/platform-admins',
        'group:default/security-reviewers',
      ]),
    );
    expect(roles).toContain('platform-admin');
    expect(roles).toContain('security-reviewer');
    expect(roles).toHaveLength(2);
  });
});

describe('AragonPermissionPolicy', () => {
  const policy = new AragonPermissionPolicy(mockLogger as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Catalog permissions', () => {
    it('allows all roles to read catalog entities', async () => {
      for (const user of [
        makeUser(['group:default/developers']),
        makeUser(['group:default/platform-admins']),
        makeUser(['group:default/security-reviewers']),
      ]) {
        const result = await policy.handle(
          makeQuery('catalog.entity.read'),
          user,
        );
        expect(result.result).toBe(AuthorizeResult.ALLOW);
      }
    });

    it('allows platform-admin to create location', async () => {
      const result = await policy.handle(
        makeQuery('catalog.location.create'),
        makeUser(['group:default/platform-admins']),
      );
      expect(result.result).toBe(AuthorizeResult.ALLOW);
    });

    it('allows developer to create location (from scaffolder)', async () => {
      const result = await policy.handle(
        makeQuery('catalog.location.create'),
        makeUser(['group:default/developers']),
      );
      expect(result.result).toBe(AuthorizeResult.ALLOW);
    });

    it('allows developer to create catalog entity (from scaffolder)', async () => {
      const result = await policy.handle(
        makeQuery('catalog.entity.create'),
        makeUser(['group:default/developers']),
      );
      expect(result.result).toBe(AuthorizeResult.ALLOW);
    });

    it('denies developer from deleting catalog entity', async () => {
      const result = await policy.handle(
        makeQuery('catalog.entity.delete'),
        makeUser(['group:default/developers']),
      );
      expect(result.result).toBe(AuthorizeResult.DENY);
    });
  });

  describe('Scaffolder permissions', () => {
    it('allows developer to execute template', async () => {
      const result = await policy.handle(
        makeQuery('scaffolder.task.create'),
        makeUser(['group:default/developers']),
      );
      expect(result.result).toBe(AuthorizeResult.ALLOW);
    });

    it('allows developer to read template steps', async () => {
      const result = await policy.handle(
        makeQuery('scaffolder.template.step.read'),
        makeUser(['group:default/developers']),
      );
      expect(result.result).toBe(AuthorizeResult.ALLOW);
    });

    it('allows security-reviewer to read task logs', async () => {
      const result = await policy.handle(
        makeQuery('scaffolder.task.read'),
        makeUser(['group:default/security-reviewers']),
      );
      expect(result.result).toBe(AuthorizeResult.ALLOW);
    });

    it('allows developer to read task logs', async () => {
      const result = await policy.handle(
        makeQuery('scaffolder.task.read'),
        makeUser(['group:default/developers']),
      );
      expect(result.result).toBe(AuthorizeResult.ALLOW);
    });

    it('denies security-reviewer from executing template', async () => {
      const result = await policy.handle(
        makeQuery('scaffolder.task.create'),
        makeUser(['group:default/security-reviewers']),
      );
      expect(result.result).toBe(AuthorizeResult.DENY);
    });

    it('denies security-reviewer from reading template parameters', async () => {
      const result = await policy.handle(
        makeQuery('scaffolder.template.parameter.read'),
        makeUser(['group:default/security-reviewers']),
      );
      expect(result.result).toBe(AuthorizeResult.DENY);
    });

    it('allows platform-admin to cancel any task', async () => {
      const result = await policy.handle(
        makeQuery('scaffolder.task.cancel'),
        makeUser(['group:default/platform-admins']),
      );
      expect(result.result).toBe(AuthorizeResult.ALLOW);
    });
  });

  describe('Multi-role user (OR semantics)', () => {
    it('allows platform-admin + security-reviewer to execute platform-admin actions', async () => {
      const result = await policy.handle(
        makeQuery('catalog.location.create'),
        makeUser([
          'group:default/platform-admins',
          'group:default/security-reviewers',
        ]),
      );
      expect(result.result).toBe(AuthorizeResult.ALLOW);
    });

    it('allows platform-admin + security-reviewer to read task logs', async () => {
      const result = await policy.handle(
        makeQuery('scaffolder.task.read'),
        makeUser([
          'group:default/platform-admins',
          'group:default/security-reviewers',
        ]),
      );
      expect(result.result).toBe(AuthorizeResult.ALLOW);
    });
  });

  describe('Default deny', () => {
    it('denies unlisted permissions', async () => {
      const result = await policy.handle(
        makeQuery('some.unknown.permission'),
        makeUser(['group:default/developers']),
      );
      expect(result.result).toBe(AuthorizeResult.DENY);
    });

    it('denies any action for user without group', async () => {
      const result = await policy.handle(
        makeQuery('catalog.entity.read'),
        makeUser([]),
      );
      expect(result.result).toBe(AuthorizeResult.DENY);
    });

    it('denies any action for undefined user', async () => {
      const result = await policy.handle(
        makeQuery('catalog.entity.read'),
        undefined,
      );
      expect(result.result).toBe(AuthorizeResult.DENY);
    });
  });
});
