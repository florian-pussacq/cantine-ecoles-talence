## Why

L'écran du jour donne la même carte pleine — pastille, nom, vignette de 68 px — à un plat servi, à un rôle absent et au goûter. Un jour sans laitage, la carte « Pas de laitage ce jour » occupe autant de hauteur qu'un rôti de bœuf. Le goûter, servi l'après-midi, prend lui aussi une carte complète sous le déjeuner. Il faut faire défiler six ou sept cartes pour voir le dessert, et l'œil donne le même poids à ce qui est servi et à ce qui ne l'est pas.

Décision prise le 17 octobre 2026 sur l'audit du système de design : direction « Affinée » pour l'écran du jour, avec un emprunt à « Express » — les rôles absents et le goûter en lignes compactes, les plats servis en cartes.

## What Changes

- Un rôle du déjeuner sans plat devient une ligne compacte : son glyphe, son libellé, l'énoncé de l'absence, sur une seule ligne et sans vignette.
- Le goûter devient une ligne compacte, toujours séparé du déjeuner et toujours une cible qui ouvre la fiche du jour.
- Les plats servis gardent leur carte, et le plat principal sa couleur de famille.

## Capabilities

### Modified Capabilities

- `menu-browsing` : un rôle absent n'est plus une carte mais une ligne compacte ; le goûter se présente en ligne compacte.

## Impact

- **Composants** : `PlatCarte` (une forme compacte), `Tray`, l'écran du jour.
- **Hauteur** : un jour à deux rôles absents perd environ deux hauteurs de carte ; le dessert remonte.
- **Tests** : `Tray.test.ts`, `hauteur.spec.ts` (la première carte reste visible), `couche-modale.spec.ts` (le goûter reste une cible qui rend le focus).
- **Budget** : du CSS et une branche de gabarit ; pas de JavaScript notable.
