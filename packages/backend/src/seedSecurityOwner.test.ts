import { readFileSync } from 'fs';
import path from 'path';
import { parseAllDocuments } from 'yaml';
import {
  componentEntityV1alpha1Validator,
  systemEntityV1alpha1Validator,
} from '@backstage/catalog-model';

// The two seed files under test. Resolved from `packages/backend/src` (3
// levels up = repo root) so it does not depend on Jest's cwd — same pattern
// as orgAstCatalog.test.ts.
const SEED_DIR = path.resolve(__dirname, '..', '..', '..', 'catalog', 'seed');

type Entity = {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    annotations?: Record<string, string>;
  };
  spec: { owner: string };
};

function loadEntities(file: string): Entity[] {
  const text = readFileSync(path.join(SEED_DIR, file), 'utf8');
  return parseAllDocuments(text).map(d => d.toJS() as Entity);
}

const SECURITY_OWNER = 'group:default/security-reviewers';

describe('catalog/seed — security-owner annotation and owners (ADR-0008)', () => {
  const aragonIdp = loadEntities('system-aragon-idp.yaml');
  const portalCiudadano = loadEntities('system-portal-ciudadano.yaml');
  const all = [...aragonIdp, ...portalCiudadano];
  const byName = new Map(all.map(e => [e.metadata.name, e]));

  it('contains exactly the 4 expected seed entities', () => {
    expect(all.map(e => e.metadata.name).sort()).toEqual(
      [
        'aragon-idp',
        'portal-ciudadano',
        'portal-ciudadano-backend',
        'portal-ciudadano-frontend',
      ].sort(),
    );
  });

  it('every seed entity carries aragon.es/security-owner = security-reviewers', () => {
    for (const e of all) {
      expect(e.metadata.annotations?.['aragon.es/security-owner']).toBe(
        SECURITY_OWNER,
      );
    }
  });

  it('Components are owned by equipo-frontend (renamed from developers)', () => {
    const frontend = byName.get('portal-ciudadano-frontend');
    const backend = byName.get('portal-ciudadano-backend');
    expect(frontend?.spec.owner).toBe('group:equipo-frontend');
    expect(backend?.spec.owner).toBe('group:equipo-frontend');
  });

  it('Systems keep platform-admins as technical owner', () => {
    expect(byName.get('aragon-idp')?.spec.owner).toBe('group:platform-admins');
    expect(byName.get('portal-ciudadano')?.spec.owner).toBe(
      'group:platform-admins',
    );
  });

  it('seed entities validate against their backstage schemas', async () => {
    for (const e of all) {
      const validator =
        e.kind === 'System'
          ? systemEntityV1alpha1Validator
          : componentEntityV1alpha1Validator;
      await expect(validator.check(e)).resolves.toBeTruthy();
    }
  });
});
