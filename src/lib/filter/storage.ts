/**
 * Persistance du filtre allergènes.
 *
 * Le réglage est une préférence d'affichage, pas un profil : ni nom, ni identité,
 * ni jeux multiples (design.md, D10). Rien de ce qui est écrit ici ne ressemble,
 * même de loin, à une donnée personnelle.
 *
 * Toute la logique est pure et prend le stockage en paramètre, pour être testable
 * sans navigateur — y compris le cas où il n'y en a pas.
 */

export const STORAGE_KEY = 'cantine.allergenes';

/** Les quatorze codes réglementaires. */
export const ALLERGEN_CODES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const;

/**
 * Une vue minimale de `localStorage`.
 *
 * Réduite à ce dont on se sert, pour qu'un substitut de test tienne en trois
 * lignes et qu'aucun appel non prévu ne passe inaperçu.
 */
export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem'>;

function isValidCode(value: unknown): value is number {
  return (
    typeof value === 'number' && ALLERGEN_CODES.includes(value as (typeof ALLERGEN_CODES)[number])
  );
}

/**
 * Relit la sélection enregistrée.
 *
 * Toute anomalie — stockage absent, JSON cassé, code hors bornes — donne une
 * sélection vide plutôt qu'une erreur : l'application doit rester consultable
 * sans filtre, qui n'est qu'un confort.
 */
export function readSelection(store: KeyValueStore | null): Set<number> {
  if (store === null) return new Set();

  let raw: string | null;
  try {
    raw = store.getItem(STORAGE_KEY);
  } catch {
    return new Set();
  }
  if (raw === null) return new Set();

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter(isValidCode));
  } catch {
    return new Set();
  }
}

/**
 * Enregistre la sélection. Rend `false` si le stockage a refusé.
 *
 * Le refus n'est pas une erreur : c'est le mode privé strict, ou un quota plein.
 * L'appelant en informe l'utilisateur au moment où il agit, et l'application
 * continue de fonctionner sans mémoire.
 */
export function writeSelection(store: KeyValueStore | null, codes: Iterable<number>): boolean {
  if (store === null) return false;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify([...codes].sort((a, b) => a - b)));
    return true;
  } catch {
    return false;
  }
}

/** Le stockage du navigateur, ou `null` s'il est indisponible. */
export function browserStore(): KeyValueStore | null {
  try {
    const probe = globalThis.localStorage;
    // Un accès suffit à lever dans les contextes où le stockage est bloqué.
    probe.getItem(STORAGE_KEY);
    return probe;
  } catch {
    return null;
  }
}
