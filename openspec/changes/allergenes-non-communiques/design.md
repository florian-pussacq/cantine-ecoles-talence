## Contexte

Mesuré sur `10-MENUS-WEB-TOUSSAINT-2026-1.pdf` : dix jours, une soixantaine de plats, un seul code par jour — le `1` du pain. Le PDF de Noël, du même gabarit, porte ses codes plat par plat. Les mensuels aussi.

## Décisions

### D1 — Une propriété du document, pas de chaque plat

**Retenu :** `source.allergensDeclared`, booléen facultatif ; absent vaut vrai.

**Écarté :** `allergens: null` par plat. C'est la représentation la plus fine, mais l'absence est ici une propriété du document entier, et `null` là où un tableau était garanti casse toute version en cache — d'où une montée de `schemaVersion` qui ferait refuser tous les mois à ces versions. Un champ facultatif ajouté ne change pas la version, et une version qui l'ignore reste exacte.

### D2 — La règle d'extraction : rien hors du pain

Le parser pose `allergensDeclared: false` quand aucun plat autre que le pain ne porte de code. La règle « aucun code dans le document » ne verrait pas la Toussaint, dont le pain porte le gluten.

Un plat isolé sans code dans un document qui en porte ailleurs n'est pas un signal : il peut ne contenir aucun allergène déclarable. La règle ne regarde donc que le document entier.

### D3 — Dire ce qu'on ignore, à la place où l'on se taisait

Pour un jour dont la source ne déclare pas ses allergènes :

- l'écran du jour porte un avertissement, à la place et dans la forme de l'avertissement de confiance faible, avec le lien vers le PDF officiel ;
- si des allergènes sont surveillés, l'avertissement le dit : ils ne peuvent pas être signalés pour ce jour ;
- le détail de la journée écrit « Allergènes non communiqués » plat par plat, sauf pour un plat qui porte des codes (le pain) ;
- l'écran de la semaine marque le jour d'une mention courte, « Allergènes non précisés ».

L'incertitude se voit autant qu'une alerte, jamais moins : c'est le seul cas où le filtre parle sans qu'aucun plat ne corresponde.
