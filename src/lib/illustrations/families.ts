/**
 * Association d'un libellé de plat à son illustration et à sa famille.
 *
 * C'est une fonction pure du libellé : le document source ne mentionne ni l'une
 * ni l'autre, et les déduire côté application permet d'enrichir la table sans
 * régénérer les données déjà publiées (design.md, D9 et D11).
 *
 * Deux garde-fous non négociables : aucune approximation — un libellé inconnu
 * prend le repli, jamais la correspondance la plus proche — et la famille ne
 * porte aucune information relative aux allergènes.
 */

/**
 * Les dessins disponibles. `inconnu` est le repli, jamais une déduction.
 *
 * La bibliothèque est passée de treize à trente et un dessins (design.md, D59),
 * et le motif du découpage est mesuré et non deviné : sur les deux mois publiés,
 * `legume` portait à lui seul **quarante libellés distincts** — « Radis beurre »,
 * « Taboulé », « Ratatouille » et « Salade grecque » recevaient la même
 * courgette. La reconnaissance, elle, marchait déjà : 8 % d'échecs seulement.
 * Ce qui manquait n'était pas la couverture mais la résolution.
 *
 * On éclate ce qui collisionne réellement, et l'on ne descend pas jusqu'au plat
 * nommé : sur 149 libellés distincts, 129 n'apparaissent qu'une seule fois et ne
 * reviendront jamais. Un dessin par plat serait un dessin jetable par plat.
 */
export type Illustration =
  // Les neuf inchangés : leurs paquets ne dépassaient pas dix libellés.
  | 'pain'
  | 'viande'
  | 'volaille'
  | 'poisson'
  | 'pates'
  | 'feculent'
  | 'oeuf'
  | 'chocolat'
  | 'inconnu'
  // Ce qui était « legume »
  | 'salade-composee'
  | 'salade-verte'
  | 'crudite-rapee'
  | 'tomate'
  | 'concombre'
  | 'chou'
  | 'courgette'
  | 'poireau'
  | 'legumineuse'
  | 'courge'
  | 'legume'
  // Ce qui était « fromage »
  | 'yaourt'
  | 'laitage-sucre'
  | 'fromage'
  // Ce qui était « fruit »
  | 'compote'
  | 'melon'
  | 'fruit-sirop'
  | 'fruit'
  // Ce qui était « gateau »
  | 'biscuit'
  | 'gateau'
  | 'mousse'
  // Nouveau
  | 'fruits-de-mer';

/** Les familles colorées du plat principal. */
export type Family = 'viande' | 'volaille' | 'poisson' | 'vegetarien' | 'inconnu';

type Entry = {
  readonly keywords: readonly string[];
  readonly illustration: Illustration;
  readonly family: Family;
};

/**
 * La table, ordonnée par spécificité décroissante à égalité de longueur.
 *
 * La règle de correspondance est documentée et testée : **le mot-clé le plus
 * long l'emporte**, et à longueur égale, le premier de la table. C'est ce qui
 * fait que « écrasé de pommes de terre » devient un féculent et non un fruit,
 * alors que les deux mots-clés correspondent.
 */
