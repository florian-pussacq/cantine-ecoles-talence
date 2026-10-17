## 1. Contrat et données

- [x] 1.1 `month.schema.json` : `source.allergensDeclared`, booléen facultatif, documenté (D1) ; types régénérés
- [x] 1.2 `validate-data.js` : refuser `allergensDeclared: false` avec un code hors du pain
- [x] 1.3 `extract-menu-pdf.py` : poser `allergensDeclared: false` quand aucun plat hors du pain ne porte de code (D2) ; vérifier sur la Toussaint (faux) et sur Noël et les mensuels (absent)
- [x] 1.4 Jeu d'essai : un mois synthétique sans allergènes précisés

## 2. Interface

- [x] 2.1 Écran du jour : avertissement, avec lien vers le PDF, et sa variante quand des allergènes sont surveillés (D3)
- [x] 2.2 Détail de la journée : « Allergènes non communiqués » pour un plat sans code d'un tel jour
- [x] 2.3 Écran de la semaine : mention « Allergènes non précisés » sur un tel jour

## 3. Vérification et documentation

- [x] 3.1 Tests unitaires du libellé ; e2e sur la Toussaint réelle, une fois publiée par `menus-vacances`
- [x] 3.2 `docs/schema.md` : le champ et pourquoi il ne monte pas `schemaVersion`
- [x] 3.3 Passer `npm run validate`, `npm run build` et `npm run test:e2e`
