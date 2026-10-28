/**
 * Vérification des budgets de performance du PRD §8, exécutée après le build.
 *
 * Le dépassement fait échouer la construction plutôt que de produire un rapport
 * que personne ne lit (design.md, risques).
 *
 * Trois budgets, tous en gzip, chacun pour une question (budget-par-page, D2) :
 *
 *  - JavaScript par page : ce que charge la page la plus lourde. C'est lui qui
 *    retarde l'affichage, et c'est lui que le PRD vise en plaçant le budget à
 *    côté du LCP.
 *
 *  - Premier chargement par page : le document, ses feuilles de style et son
 *    JavaScript, pour la page la plus lourde.
 *
 *  - JavaScript préchargé : tout le JavaScript émis, service worker compris. Le
 *    hors-ligne le télécharge en entier à la première visite et à chaque
 *    déploiement : c'est un coût de données, pas d'affichage.
 *
 *  - Polices : tous les fichiers de police émis, à leur poids réel et non
 *    compressé — un woff2 l'est déjà. L'application sert ses polices
 *    (refonte-signaletique, D4) ; ajouter une graisse ou un sous-ensemble doit
 *    être une décision qu'on voit passer, pas un octet de plus qu'on découvre.
 *
 * Le JavaScript d'une page se lit dans ce que le build a produit, sans rien
 * simuler (D1). La page nomme les modules qu'elle charge — l'entrée, la coque,
 * la route — et le manifeste de Vite donne leurs imports statiques. Les imports
 * à la demande sont exclus : l'application connaît toutes les routes, mais ne
 * charge que celle de la page présentée.
 *
 * Les fichiers de données (`/data/*.json`) sont exclus : ils sont récupérés
 * après l'affichage, pas pendant.
 */

import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const BUILD_DIR = 'build';
const MANIFEST = '.svelte-kit/output/client/.vite/manifest.json';

const BUDGETS = {
  jsParPage: 60 * 1024,
  premierChargement: 150 * 1024,
  jsPrecharge: 80 * 1024,
  polices: 40 * 1024
};

const POLICES = new Set(['.woff2', '.woff', '.ttf', '.otf']);

/**
 * Les pages sans JavaScript, et pourquoi (D4). Toute autre page qui ne nomme
 * aucun module fait échouer la mesure : elle passerait sans rien garder.
 */
const SANS_JAVASCRIPT = new Map([
  ['404.html', 'page autonome servie par Netlify, sans application (static/404.html)']
]);

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

/** @param {string} message @returns {never} */
function echec(message) {
  console.error(`\nBudget : ${message}\n`);
  process.exit(1);
}

/** @type {string[]} */
let files = [];
try {
  files = walk(BUILD_DIR);
} catch {
  echec(`dossier « ${BUILD_DIR} » introuvable. Lancer le build d'abord.`);
}

/**
 * @typedef {{ file: string, imports?: string[], css?: string[] }} Entree
 * @type {Record<string, Entree>}
 */
let manifest = {};
try {
  manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
} catch {
  echec(`manifeste de Vite « ${MANIFEST} » illisible. Lancer le build d'abord.`);
}

/** Le manifeste est indexé par source ; une page nomme des fichiers émis. */
const parFichier = new Map(Object.entries(manifest).map(([cle, e]) => [e.file, cle]));

/** @type {Map<string, number>} */
const tailles = new Map();
/** @param {string} chemin relatif à `build/` */
const taille = (chemin) => {
  const connue = tailles.get(chemin);
  if (connue !== undefined) return connue;
  const mesuree = gzipSize(join(BUILD_DIR, chemin));
  tailles.set(chemin, mesuree);
  return mesuree;
};

/**
 * Le JavaScript et le CSS d'une page : ses modules nommés, fermés par les
 * imports statiques du manifeste (D1).
 *
 * @param {string} page chemin relatif à `build/`
 */
