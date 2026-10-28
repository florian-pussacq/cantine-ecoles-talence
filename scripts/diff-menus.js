/**
 * Ce qu'une réextraction change pour le lecteur des menus (reedition-renommee, D3).
 *
 *   npm run data:diff                  la copie de travail contre HEAD
 *   npm run data:diff -- <avant>       la copie de travail contre <avant>
 *   npm run data:diff -- <avant> <après>   deux commits entre eux
 *
 * Compare jour par jour, et plat par plat, les fichiers de menus de
 * `static/data/`. Le diff texte d'une réextraction mêle les plats et la mise en
 * forme ; celui-ci ne dit que les plats, le genre du jour, le thème, sa note et
 * la confiance. La source, qui change à chaque extraction, n'est pas comparée.
 * La sortie se reprend telle quelle dans le corps du commit.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { argv } from 'node:process';
import { pathToFileURL } from 'node:url';

const DATA_DIR = 'static/data';
const MANIFESTE = 'index.json';
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * @typedef {{ slot: string, label: string, allergens: number[], flags: string[] }} Plat
 * @typedef {{ kind?: string, theme?: string, note?: string, confidence?: string, courses?: Plat[] }} Jour
 * @typedef {{ days?: (Jour & { date: string })[], services?: { temperature: string, days: (Jour & { weekday: string })[] }[] }} Donnee
 */

/**
 * Les jours d'un fichier, par clé : la date d'un mois, ou le service et le jour
 * de semaine du menu de grève, qui n'a pas de dates.
 *
 * @param {Donnee} donnee
 * @returns {Map<string, Jour>}
 */
function journees(donnee) {
  if (donnee.services) {
    return new Map(
      donnee.services.flatMap((service) =>
        service.days.map((jour) => [`${service.temperature} ${jour.weekday}`, jour])
      )
    );
  }
  return new Map((donnee.days ?? []).map((jour) => [jour.date, jour]));
}

/**
 * Les plats d'un jour par créneau. Le schéma n'interdit pas deux plats au même
 * créneau : ils s'apparient alors dans leur ordre.
 *
 * @param {Jour} jour
 */
function parCreneau(jour) {
  /** @type {Map<string, Plat[]>} */
  const creneaux = new Map();
  for (const plat of jour.courses ?? []) {
    creneaux.set(plat.slot, [...(creneaux.get(plat.slot) ?? []), plat]);
  }
  return creneaux;
}

/**
 * Ce qui entre et sort d'une liste, `+x` puis `−x`.
 *
 * @param {(string | number)[]} avant
 * @param {(string | number)[]} apres
 */
function ecart(avant, apres) {
  return [
    ...apres.filter((x) => !avant.includes(x)).map((x) => `+${x}`),
    ...avant.filter((x) => !apres.includes(x)).map((x) => `−${x}`)
  ].join(' ');
}

/**
 * @param {string} cle
 * @param {Plat} avant
 * @param {Plat} apres
 * @returns {string | null}
 */
function platChange(cle, avant, apres) {
  const parties = [];
  if (avant.label !== apres.label) parties.push(`${avant.label} → ${apres.label}`);
  const allergenes = ecart(avant.allergens, apres.allergens);
  if (allergenes) parties.push(`allergènes ${allergenes}`);
  const labels = ecart(avant.flags, apres.flags);
  if (labels) parties.push(`labels ${labels}`);
  if (parties.length === 0) return null;
  // Le libellé inchangé situe le plat ; changé, il figure déjà dans la ligne.
  const nomme = avant.label === apres.label ? ` (${apres.label})` : '';
  return `${cle} ${apres.slot}${nomme} : ${parties.join(' ; ')}`;
}

/**
 * @param {string} cle
 * @param {Jour} avant
 * @param {Jour} apres
 */
