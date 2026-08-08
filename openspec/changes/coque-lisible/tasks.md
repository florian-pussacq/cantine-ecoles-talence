## 1. Établir la cause de la panne de balayage (D18)

- [ ] 1.1 Servir la construction sur le réseau local et reproduire l'absence de déclenchement au doigt sur un téléphone réel
- [ ] 1.2 Instrumenter la surface de geste pour journaliser `pointerdown`, `pointermove`, `pointerup` et `pointercancel`, et constater lequel manque
- [ ] 1.3 Vérifier séparément si un balayage réussi est suivi d'un `click` qui ouvre le détail du plat
- [ ] 1.4 Consigner la cause établie dans `design.md`, en refermant D18 sur un constat et non sur une hypothèse
- [ ] 1.5 Retirer l'instrumentation

## 2. Écrire le test de balayage qui échoue (D19)

- [ ] 2.1 Écrire un test de bout en bout injectant une séquence tactile réelle par le protocole de débogage, sur l'écran du jour
- [ ] 2.2 Le voir échouer, et vérifier qu'il échoue pour la cause établie en 1.4 et non pour une erreur d'écriture
- [ ] 2.3 Écrire le test asservi qu'un défilement vertical ne change pas de jour, et le voir passer
- [ ] 2.4 Écrire le test qu'un balayage n'ouvre pas le détail du plat situé sous le point de départ
- [ ] 2.5 Supprimer les deux tests de balayage synthétiques existants

## 3. Extraire et réparer le geste (D17, D18)

- [ ] 3.1 Créer `src/lib/ui/balayage.ts` exposant `createBalayage`, sans accès au DOM ni à l'horloge, avec seuil et contrainte d'horizontalité paramétrables
- [ ] 3.2 Écrire les tests unitaires du geste : seuil non atteint, geste trop vertical, sens gauche, sens droit, absence de voisin
- [ ] 3.3 Appliquer la correction établie en 1.4 : `touch-action`, capture du pointeur, suppression du `click` consécutif
- [ ] 3.4 Brancher `+page.svelte` sur la fonction extraite et vérifier que les tests de 2. passent
- [ ] 3.5 Vérifier sur téléphone réel que le geste répond, avant de considérer la réparation faite

## 4. Étendre le balayage à l'écran de la semaine

- [ ] 4.1 Remonter l'animation de transition directionnelle dans `tokens.css`, désormais partagée par deux écrans
- [ ] 4.2 Brancher `semaine/+page.svelte` sur `createBalayage`, le geste décalant la semaine de sept jours
- [ ] 4.3 Écrire le test de bout en bout du balayage sur l'écran de la semaine
- [ ] 4.4 Vérifier que les commandes « semaine précédente » et « semaine suivante » restent le chemin principal

## 5. La couche modale de détail (D16)

- [x] 5.1 Simuler `showModal` et `close` dans `src/vitest-setup.ts`, jsdom ne les implémentant pas
- [x] 5.2 Écrire les tests unitaires de `CourseSheet` : ouverture, fermeture par la commande visible, contenu des allergènes déclarés et de leur absence
- [x] 5.3 Réécrire `CourseSheet.svelte` autour de `<dialog>` : ouverture par `showModal`, fermeture par l'événement natif, contenu dans un élément enfant
- [x] 5.4 Fermer sur action hors du contenu, en distinguant la cible par l'élément enfant
- [x] 5.5 Supprimer l'écoute d'échappement devenue redondante, en conservant la neutralisation des flèches de navigation
- [x] 5.6 Supprimer la poignée décorative
- [x] 5.7 Bloquer le défilement du fond tant qu'une couche est ouverte
- [x] 5.8 Styler les deux formes : ancrée en bas et pleine largeur sous le seuil, centrée et bornée au-dessus
- [x] 5.9 Ajouter l'animation d'entrée sans JavaScript, et vérifier qu'elle disparaît sous `prefers-reduced-motion`
- [x] 5.10 Écrire les tests de bout en bout : le focus reste enfermé, il revient sur la cellule appelante, le fond ne défile pas, les flèches sont sans effet

## 6. L'en-tête partagé

- [ ] 6.1 Créer `src/lib/ui/EnTete.svelte` : une ligne, un seul titre de premier niveau, la mention et l'objet sur la même ligne de base
- [ ] 6.2 Écrire son test unitaire, y compris le cas d'un jour autre que celui du moment
- [ ] 6.3 Remplacer les en-têtes des quatre écrans et supprimer les quatre blocs de style recopiés
- [ ] 6.4 Vérifier que chaque écran porte toujours exactement un titre de premier niveau

## 7. Restructurer la palette (D20)

- [ ] 7.1 Déclarer les valeurs sombres une seule fois sous préfixe dans `tokens.css`, sans modifier aucune teinte
- [ ] 7.2 Écrire les deux blocs de renvois : requête de média excluant le thème clair forcé, et attribut de thème sombre
- [ ] 7.3 Déclarer le mode de couleur dans chacun des deux blocs
- [ ] 7.4 Réécrire `contrast.test.ts` : découpage par préfixe et non par position dans le fichier
- [ ] 7.5 Vérifier que les quarante mesures produisent exactement les mêmes valeurs qu'avant restructuration
- [ ] 7.6 Vérifier que `AllergenChip.test.ts`, qui importe la fonction de contraste, passe toujours

## 8. Le choix de thème (D21, D22)

- [ ] 8.1 Créer `src/lib/theme/theme.svelte.ts` : trois états, persistance par le stockage tolérant existant, pose et retrait de l'attribut de thème
- [ ] 8.2 Écrire ses tests unitaires, dont le cas d'un stockage refusé
- [ ] 8.3 Ajouter le script en ligne bloquant dans `src/app.html`, avant le reste de l'en-tête
- [ ] 8.4 Faire suivre la couleur annoncée au navigateur au thème effectivement appliqué
- [ ] 8.5 Ajouter l'interrupteur à trois options dans l'écran Réglages, chaque option énoncée en toutes lettres
- [ ] 8.6 Écrire le test de bout en bout d'absence de clignotement : thème forcé contraire au système, puis rechargement

## 9. L'écran large (D23, D24)

- [ ] 9.1 Extraire la largeur de la coque en jeton et l'utiliser dans `+layout.svelte`
- [ ] 9.2 Ajouter le palier de largeur, et monter d'un cran la typographie et les illustrations
- [ ] 9.3 Reprendre la barre d'onglets pour qu'elle ne s'étire pas sur toute la largeur
- [ ] 9.4 Ajouter le projet de test « bureau » dans la configuration Playwright
- [ ] 9.5 Faire porter les contrôles d'accessibilité et de cibles tactiles sur les deux profils, en réservant les tests de geste au profil tactile
- [ ] 9.6 Constater le comportement du blocage de défilement sur le profil bureau, et compenser par une gouttière stable si la page saute

## 10. Vérification d'ensemble

- [ ] 10.1 `npm run validate` et `npm run test:e2e` verts sur les deux profils
- [ ] 10.2 Budgets tenus : la construction ne doit pas échouer sur les 60 Ko de JavaScript
- [ ] 10.3 Vérifier sur téléphone réel : balayage sur les deux écrans, couche modale, thème forcé après rechargement
- [ ] 10.4 Vérifier sur écran de bureau : colonne bornée, structure identique, aucune horizontalité parasite
- [ ] 10.5 Trancher les questions ouvertes de `design.md` et les consigner comme décisions
