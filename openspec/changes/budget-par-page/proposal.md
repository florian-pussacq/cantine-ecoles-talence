## Why

Le budget JavaScript est à 97 % : 57,9 Ko gzip pour un plafond de 60 Ko. Mais il additionne **tout** le JavaScript émis, toutes pages confondues, alors qu'une page n'en charge qu'une partie. L'écran du jour, celui qu'on ouvre le soir, charge 48,4 Ko ; le code des réglages, de la grève et de l'à-propos ne le ralentit pas.

La mesure confond deux questions, et répond mal à chacune :

- **ce qui retarde l'affichage** — le JavaScript d'une page, que le PRD vise en plaçant « bundle JS < 60 Ko » à côté de « LCP < 1 s en 4G » ;
- **ce que coûte le hors-ligne** — tout ce que le service worker précharge à la première visite et à chaque déploiement, que le PRD exige par ailleurs (« 100 % fonctionnelle après une première visite »).

Et elle récompense mal : charger la fiche à la demande, ou ajouter une page rarement vue, ne change rien au compteur, puisque le code est toujours émis. Seule la suppression le fait baisser.

## What Changes

- **Par page** : le JavaScript que charge chaque page pré-rendue reste sous **60 Ko** gzip, et son premier chargement (HTML, CSS et JavaScript de cette page) sous **150 Ko**.
- **Somme** : tout le JavaScript émis, que le service worker précharge, reste sous **80 Ko** gzip.
- Le JavaScript d'une page se lit dans ce que le build a produit : les modules que la page nomme, et leurs imports statiques d'après le manifeste de Vite. Rien n'est simulé.
- Le rapport du build nomme la page la plus lourde et le module le plus lourd en cas de dépassement.
- La ligne du PRD §8 est précisée dans le même sens.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `offline-app` : l'exigence « Budgets de performance » distingue le JavaScript d'une page de la somme préchargée.

## Impact

- `scripts/check-budget.js` : la mesure par page, et deux budgets nommés.
- `PRD-menus-talence.md` §8 : la ligne des budgets.
- Aucun changement de l'application : 48,4 Ko pour la page la plus lourde, 57,9 Ko pour la somme, au 18 octobre 2026.