const TABLE: readonly Entry[] = [
  // Viandes — un plat de pâtes à la bolognaise reste de la viande.
  { keywords: ['chili con carne'], illustration: 'viande', family: 'viande' },
  { keywords: ['bolognaise'], illustration: 'pates', family: 'viande' },
  {
    keywords: [
      'agneau',
      'boeuf',
      'bœuf',
      'veau',
      'porc',
      'mouton',
      'kefta',
      'paupiette',
      'merguez'
    ],
    illustration: 'viande',
    family: 'viande'
  },

  // Volailles
  {
    keywords: ['volaille', 'poulet', 'dinde', 'canard', 'nuggets'],
    illustration: 'volaille',
    family: 'volaille'
  },

  // Poissons — « meunière » et « dieppoise » sont des marqueurs fiables.
  {
    keywords: [
      'poisson',
      'colin',
      'truite',
      'saumon',
      'maquereau',
      'cabillaud',
      'thon',
      'sardine',
      'meuniere',
      'dieppoise',
      'fish'
    ],
    illustration: 'poisson',
    family: 'poisson'
  },

  // Coquillages et céphalopodes — même famille colorée que le poisson, dessin
  // distinct : un encornet ne ressemble pas à un filet.
  {
    keywords: ['fruits de mer', 'encornet', 'calamar', 'moule', 'crevette'],
    illustration: 'fruits-de-mer',
    family: 'poisson'
  },

  // Féculents — « pomme de terre » doit primer sur « pomme ».
  {
    keywords: [
      'pomme de terre',
      'pommes grenailles',
      'dauphinois',
      'riz',
      'semoule',
      'boulgour',
      'quinoa',
      'ble',
      'puree',
      'ecrase'
    ],
    illustration: 'feculent',
    family: 'vegetarien'
  },

  // Pâtes et assimilés
  {
    keywords: ['pates', 'ravioli', 'lasagne', 'pizza', 'coquillettes', 'spaghetti'],
    illustration: 'pates',
    family: 'vegetarien'
  },

  // Œufs
  { keywords: ['omelette', 'oeuf', 'œuf'], illustration: 'oeuf', family: 'vegetarien' },

  /*
    Produits laitiers — trois dessins là où il n'y en avait qu'un.

    Le paquet « fromage » recevait les yaourts à boire et les liégeois : une part
    de fromage devant un dessert lacté. « fromage blanc » doit primer sur
    « fromage », et c'est la règle du mot-clé le plus long qui s'en charge.
  */
  {
    keywords: ['yaourt', 'petit suisse', 'fromage blanc', 'skyr'],
    illustration: 'yaourt',
    family: 'vegetarien'
  },
  {
    keywords: ['liegeois', 'creme dessert', 'flan'],
    illustration: 'laitage-sucre',
    family: 'vegetarien'
  },
  {
    keywords: ['fromage', 'mozzarella', 'feta', 'camembert', 'brie', 'emmental'],
    illustration: 'fromage',
    family: 'vegetarien'
  },

  // Chocolat — placé avant les gâteaux, un muffin au chocolat reste un gâteau.
  { keywords: ['chocolat'], illustration: 'chocolat', family: 'vegetarien' },

  /*
    Desserts sucrés — le biscuit sec se distingue du gâteau et de la mousse.

    « barre de céréales » et « petit beurre » se lisaient comme des gâteaux, ce
    qui donnait une part de tarte devant un biscuit emballé.
  */
  {
    keywords: [
      'biscuit',
      'petit beurre',
      'boudoir',
      'madeleine',
      'barre',
      'cereale',
      'cookie',
      'gaufre',
      'galette',
      'sable'
    ],
    illustration: 'biscuit',
    family: 'vegetarien'
  },
  {
    keywords: [
      'gateau',
      'muffin',
      'cake',
      'tarte',
      'clafouti',
      'beignet',
      'moelleux',
      'brownie',
      'quatre quarts',
      // Ce que le document écrit quand il annonce un dessert sans le nommer.
      // « crème dessert » reste plus long, et part donc vers le laitage sucré.
      'dessert'
    ],
    illustration: 'gateau',
    family: 'vegetarien'
  },
  // « crème dessert » l'emporte sur « crème » par sa longueur, et
  // « betteraves crémeuse » sur les deux : c'est bien une crudité.
  { keywords: ['mousse', 'creme'], illustration: 'mousse', family: 'vegetarien' },

  /*
    Fruits — quatre dessins.

    « Salade de fruits » recevait un légume : « salade » compte six lettres,
    « fruit » cinq, et la règle du mot-clé le plus long se retournait contre
    elle-même. Le mot-clé complet la remet à l'endroit.
  */
  {
    keywords: ['compote', 'pate de fruits', 'berlingot'],
    illustration: 'compote',
    family: 'vegetarien'
  },
  { keywords: ['melon', 'pasteque'], illustration: 'melon', family: 'vegetarien' },
  {
    keywords: ['au sirop', 'cocktail de fruits', 'salade de fruits'],
    illustration: 'fruit-sirop',
    family: 'vegetarien'
  },
  {
    keywords: [
      'fruit',
      'pomme',
      'poire',
      'ananas',
      'peche',
      'banane',
      'raisin',
      'abricot',
      'orange',
      'kiwi',
      'fraise'
    ],
    illustration: 'fruit',
    family: 'vegetarien'
  },

  /*
    Légumes — onze dessins là où il n'y en avait qu'un pour quarante libellés.

    Les crudités râpées, les salades composées et les légumes cuits ne se
    ressemblent pas dans l'assiette ; ils ne se ressemblaient pourtant qu'à
    l'écran.
  */
  {
    keywords: [
      'salade piemontaise',
      'salade grecque',
      'salade de perles',
      'salade de mais',
      'salade composee',
      'piemontaise',
      'taboule',
      'coleslaw',
      'macedoine'
    ],
    illustration: 'salade-composee',
    family: 'vegetarien'
  },
  {
    keywords: ['salade verte', 'salade d endives', 'endive', 'laitue', 'roquette', 'salade'],
    illustration: 'salade-verte',
    family: 'vegetarien'
  },
  {
    keywords: ['carottes rapees', 'celeri', 'betterave', 'radis', 'chou blanc'],
    illustration: 'crudite-rapee',
    family: 'vegetarien'
  },
  { keywords: ['tomate', 'piperade'], illustration: 'tomate', family: 'vegetarien' },
  { keywords: ['concombre'], illustration: 'concombre', family: 'vegetarien' },
  {
    keywords: ['chou fleur', 'romanesco', 'brocoli', 'chou'],
    illustration: 'chou',
    family: 'vegetarien'
  },
  {
    keywords: ['courgette', 'ratatouille', 'aubergine'],
    illustration: 'courgette',
    family: 'vegetarien'
  },
  { keywords: ['poireau'], illustration: 'poireau', family: 'vegetarien' },
  {
    keywords: ['lentille', 'pois chiche', 'haricot', 'flageolet', 'legumineuse', 'petits pois'],
    illustration: 'legumineuse',
    family: 'vegetarien'
  },
  { keywords: ['courge', 'potiron', 'butternut'], illustration: 'courge', family: 'vegetarien' },
  {
    keywords: ['legume', 'epinard', 'poivron', 'artichaut', 'navet', 'carotte'],
    illustration: 'legume',
    family: 'vegetarien'
  },

  // Pain
  { keywords: ['pain'], illustration: 'pain', family: 'vegetarien' }
];

