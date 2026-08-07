/**
 * Vérification des budgets de performance du PRD §8, exécutée après le build.
 *
 * Le dépassement fait échouer la construction plutôt que de produire un rapport
 * que personne ne lit (design.md, risques).
 *
 * Deux budgets sont mesurés, tous deux en gzip :
 *
 *  - JS : la somme de tous les modules JavaScript émis. C'est une borne
 *    supérieure du JavaScript du premier chargement, puisqu'une route donnée
 *    n'en charge qu'un sous-ensemble. Un budget tenu ici est donc tenu partout.
 *
 *  - Premier chargement : le document HTML le plus lourd, plus l'ensemble des
 *    feuilles de style, plus le JavaScript ci-dessus. Même logique : on
 *    surestime volontairement plutôt que de simuler un graphe de dépendances
 *    qui divergerait du vrai comportement du navigateur.
 *
 * Les fichiers de données (`/data/*.json`) sont exclus : ils sont récupérés
 * après l'affichage, pas pendant.
 */

import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const BUILD_DIR = 'build';

const BUDGETS = {
  js: 60 * 1024,
  firstLoad: 150 * 1024
};

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

/** @param {string} file @returns {number} */
function gzipSize(file) {
  return gzipSync(readFileSync(file), { level: 9 }).byteLength;
}

/** @param {number} bytes @returns {string} */
function kb(bytes) {
  return `${(bytes / 1024).toFixed(1)} Ko`;
}

/** @type {string[]} */
let files = [];
try {
  files = walk(BUILD_DIR);
} catch {
  console.error(`Budget : dossier « ${BUILD_DIR} » introuvable. Lancer le build d'abord.`);
  process.exit(1);
}

/** @type {{ path: string, size: number }[]} */
const js = [];
let cssTotal = 0;
let heaviestHtml = 0;

for (const file of files) {
  if (relative(BUILD_DIR, file).startsWith('data/')) continue;

  const ext = extname(file);
  if (ext === '.js') js.push({ path: relative(BUILD_DIR, file), size: gzipSize(file) });
  else if (ext === '.css') cssTotal += gzipSize(file);
  else if (ext === '.html') heaviestHtml = Math.max(heaviestHtml, gzipSize(file));
}

const jsTotal = js.reduce((sum, f) => sum + f.size, 0);
const firstLoad = jsTotal + cssTotal + heaviestHtml;

const rows = [
  { label: 'JavaScript', actual: jsTotal, budget: BUDGETS.js },
  { label: 'Premier chargement', actual: firstLoad, budget: BUDGETS.firstLoad }
];

console.log('\nBudgets (gzip)');
for (const { label, actual, budget } of rows) {
  const pct = Math.round((actual / budget) * 100);
  const mark = actual > budget ? '✗' : '✓';
  console.log(
    `  ${mark} ${label.padEnd(20)} ${kb(actual).padStart(9)} / ${kb(budget)}  (${pct} %)`
  );
}
console.log(`    dont CSS ${kb(cssTotal)}, HTML le plus lourd ${kb(heaviestHtml)}`);

const failures = rows.filter((row) => row.actual > row.budget);

if (failures.length > 0) {
  console.error('\nBudget dépassé. Les cinq modules les plus lourds :');
  for (const f of js.sort((a, b) => b.size - a.size).slice(0, 5)) {
    console.error(`  ${kb(f.size).padStart(9)}  ${f.path}`);
  }
  console.error('');
  process.exit(1);
}

console.log('');
