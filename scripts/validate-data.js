/**
 * Valide les données publiées, et régénère le manifeste.
 *
 *   node scripts/validate-data.js                 valide tout
 *   node scripts/validate-data.js --write-index   valide puis réécrit index.json
 *
 * Deux niveaux de contrôle. Le premier est le JSON Schema, qui dit la forme.
 * Le second est la cohérence, que JSON Schema ne peut pas exprimer et qui vient
 * du PRD §6.2.5 : un fichier bien formé peut décrire un mois absurde.
 *
 * Un manquement de cohérence n'efface pas le jour concerné, il exige qu'il porte
 * `confidence: "low"` — publier en dégradé plutôt que rien, mais jamais en
 * silence. Un jour incohérent qui se prétend `high` fait échouer la validation.
 */

// Les schémas sont en draft 2020-12 ; l'export par défaut d'ajv ne couvre que draft-07.
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { argv, exit } from 'node:process';

const DATA_DIR = 'static/data';
const MONTH_FILE = /^(\d{4}-\d{2})\.json$/;

// Publié comme les mensuels, mais hors du manifeste : celui-ci ne référence que
// des mois, et le menu de grève n'en couvre aucun. Ce n'est pas un oubli, c'est
// ce qui garantit que la résolution du jour ne peut pas le retenir.
const STRIKE_FILE = 'greve.json';

// Validés comme les fichiers publiés, mais absents du manifeste : ce sont des
// données de test, elles ne doivent jamais atteindre un utilisateur.
const FIXTURES = ['fixtures/edge-cases.json'];

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats.default(ajv);

const monthSchema = JSON.parse(readFileSync('schemas/month.schema.json', 'utf8'));
const indexSchema = JSON.parse(readFileSync('schemas/index.schema.json', 'utf8'));
const strikeSchema = JSON.parse(readFileSync('schemas/greve.schema.json', 'utf8'));
const validateMonth = ajv.compile(monthSchema);
const validateIndex = ajv.compile(indexSchema);
const validateStrike = ajv.compile(strikeSchema);

/** @type {string[]} */
const problems = [];

/** @param {string} file @param {string} message */
function fail(file, message) {
  problems.push(`${file} — ${message}`);
}

/**
 * Bornes acceptables pour les dates d'un fichier mensuel.
 *
 * Un fichier mensuel déborde légitimement sur les mois voisins : le document de
 * septembre 2026 s'ouvre sur le lundi 31 août, parce que la grille est découpée
 * en semaines entières et non en mois. Exiger que toute date appartienne au mois
 * annoncé rejetterait des données parfaitement valides.
 *
 * @param {string} month AAAA-MM
 */
function dateBounds(month) {
  const [year, mon] = month.split('-').map(Number);
  const first = Date.UTC(/** @type {number} */ (year), /** @type {number} */ (mon) - 1, 1);
  const last = Date.UTC(/** @type {number} */ (year), /** @type {number} */ (mon), 0);
  const week = 7 * 24 * 3600 * 1000;
  return { min: first - week, max: last + week };
}

/** Les deux mots qu'un PDF met à la place des plats un jour férié. */
const HOLIDAY_WORDS = new Set(['jour', 'ferie']);

/** @param {string} label */
function normalize(label) {
  return label
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
}

/**
 * @param {string} file
 * @param {import('../src/lib/data/schema.js').MonthMenu} data
 */
function checkCoherence(file, data) {
  const { min, max } = dateBounds(data.month);
  let previous = '';

  for (const day of data.days) {
    const at = `${file}[${day.date}]`;
    const time = Date.parse(`${day.date}T00:00:00Z`);

    if (Number.isNaN(time)) fail(at, "la date n'est pas une date réelle");
    else if (time < min || time > max) {
      fail(at, `la date sort de plus d'une semaine du mois ${data.month}`);
    }

    if (day.date <= previous) fail(at, 'les jours ne sont pas strictement croissants');
    previous = day.date;

    const served = day.kind === 'school';
    /** @type {string[]} */
    const breaches = [];

    if (served) {
      if (day.courses.length < 3 || day.courses.length > 8) {
        breaches.push(`${day.courses.length} plats, hors de la fourchette 3–8`);
      }
      if (!day.courses.some((c) => c.slot === 'plat')) {
        breaches.push('aucun plat principal');
      }
      // Un férié lu comme un repas : « JOUR » en plat, « FÉRIÉ » en
      // accompagnement. Refusé même en confiance faible, parce que la bannière
      // d'incertitude n'excuse pas un repas qui n'existe pas.
      for (const course of day.courses) {
        if (HOLIDAY_WORDS.has(normalize(course.label))) {
          fail(at, `jour servi portant le plat « ${course.label} » : férié mal extrait`);
        }
      }
    } else if (day.courses.length > 0) {
      breaches.push(`jour non servi (${day.kind}) portant ${day.courses.length} plats`);
    }

    for (const course of day.courses) {
      for (const code of course.allergens) {
        if (!(String(code) in data.allergenLegend)) {
          breaches.push(`allergène ${code} de « ${course.label} » absent de la légende`);
        }
      }
    }

    // Une incohérence est tolérée sur un jour qui l'assume ; elle est refusée sur
    // un jour qui se déclare fiable.
    if (breaches.length > 0 && day.confidence !== 'low') {
      for (const breach of breaches) fail(at, `${breach} — attendu confidence "low"`);
    }
  }
}