/** Minuscules, sans accents, ponctuation ramenée à des espaces. */
export function normalise(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export type DishMatch = {
  readonly illustration: Illustration;
  readonly family: Family;
  /** Le mot-clé qui a décidé, `null` en cas de repli. Sert au recensement. */
  readonly matched: string | null;
};

const FALLBACK: DishMatch = { illustration: 'inconnu', family: 'inconnu', matched: null };

/**
 * Classe un plat. Rend le repli plutôt que de deviner quand rien ne correspond.
 */
export function classify(label: string): DishMatch {
  const haystack = normalise(label);
  let best: { entry: Entry; keyword: string } | null = null;

  for (const entry of TABLE) {
    for (const keyword of entry.keywords) {
      const needle = normalise(keyword);
      if (!haystack.includes(needle)) continue;
      if (best === null || needle.length > best.keyword.length) {
        best = { entry, keyword: needle };
      }
    }
  }

  if (best === null) return FALLBACK;
  return {
    illustration: best.entry.illustration,
    family: best.entry.family,
    matched: best.keyword
  };
}

/**
 * La famille colorée d'un plat principal.
 *
 * N'a de sens que pour le rôle `plat` : c'est le seul compartiment coloré.
 */
export function familyOf(label: string): Family {
  return classify(label).family;
}
