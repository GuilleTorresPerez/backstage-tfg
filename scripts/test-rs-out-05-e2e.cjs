#!/usr/bin/env node
/**
 * Script de prueba end-to-end para RS-OUT-05.
 * Replica los pasos 1-5 del Scaffolder (sin npm install ni dev server)
 * y verifica que nginx.conf, SECURITY.md y environment.ts se generen correctamente.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const nunjucks = require('nunjucks');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

function ok(msg) {
  console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`);
}
function fail(msg) {
  console.log(`${COLORS.red}✗${COLORS.reset} ${msg}`);
}
function info(msg) {
  console.log(`${COLORS.cyan}ℹ${COLORS.reset} ${msg}`);
}
function warn(msg) {
  console.log(`${COLORS.yellow}⚠${COLORS.reset} ${msg}`);
}

let errors = 0;
function check(condition, passMsg, failMsg) {
  if (condition) {
    ok(passMsg);
  } else {
    fail(failMsg);
    errors++;
  }
}

// ---------------------------------------------------------------------------
// CONFIGURACIÓN
// ---------------------------------------------------------------------------
const values = {
  name: 'test-rs-out-05',
  description: 'Frontend Angular DESY de prueba RS-OUT-05',
  owner: 'group:default/platform-admin',
  system: 'system:default/portal',
  nivel_ens: 'medio',
  apiBaseUrl: 'https://api.desy.aragon.es',
  headerType: 'standard',
  headerPosition: 'relative',
  hasAppSelector: false,
  hasSubheader: false,
  hasSidebar: false,
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
// AUXILIARES (copiados de test-angular-template-local.cjs)
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
  console.log('\n' + '='.repeat(60));
  console.log('PRUEBA END-TO-END: RS-OUT-05');
  console.log('='.repeat(60));
  info(`Directorio destino: ${TARGET_DIR}`);
  info(`apiBaseUrl: ${values.apiBaseUrl}`);

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
  ok('Starter descargado y extraído');

  // 3. Aplicar skeleton-angular-layout
  console.log('\n🔧  Aplicando skeleton-angular-layout...');
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

  // 5. Renderizar contenido adicional
  console.log(
    '\n📝  Generando contenido adicional (catalog-info, CI, docs)...',
  );
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

  // ---------------------------------------------------------------------------
  // VERIFICACIONES SOBRE ARCHIVOS GENERADOS
  // ---------------------------------------------------------------------------
  console.log('\n' + '='.repeat(60));
  console.log('VERIFICACIÓN DE ARCHIVOS GENERADOS');
  console.log('='.repeat(60));

  // 6.1 nginx.conf
  const nginxPath = path.join(TARGET_DIR, 'nginx.conf');
  check(
    fs.existsSync(nginxPath),
    'nginx.conf generado',
    'nginx.conf NO generado',
  );

  if (fs.existsSync(nginxPath)) {
    const nginxContent = fs.readFileSync(nginxPath, 'utf-8');
    check(
      nginxContent.includes(values.apiBaseUrl),
      `nginx.conf contiene apiBaseUrl: ${values.apiBaseUrl}`,
      'nginx.conf NO contiene la apiBaseUrl',
    );
    check(
      nginxContent.includes('Content-Security-Policy'),
      'nginx.conf incluye header CSP',
      'nginx.conf NO incluye CSP',
    );
    check(
      nginxContent.includes('Strict-Transport-Security'),
      'nginx.conf incluye header HSTS',
      'nginx.conf NO incluye HSTS',
    );
    check(
      nginxContent.includes('try_files $uri $uri/ /index.html'),
      'nginx.conf tiene SPA fallback (try_files)',
      'nginx.conf NO tiene SPA fallback',
    );
  }

  // 6.2 SECURITY.md
  const securityPath = path.join(TARGET_DIR, 'SECURITY.md');
  check(
    fs.existsSync(securityPath),
    'SECURITY.md generado',
    'SECURITY.md NO generado',
  );

  if (fs.existsSync(securityPath)) {
    const securityContent = fs.readFileSync(securityPath, 'utf-8');
    check(
      securityContent.includes('Content-Security-Policy'),
      'SECURITY.md documenta CSP',
      'SECURITY.md NO documenta CSP',
    );
    check(
      securityContent.includes('CORS'),
      'SECURITY.md documenta CORS',
      'SECURITY.md NO documenta CORS',
    );
  }

  // 6.3 environment.ts
  const envPath = path.join(TARGET_DIR, 'src/environments/environment.ts');
  check(
    fs.existsSync(envPath),
    'environment.ts generado',
    'environment.ts NO generado',
  );

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    check(
      envContent.includes(values.apiBaseUrl),
      `environment.ts contiene apiBaseUrl: ${values.apiBaseUrl}`,
      'environment.ts NO contiene apiBaseUrl',
    );
  }

  // 6.4 api.service.ts
  const apiServicePath = path.join(
    TARGET_DIR,
    'src/app/core/api/api.service.ts',
  );
  check(
    fs.existsSync(apiServicePath),
    'api.service.ts presente',
    'api.service.ts NO presente',
  );

  if (fs.existsSync(apiServicePath)) {
    const apiContent = fs.readFileSync(apiServicePath, 'utf-8');
    check(
      apiContent.includes('environment.apiBaseUrl'),
      'api.service.ts consume environment.apiBaseUrl',
      'api.service.ts NO consume environment.apiBaseUrl',
    );
  }

  // 6.5 catalog-info.yaml
  const catalogPath = path.join(TARGET_DIR, 'catalog-info.yaml');
  check(
    fs.existsSync(catalogPath),
    'catalog-info.yaml generado',
    'catalog-info.yaml NO generado',
  );

  // 6.6 .gitlab-ci.yml
  const ciPath = path.join(TARGET_DIR, '.gitlab-ci.yml');
  check(
    fs.existsSync(ciPath),
    '.gitlab-ci.yml generado',
    '.gitlab-ci.yml NO generado',
  );

  // 6.7 runbook-bcp.md eliminado (nivel_ens=medio)
  const bcpPath = path.join(TARGET_DIR, 'docs/runbook-bcp.md');
  check(
    !fs.existsSync(bcpPath),
    'runbook-bcp.md eliminado (ENS medio)',
    'runbook-bcp.md NO debería existir con ENS medio',
  );

  // 6.8 Verificar que los layouts de ejemplo fueron eliminados
  const exampleLayoutPath = path.join(
    TARGET_DIR,
    'src/app/feature-modules/page-templates/layouts',
  );
  check(
    !fs.existsSync(exampleLayoutPath),
    'Layouts de ejemplo eliminados',
    'Layouts de ejemplo NO eliminados',
  );

  // ---------------------------------------------------------------------------
  // RESUMEN
  // ---------------------------------------------------------------------------
  console.log('\n' + '='.repeat(60));
  console.log('RESUMEN');
  console.log('='.repeat(60));

  if (errors === 0) {
    console.log(
      `${COLORS.green}✅ TODAS LAS VERIFICACIONES PASARON${COLORS.reset}`,
    );
    console.log(`\n📂 Archivos generados en: ${TARGET_DIR}`);
    console.log('   Puedes inspeccionar nginx.conf, SECURITY.md, etc.');
  } else {
    console.log(
      `${COLORS.red}❌ ${errors} VERIFICACIÓN/ES FALLARON${COLORS.reset}`,
    );
  }

  // Limpieza opcional: comentar la siguiente línea si quieres inspeccionar los archivos
  // fs.rmSync(TARGET_DIR, { recursive: true, force: true });
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
