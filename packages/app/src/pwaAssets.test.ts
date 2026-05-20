/* eslint-disable no-restricted-imports */
import { readFileSync } from 'fs';
import { join } from 'path';
import { desyTokens } from './theme/desyTokens';

const publicDir = join(__dirname, '..', 'public');
const srcDir = __dirname;

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const readJson = (file: string) =>
  JSON.parse(readFileSync(join(publicDir, file), 'utf8'));

const readPublic = (file: string) =>
  readFileSync(join(publicDir, file), 'utf8');

const readPublicBinary = (file: string) => readFileSync(join(publicDir, file));

const pngDimensions = (buf: Buffer) => ({
  width: buf.readUInt32BE(16),
  height: buf.readUInt32BE(20),
});

describe('PWA manifest reflects DESY identity', () => {
  const manifest = readJson('manifest.json');

  it('name is not the Backstage default', () => {
    expect(manifest.name).not.toBe('Backstage');
    expect(typeof manifest.name).toBe('string');
    expect(manifest.name.length).toBeGreaterThan(0);
  });

  it('short_name is not the Backstage default', () => {
    expect(manifest.short_name).not.toBe('Backstage');
    expect(typeof manifest.short_name).toBe('string');
    expect(manifest.short_name.length).toBeGreaterThan(0);
  });

  it('theme_color equals palette.primary.main from DESY tokens', () => {
    expect(manifest.theme_color.toLowerCase()).toBe(
      desyTokens.palette.primary.main.toLowerCase(),
    );
  });

  it('background_color equals palette.background.default from DESY tokens', () => {
    expect(manifest.background_color.toLowerCase()).toBe(
      desyTokens.palette.background.default.toLowerCase(),
    );
  });

  it('icons array references PNG files for the shipped sizes', () => {
    expect(Array.isArray(manifest.icons)).toBe(true);
    const pngs = manifest.icons.filter(
      (i: { type?: string }) => i.type === 'image/png',
    );
    const sizes = pngs.map((i: { sizes: string }) => i.sizes).sort();
    expect(sizes).toEqual(
      expect.arrayContaining(['16x16', '32x32', '192x192']),
    );
    for (const icon of pngs) {
      expect(icon.src).toMatch(/\.png$/);
    }
  });
});

describe.each([
  ['favicon-16x16.png', 16],
  ['favicon-32x32.png', 32],
  ['apple-touch-icon.png', 180],
  ['android-chrome-192x192.png', 192],
] as const)('%s is a DESY-derived PNG', (name, side) => {
  const buf = readPublicBinary(name);

  it('has the PNG magic header', () => {
    expect(buf.length).toBeGreaterThan(100);
    expect(buf.subarray(0, 8).equals(PNG_MAGIC)).toBe(true);
  });

  it(`is ${side}x${side}`, () => {
    const { width, height } = pngDimensions(buf);
    expect(width).toBe(side);
    expect(height).toBe(side);
  });

  it('carries a "DESY" provenance marker in a tEXt chunk', () => {
    // ImageMagick `-set comment "..."` writes a tEXt chunk; the keyword and
    // payload are plain ASCII in the file. Grepping the raw bytes is enough
    // to distinguish a DESY-derived asset from the Backstage default.
    expect(buf.toString('latin1')).toMatch(/DESY/);
  });
});

describe('favicon.ico is a single 32x32 entry', () => {
  const buf = readPublicBinary('favicon.ico');

  it('has the ICO magic header', () => {
    expect(buf.length).toBeGreaterThan(20);
    expect(buf.readUInt16LE(0)).toBe(0); // reserved
    expect(buf.readUInt16LE(2)).toBe(1); // type = 1 (ICO)
  });

  it('contains exactly one image entry', () => {
    // Per the acceptance criterion, favicon.ico is a 32x32 ICO — singular.
    expect(buf.readUInt16LE(4)).toBe(1);
  });

  it('that entry is 32x32', () => {
    // Image directory entry starts at offset 6: width byte, height byte.
    // 0 means 256; we expect literal 32.
    expect(buf.readUInt8(6)).toBe(32);
    expect(buf.readUInt8(7)).toBe(32);
  });
});

describe('safari-pinned-tab.svg is a monochrome mini wordmark', () => {
  const safariSvg = readPublic('safari-pinned-tab.svg');
  const logoIconSource = readFileSync(
    join(srcDir, 'components', 'Root', 'LogoIcon.tsx'),
    'utf8',
  );
  const barsDMatch = logoIconSource.match(/d="(m31\.997 6\.145[^"]+)"/);

  it('uses the mini wordmark viewBox 0 0 32 32', () => {
    expect(safariSvg).toMatch(/viewBox="0 0 32 32"/);
  });

  it('contains the cuatribarrada bars path d= from LogoIcon', () => {
    expect(barsDMatch).not.toBeNull();
    expect(safariSvg).toContain(barsDMatch![1]);
  });

  it('does not carry the DESY yellow background fill', () => {
    const lower = safariSvg.toLowerCase().replace(/\s+/g, '');
    expect(lower).not.toContain('rgb(252,228,0)');
    expect(lower).not.toContain('#fce400');
  });

  it('does not carry the DESY red bars fill', () => {
    expect(safariSvg.toLowerCase()).not.toContain('#dd171b');
  });

  it('declares at most one fill color, and that color is black', () => {
    const fills = Array.from(safariSvg.matchAll(/fill="([^"]+)"/g)).map(m =>
      m[1].toLowerCase(),
    );
    const unique = new Set(fills);
    expect(unique.size).toBeLessThanOrEqual(1);
    const color = [...unique][0];
    expect(
      unique.size === 0 || ['#000', '#000000', 'black'].includes(color),
    ).toBe(true);
  });
});

describe('index.html chrome colors match DESY tokens', () => {
  const indexHtml = readPublic('index.html');
  const desyBlue = desyTokens.palette.primary.main.toLowerCase();

  it('theme-color meta equals palette.primary.main', () => {
    const m = indexHtml.match(
      /<meta[^>]*name="theme-color"[^>]*content="([^"]+)"/s,
    );
    expect(m).not.toBeNull();
    expect(m![1].toLowerCase()).toBe(desyBlue);
  });

  it('mask-icon link color equals palette.primary.main', () => {
    // index.html embeds `<%= publicPath %>` placeholders whose `>` would
    // confuse `[^>]*`, so isolate the link block with a non-greedy `[\s\S]*?`.
    const linkBlocks = indexHtml.match(/<link\b[\s\S]*?\/>/g) ?? [];
    const maskLink = linkBlocks.find(block => /rel="mask-icon"/.test(block));
    expect(maskLink).toBeDefined();
    const colorMatch = maskLink!.match(/color="([^"]+)"/);
    expect(colorMatch).not.toBeNull();
    expect(colorMatch![1].toLowerCase()).toBe(desyBlue);
  });
});
