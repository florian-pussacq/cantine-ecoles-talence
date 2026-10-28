## 1. Veille : la réédition renommée

- [x] 1.1 `scripts/veille-pdf.test.js` : réédition renommée (action, document remplacé, fichier de données) ; même empreinte sous un nom suffixé (déplacé) ; nom exact prioritaire ; l'année n'est pas un suffixe (D1, D2)
- [x] 1.2 `scripts/veille-pdf.js` : constat `renomme`, et sa ligne au rapport

## 2. Comparaison des menus

- [x] 2.1 `scripts/diff-menus.test.js` : plat remplacé, allergène ajouté, label retiré, créneau ajouté ou retiré, genre du jour, thème et note, jour ajouté ou retiré, reformatage silencieux, fichier nouveau ou supprimé (D3)
- [x] 2.2 `scripts/diff-menus.js` : fonction pure, puis la fonction principale (copie de travail contre `HEAD`)
- [x] 2.3 `package.json` : `data:diff`
- [x] 2.4 Rejouer `data:diff` sur `1a84121` contre son parent : les six changements de novembre et janvier, rien d'autre

## 3. Procédure

- [x] 3.1 Skill `menus-talence` : la réédition renommée (PDF à remplacer, `--merge` sur le fichier existant) ; un « nouveau » qui recouvre un mois publié ; `data:diff` pour rendre compte ; le navigateur des tests de bout en bout (D4)

## 4. Vérification

- [x] 4.1 Passer `npm run validate` et `npm run build`
- [x] 4.2 Lancer `npm run veille` contre la vraie page : rien à faire au 28 octobre
