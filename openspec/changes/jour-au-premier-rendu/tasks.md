## 1. Jour du rendu

- [ ] 1.1 Dans `hooks.server.ts`, poser `data-jour-rendu` sur `<html>` au pré-rendu, calculé par `parisDate` sur l'instant de départ de `horloge` (D2)
- [ ] 1.2 Vérifier sur le build que chaque page porte l'attribut, et qu'il suit `CANTINE_INSTANT`

## 2. Détection avant la peinture

- [ ] 2.1 Script en ligne dans `app.html`, avant toute feuille de style : comparer le jour de Paris du navigateur à `data-jour-rendu`, poser `data-perime` s'ils diffèrent (D1, D2)
- [ ] 2.2 Commenter dans `app.html` pourquoi ce script existe malgré D32, et retirer la phrase qui affirme qu'aucun script ne s'exécute avant la peinture

## 3. Masquage

- [ ] 3.1 Règle globale : `html[data-perime]:not([data-hydrate]) .selon-le-jour { visibility: hidden }`, plus l'animation qui la lève à trois secondes (D3, D4)
- [ ] 3.2 Poser `.selon-le-jour` sur la zone dépendante du jour des écrans du jour et de la semaine

## 4. Vérification

- [ ] 4.1 e2e : page rendue le jour du navigateur, aucun masquage à aucun moment
- [ ] 4.2 e2e : page périmée, JavaScript de l'application bloqué — enseigne visible, zone masquée, puis visible au délai
- [ ] 4.3 e2e : page périmée, application normale — la zone apparaît avec le jour du navigateur
- [ ] 4.4 Passer `npm run validate`, `npm run build` et `npm run test:e2e` ; budgets inchangés
