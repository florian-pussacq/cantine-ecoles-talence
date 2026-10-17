## 1. La mesure d'abord, sinon on mesurera ce qu'on obtient

- [x] 1.1 Écrire le test de bout en bout qui échoue : sur le profil mobile, la date, tous les rôles du déjeuner, le goûter et les deux commandes de jour sont dans le champ visible sans défilement
- [x] 1.2 Le faire porter sur un jour complet **avec goûter**, choisi dans les données réelles et non fabriqué
- [x] 1.3 Consigner la mesure de départ dans le message d'échec, pour que le gain se lise dans le journal du test et pas seulement dans un commentaire : 1 016 px de page pour 839 px de fenêtre
- [x] 1.4 Vérifier qu'il échoue pour la bonne raison — le débordement — et non parce qu'un sélecteur est absent

## 2. L'enseigne (D35, D36)

- [x] 2.1 Poser l'enseigne dans `+layout.svelte`, au-dessus du contenu, hors de tout bloc animé : elle ne glisse pas avec le jour
- [x] 2.2 La rendre en petit corps, à opacité réduite — constante par construction, donc discrète (D28)
- [x] 2.3 Ne pas en faire un titre : le `h1` reste la date. Vérifier que l'exigence d'un seul titre de premier niveau tient sur les quatre écrans
- [x] 2.4 Y déplacer `CommandeReglages`, avec sa règle inchangée : pas de roue sur sa propre destination
- [x] 2.5 Retirer `CommandeReglages` de `EnTete`, qui redevient un titre pur
- [x] 2.6 Vérifier que le nom accessible de la commande et la pastille de compte survivent au déménagement — c'est du code testé par `navigation-basse`, pas du code neuf
- [x] 2.7 Vérifier que la place réservée à la pastille l'est toujours dès le prérendu : le déplacement ne doit pas rouvrir le décalage à l'hydratation

## 3. La date insécable (D37)

- [x] 3.1 Rendre la date insécable et retirer `text-wrap: balance` du titre
- [x] 3.2 Faire de la mention de situation un élément qui se replie sous la date plutôt qu'un fragment de la même phrase
- [x] 3.3 Vérifier sur le pire cas réel — « Prochain service · dans 10 jours » avec « Mercredi 30 septembre » — que la date tient sur une ligne
- [x] 3.4 Vérifier le même comportement sur l'écran de la semaine, dont la période est plus longue encore que la date
- [x] 3.5 Constater le gain de largeur rendu par le départ de l'engrenage (320 → 388 px) avant de conclure que la mise en forme suffit

## 4. La cible devient la journée (D38) — avant l'ardoise, c'est elle qui l'autorise

- [x] 4.1 Faire de `CourseSheet` une fiche de journée : elle reçoit le jour, non un plat
- [x] 4.2 Y lister tous les plats du jour, goûter compris, dans l'ordre de l'écran, chacun avec ses allergènes en libellés clairs
- [x] 4.3 Conserver la mention « aucun allergène déclaré » par plat, sans laisser entendre une garantie d'absence
- [x] 4.4 Faire du déjeuner une cible unique, et du goûter une seconde cible menant à la même fiche
- [x] 4.5 Rendre le focus à l'élément qui a ouvert la couche, **quel qu'il soit** : deux chemins d'ouverture, deux retours possibles. Un retour câblé en dur sur le déjeuner serait faux depuis le goûter
- [x] 4.6 Vérifier au clavier que le déjeuner est atteint comme un élément unique et non comme une suite d'éléments par rôle
- [x] 4.7 Vérifier que le balayage reste indemne : `createBalayage` supprime déjà le clic qui suit un geste abouti, mais la surface cliquable a changé de taille

## 5. L'ardoise (D39, D40, D41)

