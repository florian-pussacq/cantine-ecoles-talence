import { base } from '$app/paths';
import { loadDataset } from '$lib/data/load.js';
import type { PageLoad } from './$types.js';

/**
 * Les menus sont chargés au pré-rendu comme à l'exécution.
 *
 * Au build, les données sont donc cuites dans le HTML : l'écran s'affiche
 * complet dès la première peinture, sans squelette ni indicateur de chargement,
 * ce que la spécification exige. Côté client, le même chargement rejoue et le
 * service worker rafraîchit en arrière-plan.
 */
export const load: PageLoad = async ({ fetch }) => {
  return await loadDataset(fetch, base);
};
