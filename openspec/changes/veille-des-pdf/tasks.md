## 1. Logique, testée d'abord

- [ ] 1.1 `vite.config.ts` : inclure `scripts/**/*.test.js`
- [ ] 1.2 `scripts/veille-pdf.test.js`, sur la page enregistrée le 18 octobre (fixture) : relevé des seuls liens `MENUS-WEB` ; constats nouveau, republié, déplacé ; mois passé silencieux ; horizon à moins de quatorze jours ; page sans menu (D1, D2)
- [ ] 1.3 `scripts/veille-pdf.js` : fonctions pures, puis la fonction principale (page, PDF, empreintes, résumé, code de sortie) (D4)

## 2. Exécution

- [ ] 2.1 `package.json` : `veille`
- [ ] 2.2 `.github/workflows/veille.yml` : `schedule` (D5) et `workflow_dispatch`, `contents: read`, résumé dans `$GITHUB_STEP_SUMMARY`
- [ ] 2.3 Lancer `npm run veille` contre la vraie page : aucun constat attendu au 18 octobre, sortie verte

## 3. Documentation

- [ ] 3.1 Skill `menus-talence` : `npm run veille` remplace les étapes 1 et 2 faites à la main
- [ ] 3.2 `docs/livraison.md` : la veille, sa notification, et sa réactivation après 60 jours d'inactivité

## 4. Vérification

- [ ] 4.1 Passer `npm run validate` et `npm run build`
