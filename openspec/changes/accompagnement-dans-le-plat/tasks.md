## 1. Libellés et composition

- [x] 1.1 `labels.test.ts` : écrire d'abord les cas, et vérifier qu'ils échouent.
  - `intitulePlat()` (D1) : colin et purée donne deux parties, la seconde accessoire et en minuscule initiale ; un plat sans accompagnement donne une seule partie ; un sigle en tête d'accompagnement garde sa casse.
  - `accrocher()` (D4) : « Poêlée de légumes » donne `debut` « Poêlée de » et `dernierMot` « légumes » ; un mot seul donne un `debut` vide.
  - `estMarque()` : vrai pour `bio` et `label-rouge`, faux pour les huit autres mentions.
- [x] 1.2 `labels.ts` : `intitulePlat()`, `accrocher()`, `QUALITY_MARKS` et `estMarque()`. `LUNCH_SLOTS` devient `plat, accompagnement, entree, laitage, dessert, pain` (D2) ; mettre à jour son commentaire. Retirer la formulation d'absence de l'accompagnement. Vérifier `labels.test.ts` en vert.

## 2. Les pictogrammes

- [x] 2.1 `sprite.svg` : dessiner `marque-bio` (feuille stylisée) et `marque-label-rouge` (sceau rond « LR »), à partir de la maquette. Le dessin évite le vert de la famille végétarienne (D5).
- [x] 2.2 `tokens.css` : `--marque-fond`, `--marque-bio` et `--marque-label-rouge` dans les deux palettes, la pastille restant claire en sombre (D5). `contrast.test.ts` : chaque dessin à 3:1 au moins sur sa pastille, dans chaque palette. Vérifier `contrast.test.ts` et `design-tokens.test.ts` en vert.
- [x] 2.3 `MarqueQualite.svelte` et son test : `role="img"`, `aria-label` et `<title>` portant le nom de la mention, taille en `em`, filet `--bord` en option pour les surfaces claires. Le test vérifie le nom accessible et l'absence d'`aria-hidden`.
- [x] 2.4 Un composant ou un snippet `NomQualifie` : il rend `accrocher(texte)`, le dernier mot et ses pictogrammes dans un `span` insécable, et les mentions qui ne sont pas des marques en texte. Le jour, la semaine et la fiche le partagent.

## 3. L'écran du jour

- [x] 3.1 `ListeDuJour.test.ts` et `PlatCarte.test.ts` (à créer) d'abord, puis vérifier qu'ils échouent :
  - un jour avec accompagnement rend un seul aplat dont l'intitulé réunit les deux noms, et aucune ligne « Accompagnement » ;
  - un plat complet ne rend aucune absence d'accompagnement ;
  - la ligne sous l'intitulé ne contient que la famille ;
  - le pictogramme suit le nom qu'il qualifie ;
  - l'esperluette est masquée aux technologies d'assistance, et le « avec » est présent pour elles.
- [x] 3.2 `PlatCarte.svelte` : la prop `accompagnement`, l'intitulé en parties (accessoire en `--poids-moyen` et en opacité réduite comme sur la maquette, à mesurer en contraste si l'on passe par l'opacité), la méta réduite à la famille et aux mentions en texte, et la pastille d'allergène sur l'union des deux plats. Le plat inclassable garde sa carte cerclée.
- [x] 3.3 `ListeDuJour.svelte` : passer l'accompagnement au plat principal, et rendre les autres rôles de `LUNCH_SLOTS`, sans l'accompagnement. Les lignes portent les pictogrammes par `NomQualifie`. La qualité promue au rang de nom (D28) s'affiche en pictogramme suivi du mot. Vérifier les tests unitaires en vert.

## 4. La semaine, la fiche, la légende

- [x] 4.1 `semaine/+page.svelte` : le titre de la tuile se rend par `intitulePlat()` et `NomQualifie`, et `rest()` écarte l'accompagnement (D7).
- [x] 4.2 `FicheJour.svelte` : la mention s'écrit en pictogramme suivi du mot, et l'accompagnement suit le plat dans l'ordre de `LUNCH_SLOTS`. Adapter `FicheJour.test.ts`.
- [x] 4.3 `a-propos/+page.svelte` : la section « Les labels de qualité » après « La source », rendue depuis `QUALITY_MARKS` (D6), avec une phrase par marque.

## 5. Vérification

- [x] 5.1 e2e : adapter `aujourdhui.spec.ts`, `famille.spec.ts` et `qualite.spec.ts` (intitulé composé, absence de ligne d'accompagnement, pictogrammes) ; ajouter à `hauteur.spec.ts` le jour réel du 19 novembre 2026 à la plus petite fenêtre, aplat entier sans défilement. S'il échoue, descendre l'accompagnement d'un cran (risque de D1).
- [x] 5.2 e2e : la légende de l'écran À propos, et le nom accessible d'un pictogramme sur l'écran du jour.
- [x] 5.3 Captures à 320, 390 et 1280 px, en apparence claire et sombre, des jours des 6, 19, 25 et 5 novembre 2026, à comparer à la maquette.
- [x] 5.4 `npm run validate && npm run build && npm run test:e2e` en vert, puis commit `feat(ui): réunit l'accompagnement au plat et signale bio et label rouge par un pictogramme`.
