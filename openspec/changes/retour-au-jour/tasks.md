## 1. L'horloge, avant tout le reste (D47)

- [x] 1.1 Poser un instant de référence réactif, remis à l'heure au retour au premier plan, suivi une seule fois pour toute l'application
- [x] 1.2 Le documenter comme destiné aux écrans, et non comme une horloge d'usage général : tout ce qui le lit devient réactif à la reprise
- [x] 1.3 Faire dépendre de lui la cible, la mention et l'avertissement de fraîcheur, qui lisaient jusqu'ici l'instant du montage
- [x] 1.4 Ne poser aucune minuterie : minuit franchi au premier plan reste hors périmètre, et l'écrire

## 2. Le choix expire avec le jour (D47)

- [x] 2.1 Faire mémoriser au choix le jour civil où il a été posé
- [x] 2.2 Le lire à travers le jour courant plutôt que l'effacer par un écouteur : un état de moins à tenir synchronisé
- [x] 2.3 Passer le jour en paramètre plutôt que le lire depuis l'horloge dans le module — discipline de D7, pour que la règle s'éprouve sans manipuler le temps système
- [x] 2.4 Écrire le test unitaire de l'expiration, y compris le cas du même jour où le choix survit
- [x] 2.5 Corriger le commentaire de tête, qui assume une conséquence vraie d'un onglet et fausse d'une application installée

## 3. Les libellés de retour (D45)

- [x] 3.1 Écrire la version courte du libellé de cible, voisine de `targetEyebrow` et distincte d'elle
- [x] 3.2 Ne rendre aucun libellé lorsque rien n'est publié : il n'existe alors aucun jour où revenir
- [x] 3.3 Vérifier sur les quatre statuts que la commande ne dit jamais « Aujourd'hui » devant un jour qui ne l'est pas
- [x] 3.4 Écrire le libellé de retour de l'écran de la semaine, qui vise une semaine et non un jour

## 4. La place partagée dans l'en-tête (D44)

- [x] 4.1 Élargir le contrat d'`EnTete` d'une commande facultative, sans qu'aucun écran ne redessine sa propre ligne
- [x] 4.2 Placer la commande en frère du titre et non dedans : le titre reste complet, la commande est annoncée comme une commande
- [x] 4.3 N'afficher jamais la mention et la commande ensemble
- [x] 4.4 Réserver la hauteur de l'emplacement quel que soit son occupant, pour qu'un balayage ne fasse pas grandir l'en-tête
- [x] 4.5 Vérifier que l'exigence d'un seul titre de premier niveau tient toujours sur les quatre écrans
- [x] 4.6 Vérifier que la commande atteint la cible tactile minimale sans casser la ligne du titre

## 5. Les deux écrans (D44, D48)

- [x] 5.1 Brancher la commande sur l'écran du jour et supprimer la constante « Menu du jour »
- [x] 5.2 Brancher la commande sur l'écran de la semaine et supprimer la constante « Semaine »
- [x] 5.3 Faire appeler `reset()`, qui cesse d'être du code écrit et jamais appelé
- [x] 5.4 Ne pas toucher à l'onglet de la barre, et consigner l'argument dans le code pour qu'on cesse de le proposer

## 6. Ce que seule la reprise montre

- [x] 6.1 Éprouver la reprise : l'expiration est une fonction pure et se teste à l'unité en passant deux jours civils (`selection.svelte.test.ts`) ; ce qui reste au navigateur est l'abonnement lui-même, couvert par aucun test — **dette assumée, voir Risks**
- [x] 6.2 Vérifier que l'écran du jour ne montre pas la commande à l'ouverture, quand rien n'a été choisi
- [x] 6.3 Vérifier au clavier que la commande est atteignable et que le focus reste visible
- [x] 6.4 Vérifier que la hauteur reconquise par `enseigne-et-ardoise` tient encore : le test de hauteur ne doit pas basculer au rouge

## 7. Vérification

- [x] 7.1 `npm run validate && npm run build && npm run test:e2e` au vert avant tout commit
- [x] 7.2 Relever la hauteur de l'en-tête avant et après, pour que le coût de la réserve soit un chiffre et non une impression

## 8. Ce que l'implémentation a trouvé en chemin

- [x] 8.1 Sortir l'emplacement de la ligne du titre : mesuré à 383 px sur 388 avec la date la plus longue, le repli du bouton faisait sauter l'en-tête de 47 à 78 px (D44)
- [x] 8.2 Ne pas assouplir le test de hauteur pour le faire passer : corriger la mise en page jusqu'à ce que l'égalité stricte tienne
- [x] 8.3 Éprouver le pire cas nommément — « Mercredi 30 septembre » avec « Prochain service » — plutôt que de faire confiance au cas moyen
- [x] 8.4 Mesurer le focus au clavier par tabulation et non par `focus()`, qui teste l'heuristique du navigateur plutôt que la commande
