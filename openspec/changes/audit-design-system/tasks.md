## 1. Jetons

- [x] 1.1 `tokens.css` : `--text-2xs` (et sa valeur au palier large), `--radius-feuille`, `--voile`, chacun commenté par son usage (D2, D3)
- [x] 1.2 Ajouter `--voile` aux paires mesurées de `contrast.test.ts` s'il porte du texte ; corriger le commentaire qui dit couvrir `var(--on-table)` (le second, historique, est exact)

## 2. Composants

- [x] 2.1 Tailles de police : les huit valeurs en dur de `PlatCarte`, `DaySheet`, `AllergenChip`, `CommandeReglages`, la semaine et les réglages passent par `--text-2xs` ou `--text-xs`
- [x] 2.2 Rayons : les sept `999px`, le `16px`, le `20px` et le `11px` passent par leur jeton
- [x] 2.3 Voile de la fiche : `--voile`

## 3. Garde-fou

- [x] 3.1 `src/lib/design/design-tokens.test.ts` : lecture des styles, propriétés surveillées, liste d'exceptions commentée (D1)
- [x] 3.2 Vérifier qu'il échoue sur l'état actuel, avant les corrections de 2.x, puis qu'il passe après

## 4. Vérification

- [x] 4.1 Contrôle visuel à 320 px et sur écran large : cartes aux libellés les plus longs, fiche, semaine — captures avant et après sur le 29 septembre 2026 (six capsules « Bio ») : aucun retour à la ligne de plus (5 dans la semaine à 320 px, avant comme après ; 0 sur écran large)
- [x] 4.2 Passer `npm run validate`, `npm run build` et `npm run test:e2e`
