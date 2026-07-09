import { readFileSync } from 'fs';
import path from 'path';
import { parseAllDocuments } from 'yaml';
import { groupEntityV1alpha1Validator } from '@backstage/catalog-model';

// The static file under test. Resolved from `packages/backend/src` (3 levels
// up = repo root) so it does not depend on Jest's cwd.
const ORG_AST_PATH = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'catalog',
  'seed',
  'org-ast.yaml',
);

type GroupEntity = {
  apiVersion: string;
  kind: string;
  metadata: { name: string };
  spec: { type: string; children?: string[]; members?: unknown[] };
};

function loadGroups(): GroupEntity[] {
  const text = readFileSync(ORG_AST_PATH, 'utf8');
  const docs = parseAllDocuments(text);
  return docs.map(d => d.toJS() as GroupEntity);
}

describe('catalog/seed/org-ast.yaml — AST 4-level hierarchy', () => {
  const groups = loadGroups();
  const byName = new Map(groups.map(g => [g.metadata.name, g]));

  it('parses as 8 valid Group entities against the Group.v1alpha1 schema', async () => {
    expect(groups).toHaveLength(8);
    for (const g of groups) {
      expect(g.kind).toBe('Group');
      const entity = {
        apiVersion: g.apiVersion,
        kind: g.kind,
        metadata: { name: g.metadata.name },
        spec: { type: g.spec.type, children: g.spec.children ?? [] },
      };
      await expect(
        groupEntityV1alpha1Validator.check(entity),
      ).resolves.toBeTruthy();
    }
  });

  it('defines exactly the 8 expected static groups', () => {
    expect(groups.map(g => g.metadata.name).sort()).toEqual(
      [
        'ast',
        'desarrollo',
        'desarrollo-backend',
        'desarrollo-web',
        'gobierno-datos',
        'plataforma',
        'seguridad',
        'sre',
      ].sort(),
    );
  });

  it('assigns the governance vocabulary to spec.type (ADR-0005)', () => {
    expect(byName.get('ast')?.spec.type).toBe('organization');
    for (const bu of ['desarrollo', 'plataforma', 'seguridad']) {
      expect(byName.get(bu)?.spec.type).toBe('business-unit');
    }
    for (const pa of [
      'desarrollo-web',
      'desarrollo-backend',
      'sre',
      'gobierno-datos',
    ]) {
      expect(byName.get(pa)?.spec.type).toBe('product-area');
    }
  });

  it('does not declare spec.members on any static node (ADR-0004)', () => {
    for (const g of groups) {
      expect(g.spec.members).toBeUndefined();
    }
  });

  it('wires the hierarchy via spec.children', () => {
    expect(byName.get('ast')?.spec.children).toEqual([
      'desarrollo',
      'plataforma',
      'seguridad',
    ]);
    expect(byName.get('desarrollo')?.spec.children).toEqual([
      'desarrollo-web',
      'desarrollo-backend',
    ]);
    expect(byName.get('plataforma')?.spec.children).toEqual(['sre']);
    expect(byName.get('seguridad')?.spec.children).toEqual(['gobierno-datos']);
  });

  it('product-areas point at the real teams (which come from Keycloak)', () => {
    expect(byName.get('desarrollo-web')?.spec.children).toEqual([
      'equipo-frontend',
    ]);
    expect(byName.get('desarrollo-backend')?.spec.children).toEqual([
      'equipo-spring',
    ]);
    expect(byName.get('sre')?.spec.children).toEqual(['platform-admins']);
    expect(byName.get('gobierno-datos')?.spec.children).toEqual([
      'security-reviewers',
    ]);
  });
});
