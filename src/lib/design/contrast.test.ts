import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Les rapports de contraste de la palette, mesurés plutôt qu'estimés.
 *
 * Ce test lit `tokens.css` : il attrape donc une teinte modifiée à la main, qui
 * est exactement la façon dont une palette accessible cesse de l'être. Deux
 * couleurs ont déjà été assombries à cause de lui (design.md, D15).
 */

const CSS = readFileSync('src/lib/design/tokens.css', 'utf8');

/**
 * Les jetons, découpés par préfixe.
 *
 * Le découpage se faisait auparavant par la *position* de la déclaration dans le
 * fichier, relativement à la ligne de la requête de média. Il ne survit pas à
 * l'existence de deux voies d'application du thème sombre (design.md, D20), et
 * il cassait au moindre bloc ajouté. Le préfixe ne dépend plus de l'ordre des
 * règles, ce qui le rend accessoirement plus solide qu'avant.
 */
function readTokens(): { clair: Record<string, string>; sombre: Record<string, string> } {
  const clair: Record<string, string> = {};
  const sombre: Record<string, string> = {};

  for (const match of CSS.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    const [, name, value] = match;
    if (name === undefined || value === undefined) continue;
    if (name.startsWith('dark-')) sombre[name.slice('dark-'.length)] = value;
    else clair[name] = value;
  }

  return { clair, sombre: { ...clair, ...sombre } };
}

const { clair, sombre } = readTokens();

/**
 * Les deux voies d'application du thème sombre ne peuvent pas diverger.
 *
 * C'est la promesse de D20, et elle se vérifie sur le texte : les deux blocs ne
 * doivent contenir que des renvois, jamais une couleur écrite en dur. Un seul
 * hexadécimal qui s'y glisserait rétablirait la duplication que la
 * restructuration a supprimée — et le reste de ce fichier ne le verrait pas,
 * puisqu'il ne lit que les jetons préfixés.
 */
describe('les deux voies du thème sombre', () => {
  const blocs = [
    ['@media (prefers-color-scheme: dark)', CSS.indexOf('@media (prefers-color-scheme: dark)')],
    ["[data-theme='dark']", CSS.indexOf(":root[data-theme='dark']")]
  ] as const;

  for (const [nom, debut] of blocs) {
    it(`${nom} ne contient que des renvois`, () => {
      expect(debut, `bloc ${nom} introuvable`).toBeGreaterThan(-1);
      const fin = CSS.indexOf('\n}', CSS.indexOf('{', debut + 1));
      const corps = CSS.slice(debut, fin);
      const enDur = [...corps.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{3,8})/g)].map((m) => m[0]);
      expect(enDur, 'couleur écrite en dur au lieu d’un renvoi').toEqual([]);
    });
  }

  it('applique exactement les mêmes jetons par les deux voies', () => {
    const renvois = (debut: number) => {
      const fin = CSS.indexOf('\n}', CSS.indexOf('{', debut + 1));
      return [...CSS.slice(debut, fin).matchAll(/(--[\w-]+):\s*var\((--dark-[\w-]+)\)/g)]
        .map((m) => `${m[1]}=${m[2]}`)
        .sort();
    };
    const [auto, force] = blocs.map(([, debut]) => renvois(debut));
    expect(auto?.length, 'aucun renvoi trouvé').toBeGreaterThan(0);
    expect(force).toEqual(auto);
  });

  it('applique tous les jetons sombres déclarés', () => {
    // Le mode de panne de D20 n'est plus la divergence de valeurs, devenue
    // impossible, mais l'oubli d'un renvoi : un jeton déclaré que rien
    // n'applique laisserait sa couleur claire en thème sombre.
    const applique = new Set(
      [
        ...CSS.slice(CSS.indexOf(":root[data-theme='dark']")).matchAll(/var\((--dark-[\w-]+)\)/g)
      ].map((m) => (m[1] ?? '').slice('--dark-'.length))
    );
    const oublies = [...CSS.matchAll(/--dark-([\w-]+):/g)]
      .map((m) => m[1] ?? '')
      .filter((nom) => !applique.has(nom));
    expect(oublies, 'jeton sombre déclaré mais jamais appliqué').toEqual([]);
  });
});

