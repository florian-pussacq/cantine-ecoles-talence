## 1. Workflows

- [x] 1.1 `verifier.yml` : retirer le job `publier` et la mention de la publication dans son en-tête
- [x] 1.2 `publier.yml` : `workflow_dispatch` seul ; refus hors de `main` (D3) ; secret vérifié d'abord (D5)
- [x] 1.3 `publier.yml` : barrière sur les jobs `verifier` et `e2e` de la dernière exécution de poussée sur la tête de `main` ; refus nommé si absente, en cours ou rouge ; refus si l'API échoue (D2)
- [x] 1.4 Éprouver la logique de la barrière contre l'API réelle sur les exécutions existantes (une verte, une rouge en `e2e`), sans appeler le hook — logique dans `scripts/barriere-publication.js`, testée hors réseau (8 tests) ; contre l'API réelle : `a4acf4a` accordé, `46ea81b` refusé sur `e2e`, branche `essai` refusée

## 2. Documentation

- [x] 2.1 `docs/livraison.md` : le chemin, le geste exact, les refus
- [x] 2.2 `README.md` : schéma et paragraphe « La livraison »
- [x] 2.3 `CLAUDE.md` : une poussée ne met plus en ligne
- [x] 2.4 Skill `menus-talence` : terminer par « pousser, puis publier »

## 3. Preuves

- [x] 3.1 Passer `npm run validate` et `npm run build`
- [ ] 3.2 Après poussée, par l'humain : la CI verte ne publie pas ; _Run workflow_ publie ; un lancement pendant une CI en cours est refusé
