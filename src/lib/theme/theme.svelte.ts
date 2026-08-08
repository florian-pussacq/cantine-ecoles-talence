import { browser } from '$app/environment';
// `browserStore` et `KeyValueStore` ne sont pas propres au filtre : ils décrivent
// un stockage local dont on se méfie. Ils sont réutilisés tels quels plutôt que
// recopiés, quitte à ce que l'import traverse un dossier voisin.
import { browserStore, type KeyValueStore } from '../filter/storage.js';

/**
 * Le thème choisi (design.md, D21 et D22).
 *
 * Trois états, dont un seul par défaut : suivre le système. Le choix est une
 * préférence d'affichage et rien d'autre — comme le filtre allergènes, il reste
 * sur l'appareil et n'est jamais envoyé nulle part.
 *
 * Si le stockage refuse, l'application continue de suivre le système sans
 * erreur visible : un thème est un confort, pas un prérequis à la lecture d'un
 * menu (D6).
 */

export const THEME_KEY = 'cantine.theme';

/**
 * Les valeurs sont celles du CSS, pas du français.
 *
 * Elles sortent du code : `data-theme` est lu par `tokens.css`, et le nom des
 * teintes est celui de `prefers-color-scheme`. Les traduire ici imposerait une
 * correspondance à tenir dans le module, dans le script en ligne de `app.html`
 * et dans la feuille de style — trois endroits pour un mot. Le français reste
 * dans les libellés, où il est lu par des humains.
 */
export const THEMES = ['system', 'light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

function estTheme(valeur: unknown): valeur is Theme {
  return typeof valeur === 'string' && (THEMES as readonly string[]).includes(valeur);
}

/** Relit le thème enregistré. Toute anomalie ramène au suivi du système. */
export function readTheme(store: KeyValueStore | null): Theme {
  if (store === null) return 'system';
  try {
    const brut = store.getItem(THEME_KEY);
    return estTheme(brut) ? brut : 'system';
  } catch {
    return 'system';
  }
}

/** Enregistre le thème. Rend `false` si le stockage a refusé. */
export function writeTheme(store: KeyValueStore | null, theme: Theme): boolean {
  if (store === null) return false;
  try {
    store.setItem(THEME_KEY, theme);
    return true;
  } catch {
    return false;
  }
}

/**
 * Applique le thème au document.
 *
 * L'attribut pilote les deux blocs de renvois de `tokens.css` (D20). La couleur
 * annoncée au navigateur suit, en basculant les requêtes de média des balises
 * déjà présentes plutôt qu'en réécrivant une couleur : la valeur reste déclarée
 * à un seul endroit, et un thème forcé ne peut pas afficher la teinte de
 * l'autre.
 */
export function applyTheme(theme: Theme, racine: HTMLElement, teintes: Iterable<HTMLMetaElement>) {
  if (theme === 'system') racine.removeAttribute('data-theme');
  else racine.setAttribute('data-theme', theme);

  for (const meta of teintes) {
    const sienne = meta.dataset.teinte;
    if (sienne === undefined) continue;
    if (theme === 'system') meta.media = `(prefers-color-scheme: ${sienne})`;
    else meta.media = sienne === theme ? 'all' : 'not all';
  }
}

class ThemePreference {
  #theme = $state<Theme>('system');
  #store: KeyValueStore | null = null;
  #persists = $state(true);
  #loaded = false;

  /** Relit le stockage. Sans effet côté serveur, où il n'y en a pas. */
  hydrate() {
    if (!browser || this.#loaded) return;
    this.#loaded = true;
    this.#store = browserStore();
    this.#persists = this.#store !== null;
    this.#theme = readTheme(this.#store);
    // Le script en ligne de `app.html` a déjà posé l'attribut avant la première
    // peinture. Cet appel remet seulement les balises de teinte en cohérence
    // dans le cas « suivre le système », que le script n'a pas à toucher.
    this.#appliquer();
  }

  get theme(): Theme {
    return this.#theme;
  }

  /** Faux si le choix ne survivra pas à la fermeture de l'onglet. */
  get persists(): boolean {
    return this.#persists;
  }

  set(theme: Theme) {
    this.#theme = theme;
    this.#persists = writeTheme(this.#store, theme);
    this.#appliquer();
  }

  #appliquer() {
    if (!browser) return;
    applyTheme(
      this.#theme,
      document.documentElement,
      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"][data-teinte]')
    );
  }
}

export const themePreference = new ThemePreference();

/** Le libellé de chaque option, énoncé en toutes lettres. */
export const THEME_LABELS: Record<Theme, string> = {
  system: 'Comme mon système',
  light: 'Clair',
  dark: 'Sombre'
};
