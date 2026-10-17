## 1. Garde-fou d'abord

- [x] 1.1 `design-tokens.test.ts` : lire `tokens.css` (règles de base), les attributs `style=` / `style:` du balisage (D7)
- [x] 1.2 Surveiller `font-weight` (exception `normal`), `font` (seul `inherit`), les raccourcis de bordure, `outline` et `box-shadow` pour la couleur (D3, D7)
- [x] 1.3 Surveiller durées et courbes dans `transition`, `animation` et leurs propriétés détaillées ; exception `0.01ms !important` commentée (D6)
- [x] 1.4 Refuser tout `var(--…)` d'une propriété surveillée qui n'est pas déclaré dans `tokens.css` (Risques)
- [x] 1.5 Corriger le commentaire sur les espacements (D8) ; vérifier que le test échoue sur l'état actuel et nomme les écarts

## 2. Jetons

- [x] 2.1 `tokens.css` : `--poids-moyen`, `--poids-fort`, `--poids-titre` (D3)
- [x] 2.2 `--voile-fond`, `--voile-trait`, renommer `--voile` en `--voile-modale` (D2)
- [x] 2.3 `--courbe`, `--apparition`, `--radius-focus` (D1, D6)
- [x] 2.4 Règles de base : `body` en `var(--text-base)`, focus en `var(--radius-focus)`, `.glisse` en `var(--courbe)`

## 3. Composants

- [x] 3.1 Graisses : toutes les déclarations passent par `--poids-*` ou `normal`
- [x] 3.2 Voiles : `Onglets`, `greve` → `--voile-fond` ; `CommandeSortie`, `RangNavigation` → `--voile-trait` ; `DaySheet` → `--voile-modale` ; `Enseigne` → `--ink-muted` ; `PiedSource` → `--bord` (D2)
- [x] 3.3 Mouvement : la transition de `DaySheet` en `var(--apparition) var(--courbe)`
- [x] 3.4 Espacements : les deux `4px` → `--space-1` (D8)

## 4. Contraste

- [x] 4.1 `contrast.test.ts` : lire les taux des voiles dans `tokens.css` ; `TRANSPARENCES` et `DECORATIFS` nomment le jeton ; retirer la ligne des 72 % (couverte par `ink-muted` sur `fond`) et celle des 22 % (devenu `--bord`)
- [x] 4.2 Le contrôle de couverture continue de refuser un `color-mix` d'encre en dur dans un composant

## 5. Vérification

- [x] 5.1 Contrôle visuel à 320 px et sur écran large, avant et après : enseigne, situation du jour, pied de source, onglets, commandes de navigation, fiche, réglages (« Menu de grève »). Comparaison au pixel sur jour, fiche, semaine, réglages et grève : seuls diffèrent le nom de l'enseigne, le filet et le texte du pied de source, et le « Détail non publié » ; la fiche elle-même est identique ; « Menu de grève » passe à 15 px sur téléphone et 16 px sur écran large
- [x] 5.2 `npm run validate`, `npm run build`, `npm run test:e2e`
