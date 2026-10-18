## Why

L'interface se pense en français : on parle de carte, de creux, de pastille, de fiche. Le code qui la dessine mélange deux langues. `--fond`, `--carte`, `--creux` et `--poids-*` côtoient `--ink`, `--chip`, `--shell`, `--touch` et `--warn`. `PlatCarte`, `Bandeau` et `Onglets` côtoient `Tray`, `DaySheet` et `AllergenChip`. Chaque nouveau jeton oblige à choisir une langue, et `fermer-les-echelles` a déjà dû l'écrire en toutes lettres (D1) pour ne pas créer de l'anglais à renommer plus tard.

Le mélange a un coût de lecture concret. `Tray` désigne un plateau qui n'existe plus dans l'interface depuis `enseigne-et-ardoise`. Et « ce qui se pose sur une surface » s'écrit de trois façons : `--on-accent`, `--warn-on`, `--evenement-on`.

Les changements 14a à 14c sont archivés, il ne reste donc plus de jeton promis à la suppression. C'était la condition posée par le backlog (entrée 15).

## What Changes

- Les jetons de `tokens.css` et le jeton local `--ring` se nomment en français, y compris les échelles (`--space-*`, `--text-*`, `--radius-*`, `--font`).
- Un seul motif pour la couleur posée sur une surface : `--sur-<surface>`.
- La page autonome `static/404.html` suit les mêmes noms.
- Les quatre composants nommés en anglais prennent un nom français, avec leurs tests : `Tray`, `DaySheet`, `AllergenChip`, `ExternalLink`.
- La vérification des jetons refuse un nom anglais connu, pour que le mélange ne revienne pas.
- Aucun changement visible : l'application rendue est identique au pixel près.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `design-tokens` : les jetons se nomment en français, et la vérification refuse les racines anglaises qu'ils portaient.

## Impact

- `src/lib/design/tokens.css` et tous les styles qui citent un jeton : environ 330 occurrences, mécaniques.
- `src/lib/design/contrast.test.ts` et `design-tokens.test.ts`, qui citent les jetons par leur nom.
- Quatre composants et leurs imports (10 fichiers), deux fichiers de test renommés.
- `static/404.html`, et un commentaire de `scripts/make-icons.py`.
- Hors périmètre : le contrat de données, les identifiants TypeScript du domaine et les classes CSS (voir design, D1).
