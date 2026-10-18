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
 *
 * Il y a désormais deux palettes (mode-sombre). La claire vit dans `:root` ; la
 * sombre la recouvre sous `prefers-color-scheme: dark`. Chaque contrôle de ce
 * fichier s'exécute sur l'une et sur l'autre : une paire qui ne tiendrait que
 * dans une palette n'en tient aucune.
 */

const CSS = readFileSync('src/lib/design/tokens.css', 'utf8');

const REQUETE_SOMBRE = '@media (prefers-color-scheme: dark)';

/**
 * Le bloc de la palette sombre, et la feuille sans lui.
 *
 * Le bloc se délimite par ses accolades : une expression régulière ne sait pas
 * les équilibrer, et le bloc contient lui-même `:root { … }`.
 */
function separer(css: string): { clair: string; sombre: string } {
  const debut = css.indexOf(REQUETE_SOMBRE);
  if (debut === -1) return { clair: css, sombre: '' };
  let profondeur = 0;
  let fin = css.indexOf('{', debut);
  do {
    if (css[fin] === '{') profondeur++;
    if (css[fin] === '}') profondeur--;
    fin++;
  } while (profondeur > 0 && fin < css.length);
  return { clair: css.slice(0, debut) + css.slice(fin), sombre: css.slice(debut, fin) };
}

const { clair: CSS_CLAIR, sombre: CSS_SOMBRE } = separer(CSS);

/** Les jetons de couleur opaques déclarés dans un extrait de la feuille. */
function readTokens(css: string): Record<string, string> {
  const jetons: Record<string, string> = {};

  for (const match of css.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    const [, name, value] = match;
    if (name === undefined || value === undefined) continue;
    jetons[name] = value;
  }

  return jetons;
}

const CLAIRS = readTokens(CSS_CLAIR);
const SOMBRES = readTokens(CSS_SOMBRE);

/**
 * Les deux palettes telles que la cascade les peint : la sombre recouvre la
 * claire jeton par jeton. Qu'un jeton y manque, et c'est la valeur claire qui
 * serait peinte sur un fond sombre — d'où le contrôle de complétude plus bas.
 */
const PALETTES: [string, Record<string, string>][] = [
  ['claire', CLAIRS],
  ['sombre', { ...CLAIRS, ...SOMBRES }]
];

