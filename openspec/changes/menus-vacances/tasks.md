## 1. Contrat

- [x] 1.1 `month.schema.json` : `title` facultatif ; `index.schema.json` : `file` facultatif, nature `vacation` ; types régénérés
- [x] 1.2 `validate-data.js` : reconnaître `AAAA-MM-vacances.json`, exiger un `title`, inscrire `kind` et `file` au manifeste

## 2. Extraction

- [x] 2.1 `extract-menu-pdf.py` : lire l'intitulé `VACANCES DE …` (D3) ; non-régression des mensuels
- [x] 2.2 Produire `2026-10-vacances.json` et `2026-12-vacances.json`, relire contre les PDF ; `data:index`

## 3. Chargement

- [x] 3.1 `load.ts` : charger `entry.file` quand il est présent ; `dataset.ts` : priorité de `vacation`, nature et intitulé portés par le jour résolu (D2, D4)
- [x] 3.2 Tests unitaires : manifeste à deux documents pour un mois, priorité, entrée inconnue ignorée

## 4. Interface

- [x] 4.1 Écran du jour : intitulé des vacances en tête de contenu
- [x] 4.2 Écran de la semaine : intitulé sur chaque jour de vacances

- [x] 4.3 Mention : « Vacances · … » quand le jour présenté par le système est un jour de vacances (D5)

## 5. Vérification et documentation

- [x] 5.1 e2e sur la Toussaint réelle : jour de vacances nommé, veille des vacances, semaine ; allergènes non précisés (`allergenes-non-communiques`, 3.1)
- [x] 5.2 `docs/schema.md` et skill `menus-talence` : les menus de vacances
- [x] 5.3 Passer `npm run validate`, `npm run build` et `npm run test:e2e`
