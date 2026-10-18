## 1. Préparation

- [ ] 1.1 Captures de référence, avant : jour, semaine, fiche ouverte, réglages, grève, 404 ; mobile et bureau

## 2. Jetons

- [ ] 2.1 Renommer les jetons selon la table de D4 dans `tokens.css`, les styles des composants et `static/404.html`, sur des noms entiers
- [ ] 2.2 `--ring` → `--anneau` dans `PlatCarte` et dans `JETONS_LOCAUX`
- [ ] 2.3 `contrast.test.ts` : les paires citées par leur nouveau nom ; commentaires et `scripts/make-icons.py`
- [ ] 2.4 `design-tokens.test.ts` : refuser les racines anglaises retirées (D5)

## 3. Composants

- [ ] 3.1 `Tray` → `ListeDuJour`, `DaySheet` → `FicheJour`, `AllergenChip` → `PastilleAllergene`, `ExternalLink` → `LienExterne`, avec leurs tests et leurs imports

## 4. Vérification

- [ ] 4.1 Aucune occurrence d'un ancien nom hors des archives (`grep`)
- [ ] 4.2 Captures après, comparées au pixel à celles de 1.1
- [ ] 4.3 Passer `npm run validate`, `npm run build` et `npm run test:e2e` ; un seul commit, sans autre changement (D6)
