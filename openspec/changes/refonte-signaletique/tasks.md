# Tasks

## 1. Polices

- [x] 1.1 Copier `funnel-sans-latin-wght-normal.woff2` et `funnel-display-latin-wght-normal.woff2` depuis `@fontsource-variable/funnel-sans` et `@fontsource-variable/funnel-display` (épinglés en dépendances de développement) dans `src/lib/design/polices/`, avec la licence OFL ; vérifier que `npm run build` émet deux fichiers woff2 empreintés dans `immutable`
- [x] 1.2 `tokens.css` : deux `@font-face` (`font-display: swap`, plage latine), les jetons `--police-texte` et `--police-affichage`, chacun avec sa pile de repli système aux métriques ajustées (D4) ; vérifier au rendu qu'il n'y a ni texte invisible ni saut notable entre repli et police
- [x] 1.3 `hooks.server.ts` : précharger les deux polices par l'option `preload` de `resolve` ; vérifier dans le HTML pré-rendu la présence des deux `<link rel="preload" as="font" crossorigin>`
- [x] 1.4 `design-tokens.test.ts` : refuser une famille de police nommée dans un composant (exigence « Les polices viennent de l'application ») ; vérifier que le test échoue sur `font-family: 'Funnel Sans'` dans un composant de test
- [x] 1.5 `check-budget.js` : un budget de polices de 40 Ko qui nomme chaque fichier et son poids, et fait échouer la construction s'il est dépassé ; vérifier en abaissant temporairement le seuil que le build échoue avec ce message
- [x] 1.6 e2e `offline.spec.ts` : hors ligne après une première visite, le texte est rendu en Funnel Sans (`document.fonts.check`) et aucune police n'est demandée à un domaine tiers

## 2. Palettes et jetons

- [x] 2.1 `contrast.test.ts` : remplacer les paires « anneau sur teinte pâle » par « texte sur l'aplat de famille » à 4,5:1 dans les deux palettes ; ajouter la paire de sélection (`::selection`) ; vérifier que le test échoue sur les valeurs actuelles des familles sombres, encore claires
- [x] 2.2 `tokens.css`, palette claire : les valeurs de D2 (fond, carte, encre, encre douce, bord, accent égal à l'encre, alerte jaune avec `--sur-alerte`) ; ajuster les surfaces info et événement pour qu'elles tiennent leurs seuils ; vérifier `contrast.test.ts` en vert
- [x] 2.3 `tokens.css`, palette sombre : les valeurs de D3 (familles en tons profonds, `--sur-famille` blanc dans les deux palettes) ; vérifier `contrast.test.ts` en vert, et « l'alerte ne ressemble à aucun plat » en vert (sinon le jaune passe à `#F2D50F`, selon les risques de `design.md`)
- [x] 2.4 `tokens.css` : l'échelle de D5 (13 à 96 px, plafond de 6rem, `tabular-nums` sur les chiffres), des rayons ramenés à 8 et 4 pixels, les jetons de la barre (`--barre`, `--barre-reserve`) à la place de ceux du pied (D11) ; vérifier `design-tokens.test.ts` en vert, et qu'aucun texte n'est sous le plus petit cran
- [x] 2.5 `tokens.css` : `::selection`, `caret-color`, `:focus-visible` et le soulignement des liens par jetons, dans chaque palette (D12) ; vérifier en e2e, sous `colorScheme: 'dark'`, que la sélection prend les couleurs de la palette sombre
- [x] 2.6 `static/404.html`, `app.html` (`theme-color` par média) et `manifest.webmanifest` : reprendre les nouvelles valeurs ; retirer le surtitre (`.eyebrow`) de la 404 ; vérifier le test « La page autonome reprend les jetons »

## 3. Coque : enseigne, barre basse, mentions

- [x] 3.1 `+layout.svelte` et `Onglets.svelte` : la barre Jour/Semaine ancrée en bas, bornée à la colonne, avec la compensation de zone sûre et l'onglet actif souligné d'un trait de 3 pixels (D11) ; retirer le pied fixe ; adapter `coque.spec.ts` et `large.spec.ts` aux scénarios « Zone sûre inférieure » et « Barre sur écran large »
- [x] 3.2 `PiedSource.svelte` : la provenance (« Menus mis à jour le… · PDF officiel ») suivie du lien vers les mentions, dans le flux des deux écrans de menu ; un lien vers les mentions dans l'écran des réglages ; e2e : les scénarios « Les mentions depuis un écran de menu » et « Les mentions depuis les réglages »
- [x] 3.3 `Enseigne.svelte` et `EnTete.svelte` : l'enseigne « Cantine Talence », la commande des réglages portant le compte des allergènes surveillés, sans marque quand la sélection est vide ; vérifier les tests existants de « Visibilité du filtre actif » et « L'en-tête ne change pas de hauteur »

## 4. Écran du jour

- [x] 4.1 `RangNavigation.svelte` : `‹` à gauche, `›` à droite, et entre elles le titre (grand chiffre en Display, jour et mois) puis la mention, avec l'étiquette « Aujourd'hui » en inversion (D6) ; vérifier `aujourdhui.spec.ts`, `retour.spec.ts` et « un seul titre de premier niveau »
- [x] 4.2 `Bandeau.svelte` : les trois tons en étiquette compacte suivie d'une ligne, et l'ordre événement, alerte, info inchangé (D8) ; vérifier `Bandeau.test.ts` et `vacances.spec.ts`, en particulier le scénario « Un jour de vacances sans allergènes précisés »
- [x] 4.3 `PlatCarte.svelte` : le plat principal sur l'aplat de sa famille, avec le nom en Display, « Plat principal · Famille » et l'illustration sur un disque à la teinte pâle ; supprimer le liseré ; un plat inclassable porte le gris de repli sans nom de famille ; tests de composant des scénarios « Le plat principal porte sa famille » et « Plat principal inclassable »
- [x] 4.4 `ListeDuJour.svelte` : le plat principal en tête, puis les autres rôles en lignes sur une grille rôle, plat et vignette ; la ligne compacte d'un rôle absent ; aucun libellé au-dessus d'un nom ; supprimer `PastilleRole.svelte` ; adapter `ListeDuJour.test.ts` aux exigences « Le déjeuner, un élément par rôle », « Les autres rôles en lignes » et « Le déjeuner est une seule cible »
- [x] 4.5 `PastilleAllergene.svelte` : la surface d'alerte et l'encre noire, les pictogrammes (trois au plus) et les noms (D9) ; vérifier `PastilleAllergene.test.ts`, et la lisibilité en niveaux de gris en e2e (`fiche-allergenes.spec.ts`)
- [x] 4.6 Le goûter en ligne compacte, séparé du déjeuner par un filet d'encre, et toujours cible distincte ; vérifier le scénario « Le goûter ouvre la journée »
- [x] 4.7 `FicheJour.svelte` : l'ordre de l'écran (plat principal en tête), et l'habillage aux nouveaux jetons ; adapter `FicheJour.test.ts` (« Correspondance des ordres ») et vérifier `couche-modale.spec.ts`
- [x] 4.8 `hauteur.spec.ts` : remplacer « la première carte est visible » par « le plat principal est visible d'emblée » à la plus petite fenêtre, et vérifier qu'un jour ordinaire (2 novembre 2026) tient en entier à 390 × 844 pixels

## 5. Écran de la semaine

- [x] 5.1 `semaine/+page.svelte` : une tuile de 56 pixels par jour (couleur de famille, jour abrégé, quantième en Display) ; plat principal, puis « Famille · » et les autres plats ; pastille d'allergène ; plus de légende (D10) ; vérifier `famille.spec.ts` et le nouveau scénario « La famille se lit sans la couleur »
- [x] 5.2 Les jours non servis (férié, sans école, non publié) en tuile pointillée sans aplat, et le jour courant marqué de l'étiquette « Aujourd'hui », sans contour ; vérifier `feries.spec.ts`, `week-end.spec.ts` et le scénario « Jour non servi »
- [x] 5.3 Le titre de la semaine (intervalle en Display et mois) tient sur une ligne, de 320 pixels au bureau ; vérifier le scénario « Période de la semaine »

## 6. Écrans secondaires

- [x] 6.1 Réglages, grève et À propos : appliquer les jetons, la typographie et le lien des mentions ; aucun surtitre ni carte imbriquée ; vérifier `greve.spec.ts` et `qualite.spec.ts` (cibles de 44 pixels)

## 7. Intégration

- [ ] 7.1 `mode-sombre.spec.ts` et `premier-rendu.spec.ts` : les deux palettes dès la première peinture, et aucun déplacement à l'hydratation, police comprise
- [ ] 7.2 Contrôle visuel en clair et en sombre, à 320 pixels, 390 pixels et sur bureau : jour ordinaire, vacances avec allergènes non précisés, férié, week-end, mois non publié, fiche ouverte, filtre actif, réglages, grève, 404 ; comparer à la maquette A2 et aux écarts listés dans `design.md`
- [ ] 7.3 Passer `npm run validate && npm run build` (budgets, polices comprises) et `npm run test:e2e` en vert

## Workflow follow-up

- Commits en Conventional Commits français, sans pousser : la poussée et `publier` restent le geste de l'humain.
- Archiver le changement une fois vérifié (`/opsx:verify` puis `/opsx:archive`), en reportant les décisions D52 annulée et D31 rétablie dans la note d'archive.
