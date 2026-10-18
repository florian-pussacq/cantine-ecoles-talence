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
 * `fermer-les-echelles` y a ajouté les graisses, le mouvement, les couleurs
 * portées par un raccourci, les styles écrits dans le balisage, et les règles de
 * base de `tokens.css` lui-même, qui portait deux valeurs en dur sans que rien
 * ne les voie (D7).
 *
 * Les espacements ne sont pas surveillés. L'échelle existe, de `--espace-1` à
 * `--espace-5`, mais les valeurs qui restent en dur sont toutes sous son premier
 * cran : des réglages optiques autour d'une capsule ou d'une pastille, qu'une
 * échelle ne porterait qu'avec des crans sans intention (fermer-les-echelles, D8).
 * Les épaisseurs de filet en pixels restent permises pour la même raison.
 */

const TOKENS = 'src/lib/design/tokens.css';

/** Les jetons déclarés : un `var(--…)` qui n'y figure pas est une faute de frappe. */
const JETONS = new Set(
  [...readFileSync(TOKENS, 'utf8').matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1] as string)
);

/**
 * Les jetons posés par les composants eux-mêmes, en ligne : leur nom est connu
 * du composant qui les pose, pas de `tokens.css`.
 */
const JETONS_LOCAUX = /^--(sens|pale|anneau)$/;