const files = readdirSync(DATA_DIR).filter((f) => MONTH_FILE.test(f));

if (files.length === 0) fail(DATA_DIR, 'aucun fichier mensuel');

/** @type {{ month: string, contentHash: string, updatedAt: string | null }[]} */
const months = [];

for (const file of files.sort()) {
  const path = join(DATA_DIR, file);
  const raw = readFileSync(path);
  /** @type {import('../src/lib/data/schema.js').MonthMenu} */
  const data = JSON.parse(raw.toString('utf8'));

  if (!validateMonth(data)) {
    for (const err of validateMonth.errors ?? []) {
      fail(file, `${err.instancePath || '/'} ${err.message}`);
    }
    continue;
  }

  const expected = file.replace('.json', '');
  if (data.month !== expected) fail(file, `déclare month "${data.month}"`);

  checkCoherence(file, data);

  months.push({
    month: data.month,
    contentHash: createHash('sha256').update(raw).digest('hex'),
    updatedAt: data.source.updatedAt ?? null
  });
}

/**
 * Le menu de grève ne se contrôle pas comme un mois : il n'a ni dates à ordonner
 * ni jours non servis. Ce qu'on lui demande, c'est d'être une grille pleine —
 * un document de repli auquel il manquerait un jour serait une extraction ratée,
 * jamais une information.
 *
 * @param {string} file
 * @param {import('../src/lib/data/schema.js').StrikeMenu} data
 */
function checkStrikeCoherence(file, data) {
  const seen = new Set();

  for (const service of data.services) {
    if (seen.has(service.temperature)) fail(file, `variante « ${service.temperature} » en double`);
    seen.add(service.temperature);

    for (const day of service.days) {
      const at = `${file}[${service.temperature}/${day.weekday}]`;

      if (!day.courses.some((c) => c.slot === 'plat')) fail(at, 'aucun plat principal');

      for (const course of day.courses) {
        for (const code of course.allergens) {
          if (!(String(code) in data.allergenLegend)) {
            fail(at, `allergène ${code} de « ${course.label} » absent de la légende`);
          }
        }
      }
    }

    const weekdays = new Set(service.days.map((d) => d.weekday));
    if (weekdays.size !== service.days.length) {
      fail(file, `jours de semaine répétés dans la variante « ${service.temperature} »`);
    }
  }

  if (seen.size !== 2) fail(file, 'les deux variantes chaude et froide sont attendues');
}

const strikePath = join(DATA_DIR, STRIKE_FILE);
/** @type {import('../src/lib/data/schema.js').StrikeMenu} */
const strike = JSON.parse(readFileSync(strikePath, 'utf8'));
if (validateStrike(strike)) {
  checkStrikeCoherence(strikePath, strike);
} else {
  for (const err of validateStrike.errors ?? []) {
    fail(strikePath, `${err.instancePath || '/'} ${err.message}`);
  }
}

for (const path of FIXTURES) {
  /** @type {import('../src/lib/data/schema.js').MonthMenu} */
  const data = JSON.parse(readFileSync(path, 'utf8'));
  if (!validateMonth(data)) {
    for (const err of validateMonth.errors ?? []) {
      fail(path, `${err.instancePath || '/'} ${err.message}`);
    }
    continue;
  }
  checkCoherence(path, data);
}

if (problems.length > 0) {
  console.error(`\nDonnées invalides — ${problems.length} problème(s) :`);
  for (const p of problems) console.error(`  ${p}`);
  console.error('');
  exit(1);
}

const indexPath = join(DATA_DIR, 'index.json');

if (argv.includes('--write-index')) {
  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    months
  };
  writeFileSync(indexPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Données : ${files.length} mois + le menu de grève valides, ${indexPath} régénéré.`);
} else {
  /** @type {import('../src/lib/data/schema.js').MenuIndex} */
  const manifest = JSON.parse(readFileSync(indexPath, 'utf8'));
  if (!validateIndex(manifest)) {
    console.error('\nManifeste invalide :');
    for (const err of validateIndex.errors ?? []) {
      console.error(`  ${err.instancePath || '/'} ${err.message}`);
    }
    exit(1);
  }
  const stale = months.filter((m) => {
    const entry = manifest.months.find((e) => e.month === m.month);
    return !entry || entry.contentHash !== m.contentHash;
  });
  if (stale.length > 0 || manifest.months.length !== months.length) {
    console.error(
      `\nLe manifeste a divergé des fichiers mensuels. Lancer « npm run data:index ».\n`
    );
    exit(1);
  }
  console.log(`Données : ${files.length} mois + le menu de grève valides, manifeste à jour.`);
}
