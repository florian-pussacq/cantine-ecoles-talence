## Contexte

L'audit (artefact « Audit design de la cantine », pistes 4 et 5, plan d'action étape 1) a posé le constat. Les choix ci-dessous ont été arrêtés avec l'humain le 17 octobre 2026.

`contrast.test.ts` mesure déjà les paires texte/fond réellement affichées. Il mesure les familles par le texte posé sur leur teinte pâle, mais jamais leur anneau, qui est pourtant la marque qui dit « poisson » ou « volaille » sur la semaine. `DaySheet.svelte` reçoit `day` et `onClose`. Il n'importe pas `allergenFilter`, alors que `PlatCarte` et la semaine le lisent directement.

## Décisions

### D1 — La volaille bouge, pas l'alerte

**Retenu :** `--fam-volaille: #9a5c00`. L'orange `#e89406` reste à `--warn`, et donc à l'alerte seule.

L'orange est le code d'alerte que tout le monde lit, et `--warn-on` est calculé pour lui. Le déplacer obligerait à recalculer six bandeaux. La volaille n'a qu'un usage, l'anneau de la semaine.

**Écarté :** `#b86e00`, la valeur proposée par l'audit. Elle règle la confusion (3,40:1 sur la teinte pâle), mais ne tient que 3,99:1 sous un glyphe blanc. Or le changement « un seul code couleur » (backlog, entrée 14) posera la famille du plat principal en aplat de pastille et en encre de libellé sur l'écran du jour, avec le seuil de 4,5:1 qui vaut déjà pour les rôles. Choisir `#b86e00` maintenant, c'était retoucher la volaille une seconde fois.

| Valeur | sur blanc | sur crème | sur sa teinte pâle |
|---|---|---|---|
| `#e89406` | 2,42 | 2,06 | 2,07 |
| `#b86e00` | 3,99 | 3,40 | 3,40 |
| **`#9a5c00`** | **5,38** | **4,58** | **4,59** |

Effet de bord accepté : `#9a5c00` se rapproche des bruns de rôle, accompagnement `#8d6411` et pain `#955f35`. Ils ne partagent aucun écran avec les familles (D54), et ils disparaissent avec l'entrée 14.

### D2 — Deux garde-fous, dans `contrast.test.ts`

1. **L'alerte s'écarte de chaque famille.** Le contrôle porte sur une distance perceptuelle, pas sur l'égalité des valeurs hexadécimales : un `#e99507` passerait une comparaison d'égalité et tromperait tout autant. La distance retenue est euclidienne dans OKLab, plus simple à écrire et à relire que CIEDE2000, et suffisante pour des teintes franches. Le seuil se cale à l'application, sur les valeurs réelles, et sa raison est écrite à côté.
2. **L'anneau d'une famille se perçoit sur sa teinte pâle**, au seuil de 3:1 (WCAG 1.4.11, élément graphique). Avec `#9a5c00`, les cinq passent : viande 3,58, poisson 3,75, végétarien 4,04, inconnu 4,42, volaille 4,59.

Ils vivent à côté des paires existantes et dans la même langue. Leur message d'échec nomme les deux jetons en cause.

### D3 — La fiche lit le filtre elle-même

**Retenu :** `DaySheet` importe `allergenFilter`, comme `PlatCarte` et la semaine.

**Écarté :** passer la sélection en propriété. Le filtre est un état partagé de l'application, et la fiche serait le seul composant à le recevoir autrement. Les tests de `DaySheet` règlent le filtre comme ceux de `PlatCarte`.

### D4 — Un résumé, puis le détail

La forme retenue est « résumé puis détail », celle de l'audit (piste 5). La vue par allergène a été écartée : elle change le modèle de la fiche, et c'est elle qui tente le plus d'oublier le mot « déclaré ».

**Résumé**, présent seulement si la sélection n'est pas vide. Une ligne par allergène surveillé, dans l'ordre de la légende. Chaque ligne donne le nom de l'allergène, puis soit les plats du jour qui le déclarent, dans l'ordre de l'écran, soit « Aucun plat ne le déclare ». La formulation garde le mot « déclare » : elle constate une déclaration, elle ne promet pas une absence.

*Corrigé à l'application.* Un plat se nomme dans le résumé par son libellé, et non par le nom que lui donne l'écran du jour. Celui-ci promeut la qualité au rang de nom quand le libellé répète le rôle, ce qui faisait écrire « Bio » à la place du pain.

**Détail**, dans chaque plat. Les allergènes surveillés passent en tête. Ils sont marqués par trois signaux qui tiennent en niveaux de gris : la graisse forte, un contour appuyé et le mot « surveillé » en toutes lettres, restitué au lecteur d'écran. Les autres prennent l'encre atténuée, `--ink-muted`, qui garde 4,5:1 : un allergène atténué reste lisible, il n'est pas masqué.

**Jour non précisé**, quand `allergensUndeclared(day.source)` est vrai et la sélection non vide. Le résumé est remplacé par un message au ton d'alerte (`--warn` / `--warn-on`), qui nomme les allergènes surveillés qu'on ne peut pas vérifier et renvoie au document officiel. C'est l'application de la règle d'`allergenes-non-communiques` : l'incertitude se voit autant qu'une alerte, jamais moins.

**Sélection vide :** la fiche reste identique à aujourd'hui, sans résumé ni invitation. C'est la règle déjà posée par `allergen-filter` (« sans invitation insistante »).

```
 ┌ Mercredi 14 octobre ─────────────── Fermer ┐
 │ Allergènes déclarés, plat par plat         │
 │ ┌ Allergènes surveillés ─────────────────┐ │
 │ │ Gluten   Clafoutis aux fruits          │ │
 │ │ Lait     Salade grecque, Clafoutis     │ │
 │ └────────────────────────────────────────┘ │
 │ ENTRÉE   Salade grecque                    │
 │  [Lait · surveillé]  Moutarde  Sulfites    │
 │ DESSERT  Clafoutis aux fruits              │
 │  [Gluten · surveillé] [Lait · surveillé]   │
 │  Œufs                                      │
 └────────────────────────────────────────────┘
```

Le libellé long du gluten (« Gluten (blé, seigle, orge, avoine, épeautre, kamut) ») occupe aujourd'hui une ligne entière par plat. Le raccourcir dans le résumé et le détail, avec la précision en note, est hors périmètre : c'est la légende du PDF qui le fournit, et le réécrire est une décision de données.

## Risques

- **La longueur de la fiche à 320 px.** Le résumé ajoute jusqu'à 14 lignes, si l'on coche tout. Le cas réel compte deux ou trois allergènes. À vérifier à l'œil avec la sélection complète.
- **Le seuil OKLab** est une valeur choisie. Trop bas, il laisse passer une alerte presque volaille ; trop haut, il refusera demain une famille légitime. Il se cale sur l'écart actuel le plus faible, avec une marge.
