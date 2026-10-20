/**
 * La barrière de la publication (deploiement-manuel).
 *
 *   node scripts/barriere-publication.js
 *
 * Dit si la tête de `main` peut partir en production : il faut que les jobs
 * `verifier` et `e2e` de sa vérification aient réussi (D2). Le workflow
 * `publier.yml`, lancé à la main, n'appelle le build hook que sur un « oui ».
 *
 * Le script ne publie jamais : il lit l'API de GitHub et décide. On peut donc le
 * lancer d'un poste pour savoir ce que ferait la publication. Sans jeton, l'API
 * répond aussi, le dépôt étant public.
 *
 * Code de sortie : 0 publiable, 1 refusé, 2 panne. Une panne refuse aussi : on
 * ne publie jamais sur un doute.
 */

import { appendFileSync } from 'node:fs';
import { argv, env, exit } from 'node:process';
import { pathToFileURL } from 'node:url';

const DEPOT = env.GITHUB_REPOSITORY ?? 'florian-pussacq/cantine-ecoles-talence';
const API = `https://api.github.com/repos/${DEPOT}`;
/** Les vérifications qui gardent la production ; `extraction` n'en est pas (D2). */
const GARDIENS = ['verifier', 'e2e'];

/**
 * @typedef {{ id: number, status: string, conclusion: string | null }} Execution
 * @typedef {{ name: string, status: string, conclusion: string | null }} Job
 * @typedef {{ publier: boolean, raison: string }} Decision
 */

/**
 * La décision, sans réseau.
 *
 * @param {{ branche: string, tete: string, execution: Execution | null, jobs: Job[] }} etat
 * @returns {Decision}
 */
export function decision({ branche, tete, execution, jobs }) {
  const commit = tete.slice(0, 7);

  // Le build hook construit `main` quelle que soit la branche choisie au
  // lancement : on croirait publier une autre branche (D3).
  if (branche !== 'main') {
    return {
      publier: false,
      raison: `Lancé depuis « ${branche} » : seule \`main\` se publie. Relancer depuis \`main\`.`
    };
  }
  if (execution === null) {
    return {
      publier: false,
      raison: `Aucune vérification de ${commit}, la tête de \`main\`. A-t-il été poussé ?`
    };
  }
  if (execution.status !== 'completed') {
    return {
      publier: false,
      raison: `La vérification de ${commit} est en cours. Relancer quand elle sera finie.`
    };
  }

  for (const nom of GARDIENS) {
    const job = jobs.find((candidat) => candidat.name === nom);
    if (job === undefined) {
      return { publier: false, raison: `Le job \`${nom}\` manque à la vérification de ${commit}.` };
    }
    if (job.conclusion !== 'success') {
      return {
        publier: false,
        raison: `Le job \`${nom}\` de ${commit} n'a pas réussi (${job.conclusion ?? job.status}).`
      };
    }
  }

  return { publier: true, raison: `${commit}, tête de \`main\`, est vérifié : publication.` };
}

/** @param {string} chemin */
async function lire(chemin) {
  /** @type {Record<string, string>} */
  const entetes = { Accept: 'application/vnd.github+json' };
  if (env.GITHUB_TOKEN) entetes.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  const reponse = await fetch(`${API}${chemin}`, { headers: entetes });
  if (!reponse.ok) throw new Error(`${chemin} : HTTP ${reponse.status}`);
  return reponse.json();
}

/** @param {string} texte */
function dire(texte) {
  console.log(texte);
  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, `${texte}\n`);
}

async function main() {
  let etat;
  try {
    const tete = (await lire('/commits/main')).sha;
    // La plus récente d'abord ; une relance remplace l'ancienne tentative.
    const runs = await lire(
      `/actions/workflows/verifier.yml/runs?head_sha=${tete}&event=push&per_page=1`
    );
    const execution = runs.workflow_runs[0] ?? null;
    const jobs = execution === null ? [] : (await lire(`/actions/runs/${execution.id}/jobs`)).jobs;
    etat = { branche: env.GITHUB_REF_NAME ?? 'main', tete, execution, jobs };
  } catch (erreur) {
    dire(`## Publication refusée\n\nL'API de GitHub n'a pas répondu : ${String(erreur)}.`);
    exit(2);
  }

  const { publier, raison } = decision(etat);
  dire(`## Publication ${publier ? 'accordée' : 'refusée'}\n\n${raison}`);
  exit(publier ? 0 : 1);
}

if (argv[1] && import.meta.url === pathToFileURL(argv[1]).href) await main();
