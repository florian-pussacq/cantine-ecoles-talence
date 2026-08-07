/**
 * Les quatorze allergènes réglementaires et leur pictogramme.
 *
 * C'est le seul jeu de dessins de l'application qui porte une information de
 * santé. Il ne remplace jamais le texte : chaque pictogramme accompagne le nom
 * de l'allergène en toutes lettres, et il est masqué aux technologies
 * d'assistance pour ne pas être lu deux fois.
 *
 * Les codes sont ceux de l'annexe II du règlement (UE) n° 1169/2011, dans
 * l'ordre où le document de la Ville les imprime.
 */

export const ALLERGEN_ICONS: Record<number, string> = {
  1: 'alg-gluten',
  2: 'alg-crustaces',
  3: 'alg-oeufs',
  4: 'alg-poisson',
  5: 'alg-arachides',
  6: 'alg-soja',
  7: 'alg-lait',
  8: 'alg-fruits-a-coque',
  9: 'alg-celeri',
  10: 'alg-moutarde',
  11: 'alg-sesame',
  12: 'alg-sulfites',
  13: 'alg-lupin',
  14: 'alg-mollusques'
};

/**
 * Le pictogramme d'un code, ou le repli.
 *
 * Un code inconnu prend un point d'exclamation plutôt que rien : la légende du
 * document peut évoluer, et escamoter un allergène qu'on ne sait pas dessiner
 * serait perdre une information de santé.
 */
export function allergenIcon(code: number): string {
  return ALLERGEN_ICONS[code] ?? 'alg-defaut';
}
