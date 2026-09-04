## 1. La mention situe le jour consulté (D60)

- [x] 1.1 Écrire `browsedEyebrow(date, today)` dans `src/lib/menu/labels.ts` : « Aujourd'hui », « Demain », « Hier », « Dans n jours », « Il y a n jours »
- [x] 1.2 Documenter dans son docblock ce qui la distingue de `targetEyebrow`, et pourquoi les deux coexistent
- [x] 1.3 Brancher `src/routes/+page.svelte` : mention issue de `targetEyebrow(target)` tant que `ecarte` est faux, de `browsedEyebrow(date, today)` ensuite
- [x] 1.4 Traiter le cas `date === null` : aucune période affichée, aucune distance à énoncer
- [x] 1.5 Étendre `labels.test.ts` : distances 0, ±1, ±2, ±10, et le passage d'un mois à l'autre

## 2. La date est le titre de l'écran (D61)

- [x] 2.1 Retirer les entrées `/` et `/semaine` de la table des titres de `+layout.svelte`, avec le commentaire qui les justifiait
- [x] 2.2 Retirer la `baseline` de `EnTete` — prop, rendu, style — et reprendre son docblock
- [x] 2.3 Faire de `principal` un `h1` dans `RangNavigation`, et documenter que `{#key}` remplace de façon synchrone donc qu'il n'y a jamais zéro ni deux titres
- [x] 2.4 Vérifier le niveau des titres restants sur les deux écrans de menu : rien ne doit sauter de `h1` à `h3`
- [x] 2.5 Reprendre `EnTete.test.ts` : les cas de baseline disparaissent, le cas du titre seul reste
- [x] 2.6 Ajouter à `RangNavigation.test.ts` le contrôle du titre de premier niveau

## 3. La sortie remonte dans l'enseigne (D62)

- [x] 3.1 Créer `CommandeSortie.svelte` : commande d'en-tête nommant sa destination, nom accessible complet, même gabarit que `CommandeReglages`
- [x] 3.2 Décrire dans son docblock ce qui la sépare de `CommandeRetour`, et pourquoi les deux ne fusionnent pas
- [x] 3.3 Déclarer dans `+layout.svelte` la destination de sortie de chaque écran secondaire — `/greve` vers `/reglages`, les autres vers `/`
- [x] 3.4 Faire porter à `Enseigne` l'emplacement unique : la roue sur les écrans de menu, la sortie ailleurs, jamais rien
- [x] 3.5 Retirer de `CommandeReglages` l'auto-masquage sur `/reglages`, désormais porté par la coque, et reprendre son commentaire
- [x] 3.6 Retirer les trois `CommandeRetour` de `/reglages`, `/greve` et `/a-propos`, avec les commentaires qui les justifiaient
- [x] 3.7 Vérifier que la réserve de hauteur de l'enseigne tient avec une commande nommée, plus large que la roue, et que le nom du lieu se tronque sans déborder

## 4. Le pied de source (D63)

- [x] 4.1 Créer `PiedSource.svelte` : libellé de mise à jour avec son repli complet, lien vers le PDF, `align-items: center`
- [x] 4.2 Remplacer les trois pieds recopiés de `/`, `/semaine` et `/greve`, et supprimer leur CSS
- [x] 4.3 Ramener la réserve basse de `.shell` à `calc(var(--space-3) + var(--pied-reserve))`
- [x] 4.4 Vérifier sur `hauteur.spec.ts` que la dernière carte reste au-dessus du pied fixe, zone sûre comprise

## 5. Encres et surfaces (D64)

- [x] 5.1 Remplacer `color: var(--fond)` par `var(--accent)` dans `a-propos/+page.svelte` et `DaySheet.svelte`
- [x] 5.2 Retirer de `a-propos` le commentaire qui raconte une correction voisine sans voir celle-ci
- [x] 5.3 Partitionner les jetons dans `contrast.test.ts` : encres d'un côté, surfaces de l'autre, la partition documentée
- [x] 5.4 Ajouter le contrôle : aucun composant ne déclare un jeton de surface en `color:` — l'échec nomme le composant et le jeton
- [x] 5.5 Vérifier que le contrôle échoue sur les deux déclarations d'origine avant qu'elles ne soient corrigées
- [x] 5.6 Déclarer et mesurer l'inversion trouvée par le contrôle — `--carte` sur `--ink`, étiquette du jour courant
- [x] 5.7 Remplacer par un glob la liste tenue à la main du contrôle de couverture des transparences

## 6. Vérification

- [x] 6.1 Reprendre `coque.spec.ts` : la sortie change de rôle, de place et de nom ; elle ne mène plus toujours au menu
- [x] 6.2 Ajouter à `coque.spec.ts` le contrôle de l'emplacement unique — une commande et une seule, sur chacun des cinq écrans
- [x] 6.3 Ajouter à `greve.spec.ts` la sortie vers les réglages
- [x] 6.4 Vérifier `retour.spec.ts` : la mention lue à l'ouverture reste celle du statut, la commande de retour au repère ne bouge pas
- [x] 6.5 Ajouter à `retour.spec.ts` le contrôle de la mention après navigation — elle ne doit plus dire « Aujourd'hui »
- [x] 6.6 Vérifier les contrôles de titre de premier niveau de `smoke`, `offline` et `qualite` : le compte ne change pas, le texte oui
- [x] 6.7 Ajouter à `qualite.spec.ts` le contrôle d'alignement du pied de source
- [ ] 6.8 Passer `npm run validate`, `npm run build` et `npm run test:e2e`

## 7. Documentation

- [x] 7.1 Reprendre les docblocks qui citent D44, D45 et D55 dans `CommandeRetour`, `EnTete`, `Enseigne` et `Onglets`, pour qu'ils décrivent la répartition issue de D62
