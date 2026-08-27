import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { parse } from 'yaml';

const repoRoot = path.resolve(import.meta.dirname, '..');
const templateReposRoot = process.env.TEMPLATE_REPOS_ROOT
  ? path.resolve(process.env.TEMPLATE_REPOS_ROOT)
  : path.resolve(repoRoot, '../aragon-idp-templates');

const templateNames = ['frontend-angular-desy', 'backend-spring-boot'];
const failures = [];

for (const templateName of templateNames) {
  const manifestPath = path.join(
    templateReposRoot,
    templateName,
    'catalog-info.yaml',
  );

  if (!fs.existsSync(manifestPath)) {
    failures.push(`${templateName}: manifest not found at ${manifestPath}`);
    continue;
  }

  const manifest = parse(fs.readFileSync(manifestPath, 'utf8'));
  const steps = manifest.spec?.steps ?? [];
  const publishIndex = steps.findIndex(step => step.id === 'publish');
  const registerIndex = steps.findIndex(step => step.id === 'register');
  const techdocsIndex = steps.findIndex(step => step.id === 'publish-techdocs');

  if (publishIndex === -1 || registerIndex === -1 || techdocsIndex === -1) {
    failures.push(
      `${templateName}: publish, register and publish-techdocs are required`,
    );
  } else if (!(publishIndex < registerIndex && registerIndex < techdocsIndex)) {
    failures.push(
      `${templateName}: expected publish -> register -> publish-techdocs`,
    );
  }

  const publish = steps[publishIndex];
  if (
    publish?.input?.branches?.some(
      branch => branch.name === 'main' && branch.protect === true,
    )
  ) {
    failures.push(`${templateName}: publish must not protect main`);
  }
}

if (!fs.existsSync(path.join(repoRoot, 'docs/index.md'))) {
  failures.push(
    'aragon-idp-docs: docs/index.md is required for the TechDocs root',
  );
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('M05 scaffolder contract: PASS');
}
