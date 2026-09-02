import { describe, expect, it } from 'vitest';
import september from '../../../static/data/2026-09.json' with { type: 'json' };
import { classify, familyOf, normalise } from './families.js';
import type { MonthMenu } from '../data/schema.js';

describe('normalise', () => {
  it('ignore la casse et les accents', () => {
    expect(normalise('Poêlée de Légumes')).toBe(normalise('poelee de legumes'));
  });

  it('ramène la ponctuation à des espaces', () => {
    expect(normalise("Kefta d'agneau, sauce tomate")).toBe('kefta d agneau sauce tomate');
  });
});

describe('classify', () => {
  it('reconnaît un poisson', () => {
    expect(familyOf('Filet de colin sauce citron')).toBe('poisson');
  });

  it('reconnaît une volaille', () => {
    expect(familyOf('Rôti de dinde aux herbes')).toBe('volaille');
  });

  it('reconnaît une viande', () => {
    expect(familyOf('Paupiette de veau au jus')).toBe('viande');
  });

  it('rend le repli plutôt que de deviner', () => {
    expect(classify('Gumbo de Tiana')).toEqual({
      illustration: 'inconnu',
      family: 'inconnu',
      matched: null
    });
  });

  it('est insensible à la casse et aux accents', () => {
    expect(classify('POÊLÉE DE TRUITES')).toEqual(classify('poelee de truites'));
  });

  describe('règle de spécificité', () => {
    it('fait primer le mot-clé le plus long', () => {
      // « pomme » et « pomme de terre » correspondent tous deux.
      expect(classify('Écrasé de pommes de terre').illustration).toBe('feculent');
      // « compote » l'emporte sur « pomme » : une compote n'est pas un fruit
      // entier, et la bibliothèque distingue désormais les deux (D59).
      expect(classify('Compote de pommes').illustration).toBe('compote');
    });

    it('départage à longueur égale par l’ordre de la table', () => {
      // « tarte » et « pomme » font cinq lettres : le dessert l'emporte.
      expect(classify('Tarte aux pommes').illustration).toBe('gateau');
    });

    it('ne laisse plus « salade de fruits » tomber chez les légumes', () => {
      /*
        Le défaut que la règle du mot-clé le plus long se causait à elle-même :
        « salade » compte six lettres, « fruit » cinq, et une salade de fruits
        recevait donc une courgette. Le mot-clé complet la remet à l'endroit.
      */
      expect(classify('Salade de fruits').illustration).toBe('fruit-sirop');
      expect(classify('Salade verte et croûtons').illustration).toBe('salade-verte');
    });

    it('ne sert plus une part de fromage devant un dessert lacté', () => {
      // Le paquet « fromage » recevait les liégeois et les yaourts à boire.
      expect(classify('Liégeois vanille').illustration).toBe('laitage-sucre');
      expect(classify('Yaourt à boire').illustration).toBe('yaourt');
      expect(classify('Fromage blanc aromatisé').illustration).toBe('yaourt');
      expect(classify('Fromage').illustration).toBe('fromage');
    });

    it('donne toujours le même résultat pour un libellé donné', () => {
      const label = 'Tarte au fromage blanc';
      expect(classify(label)).toEqual(classify(label));
    });
  });

  describe('la famille ne suit pas toujours l’illustration', () => {
    it('classe un plat de pâtes à la viande comme viande', () => {
      expect(classify('Ravioli bolognaise')).toMatchObject({
        illustration: 'pates',
        family: 'viande'
      });
    });

    it('classe un plat de pâtes sans viande comme végétarien', () => {
      expect(classify('Pizza Soleillade')).toMatchObject({
        illustration: 'pates',
        family: 'vegetarien'
      });
    });
  });

  it('ne dit rien des allergènes', () => {
    // Un plat contenant du lait et un plat n'en contenant pas peuvent partager
    // la même famille : la couleur ne renseigne jamais sur les allergènes.
    expect(familyOf('Blanc de poulet au jus')).toBe(familyOf('Nuggets de volaille'));
  });
});

describe('couverture des données réelles', () => {
  const menu = september as MonthMenu;
  const mains = menu.days.flatMap((day) => day.courses.filter((course) => course.slot === 'plat'));

  it('classe tous les plats principaux de septembre sauf ceux recensés', () => {
    const unmatched = mains.filter((course) => classify(course.label).matched === null);

    // Recensement du 7 août 2026 : un seul plat principal sur vingt échappe à la
    // table. Ce test échouera si un mot-clé ajouté le couvre — il faudra alors
    // retirer le libellé d'ici, ce qui est le but.
    expect(unmatched.map((course) => course.label)).toEqual(['Moussaka']);
  });

  it('classe tous les autres plats, ou les recense', () => {
    const all = menu.days.flatMap((day) => day.courses);
    const unmatched = all
      .filter((course) => classify(course.label).matched === null)
      .map((course) => course.label);

    // Deux libellés seulement, et pour de bonnes raisons : « Goûter » est ce que
    // le document dit lui-même quand il ne détaille pas, et « Moussaka » est
    // authentiquement ambigu — elle peut être à l'agneau comme végétarienne.
    // Ajouter un mot-clé au jugé serait exactement l'approximation interdite.
    expect([...new Set(unmatched)].sort()).toEqual(['Goûter', 'Moussaka']);
  });
});
