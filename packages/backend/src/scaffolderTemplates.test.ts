import { readFileSync } from 'fs';
import path from 'path';
import { parseDocument } from 'yaml';

// The templates under test. Resolved from `packages/backend/src` (3 levels
// up = repo root) so it does not depend on Jest's cwd — same pattern as
// orgAstCatalog.test.ts and seedSecurityOwner.test.ts.
const TEMPLATES_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'examples',
  'templates',
);

type OwnerParam = {
  'ui:field'?: string;
  default?: string;
};

type ParamStep = { properties: Record<string, OwnerParam> };

type TemplateManifest = {
  spec: { owner: string; parameters: ParamStep[] };
};

function loadManifest(template: string): TemplateManifest {
  const text = readFileSync(
    path.join(TEMPLATES_DIR, template, 'template.yaml'),
    'utf8',
  );
  return parseDocument(text).toJS() as TemplateManifest;
}

function readFile(template: string, rel: string): string {
  return readFileSync(path.join(TEMPLATES_DIR, template, rel), 'utf8');
}

// The owner parameter uses ui:field: MyGroupsPicker; its `default` is the
// pre-selected team when the logged-in user is a member of it, so running a
// template without customizing the owner assigns the component to that team.
function findOwnerPicker(manifest: TemplateManifest): OwnerParam {
  for (const step of manifest.spec.parameters) {
    for (const key of Object.keys(step.properties)) {
      const param = step.properties[key];
      if (param['ui:field'] === 'MyGroupsPicker') return param;
    }
  }
  throw new Error('No MyGroupsPicker parameter found in template manifest');
}

const SECURITY_OWNER = 'group:default/security-reviewers';

describe('examples/templates — golden-path owners, security-owner, CODEOWNERS', () => {
  describe('backend-spring-boot', () => {
    const manifest = loadManifest('backend-spring-boot');
    const catalogInfo = readFile(
      'backend-spring-boot',
      'content/catalog-info.yaml',
    );
    const codeowners = readFile('backend-spring-boot', 'content/CODEOWNERS');

    it('template spec.owner is equipo-spring (team custodian of the golden path)', () => {
      expect(manifest.spec.owner).toBe('group:default/equipo-spring');
    });

    it('owner parameter defaults to equipo-spring', () => {
      expect(findOwnerPicker(manifest).default).toBe(
        'group:default/equipo-spring',
      );
    });

    it('catalog-info.yaml carries security-owner and keeps the ENS annotations', () => {
      expect(catalogInfo).toContain(
        `aragon.es/security-owner: ${SECURITY_OWNER}`,
      );
      expect(catalogInfo).toContain('aragon.es/nivel-ens:');
      expect(catalogInfo).toContain('aragon.es/skeleton-version:');
    });

    it('CODEOWNERS points the rest of the repo at @equipo-spring and keeps @security-reviewers', () => {
      expect(codeowners).toMatch(/^\*\s+@equipo-spring\s*$/m);
      expect(codeowners).toContain('@security-reviewers');
      expect(codeowners).not.toContain('@platform-admin');
    });
  });

  describe('frontend-angular-desy', () => {
    const manifest = loadManifest('frontend-angular-desy');
    const catalogInfo = readFile(
      'frontend-angular-desy',
      'content/catalog-info.yaml',
    );
    const codeowners = readFile('frontend-angular-desy', 'content/CODEOWNERS');

    it('template spec.owner is equipo-frontend (team custodian of the golden path)', () => {
      expect(manifest.spec.owner).toBe('group:default/equipo-frontend');
    });

    it('owner parameter defaults to equipo-frontend', () => {
      expect(findOwnerPicker(manifest).default).toBe(
        'group:default/equipo-frontend',
      );
    });

    it('catalog-info.yaml carries security-owner and keeps the ENS annotations', () => {
      expect(catalogInfo).toContain(
        `aragon.es/security-owner: ${SECURITY_OWNER}`,
      );
      expect(catalogInfo).toContain('aragon.es/nivel-ens:');
      expect(catalogInfo).toContain('aragon.es/skeleton-version:');
    });

    it('CODEOWNERS points the rest of the repo at @equipo-frontend and keeps @security-reviewers', () => {
      expect(codeowners).toMatch(/^\*\s+@equipo-frontend\s*$/m);
      expect(codeowners).toContain('@security-reviewers');
      expect(codeowners).not.toContain('@platform-admin');
    });
  });

  describe('desy-project (example template, unchanged)', () => {
    it('is not given a security-owner annotation and keeps its example owner', () => {
      const manifest = loadManifest('desy-project');
      const catalogInfo = readFile('desy-project', 'content/catalog-info.yaml');
      expect(manifest.spec.owner).toBe('user:guest');
      expect(catalogInfo).not.toContain('aragon.es/security-owner');
    });
  });
});
