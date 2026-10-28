import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { aujourdhuiAParis, constats, horizon, liensDeMenus } from './veille-pdf.js';

/**
 * La veille des PDF de la Ville, sans réseau (veille-des-pdf).
 *
 * La page est celle du 18 octobre 2026, réduite à ses liens. Les données
 * publiées sont construites ici : chaque cas ne garde que ce qu'il éprouve.
 */

const PAGE = readFileSync('fixtures/page-menus.html', 'utf8');
const UPLOADS = 'https://www.talence.fr/wp-content/uploads';

/** @param {string} chemin @param {string} sha */
const publie = (chemin, sha) => ({
  fichier: 'x.json',
  pdfUrl: `${UPLOADS}/${chemin}`,
  pdfSha256: sha
});

describe('le relevé de la page', () => {
  it('ne retient que les menus', () => {
    const liens = liensDeMenus(PAGE);
    expect(liens).toHaveLength(7);
    expect(liens.every((url) => url.includes('MENUS-WEB'))).toBe(true);
    expect(liens).toContain(`${UPLOADS}/2023/10/00-MENUS-WEB-GREVES.pdf`);
  });

  it('ne trouve rien sur une page refondue', () => {
    // C'est à la fonction principale de refuser ce vide (D2) ; le relevé, lui,
    // ne doit pas inventer de lien.
    expect(liensDeMenus('<html><body><a href="/plan.pdf">Plan</a></body></html>')).toEqual([]);
  });
});

