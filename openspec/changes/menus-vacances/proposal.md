## Why

La Ville publie, à côté des mensuels, un menu de la restauration municipale pour chaque période de vacances : Toussaint, du 19 au 30 octobre 2026 ; Noël, du 21 décembre au 1er janvier. L'application les ignore. Pendant les vacances, elle saute au prochain jour d'école et annonce « Prochain service · dans 16 jours », alors qu'un menu existe.

Le périmètre a été accepté le 16 octobre 2026 : ces menus entrent dans l'application, présentés comme des menus de vacances et non comme des jours d'école.

## What Changes

- Un menu de vacances est un fichier de menu ordinaire, nommé `AAAA-MM-vacances.json` d'après son mois majoritaire, qui porte l'intitulé du document (« Vacances de Toussaint »).
- Le manifeste l'inscrit avec une nature nouvelle, `vacation`, et le nom de son fichier.
- Le parser lit l'intitulé dans l'en-tête du document.
- L'écran du jour et l'écran de la semaine nomment les vacances sur leurs jours.
- Publication de la Toussaint et de Noël 2026. La Toussaint ne précisant pas ses allergènes, elle s'appuie sur `allergenes-non-communiques`, appliqué avant.

## Capabilities

### Modified Capabilities

- `menu-data` : un second type de document daté, le menu de vacances, et sa place au manifeste.
- `menu-browsing` : un jour de vacances se présente comme tel.

## Impact

- **Pas de montée de `schemaVersion`** : deux champs facultatifs (`title` dans un fichier de menu, `file` au manifeste) et une valeur de nature que toute version antérieure écarte d'elle-même.
- **Données** : `2026-10-vacances.json`, `2026-12-vacances.json`.
- **Skill `menus-talence`** : les PDF de vacances se traitent comme les mensuels.
