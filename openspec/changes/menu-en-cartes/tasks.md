## 1. La palette, avant toute mise en page (D49)

- [x] 1.1 Remplacer la palette « Réfectoire » par la palette claire : fond, carte, bord, accent, encres
- [x] 1.2 Poser les sept jetons de rôle, une seule valeur chacun, tenant 4,5:1 sur la carte comme sur le fond
- [x] 1.3 Conserver les jetons de famille, en écrivant qu'ils ne servent plus que l'écran de la semaine (D54)
- [x] 1.4 Supprimer `--on-table` et retirer les huit transparences qui en dépendaient
- [x] 1.5 Renommer `--barre` en `--pied`, `--barre-reservee` en `--pied-reserve`, en gardant le calcul de D34
- [x] 1.6 Réécrire l'en-tête du fichier : D25 est annulée, et la phrase qui l'énonce ne peut pas rester
- [x] 1.7 Réécrire `contrast.test.ts` sur la nouvelle palette, **en conservant son contrôle de couverture**
- [x] 1.8 Vérifier que l'application reste fonctionnelle en clair avant d'aller plus loin — même laide

## 2. La carte, et la liste qu'elle forme (D50, D51)

- [x] 2.1 Écrire les sept glyphes de rôle, dans le contrat d'`Icone` : décoratifs, le sens est porté par le libellé
- [x] 2.2 Écrire `PlatCarte` : pastille, libellé de rôle, nom, mentions de qualité, signalement d'allergène, vignette
- [x] 2.3 N'y placer aucun élément actionnable — la cible reste la journée entière (D38)
- [x] 2.4 Ne pas illustrer un rôle sans plat : il n'y a pas de libellé d'où déduire l'illustration
- [x] 2.5 Remplacer la grille de `Tray` par la liste de cartes, en gardant l'ordre et la règle « une ligne par rôle, jamais moins » (D12)
- [x] 2.6 Supprimer la vedette : le rang du plat ne tient plus qu'au corps de son nom
- [x] 2.7 Réécrire `Tray.test.ts` sur le nouveau contrat
- [x] 2.8 **Point d'arrêt : montrer l'écran du jour avant de toucher à la coque**

## 3. La coque (D52, D55, D56)

- [x] 3.1 Extraire les onglets du layout dans un composant propre, en gardant l'intitulé du repère et l'état actif
- [x] 3.2 Les remonter au-dessus du contenu
- [x] 3.3 Remplacer la barre basse par le pied fixe des mentions, d'au moins 44 pixels plus l'encart système
- [x] 3.4 Redescendre la date de mise à jour et le lien vers le PDF dans le flux de chaque écran de menu
- [x] 3.5 Poser le titre et la baseline dans `EnTete`, et lui retirer la mention comme la commande de retour
- [x] 3.6 Descendre la mention et la date entre les deux flèches du rang de navigation
- [x] 3.7 Sortir la commande de retour dans son propre rang, sous les cartes, sans réservation de hauteur
- [x] 3.8 Poser l'enseigne : disque doré et marque à gauche, réglages à droite
- [x] 3.9 Vérifier qu'il n'y a qu'un seul rang de flèches par écran
- [x] 3.10 Réécrire `EnTete.test.ts`

## 4. Les autres écrans

- [x] 4.1 Adapter l'écran de la semaine, en gardant les disques de famille (D54)
- [x] 4.2 Adapter la couche modale du jour
- [x] 4.3 Adapter la pastille d'allergène, en gardant son contour de 2 pixels et son pictogramme
- [x] 4.4 Adapter les écrans de réglages et d'à-propos
- [x] 4.5 Vérifier qu'aucun écran ne déborde horizontalement, aux deux largeurs

## 5. L'identité, dette soldée au passage

- [x] 5.1 Aligner `manifest.webmanifest`, `app.html` et le favicon sur la palette claire — les trois divergent aujourd'hui
- [x] 5.2 Régénérer les icônes PNG

## 6. Ce que les tests doivent devenir

- [x] 6.1 Remplacer `hauteur.spec.ts` par la garantie affaiblie : la première carte est entièrement visible sans défiler (D53)
- [x] 6.2 Réécrire `barre.spec.ts` sur les onglets hauts et le pied fixe, **en conservant le test de non-décalage à la pastille**
- [x] 6.3 Réécrire `retour.spec.ts` : la commande est sous les cartes, conditionnelle, et reste atteignable au clavier
- [x] 6.4 Ajuster `large.spec.ts` à l'ordre des éléments de la coque
- [x] 6.5 Ne pas toucher à `qualite.spec.ts` : 44 pixels, un titre, aucune requête tierce, aucun cookie
- [x] 6.6 Vérifier que le budget tient malgré les sept glyphes ajoutés

## 7. Ce que seul un téléphone montre

- [ ] 7.1 Vérifier au doigt qu'un appui destiné à faire défiler n'ouvre pas la fiche du jour — le risque augmente avec le défilement (D53)
- [ ] 7.2 Vérifier que le balayage entre jours survit au défilement vertical
- [ ] 7.3 Vérifier que le pied fixe ne recouvre pas la dernière carte, indicateur d'accueil compris
