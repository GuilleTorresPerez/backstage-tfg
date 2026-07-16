import { customGroupTransformer } from './keycloakGroupTransformer';

function makeEntity(name: string, overrides?: Record<string, unknown>): any {
  return {
    apiVersion: 'backstage.io/v1beta1',
    kind: 'Group',
    metadata: { name },
    spec: { type: 'group', children: [], members: [], profile: { displayName: name } },
    ...overrides,
  };
}

describe('customGroupTransformer', () => {
  it('sets spec.type to "team"', async () => {
    const entity = makeEntity('equipo-frontend');

    const result = await customGroupTransformer(entity, {} as any, 'aragon-idp');

    expect(result?.spec?.type).toBe('team');
  });

  it('preserves metadata and other spec fields unchanged', async () => {
    const entity = makeEntity('equipo-spring');

    const result = await customGroupTransformer(entity, {} as any, 'aragon-idp');

    expect(result?.metadata.name).toBe('equipo-spring');
    expect(result?.spec.children).toEqual([]);
    expect(result?.spec.profile.displayName).toBe('equipo-spring');
  });

  it('works for all four teams', async () => {
    const teams = [
      'equipo-frontend',
      'equipo-spring',
      'platform-admins',
      'security-reviewers',
    ];

    for (const name of teams) {
      const entity = makeEntity(name);
      const result = await customGroupTransformer(entity, {} as any, 'aragon-idp');
      expect(result?.spec?.type).toBe('team');
    }
  });
});
