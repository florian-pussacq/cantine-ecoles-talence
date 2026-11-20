## Why

Florian l'a demandé : un réglage pour choisir le clair ou le sombre, l'apparence du système restant le défaut.

`mode-sombre` (D1) l'avait écarté pour trois raisons. Deux tiennent toujours, et ce changement y répond. Le coût de premier rendu : un script en ligne pose le choix avant la première peinture, et le JavaScript des écrans de menu ne bouge pas, puisque le module du réglage n'est chargé que par l'écran des réglages. Le cas laissé de côté : un téléphone qui passe en sombre au coucher du soleil, chez un parent qui préfère lire le menu en clair. Il est désormais servi. La troisième raison, « rien n'est fermé », annonçait précisément ce changement.

## What Changes

- **BREAKING (spec)** : l'application offre un choix d'apparence propre, en trois positions : comme l'appareil (le défaut), clair, sombre.
- L'écran des réglages reçoit une section « Apparence ».
- Le choix est stocké dans ce navigateur (`cantine.apparence`). Revenir à « comme l'appareil » efface la clé.
- `app.html` reçoit un second script avant la première peinture, qui pose `data-apparence` sur la racine et ajuste `color-scheme` et les deux `theme-color`.
- `tokens.css` : la palette sombre s'applique sous la requête de média sauf choix « clair », et sous `[data-apparence='sombre']`. Ce second bloc recopie le premier, et `contrast.test.ts` exige les deux identiques.
- Les mentions « Vos données » citent le nouveau réglage.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `menu-browsing` : l'exigence d'accessibilité passe d'« aucun choix propre » à un choix propre dont le défaut suit le système.
- `design-tokens` : la palette sombre est atteignable de deux façons, et ses deux écritures sont gardées identiques.

## Impact

- `src/lib/design/apparence.ts`, `apparence.svelte.ts`, `apparence.test.ts` : nouveaux.
- `src/app.html`, `src/lib/design/tokens.css`, `src/lib/design/contrast.test.ts`.
- `src/routes/reglages/+page.svelte`, `src/routes/a-propos/+page.svelte`.
- `e2e/mode-sombre.spec.ts` : quatre scénarios de plus.
- Budget : le JavaScript de l'écran du jour reste à 58,2 Ko (97 %). Celui des réglages passe à 45,8 Ko. Chaque document porte environ 300 octets de script en plus.
