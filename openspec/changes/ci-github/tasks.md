## 1. Tests indépendants de l'horloge

- [ ] 1.1 Recenser les tests de bout en bout qui ouvrent un écran sans fixer l'horloge et supposent un jour servi
- [ ] 1.2 Fixer l'horloge de chacun sur une date du corpus qui lui donne son cas (D5)
- [ ] 1.3 Vérifier la suite sous une horloge système postérieure au corpus (`faketime` ou date forcée du navigateur pour tous les tests) : même résultat qu'à une date couverte

## 2. Workflow

- [ ] 2.1 Écrire `.github/workflows/verifier.yml` : déclencheurs PR et `main`, groupe de concurrence, Node depuis `.nvmrc`, cache npm
- [ ] 2.2 Job `verifier` : `npm ci`, `npm run validate`, `npm run build`
- [ ] 2.3 Job `e2e` : `npm ci`, installation de Chromium, `npm run test:e2e` avec `CI=true`, rapport en artefact sur échec
- [ ] 2.4 Reporter en commentaires les raisons de `.gitlab-ci.yml` qui valent toujours (D4, cache, `CI` et `reuseExistingServer`)

## 3. Nettoyage

- [ ] 3.1 Supprimer `.gitlab-ci.yml`
- [ ] 3.2 `netlify.toml` : « merge request » devient « pull request »
- [ ] 3.3 Ajouter à `openspec/changes/menus-jour-semaine/design.md`, sous D2, une note datée renvoyant à ce changement, sans réécrire la décision

## 4. Plateforme (humain)

- [ ] 4.1 Netlify : vérifier que le site est relié au dépôt GitHub, branche de production `main`, prévisualisations sur PR
- [ ] 4.2 GitHub : protéger `main` — PR obligatoire, vérifications `verifier` et `e2e` exigées
- [ ] 4.3 Consigner ces réglages dans `docs/` (`docs/livraison.md`), puisque le dépôt ne peut pas les versionner

## 5. Vérification

- [ ] 5.1 Passer `npm run validate`, `npm run build` et `npm run test:e2e` en local
- [ ] 5.2 Ouvrir une PR et constater les deux vérifications en succès sur GitHub
