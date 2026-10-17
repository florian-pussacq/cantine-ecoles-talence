## Why

`audit-design-system` a ramené aux jetons les tailles de police, les rayons et le voile de la fiche, et un test les garde. L'audit du système de design (artefact « Audit design de la cantine », piste 3, plan d'action étape 2) laissait trois échelles ouvertes, que rien ne garde :

- **Les graisses** : 50 déclarations de quatre valeurs (600 ×20, 700 ×16, 800 ×14, 400 ×1), toutes écrites en dur.
- **Les voiles** : cinq `color-mix(in srgb, var(--ink) N%, transparent)` dans cinq composants, à quatre taux (12, 22, 55, 72 %). Le même rôle visuel se recopie d'un fichier à l'autre, et `contrast.test.ts` doit retrouver chaque taux dans le code pour le mesurer.
- **Le mouvement** : la fiche du jour s'ouvre en `180ms ease-out`, écrit en dur, à côté de `--glisse`.

La vérification de l'audit (17 octobre 2026) a aussi trouvé des trous dans le garde-fou lui-même :

- `tokens.css` est exclu en entier, alors que ses règles de base portent deux valeurs en dur. `body { font-size: 16px }` est hors échelle et ne suit pas le palier large : le lien « Menu de grève » des réglages en hérite (16 px sur téléphone, où le cran voisin est à 15). Le focus porte `border-radius: 4px`.
- Les raccourcis `border:`, `outline:`, `box-shadow:` et `font:` ne sont pas lus, ni les attributs `style=`. Aujourd'hui rien n'y est écrit en dur, mais rien n'en empêche le retour.
- Deux `4px` doublent `--space-1`, et le commentaire du test dit les espacements « sans échelle » alors que `--space-1` à `--space-5` existent.

## What Changes

- **Graisses** : `--poids-moyen` (600), `--poids-fort` (700), `--poids-titre` (800). Le mot-clé `normal` (400) est admis comme exception, au même titre que `inherit`.
- **Voiles** : `--voile-fond` (12 %, l'aplat de la pilule d'onglets), `--voile-trait` (55 %, la bordure des commandes) ; `--voile` devient `--voile-modale`. Les textes atténués par transparence (72, 75 et 80 %) passent à `--ink-muted`, et le filet décoratif à 22 % passe à `--bord`.
- **Mouvement** : `--courbe` (`ease-out`) et `--apparition` (180 ms), à côté de `--glisse`.
- **Règles de base** : `body` prend `var(--text-base)`, et le focus prend un nouveau rayon `--radius-focus`.
- **Espacements** : les deux `4px` prennent `--space-1`. Le reste, sous `--space-1`, reste permis, et le commentaire du test dit pourquoi.
- **Garde-fou** : `design-tokens.test.ts` surveille aussi `font-weight`, les durées et les courbes de transition et d'animation, les couleurs dans les raccourcis, les attributs `style=`, et les règles de base de `tokens.css`. `contrast.test.ts` lit désormais les voiles dans `tokens.css`.

Hors périmètre :
- les anneaux et filets tracés en `box-shadow` : l'audit les comptait comme cinq « ombres », mais ce ne sont pas des ombres (design, D4) ;
- le `line-height: 17px` de la pastille de compte (design, D5) ;
- le plancher de texte : on garde 10 px, décision du 17 octobre 2026 ;
- le mélange `--role` à 12 % de `PlatCarte`, qui disparaît avec le code couleur unique (backlog, entrée 14).

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `design-tokens` : l'exigence « Les valeurs visuelles viennent des jetons » s'étend aux graisses, aux voiles et au mouvement, et couvre les règles de base de la feuille de jetons.

## Impact

- **Jetons** : `src/lib/design/tokens.css`, avec sept jetons de plus, un renommé et deux règles de base corrigées.
- **Composants** : environ quinze fichiers `.svelte` pour les graisses. Pour les voiles : `Onglets`, `greve`, `PiedSource`, `CommandeSortie`, `RangNavigation`, `Enseigne`, `DaySheet`. Pour les espacements : `Onglets`, `CommandeReglages`.
- **Tests** : `design-tokens.test.ts`, qui surveille plus de propriétés et lit plus de sources, et `contrast.test.ts`, où les voiles sont lus dans les jetons et la ligne des 72 % disparaît.
- **Rendu** : trois écarts visibles, tous mineurs.
  - Le nom de l'enseigne, le pied de source, le détail non publié et deux mentions passent du gris d'encre transparente au brun de `--ink-muted` (design, D2). Le lien du pied de source reprend l'encre pleine.
  - Le filet du pied de source s'éclaircit (de `#c8c0b2` environ à `--bord`, `#ddd0b8`).
  - Le lien « Menu de grève » passe de 16 à 15 px sur téléphone.

  Rien d'autre ne bouge au pixel près.
