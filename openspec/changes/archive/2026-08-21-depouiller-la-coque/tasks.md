## 1. Retirer le mécanisme de thème (D25)

- [x] 1.1 Supprimer `src/lib/theme/theme.svelte.ts` et `src/lib/theme/theme.test.ts`
- [x] 1.2 Supprimer `e2e/theme.spec.ts`
- [x] 1.3 Retirer l'hydratation du thème de `src/routes/+layout.svelte`
- [x] 1.4 Retirer le panneau de thème de `src/routes/reglages/+page.svelte`, ses styles, et le titre de l'écran qui annonce « Affichage et allergènes »
- [x] 1.5 Retirer le script en ligne de `src/app.html`, ainsi que le commentaire qui le justifie
- [x] 1.6 Ramener les deux balises `theme-color` à une seule, sans requête de média ni attribut de teinte, et fixer `<meta name="color-scheme">` à `light`
- [x] 1.7 Vérifier par recherche qu'il ne subsiste dans `src/` et `e2e/` aucune occurrence de `data-theme`, `cantine.theme` ni `themePreference`

## 2. Réduire la palette à une seule (D25)

- [x] 2.1 Supprimer de `tokens.css` les vingt-sept jetons `--dark-*`
- [x] 2.2 Supprimer le bloc `@media (prefers-color-scheme: dark)` et le bloc `:root[data-theme='dark']`
- [x] 2.3 Supprimer le bloc `:root[data-theme='light']`, devenu sans objet
- [x] 2.4 Fixer `color-scheme: light` sur `:root` — les commandes de formulaire vivent sur les plateaux clairs
- [x] 2.5 Vérifier par recherche qu'aucun `var(--dark-` ne subsiste : un renvoi orphelin rend la couleur invalide, donc héritée, donc silencieusement fausse
- [x] 2.6 Réécrire le commentaire de tête de `tokens.css` : il décrit une palette à deux thèmes qui n'existe plus

## 3. Changer le fond (D26)

- [x] 3.1 Porter `--table` à `#2b3440` et la balise `theme-color` à la même valeur
- [x] 3.2 Vérifier que les cinq familles et leurs teintes pâles sont inchangées au bit près

## 4. Mesurer ce qui est peint (D27)

- [x] 4.1 Supprimer de `contrast.test.ts` la section « les deux voies du thème sombre » : ses trois tests n'ont plus d'objet
- [x] 4.2 Supprimer le découpage par préfixe et la boucle sur les deux thèmes ; il reste une palette
- [x] 4.3 Vérifier que les vingt paires opaques restantes passent, et que le rapport « en-tête sur la table » est bien monté de 7,01:1 à 11,48:1
- [x] 4.4 Ajouter au test le calcul d'un mélange à l'opacité entre deux jetons
- [x] 4.5 Déclarer les trois paires translucides réellement peintes : lien de pied à 70 %, avis de fraîcheur à 80 %, bordure des boutons de jour à 35 % — avec leur seuil respectif, 4,5:1 pour les deux premiers, 3:1 pour le troisième
- [x] 4.6 Voir échouer la paire de la bordure à 2,81:1, et vérifier que c'est bien le seuil de 3:1 qui la fait échouer
- [x] 4.7 Porter la bordure de `nav button` à 40 % dans `src/routes/+page.svelte`, la mesure passant à 3,20:1
- [x] 4.8 Chercher dans les styles scopés d'autres surfaces obtenues par `color-mix` ou `opacity` sur le fond, et les déclarer si elles portent du texte ou délimitent une commande
- [x] 4.9 Vérifier que `AllergenChip.test.ts`, qui importe `contraste` depuis ce fichier, passe toujours

## 5. Reprendre l'écran Réglages

- [x] 5.1 Vérifier que l'écran ne porte toujours qu'un seul titre de premier niveau une fois le panneau retiré
- [x] 5.2 Vérifier que les allergènes sont désormais la première chose de l'écran, sans espace vide en tête

## 6. Vérification d'ensemble

- [x] 6.1 `npm run validate && npm run build` verts
- [x] 6.2 `npm run test:e2e` vert sur les deux profils, tactile et bureau
- [x] 6.3 Constater la baisse du budget JavaScript et la noter, le prochain changement en ayant besoin
- [ ] 6.4 Après poussée par l'humain : juger l'ardoise sur un téléphone réel, en plein jour — c'est le seul verdict qui compte sur une teinte