function jourChange(cle, avant, apres) {
  const lignes = [];
  if (avant.kind !== apres.kind) lignes.push(`${cle} : ${avant.kind} → ${apres.kind}`);
  if (avant.theme !== apres.theme) {
    lignes.push(`${cle} thème : ${avant.theme ?? '(aucun)'} → ${apres.theme ?? '(aucun)'}`);
  }
  if (avant.note !== apres.note) {
    lignes.push(`${cle} note : ${avant.note ?? '(aucune)'} → ${apres.note ?? '(aucune)'}`);
  }
  if (avant.confidence !== apres.confidence) {
    lignes.push(`${cle} confiance : ${avant.confidence} → ${apres.confidence}`);
  }

  const platsAvant = parCreneau(avant);
  const platsApres = parCreneau(apres);
  for (const [slot, anciens] of platsAvant) {
    const nouveaux = platsApres.get(slot) ?? [];
    anciens.forEach((ancien, i) => {
      const nouveau = nouveaux[i];
      if (nouveau === undefined) lignes.push(`${cle} ${slot} : retiré (${ancien.label})`);
      else {
        const ligne = platChange(cle, ancien, nouveau);
        if (ligne) lignes.push(ligne);
      }
    });
  }
  for (const [slot, nouveaux] of platsApres) {
    const anciens = platsAvant.get(slot) ?? [];
    for (const nouveau of nouveaux.slice(anciens.length)) {
      lignes.push(`${cle} ${slot} : ajouté (${nouveau.label})`);
    }
  }
  return lignes;
}

/**
 * Ce qui change d'un fichier de menus à l'autre, une ligne par changement.
 * `null` dit un fichier absent de ce côté.
 *
 * @param {Donnee | null} avant
 * @param {Donnee | null} apres
 * @returns {string[]}
 */
export function differences(avant, apres) {
  if (avant === null && apres === null) return [];
  if (apres === null) return ['supprimé'];
  if (avant === null) return [`nouveau, ${journees(apres).size} jours`];

  const jA = journees(avant);
  const jB = journees(apres);
  const cles = [...new Set([...jA.keys(), ...jB.keys()])];
  // Les dates se rangent d'elles-mêmes ; la grève garde l'ordre du document.
  if (cles.every((cle) => DATE.test(cle))) cles.sort();

  return cles.flatMap((cle) => {
    const a = jA.get(cle);
    const b = jB.get(cle);
    if (a === undefined) return [`${cle} : jour ajouté`];
    if (b === undefined) return [`${cle} : jour retiré`];
    return jourChange(cle, a, b);
  });
}

/** @param {string} nom */
const estUnMenu = (nom) => nom.endsWith('.json') && nom !== MANIFESTE;

/** @param {string[]} args */
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' });

/**
 * Les fichiers de menus d'un côté, et de quoi les lire. Sans référence, la
 * copie de travail.
 *
 * @param {string | undefined} ref
 * @returns {{ noms: string[], lire: (nom: string) => Donnee | null }}
 */
function cote(ref) {
  if (ref === undefined) {
    const noms = readdirSync(DATA_DIR).filter(estUnMenu);
    return {
      noms,
      lire: (nom) =>
        noms.includes(nom) ? JSON.parse(readFileSync(join(DATA_DIR, nom), 'utf8')) : null
    };
  }
  const noms = git('ls-tree', '--name-only', `${ref}:${DATA_DIR}`).split('\n').filter(estUnMenu);
  return {
    noms,
    lire: (nom) =>
      noms.includes(nom) ? JSON.parse(git('show', `${ref}:${DATA_DIR}/${nom}`)) : null
  };
}

function main() {
  const [refAvant = 'HEAD', refApres] = argv.slice(2);
  const avant = cote(refAvant);
  const apres = cote(refApres);

  const sections = [...new Set([...avant.noms, ...apres.noms])].sort().flatMap((nom) => {
    const lignes = differences(avant.lire(nom), apres.lire(nom));
    return lignes.length === 0 ? [] : [`${DATA_DIR}/${nom}`, ...lignes.map((l) => `- ${l}`), ''];
  });

  console.log(sections.length === 0 ? 'Aucun menu ne change.' : sections.join('\n').trimEnd());
}

if (argv[1] && import.meta.url === pathToFileURL(argv[1]).href) main();