describe('les constats (D1)', () => {
  const OCTOBRE = '2026/10/10-MENUS-WEB-OCTOBRE-2026.pdf';

  it('ne dit rien quand la page et les données concordent', () => {
    const resultat = constats([{ url: `${UPLOADS}/${OCTOBRE}`, sha: 'a' }], [publie(OCTOBRE, 'a')]);
    expect(resultat).toEqual({ actions: [], avertissements: [] });
  });

  it('nomme un menu qu’aucune donnée ne cite', () => {
    const fevrier = `${UPLOADS}/2027/01/02-MENUS-WEB-FEVRIER-2027.pdf`;
    const { actions } = constats([{ url: fevrier, sha: 'f' }], [publie(OCTOBRE, 'a')]);
    expect(actions).toEqual([
      { type: 'nouveau', nom: '02-MENUS-WEB-FEVRIER-2027.pdf', url: fevrier }
    ]);
  });

  it('nomme un menu cité dont l’empreinte a changé', () => {
    const { actions } = constats(
      [{ url: `${UPLOADS}/${OCTOBRE}`, sha: 'b' }],
      [publie(OCTOBRE, 'a')]
    );
    expect(actions).toEqual([
      { type: 'republie', nom: '10-MENUS-WEB-OCTOBRE-2026.pdf', url: `${UPLOADS}/${OCTOBRE}` }
    ]);
  });

  it('signale sans action un menu déplacé à l’identique', () => {
    // Septembre 2026 était passé de /2026/06/ à /2026/08/ en le rééditant.
    const ailleurs = `${UPLOADS}/2026/11/10-MENUS-WEB-OCTOBRE-2026.pdf`;
    const resultat = constats([{ url: ailleurs, sha: 'a' }], [publie(OCTOBRE, 'a')]);
    expect(resultat.actions).toEqual([]);
    expect(resultat.avertissements).toEqual([
      {
        type: 'deplace',
        nom: '10-MENUS-WEB-OCTOBRE-2026.pdf',
        ancienne: `${UPLOADS}/${OCTOBRE}`,
        nouvelle: ailleurs
      }
    ]);
  });

  describe('la réédition renommée', () => {
    // Le 23 octobre 2026 : WordPress a suffixé `-1` le janvier réédité.
    const JANVIER = '2026/10/01-MENUS-WEB-JANVIER-2027.pdf';
    const JANVIER_1 = `${UPLOADS}/2026/10/01-MENUS-WEB-JANVIER-2027-1.pdf`;
    const janvier = { ...publie(JANVIER, 'a'), fichier: '2027-01.json' };

    it('nomme le document remplacé et le fichier à reprendre', () => {
      const { actions } = constats([{ url: JANVIER_1, sha: 'b' }], [janvier]);
      expect(actions).toEqual([
        {
          type: 'renomme',
          nom: '01-MENUS-WEB-JANVIER-2027-1.pdf',
          url: JANVIER_1,
          remplace: '01-MENUS-WEB-JANVIER-2027.pdf',
          fichier: '2027-01.json'
        }
      ]);
    });

    it('est un déplacement à empreinte égale', () => {
      const resultat = constats([{ url: JANVIER_1, sha: 'a' }], [janvier]);
      expect(resultat.actions).toEqual([]);
      expect(resultat.avertissements).toEqual([
        {
          type: 'deplace',
          nom: '01-MENUS-WEB-JANVIER-2027-1.pdf',
          ancienne: `${UPLOADS}/${JANVIER}`,
          nouvelle: JANVIER_1
        }
      ]);
    });

    it('reconnaît un document déjà suffixé', () => {
      const toussaint = '2026/09/10-MENUS-WEB-TOUSSAINT-2026-1.pdf';
      const reedite = `${UPLOADS}/2026/10/10-MENUS-WEB-TOUSSAINT-2026-2.pdf`;
      const { actions } = constats([{ url: reedite, sha: 'b' }], [publie(toussaint, 'a')]);
      expect(actions).toMatchObject([
        { type: 'renomme', remplace: '10-MENUS-WEB-TOUSSAINT-2026-1.pdf' }
      ]);
    });

    it('préfère le nom exact', () => {
      const exact = `${UPLOADS}/${JANVIER}`;
      const resultat = constats(
        [
          { url: exact, sha: 'a' },
          { url: JANVIER_1, sha: 'b' }
        ],
        [janvier]
      );
      // Le nom exact concorde ; le suffixé reste une réédition de ce même document.
      expect(resultat.actions).toMatchObject([
        { type: 'renomme', nom: '01-MENUS-WEB-JANVIER-2027-1.pdf' }
      ]);
      expect(resultat.avertissements).toEqual([]);
    });

    it('ne prend pas l’année pour un suffixe', () => {
      const avecAnnee = `${UPLOADS}/2026/10/01-MENUS-WEB-JANVIER-2027.pdf`;
      const { actions } = constats(
        [{ url: avecAnnee, sha: 'b' }],
        [publie('2026/10/01-MENUS-WEB-JANVIER.pdf', 'a')]
      );
      expect(actions).toMatchObject([{ type: 'nouveau' }]);
    });
  });

  it('se tait sur un mois passé retiré de la page', () => {
    const aout = '2026/06/08-MENUS-WEB-AOUT-2026.pdf';
    const resultat = constats(
      [{ url: `${UPLOADS}/${OCTOBRE}`, sha: 'a' }],
      [publie(OCTOBRE, 'a'), publie(aout, 'z')]
    );
    expect(resultat).toEqual({ actions: [], avertissements: [] });
  });
});

describe('l’horizon du corpus', () => {
  const jours = ['2027-01-28', '2027-01-29', '2026-12-31'];

  it('dit jusqu’à quand le corpus couvre, et dans combien de jours', () => {
    expect(horizon(jours, '2027-01-15')).toEqual({
      dernier: '2027-01-29',
      jours: 14,
      court: false
    });
  });

  it('est court à moins de quatorze jours', () => {
    expect(horizon(jours, '2027-01-16')).toEqual({ dernier: '2027-01-29', jours: 13, court: true });
  });

  it('est court quand le corpus est déjà épuisé', () => {
    // Le 16 octobre 2026 : rien n'avait changé côté données, le temps avait passé.
    expect(horizon(jours, '2027-02-03').court).toBe(true);
  });

  it('lit la date du jour à Paris, et non en UTC', () => {
    // 23 h 30 UTC le 31 décembre, c'est déjà le 1er janvier à Paris.
    expect(aujourdhuiAParis(new Date('2026-12-31T23:30:00Z'))).toBe('2027-01-01');
  });
});