/** Les familles du plat principal : le seul code couleur du menu (couleur-par-famille). */
const FAMILLES = ['viande', 'volaille', 'poisson', 'vegetarien', 'inconnu'] as const;

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
  { texte: 'encre', fond: 'fond', seuil: 4.5, quoi: 'texte sur le fond de l’écran' },
  { texte: 'encre', fond: 'carte', seuil: 4.5, quoi: 'nom de plat sur une carte' },
  { texte: 'encre', fond: 'creux', seuil: 4.5, quoi: 'texte sur la carte d’un rôle absent' },
  { texte: 'encre', fond: 'etiquette', seuil: 4.5, quoi: 'pastille d’allergène' },
  { texte: 'encre-douce', fond: 'fond', seuil: 4.5, quoi: 'mention atténuée sur le fond' },
  { texte: 'encre-douce', fond: 'carte', seuil: 4.5, quoi: 'mention atténuée sur une carte' },
  { texte: 'encre-douce', fond: 'creux', seuil: 4.5, quoi: 'énoncé d’une absence' },
  { texte: 'accent', fond: 'fond', seuil: 4.5, quoi: 'accent sur le fond' },
  { texte: 'accent', fond: 'carte', seuil: 4.5, quoi: 'accent sur une carte' },
  { texte: 'sur-accent', fond: 'accent', seuil: 4.5, quoi: 'libellé de l’onglet courant' },
  { texte: 'sur-alerte', fond: 'alerte', seuil: 4.5, quoi: 'bandeau d’alerte' },
  { texte: 'sur-info', fond: 'info', seuil: 4.5, quoi: 'bandeau d’information' },
  {
    texte: 'sur-info',
    fond: 'fond',
    seuil: 4.5,
    quoi: 'bandeau d’information discret, sans surface'
  },
  { texte: 'sur-evenement', fond: 'evenement', seuil: 4.5, quoi: 'bandeau d’événement' },
  /*
    Les familles portent désormais deux emplois de plus, sur la carte principale
    de l'écran du jour (couleur-par-famille, D3) : l'aplat de la pastille, sous
    un glyphe blanc, et l'encre du libellé du rôle sur la carte. Aucune n'est
    posée sur le fond crème, où trois d'entre elles ne tiendraient pas 4,5:1.
  */
  ...FAMILLES.flatMap((famille) => [
    {
      texte: `fam-${famille}`,
      fond: 'carte',
      seuil: 4.5,
      quoi: `libellé du rôle sur la carte principale ${famille}`
    },
    {
      texte: 'sur-famille',
      fond: `fam-${famille}`,
      seuil: 4.5,
      quoi: `glyphe sur l'aplat ${famille}`
    }
  ]),
  ...FAMILLES.map((famille) => ({
    texte: 'encre',
    fond: `fam-${famille}-pale`,
    seuil: 4.5,
    quoi: `texte sur la teinte pâle ${famille}`
  })),
  /*
    L'anneau du disque de la semaine : c'est lui qui dit la famille. Élément
    graphique porteur de sens, donc 3:1 (WCAG 1.4.11). La volaille n'y tenait
    que 2,07 sans que rien ne le mesure (alerte-et-fiche-cochee, D2).
  */
  ...FAMILLES.map((famille) => ({
    texte: `fam-${famille}`,
    fond: `fam-${famille}-pale`,
    seuil: 3,
    quoi: `anneau ${famille} sur sa teinte pâle`
  }))
];

/**
 * Les voiles déclarés dans `tokens.css`, par leur taux d'encre
 * (fermer-les-echelles, D2).
 *
 * Ils vivaient dans les composants, et ce fichier recopiait leurs taux : une
 * duplication qu'un contrôle de couverture devait surveiller. Ils sont devenus
 * des jetons, et le taux se lit à la source.
 */
function readVoiles(): Record<string, { source: string; alpha: number }> {
  const voiles: Record<string, { source: string; alpha: number }> = {};
  for (const match of CSS.matchAll(
    /--([\w-]+):\s*color-mix\(in srgb, var\(--([\w-]+)\) (\d+)%, transparent\)/g
  )) {
    const [, name, source, taux] = match;
    if (name === undefined || source === undefined || taux === undefined) continue;
    voiles[name] = { source, alpha: Number(taux) / 100 };
  }
  return voiles;
}

const voiles = readVoiles();

/**
 * Les surfaces peintes par transparence.
 *
 * Elles échappent aux paires ci-dessus, qui ne connaissent que des jetons
 * opaques : ce sont des couleurs qui n'existent nulle part dans `tokens.css` et
 * que seul le rendu produit.
 *
 * Le seuil de 3:1 des bordures vient de WCAG 1.4.11 : une bordure qui délimite
 * une commande porte une information, au même titre qu'un texte.
 */
const TRANSPARENCES: {
  voile: string;
  fond: string;
  /** Le jeton posé sur la surface voilée ; absent, c'est le voile lui-même qui se lit. */
  texte?: string;
  seuil: number;
  quoi: string;
}[] = [
  {
    voile: 'voile-trait',
    fond: 'fond',
    seuil: 3,
    quoi: 'bordure des commandes de navigation et de sortie'
  },
  /*
    La ligne du jour courant de la semaine (bandeau-et-aujourdhui, D4). Le taux
    est borné par l'encre atténuée des autres plats : à 18 %, elle ne tiendrait
    plus que 4,62. La teinte, elle, ne se distingue pas de la carte en niveaux
    de gris, et n'a pas à le faire : c'est la pastille qui porte le signal.
  */
  ...(['encre', 'encre-douce', 'accent'] as const).map((texte) => ({
    voile: 'voile-accent',
    fond: 'carte',
    texte,
    seuil: 4.5,
    quoi: `--${texte} sur la ligne du jour courant de la semaine`
  }))
];