function canal(valeur: number): number {
  const s = valeur / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const r = canal(parseInt(hex.slice(1, 3), 16));
  const g = canal(parseInt(hex.slice(3, 5), 16));
  const b = canal(parseInt(hex.slice(5, 7), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(avant: string, arriere: string): number {
  const a = luminance(avant);
  const b = luminance(arriere);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * Les paires réellement affichées, et le seuil qui s'applique à chacune.
 *
 * 4,5:1 pour le texte courant, 3:1 pour le texte large — au sens de WCAG, à
 * partir de 18,66 px en gras. Les libellés de rôle sont en 11 px : ils relèvent
 * du seuil strict, y compris sur les compartiments colorés.
 */
const PAIRES: { texte: string; fond: string; seuil: number; quoi: string }[] = [
  { texte: 'ink', fond: 'tray', seuil: 4.5, quoi: 'texte sur le plateau' },
  { texte: 'ink', fond: 'cell', seuil: 4.5, quoi: 'nom de plat dans une alvéole' },
  { texte: 'ink', fond: 'cell-empty', seuil: 4.5, quoi: 'texte sur une alvéole vide' },
  { texte: 'ink', fond: 'chip', seuil: 4.5, quoi: 'pastille d’allergène' },
  { texte: 'ink', fond: 'sheet', seuil: 4.5, quoi: 'feuille de détail' },
  { texte: 'ink-muted', fond: 'tray', seuil: 4.5, quoi: 'libellé de rôle' },
  { texte: 'ink-muted', fond: 'cell', seuil: 4.5, quoi: 'libellé de rôle en alvéole' },
  { texte: 'ink-muted', fond: 'cell-empty', seuil: 4.5, quoi: 'rôle d’une alvéole vide' },
  { texte: 'on-table', fond: 'table', seuil: 4.5, quoi: 'en-tête sur la table' },
  { texte: 'warn-on', fond: 'warn', seuil: 4.5, quoi: 'bandeau d’avertissement' },
  ...(['viande', 'volaille', 'poisson', 'vegetarien', 'inconnu'] as const).flatMap((famille) => [
    {
      texte: `fam-${famille}-on`,
      fond: `fam-${famille}`,
      seuil: 4.5,
      quoi: `texte sur le compartiment ${famille}`
    },
    {
      texte: 'ink',
      fond: `fam-${famille}-pale`,
      seuil: 4.5,
      quoi: `texte sur la teinte pâle ${famille}`
    }
  ])
];

for (const [nomTheme, jetons] of [
  ['clair', clair],
  ['sombre', sombre]
] as const) {
  describe(`thème ${nomTheme}`, () => {
    for (const { texte, fond, seuil, quoi } of PAIRES) {
      it(`${quoi} tient ${seuil}:1`, () => {
        const avant = jetons[texte];
        const arriere = jetons[fond];
        expect(avant, `jeton --${texte} absent`).toBeDefined();
        expect(arriere, `jeton --${fond} absent`).toBeDefined();

        const rapport = contraste(avant as string, arriere as string);
        expect(
          Number(rapport.toFixed(2)),
          `--${texte} sur --${fond} : ${rapport.toFixed(2)}:1`
        ).toBeGreaterThanOrEqual(seuil);
      });
    }
  });
}

describe('la volaille inverse sa polarité', () => {
  it('porte du texte sombre en thème clair, parce que son ambre est trop clair pour du blanc', () => {
    // Documenté en D15 : assombrir l'ambre jusqu'à la lisibilité du blanc
    // l'aurait viré au marron, ce que la palette refuse.
    expect(contraste('#ffffff', clair['fam-volaille'] as string)).toBeLessThan(4.5);
    expect(clair['fam-volaille-on']).not.toBe('#ffffff');
  });
});
