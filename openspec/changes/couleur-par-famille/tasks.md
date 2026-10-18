## 1. Jetons et mesures

- [ ] 1.1 `tokens.css` : retirer les sept `--role-*` et leur commentaire d'en-tête ; dire que `--fam-*` sert les deux écrans
- [ ] 1.2 `contrast.test.ts` : remplacer les paires de rôle par les cinq familles — glyphe blanc dessus, encre sur la carte, à 4,5:1
- [ ] 1.3 `design-tokens.test.ts` : `--role` n'est plus un jeton local

## 2. Carte

- [ ] 2.1 `PlatCarte` : la famille sur la carte principale (D3) — pastille, libellé du rôle, filet, vignette, nom de famille ; les autres en encre (D4)
- [ ] 2.2 Nom de la famille en clair (« Viande », « Volaille », « Poisson », « Végétarien »), rien pour l'inconnu
- [ ] 2.3 `Tray.test.ts` et tests de `PlatCarte` : la famille sur la principale, aucune couleur ailleurs

## 3. Vérification

- [ ] 3.1 e2e : le plat principal porte le nom de sa famille ; une autre carte n'en porte aucun
- [ ] 3.2 Contrôle visuel à 320 px, avant et après, sur un jour de chaque famille
- [ ] 3.3 Passer `npm run validate`, `npm run build` et `npm run test:e2e` ; budgets
