## 1. La zone sûre, avant tout le reste (D34)

- [ ] 1.1 Constater la dette : `viewport-fit=cover` est déclaré dans `app.html`, `env(safe-area-inset-*)` n'apparaît nulle part
- [ ] 1.2 Poser les jetons de hauteur de barre et de zone sûre inférieure dans `tokens.css`, en distinguant la hauteur de la barre de la hauteur réservée par la coque — la seconde est la première augmentée de l'encart
- [ ] 1.3 Vérifier sur un simulateur ou un appareil à indicateur d'accueil que le pied de page reste atteignable, ce qu'aucune machine de développement ne montrera

## 2. La barre descend (D31)

- [ ] 2.1 Retirer le segment Allergènes de la barre et la réduire à deux destinations
- [ ] 2.2 Ancrer la barre au bas de la fenêtre, bornée à la colonne de contenu et non à la largeur de l'écran
- [ ] 2.3 Réserver dans la coque la hauteur de la barre augmentée de la zone sûre
- [ ] 2.4 Vérifier le cas des écrans hors barre — `/reglages`, `/a-propos`, la page 404 — où aucun segment n'est courant et où la barre doit suffire à sortir
- [ ] 2.5 Vérifier que l'onglet courant reste annoncé aux technologies d'assistance : un test de bout en bout existant le couvre déjà

## 3. Les icônes d'interface (D33)

- [ ] 3.1 Créer un mécanisme d'icônes distinct de `Sprite.svelte`, dont le contrat est inverse : une icône d'interface ne porte jamais son sens seule, la commande qui la contient est nommée
- [ ] 3.2 Écrire ce contrat en commentaire de tête, pour que la règle du décoratif ne lui soit jamais appliquée par analogie
- [ ] 3.3 Dessiner la roue crantée pour sa taille de destination et la juger à cette taille — une forme dentelée et ajourée se réduit mal
- [ ] 3.4 Vérifier que la bibliothèque d'illustrations reste inchangée et que `dish-illustration` n'est pas touchée

## 4. La commande et son état (D32)

- [ ] 4.1 Faire une place à une commande dans `EnTete`, sur la même ligne que le titre, sans casser l'exigence d'un seul titre de premier niveau
- [ ] 4.2 Ne pas afficher la commande sur sa propre destination : depuis `/reglages`, une roue qui mène à `/reglages` ne mène nulle part
- [ ] 4.3 Composer le nom accessible de la commande à partir de ce qu'elle ouvre et du nombre surveillé, et le tester
- [ ] 4.4 N'afficher aucune marque lorsque la sélection est vide — ni pastille, ni zéro
- [ ] 4.5 Réserver la place de la pastille dès le prérendu, occupée ou non
- [ ] 4.6 Vérifier qu'aucun élément ne se déplace entre le HTML prérendu et l'état hydraté, avec une sélection non vide en stockage
- [ ] 4.7 Vérifier qu'aucun script bloquant n'a été réintroduit dans `app.html` : c'est la solution que D32 écarte explicitement

## 5. Contraste et surfaces

- [ ] 5.1 Déclarer dans `contrast.test.ts` les surfaces de la barre et de la pastille — le contrôle de couverture des transparences (D27) échouera de lui-même si une opacité est oubliée
- [ ] 5.2 Appliquer le seuil de 3:1 à ce qui délimite une commande et de 4,5:1 à ce qui porte du texte, chiffre de la pastille compris

## 6. Ce qu'un élément fixe déplace dans les tests

- [ ] 6.1 Faire tourner `large.spec.ts` : « la page ne défile jamais horizontalement » et « l'ouverture de la couche modale ne décale pas le contenu » touchent tous deux à un ancrage au viewport
- [ ] 6.2 Vérifier que la couche modale de détail recouvre bien la barre et que sa commande de fermeture reste atteignable — elles occupent désormais la même zone du pouce
- [ ] 6.3 Vérifier que les cibles tactiles de la barre tiennent les 44 pixels, zone sûre comprise et non incluse dans le compte

## 7. Vérification d'ensemble

- [ ] 7.1 `npm run validate && npm run build` verts, budget JavaScript tenu
- [ ] 7.2 `npm run test:e2e` vert sur les deux profils, tactile et bureau
- [ ] 7.3 Après poussée par l'humain : atteindre les deux onglets au pouce, d'une seule main, sur un téléphone réel — c'est la seule chose que ce change cherche à obtenir
- [ ] 7.4 Juger la hauteur cumulée avec le goûter de `hierarchie-du-jour`, une fois les deux en ligne : le plat principal doit rester visible sans défiler
- [ ] 7.5 Si la hauteur ne passe pas, décider lequel des deux changements rend de la place, et le consigner
