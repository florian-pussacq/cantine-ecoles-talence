## 1. Table des familles

- [ ] 1.1 `families.test.ts` : écrire d'abord les cas de D3, et vérifier qu'ils échouent.
  - Cas positifs : « Moussaka » donne viande ; « Moussaka végétarienne » donne végétarien. Chaque libellé d'illustration ajouté reçoit son dessin (potatoes, mâche, Babybel, tome, tiramisu, cheesecake, far, donut, pasteis de nata, houmous, saucisson, rillettes de la mer, poêlée, champignon, maïs).
  - Cas qui restent inconnus : « Escalope viennoise », « Émincé au curry », « Croustade limousine ».
  - Cas de non-régression : « Salade de maïs » reste une salade composée.
- [ ] 1.2 `families.ts` : écrire en tête de la table le critère d'entrée de D3, puis ajouter les mots-clés. Vérifier `families.test.ts` en vert, et refaire le recensement des plats inconnus sur `static/data`. Résultat attendu : six plats, tous ambigus.

## 2. Le plat inconnu, dessiné

- [ ] 2.1 `sprite.svg` : redessiner `ill-inconnu` en cloche posée sur son plateau (D2), avec le même lustre et la même ombre portée que les autres dessins. Vérifier sa lisibilité sur `--creux` dans les deux palettes, par une capture à 390 px.
- [ ] 2.2 `PlatCarte.svelte` : ne plus dériver `var(--fam-inconnu)`. Le plat principal inclassable prend la classe `inconnue` : surface `--carte`, filet de 2 px `--encre`, texte `--encre`, méta `--encre-douce`, disque `--creux` (D1). Adapter `ListeDuJour.test.ts`, puis vérifier `famille.spec.ts` et le scénario « Plat principal inclassable ».
- [ ] 2.3 `semaine/+page.svelte` : la tuile d'un jour inclassable prend une surface `--carte`, un filet plein de 2 px `--encre` et un texte en encre. Le jour sans service garde son filet tireté. e2e : « Plat principal inclassable sur la semaine » vérifie qu'aucune couleur de famille n'est portée et que la tuile se distingue à la fois d'un jour coloré et d'un jour sans service.
- [ ] 2.4 `tokens.css` et `contrast.test.ts` : retirer `--fam-inconnu` et `--fam-inconnu-pale` des deux palettes, et `inconnu` de la liste des familles mesurées. Vérifier par recherche qu'aucun fichier ne les emploie plus, `static/404.html` compris. Vérifier aussi `design-tokens.test.ts` et `contrast.test.ts` en vert.

## 3. Finitions typographiques

- [ ] 3.1 `design-tokens.test.ts` : ajouter `letter-spacing` aux propriétés portées par les jetons (en admettant `normal` et `0`), et vérifier que le test échoue sur les trois valeurs en dur actuelles.
- [ ] 3.2 `tokens.css` : le jeton `--serrage-intitule` (-0.02em), puis son emploi dans `PlatCarte` (nom du plat principal), `EnTete` et `FicheJour`. Retirer l'approche de `Bandeau` (D5). Vérifier `design-tokens.test.ts` en vert.
- [ ] 3.3 `tokens.css` : `--mesure: 65ch`, `p { max-inline-size }`, `text-wrap: pretty` sur `p, li, dd` et `balance` sur `h1, h2, h3` (D4). Vérifier aux captures 390, 320 et 1280 px qu'aucun paragraphe pleine largeur voulu n'a rétréci.
- [ ] 3.4 `EnTete.svelte` : le titre d'un écran secondaire aligné à gauche, dans `--police-affichage` (D6). Vérifier « L'en-tête ne change pas de hauteur » et les captures des réglages, de la grève et des mentions.
- [ ] 3.5 e2e de mesure, dans `qualite.spec.ts` ou un nouveau fichier : sur l'écran des mentions à 1280 px, aucun paragraphe ne dépasse 75 caractères par ligne, et aucun paragraphe de plusieurs lignes ne finit sur un mot seul. La méthode est celle de la sonde de l'audit : largeur rapportée à la chasse moyenne mesurée, et position du dernier mot.

## 4. Les mentions par les réglages

- [ ] 4.1 `PiedSource.svelte` : retirer le lien vers les mentions, et passer le lien « PDF officiel » au cran `--texte-sm` (D7).
- [ ] 4.2 e2e `coque.spec.ts` et `large.spec.ts`. Il faut :
  - remplacer le scénario « Les mentions depuis un écran de menu » : aucun lien vers `/a-propos` au bas de l'écran du jour ni de la semaine, et les mentions atteintes par la roue puis la section « Application » ;
  - ajouter « La provenance reste au bas des écrans de menu » ;
  - ajuster l'ordre attendu du pied sur écran large.
- [ ] 4.3 Vérifier que l'écran des mentions reste servi hors ligne (`offline.spec.ts`), puisqu'il n'est plus atteint que par les réglages.

## 5. Vérification

- [ ] 5.1 `npm run validate && npm run build`, budgets compris, puis `npm run test:e2e` sur les deux projets.
- [ ] 5.2 Repasser la sonde de l'audit sur le build : aucun `line-length-too-long`, aucun `orphan-word` sur les écrans de texte, aucune régression de contraste ni de débordement. Faire les captures du jour et de la semaine sur le 3 novembre 2026 (Croustade limousine), en clair et en sombre.
- [ ] 5.3 `openspec validate finitions-et-plat-inconnu`, et cocher les tâches.
