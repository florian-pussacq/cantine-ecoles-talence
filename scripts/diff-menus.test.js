import { describe, expect, it } from 'vitest';
import { differences } from './diff-menus.js';

/**
 * La relecture d'une réextraction, plat par plat (reedition-renommee, D3).
 *
 * Les jours sont construits ici, réduits à ce que chaque cas éprouve. Les
 * libellés sont ceux de la réédition du 23 octobre 2026.
 */

/**
 * @typedef {import('./diff-menus.js').Plat} Plat
 * @typedef {import('./diff-menus.js').Jour} Jour
 */

/** @param {string} slot @param {string} label @param {number[]} [allergens] @param {string[]} [flags] */
const plat = (slot, label, allergens = [], flags = []) => ({ slot, label, allergens, flags });

/** @param {string} date @param {Plat[]} courses @param {Jour} [extra] */
const jour = (date, courses, extra = {}) => ({
  date,
  kind: 'school',
  confidence: 'high',
  courses,
  ...extra
});

/** @param {(Jour & { date: string })[]} days */
const mois = (days) => ({ schemaVersion: 1, month: '2026-11', source: {}, days });

describe('les plats', () => {
  it('nomme un plat remplacé', () => {
    const avant = mois([jour('2026-11-13', [plat('dessert', 'Dessert maison', [1, 3, 7, 8])])]);
    const apres = mois([
      jour('2026-11-13', [plat('dessert', 'Cheesecake aux Oreo', [1, 3, 7, 8])])
    ]);
    expect(differences(avant, apres)).toEqual([
      '2026-11-13 dessert : Dessert maison → Cheesecake aux Oreo'
    ]);
  });

  it('nomme un allergène ajouté ou retiré', () => {
    const avant = mois([jour('2026-11-19', [plat('entree', 'Pain de Gotham', [1, 3, 7])])]);
    const apres = mois([jour('2026-11-19', [plat('entree', 'Pain de Gotham', [1, 7, 14])])]);
    expect(differences(avant, apres)).toEqual([
      '2026-11-19 entree (Pain de Gotham) : allergènes +14 −3'
    ]);
  });

  it('nomme un label retiré', () => {
    const avant = mois([jour('2026-11-25', [plat('plat', 'Rôti de bœuf', [12], ['bio'])])]);
    const apres = mois([jour('2026-11-25', [plat('plat', 'Rôti de bœuf', [12])])]);
    expect(differences(avant, apres)).toEqual(['2026-11-25 plat (Rôti de bœuf) : labels −bio']);
  });

  it('dit ensemble le libellé et les allergènes d’un même plat', () => {
    const avant = mois([jour('2027-01-05', [plat('plat', "Croq'fromage", [1, 3, 7, 8])])]);
    const apres = mois([jour('2027-01-05', [plat('plat', 'Cordon bleu végétal', [1])])]);
    expect(differences(avant, apres)).toEqual([
      "2027-01-05 plat : Croq'fromage → Cordon bleu végétal ; allergènes −3 −7 −8"
    ]);
  });

  it('nomme un créneau ajouté ou retiré', () => {
    const avant = mois([jour('2026-11-03', [plat('laitage', 'Yaourt')])]);
    const apres = mois([jour('2026-11-03', [plat('accompagnement', 'Riz')])]);
    expect(differences(avant, apres)).toEqual([
      '2026-11-03 laitage : retiré (Yaourt)',
      '2026-11-03 accompagnement : ajouté (Riz)'
    ]);
  });
});

describe('les jours', () => {
  it('nomme un changement de genre du jour', () => {
    const avant = mois([jour('2026-11-11', [plat('plat', 'Lasagnes')])]);
    const apres = mois([
      { date: '2026-11-11', kind: 'public-holiday', confidence: 'high', courses: [] }
    ]);
    expect(differences(avant, apres)).toEqual([
      '2026-11-11 : school → public-holiday',
      '2026-11-11 plat : retiré (Lasagnes)'
    ]);
  });

  it('nomme un thème, sa note et la confiance', () => {
    const avant = mois([jour('2026-11-19', [])]);
    const apres = mois([
      jour('2026-11-19', [], {
        theme: 'Black Panther VS Batman',
        note: 'Ambiance…',
        confidence: 'low'
      })
    ]);
    expect(differences(avant, apres)).toEqual([
      '2026-11-19 thème : (aucun) → Black Panther VS Batman',
      '2026-11-19 note : (aucune) → Ambiance…',
      '2026-11-19 confiance : high → low'
    ]);
  });

  it('nomme un jour ajouté ou retiré', () => {
    const avant = mois([jour('2026-11-02', [])]);
    const apres = mois([jour('2026-11-30', [])]);
    expect(differences(avant, apres)).toEqual([
      '2026-11-02 : jour retiré',
      '2026-11-30 : jour ajouté'
    ]);
  });

  it('se tait sur un fichier seulement reformaté', () => {
    const donnee = mois([jour('2026-11-13', [plat('dessert', 'Dessert maison', [1])])]);
    const reformate = JSON.parse(JSON.stringify(donnee, null, 4));
    expect(differences(donnee, reformate)).toEqual([]);
  });

  it('ignore la source, qui change à chaque extraction', () => {
    const avant = { ...mois([]), source: { fetchedAt: '2026-10-17T08:23:02Z' } };
    const apres = { ...mois([]), source: { fetchedAt: '2026-10-28T18:26:23Z' } };
    expect(differences(avant, apres)).toEqual([]);
  });
});

describe('les fichiers', () => {
  it('dit un mois nouveau, avec son nombre de jours', () => {
    expect(differences(null, mois([jour('2027-02-01', []), jour('2027-02-02', [])]))).toEqual([
      'nouveau, 2 jours'
    ]);
  });

  it('dit un fichier supprimé', () => {
    expect(differences(mois([jour('2026-08-31', [])]), null)).toEqual(['supprimé']);
  });

  it('lit le menu de grève par service et jour de semaine', () => {
    /** @param {string} label */
    const greve = (label) => ({
      schemaVersion: 1,
      source: {},
      services: [
        { temperature: 'froid', days: [{ weekday: 'lundi', courses: [plat('plat', label)] }] }
      ]
    });
    expect(differences(greve('Taboulé'), greve('Salade de pâtes'))).toEqual([
      'froid lundi plat : Taboulé → Salade de pâtes'
    ]);
  });
});
