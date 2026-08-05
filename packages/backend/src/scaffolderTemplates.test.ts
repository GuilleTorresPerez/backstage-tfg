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

type TemplateManifest = {
  spec: { owner: string };
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

// The golden-path templates (backend-spring-boot, frontend-angular-desy) no
// longer live here: they were extracted to their own repositories under
// `aragon-idp/templates/` so the catalog ingests them by discovery instead of
// by a declared location. Their owner / security-owner / CODEOWNERS
// assertions (ADR-0006, ADR-0008) left with them — this suite can only cover
// what is still on disk.
describe('examples/templates — plantillas que siguen en el repositorio', () => {
  describe('desy-project (example template, unchanged)', () => {
    it('is not given a security-owner annotation and keeps its example owner', () => {
      const manifest = loadManifest('desy-project');
      const catalogInfo = readFile('desy-project', 'content/catalog-info.yaml');
      expect(manifest.spec.owner).toBe('user:guest');
      expect(catalogInfo).not.toContain('aragon.es/security-owner');
    });
  });
});
