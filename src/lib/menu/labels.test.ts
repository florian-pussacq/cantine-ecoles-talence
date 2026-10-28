import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  allergenNames,
  browsedEyebrow as mentionParcourue,
  courseName,
  dayNumber,
  dayTitle,
  weekTitle,
  formatDay,
  formatWeekday,
  shortAllergenName,
  slotAbsence,
  slotLabel,
  targetEyebrow as mentionCible,
  targetReturnLabel,
  weekReturnLabel,
  allergensUndeclared,
  noAllergenLabel,
  undeclaredNotice,
  familyLabel
} from './labels.js';
import type { Course } from '../data/schema.js';

/*
  La mention se lit en deux parts depuis bandeau-et-aujourdhui (D3) : un sourcil,
  et la pastille « Aujourd'hui ». Les cas qui ne sont pas le jour courant n'ont
  que le sourcil, et se vérifient sur lui.
*/
const targetEyebrow = (...args: Parameters<typeof mentionCible>) => {
  const mention = mentionCible(...args);
  expect(mention.aujourdhui).toBe(false);
  return mention.texte;
};
const browsedEyebrow = (...args: Parameters<typeof mentionParcourue>) => {
  const mention = mentionParcourue(...args);
  expect(mention.aujourdhui).toBe(false);
  return mention.texte;
};

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
  it('marque aujourd’hui de la pastille, sans rien d’autre à dire', () => {
    expect(mentionCible({ status: 'today', date: '2026-09-10' })).toEqual({
      texte: '',
      aujourdhui: true
    });
  });

  it('dit « demain » plutôt que « dans 1 jours »', () => {
    expect(
      targetEyebrow({ status: 'next-served', date: '2026-09-14', daysAhead: 1, skipped: null })
    ).toBe('Demain');
  });

  it('compte les jours au-delà', () => {
    expect(
      targetEyebrow({ status: 'next-served', date: '2026-09-14', daysAhead: 2, skipped: null })
    ).toBe('Prochain service · dans 2 jours');
  });

  it('nomme le week-end, comme le férié (finition-week-end-et-404, D2)', () => {
    const cible = { status: 'next-served', date: '2026-09-14', skipped: 'weekend' } as const;
    expect(targetEyebrow({ ...cible, daysAhead: 2 })).toBe('Week-end · service dans 2 jours');
    expect(targetEyebrow({ ...cible, daysAhead: 1 })).toBe('Week-end · service demain');
  });

  it('laisse les vacances primer sur le week-end', () => {
    expect(
      targetEyebrow({
        status: 'next-served',
        date: '2026-10-19',
        daysAhead: 2,
        skipped: 'weekend',
        vacation: true
      })
    ).toBe('Vacances · dans 2 jours');
  });

  it('nomme le férié qu’il enjambe', () => {
    const cible = { status: 'next-served', date: '2026-11-12', daysAhead: 1 } as const;
    expect(targetEyebrow({ ...cible, skipped: 'public-holiday' })).toBe('Férié · service demain');
    expect(targetEyebrow({ ...cible, daysAhead: 3, skipped: 'public-holiday' })).toBe(
      'Férié · service dans 3 jours'
    );
  });

  it('nomme les vacances quand le jour présenté en est un', () => {
    expect(mentionCible({ status: 'today', date: '2026-10-20', vacation: true })).toEqual({
      texte: 'Vacances',
      aujourdhui: true
    });
    const cible = {
      status: 'next-served',
      date: '2026-10-19',
      skipped: null,
      vacation: true
    } as const;
    expect(targetEyebrow({ ...cible, daysAhead: 1 })).toBe('Vacances · demain');
    expect(targetEyebrow({ ...cible, daysAhead: 2 })).toBe('Vacances · dans 2 jours');
  });

  it('nomme le férié avant les vacances, puisque c’est la raison du saut', () => {
    expect(
      targetEyebrow({
        status: 'next-served',
        date: '2026-12-28',
        daysAhead: 3,
        skipped: 'public-holiday',
        vacation: true
      })
    ).toBe('Férié · service dans 3 jours');
  });

  it('garde la mention générique pour des vacances sans menu', () => {
    // Le week-end a désormais la sienne (finition-week-end-et-404, D2).
    const cible = { status: 'next-served', date: '2026-09-14', daysAhead: 2 } as const;
    expect(targetEyebrow({ ...cible, skipped: 'holiday' })).toBe('Prochain service · dans 2 jours');
  });

  it('dit explicitement qu’un menu n’est pas publié', () => {
    expect(targetEyebrow({ status: 'not-published' })).toBe('Menu non publié');
  });
});