function chargesPar(page) {
  const html = readFileSync(join(BUILD_DIR, page), 'utf8');
  const nommes = [
    ...new Set(
      [...html.matchAll(/["(]\.?\/?(_app\/immutable\/[^"')]+\.js)/g)].map((m) => m[1] ?? '')
    )
  ];
  if (nommes.length === 0)
    echec(`${page} ne nomme aucun module : la mesure ne sait pas la lire (D4).`);

  /** @type {Set<string>} */
  const vus = new Set();
  const pile = nommes.map((fichier) => {
    const cle = parFichier.get(fichier);
    if (cle === undefined) echec(`${page} nomme ${fichier}, absent du manifeste de Vite (D4).`);
    return cle;
  });
  while (pile.length > 0) {
    const cle = /** @type {string} */ (pile.pop());
    if (vus.has(cle)) continue;
    const entree = manifest[cle];
    if (entree === undefined)
      echec(`${cle}, importé par ${page}, absent du manifeste de Vite (D4).`);
    vus.add(cle);
    pile.push(...(entree.imports ?? []));
  }

  const js = [...vus].map((cle) => /** @type {Entree} */ (manifest[cle]).file);
  const css = [...new Set([...vus].flatMap((cle) => manifest[cle]?.css ?? []))];
  const jsTotal = js.reduce((somme, f) => somme + taille(f), 0);
  const cssTotal = css.reduce((somme, f) => somme + taille(f), 0);
  return {
    page,
    js,
    jsTotal,
    premierChargement: gzipSize(join(BUILD_DIR, page)) + cssTotal + jsTotal
  };
}

const pages = files
  .map((f) => relative(BUILD_DIR, f))
  .filter((f) => extname(f) === '.html' && !SANS_JAVASCRIPT.has(f))
  .sort()
  .map(chargesPar);

if (pages.length === 0) echec('aucune page pré-rendue à mesurer.');

const jsPrecharge = files
  .filter((f) => extname(f) === '.js' && !relative(BUILD_DIR, f).startsWith('data/'))
  .reduce((somme, f) => somme + gzipSize(f), 0);

const polices = files
  .filter((f) => POLICES.has(extname(f)))
  .map((f) => ({ fichier: relative(BUILD_DIR, f), poids: statSync(f).size }))
  .sort((a, b) => b.poids - a.poids);
const policesTotal = polices.reduce((somme, { poids }) => somme + poids, 0);

const plusLourde = (/** @type {'jsTotal' | 'premierChargement'} */ cle) =>
  pages.reduce((a, b) => (b[cle] > a[cle] ? b : a));
const pireJs = plusLourde('jsTotal');
const pireChargement = plusLourde('premierChargement');

const rows = [
  { label: 'JavaScript par page', actual: pireJs.jsTotal, budget: BUDGETS.jsParPage, page: pireJs },
  {
    label: 'Premier chargement',
    actual: pireChargement.premierChargement,
    budget: BUDGETS.premierChargement,
    page: pireChargement
  },
  { label: 'JavaScript préchargé', actual: jsPrecharge, budget: BUDGETS.jsPrecharge, page: null },
  { label: 'Polices', actual: policesTotal, budget: BUDGETS.polices, page: null }
];

console.log('\nBudgets (gzip, polices à leur poids réel)');
for (const { label, actual, budget, page } of rows) {
  const pct = Math.round((actual / budget) * 100);
  const mark = actual > budget ? '✗' : '✓';
  const ou = page ? `  ${page.page}` : '';
  console.log(
    `  ${mark} ${label.padEnd(21)} ${kb(actual).padStart(9)} / ${kb(budget)}  (${pct} %)${ou}`
  );
}
console.log('    JavaScript par page :');
for (const p of pages) console.log(`      ${kb(p.jsTotal).padStart(9)}  ${p.page}`);
console.log('    Polices :');
for (const { fichier, poids } of polices) console.log(`      ${kb(poids).padStart(9)}  ${fichier}`);

const failures = rows.filter((row) => row.actual > row.budget);

if (failures.length > 0) {
  for (const { label, page } of failures) {
    if (label === 'Polices') {
      // Chaque fichier et son poids : c'est une graisse ou un sous-ensemble
      // qu'il faut retirer, et le nom du fichier dit lequel.
      console.error('\nBudget des polices dépassé :');
      for (const { fichier, poids } of polices)
        console.error(`  ${kb(poids).padStart(9)}  ${fichier}`);
      continue;
    }
    // Les modules de la page fautive, et non de tout le build : c'est là qu'il
    // faut couper (D3).
    const modules = page
      ? page.js
      : files.filter((f) => extname(f) === '.js').map((f) => relative(BUILD_DIR, f));
    console.error(
      `\n${label} dépassé${page ? ` par ${page.page}` : ''}. Les cinq modules les plus lourds :`
    );
    for (const f of modules.sort((a, b) => taille(b) - taille(a)).slice(0, 5)) {
      console.error(`  ${kb(taille(f)).padStart(9)}  ${f}`);
    }
  }
  console.error('');
  process.exit(1);
}

console.log('');