/** Les styles de l'application : blocs `<style>` et styles en ligne des composants, feuilles CSS. */
function styles(): { fichier: string; css: string }[] {
  const composants = globSync('src/**/*.svelte').map((fichier) => {
    const source = readFileSync(fichier, 'utf8');
    const blocs = [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? '');
    const balisage = source.replace(
      /<style[^>]*>[\s\S]*?<\/style>|<script[^>]*>[\s\S]*?<\/script>/g,
      ''
    );
    // `style="a: b; c: d"` et `style:propriete="valeur"`, ramenés à des déclarations.
    const enLigne = [
      ...[...balisage.matchAll(/\sstyle="([^"]*)"/g)].map((m) => `{${m[1]};}`),
      ...[...balisage.matchAll(/\sstyle:([\w-]+)=["{]([^"}]*)["}]/g)].map(
        (m) => `{${m[1]}: ${m[2]};}`
      )
    ];
    return { fichier, css: [...blocs, ...enLigne].join('\n') };
  });
  const feuilles = globSync('src/**/*.css').map((fichier) => ({
    fichier,
    css: readFileSync(fichier, 'utf8')
  }));
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
 * - `normal` : le retour à la graisse du texte courant, pas un cran choisi
 *   (fermer-les-echelles, D3).
 */
const EXCEPTIONS = new Set([
  '50%',
  '0',
  'none',
  'inherit',
  'currentColor',
  'transparent',
  'normal'
]);

/** Une valeur dont chaque terme est un jeton ou une exception. */
function portéeParLesJetons(valeur: string): boolean {
  const sansJetons = valeur.replace(/var\(--[\w-]+\)/g, '').trim();
  return sansJetons.split(/\s+/).every((terme) => terme === '' || EXCEPTIONS.has(terme));
}

/** Une couleur écrite en dur : hexadécimale, fonctionnelle, ou nommée parmi les plus courantes. */
const COULEUR_LITTERALE = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(|\b(?:white|black)\b/;

/** Les propriétés qui peignent une couleur, y compris par un raccourci (D7). */
const PROPRIETES_DE_COULEUR = new Set([
  'color',
  'background',
  'background-color',
  'border-color',
  'outline-color',
  'fill',
  'stroke',
  'border',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'outline',
  'box-shadow'
]);

/** Les propriétés qui ne doivent contenir que des jetons ou des exceptions. */
const PROPRIETES_PAR_JETON = new Set(['font-size', 'font-weight', 'border-radius']);

const PROPRIETES_DE_MOUVEMENT = new Set([
  'transition',
  'transition-duration',
  'transition-timing-function',
  'animation',
  'animation-duration',
  'animation-timing-function'
]);

/**
 * Une durée, ou une courbe nommée, écrite en dur (D6). Une durée nulle n'est
 * pas une durée choisie : elle est retirée avant le contrôle.
 */
const DUREE_NULLE = /(?<![\w.-])0m?s\b/g;
const MOUVEMENT_LITTERAL =
  /(?<![\w-])\d*\.?\d+m?s\b|\b(?:ease|ease-in|ease-out|ease-in-out|linear)\b|cubic-bezier\(/;

/**
 * La neutralisation du mouvement réduit, dans `tokens.css` : ce n'est pas une
 * durée choisie mais l'annulation de toutes les autres (D6).
 */
const NEUTRALISATION = '0.01ms !important';

/**
 * Les opacités partielles admises, et pourquoi (fermer-les-echelles, D2).
 *
 * Une opacité posée sur du texte est un voile que `contrast.test.ts` ne peut
 * pas mesurer : elle ne dit pas sur quel fond elle se pose. Le pied de source
 * en portait une à 72 %, qui avait échappé au relevé des voiles. Un texte
 * atténué prend `--encre-douce`, et toute autre opacité se déclare ici.
 */
const OPACITES: { fichier: string; valeur: string; pourquoi: string }[] = [
  {
    fichier: 'src/lib/ui/RangNavigation.svelte',
    valeur: '0.45',
    pourquoi: 'flèche désactivée : WCAG 1.4.3 exempte une commande inactive du seuil de contraste'
  }
];

function ecarts(): string[] {
  const trouves: string[] = [];
  for (const { fichier, css } of styles()) {
    for (const { propriete, valeur } of declarations(css)) {
      // Une déclaration de jeton (`--nom: valeur`) n'est pas une propriété surveillée.
      if (propriete.startsWith('--')) continue;
      const ici = `${fichier} — ${propriete}: ${valeur}`;
      if (PROPRIETES_PAR_JETON.has(propriete) && !portéeParLesJetons(valeur)) trouves.push(ici);
      if (propriete === 'font' && valeur !== 'inherit') trouves.push(ici);
      if (
        propriete === 'opacity' &&
        !['0', '1'].includes(valeur) &&
        !OPACITES.some((o) => o.fichier === fichier && o.valeur === valeur)
      ) {
        trouves.push(ici);
      }
      if (PROPRIETES_DE_COULEUR.has(propriete) && COULEUR_LITTERALE.test(valeur)) trouves.push(ici);
      if (
        PROPRIETES_DE_MOUVEMENT.has(propriete) &&
        valeur !== NEUTRALISATION &&
        MOUVEMENT_LITTERAL.test(valeur.replace(DUREE_NULLE, ''))
      ) {
        trouves.push(ici);
      }
    }
  }
  return trouves;
}

/** Les jetons cités qui n'existent nulle part : le navigateur les ignorerait en silence. */
function inconnus(): string[] {
  const trouves: string[] = [];
  for (const { fichier, css } of styles()) {
    for (const m of css.matchAll(/var\((--[\w-]+)/g)) {
      const jeton = m[1] as string;
      // `var(--fam-${famille})` : un nom construit, coupé à sa partie fixe. Ses
      // valeurs viennent d'un type fermé, que le compilateur vérifie.
      if (jeton.endsWith('-')) continue;
      if (!JETONS.has(jeton) && !JETONS_LOCAUX.test(jeton)) trouves.push(`${fichier} — ${jeton}`);
    }
  }
  return [...new Set(trouves)];
}

/**
 * Les racines anglaises que les jetons portaient avant `vocabulaire-francais`
 * (D5), et le suffixe `-on` qu'a remplacé le préfixe `--sur-` (D3). Ce n'est pas
 * un dictionnaire : ce sont les noms qu'on réécrirait par réflexe.
 */
const RACINES_ANGLAISES =
  /^--(?:ink|chip|shell|touch|warn|on|space|text|radius|font|ring)(?:-|$)|-on$/;

/** Les jetons déclarés, dans `tokens.css` comme en ligne par un composant. */
function declares(): string[] {
  const trouves: string[] = [];
  for (const { fichier, css } of styles()) {
    for (const { propriete } of declarations(css)) {
      if (propriete.startsWith('--')) trouves.push(`${fichier} — ${propriete}`);
    }
  }
  return trouves;
}

describe('les composants passent par les jetons', () => {
  it('ne déclare aucune taille, graisse, rayon, couleur ni mouvement en dur', () => {
    // Un écart se corrige par un jeton existant, ou par un jeton nouveau nommé
    // par son sens dans tokens.css — jamais en l'ajoutant aux exceptions sans
    // raison écrite.
    expect(ecarts()).toEqual([]);
  });

  it('ne cite aucun jeton qui n’existe pas', () => {
    // `var(--poids-frot)` ne lève aucune erreur : le texte retombe sur sa
    // graisse héritée, et personne ne le voit.
    expect(inconnus()).toEqual([]);
  });

  it('nomme ses jetons en français (vocabulaire-francais)', () => {
    // Le renommage a retiré ces noms ; un jeton qui les reprend rouvrirait le
    // mélange des deux langues.
    const anglais = declares().filter((ici) => RACINES_ANGLAISES.test(ici.split(' — ')[1] ?? ''));
    expect(anglais).toEqual([]);
    // La garde lit réellement des déclarations : sans elles, elle passerait à vide.
    expect(declares().length).toBeGreaterThan(50);
  });

  it('lit réellement les composants et la feuille de jetons', () => {
    // Un test qui ne trouverait aucune déclaration passerait sans rien garder.
    const sources = styles();
    const total = sources.reduce((n, { css }) => n + declarations(css).length, 0);
    expect(total).toBeGreaterThan(200);
    expect(sources.map(({ fichier }) => fichier)).toContain(TOKENS);
  });
});