describe('browsedEyebrow', () => {
  const AUJOURD_HUI = '2026-09-10';

  it('marque aujourd’hui de la pastille', () => {
    expect(mentionParcourue('2026-09-10', AUJOURD_HUI)).toEqual({ texte: '', aujourdhui: true });
  });

  it('dit « demain » et « hier » plutôt que de compter jusqu’à un', () => {
    expect(browsedEyebrow('2026-09-11', AUJOURD_HUI)).toBe('Demain');
    expect(browsedEyebrow('2026-09-09', AUJOURD_HUI)).toBe('Hier');
  });

  it('compte les jours au-delà, dans les deux sens', () => {
    expect(browsedEyebrow('2026-09-12', AUJOURD_HUI)).toBe('Dans 2 jours');
    expect(browsedEyebrow('2026-09-08', AUJOURD_HUI)).toBe('Il y a 2 jours');
    expect(browsedEyebrow('2026-09-20', AUJOURD_HUI)).toBe('Dans 10 jours');
    expect(browsedEyebrow('2026-08-31', AUJOURD_HUI)).toBe('Il y a 10 jours');
  });

  it('franchit les mois et les années sans se tromper d’un jour', () => {
    expect(browsedEyebrow('2026-10-01', '2026-09-30')).toBe('Demain');
    expect(browsedEyebrow('2027-01-01', '2026-12-31')).toBe('Demain');
    expect(browsedEyebrow('2026-03-30', '2026-03-28')).toBe('Dans 2 jours');
  });

  it('ne compte jamais un seul jour', () => {
    /*
      Le pluriel de « Dans n jours » n'est pas traité, et ne peut pas l'être à
      tort : les écarts de un sont captés plus haut. Ce contrôle est là pour que
      la suppression de l'une de ces deux branches soit vue (D60).
    */
    for (const date of ['2026-09-11', '2026-09-09']) {
      expect(browsedEyebrow(date, AUJOURD_HUI)).not.toMatch(/1 jours/);
    }
  });
});

describe('slotAbsence', () => {
  it('accorde la formulation au rôle', () => {
    expect(slotAbsence('entree')).toBe("Pas d'entrée ce jour");
    expect(slotAbsence('accompagnement')).toBe("Pas d'accompagnement ce jour");
  });
});

