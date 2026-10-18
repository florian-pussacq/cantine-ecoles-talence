## 1. Tests d'abord

- [ ] 1.1 `contrast.test.ts` : lire deux palettes (hors média, et bloc sombre) ; exécuter paires, voiles et familles sur chacune ; exiger une palette sombre complète (D4)
- [ ] 1.2 `contrast.test.ts` : lever l'interdiction de `prefers-color-scheme` pour `tokens.css` seul ; la garder pour les composants, et celle de `data-theme` partout

## 2. Palette

- [ ] 2.1 `tokens.css` : le bloc sombre, valeurs de l'audit complétées selon D3, avec `color-scheme: dark`
- [ ] 2.2 `app.html` : deux `theme-color` par média (D5)

## 3. Vérification

- [ ] 3.1 e2e : sous `colorScheme: 'dark'`, le fond de page est celui de la palette sombre ; sous `light`, celui de la claire
- [ ] 3.2 Contrôle visuel, clair et sombre, 320 px et bureau : jour, semaine, fiche ouverte, réglages, grève, bandeaux ; pictogrammes d'allergène et illustrations
- [ ] 3.3 Passer `npm run validate`, `npm run build` et `npm run test:e2e` ; budgets
