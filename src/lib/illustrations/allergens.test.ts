import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import september from '../../../static/data/2026-09.json' with { type: 'json' };
import { ALLERGEN_CODES } from '../filter/storage.js';
import type { MonthMenu } from '../data/schema.js';
import { ALLERGEN_ICONS, allergenIcon } from './allergens.js';

const SPRITE = readFileSync('src/lib/illustrations/Sprite.svelte', 'utf8');
const SYMBOLES = new Set([...SPRITE.matchAll(/<symbol id="([\w-]+)"/g)].map((m) => m[1]));

describe('pictogrammes des allergènes', () => {
  it('couvre les quatorze codes réglementaires', () => {
    expect(
      Object.keys(ALLERGEN_ICONS)
        .map(Number)
        .sort((a, b) => a - b)
    ).toEqual([...ALLERGEN_CODES]);
  });

  it('ne pointe jamais vers un symbole absent du sprite', () => {
    // Un identifiant erroné ne casse rien de visible : le <use> rend simplement
    // du vide, et le signalement d'allergène perd son pictogramme en silence.
    for (const code of ALLERGEN_CODES) {
      expect(SYMBOLES, `code ${code}`).toContain(allergenIcon(code));
    }
    expect(SYMBOLES).toContain(allergenIcon(99));
  });

  it('donne un pictogramme distinct à chaque allergène', () => {
    // Deux allergènes partageant un dessin se confondraient sur la feuille de
    // détail, où ils sont affichés les uns sous les autres.
    const dessins = ALLERGEN_CODES.map(allergenIcon);
    expect(new Set(dessins).size).toBe(dessins.length);
  });

  it('replie sur un pictogramme neutre un code hors légende', () => {
    expect(allergenIcon(99)).toBe('alg-defaut');
  });

  it('couvre tous les allergènes réellement cités par les données', () => {
    const cites = new Set(
      (september as MonthMenu).days.flatMap((day) =>
        day.courses.flatMap((course) => course.allergens)
      )
    );
    for (const code of cites) {
      expect(allergenIcon(code), `code ${code} cité en septembre`).not.toBe('alg-defaut');
    }
  });
});
