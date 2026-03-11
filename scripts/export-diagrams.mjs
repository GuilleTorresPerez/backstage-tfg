import puppeteer from 'puppeteer';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const DARK_SUFFIX = '-dark';

if (process.argv.length < 4) {
  console.log('Usage: node export-diagrams.mjs <structurizrUrl> <outputDir>');
  process.exit(1);
}

const url = process.argv[2];
const outputDir = process.argv[3];

await mkdir(outputDir, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();

// Enable dark mode before navigating
await page.evaluateOnNewDocument(() => {
  localStorage.setItem('structurizrDarkMode', 'true');
});

console.log(` - Opening ${url}`);
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

// Debug: log where we actually landed
const finalUrl = page.url();
const title = await page.title();
console.log(` - Page loaded: ${finalUrl} (title: "${title}")`);

const hasScripting = await page.evaluate(() => {
  return (
    typeof structurizr !== 'undefined' &&
    typeof structurizr.scripting !== 'undefined'
  );
});
console.log(` - structurizr.scripting available: ${hasScripting}`);

await page.waitForFunction(
  'structurizr.scripting && structurizr.scripting.isDiagramRendered() === true',
  { timeout: 60000 },
);

const views = await page.evaluate(() => {
  return structurizr.scripting.getViews();
});

console.log(` - Found ${views.length} view(s)`);

for (const view of views) {
  await page.evaluate(v => {
    structurizr.scripting.changeView(v.key);
  }, view);

  await page.waitForFunction(
    'structurizr.scripting.isDiagramRendered() === true',
    { timeout: 15000 },
  );

  const svg = await page.evaluate(() => {
    return structurizr.scripting.exportCurrentDiagramToSVG({
      includeMetadata: true,
    });
  });

  const filename = `${view.key}${DARK_SUFFIX}.svg`;
  const filepath = join(outputDir, filename);
  await writeFile(filepath, svg);
  console.log(` - Exported ${filename}`);
}

console.log(' - Finished');
await browser.close();
