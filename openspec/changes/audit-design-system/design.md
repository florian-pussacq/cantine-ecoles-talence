## Contexte

`tokens.css` déclare les jetons sur `:root`, avec un palier `@media` pour l'écran large qui fait monter l'échelle typographique et les illustrations d'un cran. `contrast.test.ts` lit déjà ce fichier pour croiser vingt paires de couleurs : le principe d'un test qui lit le CSS est établi dans le dépôt.

Le relevé a été fait par un script qui tient compte des noms construits — `var(--fam-${famille})`, `var(--role-{slot})`. Une recherche littérale aurait déclaré mortes les dix couleurs de famille et `--role-gouter`, qui sont toutes utilisées.

## Décisions

### D1 — Un test qui lit les styles, plutôt qu'une règle de lint

**Retenu :** `src/lib/design/design-tokens.test.ts` extrait les blocs `<style>` des `.svelte` et les feuilles `.css` hors `tokens.css`, et refuse, pour `font-size`, `border-radius`, `color`, `background` et `border-color`, toute valeur littérale qui n'est ni un jeton ni une exception listée.

**Écarté :** un greffon Stylelint. Il ferait mieux le travail d'analyse, mais ajouterait une dépendance et une configuration pour trois propriétés. Le test vit à côté de `contrast.test.ts`, dans la même langue, et son message d'échec peut dire quel jeton employer.

Les exceptions sont une liste explicite dans le test, chacune avec sa raison : `50%` (un disque n'est pas un rayon de l'échelle), `0`, `inherit`, `transparent`, `currentColor`, `none`.

### D2 — Ramener à l'existant d'abord, créer ensuite

Une valeur qui double un jeton prend ce jeton : `999px` devient `--radius-pilule`, `16px` devient `--radius-carte`. `11px` sur la semaine devient `--radius-pastille` (10 px) : un pixel ne porte aucune intention.

Une valeur qui n'a pas d'équivalent et qui a un sens reçoit un jeton nommé par ce sens : `--radius-feuille` (20 px, le haut de la fiche), `--voile` (le fond derrière la fiche).

### D3 — Un cran sous `--text-xs`, à 10 px

Les capsules de qualité et la marque « Aujourd'hui » sont des étiquettes en capitales, serrées dans une carte. Les passer à `--text-xs` (11 px) risque de faire passer une carte sur deux lignes à 320 px ; les laisser à 9 px laisse un texte qu'on lit mal.

**Retenu :** un cran `--text-2xs`, `0.625rem` (10 px), et `0.6875rem` au palier large, pour qu'il suive l'échelle comme les autres. Les cinq usages à 9 et 10 px le prennent ; les trois à `0.75rem` prennent `--text-xs`, dont c'est la valeur au palier large et dont ils doivent suivre le palier.

À vérifier à l'œil à 320 px, avec les libellés les plus longs du corpus.
