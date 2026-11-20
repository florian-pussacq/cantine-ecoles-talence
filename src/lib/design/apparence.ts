/**
 * Le choix d'apparence : suivre l'appareil, ou imposer le clair ou le sombre
 * (choix-d-apparence, D1).
 *
 * Ce module est la moitié testable du réglage. L'autre moitié est le script en
 * ligne de `app.html`, qui pose le même attribut avant la première peinture : il
 * ne peut rien importer, et recopie donc `CLE_APPARENCE` et `appliquerApparence`.
 * `apparence.test.ts` garde la copie.
 *
 * Comme le filtre allergènes, le choix prend le stockage en paramètre, et toute
 * anomalie ramène au comportement par défaut : suivre l'appareil.
 */

export const CLE_APPARENCE = 'cantine.apparence';

/** L'attribut de la racine que lit `tokens.css`. Absent : l'appareil décide. */
export const ATTRIBUT_APPARENCE = 'data-apparence';

export const APPARENCES = ['appareil', 'clair', 'sombre'] as const;

export type Apparence = (typeof APPARENCES)[number];

/** Le stockage tel que ce réglage s'en sert : suivre l'appareil efface la clé. */
export type StockageApparence = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function estImposee(valeur: unknown): valeur is 'clair' | 'sombre' {
  return valeur === 'clair' || valeur === 'sombre';
}

/** Relit le choix. Stockage absent, refusé ou valeur inconnue : l'appareil. */
export function lireApparence(stockage: StockageApparence | null): Apparence {
  if (stockage === null) return 'appareil';
  try {
    const valeur = stockage.getItem(CLE_APPARENCE);
    return estImposee(valeur) ? valeur : 'appareil';
  } catch {
    return 'appareil';
  }
}

/**
 * Enregistre le choix. Rend `false` si le stockage a refusé.
 *
 * Suivre l'appareil n'est pas une valeur mais l'absence de choix : la clé est
 * effacée, et un appareil qui n'a jamais rien choisi ressemble trait pour trait
 * à un appareil qui est revenu au défaut.
 */
export function ecrireApparence(stockage: StockageApparence | null, choix: Apparence): boolean {
  if (stockage === null) return false;
  try {
    if (choix === 'appareil') stockage.removeItem(CLE_APPARENCE);
    else stockage.setItem(CLE_APPARENCE, choix);
    return true;
  } catch {
    return false;
  }
}

/**
 * Peint le choix sur le document : l'attribut de la racine, et les balises que
 * le navigateur lit hors de la feuille de style (D3).
 *
 * Les deux `theme-color` gardent leur couleur ; seul leur `media` change. La
 * couleur de chaque palette reste ainsi écrite une seule fois, dans `app.html`,
 * là où `contrast.test.ts` la compare à `--fond`.
 */
export function appliquerApparence(document: Document, choix: Apparence): void {
  const racine = document.documentElement;
  if (choix === 'appareil') racine.removeAttribute(ATTRIBUT_APPARENCE);
  else racine.setAttribute(ATTRIBUT_APPARENCE, choix);

  const schema = document.querySelector('meta[name="color-scheme"]');
  schema?.setAttribute(
    'content',
    choix === 'clair' ? 'light' : choix === 'sombre' ? 'dark' : 'light dark'
  );

  for (const barre of document.querySelectorAll('meta[name="theme-color"][data-palette]')) {
    const palette = barre.getAttribute('data-palette');
    const media =
      choix === 'appareil'
        ? `(prefers-color-scheme: ${palette === 'sombre' ? 'dark' : 'light'})`
        : palette === choix
          ? 'all'
          : 'not all';
    barre.setAttribute('media', media);
  }
}

/** Le stockage du navigateur, ou `null` s'il est indisponible. */
export function stockageNavigateur(): StockageApparence | null {
  try {
    const stockage = globalThis.localStorage;
    stockage.getItem(CLE_APPARENCE);
    return stockage;
  } catch {
    return null;
  }
}
