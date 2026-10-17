## Contexte

Sur GitLab, la chaîne était : GitLab CI vérifie, l'intégration Git de Netlify publie (D2 de `menus-jour-semaine`). La contrepartie, assumée alors, était qu'un `e2e` rouge n'empêchait pas Netlify de publier `main`.

GitHub change une donnée du problème : la protection de branche peut exiger que des vérifications passent **avant** qu'un commit atteigne `main`. La séquence stricte que GitLab ne donnait qu'au prix des prévisualisations devient accessible sans y renoncer.

## Décisions

### D1 — Netlify continue de publier ; `main` est gardée en amont

**Retenu :** l'intégration Git de Netlify reste la seule voie de publication. GitHub Actions vérifie. Une règle de protection sur `main` exige les jobs `verifier` et `e2e` et interdit la poussée directe.

**Écarté :** publier depuis Actions avec `netlify deploy --prod`. La séquence serait stricte même sans protection de branche, mais il faudrait un jeton Netlify dans les secrets du dépôt, une dépendance à `netlify-cli` dans la CI, et reconstruire à la main les prévisualisations de PR que Netlify donne aujourd'hui sans rien configurer. Plus de code, plus de secrets, pour une garantie que la protection de branche donne déjà.

Le prix : la garantie ne tient que tant que la protection est active, et elle se règle hors du dépôt. Elle n'est pas versionnable ; elle est donc listée en tâche et décrite dans `docs/`, pas seulement dans cette conversation.

### D2 — Les déclencheurs : PR et `main`, pas chaque branche

**Retenu :** `pull_request` et `push` sur `main`, avec un groupe de concurrence qui annule l'exécution périmée d'une même référence.

GitLab vérifiait chaque branche poussée et dédoublonnait à la main les pipelines de merge request. Ici, une branche sans PR n'est pas vérifiée : c'est un brouillon, et sa vérification est à portée de `npm run validate` en local. La poussée sur `main` reste vérifiée, pour qu'un éventuel contournement de la protection laisse au moins une trace rouge.

### D3 — Node depuis `.nvmrc`, actions par version majeure

`actions/setup-node` lit `node-version-file: .nvmrc`. Une seule déclaration de la version, pour Netlify, la CI et le poste de travail.

Les actions tierces sont épinglées par version majeure (`actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-artifact@v4`), toutes publiées par GitHub. Un épinglage par empreinte serait plus strict ; sans outil qui les fasse monter, il fige surtout des versions qu'on ne relit jamais. À revoir si une action non officielle entre.

### D4 — Chromium installé à la demande, comme sur GitLab

`npx playwright install --with-deps chromium`, plutôt qu'une image `mcr.microsoft.com/playwright` dont l'étiquette doit suivre `@playwright/test`. Le raisonnement de `.gitlab-ci.yml` tient toujours ; il est repris en commentaire.

### D5 — Une horloge fixée pour chaque test qui suppose un jour servi

Un test qui ouvre `/` sans fixer l'horloge teste « le jour où il tourne ». Quand ce jour n'a pas de suivant servi, l'écran dit « menu non publié » et le test échoue pour une raison qui n'est pas la sienne.

Chaque test concerné installe une horloge sur une date du corpus qui lui donne le cas qu'il vérifie, comme le font déjà trois tests de `retour.spec.ts`. Les tests dont c'est précisément l'objet de lire l'état réel — il n'y en a pas aujourd'hui — en seraient exemptés et le diraient.

Ce n'est pas figer une date pour faire passer un test : la date est l'entrée du test, au même titre que l'URL.

Conséquence connue : ces dates vivent dans le corpus. Le jour où un mois quitte `static/data/`, les tests qui s'y ancrent tombent, et c'est un échec qui dit la vérité.
