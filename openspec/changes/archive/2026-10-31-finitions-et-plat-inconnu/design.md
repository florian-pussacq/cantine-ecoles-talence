## Context

Voir `proposal.md` pour le pourquoi. Ce qui contraint le comment :

- **La famille se déduit côté application**, par `classify()` dans `src/lib/illustrations/families.ts`. Toute correction de la table vaut pour les mois déjà publiés, sans régénérer de données. La règle de la table est fixée : le mot-clé le plus long l'emporte, la comparaison se fait mot à mot, et l'on ne fait aucune approximation.
- **L'aplat se pose par deux variables locales**, `--aplat` et `--pale`, que `PlatCarte.svelte` et la tuile de `semaine/+page.svelte` dérivent de `var(--fam-${famille})`. Le repli `inconnu` produit aujourd'hui `var(--fam-inconnu)`. Supprimer ce jeton sans changer cette dérivation laisserait une variable indéfinie, donc un aplat transparent.
- **`design-tokens.test.ts` refuse les littéraux** pour la taille, la graisse et le rayon (`PROPRIETES_PAR_JETON`). Il ne regarde pas encore `letter-spacing`, d'où les trois valeurs écrites en dur. **`contrast.test.ts` mesure chaque famille**, `inconnu` compris, dans les deux palettes.
- **Le sprite est injecté au build** (D57 de la refonte). Redessiner un symbole ne coûte rien au JavaScript.
- **La sonde de l'audit** (`text-wrap` absent, environ 100 caractères par ligne sur bureau, 17 mots seuls) a été mesurée sur le build de `main` du 31 octobre. Les contrôles e2e de ce changement en reprennent la méthode.

## Goals / Non-Goals

**Goals :**

- Que le plat inclassable se lise comme un plat, et non comme un chargement.
- Que la sonde de l'audit ne relève plus ni ligne trop longue ni mot seul sur les écrans de texte courant.
- Que le seul écran consulté chaque jour finisse sur la provenance des données, sans ligne de plus.

**Non-Goals :**

- **Deviner la famille d'un plat ambigu.** L'escalope viennoise, l'émincé au curry et la croustade limousine restent inclassables, et c'est le but de l'état neutre.
- **Toucher la règle D28** (« Pain » suivi de « Bio »). L'audit l'avait relevée, mais c'est une décision documentée : dans la grille rôle | nom, « Pain · Bio » se lit comme une valeur dans sa colonne.
- **Ajouter des dessins à la bibliothèque.** Seul `ill-inconnu` est redessiné ; les libellés enrichis reçoivent des dessins existants.
- **Ajouter des règles typographiques par composant.** Les deux règles de coupure se posent une fois, globalement.

## Decisions

### D1 — L'inconnu se marque par l'absence de couleur, et non par une couleur de plus

Le plat principal inclassable garde la composition du plat principal : le nom dans la coupe d'affichage, la méta, la pastille d'allergène et le disque d'illustration. Il change de surface :

| | Famille reconnue | Inclassable |
|---|---|---|
| Surface | `--aplat` = `--fam-<famille>` | `--carte` |
| Contour | aucun | filet de 2 px `--encre` |
| Texte | `--sur-famille` | `--encre`, méta en `--encre-douce` |
| Disque | `--pale` = `--fam-<famille>-pale` | `--creux` |

Le filet de 2 px est celui qui ouvre déjà les tableaux et les sections (refonte, D7). La carte appartient donc au système existant et ne crée pas de nouvel objet. Les paires texte et fond qu'elle emploie, encre et encre douce sur la carte, sont déjà mesurées par `contrast.test.ts`.

La tuile de la semaine suit la même règle : une carte avec un filet plein de 2 px en encre, et le jour et le quantième en encre. Le jour sans service garde son filet tireté. Trois états se distinguent ainsi sans couleur : **plein coloré** (famille), **cerclé plein** (inconnu) et **cerclé tireté** (pas de service). L'exigence « La famille se lit sans la couleur » tient d'elle-même : l'inconnu n'écrit pas de famille, et sa tuile ne ressemble à aucune autre.

Concrètement, la dérivation `var(--fam-${famille})` n'est plus produite pour `inconnu`. Une classe `inconnue` porte la surface, le contour et l'encre, et les jetons `--fam-inconnu` et `--fam-inconnu-pale` sont supprimés des deux palettes.

*Écartées :*

- **L'aplat d'encre** : très affirmé, mais le noir est déjà l'inversion de « Aujourd'hui » et l'accent. Un plat noir se lirait « important » ou « aujourd'hui ».
- **Le gris actuel, mieux dessiné** : l'aplat resterait terne à côté de quatre couleurs franches. C'est l'aplat, plus que le dessin, qui se lit « désactivé ».

### D2 — Une cloche de service à la place de l'assiette vide

