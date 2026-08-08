import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { KeyValueStore } from '../filter/storage.js';
import { applyTheme, readTheme, THEME_KEY, THEMES, writeTheme } from './theme.svelte.js';

/** Un stockage en mémoire, ou qui refuse tout. */
function stockage(initial: Record<string, string> = {}, refuse = false): KeyValueStore {
  const donnees = new Map(Object.entries(initial));
  return {
    getItem: (cle) => {
      if (refuse) throw new Error('stockage indisponible');
      return donnees.get(cle) ?? null;
    },
    setItem: (cle, valeur) => {
      if (refuse) throw new Error('stockage indisponible');
      donnees.set(cle, valeur);
    }
  };
}

describe('relecture du thème', () => {
  it('suit le système quand rien n’a été choisi', () => {
    expect(readTheme(stockage())).toBe('system');
  });

  it('rend le thème enregistré', () => {
    expect(readTheme(stockage({ [THEME_KEY]: 'dark' }))).toBe('dark');
  });

  it('ignore une valeur inconnue plutôt que de la propager', () => {
    expect(readTheme(stockage({ [THEME_KEY]: 'fluo' }))).toBe('system');
  });

  it('suit le système sans stockage', () => {
    expect(readTheme(null)).toBe('system');
  });

  it('suit le système quand le stockage refuse la lecture', () => {
    expect(readTheme(stockage({}, true))).toBe('system');
  });
});

describe('enregistrement du thème', () => {
  it('confirme quand le stockage accepte', () => {
    const store = stockage();
    expect(writeTheme(store, 'light')).toBe(true);
    expect(readTheme(store)).toBe('light');
  });

  it('signale sans échouer quand le stockage refuse', () => {
    // Mode privé strict ou quota plein : ce n'est pas une erreur, c'est une
    // mémoire absente. L'application doit continuer (D6).
    expect(writeTheme(stockage({}, true), 'dark')).toBe(false);
    expect(writeTheme(null, 'dark')).toBe(false);
  });
});

describe('application au document', () => {
  function scene() {
    const racine = document.createElement('html');
    const clair = document.createElement('meta');
    clair.name = 'theme-color';
    clair.dataset.teinte = 'light';
    const sombre = document.createElement('meta');
    sombre.name = 'theme-color';
    sombre.dataset.teinte = 'dark';
    return { racine, teintes: [clair, sombre] };
  }

  it('ne pose aucun attribut quand on suit le système', () => {
    const { racine, teintes } = scene();
    applyTheme('system', racine, teintes);
    expect(racine.hasAttribute('data-theme')).toBe(false);
    expect(teintes.map((m) => m.media)).toEqual([
      '(prefers-color-scheme: light)',
      '(prefers-color-scheme: dark)'
    ]);
  });

  it('pose l’attribut et n’active que la teinte correspondante', () => {
    const { racine, teintes } = scene();
    applyTheme('dark', racine, teintes);
    expect(racine.getAttribute('data-theme')).toBe('dark');
    expect(teintes.map((m) => m.media)).toEqual(['not all', 'all']);
  });

  it('revient au suivi du système après un thème forcé', () => {
    const { racine, teintes } = scene();
    applyTheme('light', racine, teintes);
    applyTheme('system', racine, teintes);
    expect(racine.hasAttribute('data-theme')).toBe(false);
    expect(teintes.every((m) => m.media.startsWith('(prefers-color-scheme'))).toBe(true);
  });
});

/**
 * Le script anti-clignotement de `app.html` duplique la clé et les noms de
 * thèmes, faute de pouvoir importer un module. Cette duplication est acceptée
 * (D21) mais pas laissée sans surveillance : une clé renommée d'un seul côté
 * ferait silencieusement réapparaître le clignotement, sans qu'aucun autre test
 * ne s'en aperçoive.
 */
describe('le script anti-clignotement reste aligné', () => {
  const HTML = readFileSync('src/app.html', 'utf8');

  it('emploie la même clé de stockage', () => {
    expect(HTML).toContain(`localStorage.getItem('${THEME_KEY}')`);
  });

  it('reconnaît exactement les thèmes forçables', () => {
    for (const theme of THEMES.filter((t) => t !== 'system')) {
      expect(HTML, `le script ignore le thème « ${theme} »`).toContain(`'${theme}'`);
    }
  });

  it('pose l’attribut que la palette attend', () => {
    expect(HTML).toContain("setAttribute('data-theme', theme)");
  });
});

/**
 * Les valeurs traversent trois fichiers : ce module les pose, `app.html` les
 * pose avant la peinture, et `tokens.css` les sélectionne. Rien dans le
 * typage ne relie les trois — c'est une chaîne de chaînes de caractères.
 *
 * Ce contrôle existe parce que la panne a été écrite : la première version
 * posait `data-theme="sombre"` et une requête `(prefers-color-scheme: clair)`,
 * ni l'un ni l'autre n'étant du CSS valide. Les tests d'alors passaient, parce
 * qu'ils affirmaient la valeur produite au lieu de la valeur attendue.
 */
describe('le vocabulaire du thème est celui du CSS', () => {
  const CSS = readFileSync('src/lib/design/tokens.css', 'utf8');

  for (const theme of THEMES.filter((t) => t !== 'system')) {
    it(`la palette sélectionne bien [data-theme='${theme}']`, () => {
      expect(CSS).toContain(`:root[data-theme='${theme}']`);
    });

    it(`« ${theme} » est une valeur valide de prefers-color-scheme`, () => {
      // Les seules que la spécification définit.
      expect(['light', 'dark']).toContain(theme);
    });
  }

  it('le suivi du système produit des requêtes de média valides', () => {
    const racine = document.createElement('html');
    const meta = document.createElement('meta');
    meta.dataset.teinte = 'dark';
    applyTheme('system', racine, [meta]);
    // `matchMedia` validerait la syntaxe, mais jsdom ne l'implémente pas :
    // l'égalité littérale est ici la vérification la plus forte disponible.
    expect(meta.media).toBe('(prefers-color-scheme: dark)');
  });
});
