## 1. Mesure

- [x] 1.1 `check-budget.js` : lire le manifeste de Vite, et pour chaque page pré-rendue ses modules nommés ; fermeture par imports statiques ; CSS par le champ `css` (D1, D2)
- [x] 1.2 Échec sur une page sans module ou un module absent du manifeste ; exception nommée pour `404.html` (D4)
- [x] 1.3 Trois budgets et le rapport : page la plus lourde, détail par page, modules les plus lourds de la page fautive (D3)

## 2. Preuves

- [x] 2.1 Chiffres du rapport égaux à la mesure manuelle du 18 octobre (48,4 Ko pour l'écran du jour, 57,9 Ko pour la somme)
- [x] 2.2 Mutations : un module lourd importé statiquement par l'écran du jour fait échouer le budget par page en nommant `index.html` ; le même importé à la demande ne compte que dans la somme ; un plafond de somme abaissé fait échouer la somme
- [x] 2.3 Mutation : un nœud absent du manifeste fait échouer la mesure (D4)

## 3. Documentation

- [x] 3.1 PRD §8 : « JavaScript < 60 Ko gzip par page, < 80 Ko pour l'ensemble préchargé »
- [x] 3.2 Commentaire d'en-tête de `check-budget.js` : la mesure et pourquoi

## 4. Vérification

- [x] 4.1 Passer `npm run validate` et `npm run build`
