import { base } from '$app/paths';
import { loadDataset } from '$lib/data/load.js';
import type { LayoutLoad } from './$types.js';

// Le site est intégralement pré-rendu : aucune route n'est calculée à la demande.
export const prerender = true;
export const ssr = true;

/**
 * Les menus sont chargés une fois pour tous les écrans.
 *
 * Le chargement a lieu au pré-rendu comme à l'exécution : au build, les données
 * sont donc cuites dans le HTML et l'écran s'affiche complet dès la première
 * peinture, sans squelette ni indicateur de progression.
 */
export const load: LayoutLoad = async ({ fetch }) => {
  return await loadDataset(fetch, base);
};
