import { globSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Les composants passent par les jetons (audit-design-system, D1).
 *
 * `contrast.test.ts` garde la palette ; rien ne gardait son usage. Le relevé du
 * 17 octobre 2026 a trouvé huit tailles de police, dix rayons et une couleur
 * écrits en dur, dont trois textes à 9 pixels sous le plus petit cran de
 * l'échelle. Ce test lit les styles et refuse une valeur littérale là où un jeton
 * existe pour la porter.
 *
 * Il surveille trois familles de propriétés, pas toutes : les espacements et les
 * épaisseurs de filet en pixels restent permis, faute d'échelle qui les porte.
 */

/** Les styles de l'application : blocs `<style>` des composants, feuilles CSS hors jetons. */
function styles(): { fichier: string; css: string }[] {
  const composants = globSync('src/**/*.svelte').map((fichier) => ({
    fichier,
    css: [...readFileSync(fichier, 'utf8').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
      .map((m) => m[1] ?? '')
      .join('\n')
  }));
  const feuilles = globSync('src/**/*.css')
    .filter((fichier) => !fichier.endsWith('tokens.css'))
    .map((fichier) => ({ fichier, css: readFileSync(fichier, 'utf8') }));
  return [...composants, ...feuilles];
}

/** Les déclarations `propriété: valeur` d'une feuille, commentaires retirés. */
function declarations(css: string): { propriete: string; valeur: string }[] {
  const sansCommentaires = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...sansCommentaires.matchAll(/(?:^|[;{\s])([a-z-]+)\s*:\s*([^;{}]+);/g)].map((m) => ({
    propriete: m[1] ?? '',
    valeur: (m[2] ?? '').trim()
  }));
}

/**
 * Ce qu'une valeur a le droit de contenir sans jeton, et pourquoi.
 *
 * - `50%` : un disque n'est pas un rayon de l'échelle, c'est une forme.
 * - `0`, `none` : l'absence n'a pas de valeur à porter.
 * - `inherit`, `currentColor`, `transparent` : une valeur reprise, pas choisie.
 */
const EXCEPTIONS = new Set(['50%', '0', 'none', 'inherit', 'currentColor', 'transparent']);

/** Une valeur dont chaque terme est un jeton ou une exception. */
function portéeParLesJetons(valeur: string): boolean {
  const sansJetons = valeur.replace(/var\(--[\w-]+\)/g, '').trim();
  return sansJetons.split(/\s+/).every((terme) => terme === '' || EXCEPTIONS.has(terme));
}

/** Une couleur écrite en dur : hexadécimale, fonctionnelle, ou nommée parmi les plus courantes. */
const COULEUR_LITTERALE = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(|\b(?:white|black)\b/;

const PROPRIETES_DE_COULEUR = new Set([
  'color',
  'background',
  'background-color',
  'border-color',
  'outline-color',
  'fill',
  'stroke'
]);

function ecarts(): string[] {
  const trouves: string[] = [];
  for (const { fichier, css } of styles()) {
    for (const { propriete, valeur } of declarations(css)) {
      const ici = `${fichier} — ${propriete}: ${valeur}`;
      if (propriete === 'font-size' && !portéeParLesJetons(valeur)) trouves.push(ici);
      if (propriete === 'border-radius' && !portéeParLesJetons(valeur)) trouves.push(ici);
      if (PROPRIETES_DE_COULEUR.has(propriete) && COULEUR_LITTERALE.test(valeur)) trouves.push(ici);
    }
  }
  return trouves;
}

describe('les composants passent par les jetons', () => {
  it('ne déclare aucune taille de police, aucun rayon ni aucune couleur en dur', () => {
    // Un écart se corrige par un jeton existant, ou par un jeton nouveau nommé
    // par son sens dans tokens.css — jamais en l'ajoutant aux exceptions sans
    // raison écrite.
    expect(ecarts()).toEqual([]);
  });

  it('lit réellement les composants', () => {
    // Un test qui ne trouverait aucune déclaration passerait sans rien garder.
    const total = styles().reduce((n, { css }) => n + declarations(css).length, 0);
    expect(total).toBeGreaterThan(200);
  });
});