describe('courseName', () => {
  function course(partial: Partial<Course> & Pick<Course, 'slot' | 'label'>): Course {
    return { allergens: [], flags: [], ...partial };
  }

  describe('un libellé qui dit autre chose que son rôle', () => {
    it('est affiché tel quel', () => {
      expect(courseName(course({ slot: 'plat', label: 'Rôti de dinde' }))).toEqual({
        kind: 'label',
        text: 'Rôti de dinde'
      });
    });

    it('est affiché tel quel même quand il commence par le mot du rôle', () => {
      // « Pain du mois » dit ce que « Pain » ne dit pas : la règle ne se
      // déclenche que sur l'égalité, jamais sur un préfixe.
      expect(courseName(course({ slot: 'pain', label: 'Pain du mois' }))).toEqual({
        kind: 'label',
        text: 'Pain du mois'
      });
    });
  });

  describe('un libellé qui répète son rôle', () => {
    it('cède la place à la qualité', () => {
      expect(courseName(course({ slot: 'pain', label: 'Pain', flags: ['label-rouge'] }))).toEqual({
        kind: 'quality',
        text: 'Label Rouge'
      });
    });

    it('cite toutes les qualités quand il y en a plusieurs', () => {
      expect(courseName(course({ slot: 'pain', label: 'Pain', flags: ['bio', 'igp'] }))).toEqual({
        kind: 'quality',
        text: 'Bio · IGP'
      });
    });

    it('déclare le détail non publié quand il n’y a aucune qualité à promouvoir', () => {
      // Les sept mercredis du jeu de données : le goûter existe, ses allergènes
      // sont renseignés, seul son contenu manque. Le dire n'est pas dire qu'il
      // n'y en a pas.
      expect(
        courseName(course({ slot: 'gouter', label: 'Goûter', allergens: [1, 3, 7, 8] }))
      ).toEqual({ kind: 'undisclosed', text: 'Détail non publié' });
    });
  });

  describe('les bords de la comparaison', () => {
    it('ignore la casse', () => {
      expect(courseName(course({ slot: 'pain', label: 'PAIN', flags: ['bio'] })).kind).toBe(
        'quality'
      );
    });

    it('ignore les espaces de bordure', () => {
      expect(courseName(course({ slot: 'pain', label: '  Pain ', flags: ['bio'] })).kind).toBe(
        'quality'
      );
    });

    it('ignore les accents manquants, que la source omet parfois', () => {
      expect(courseName(course({ slot: 'gouter', label: 'Gouter', flags: ['bio'] })).kind).toBe(
        'quality'
      );
    });

    it('ne se déclenche pas sur un libellé qui contient le mot du rôle', () => {
      expect(courseName(course({ slot: 'pain', label: 'Pain bio', flags: ['bio'] }))).toEqual({
        kind: 'label',
        text: 'Pain bio'
      });
    });
  });
});

