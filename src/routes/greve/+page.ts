import { base } from '$app/paths';
import type { StrikeMenu } from '$lib/data/schema.js';
import type { PageLoad } from './$types.js';

/**
 * Le menu de grève se charge à part.
 *
 * Il n'est pas inscrit au manifeste, et c'est délibéré : `loadDataset` n'ouvre
 * que les mois qui y figurent, si bien qu'aucun plat de ce fichier ne peut
 * atteindre l'écran du jour. L'application ne sait pas qu'il y a grève ; le seul
 * chemin vers ce menu est celui que l'utilisateur emprunte lui-même.
 *
 * Le chargement a lieu au pré-rendu : le contenu est cuit dans le HTML de cet
 * écran, donc consultable hors ligne dès la première ouverture, sans requête à
 * l'exécution.
 */
export const load: PageLoad = async ({ fetch }) => {
  try {
    const response = await fetch(`${base}/data/greve.json`);
    if (!response.ok) return { menu: null };
    const menu: StrikeMenu = await response.json();
    // Un fichier plus récent que ce que l'écran sait lire n'est pas interprété à
    // moitié : la même règle que pour les menus mensuels.
    if (menu.schemaVersion > 1) return { menu: null };
    return { menu };
  } catch {
    return { menu: null };
  }
};
