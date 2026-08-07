import { describe, expect, it } from 'vitest';
import {
  allergenNames,
  dayNumber,
  formatDay,
  formatWeekday,
  shortAllergenName,
  slotAbsence,
  targetEyebrow
} from './labels.js';
import type { Course } from '../data/schema.js';

describe('formatDay', () => {
  it('rend un jour civil en français, capitalisé', () => {
    expect(formatDay('2026-09-10')).toBe('Jeudi 10 septembre');
  });

  it('ne dérive pas d’un jour selon le fuseau de la machine', () => {
    // Le premier du mois est le piège classique : interprété en heure locale
    // négative, « 2026-09-01T00:00:00 » retombe au 31 août.
    expect(formatDay('2026-09-01')).toBe('Mardi 1 septembre');
    expect(dayNumber('2026-09-01')).toBe('1');
  });

  it('rend l’abrégé de la semaine sans point', () => {
    expect(formatWeekday('2026-09-07')).toBe('Lun');
  });
});

describe('targetEyebrow', () => {
  it('nomme aujourd’hui', () => {
    expect(targetEyebrow({ status: 'today', date: '2026-09-10' })).toBe("Aujourd'hui");
  });

  it('dit « demain » plutôt que « dans 1 jours »', () => {
    expect(targetEyebrow({ status: 'next-served', date: '2026-09-14', daysAhead: 1 })).toBe(
      'Demain'
    );
  });

  it('compte les jours au-delà', () => {
    expect(targetEyebrow({ status: 'next-served', date: '2026-09-14', daysAhead: 2 })).toBe(
      'Prochain service · dans 2 jours'
    );
  });

  it('dit explicitement qu’un menu n’est pas publié', () => {
    expect(targetEyebrow({ status: 'not-published' })).toBe('Menu non publié');
  });
});

describe('slotAbsence', () => {
  it('accorde la formulation au rôle', () => {
    expect(slotAbsence('entree')).toBe("Pas d'entrée ce jour");
    expect(slotAbsence('accompagnement')).toBe('Pas de garniture ce jour');
  });
});

describe('allergenNames', () => {
  const legend = { '1': 'Gluten (blé, seigle)', '7': 'Lait' };
  const course: Course = { slot: 'plat', label: 'Test', allergens: [1, 7, 11], flags: [] };

  it('traduit les codes en libellés clairs', () => {
    expect(allergenNames(course, legend).slice(0, 2)).toEqual([
      { code: 1, name: 'Gluten (blé, seigle)' },
      { code: 7, name: 'Lait' }
    ]);
  });

  it('affiche un code absent de la légende plutôt que de l’escamoter', () => {
    // Masquer un allergène inconnu serait perdre une information de santé.
    expect(allergenNames(course, legend)[2]).toEqual({ code: 11, name: 'Allergène 11' });
  });

  it('raccourcit pour les pastilles sans perdre le nom', () => {
    expect(shortAllergenName('Gluten (blé, seigle)')).toBe('Gluten');
    expect(shortAllergenName('Lait')).toBe('Lait');
  });
});
