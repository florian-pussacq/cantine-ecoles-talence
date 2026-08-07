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

/** Les dessins disponibles. `inconnu` est le repli, jamais une déduction. */
export type Illustration =
  | 'pain'
  | 'fruit'
  | 'legume'
  | 'viande'
  | 'volaille'
  | 'poisson'
  | 'pates'
  | 'feculent'
  | 'fromage'
  | 'oeuf'
  | 'gateau'
  | 'chocolat'
  | 'inconnu';

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
    keywords: ['agneau', 'boeuf', 'bœuf', 'veau', 'porc', 'kefta', 'paupiette', 'merguez'],
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
      'dieppoise'
    ],
    illustration: 'poisson',
    family: 'poisson'
  },

  // Féculents — « pomme de terre » doit primer sur « pomme ».
  {
    keywords: [
      'pomme de terre',
      'pommes grenailles',
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

  // Produits laitiers
  {
    keywords: [
      'fromage',
      'yaourt',
      'petit suisse',
      'liegeois',
      'mozzarella',
      'feta',
      'camembert',
      'brie',
      'emmental'
    ],
    illustration: 'fromage',
    family: 'vegetarien'
  },

  // Chocolat — placé avant les gâteaux, un muffin au chocolat reste un gâteau.
  { keywords: ['chocolat'], illustration: 'chocolat', family: 'vegetarien' },

  // Desserts sucrés — « tarte » doit primer sur « pomme » à longueur égale.
  {
    keywords: [
      'tarte',
      'muffin',
      'cookie',
      'gateau',
      'clafouti',
      'beignet',
      'biscuit',
      'mousse',
      'flan',
      'cereale',
      'dessert'
    ],
    illustration: 'gateau',
    family: 'vegetarien'
  },

  // Fruits
  {
    keywords: [
      'fruit',
      'melon',
      'pomme',
      'poire',
      'ananas',
      'peche',
      'banane',
      'compote',
      'raisin',
      'abricot',
      'orange',
      'kiwi'
    ],
    illustration: 'fruit',
    family: 'vegetarien'
  },

  // Légumes et légumineuses
  {
    keywords: [
      'legume',
      'legumineuse',
      'concombre',
      'tomate',
      'salade',
      'betterave',
      'radis',
      'carotte',
      'macedoine',
      'coleslaw',
      'celeri',
      'poireau',
      'chou',
      'brocoli',
      'courgette',
      'haricot',
      'ratatouille',
      'piperade',
      'epinard',
      'petits pois',
      'lentille',
      'pois chiche',
      'courge',
      'artichaut',
      'poivron'
    ],
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
