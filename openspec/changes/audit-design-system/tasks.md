## 1. Jetons

- [ ] 1.1 `tokens.css` : `--text-2xs` (et sa valeur au palier large), `--radius-feuille`, `--voile`, chacun commenté par son usage (D2, D3)
- [ ] 1.2 Ajouter `--voile` aux paires mesurées de `contrast.test.ts` s'il porte du texte ; corriger les deux commentaires qui citent `--on-table`

## 2. Composants

- [ ] 2.1 Tailles de police : les huit valeurs en dur de `PlatCarte`, `DaySheet`, `AllergenChip`, `CommandeReglages`, la semaine et les réglages passent par `--text-2xs` ou `--text-xs`
- [ ] 2.2 Rayons : les quatre `999px`, le `16px`, le `20px` et le `11px` passent par leur jeton
- [ ] 2.3 Voile de la fiche : `--voile`

## 3. Garde-fou

- [ ] 3.1 `src/lib/design/design-tokens.test.ts` : lecture des styles, propriétés surveillées, liste d'exceptions commentée (D1)
- [ ] 3.2 Vérifier qu'il échoue sur l'état actuel, avant les corrections de 2.x, puis qu'il passe après

## 4. Vérification

- [ ] 4.1 Contrôle visuel à 320 px et sur écran large : cartes aux libellés les plus longs, fiche, semaine
- [ ] 4.2 Passer `npm run validate`, `npm run build` et `npm run test:e2e`
