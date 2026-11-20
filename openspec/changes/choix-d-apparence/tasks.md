## 1. Tests d'abord

- [x] 1.1 `apparence.test.ts` : lecture et écriture du choix, stockage absent ou refusant ; parité du script de `app.html` avec `appliquerApparence` (D2)
- [x] 1.2 `contrast.test.ts` : un seul attribut de choix, deux écritures du sombre identiques, toutes deux après `:root` ; `data-apparence` interdit aux composants (D1)
- [x] 1.3 e2e : défaut sur « comme l'appareil » ; sombre choisi sous un système clair, survivant au rechargement et sans le JavaScript de l'application ; clair choisi sous un système sombre ; retour au défaut

## 2. Mise en œuvre

- [x] 2.1 `apparence.ts` et `apparence.svelte.ts` (D1, D3, D4)
- [x] 2.2 `app.html` : `data-palette` sur les `theme-color`, second script avant la première peinture (D2, D3)
- [x] 2.3 `tokens.css` : `:root:not([data-apparence='clair'])` sous la requête, et `:root[data-apparence='sombre']` (D1)
- [x] 2.4 Réglages : section « Apparence » ; mentions « Vos données »

## 3. Vérification

- [x] 3.1 Contrôle visuel des réglages, sombre choisi sous un système clair, 390 px
- [x] 3.2 `npm run validate`, `npm run build` (budgets) et `npm run test:e2e`
