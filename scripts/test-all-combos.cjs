#!/usr/bin/env node
/**
 * Script maestro para generar múltiples combinaciones del template
 * frontend-angular-desy y verificar que compilan correctamente.
 *
 * Genera proyectos en /tmp/desy-combos/<nombre>/ y ejecuta `ng build`
 * en cada uno para validar que no hay errores de compilación.
 *
 * Uso:
 *   toolbox run -c backstage-dev node scripts/test-all-combos.cjs
 *
 * Si quieres levantar un proyecto específico para verlo en el navegador:
 *   cd /tmp/desy-combos/<nombre>
 *   npx ng serve --port 4200   (cambia el puerto para cada uno)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawn } = require('child_process');
const nunjucks = require('nunjucks');

const TEMPLATE_DIR = path.resolve(
  __dirname,
  '../examples/templates/frontend-angular-desy',
);
const BASE_TARGET_DIR = path.resolve('/tmp/desy-combos');
const STARTER_TARBALL =
  'https://bitbucket.org/sdaragon/desy-angular-starter/get/master.tar.gz';

// ---------------------------------------------------------------------------
// COMBINACIONES A PROBAR
// ---------------------------------------------------------------------------
const combos = [
  {
    name: '01-minimal-basico',
    desc: 'Minimal — página pública sin sesión',
    values: {
      headerType: 'minimal',
      headerPosition: 'relative',
      hasSidebar: false,
      hasSubheader: false,
      hasAppSelector: false,
      nivel_ens: 'basico',
    },
  },
  {
    name: '02-standard-basico',
    desc: 'Standard básico — webapp con sesión',
    values: {
      headerType: 'standard',
      headerPosition: 'relative',
      hasSidebar: false,
      hasSubheader: false,
      hasAppSelector: false,
      nivel_ens: 'basico',
    },
  },
  {
    name: '03-standard-sidebar',
    desc: 'Standard + sidebar',
    values: {
      headerType: 'standard',
      headerPosition: 'relative',
      hasSidebar: true,
      hasSubheader: false,
      hasAppSelector: false,
      nivel_ens: 'basico',
    },
  },
  {
    name: '04-standard-subheader',
    desc: 'Standard + subheader con pestañas',
    values: {
      headerType: 'standard',
      headerPosition: 'relative',
      hasSidebar: false,
      hasSubheader: true,
      hasAppSelector: false,
      nivel_ens: 'basico',
    },
  },
  {
    name: '05-standard-sidebar-subheader',
    desc: 'Standard + sidebar + subheader',
    values: {
      headerType: 'standard',
      headerPosition: 'relative',
      hasSidebar: true,
      hasSubheader: true,
      hasAppSelector: false,
      nivel_ens: 'basico',
    },
  },
  {
    name: '06-standard-headroom-sidebar',
    desc: 'Standard headroom + sidebar (auto-ocultar)',
    values: {
      headerType: 'standard',
      headerPosition: 'headroom',
      hasSidebar: true,
      hasSubheader: false,
      hasAppSelector: false,
      nivel_ens: 'basico',
    },
  },
  {
    name: '07-standard-fixed-all',
    desc: 'Standard fixed + sidebar + subheader + app-selector',
    values: {
      headerType: 'standard',
      headerPosition: 'fixed',
      hasSidebar: true,
      hasSubheader: true,
      hasAppSelector: true,
      nivel_ens: 'basico',
    },
  },
  {
    name: '08-advanced-all',
    desc: 'Advanced + sidebar + subheader + app-selector (portal megamenú)',
    values: {
      headerType: 'advanced',
      headerPosition: 'relative',
      hasSidebar: true,
      hasSubheader: true,
      hasAppSelector: true,
      nivel_ens: 'basico',
    },
  },
  {
    name: '09-edit-fixed',
    desc: 'Edit (formularios/CRUD) — cabecera fija forzada',
    values: {
      headerType: 'edit',
      headerPosition: 'fixed',
      hasSidebar: false,
      hasSubheader: false,
      hasAppSelector: false,
      nivel_ens: 'basico',
    },
  },
  {
    name: '10-edit-sidebar',
    desc: 'Edit + sidebar (CRUD con navegación lateral)',
    values: {
      headerType: 'edit',
      headerPosition: 'fixed',
      hasSidebar: true,
      hasSubheader: false,
      hasAppSelector: false,
      nivel_ens: 'basico',
    },
  },
  {
    name: '11-ens-medio',
    desc: 'Standard + sidebar, ENS medio (SAST + Trivy en CI)',
    values: {
      headerType: 'standard',
      headerPosition: 'relative',
      hasSidebar: true,
      hasSubheader: false,
      hasAppSelector: false,
      nivel_ens: 'medio',
    },
  },
  {
    name: '12-ens-alto-full',
    desc: 'Advanced + todo activado + ENS alto (incluye runbook BCP)',
    values: {
      headerType: 'advanced',
      headerPosition: 'fixed',
      hasSidebar: true,
      hasSubheader: true,
      hasAppSelector: true,
      nivel_ens: 'alto',
    },
  },
];

// Valores comunes para todos
const baseValues = {
  description: 'Frontend Angular DESY de prueba local',
  owner: 'group:default/platform-admin',
  system: 'system:default/portal',
  apiBaseUrl: 'https://api.aragon.es',
  skeletonVersion: '0.1.0-bitbucket-master',
};

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
          continue;
        }

        const parent = path.dirname(destPath);
        if (!fs.existsSync(parent)) {
          fs.mkdirSync(parent, { recursive: true });
        }

        const raw = fs.readFileSync(srcPath, 'utf8');
        const rendered = env.renderString(raw, ctx);
        fs.writeFileSync(destPath, rendered);
      }
    }
  }

  walk('.');
}

function rmIfExists(p) {
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
  }
}

function generateProject(combo, targetDir, tmpDir) {
  const values = { ...baseValues, name: combo.name, ...combo.values };

  // 1. Limpiar destino
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  // 2. Descargar y extraer starter (solo una vez, luego copiamos)
  // Para eficiencia, descomprimimos en tmpDir y copiamos
  execSync(
    `tar -xzf ${path.join(
      tmpDir,
      'starter.tar.gz',
    )} -C ${targetDir} --strip-components=1`,
    { stdio: 'pipe' },
  );

  // 3. Aplicar skeleton-angular-layout
  const skeletonDir = path.join(TEMPLATE_DIR, 'skeleton-angular-layout');
  applyTemplates(skeletonDir, targetDir, values, {
    trimBlocks: true,
    lstripBlocks: true,
    templateFileExtension: true,
    replace: true,
  });

  // 4. Eliminar layouts de ejemplo del starter
  const cleanupFiles = [
    'src/app/feature-modules/page-templates/layouts',
    'src/app/feature-modules/page-templates/components',
    'src/app/feature-modules/page-templates/page-templates.module.ts',
    'src/app/feature-modules/page-templates/page-templates-routing.module.ts',
  ];
  for (const f of cleanupFiles) {
    rmIfExists(path.join(targetDir, f));
  }

  // 5. Renderizar contenido adicional
  const contentDir = path.join(TEMPLATE_DIR, 'content');
  applyTemplates(contentDir, targetDir, values, {
    lstripBlocks: true,
    templateFileExtension: false,
    replace: false,
  });

  // 6. Eliminar runbook BCP si nivel_ens != alto
  if (values.nivel_ens !== 'alto') {
    rmIfExists(path.join(targetDir, 'docs/runbook-bcp.md'));
  }
}

function buildProject(targetDir) {
  try {
    execSync('npm install', { cwd: targetDir, stdio: 'pipe' });
    execSync('npx ng build', { cwd: targetDir, stdio: 'pipe' });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

async function main() {
  console.log(
    '🚀  Generando y validando combinaciones del template Angular DESY\n',
  );

  // Limpiar base
  if (fs.existsSync(BASE_TARGET_DIR)) {
    fs.rmSync(BASE_TARGET_DIR, { recursive: true });
  }
  fs.mkdirSync(BASE_TARGET_DIR, { recursive: true });

  // Descargar starter una sola vez
  console.log('📦  Descargando starter desy-angular...');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'desy-starter-'));
  const tarPath = path.join(tmpDir, 'starter.tar.gz');
  execSync(`curl -sL ${STARTER_TARBALL} -o ${tarPath}`, { stdio: 'inherit' });
  console.log('✅  Starter descargado\n');

  const results = [];

  for (const combo of combos) {
    const targetDir = path.join(BASE_TARGET_DIR, combo.name);
    const startTime = Date.now();

    process.stdout.write(`⏳  [${combo.name}] ${combo.desc} ... `);

    try {
      generateProject(combo, targetDir, tmpDir);
      const buildResult = buildProject(targetDir);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      if (buildResult.success) {
        console.log(`✅  OK (${duration}s)`);
        results.push({ name: combo.name, status: 'OK', duration });
      } else {
        console.log(`❌  BUILD FAILED (${duration}s)`);
        console.log(`     ${buildResult.error}`);
        results.push({
          name: combo.name,
          status: 'FAIL',
          error: buildResult.error,
        });
      }
    } catch (err) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`❌  ERROR (${duration}s)`);
      console.log(`     ${err.message}`);
      results.push({ name: combo.name, status: 'ERROR', error: err.message });
    }
  }

  // Resumen
  console.log('\n' + '='.repeat(60));
  console.log('RESUMEN');
  console.log('='.repeat(60));

  const ok = results.filter(r => r.status === 'OK');
  const fail = results.filter(r => r.status !== 'OK');

  for (const r of results) {
    const icon = r.status === 'OK' ? '✅' : '❌';
    const extra = r.duration ? ` (${r.duration}s)` : '';
    console.log(`${icon}  ${r.name}${extra}`);
  }

  console.log('\n' + '-'.repeat(60));
  console.log(`Total:  ${results.length}`);
  console.log(`✅ OK:   ${ok.length}`);
  console.log(`❌ Fail: ${fail.length}`);
  console.log('-'.repeat(60));

  if (fail.length > 0) {
    console.log('\n❌  Proyectos con errores:');
    for (const r of fail) {
      console.log(`   - ${r.name}: ${r.error || 'Build failed'}`);
    }
    process.exit(1);
  } else {
    console.log('\n🎉  ¡Todas las combinaciones compilan correctamente!');
    console.log('\nPara ver alguna en el navegador, ejecuta:');
    console.log(`   cd ${BASE_TARGET_DIR}/<nombre>`);
    console.log('   npx ng serve --port 4200');
    console.log('\nPuertos sugeridos para ver varias a la vez:');
    combos.forEach((c, i) => {
      console.log(`   ${c.name} → puerto ${4200 + i}`);
    });
  }
}

main().catch(err => {
  console.error('\n❌ Error inesperado:', err.message);
  process.exit(1);
});
