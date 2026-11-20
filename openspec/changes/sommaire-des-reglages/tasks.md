## 1. Tests d'abord

- [x] 1.1 e2e `coque.spec.ts` : `/reglages/allergenes` dans les tables d'écrans, sa sortie « Retour aux réglages » mène à `/reglages`, sans choix jour/semaine (D4)
- [x] 1.2 e2e : le sommaire présente Apparence, Allergènes, Menus, Application dans cet ordre, et tient dans 390 × 844 sans défiler (D1)
- [x] 1.3 e2e : la ligne des allergènes nomme la sélection et son compte, dit « Aucun allergène surveillé » sans sélection, et mène à l'écran dédié (D3)
- [x] 1.4 e2e : les scénarios qui cochent des allergènes passent sur `/reglages/allergenes` ; `mesure`, `qualite`, `large` couvrent le nouvel écran
- [x] 1.5 e2e `mode-sombre.spec.ts` : les trois choix d'apparence restent des boutons radio nommés, au clavier compris (D2)

## 2. Mise en œuvre

- [x] 2.1 `reglages/allergenes/+page.svelte` : la section des allergènes, déplacée telle quelle (D4)
- [x] 2.2 `+layout.svelte` : entrées `TITRES` et `SORTIES` (D4)
- [x] 2.3 `reglages/+page.svelte` : sommaire, apparence en rangée de trois choix, ligne résumant les allergènes (D1, D2, D3)

## 3. Vérification

- [x] 3.1 Contrôle visuel du sommaire et de l'écran des allergènes, clair et sombre, 390 px et 320 px
- [x] 3.2 `npm run validate`, `npm run build` (budgets) et `npm run test:e2e`
