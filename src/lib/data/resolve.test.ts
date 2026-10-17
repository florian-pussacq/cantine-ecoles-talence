import { describe, expect, it } from 'vitest';
import september from '../../../static/data/2026-09.json' with { type: 'json' };
import edgeCases from '../../../fixtures/edge-cases.json' with { type: 'json' };
import { buildDataset, readMonth, type MonthInput } from './dataset.js';
import type { MonthMenu } from './schema.js';
import { parisDate, resolveDisplayDay, servedNeighbour, weekOf } from './resolve.js';

const real = buildDataset([{ menu: september as MonthMenu }]);
const edges = buildDataset([{ menu: edgeCases as MonthMenu }]);

/** Midi à Paris, pour rester loin des bascules de minuit. */
function noonInParis(date: string): Date {
  return new Date(`${date}T10:00:00Z`);
}

describe('parisDate', () => {
  it('donne le jour civil français, pas celui du fuseau du navigateur', () => {
    // 23 h 30 UTC le 10 septembre, c'est déjà le 11 à Paris (UTC+2 en été).
    expect(parisDate(new Date('2026-09-10T23:30:00Z'))).toBe('2026-09-11');
  });

  it('bascule au bon moment en heure d’hiver', () => {
    // En janvier, Paris est à UTC+1 : 23 h 30 UTC est encore le même jour.
    expect(parisDate(new Date('2026-01-10T22:30:00Z'))).toBe('2026-01-10');
    expect(parisDate(new Date('2026-01-10T23:30:00Z'))).toBe('2026-01-11');
  });
});

describe('resolveDisplayDay', () => {
  it('retient le jour ouvré courant quand il est servi', () => {
    expect(resolveDisplayDay(real, noonInParis('2026-09-10'))).toEqual({
      status: 'today',
      date: '2026-09-10'
    });
  });

  it('saute au lundi depuis un samedi', () => {
    expect(resolveDisplayDay(real, noonInParis('2026-09-12'))).toEqual({
      status: 'next-served',
      date: '2026-09-14',
      daysAhead: 2,
      skipped: null
    });
  });

  it('saute au lundi depuis un dimanche', () => {
    expect(resolveDisplayDay(real, noonInParis('2026-09-13'))).toEqual({
      status: 'next-served',
      date: '2026-09-14',
      daysAhead: 1,
      skipped: null
    });
  });

  it('saute par-dessus une suite de jours non servis', () => {
    // Le fixture n'a pas de 4 janvier ; le 3 est un week-end.
    expect(resolveDisplayDay(edges, noonInParis('2099-01-03'))).toEqual({
      status: 'next-served',
      date: '2099-01-05',
      daysAhead: 2,
      skipped: 'weekend'
    });
  });

  it('ne retient pas un jour présent mais non servi', () => {
    // Le 1er janvier est déclaré « holiday » : il existe, mais il n'est pas servi.
    expect(resolveDisplayDay(edges, noonInParis('2099-01-01'))).toEqual({
      status: 'next-served',
      date: '2099-01-02',
      daysAhead: 1,
      skipped: 'holiday'
    });
  });

  it('dit qu’il saute un jour férié', () => {
    expect(resolveDisplayDay(edges, noonInParis('2099-01-08'))).toEqual({
      status: 'next-served',
      date: '2099-01-09',
      daysAhead: 1,
      skipped: 'public-holiday'
    });
  });

  it('enjambe le week-end qui suit un vendredi férié', () => {
    const friday = '2026-09-11';
    const menu = september as MonthMenu;
    const withHoliday = buildDataset([
      {
        menu: {
          ...menu,
          days: menu.days.map((day) =>
            day.date === friday ? { ...day, kind: 'public-holiday' as const, courses: [] } : day
          )
        }
      }
    ]);
    expect(resolveDisplayDay(withHoliday, noonInParis(friday))).toEqual({
      status: 'next-served',
      date: '2026-09-14',
      daysAhead: 3,
      skipped: 'public-holiday'
    });
  });

  it('signale que le mois n’est pas publié une fois le jeu de données épuisé', () => {
    expect(resolveDisplayDay(real, noonInParis('2026-09-28'))).toEqual({
      status: 'not-published'
    });
  });

  it('ne rend jamais « today » sur un jeu de données vide', () => {
    const empty = buildDataset([]);
    expect(resolveDisplayDay(empty, noonInParis('2026-09-10'))).toEqual({
      status: 'not-published'
    });
  });
});

