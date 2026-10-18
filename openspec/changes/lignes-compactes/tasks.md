## 1. Composant

- [x] 1.1 `PlatCarte` : forme `compacte` — pas de vignette, pastille réduite, libellé, nom ou absence, mentions et signalement sur une ligne (D3)
- [x] 1.2 `Tray` : la forme compacte pour un rôle sans plat (D1)
- [x] 1.3 Écran du jour : la forme compacte pour le goûter, toujours dans sa cible (D2)

## 2. Tests

- [x] 2.1 `Tray.test.ts` : un rôle absent est une ligne compacte, sans vignette ; un rôle servi reste une carte
- [x] 2.2 e2e : le goûter est une ligne compacte qui ouvre la fiche et récupère le focus ; la première carte reste visible
- [x] 2.3 Contrôle visuel à 320 px, avant et après, sur un jour à rôle absent et goûter publié

## 3. Vérification

- [x] 3.1 Passer `npm run validate`, `npm run build` et `npm run test:e2e` ; budgets
