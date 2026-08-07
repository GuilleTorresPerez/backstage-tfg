/*
 * Exporta a SVG las vistas del workspace servido por Structurizr Lite.
 *
 * Uso:
 *   docker compose up -d structurizr
 *   npm install puppeteer            # fuera del repo; no es dependencia del IDP
 *   node docs/architecture/export-diagrams.js [url] [directorio de salida]
 *
 * Por defecto lee http://localhost:8080/workspace/1/diagrams y escribe en
 * docs/architecture/images/. Cada vista sale como <clave>.svg.
 *
 * Adaptado de https://github.com/structurizr/puppeteer (MIT), reducido a SVG.
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const url = process.argv[2] || 'http://localhost:8080/workspace/1/diagrams';
const outputDir =
  process.argv[3] || path.join(__dirname, 'images');

const RENDER_TIMEOUT_MS = 60000;

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.setDefaultTimeout(RENDER_TIMEOUT_MS);

  // Las figuras de la memoria van sobre papel: se fuerza el tema claro,
  // porque Structurizr Lite sigue la preferencia del sistema.
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: 'light' },
  ]);

  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForFunction(
    'window.structurizr && structurizr.scripting && structurizr.scripting.isDiagramRendered() === true',
  );

  const views = await page.evaluate(() => structurizr.scripting.getViews());

  for (const view of views) {
    await page.evaluate(key => structurizr.scripting.changeView(key), view.key);
    await page.waitForFunction(
      'structurizr.scripting.isDiagramRendered() === true',
    );

    const svg = await page.evaluate(() =>
      structurizr.scripting.exportCurrentDiagramToSVG({ includeMetadata: true }),
    );

    const file = path.join(outputDir, `${view.key}.svg`);
    fs.writeFileSync(file, svg);
    console.log(`${view.key} -> ${file}`);
  }

  await browser.close();
})();
