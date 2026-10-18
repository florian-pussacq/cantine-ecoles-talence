## Why

L'application n'a qu'une palette, claire. Sur un téléphone réglé en sombre, ce qui est l'usage du soir, au moment où l'on regarde le menu du lendemain, elle s'ouvre comme une page blanche dans une pièce éteinte. L'audit de design (piste 6) l'a relevé et en a proposé une palette sombre.

Deux décisions archivées l'interdisent. D25 (`depouiller-la-coque`) a retiré le thème entier, suivi du système compris. D49 (`menu-en-cartes`) a passé la palette au clair et gardé cette interdiction. `contrast.test.ts` refuse toute trace de `prefers-color-scheme`, et la spec `menu-browsing` exige « une apparence unique ». Ce changement les rouvre en connaissance de cause.

Le moment est le bon. `couleur-par-famille` a réduit le code couleur à cinq familles au lieu de sept rôles et cinq familles, et `vocabulaire-francais` a fixé les noms des jetons à décliner.

## What Changes

- **BREAKING (spec)** : l'application suit la préférence d'apparence du système, claire ou sombre. Elle n'offre toujours aucun réglage propre.
- `tokens.css` reçoit une seconde palette, sous `prefers-color-scheme: dark`, qui redéclare chaque jeton de couleur. C'est le seul endroit autorisé à le faire.
- La palette sombre part de celle de l'audit. Mesurée sur les paires du test de contraste, elle les tient toutes, au plus bas à 6,65:1.
- `contrast.test.ts` mesure les deux palettes au lieu d'interdire la seconde, et refuse une palette sombre incomplète.
- La barre du navigateur suit la palette (`theme-color` par média).

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `menu-browsing` : l'exigence d'accessibilité passe d'une apparence unique à une apparence qui suit le système, sans choix propre à l'application.
- `design-tokens` : deux palettes complètes, mesurées l'une comme l'autre.

## Impact

- `src/lib/design/tokens.css` : le bloc sombre, environ trente déclarations.
- `src/lib/design/contrast.test.ts` : lecture des deux palettes, et levée de l'interdiction dans `tokens.css` seul (les composants restent interdits).
- `src/app.html` : deux `theme-color`.
- e2e : une émulation du thème sombre.
- Aucun JavaScript ajouté : le budget, à 97 %, n'est pas touché.
