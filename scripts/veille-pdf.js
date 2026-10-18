/**
 * Veille des menus publiés par la Ville (veille-des-pdf).
 *
 *   node scripts/veille-pdf.js        ou        npm run veille
 *
 * Lit la page des menus, télécharge chaque PDF de menu, et compare son empreinte
 * aux données publiées. Trois constats demandent une action : un menu nouveau,
 * un menu republié, un corpus qui couvre moins de quatorze jours (D1). Le code
 * de sortie le dit : 0 rien à faire, 1 une action à mener, 2 une panne.
 *
 * Le workflow planifié `veille.yml` le lance chaque matin et échoue sur un code
 * non nul : c'est ainsi que la veille prévient, sans issue ni pull request (D3).
 * Il ne modifie jamais le dépôt.
 */

import { createHash } from 'node:crypto';
import { appendFileSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { argv, env, exit } from 'node:process';
import { pathToFileURL } from 'node:url';

const PAGE = 'https://www.talence.fr/quotidien/enfance-scolarite/menu-ecoles/';
const DATA_DIR = 'static/data';
// Comme `validate-data.js` : un mensuel, ou un menu de vacances.
const MONTH_FILE = /^(\d{4}-\d{2})(-vacances)?\.json$/;
const STRIKE_FILE = 'greve.json';
/** En deçà, le corpus est court : le temps de voir l'alerte et d'extraire. */
const HORIZON_MIN = 14;
// La requête se présente : la Ville doit pouvoir savoir qui lit sa page (D5).
const USER_AGENT =
  'cantine-ecoles-talence/veille (+https://github.com/florian-pussacq/cantine-ecoles-talence)';

/**
 * @typedef {{ fichier: string, pdfUrl: string, pdfSha256: string }} Publie
 * @typedef {{ url: string, sha: string }} Lien
 * @typedef {{ type: 'nouveau' | 'republie', nom: string, url: string }} Action
 * @typedef {{ type: 'deplace', nom: string, ancienne: string, nouvelle: string }} Avertissement
 */

/** Le nom de fichier d'une URL, qui identifie un menu d'une réédition à l'autre. */
const nomDe = (/** @type {string} */ url) => basename(new URL(url).pathname);

/**
 * Les liens de menus de la page, absolus et sans doublon.
 *
 * Un menu se reconnaît à `MENUS-WEB` dans son nom. La page porte aussi un
 * calendrier, un guide et l'origine des viandes, qui ne sont pas des menus.
 *
 * @param {string} html
 * @returns {string[]}
 */
export function liensDeMenus(html) {
  const liens = [...html.matchAll(/href="([^"]+\.pdf)"/gi)]
    .map((m) => new URL(m[1] ?? '', PAGE).href)
    .filter((url) => nomDe(url).includes('MENUS-WEB'));
  return [...new Set(liens)];
}

/**
 * Ce que la page apprend par rapport aux données publiées (D1).
 *
 * Un menu cité mais absent de la page n'est pas un constat : c'est un mois passé.
 *
 * @param {Lien[]} liens
 * @param {Publie[]} publies
 * @returns {{ actions: Action[], avertissements: Avertissement[] }}
 */
export function constats(liens, publies) {
  const parNom = new Map(publies.map((p) => [nomDe(p.pdfUrl), p]));
  /** @type {Action[]} */
  const actions = [];
  /** @type {Avertissement[]} */
  const avertissements = [];

  for (const { url, sha } of liens) {
    const nom = nomDe(url);
    const cite = parNom.get(nom);
    if (cite === undefined) actions.push({ type: 'nouveau', nom, url });
    else if (cite.pdfSha256 !== sha) actions.push({ type: 'republie', nom, url });
    else if (cite.pdfUrl !== url) {
      avertissements.push({ type: 'deplace', nom, ancienne: cite.pdfUrl, nouvelle: url });
    }
  }
  return { actions, avertissements };
}

/**
 * Jusqu'à quand le corpus couvre, vu d'aujourd'hui.
 *
 * @param {string[]} jours les jours servis publiés, AAAA-MM-JJ
 * @param {string} aujourdhui AAAA-MM-JJ, à Paris
 */
export function horizon(jours, aujourdhui) {
  const dernier = jours.reduce((a, b) => (b > a ? b : a), '');
  const ecart = Math.round(
    (Date.parse(`${dernier}T00:00:00Z`) - Date.parse(`${aujourdhui}T00:00:00Z`)) / 86_400_000
  );
  return { dernier, jours: ecart, court: ecart < HORIZON_MIN };
}

/** La date du jour à Paris, AAAA-MM-JJ : celle des parents, pas celle du serveur. */
export function aujourdhuiAParis(maintenant = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(maintenant);
}

/** Les données publiées : ce qu'elles citent, et les jours servis des mois. */
function lirePublies() {
  /** @type {Publie[]} */
  const publies = [];
  /** @type {string[]} */
  const jours = [];
  for (const fichier of readdirSync(DATA_DIR).sort()) {
    const mois = MONTH_FILE.test(fichier);
    if (!mois && fichier !== STRIKE_FILE) continue;
    const donnee = JSON.parse(readFileSync(join(DATA_DIR, fichier), 'utf8'));
    publies.push({ fichier, pdfUrl: donnee.source.pdfUrl, pdfSha256: donnee.source.pdfSha256 });
    if (mois) {
      for (const jour of donnee.days) if (jour.kind === 'school') jours.push(jour.date);
    }
  }
  return { publies, jours };
}

/** @param {string} url */
async function telecharger(url) {
  const reponse = await fetch(url, { headers: { 'user-agent': USER_AGENT } });
  if (!reponse.ok) throw new Error(`${url} : HTTP ${reponse.status}`);
  return Buffer.from(await reponse.arrayBuffer());
}

/**
 * Le compte rendu, lisible dans un terminal comme dans le résumé du workflow.
 *
 * @param {{ actions: Action[], avertissements: Avertissement[] }} trouve
 * @param {ReturnType<typeof horizon>} couverture
 */
function rapport({ actions, avertissements }, couverture) {
  const lignes = ['## Veille des menus de la Ville', ''];
  for (const a of actions) {
    lignes.push(
      a.type === 'nouveau'
        ? `- **Nouveau** : ${a.nom}, qu'aucune donnée ne cite — ${a.url}`
        : `- **Republié** : ${a.nom}, dont l'empreinte a changé — ${a.url}`
    );
  }
  if (couverture.court) {
    lignes.push(
      `- **Corpus court** : le dernier jour publié est le ${couverture.dernier}, dans ${couverture.jours} jour(s).`
    );
  }
  for (const a of avertissements) {
    lignes.push(`- Déplacé, contenu identique : ${a.nom}, désormais à ${a.nouvelle}`);
  }
  if (actions.length > 0 || couverture.court) {
    lignes.push('', 'À faire : mettre les menus à jour (skill `menus-talence`).');
  } else {
    lignes.push(
      `Rien à faire. Le corpus couvre jusqu'au ${couverture.dernier}, dans ${couverture.jours} jours.`
    );
  }
  return lignes.join('\n');
}

/** @param {string} texte */
function publier(texte) {
  console.log(texte);
  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, `${texte}\n`);
}

async function main() {
  const { publies, jours } = lirePublies();

  /** @type {Lien[]} */
  const liens = [];
  try {
    const page = await telecharger(PAGE);
    const urls = liensDeMenus(page.toString('utf8'));
    // Une page sans menu est une panne, pas une bonne nouvelle (D2).
    if (urls.length === 0) {
      publier(
        `## Veille en panne\n\nLa page ${PAGE} ne contient plus aucun lien de menu : elle a sans doute changé.`
      );
      exit(2);
    }
    for (const url of urls) {
      liens.push({
        url,
        sha: createHash('sha256')
          .update(await telecharger(url))
          .digest('hex')
      });
    }
  } catch (erreur) {
    publier(
      `## Veille en panne\n\nLa page ou un PDF de la Ville est injoignable : ${String(erreur)}`
    );
    exit(2);
  }

  const trouve = constats(liens, publies);
  const couverture = horizon(jours, aujourdhuiAParis());
  publier(rapport(trouve, couverture));
  exit(trouve.actions.length > 0 || couverture.court ? 1 : 0);
}

if (argv[1] && import.meta.url === pathToFileURL(argv[1]).href) await main();
