import { globSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Les rapports de contraste de la palette, mesurés plutôt qu'estimés.
 *
 * Ce test lit `tokens.css` : il attrape donc une teinte modifiée à la main, qui
 * est exactement la façon dont une palette accessible cesse de l'être. Deux
 * couleurs ont déjà été assombries à cause de lui (design.md, D15), et les sept
 * couleurs de rôle ont été calculées contre lui plutôt que choisies à l'œil
 * (design.md, D50).
 *
 * Il ne lisait jusqu'ici que des jetons opaques. Or l'application peint aussi
 * des surfaces obtenues par mélange à l'opacité, et l'une d'elles ne tenait pas
 * son seuil depuis l'origine sans que rien puisse le voir (design.md, D27).
 *
 * La palette est passée au clair (D49). Ce qui a changé, ce n'est pas la
 * discipline mais le fond sur lequel elle s'exerce : `--on-table` a disparu avec
 * l'ardoise, et les transparences qui s'y posaient sont désormais des encres
 * sombres sur des surfaces claires.
 */

const CSS = readFileSync('src/lib/design/tokens.css', 'utf8');

/** Les jetons de la palette. Il n'y en a qu'une (design.md, D25). */
function readTokens(): Record<string, string> {
  const jetons: Record<string, string> = {};

  for (const match of CSS.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    const [, name, value] = match;
    if (name === undefined || value === undefined) continue;
    jetons[name] = value;
  }

  return jetons;
}

const jetons = readTokens();

/** Les sept rôles du service, dans l'ordre où l'écran les montre (D50). */
const ROLES = ['entree', 'plat', 'accompagnement', 'laitage', 'dessert', 'pain', 'gouter'] as const;

function canal(valeur: number): number {
  const s = valeur / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function composantes(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];
}

function luminance(hex: string): number {
  const [r, g, b] = composantes(hex).map(canal) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(avant: string, arriere: string): number {
  const a = luminance(avant);
  const b = luminance(arriere);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * La couleur réellement peinte par `color-mix(… X%, transparent)` posé sur un
 * fond, ou par une opacité appliquée à un texte.
 *
 * Les deux reviennent au même calcul : la composition d'une source partiellement
 * transparente sur un fond opaque est une interpolation linéaire par canal. Le
 * mélange se fait en sRGB parce que c'est l'espace que déclarent les appels de
 * `color-mix` de la feuille de style ; le changer ici ferait mesurer une couleur
 * que le navigateur ne peint pas.
 */
export function compose(source: string, fond: string, alpha: number): string {
  const s = composantes(source);
  const f = composantes(fond);
  const canaux = s.map((valeur, i) => Math.round(valeur * alpha + (f[i] as number) * (1 - alpha)));
  return `#${canaux.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Les paires réellement affichées, et le seuil qui s'applique à chacune.
 *
 * 4,5:1 pour le texte courant, 3:1 pour le texte large — au sens de WCAG, à
 * partir de 18,66 px en gras. Les libellés de rôle sont en 11 px : ils relèvent
 * du seuil strict, y compris sur les compartiments colorés.
 */
const PAIRES: { texte: string; fond: string; seuil: number; quoi: string }[] = [
  { texte: 'ink', fond: 'fond', seuil: 4.5, quoi: 'texte sur le fond de l’écran' },
  { texte: 'ink', fond: 'carte', seuil: 4.5, quoi: 'nom de plat sur une carte' },
  { texte: 'ink', fond: 'creux', seuil: 4.5, quoi: 'texte sur la carte d’un rôle absent' },
  { texte: 'ink', fond: 'chip', seuil: 4.5, quoi: 'pastille d’allergène' },
  { texte: 'ink-muted', fond: 'fond', seuil: 4.5, quoi: 'mention atténuée sur le fond' },
  { texte: 'ink-muted', fond: 'carte', seuil: 4.5, quoi: 'mention atténuée sur une carte' },
  { texte: 'ink-muted', fond: 'creux', seuil: 4.5, quoi: 'énoncé d’une absence' },
  { texte: 'accent', fond: 'fond', seuil: 4.5, quoi: 'accent sur le fond' },
  { texte: 'accent', fond: 'carte', seuil: 4.5, quoi: 'accent sur une carte' },
  { texte: 'on-accent', fond: 'accent', seuil: 4.5, quoi: 'libellé de l’onglet courant' },
  { texte: 'warn-on', fond: 'warn', seuil: 4.5, quoi: 'bandeau d’avertissement' },
  /*
    Les sept rôles (D50). Chacun est vérifié trois fois, parce qu'un seul jeton
    remplit trois emplois : l'aplat de la pastille, le glyphe blanc posé dessus,
    et l'encre du libellé — laquelle se lit tantôt sur la carte, tantôt sur le
    fond de l'écran. C'est cette triple exigence qui a fixé les valeurs, et non
    la maquette : ses quatre teintes, plus pâles, n'en tenaient aucune.
  */
  ...ROLES.flatMap((role) => [
    {
      texte: `role-${role}`,
      fond: 'carte',
      seuil: 4.5,
      quoi: `libellé du rôle ${role} sur une carte`
    },
    {
      texte: `role-${role}`,
      fond: 'fond',
      seuil: 4.5,
      quoi: `libellé du rôle ${role} sur le fond`
    },
    { texte: 'on-role', fond: `role-${role}`, seuil: 4.5, quoi: `glyphe de la pastille ${role}` }
  ]),
  /*
    Les familles ne servent plus que l'écran de la semaine (D54), où aucun rôle
    n'est à distinguer et où la couleur dit bien ce qui varie d'un jour à
    l'autre. Elles restent donc mesurées, et sur les mêmes seuils.
  */
  ...(['viande', 'volaille', 'poisson', 'vegetarien', 'inconnu'] as const).map((famille) => ({
    texte: 'ink',
    fond: `fam-${famille}-pale`,
    seuil: 4.5,
    quoi: `texte sur la teinte pâle ${famille}`
  }))
];

/**
 * Les surfaces peintes par transparence.
 *
 * Elles échappent aux paires ci-dessus, qui ne connaissent que des jetons
 * opaques : ce sont des couleurs qui n'existent nulle part dans `tokens.css` et
 * que seul le rendu produit. Le taux est recopié depuis le style scopé qui le
 * porte — duplication surveillée plus bas par un contrôle qui refuse toute
 * transparence non déclarée ici.
 *
 * Le seuil de 3:1 des bordures vient de WCAG 1.4.11 : une bordure qui délimite
 * une commande porte une information, au même titre qu'un texte.
 */
const TRANSPARENCES: {
  source: string;
  fond: string;
  /** Un voile posé sur le fond avant la source : le fond peint n'est alors pas un jeton. */
  voile?: { source: string; alpha: number };
  alpha: number;
  seuil: number;
  quoi: string;
  ou: string;
}[] = [
  {
    source: 'ink',
    fond: 'fond',
    alpha: 0.72,
    seuil: 4.5,
    quoi: 'mentions atténuées : nom de l’enseigne, situation du jour, pied de page',
    ou: 'Enseigne.svelte .nom, EnTete.svelte .quand, +page.svelte footer'
  },
  {
    source: 'ink',
    fond: 'fond',
    alpha: 0.55,
    seuil: 3,
    quoi: 'bordure des boutons de jour, de semaine et de retour',
    ou: '+page.svelte et semaine/+page.svelte nav button, EnTete.svelte .retour'
  }
];

/**
 * Les transparences délibérément non mesurées, et pourquoi.
 *
 * Sans cette liste, le contrôle de couverture ci-dessous ne laisserait aucune
 * échappatoire et forcerait à foncer des traits décoratifs pour satisfaire un
 * seuil que la norme ne leur applique pas.
 */
const DECORATIFS: { alpha: number; quoi: string; pourquoi: string }[] = [
  {
    alpha: 0.22,
    quoi: 'filet de séparation des pieds de page',
    pourquoi:
      'ne délimite aucune commande et ne porte aucune information : rien ne dépend de sa perception'
  },
  {
    alpha: 0.12,
    quoi: 'fond de la pilule d’onglets',
    pourquoi:
      'aplat sans rôle propre — ce qui doit se lire, c’est le libellé posé dessus, et il est mesuré'
  }
];

/*
  Le passage au clair a fait tomber une bordure sous son seuil sans rien casser
  d'autre (D49). Sur l'ardoise, une encre claire à 40 % tenait 3:1 ; sur le fond
  crème, la même proportion d'encre sombre n'en donne que 2,32. Elle est passée
  à 55 %. C'est précisément le genre de régression qu'aucune relecture ne voit et
  que ce fichier existe pour arrêter.
*/

describe('la palette', () => {
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

describe('les surfaces peintes par transparence', () => {
  for (const { source, fond, voile, alpha, seuil, quoi, ou } of TRANSPARENCES) {
    it(`${quoi} tient ${seuil}:1`, () => {
      const avant = jetons[source];
      const base = jetons[fond];
      expect(avant, `jeton --${source} absent`).toBeDefined();
      expect(base, `jeton --${fond} absent`).toBeDefined();

      const arriere =
        voile === undefined
          ? (base as string)
          : compose(jetons[voile.source] as string, base as string, voile.alpha);

      const peint = compose(avant as string, arriere, alpha);
      const rapport = contraste(peint, arriere);
      expect(
        Number(rapport.toFixed(2)),
        `--${source} à ${alpha * 100} % sur ${arriere} donne ${peint} : ${rapport.toFixed(2)}:1 (${ou})`
      ).toBeGreaterThanOrEqual(seuil);
    });
  }
});

/**
 * Le contrôle qui rattrape l'oubli.
 *
 * Recopier un taux dans la liste ci-dessus ne protège de rien si l'on ajoute une
 * surface translucide sans y penser — c'est exactement ce qui s'est produit à
 * l'écriture de ce test, où la bordure identique de l'écran de la semaine avait
 * été manquée à la lecture. Le contrôle lit les composants et refuse tout taux
 * qui ne serait ni mesuré ni explicitement tenu pour décoratif.
 *
 * Il ne couvre que `color-mix(… var(--on-table) N%, transparent)`, la forme
 * mécaniquement reconnaissable. Les opacités appliquées à un élément entier ne
 * disent pas sur quel fond elles se posent, et resteraient à déclarer à la main.
 */
describe('couverture des transparences', () => {
  /*
    Tous les composants, et non une liste tenue à la main.

    La liste ne comportait d'abord que les écrans, ce qui laissait une porte
    ouverte : une transparence introduite dans un composant de `$lib/ui`
    n'aurait été vue par personne. On y a donc ajouté des composants, un par un
    — et une liste qu'il faut penser à compléter est une liste qui finit
    incomplète : trois fichiers portant des transparences n'y ont jamais figuré,
    et l'extraction du pied de source aurait fait sortir deux taux de la seule
    couverture qui les voyait (D63, D64).

    Le glob supprime la question. C'est le même remède que le contrôle
    d'apparence unique, plus bas, a déjà appliqué pour la même raison.
  */
  const FICHIERS = globSync('src/**/*.svelte');

  const connus = new Set([
    ...TRANSPARENCES.map(({ alpha }) => alpha),
    ...TRANSPARENCES.flatMap(({ voile }) => (voile ? [voile.alpha] : [])),
    ...DECORATIFS.map(({ alpha }) => alpha)
  ]);

  for (const fichier of FICHIERS) {
    it(`${fichier} ne peint aucune transparence non déclarée`, () => {
      const source = readFileSync(fichier, 'utf8');
      const trouves = [
        ...source.matchAll(/color-mix\(in srgb, var\(--ink\) (\d+)%, transparent\)/g)
      ].map((m) => Number(m[1]) / 100);

      const orphelins = [...new Set(trouves)].filter((alpha) => !connus.has(alpha));
      expect(
        orphelins,
        'transparence peinte sur une surface claire sans être ni mesurée ni tenue pour décorative'
      ).toEqual([]);
    });
  }
});

describe('la palette', () => {
  it('ne porte aucune trace d’un thème, clair ou sombre (D25, D49)', () => {
    expect(CSS).not.toContain('--dark-');
    expect(CSS).not.toContain('data-theme');
    expect(CSS).not.toContain('prefers-color-scheme');
  });
});

/**
 * L'apparence unique, surveillée là où elle avait discrètement cessé de l'être.
 *
 * Le contrôle ci-dessus ne lisait que `tokens.css`, et deux composants ont vécu
 * des mois avec une règle `prefers-color-scheme: dark` héritée du thème supprimé
 * par D25 — dont l'une repeignait des liens en clair sur un panneau clair. Une
 * exigence qui n'est vérifiée qu'à un seul endroit ne l'est pas.
 */
/**
 * La partition des jetons : ce qui peint du texte, et ce qui peint dessous.
 *
 * `PAIRES` mesure des paires nommées ici. Elle ne dit rien des paires que les
 * composants forment réellement : une encre qui est en fait une surface
 * n'apparaît dans aucune ligne de sa table, donc n'existe pas pour elle. Deux
 * liens ont vécu peints en `--fond` sur une carte blanche — 1,17:1 — sans que
 * rien ne s'en aperçoive (design.md, D64).
 *
 * Ce sont des survivants de l'apparence sombre supprimée par D25 : `--fond`
 * était alors la couleur claire, et un lien clair sur un panneau sombre était
 * juste. D49 a retourné la palette, les déclarations sont restées.
 *
 * Le contrôle ci-dessous est structurel et non numérique : il ne vérifie pas la
 * paire formée, il refuse qu'une surface serve d'encre. Vérifier la paire
 * réellement peinte demanderait de remonter la surface depuis le composant,
 * donc de résoudre la cascade, donc un moteur CSS — un coût sans commune mesure
 * avec ce qu'il attraperait en plus.
 *
 * Ce qu'il ne voit pas, et qu'il faut dire : une encre licite posée sur une
 * surface où elle ne tient pas son seuil. Il ferme la classe d'erreur constatée
 * deux fois, pas toutes.
 */
const SURFACES = ['fond', 'carte', 'chip', 'creux', 'bord'] as const;

/**
 * Les inversions : les endroits où une surface peint bien du texte, et pourquoi.
 *
 * L'étiquette du jour courant est blanche sur encre. Elle emploie `--carte` là
 * où l'on attendrait une encre, et c'est juste : ce qui est dessous est `--ink`,
 * pas une carte. La partition ci-dessus ne peut pas le voir — elle lit une
 * déclaration, pas la surface qui la porte.
 *
 * Elles ne sont donc **pas exemptées, mais déclarées et mesurées** : chacune est
 * une paire de plus dans le contrôle numérique. Une exemption ferait sortir la
 * couleur de toute vérification, ce qui est exactement l'état d'où l'on vient.
 * Le prix est une ligne à écrire pour chaque inversion — et c'est le prix juste,
 * puisque c'est aussi ce qui force à dire sur quel fond elle se pose.
 */
const INVERSIONS: {
  fichier: string;
  texte: string;
  fond: string;
  seuil: number;
  quoi: string;
}[] = [
  {
    fichier: 'src/routes/semaine/+page.svelte',
    texte: 'carte',
    fond: 'ink',
    seuil: 4.5,
    quoi: 'étiquette « Aujourd’hui » de la ligne du jour courant'
  }
];

describe('les inversions tiennent leur seuil', () => {
  for (const { texte, fond, seuil, quoi, fichier } of INVERSIONS) {
    it(`${quoi} tient ${seuil}:1`, () => {
      const avant = jetons[texte];
      const arriere = jetons[fond];
      expect(avant, `jeton --${texte} absent`).toBeDefined();
      expect(arriere, `jeton --${fond} absent`).toBeDefined();

      const rapport = contraste(avant as string, arriere as string);
      expect(
        Number(rapport.toFixed(2)),
        `--${texte} sur --${fond} : ${rapport.toFixed(2)}:1 (${fichier})`
      ).toBeGreaterThanOrEqual(seuil);
    });
  }
});

describe('un jeton de surface ne peint jamais du texte', () => {
  const COMPOSANTS = globSync('src/**/*.svelte');

  it('trouve bien des composants à contrôler', () => {
    expect(COMPOSANTS.length).toBeGreaterThan(5);
  });

  it('ne partitionne que des jetons qui existent', () => {
    for (const surface of SURFACES) {
      expect(jetons[surface], `jeton --${surface} absent`).toBeDefined();
    }
  });

  for (const fichier of COMPOSANTS) {
    it(`${fichier} n'emploie aucune surface comme encre`, () => {
      const source = readFileSync(fichier, 'utf8');

      /*
        `color:` seul, et non `accent-color:` ni `background-color:`. Le premier
        peint la coche d'une case dont le navigateur choisit lui-même le
        contraste ; le second peint une surface, ce qui est le rôle du jeton.
      */
      const declarees = new Set(
        INVERSIONS.filter((inversion) => inversion.fichier === fichier).map(({ texte }) => texte)
      );

      const fautes = [...source.matchAll(/(?<![\w-])color:\s*var\(--([\w-]+)\)/g)]
        .map((m) => m[1] as string)
        .filter((jeton) => (SURFACES as readonly string[]).includes(jeton))
        .filter((jeton) => !declarees.has(jeton));

      expect(
        [...new Set(fautes)],
        'jeton de surface employé comme couleur de texte : il n’est pas calculé pour porter du texte, et la paire ainsi formée échappe à toute mesure'
      ).toEqual([]);
    });
  }
});

describe("l'apparence ne dépend d'aucune préférence extérieure", () => {
  /*
    Le sprite est joint aux composants, et il faut le dire.

    Il était un `.svelte` et tombait donc dans ce filtre ; il est devenu un
    `.svg` injecté dans la coque (D57), ce qui l'en a sorti sans bruit. Une
    exigence qui cesse d'être vérifiée à un endroit n'est plus vérifiée du tout,
    et c'est précisément le défaut que le bloc précédent existe pour rattraper.
  */
  const COMPOSANTS = [...globSync('src/**/*.svelte'), 'src/lib/illustrations/sprite.svg'];

  it('trouve bien des composants à contrôler', () => {
    expect(COMPOSANTS.length).toBeGreaterThan(5);
  });

  for (const fichier of COMPOSANTS) {
    it(`${fichier} ne fait dépendre son apparence d'aucun thème système`, () => {
      const source = readFileSync(fichier, 'utf8');
      expect(source).not.toContain('prefers-color-scheme');
      expect(source).not.toContain('data-theme');
    });
  }
});
