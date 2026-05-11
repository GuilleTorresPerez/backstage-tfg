#!/usr/bin/env node
/**
 * Script de verificación para RS-OUT-05
 * Comprueba:
 * 1. La regex de apiBaseUrl acepta/rechaza URLs correctamente
 * 2. El template nginx.conf.njk se renderiza correctamente con valores de ejemplo
 * 3. Los archivos esperados existen
 * 4. La CSP generada incluye la apiBaseUrl correctamente
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function ok(msg) { console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`); }
function fail(msg) { console.log(`${COLORS.red}✗${COLORS.reset} ${msg}`); process.exitCode = 1; }
function info(msg) { console.log(`${COLORS.cyan}ℹ${COLORS.reset} ${msg}`); }

let errors = 0;
function check(condition, passMsg, failMsg) {
  if (condition) { ok(passMsg); }
  else { fail(failMsg); errors++; }
}

// ---------------------------------------------------------------------------
// 1. PRUEBAS DE REGEX (apiBaseUrl pattern)
// ---------------------------------------------------------------------------
console.log('\n' + '='.repeat(60));
console.log('1. VALIDACIÓN DE REGEX: apiBaseUrl');
console.log('='.repeat(60));

const pattern = /^https:\/\/([a-zA-Z0-9_-]+\.)*aragon\.es(\/.*)?$/;

const validUrls = [
  'https://api.aragon.es',
  'https://api.desy.aragon.es',
  'https://mi-app.subdominio.aragon.es',
  'https://api.aragon.es/v1',
  'https://api.aragon.es/api/v2/users',
];

const invalidUrls = [
  'http://api.aragon.es',           // no es HTTPS
  'https://api.aragon.es:8443',     // puerto explícito (no cubierto por regex)
  'https://api.evil.com',           // dominio incorrecto
  'https://aragon.es.evil.com',     // subdomain squatting
  'https://fake-aragon.es',         // no termina exactamente en aragon.es
  'ftp://api.aragon.es',            // protocolo incorrecto
  '',                               // vacío
  'https://api.aragon.es.',         // punto al final
];

info(`Pattern: ${pattern.source}`);

for (const url of validUrls) {
  check(pattern.test(url), `Acepta URL válida: ${url}`, `Debería aceptar: ${url}`);
}
for (const url of invalidUrls) {
  check(!pattern.test(url), `Rechaza URL inválida: ${url}`, `Debería rechazar: ${url}`);
}

// ---------------------------------------------------------------------------
// 2. EXISTENCIA DE ARCHIVOS
// ---------------------------------------------------------------------------
console.log('\n' + '='.repeat(60));
console.log('2. EXISTENCIA DE ARCHIVOS ESPERADOS');
console.log('='.repeat(60));

const baseDir = path.resolve(__dirname, '..', 'examples', 'templates', 'frontend-angular-desy');
const expectedFiles = [
  'template.yaml',
  'skeleton-angular-layout/nginx.conf.njk',
  'skeleton-angular-layout/src/app/core/api/api.service.ts',
  'skeleton-angular-layout/src/environments/environment.ts.njk',
  'content/SECURITY.md',
];

for (const file of expectedFiles) {
  const fullPath = path.join(baseDir, file);
  check(fs.existsSync(fullPath), `Existe: ${file}`, `Falta archivo: ${file}`);
}

// ---------------------------------------------------------------------------
// 3. RENDERIZADO DEL TEMPLATE nginx.conf.njk
// ---------------------------------------------------------------------------
console.log('\n' + '='.repeat(60));
console.log('3. RENDERIZADO DE nginx.conf.njk');
console.log('='.repeat(60));

const nginxTemplatePath = path.join(baseDir, 'skeleton-angular-layout', 'nginx.conf.njk');
const nginxTemplate = fs.readFileSync(nginxTemplatePath, 'utf-8');

// Simular renderizado básico de Nunjucks: reemplazar {{ values.apiBaseUrl }}
const testApiBaseUrl = 'https://api.desy.aragon.es';
const renderedNginx = nginxTemplate.replace(/\{\{\s*values\.apiBaseUrl\s*\}\}/g, testApiBaseUrl);

info(`Renderizado con apiBaseUrl = ${testApiBaseUrl}`);

// Verificar que la CSP incluye la URL del backend
const cspMatch = renderedNginx.match(/connect-src[^;]+;/);
check(cspMatch !== null, 'CSP presente en nginx.conf', 'No se encontró CSP');

if (cspMatch) {
  const cspDirective = cspMatch[0];
  check(
    cspDirective.includes(testApiBaseUrl),
    `CSP connect-src incluye la apiBaseUrl: ${cspDirective.trim()}`,
    `CSP connect-src NO incluye la apiBaseUrl: ${cspDirective.trim()}`
  );
}

// Verificar que todos los headers de seguridad están presentes
const requiredHeaders = [
  'Strict-Transport-Security',
  'X-Frame-Options',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Permissions-Policy',
  'Cross-Origin-Opener-Policy',
  'Cross-Origin-Embedder-Policy',
  'Cross-Origin-Resource-Policy',
  'X-DNS-Prefetch-Control',
  'Content-Security-Policy',
];

for (const header of requiredHeaders) {
  check(
    renderedNginx.includes(header),
    `Header presente: ${header}`,
    `Falta header: ${header}`
  );
}

// Verificar que se usa 'always' en todos los add_header de seguridad
const addHeaderLines = renderedNginx.split('\n').filter(l => l.trim().startsWith('add_header'));
const allHaveAlways = addHeaderLines.every(l => l.includes('always'));
check(
  allHaveAlways,
  `Todos los add_header de seguridad usan 'always' (${addHeaderLines.length} directivas)`,
  'Algunos add_header no usan "always"'
);

// Verificar SPA fallback (try_files)
check(renderedNginx.includes('try_files $uri $uri/ /index.html'), 'SPA fallback configurado (try_files)', 'Falta SPA fallback');

// ---------------------------------------------------------------------------
// 4. VALIDACIÓN DEL TEMPLATE YAML DE BACKSTAGE
// ---------------------------------------------------------------------------
console.log('\n' + '='.repeat(60));
console.log('4. VALIDACIÓN DE template.yaml');
console.log('='.repeat(60));

const templateYamlPath = path.join(baseDir, 'template.yaml');
const templateYaml = fs.readFileSync(templateYamlPath, 'utf-8');

check(templateYaml.includes("pattern: '^https://([a-zA-Z0-9_-]+\\.)*aragon\\.es(/.*)?$'"),
  'template.yaml contiene la regex de validación',
  'template.yaml NO contiene la regex de validación'
);

// Verificar que el campo apiBaseUrl está en la lista de required
check(templateYaml.includes('apiBaseUrl'), 'template.yaml referencia apiBaseUrl', 'template.yaml no referencia apiBaseUrl');

// Verificar que el step apply-layout pasa apiBaseUrl a los valores
check(templateYaml.includes('apiBaseUrl: ${{ parameters.apiBaseUrl }}'),
  'template.yaml inyecta apiBaseUrl en el step apply-layout',
  'template.yaml NO inyecta apiBaseUrl en apply-layout'
);

// ---------------------------------------------------------------------------
// 5. VALIDACIÓN DE SECURITY.md
// ---------------------------------------------------------------------------
console.log('\n' + '='.repeat(60));
console.log('5. VALIDACIÓN DE SECURITY.md');
console.log('='.repeat(60));

const securityMdPath = path.join(baseDir, 'content', 'SECURITY.md');
const securityMd = fs.readFileSync(securityMdPath, 'utf-8');

const securityChecks = [
  ['Contiene referencia al ENS', /ENS|Esquema Nacional de Seguridad|RD 311\/2022/i],
  ['Documenta headers de nginx', /nginx\.conf|headers de seguridad/i],
  ['Documenta CSP', /Content-Security-Policy|CSP/i],
  ['Documenta CORS restrictivo', /CORS restrictivo|responsabilidad del backend/i],
  ['Incluye ejemplo de Spring Boot', /Spring Boot|CorsRegistry/i],
  ['Prohíbe Access-Control-Allow-Origin: *', /Access-Control-Allow-Origin.*\*/i],
  ['Incluye referencias normativas/técnicas', /OWASP|MDN|nginx\.org|cheatsheet/i],
];

for (const [desc, regex] of securityChecks) {
  check(regex.test(securityMd), `${desc}`, `SECURITY.md falta: ${desc}`);
}

// ---------------------------------------------------------------------------
// 6. RESUMEN
// ---------------------------------------------------------------------------
console.log('\n' + '='.repeat(60));
console.log('RESUMEN');
console.log('='.repeat(60));

if (errors === 0) {
  console.log(`${COLORS.green}✅ TODAS LAS VERIFICACIONES PASARON${COLORS.reset}`);
} else {
  console.log(`${COLORS.red}❌ ${errors} VERIFICACIÓN/ES FALLARON${COLORS.reset}`);
}
console.log('');
