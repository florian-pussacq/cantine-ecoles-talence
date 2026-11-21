## 1. Les dessins

- [x] 1.1 Dessiner les 31 illustrations en gommettes, une par entrée du type `Illustration`, et les contrôler sur une planche de 20 à 96 px, sur le fond clair et sombre et sur les quatre aplats (D1, D2)
- [x] 1.2 Faire valider la série par Florian sur maquette, numéro par numéro, après reprise du gâteau (« carré ») et des légumineuses (« trio »)

## 2. Le sprite

- [x] 2.1 `sprite.svg` : remplacer les 31 symboles `ill-*` en gardant leurs identifiants, avec l'ombre de papier en silhouette décalée et l'inclinaison de chaque dessin (D3)
- [x] 2.2 Retirer les dégradés `lustre` et `assise`, que plus rien n'emploie, et réécrire l'en-tête : la grammaire de dessin et la recette de l'ombre (D2, D3)

## 3. Les tailles

- [x] 3.1 `tokens.css` : `--ill-plat` de 64 à 70 px et `--ill-ligne` de 32 à 36 px ; au palier large, de 76 à 84 px et de 40 à 44 px. `--ill-disque` ne change pas (D4)

## 4. Vérification

- [x] 4.1 `npm run validate && npm run build`, dont le budget JavaScript inchangé
- [x] 4.2 `npm run test:e2e`, l'interface étant touchée