describe('courseName sur les menus réellement publiés', () => {
  /*
    Les comptes ne sont pas assertés — ils changeraient au prochain mois saisi.
    Ce qui est asserté est l'invariant que D28 pose : aucun compartiment ne dit
    deux fois le mot de son rôle. Il vaut pour les menus d'aujourd'hui comme
    pour ceux qui seront ajoutés.
  */
  const months = (
    JSON.parse(readFileSync('static/data/index.json', 'utf8')) as { months: { month: string }[] }
  ).months;

  const courses = months.flatMap(({ month }) =>
    (
      JSON.parse(readFileSync(`static/data/${month}.json`, 'utf8')) as {
        days: { date: string; courses: Course[] }[];
      }
    ).days.flatMap((day) => day.courses.map((course) => ({ date: day.date, course })))
  );

  it('lit au moins un menu, faute de quoi ce test ne prouverait rien', () => {
    expect(courses.length).toBeGreaterThan(0);
  });

  it('ne laisse aucun plat répéter le mot de son rôle', () => {
    const repetitions = courses
      .filter(({ course }) => {
        const nom = courseName(course);
        return nom.text.trim().toLowerCase() === slotLabel(course.slot).toLowerCase();
      })
      .map(({ date, course }) => `${date} · ${course.slot} · ${course.label}`);

    expect(repetitions).toEqual([]);
  });

  it('promeut une qualité plutôt que de laisser un libellé creux', () => {
    // Le pain porte « bio » ou « label-rouge » la plupart des jours : si la
    // règle cessait de se déclencher, ce compte tomberait à zéro.
    const promus = courses.filter(({ course }) => courseName(course).kind === 'quality');
    expect(promus.length).toBeGreaterThan(0);
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

describe('le libellé de la commande de retour', () => {
  it('dit « Aujourd’hui » quand le repère est bien aujourd’hui', () => {
    expect(targetReturnLabel({ status: 'today', date: '2026-09-10' })).toBe("Aujourd'hui");
  });

  it('dit « Demain » plutôt que « Aujourd’hui » à un jour de distance', () => {
    expect(
      targetReturnLabel({ status: 'next-served', date: '2026-09-14', daysAhead: 1, skipped: null })
    ).toBe('Demain');
  });

  it('ne dit jamais « Aujourd’hui » devant un jour qui ne l’est pas', () => {
    // Week-ends et vacances réunis, le jour civil n'est pas servi environ
    // quarante pour cent des jours de l'année. Un libellé fixe afficherait lundi
    // un dimanche, ce que targetEyebrow existe pour empêcher (design.md, D45).
    const label = targetReturnLabel({
      status: 'next-served',
      date: '2026-09-14',
      daysAhead: 10,
      skipped: null
    });
    expect(label).toBe('Prochain service');
    expect(label).not.toContain("Aujourd'hui");
  });

  it('reste plus court que la mention, qui ne tiendrait pas sur un bouton', () => {
    const cible = {
      status: 'next-served',
      date: '2026-09-14',
      daysAhead: 10,
      skipped: null
    } as const;
    expect((targetReturnLabel(cible) as string).length).toBeLessThan(targetEyebrow(cible).length);
  });

  it('n’existe pas quand rien n’est publié : il n’y a nulle part où revenir', () => {
    expect(targetReturnLabel({ status: 'not-published' })).toBeNull();
    expect(weekReturnLabel({ status: 'not-published' })).toBeNull();
  });

  it('nomme une semaine et non un jour sur l’écran de la semaine', () => {
    // « Demain » ne veut rien dire devant une période de cinq jours.
    expect(weekReturnLabel({ status: 'today', date: '2026-09-10' })).toBe('Cette semaine');
    expect(
      weekReturnLabel({ status: 'next-served', date: '2026-09-14', daysAhead: 1, skipped: null })
    ).toBe('Prochain service');
  });
});

describe('allergènes non communiqués', () => {
  const declared = { pdfUrl: 'x', pdfSha256: '0'.repeat(64), fetchedAt: 'x' };
  const undeclared = { ...declared, allergensDeclared: false };

  it('tient un document muet pour muet, et tout autre pour précis', () => {
    expect(allergensUndeclared(undeclared)).toBe(true);
    expect(allergensUndeclared(declared)).toBe(false);
    expect(allergensUndeclared({ ...declared, allergensDeclared: true })).toBe(false);
  });

  it('ne présente jamais un plat d’un document muet comme sans allergène déclaré', () => {
    expect(noAllergenLabel(undeclared)).toBe('Allergènes non communiqués');
    expect(noAllergenLabel(declared)).toBe('Aucun allergène déclaré');
  });

  it('dit au parent qui surveille des allergènes que le filtre ne peut rien signaler', () => {
    expect(undeclaredNotice(true)).toMatch(/ne peuvent pas être signalés/);
    expect(undeclaredNotice(false)).not.toMatch(/surveillez/);
  });
});

describe('familyLabel', () => {
  it('nomme les quatre familles reconnues', () => {
    expect(familyLabel('viande')).toBe('Viande');
    expect(familyLabel('vegetarien')).toBe('Végétarien');
  });

  it('ne nomme pas un plat inclassable', () => {
    expect(familyLabel('inconnu')).toBeNull();
  });
});

describe('le titre d’un écran de menu (refonte-signaletique, D6)', () => {
  it('compose le jour en trois parts, lues dans l’ordre de la phrase', () => {
    const titre = dayTitle('2026-11-02');
    expect(titre).toEqual({ avant: 'Lundi', chiffre: '2', apres: 'novembre' });
    expect([titre.avant, titre.chiffre, titre.apres].join(' ')).toBe(formatDay('2026-11-02'));
  });

  it('abrège la semaine en un intervalle, et la lit en entier', () => {
    expect(weekTitle('2026-11-02', '2026-11-06')).toEqual({
      chiffre: '2–6',
      apres: 'novembre',
      lu: '2 au 6 novembre'
    });
  });

  it('abrège les mois d’une semaine à cheval, sans abréger sa lecture', () => {
    expect(weekTitle('2026-11-30', '2026-12-04')).toEqual({
      chiffre: '30–4',
      apres: 'nov. – déc.',
      lu: '30 novembre au 4 décembre'
    });
  });
});
