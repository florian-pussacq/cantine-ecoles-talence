## Why

Le système de design tient en un fichier, `src/lib/design/tokens.css` : 52 jetons de couleur, de typographie, d'espacement, de rayon et d'illustration, et un palier pour l'écran large. Un seul garde-fou le surveille, `contrast.test.ts`, qui mesure les contrastes. Rien ne vérifie que les composants passent par les jetons.

Relevé du 17 octobre 2026 :

- **Huit tailles de police écrites en dur**, dont trois à `0.5625rem` (9 px) — les capsules de qualité (« Bio », « Label rouge ») de la carte et de la fiche, et la marque « Aujourd'hui » de la semaine. C'est sous le plus petit cran de l'échelle (`--text-xs`, 11 px), et ces tailles ne suivent pas le palier de l'écran large.
- **Dix rayons écrits en dur** : sept `999px` qui doublent `--radius-pilule`, un `16px` qui double `--radius-carte`, et deux valeurs sans jeton (`20px` en haut de la fiche, `11px` sur la semaine).
- **Une couleur écrite en dur** : le voile de la fiche, `rgb(0 0 0 / 0.45)`.
- **Un commentaire faux** dans `contrast.test.ts` : il dit couvrir `var(--on-table)`, retiré depuis, alors que le contrôle cherche `var(--ink)`. (Un second le cite, mais comme un rappel historique exact.)

Aucun de ces écarts n'est grave seul. Ensemble, ils montrent qu'un jeton se contourne sans que rien ne le signale, et qu'un texte de 9 px est passé trois fois.

## What Changes

- Chaque écart relevé est ramené à un jeton existant, ou à un jeton nouveau quand la valeur a un sens propre : un cran `--text-2xs` pour les capsules, un rayon de feuille, un voile.
- Les textes de 9 px passent au moins à 10 px, et suivent le palier de l'écran large.
- Un test, `design-tokens.test.ts`, lit les styles des composants et refuse une taille de police, un rayon ou une couleur écrits en dur, hors d'une liste d'exceptions justifiées (`50%`, `0`, `inherit`…).
- Le commentaire faux est corrigé.

Hors périmètre : refondre la palette, l'échelle ou l'espacement ; juger les choix esthétiques. L'audit ramène le code au système, il ne réécrit pas le système.

## Capabilities

### New Capabilities

- `design-tokens` : les valeurs visuelles des composants proviennent des jetons, et un test le garantit.

### Modified Capabilities

Aucune.

## Impact

- **Composants** : `PlatCarte`, `DaySheet`, `AllergenChip`, `CommandeReglages`, l'écran de la semaine, les réglages.
- **Rendu** : les capsules et la marque « Aujourd'hui » grandissent de 9 à 10 px — à vérifier à 320 px, où la carte est la plus serrée. Le pied de la fiche et les mentions légales gagnent un pixel, la ligne secondaire de la semaine en perd un (design, D3). Le reste ne bouge pas au pixel près.
- **Tests** : un fichier de plus dans `src/lib/design/`, à côté de `contrast.test.ts`.
