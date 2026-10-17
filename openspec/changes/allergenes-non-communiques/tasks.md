## 1. Contrat et données

- [ ] 1.1 `month.schema.json` : `source.allergensDeclared`, booléen facultatif, documenté (D1) ; types régénérés
- [ ] 1.2 `validate-data.js` : refuser `allergensDeclared: false` avec un code hors du pain
- [ ] 1.3 `extract-menu-pdf.py` : poser `allergensDeclared: false` quand aucun plat hors du pain ne porte de code (D2) ; vérifier sur la Toussaint (faux) et sur Noël et les mensuels (absent)
- [ ] 1.4 Jeu d'essai : un mois synthétique sans allergènes précisés

## 2. Interface

- [ ] 2.1 Écran du jour : avertissement, avec lien vers le PDF, et sa variante quand des allergènes sont surveillés (D3)
- [ ] 2.2 Détail de la journée : « Allergènes non communiqués » pour un plat sans code d'un tel jour
- [ ] 2.3 Écran de la semaine : mention « Allergènes non précisés » sur un tel jour

## 3. Vérification et documentation

- [ ] 3.1 Tests unitaires du libellé ; e2e sur la Toussaint réelle, une fois publiée par `menus-vacances`
- [ ] 3.2 `docs/schema.md` : le champ et pourquoi il ne monte pas `schemaVersion`
- [ ] 3.3 Passer `npm run validate`, `npm run build` et `npm run test:e2e`
