## Why

Le menu des vacances de la Toussaint 2026 ne déclare aucun allergène, hormis le gluten du pain. Le parser écrit alors une liste vide pour chaque plat, et l'application la lit comme elle doit lire une liste vide : « aucun allergène déclaré ». C'est littéralement vrai, et c'est trompeur. Un parent qui surveille le lait voit des lasagnes et un fromage blanc sans la moindre alerte, parce que le filtre se tait.

Plat par plat, l'interface est déjà honnête : elle écrit « Aucun allergène déclaré », jamais « sans allergène ». Ce qui manque, c'est de savoir que **le document entier** ne déclare rien, et de le dire.

## What Changes

- Le contrat de données gagne un champ facultatif, `source.allergensDeclared`. Faux, il signifie que le document ne précise pas les allergènes de ses plats. Absent, il vaut vrai.
- Le parser le pose à faux lorsqu'aucun plat autre que le pain ne porte de code d'allergène.
- La validation refuse un document qui se déclare sans allergènes tout en portant des codes hors du pain.
- L'écran du jour et l'écran de la semaine signalent un jour dont les allergènes ne sont pas précisés. Le détail d'un plat dit « Allergènes non communiqués » au lieu de « Aucun allergène déclaré ». Avec une sélection active, l'application dit qu'elle ne peut rien signaler, au lieu de se taire.

## Capabilities

### Modified Capabilities

- `menu-data` : un document peut déclarer qu'il ne précise pas les allergènes.
- `allergen-filter` : le filtre ne se tait jamais sur un menu dont il ignore les allergènes.

## Impact

- **Pas de montée de `schemaVersion`** : un champ facultatif (`docs/schema.md`, Compatibilité). Une version en cache l'ignore et continue d'écrire « Aucun allergène déclaré », ce qui reste exact.
- **Données** : aucun fichier publié ne change ; tous les mensuels déclarent leurs allergènes. Le premier concerné sera la Toussaint, via `menus-vacances`.