Le symbole `ill-inconnu` dessinait une assiette vide grise : une absence. Il dessine désormais une cloche posée sur son plateau, avec le même lustre (`url(#lustre)`) et la même ombre portée que les autres dessins. Elle dit « le plat du jour » sans en nommer la nature. Cette convention de service se comprend sans légende, et elle ne prétend rien savoir.

Les teintes restent neutres (gris acier et blanc), et le dessin se lit sur `--creux` dans les deux palettes. Le nom `inconnu` est conservé dans la table et le sprite, pour ne pas toucher au type `Illustration` ni au recensement.

*Écartés :*

- **La marque de l'enseigne** (assiette et couverts) : elle confondrait le plat avec l'application.
- **Un point d'interrogation** : il dirait que la donnée manque, alors que le nom du plat est connu.

### D3 — N'entre dans la table que ce qui ne désigne qu'une famille

Le critère, à écrire en tête de la table : **un mot-clé de plat principal n'entre que si tous les plats qu'il désigne en restauration scolaire appartiennent à la même famille.**

- **Entrent** : `vegetal`, `vegetale` et `vegetarienne` → végétarien. Le comparateur n'admet que les pluriels en `-s` ou `-x`, si bien que `vegetarien` ne trouve ni « végétarienne » ni « végétal ».
- **Restent dehors** :
  - `escalope` (veau, dinde ou porc selon la cuisine) ;
  - `emince` (n'importe quelle viande) ;
  - `croustade` (sucrée ou salée) ;
  - `curry` ;
  - `moussaka`. La proposition l'avait fait entrer comme viande ; c'est un écart à la proposition, découvert à l'application. Un test existant la juge ambiguë, au motif qu'elle peut être végétarienne sans le dire. Les coûts ne sont pas symétriques : écrire « Viande » sur un plat végétarien est une erreur, alors que la carte neutre de D1 ne coûte presque plus rien. Elle reste donc inclassable.

### D3 bis — La famille d'un plat se lit par sa protéine, et non par son mot le plus long

Le recensement par semaine, fait à l'application, montre que la règle « le mot-clé le plus long l'emporte » écrit une **fausse famille** sur des plats principaux :

| Libellé | Mot le plus long | Famille affichée | Famille réelle |
|---|---|---|---|
| Sauté de porc à l'ananas | `ananas` (6) | Végétarien | Viande |
| Lasagnes saumon épinards | `lasagne` (7) | Végétarien | Poisson |
| Salade de pâtes à la dinde | `salade` (6) | Végétarien | Volaille |
| Cordon bleu végétal | `cordon bleu` (11) | Volaille | Végétarien |

C'est plus grave qu'un plat inconnu, puisque cela affirme le faux. La famille se départage désormais **par rang, puis par longueur** :

1. **Un qualificatif végétal** (`vege`, `vegetarien`, `vegetarienne`, `vegetal`, `vegetale`, `seitan`) l'emporte sur tout. Il est la déclaration explicite du plat.
2. **Une protéine animale** : toute entrée de famille viande, volaille ou poisson. À rang égal, le mot-clé le plus long l'emporte, si bien que « Saucisse de volaille » reste une volaille.
3. **Le reste** (féculents, légumes, desserts, qui sont végétariens par défaut), au mot-clé le plus long.

**L'illustration garde la règle du plus long**, qui dessine ce que l'on voit dans l'assiette. La lasagne au saumon est dessinée en pâtes et colorée en poisson, comme le ravioli bolognaise est déjà dessiné en pâtes et coloré en viande.

Concrètement, `classify()` calcule deux gagnants sur le même parcours. Le retour garde sa forme `{ illustration, family, matched }`, où `matched` reste le mot-clé de l'illustration, celui que sert le recensement.

*Écartée :* ajouter des mots-clés plus longs pour chaque combinaison (« porc à l'ananas », « lasagnes saumon »). Ce serait courir après chaque libellé d'un mois sur l'autre, alors que le défaut est dans la règle.

Les autres rôles ne prennent pas de famille (D3 de la refonte), et ces mots-clés ne servent pour eux qu'à l'illustration. On n'y emploie que des dessins existants, l'ensemble étant fixé par les tests :

- `potatoes` → féculent ;
- `mache` → salade verte ;
- `babybel`, `tome`, `tomme` → fromage ;
- `tiramisu`, `cheesecake`, `far`, `donut`, `pasteis de nata` → gâteau ;
- `houmous` → légumineuse ;
- `saucisson` → viande ;
- `rillettes de la mer` → fruits de mer ;
- `poelee`, `champignon`, `mais` → légume.

Chaque ajout reçoit un cas dans `families.test.ts`, et le recensement de l'audit sert de liste de contrôle.

### D4 — La mesure et les coupures se posent une fois, dans `tokens.css`

```css
:root { --mesure: 55ch; }
p, li, dd { text-wrap: pretty; }
p { max-inline-size: var(--mesure); }
h1, h2, h3 { text-wrap: balance; }
```

`ch` est la chasse du zéro, plus large que la lettre moyenne de Funnel Sans : mesuré à l'application, `65ch` donnait 80 caractères réels, `58ch` encore 78 sur un paragraphe riche en lettres étroites, et `55ch` reste sous le plafond de 75 de la spec sur les trois écrans de texte. Comme la règle est globale, un paragraphe ajouté demain n'a rien à déclarer pour être lisible.

`max-inline-size` sur `p` ne gêne aucun paragraphe court : la mention du rang, le corps d'un bandeau et le pied sont plus étroits que la mesure. Sur bureau, le bandeau garde sa largeur de colonne, et seul son texte s'arrête à la mesure. La règle se pose avant les styles des composants, si bien qu'un composant qui aurait une bonne raison de s'en écarter peut le faire.

`text-wrap: pretty` est une amélioration progressive : sans prise en charge, le navigateur coupe comme aujourd'hui. Le scénario de la spec le dit (« lorsque le navigateur sait l'éviter »), et l'e2e, qui tourne sur Chromium, le vérifie.

*Écartée :* une classe `.prose` posée par écran. Ce serait un oubli de plus à chaque nouvel écran.

### D5 — L'approche passe par deux jetons

| Jeton | Valeur | Usage |
|---|---|---|
| `--serrage-titre` | `-0.04em` (existant) | le grand chiffre |
| `--serrage-intitule` | `-0.02em` | le nom du plat principal, le titre d'un écran secondaire, le titre de la fiche |

Les valeurs `-0.03em` d'`EnTete` et de `FicheJour` passent à `-0.02em`, une différence invisible à ces tailles. Le `-0.01em` de `Bandeau` disparaît, puisqu'il n'est pas perceptible. `letter-spacing` rejoint `PROPRIETES_PAR_JETON`, et les mots-clés `normal` et `0` restent admis.

### D6 — Le titre d'un écran secondaire s'aligne sur l'axe

Le `h1` d'`EnTete` passe à gauche, dans `--police-affichage`, au cran `--texte-2xl`. Les écrans de menu posent leur titre sur l'axe gauche de la colonne, et un titre centré était la seule entorse à la grille. La coupe d'affichage est déjà réservée par la spec « au titre de l'écran et au nom du plat principal » : ce titre-là est un titre d'écran.

### D7 — Les mentions passent par les réglages

`PiedSource` perd son lien vers `/a-propos`. Il garde la date de mise à jour et le lien vers le PDF officiel, qui passe au cran `--texte-sm` parce qu'il est désormais seul et qu'il est une commande. La section « Application » des réglages, ajoutée par la refonte, devient le seul accès.

Sur le fond, l'obligation française (LCEN, art. 6-III) demande que les mentions soient « facilement accessibles », pas qu'elles figurent sur chaque page. Deux gestes depuis n'importe quel écran de menu, la roue puis la section « Application », c'est la convention des applications, où les mentions vivent sous Réglages, puis À propos. Ce n'est pas un avis juridique ; c'est la lecture courante. Et l'avertissement qui compte au quotidien, « seul le document officiel fait foi », se lit déjà dans les réglages et sur l'écran des mentions.

*Écarté :* garder le lien en bas des écrans de menu, mais plus petit. C'est la même ligne en moins visible : on garde le coût sans le bénéfice.

## Risks / Trade-offs

- **[Le blanc de la carte inconnue sur le fond clair `#F2F3F0` est peu contrasté]** → C'est le filet d'encre qui délimite la carte, et non le blanc. Il tient plus de 15:1 sur le fond. En sombre, la carte `#1A1E1B` sur `#111412` se délimite de la même façon.
- **[`p { max-inline-size }` global peut rétrécir un paragraphe qu'on voulait pleine largeur]** → Les captures à 390, 320 et 1280 px, et la sonde de mesure en e2e, le montrent aussitôt. Le composant concerné peut s'en écarter localement.
- **[Le mot-clé `mais` peut attraper la conjonction « mais »]** → Un libellé de plat ne contient pas de conjonction. Le cas « Salade de maïs » reste dans `salade-composee`, parce que le mot-clé le plus long l'emporte ; un test le fixe.
- **[`text-wrap: pretty` change les coupures et donc les hauteurs]** → La sonde « le plat principal est visible d'emblée » (`hauteur.spec.ts`) mesure toujours la flottaison à 390 × 844.
- **[On ne peut plus atteindre les mentions sans passer par les réglages]** → C'est voulu (D7). L'e2e `coque` vérifie qu'elles restent atteignables en deux gestes depuis chaque écran de menu.

## Migration Plan

Il n'y a aucune donnée à migrer : la famille et l'illustration se recalculent à l'affichage. Le service worker précache le nouveau build comme d'habitude, et l'ancienne version cède la place au rechargement. Un retour arrière consiste à revenir sur les commits.
