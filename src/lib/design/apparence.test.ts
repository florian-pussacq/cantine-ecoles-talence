import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  APPARENCES,
  appliquerApparence,
  ATTRIBUT_APPARENCE,
  CLE_APPARENCE,
  ecrireApparence,
  lireApparence,
  type Apparence,
  type StockageApparence
} from './apparence.js';

function stockageMemoire(initial: Record<string, string> = {}): StockageApparence {
  const donnees = { ...initial };
  return {
    getItem: (cle) => donnees[cle] ?? null,
    setItem: (cle, valeur) => {
      donnees[cle] = valeur;
    },
    removeItem: (cle) => {
      delete donnees[cle];
    }
  };
}

const refusant: StockageApparence = {
  getItem: () => {
    throw new DOMException('refusé');
  },
  setItem: () => {
    throw new DOMException('quota dépassé');
  },
  removeItem: () => {
    throw new DOMException('refusé');
  }
};

describe('lireApparence', () => {
  it('suit l’appareil quand rien n’a été choisi', () => {
    expect(lireApparence(stockageMemoire())).toBe('appareil');
  });

  it('relit un choix enregistré', () => {
    expect(lireApparence(stockageMemoire({ [CLE_APPARENCE]: 'sombre' }))).toBe('sombre');
    expect(lireApparence(stockageMemoire({ [CLE_APPARENCE]: 'clair' }))).toBe('clair');
  });

  it('ignore une valeur inconnue, sans erreur', () => {
    expect(lireApparence(stockageMemoire({ [CLE_APPARENCE]: 'dark' }))).toBe('appareil');
  });

  it('suit l’appareil sans stockage, ou quand il refuse', () => {
    expect(lireApparence(null)).toBe('appareil');
    expect(lireApparence(refusant)).toBe('appareil');
  });
});

describe('ecrireApparence', () => {
  it('enregistre un choix imposé, puis l’efface au retour à l’appareil', () => {
    const stockage = stockageMemoire();
    expect(ecrireApparence(stockage, 'sombre')).toBe(true);
    expect(stockage.getItem(CLE_APPARENCE)).toBe('sombre');

    expect(ecrireApparence(stockage, 'appareil')).toBe(true);
    expect(stockage.getItem(CLE_APPARENCE)).toBeNull();
  });

  it('rend faux quand le stockage manque ou refuse', () => {
    expect(ecrireApparence(null, 'clair')).toBe(false);
    expect(ecrireApparence(refusant, 'clair')).toBe(false);
  });
});

/*
  `app.html` tel que le navigateur le reçoit, et son script d'apparence exécuté.

  Le script est extrait par la clé qu'il lit et exécuté sur le document, avec un
  stockage de test à la place de `localStorage` : c'est le texte servi qui est
  éprouvé, et non une copie. Les jetons de substitution de SvelteKit sont
  retirés : ils ne sont pas du HTML.
*/
const APP_HTML = readFileSync('src/app.html', 'utf8').replace(/%sveltekit\.[\w.]+%/g, '');

function documentServi(stocke: string | null): Document {
  const document = new DOMParser().parseFromString(APP_HTML, 'text/html');
  const scripts = [...document.querySelectorAll('script')].filter((script) =>
    script.textContent.includes(`'${CLE_APPARENCE}'`)
  );
  expect(scripts).toHaveLength(1);
  const stockage = stockageMemoire(stocke === null ? {} : { [CLE_APPARENCE]: stocke });
  new Function('document', 'localStorage', scripts[0]?.textContent ?? '')(document, stockage);
  return document;
}

function etat(document: Document) {
  return {
    attribut: document.documentElement.getAttribute(ATTRIBUT_APPARENCE),
    schema: document.querySelector('meta[name="color-scheme"]')?.getAttribute('content'),
    barres: [...document.querySelectorAll('meta[name="theme-color"]')].map((barre) => ({
      palette: barre.getAttribute('data-palette'),
      media: barre.getAttribute('media')
    }))
  };
}

describe('le script de app.html peint le choix avant la première peinture', () => {
  it('nomme la palette de chaque barre du navigateur', () => {
    expect(etat(documentServi(null)).barres).toEqual([
      { palette: 'clair', media: '(prefers-color-scheme: light)' },
      { palette: 'sombre', media: '(prefers-color-scheme: dark)' }
    ]);
  });

  it('ne touche à rien sans choix enregistré', () => {
    expect(etat(documentServi(null))).toMatchObject({ attribut: null, schema: 'light dark' });
  });

  it('se tait si le stockage refuse', () => {
    const document = new DOMParser().parseFromString(APP_HTML, 'text/html');
    const script = [...document.querySelectorAll('script')].find((s) =>
      s.textContent.includes(`'${CLE_APPARENCE}'`)
    );
    expect(() =>
      new Function('document', 'localStorage', script?.textContent ?? '')(document, refusant)
    ).not.toThrow();
    expect(document.documentElement.hasAttribute(ATTRIBUT_APPARENCE)).toBe(false);
  });

  it('ne touche à rien devant une valeur inconnue', () => {
    expect(etat(documentServi('dark')).attribut).toBeNull();
  });

  /*
    Le script recopie `appliquerApparence`, faute de pouvoir l'importer. Les
    deux sont exécutés sur le même document et doivent laisser le même état :
    sinon, le premier rendu et le rendu après un choix diffèrent.
  */
  for (const choix of APPARENCES) {
    it(`laisse le même état que appliquerApparence pour « ${choix} »`, () => {
      const servi = documentServi(choix === 'appareil' ? null : choix);
      const attendu = documentServi(null);
      appliquerApparence(attendu, choix);
      expect(etat(servi)).toEqual(etat(attendu));
    });
  }

  it('revient exactement au document servi quand on rend la main à l’appareil', () => {
    const document = documentServi(null);
    const initial = etat(document);
    for (const choix of ['sombre', 'clair', 'appareil'] as Apparence[]) {
      appliquerApparence(document, choix);
    }
    expect(etat(document)).toEqual(initial);
  });

  it('impose la barre de la palette choisie et éteint l’autre', () => {
    const document = documentServi('sombre');
    expect(etat(document)).toEqual({
      attribut: 'sombre',
      schema: 'dark',
      barres: [
        { palette: 'clair', media: 'not all' },
        { palette: 'sombre', media: 'all' }
      ]
    });
  });
});