describe('servedNeighbour', () => {
  it('passe du vendredi au lundi suivant', () => {
    expect(servedNeighbour(real, '2026-09-11', 'next')).toBe('2026-09-14');
  });

  it('remonte du lundi au vendredi précédent', () => {
    expect(servedNeighbour(real, '2026-09-14', 'previous')).toBe('2026-09-11');
  });

  it('rend null à la borne haute plutôt que d’inventer un jour', () => {
    expect(servedNeighbour(real, '2026-09-25', 'next')).toBeNull();
  });

  it('rend null à la borne basse', () => {
    expect(servedNeighbour(real, '2026-08-31', 'previous')).toBeNull();
  });
});

describe('weekOf', () => {
  it('rend les cinq jours ouvrés depuis un jour de semaine', () => {
    expect(weekOf('2026-09-10')).toEqual([
      '2026-09-07',
      '2026-09-08',
      '2026-09-09',
      '2026-09-10',
      '2026-09-11'
    ]);
  });

  it('rattache le dimanche à la semaine qui le précède', () => {
    expect(weekOf('2026-09-13')?.[0]).toBe('2026-09-07');
  });

  it('traverse une frontière de mois', () => {
    expect(weekOf('2026-09-02')).toEqual([
      '2026-08-31',
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04'
    ]);
  });
});

describe('readMonth', () => {
  it('accepte la version de contrat supportée', () => {
    expect(readMonth(september).ok).toBe(true);
  });

  it('refuse en bloc une version plus récente plutôt que de lire à moitié', () => {
    const result = readMonth({ ...september, schemaVersion: 2 });
    expect(result).toEqual({ ok: false, reason: 'schema-too-new', version: 2 });
  });

  it('refuse ce qui n’est pas un fichier mensuel', () => {
    expect(readMonth(null).ok).toBe(false);
    expect(readMonth({ schemaVersion: 1 }).ok).toBe(false);
  });
});

describe('buildDataset', () => {
  const monthly: MonthMenu = {
    ...(september as MonthMenu),
    days: [
      {
        date: '2026-09-10',
        kind: 'school',
        confidence: 'high',
        courses: [{ slot: 'plat', label: 'Version mensuelle', allergens: [], flags: [] }]
      }
    ]
  };

  function variant(label: string): MonthMenu {
    return {
      ...monthly,
      days: [{ ...monthly.days[0]!, courses: [{ ...monthly.days[0]!.courses[0]!, label }] }]
    };
  }

  function labelAt(inputs: MonthInput[], date: string) {
    return buildDataset(inputs).byDate.get(date)?.courses[0]?.label;
  }

  it('fait primer le fichier de transition sur le mensuel', () => {
    expect(
      labelAt(
        [
          { menu: monthly, kind: 'monthly' },
          { menu: variant('Version transition'), kind: 'transition' }
        ],
        '2026-09-10'
      )
    ).toBe('Version transition');
  });

  it('fait primer le menu événementiel sur tout le reste', () => {
    expect(
      labelAt(
        [
          { menu: variant('Version événement'), kind: 'event' },
          { menu: variant('Version transition'), kind: 'transition' },
          { menu: monthly, kind: 'monthly' }
        ],
        '2026-09-10'
      )
    ).toBe('Version événement');
  });

  it('ne dépend pas de l’ordre d’arrivée des fichiers', () => {
    const ascending: MonthInput[] = [
      { menu: monthly, kind: 'monthly' },
      { menu: variant('Version événement'), kind: 'event' }
    ];
    expect(labelAt(ascending, '2026-09-10')).toBe(labelAt([...ascending].reverse(), '2026-09-10'));
  });

  it('écarte le menu de grève de la résolution automatique', () => {
    const dataset = buildDataset([{ menu: variant('Repas de grève'), kind: 'strike' }]);
    expect(dataset.byDate.size).toBe(0);
    expect(dataset.servedDates).toEqual([]);
  });

  it('ne retient comme servis que les jours d’école, triés', () => {
    expect(edges.servedDates).toEqual([
      '2099-01-02',
      '2099-01-05',
      '2099-01-06',
      '2099-01-07',
      '2099-01-09'
    ]);
  });
});