- [x] 5.1 Remplacer la grille de `Tray.svelte` par une ardoise : une ligne par rôle, rôles alignés en colonne, libellés alignés entre eux
- [x] 5.2 Conserver l'ordre du service — entrée, plat, accompagnement, laitage, dessert — et sortir le pain de la séquence, en pied d'ardoise et plus discret
- [x] 5.3 Garder la vedette du plat principal à sa place de service : couleur de famille, illustration, grand corps. Sa prééminence vient de sa forme, pas de son rang
- [x] 5.4 Retirer l'illustration des cinq autres rôles
- [x] 5.5 Traiter le rôle absent comme une ligne qui reste en place et énonce l'absence : l'ardoise ne se referme pas
- [x] 5.6 Conserver intacte la règle du libellé tautologique — c'est elle qui rend le pain lisible sur une ligne
- [x] 5.7 Conserver le signalement d'allergène par ligne : il désigne le plat, pas la journée
- [x] 5.8 Aligner le goûter sur le vocabulaire de la vedette — disque, illustration, nom — et garder la rupture par la distance, sans filet
- [x] 5.9 Faire *calculer* la largeur de la colonne des rôles plutôt que la fixer : une largeur devinée en `ch` laissait « ACCOMPAGNEMENT » chevaucher le nom du plat, une grille à colonne `auto` la dimensionne d'elle-même

## 6. « Accompagnement » (D42)

- [x] 6.1 Changer le libellé de rôle et la formulation de l'absence dans `labels.ts`
- [x] 6.2 Mettre à jour `labels.test.ts` et `Tray.test.ts`, qui portent tous deux « Garniture » et l'ordre des rôles
- [x] 6.3 Vérifier qu'aucun autre libellé de rôle n'a dérivé du mot employé par la source

## 7. Contraste et surfaces

- [x] 7.1 Déclarer dans `contrast.test.ts` les surfaces nouvelles — enseigne, lignes d'ardoise, pied d'ardoise, pastille de mention — le contrôle de couverture des transparences (D27) échouera de lui-même si une opacité est oubliée
- [x] 7.2 Appliquer 4,5:1 au texte et 3:1 à ce qui délimite une commande ou porte une information non textuelle
- [x] 7.3 Vérifier que le libellé de rôle, désormais seul repère d'un plat privé d'illustration, tient le seuil de texte et non celui d'un élément décoratif

## 8. Ce que la hauteur libérée doit prouver

- [x] 8.1 Faire passer le test de 1.1 et relever la hauteur obtenue
- [x] 8.2 Faire tourner `large.spec.ts` : la structure doit rester identique à une autre échelle, sans seconde mise en page (D23)
- [x] 8.3 Faire tourner `balayage.spec.ts` et `couche-modale.spec.ts` : la cible a changé de nature, ces deux fichiers la touchent
- [x] 8.4 Vérifier au doigt, sur un téléphone, ce qu'aucun test ne dira : qu'un appui destiné à faire défiler n'ouvre pas la fiche — vérifié à la main par le mainteneur (17 octobre 2026)
- [x] 8.5 `npm run validate && npm run build && npm run test:e2e` au vert avant tout commit

## 9. Ce que l'implémentation a trouvé en chemin

- [x] 9.1 Rendre le titre insécable sans en sortir la mention : la première écriture la déplaçait hors du `h1` et la retirait du nom accessible, privant la navigation par titres de la seule information de sécurité de l'écran (D37)
- [x] 9.2 Retirer au goûter son cadre intérieur, citation d'un compartiment qui n'existe plus (D41)
- [x] 9.3 Supprimer les deux requêtes média sur le thème du système survivantes de D25, et étendre le contrôle à tous les composants au lieu du seul `tokens.css` (D43)
- [x] 9.4 Placer la mention de la fiche sous le titre et non au-dessus, où elle se lisait comme un libellé de la date
- [x] 9.5 Rendre les labels de qualité de la fiche sous la même capsule que l'ardoise : en gris sous les allergènes, ils se lisaient comme un allergène de plus
