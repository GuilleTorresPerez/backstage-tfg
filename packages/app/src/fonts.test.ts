/* eslint-disable no-restricted-imports */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const srcRoot = __dirname;
const indexSource = readFileSync(join(srcRoot, 'index.tsx'), 'utf8');

function walkSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...walkSourceFiles(full));
    } else if (
      /\.(ts|tsx|js|jsx|css|html)$/.test(entry) &&
      full !== __filename
    ) {
      out.push(full);
    }
  }
  return out;
}

const expectedWeights = [
  '400',
  '600',
  '700',
  '400-italic',
  '600-italic',
  '700-italic',
];

describe('Open Sans self-hosting via @fontsource', () => {
  it.each(expectedWeights)(
    'index.tsx imports @fontsource/open-sans/%s.css',
    weight => {
      expect(indexSource).toContain(`@fontsource/open-sans/${weight}.css`);
    },
  );

  it.each(['fonts.googleapis.com', 'fonts.gstatic.com'])(
    'no source file references %s',
    forbidden => {
      const offenders = walkSourceFiles(srcRoot).filter(file =>
        readFileSync(file, 'utf8').includes(forbidden),
      );
      expect(offenders).toEqual([]);
    },
  );

  it('declares @fontsource/open-sans as a workspace dependency', () => {
    const pkg = JSON.parse(
      readFileSync(join(srcRoot, '..', 'package.json'), 'utf8'),
    );
    expect(pkg.dependencies).toHaveProperty('@fontsource/open-sans');
  });
});
