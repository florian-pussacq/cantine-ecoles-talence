## 1. Test d'abord

- [ ] 1.1 `scripts/test_extraction.py` (`unittest`) : pour chaque fichier de `static/data/`, retrouver le PDF par `source.pdfUrl`, relancer le script en sous-processus (sortie standard, `--merge` ou `--greve`), comparer le document entier sans `fetchedAt` (D3, D4)
- [ ] 1.2 Complétude : tout PDF de `sources/pdf/` est cité, toute donnée a son PDF
- [ ] 1.3 Constater le rouge avec l'import `fitz` : la sortie standard n'est pas un JSON valide

## 2. Dépendance et import

- [ ] 2.1 `scripts/requirements.txt` : `pymupdf==1.28.2` (D1)
- [ ] 2.2 `extract-menu-pdf.py` : `import pymupdf`, message d'absence pointant vers `scripts/requirements.txt` (D2)
- [ ] 2.3 Constater le vert ; puis une mutation du parser (un rôle inversé) fait échouer le test en nommant le fichier

## 3. Outillage

- [ ] 3.1 `package.json` : `test:extraction`
- [ ] 3.2 CI : job `extraction` (Python, `pip install -r scripts/requirements.txt`, le test), hors des `needs` de `publier` (D5)
- [ ] 3.3 `CLAUDE.md` et skill `menus-talence` : installation, et le test pour tout commit qui touche l'extracteur, ses dépendances ou `sources/pdf/`

## 4. Vérification

- [ ] 4.1 Passer `npm run validate`, `npm run build` et `npm run test:extraction`
