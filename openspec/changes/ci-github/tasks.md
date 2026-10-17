## 1. Tests indépendants de l'horloge

- [x] 1.1 Recenser les tests qui dépendent de l'horloge réelle : suite complète sous un instant postérieur au corpus
- [x] 1.2 Fixture automatique `e2e/test.ts` fixant l'horloge du navigateur ; specs migrées ; import direct interdit par ESLint (D5)
- [x] 1.3 `CANTINE_INSTANT` lu au pré-rendu par `horloge.svelte.ts`, posé par le `webServer` de Playwright ; absent du build livré (D6)
- [x] 1.4 Marqueur `data-hydrate` posé par la coque ; `hydratee(page)` avant la première touche du test clavier (D7)
- [x] 1.5 Vérifier : suite verte deux fois à l'instant par défaut ; sous un instant postérieur au corpus, les échecs du recensement reviennent — le résultat ne dépend plus que de l'instant fixé

## 2. Workflow

- [x] 2.1 Écrire `.github/workflows/verifier.yml` : déclencheurs PR et `main`, groupe de concurrence, Node depuis `.nvmrc`, cache npm
- [x] 2.2 Job `verifier` : `npm ci`, `npm run validate`, `npm run build`
- [x] 2.3 Job `e2e` : `npm ci`, installation de Chromium, `npm run test:e2e` avec `CI=true`, rapport en artefact sur échec — d'où un reporter HTML en CI, que `.gitlab-ci.yml` n'avait pas : son artefact était vide
- [x] 2.4 Reporter en commentaires les raisons de `.gitlab-ci.yml` qui valent toujours (D4, cache, `CI` et `reuseExistingServer`)

## 3. Nettoyage

- [x] 3.1 Supprimer `.gitlab-ci.yml`
- [x] 3.2 `netlify.toml` : « merge request » devient « pull request »
- [x] 3.3 Ajouter à `openspec/changes/menus-jour-semaine/design.md`, sous D2, une note datée renvoyant à ce changement, sans réécrire la décision

## 4. Plateforme (humain)

- [x] 4.1 Netlify : vérifier que le site est relié au dépôt GitHub, branche de production `main`, prévisualisations sur PR
- [x] 4.2 ~~GitHub : protéger `main`~~ — sans objet depuis le passage au tronc, le 17 octobre (D1, révision)
- [x] 4.3 Consigner ces réglages dans `docs/` (`docs/livraison.md`), puisque le dépôt ne peut pas les versionner

## 5. Vérification

- [x] 5.1 Passer `npm run validate`, `npm run build` et `npm run test:e2e` en local
- [x] 5.2 Ouvrir une PR et constater les deux vérifications en succès sur GitHub
