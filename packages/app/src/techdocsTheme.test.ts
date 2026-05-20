/* eslint-disable no-restricted-imports */
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { desyTokens } from './theme/desyTokens';

const repoRoot = join(__dirname, '..', '..', '..');

const readMkdocsConfig = () => {
  const raw = readFileSync(join(repoRoot, 'mkdocs.yml'), 'utf8');
  return yaml.load(raw) as {
    theme?: { name?: string; palette?: { primary?: string; accent?: string } };
    extra_css?: string[];
  };
};

describe('docs/desy-tokens.md records the TechDocs chromatic decision', () => {
  const doc = readFileSync(join(repoRoot, 'docs', 'desy-tokens.md'), 'utf8');

  it('mentions the TechDocs / mkdocs adjustment', () => {
    expect(doc).toMatch(/techdocs/i);
    expect(doc).toMatch(/mkdocs\.yml/);
  });

  it('cites the same hex as palette.primary.main from DESY tokens', () => {
    expect(doc.toLowerCase()).toContain(
      desyTokens.palette.primary.main.toLowerCase(),
    );
  });

  it('records the "TechDocs sin tema completo" limitation for the memoria', () => {
    expect(doc).toMatch(
      /tema completo|tema unificado|tema custom|tema material/i,
    );
  });
});

describe('mkdocs.yml opts into Material custom palette for DESY accent', () => {
  it('theme.palette.primary is "custom" (Material escape hatch for arbitrary hex)', () => {
    const config = readMkdocsConfig();
    expect(config.theme?.palette?.primary).toBe('custom');
  });

  it('extra_css references a DESY stylesheet under docs/', () => {
    const config = readMkdocsConfig();
    expect(Array.isArray(config.extra_css)).toBe(true);
    const desySheet = (config.extra_css ?? []).find(p => /desy/i.test(p));
    expect(desySheet).toBeDefined();
  });

  it('keeps the Material theme — no custom DESY-aware MkDocs theme substitution', () => {
    const config = readMkdocsConfig();
    expect(config.theme?.name).toBe('material');
  });

  it('the referenced stylesheet sets --md-primary-fg-color to palette.primary.main from DESY tokens', () => {
    const config = readMkdocsConfig();
    const desySheet = (config.extra_css ?? []).find(p => /desy/i.test(p))!;
    const css = readFileSync(join(repoRoot, 'docs', desySheet), 'utf8');
    const m = css.match(/--md-primary-fg-color:\s*([^;]+);/);
    expect(m).not.toBeNull();
    expect(m![1].trim().toLowerCase()).toBe(
      desyTokens.palette.primary.main.toLowerCase(),
    );
  });
});
