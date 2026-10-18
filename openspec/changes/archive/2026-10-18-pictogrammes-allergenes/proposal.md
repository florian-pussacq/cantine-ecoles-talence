## Why

La pastille d'allergène ne dessine que le pictogramme du premier code signalé (`codes[0]`). Un plat qui contient des œufs et du lait, chez un parent qui surveille les deux, s'affiche « Contient : œufs, lait » sous le seul pictogramme de l'œuf. Le texte est juste, mais le dessin en dit moins que lui, et c'est le dessin que l'œil attrape en premier.

Le backlog (item 14c) situait le défaut sur l'écran de la semaine. Il est en fait dans `AllergenChip`, donc présent partout : sur les cartes du jour comme sur les lignes de la semaine.

Le corpus montre que le cas n'a rien de marginal : un plat déclare jusqu'à six allergènes (cake maison du 1ᵉʳ octobre 2026), une journée jusqu'à neuf, et 93 jours sur 110 en déclarent au moins cinq.

## What Changes

- La pastille dessine un pictogramme par allergène signalé, dans l'ordre où le texte les nomme, et trois au plus.
- Au-delà de trois, les pictogrammes s'arrêtent et le texte continue : il reste la liste complète, la seule que lisent les technologies d'assistance.
- Le changement vaut pour les deux écrans, puisqu'ils partagent le composant.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `allergen-filter` : le signalement porte un pictogramme par allergène signalé, trois au plus.

## Impact

- `src/lib/menu/AllergenChip.svelte` : le pictogramme unique devient une suite plafonnée.
- `src/lib/menu/AllergenChip.test.ts` : un pictogramme par code, plafond, ordre.
- Largeur de la pastille sur la semaine à 320 px : à contrôler, c'est le seul risque de mise en page.
- Aucun changement de données, de jeton ni de dépendance.
