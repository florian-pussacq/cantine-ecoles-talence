/**
 * Le verrou de dépendances ne doit désigner que le registre public.
 *
 * Ce contrôle existe parce que la panne est arrivée : le fichier avait été
 * produit sur un poste configuré vers un miroir d'entreprise, et ses 284 URL
 * `resolved` pointaient vers un nom d'hôte interne. En local rien ne se voyait,
 * le cache npm servant les paquets ; en intégration continue et chez
 * l'hébergeur, où le cache part froid, la résolution DNS échouait. npm 11.4
 * rapportant cet échec par un « Exit handler never called! », le diagnostic
 * partait dans la mauvaise direction.
 *
 * Le contrôle est ici et non dans un test unitaire parce qu'il porte sur un
 * fichier de construction, pas sur du code applicatif — et parce qu'il doit
 * s'exécuter avant `npm run build`, dans la même commande que le reste.
 *
 * Effet de bord utile : un nom d'hôte interne ne peut plus être commité par
 * inadvertance dans un dépôt personnel.
 */

import { readFileSync } from 'node:fs';

const LOCKFILE = 'package-lock.json';
const REGISTRE = 'registry.npmjs.org';

/** @type {{ packages?: Record<string, { resolved?: string, integrity?: string }> }} */
let lock;
try {
  lock = JSON.parse(readFileSync(LOCKFILE, 'utf8'));
} catch {
  console.error(`Verrou : « ${LOCKFILE} » est illisible ou absent.`);
  process.exit(1);
}

/** @type {Map<string, string[]>} */
const etrangers = new Map();
/** @type {string[]} */
const sansEmpreinte = [];

for (const [nom, paquet] of Object.entries(lock.packages ?? {})) {
  if (!paquet.resolved) continue;

  const hote = URL.parse(paquet.resolved)?.host;
  if (hote !== REGISTRE) {
    const cle = hote ?? paquet.resolved;
    etrangers.set(cle, [...(etrangers.get(cle) ?? []), nom]);
  }

  // Sans empreinte, npm accepte n'importe quel contenu à cette adresse.
  if (!paquet.integrity) sansEmpreinte.push(nom);
}

if (etrangers.size === 0 && sansEmpreinte.length === 0) {
  console.log(`Verrou : toutes les dépendances viennent de ${REGISTRE}.`);
  process.exit(0);
}

for (const [hote, paquets] of etrangers) {
  console.error(`Verrou : ${paquets.length} dépendance(s) résolues depuis « ${hote} ».`);
  for (const nom of paquets.slice(0, 5)) console.error(`  ${nom}`);
  if (paquets.length > 5) console.error(`  … et ${paquets.length - 5} autres`);
}

for (const nom of sansEmpreinte) {
  console.error(`Verrou : « ${nom} » n'a pas d'empreinte « integrity ».`);
}

console.error(
  `\nRégénérer le verrou depuis le registre public :` +
    `\n  rm -rf node_modules package-lock.json && npm install\n`
);
process.exit(1);
