## 1. La règle de nommage (D28)

- [ ] 1.1 Écrire d'abord les tests de la règle dans `labels.test.ts` : libellé tautologique avec qualité, libellé tautologique sans qualité, libellé porteur, plusieurs qualités sur un même plat
- [ ] 1.2 Ajouter les cas de bord de la normalisation : casse différente, espaces en tête ou en fin, accent absent — chacun doit dire explicitement s'il déclenche la règle ou non
- [ ] 1.3 Écrire dans `labels.ts` la fonction qui, d'un `Course`, tire le nom à afficher et la nature de ce nom (libellé, qualité promue, ou détail non publié)
- [ ] 1.4 Formuler l'absence de détail sans laisser croire que le plat n'est pas servi — les allergènes de ces jours sont renseignés, donc le plat existe
- [ ] 1.5 Vérifier que la fonction ne nomme aucun rôle en dur : elle se déclenche sur la tautologie, pas sur `pain`

## 2. Le compartiment tautologique (D28)

- [ ] 2.1 Brancher `Tray.svelte` sur la fonction, pour le compartiment du plat principal comme pour les autres
- [ ] 2.2 Ne plus afficher en capsule une qualité qui vient d'être promue au rang de nom : elle serait dite deux fois
- [ ] 2.3 Vérifier sur les données réelles les trois cas présents : `bio` 14 jours, `label-rouge` 19 jours, « Pain du mois » 2 jours
- [ ] 2.4 Vérifier que les compartiments dont le libellé désigne un plat sont inchangés au pixel près

## 3. Le goûter comme objet (D29)

- [ ] 3.1 Sortir le goûter de son rendu actuel — bouton sans fond, petit corps — et lui donner la forme d'un compartiment : fond, rayon, rôle, illustration, place d'une pastille d'allergène
- [ ] 3.2 Le poser sous le plateau, séparé par une rupture qui se voit sans recourir à un filet (D29 : l'écran en porte déjà un, qui signifie « fin de contenu »)
- [ ] 3.3 Appliquer la règle de nommage : les sept mercredis à libellé « Goûter » doivent afficher l'absence de détail, pas le mot répété
- [ ] 3.4 Vérifier qu'il reste actionnable et qu'il ouvre la même couche de détail qu'avant
- [ ] 3.5 Déclarer dans `contrast.test.ts` toute nouvelle surface translucide — le contrôle de couverture (D27) échouera de lui-même si elle est oubliée
- [ ] 3.6 Vérifier que le plat principal reste visible sans défiler sur un écran de téléphone : c'est ce que la hauteur prise par le goûter met en jeu

## 4. Une seule horloge (D30)

- [ ] 4.1 Faire entrer l'en-tête sous la même animation que le contenu du jour, sur l'écran du jour puis sur celui de la semaine
- [ ] 4.2 Vérifier qu'un seul titre de premier niveau subsiste et qu'il reste annoncé — l'exigence est vérifiée de bout en bout
- [ ] 4.3 Vérifier que le contenu du jour atteint est présent et actionnable dès la première image, animation en cours
- [ ] 4.4 Alors seulement, porter la durée de `.glisse` au-delà de 180 ms, dans le seul jeton qui la porte
- [ ] 4.5 Vérifier que `prefers-reduced-motion` supprime toujours l'animation, en-tête compris

## 5. Vérification d'ensemble

- [ ] 5.1 `npm run validate && npm run build` verts, budget JavaScript tenu
- [ ] 5.2 `npm run test:e2e` vert sur les deux profils, tactile et bureau
- [ ] 5.3 Après poussée par l'humain : juger sur un téléphone réel la hauteur prise par le goûter, et la durée de la transition — aucune des deux ne se juge en local
- [ ] 5.4 Si la durée ne convient pas, la changer d'une ligne et le noter dans D30 : c'est une expérience, son résultat fait partie de la décision

## 6. Ce que ce changement ne fait pas

- [ ] 6.1 Vérifier avant archivage que les questions ouvertes de `design.md` sont toujours exactes — le carrousel, la durée finale, les mercredis sans détail, la coque
- [ ] 6.2 Regarder le PDF officiel d'un mercredi pour trancher si les sept goûters sans détail sont un défaut de la source ou de la saisie, et consigner la réponse
