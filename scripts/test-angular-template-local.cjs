#!/usr/bin/env node
/**
 * Script para testear localmente la plantilla frontend-angular-desy
 * sin necesidad de publicar en GitLab.
 *
 * Replica los pasos del scaffolder:
 *  1. Descarga el starter desy-angular desde Bitbucket.
 *  2. Aplica los templates de skeleton-angular-layout.
 *  3. Elimina los archivos de ejemplo.
 *  4. Genera el contenido (catalog-info, CI, docs...).
 *  5. Elimina runbook BCP si no aplica.
 *  6. Instala dependencias y levanta el servidor de desarrollo.
 *
 * Uso:
 *   toolbox run -c backstage-dev node scripts/test-angular-template-local.js [--sidebar] [--subheader] [--app-selector] [--ens=basico|medio|alto] [--header=minimal|standard|advanced|edit] [--position=relative|fixed|headroom]
 *
 * Ejemplos:
 *   # Layout estándar, básico, sin sidebar ni subheader
 *   toolbox run -c backstage-dev node scripts/test-angular-template-local.js
 *
 *   # Con sidebar, subheader y selector de apps
 *   toolbox run -c backstage-dev node scripts/test-angular-template-local.js --sidebar --subheader --app-selector
 *
 *   # Cabecera avanzada, ENS alto, posición fija
 *   toolbox run -c backstage-dev node scripts/test-angular-template-local.js --header=advanced --ens=alto --position=fixed
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawn } = require('child_process');
const nunjucks = require('nunjucks');

// ---------------------------------------------------------------------------
// PARSE CLI ARGS
// ---------------------------------------------------------------------------
function parseArgs() {
  const args = process.argv.slice(2);
  const flags = {
    sidebar: false,
    subheader: false,
    appSelector: false,
    ens: 'basico',
    header: 'standard',
    position: 'relative',
    name: 'test-angular-local',
  };

  for (const arg of args) {
    if (arg === '--sidebar') flags.sidebar = true;
    else if (arg === '--subheader') flags.subheader = true;
    else if (arg === '--app-selector') flags.appSelector = true;
    else if (arg.startsWith('--ens=')) flags.ens = arg.split('=')[1];
    else if (arg.startsWith('--header=')) flags.header = arg.split('=')[1];
    else if (arg.startsWith('--position=')) flags.position = arg.split('=')[1];
    else if (arg.startsWith('--name=')) flags.name = arg.split('=')[1];
    else console.warn(`⚠️  Flag desconocida: ${arg}`);
  }

  return flags;
}

// ---------------------------------------------------------------------------
// CONFIGURACIÓN
// ---------------------------------------------------------------------------
const cli = parseArgs();

const values = {
  name: cli.name,
  description: 'Frontend Angular DESY de prueba local',
  owner: 'group:default/platform-admin',
  system: 'system:default/portal',
  nivel_ens: cli.ens,
  apiBaseUrl: 'https://api.aragon.es',
  headerType: cli.header,
  headerPosition: cli.header === 'edit' ? 'fixed' : cli.position,
  hasAppSelector: cli.appSelector,
  hasSubheader: cli.subheader,
  hasSidebar: cli.sidebar,
  skeletonVersion: '0.1.0-bitbucket-master',
};

const TEMPLATE_DIR = path.resolve(
  __dirname,
  '../examples/templates/frontend-angular-desy',
);
const TARGET_DIR = path.resolve(`/tmp/${values.name}`);
const STARTER_TARBALL =
  'https://bitbucket.org/sdaragon/desy-angular-starter/get/master.tar.gz';

// ---------------------------------------------------------------------------
// AUXILIARES
// ---------------------------------------------------------------------------

function applyTemplates(srcDir, destDir, vars, options) {
  const {
    trimBlocks = false,
    lstripBlocks = false,
    templateFileExtension = false,
    replace = false,
  } = options;

  const env = new nunjucks.Environment(null, {
    trimBlocks: !!trimBlocks,
    lstripBlocks: !!lstripBlocks,
  });

  function walk(currentRel) {
    const fullSrc = path.join(srcDir, currentRel);
    const entries = fs.readdirSync(fullSrc, { withFileTypes: true });

    for (const entry of entries) {
      const entryRel = path.join(currentRel, entry.name);
      const srcPath = path.join(srcDir, entryRel);

      const ctx = { values: vars };
      const renderedName = env.renderString(entry.name, ctx);
      let destRel = path.join(currentRel, renderedName);

      if (templateFileExtension && entry.name.endsWith('.njk')) {
        const withoutExt = renderedName.slice(0, -4);
        destRel = path.join(currentRel, withoutExt);
      }

      const destPath = path.join(destDir, destRel);

      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        walk(entryRel);
      } else {
        if (fs.existsSync(destPath) && !replace) {
          console.log(`  [skip] ${destRel}`);
          continue;
        }

        const parent = path.dirname(destPath);
        if (!fs.existsSync(parent)) {
          fs.mkdirSync(parent, { recursive: true });
        }

        const raw = fs.readFileSync(srcPath, 'utf8');
        const rendered = env.renderString(raw, ctx);
        fs.writeFileSync(destPath, rendered);
        console.log(`  [write] ${destRel}`);
      }
    }
  }

  walk('.');
}

function rmIfExists(p) {
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    console.log(`  [delete] ${path.relative(TARGET_DIR, p)}`);
  }
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n🚀  Generando frontend Angular DESY en:', TARGET_DIR);
  console.log('    Parámetros:');
  console.log(`      Nombre:        ${values.name}`);
  console.log(`      Header:        ${values.headerType}`);
  console.log(`      Posición:      ${values.headerPosition}`);
  console.log(`      Sidebar:       ${values.hasSidebar}`);
  console.log(`      Subheader:     ${values.hasSubheader}`);
  console.log(`      App selector:  ${values.hasAppSelector}`);
  console.log(`      ENS:           ${values.nivel_ens}`);

  // 1. Limpiar destino
  if (fs.existsSync(TARGET_DIR)) {
    fs.rmSync(TARGET_DIR, { recursive: true });
  }
  fs.mkdirSync(TARGET_DIR, { recursive: true });

  // 2. Descargar y extraer starter
  console.log('\n📦  Descargando starter desde Bitbucket...');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'desy-starter-'));
  const tarPath = path.join(tmpDir, 'starter.tar.gz');
  execSync(`curl -sL ${STARTER_TARBALL} -o ${tarPath}`, { stdio: 'inherit' });
  execSync(`tar -xzf ${tarPath} -C ${TARGET_DIR} --strip-components=1`, {
    stdio: 'inherit',
  });

  // 3. Aplicar skeleton-angular-layout
  console.log('\n🔧  Aplicando layout (skeleton-angular-layout)...');
  const skeletonDir = path.join(TEMPLATE_DIR, 'skeleton-angular-layout');
  applyTemplates(skeletonDir, TARGET_DIR, values, {
    trimBlocks: true,
    lstripBlocks: true,
    templateFileExtension: true,
    replace: true,
  });

  // 4. Eliminar layouts de ejemplo del starter
  console.log('\n🧹  Eliminando archivos de ejemplo del starter...');
  const cleanupFiles = [
    'src/app/feature-modules/page-templates/layouts',
    'src/app/feature-modules/page-templates/components',
    'src/app/feature-modules/page-templates/page-templates.module.ts',
    'src/app/feature-modules/page-templates/page-templates-routing.module.ts',
  ];
  for (const f of cleanupFiles) {
    rmIfExists(path.join(TARGET_DIR, f));
  }

  // 5. Renderizar contenido adicional (catalog-info, CI, docs...)
  console.log('\n📝  Generando catalog-info, CI y docs...');
  const contentDir = path.join(TEMPLATE_DIR, 'content');
  applyTemplates(contentDir, TARGET_DIR, values, {
    lstripBlocks: true,
    templateFileExtension: false,
    replace: false,
  });

  // 6. Eliminar runbook BCP si nivel_ens != alto
  if (values.nivel_ens !== 'alto') {
    console.log('\n🛡️  Nivel ENS no es alto → eliminando runbook BCP...');
    rmIfExists(path.join(TARGET_DIR, 'docs/runbook-bcp.md'));
  }

  // 7. Instalar dependencias
  console.log('\n📥  Instalando dependencias (npm install)...');
  execSync('npm install', { cwd: TARGET_DIR, stdio: 'inherit' });

  // 8. Levantar servidor de desarrollo
  console.log('\n🌐  Levantando Angular dev server (npm run dev)...');
  console.log(
    '    Accede a http://localhost:4200 cuando termine de compilar.\n',
  );
  const child = spawn('npm', ['run', 'dev'], {
    cwd: TARGET_DIR,
    stdio: 'inherit',
    shell: true,
  });

  // Manejar cierre limpio
  process.on('SIGINT', () => {
    console.log('\n🛑  Deteniendo servidor...');
    child.kill('SIGINT');
    process.exit(0);
  });
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