/**
 * Les voiles délibérément non mesurés, et pourquoi.
 *
 * Sans cette liste, le contrôle de couverture ci-dessous ne laisserait aucune
 * échappatoire et forcerait à foncer des traits décoratifs pour satisfaire un
 * seuil que la norme ne leur applique pas.
 */
const DECORATIFS: { voile: string; pourquoi: string }[] = [
  {
    voile: 'voile-fond',
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

describe.each(PALETTES)('la palette %s', (_, jetons) => {
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

describe.each(PALETTES)('les surfaces peintes par transparence, palette %s', (_, jetons) => {
  for (const { voile, fond, texte, seuil, quoi } of TRANSPARENCES) {
    it(`${quoi} tient ${seuil}:1`, () => {
      const declare = voiles[voile];
      const base = jetons[fond];
      expect(declare, `voile --${voile} absent de tokens.css`).toBeDefined();
      expect(base, `jeton --${fond} absent`).toBeDefined();
      const { source, alpha } = declare as { source: string; alpha: number };

      const peint = compose(jetons[source] as string, base as string, alpha);
      const [avant, arriere] =
        texte === undefined ? [peint, base as string] : [jetons[texte] as string, peint];
      const rapport = contraste(avant, arriere);
      expect(
        Number(rapport.toFixed(2)),
        `--${voile} (${alpha * 100} % de --${source}) sur --${fond} donne ${peint} : ${rapport.toFixed(2)}:1`
      ).toBeGreaterThanOrEqual(seuil);
    });
  }

  it('chaque voile de tokens.css est mesuré ou tenu pour décoratif', () => {
    const declares = new Set([...TRANSPARENCES, ...DECORATIFS].map(({ voile }) => voile));
    expect(Object.keys(voiles).length).toBeGreaterThan(0);
    expect(Object.keys(voiles).filter((nom) => !declares.has(nom))).toEqual([]);
  });
});

/**
 * Le contrôle qui rattrape l'oubli.
 *
 * Une transparence ajoutée sans y penser échappe à toute mesure : c'est ce qui
 * s'est produit à l'écriture de ce test, où la bordure identique de l'écran de
 * la semaine avait été manquée à la lecture. Les voiles vivent désormais dans
 * `tokens.css`, où le contrôle ci-dessus les voit tous ; il reste à refuser
 * qu'un composant en peigne un de son côté (fermer-les-echelles, D2).
 *
 * Il ne couvre que `color-mix(in srgb, var(--encre) N%, transparent)`, la forme
 * mécaniquement reconnaissable. Les opacités appliquées à un élément entier ne
 * disent pas sur quel fond elles se posent, et resteraient à déclarer à la main.
 */
describe('couverture des transparences', () => {
  /*
    Tous les composants, et non une liste tenue à la main : une liste qu'il faut
    penser à compléter est une liste qui finit incomplète (D63, D64).
  */
  const FICHIERS = globSync('src/**/*.svelte');

  for (const fichier of FICHIERS) {
    it(`${fichier} ne peint aucun voile d'encre hors des jetons`, () => {
      const source = readFileSync(fichier, 'utf8');
      const trouves = [
        ...source.matchAll(/color-mix\(in srgb, var\(--encre\) \d+%, transparent\)/g)
      ].map((m) => m[0]);
      expect(trouves, 'voile écrit dans un composant : le déclarer dans tokens.css').toEqual([]);
    });
  }
});

/**
 * Deux palettes, et une seule bascule (mode-sombre, D2, D4).
 *
 * D25 et D49 interdisaient toute trace d'un thème. Le suivi du système est
 * revenu, mais en un seul endroit : une requête de média dans `tokens.css`, et
 * aucun sélecteur `data-theme`, puisque l'application n'offre aucun réglage
 * propre (D1).
 */
describe('les deux palettes', () => {
  it('ne connaît qu’une requête de thème, la sombre, et aucun réglage', () => {
    expect(CSS.split('prefers-color-scheme').length - 1).toBe(1);
    expect(CSS).toContain(REQUETE_SOMBRE);
    expect(CSS).not.toContain('data-theme');
    expect(CSS).not.toContain('--dark-');
  });

  it('la sombre redéclare chaque jeton de couleur de la claire', () => {
    // Un jeton oublié hériterait de sa valeur claire : une encre sombre sur un
    // fond sombre, que la mesure des paires ne verrait pas si la paire n'est
    // pas listée.
    const oublies = Object.keys(CLAIRS).filter((nom) => !(nom in SOMBRES));
    expect(oublies).toEqual([]);
    expect(Object.keys(CLAIRS).length).toBeGreaterThan(20);
  });

  it('la sombre vient après la claire, qu’elle doit recouvrir', () => {
    // Même sélecteur, même spécificité : c'est l'ordre qui décide. Placé avant
    // `:root`, le bloc sombre est mesuré ici mais jamais peint — c'est arrivé à
    // la mise en œuvre, et seul le rendu l'a montré.
    const racine = CSS.search(/^:root\s*\{/m);
    expect(racine).toBeGreaterThan(-1);
    expect(CSS.indexOf(REQUETE_SOMBRE)).toBeGreaterThan(racine);
  });

  it('la sombre ne déclare rien que la claire ignore', () => {
    expect(Object.keys(SOMBRES).filter((nom) => !(nom in CLAIRS))).toEqual([]);
  });

  it('la barre du navigateur prend le fond de chaque palette (D5)', () => {
    // `app.html` recopie `--fond`, faute de pouvoir lire un jeton : la copie est
    // gardée ici.
    const html = readFileSync('src/app.html', 'utf8');
    const barre = (schema: string) =>
      html.match(
        new RegExp(
          `<meta name="theme-color" content="(#[0-9a-fA-F]{6})" media="\\(prefers-color-scheme: ${schema}\\)"`
        )
      )?.[1];
    expect(barre('light')).toBe(CLAIRS['fond']);
    expect(barre('dark')).toBe(SOMBRES['fond']);
  });

  it('la sombre change aussi le schéma des contrôles natifs', () => {
    expect(CSS_SOMBRE).toMatch(/color-scheme:\s*dark/);
  });
});

/**
 * Les composants, surveillés là où l'apparence avait discrètement cessé de
 * l'être.
 *
 * Deux composants ont vécu des mois avec une règle `prefers-color-scheme: dark`
 * héritée du thème supprimé par D25 — dont l'une repeignait des liens en clair
 * sur un panneau clair. La bascule appartient à `tokens.css` seul (mode-sombre,
 * D2) : un composant qui en déclarerait une seconde la contournerait.
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
const SURFACES = ['fond', 'carte', 'etiquette', 'creux', 'bord'] as const;

/**
 * Les inversions : les endroits où une surface peint bien du texte, et pourquoi.
 *
 * L'étiquette du jour courant de la semaine en a été une : blanche sur encre,
 * elle employait `--carte` là où l'on attendrait une encre, et c'était juste. Elle
 * est devenue la pastille à l'accent, `--sur-accent` sur `--accent`, une paire
 * déjà mesurée (bandeau-et-aujourdhui, D3). Il n'en reste aucune ; la liste
 * demeure, parce que c'est elle qui dit comment en déclarer une.
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
}[] = [];

describe.each(PALETTES)('les inversions tiennent leur seuil, palette %s', (_, jetons) => {
  it('n’en laisse aucune sans mesure', () => {
    for (const { texte, fond } of INVERSIONS) {
      expect(jetons[texte], `jeton --${texte} absent`).toBeDefined();
      expect(jetons[fond], `jeton --${fond} absent`).toBeDefined();
    }
  });

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
      expect(CLAIRS[surface], `jeton --${surface} absent`).toBeDefined();
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

describe('aucun composant ne dépend de la préférence d’apparence', () => {
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
