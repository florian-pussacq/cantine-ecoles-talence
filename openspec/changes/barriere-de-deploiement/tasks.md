## 1. Dépôt

- [x] 1.1 `netlify.toml` : commande `ignore` qui annule les constructions de production nées d'une poussée (D1), commentée
- [x] 1.2 `verifier.yml` : job `publier` après `verifier` et `e2e`, sur `push` vers `main` seulement ; tête de `main` comparée à `github.sha` (D2) ; échec explicite sans secret (D3) ; en-tête du fichier corrigé
- [x] 1.3 `docs/livraison.md` : le nouveau chemin, et le réglage du hook
- [x] 1.4 actionlint, `npm run validate`, `npm run build`

## 2. Plateforme (humain), avant la poussée de ce changement

- [ ] 2.1 Netlify : créer un build hook sur la branche `main`
- [ ] 2.2 GitHub : enregistrer son URL comme secret `NETLIFY_BUILD_HOOK`

## 3. Vérification sur le site réel

- [ ] 3.1 Pousser : la construction de production née de la poussée est annulée dans Netlify
- [ ] 3.2 La CI verte appelle le hook : Netlify construit et publie
