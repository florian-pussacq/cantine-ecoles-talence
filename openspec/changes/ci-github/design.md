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

### D5 — Une horloge fixée par défaut pour tous les tests

Un test qui ouvre `/` sans fixer l'horloge teste « le jour où il tourne ». Quand ce jour n'a pas de suivant servi, l'écran dit « menu non publié » et le test échoue pour une raison qui n'est pas la sienne. Mesuré : une horloge postérieure au corpus fait tomber 41 tests sur 129.

**Retenu :** une fixture automatique, dans `e2e/test.ts`, installe l'horloge du navigateur sur `INSTANT_PAR_DEFAUT` (un mercredi servi du corpus) avant chaque test. Un test qui a besoin d'un autre jour réinstalle l'horloge ; Playwright accepte la seconde installation et elle remplace la première. ESLint interdit aux specs d'importer `test` depuis `@playwright/test`.

**Écarté :** fixer l'horloge test par test, ce que prévoyait la première version de ce design. Le test suivant qui l'oublierait rouvrirait le défaut ; le défaut doit être la sûreté, pas la vigilance.

Ce n'est pas figer une date pour faire passer un test : la date est l'entrée du test, au même titre que l'URL. Les dates vivent dans le corpus ; le jour où un mois quitte `static/data/`, les tests qui s'y ancrent tombent, et c'est un échec qui dit la vérité.

### D6 — Le pré-rendu reçoit le même instant que le navigateur

Le site est pré-rendu : le HTML livré énonce le jour résolu **au build**, puis l'hydratation résout de nouveau avec l'horloge du navigateur. Fixer seulement la seconde a fait tomber huit tests : ceux qui lisent l'écran avant l'hydratation, et `coque.spec.ts`, qui mesure précisément que l'hydratation ne déplace rien — vrai seulement si les deux résolutions tombent le même jour.

**Retenu :** au pré-rendu seulement, `horloge.svelte.ts` lit l'instant de départ dans `CANTINE_INSTANT` s'il est posé. La configuration Playwright le pose dans l'environnement de son `webServer`, à partir de la même constante que la fixture. Le build de production ne le pose pas ; la variable est absente du JavaScript livré.

**Écarté :** faire attendre l'hydratation aux tests. Cela ne répare pas le test qui mesure l'hydratation elle-même, et cela masquerait le défaut suivant au lieu de le nommer.

**Défaut produit révélé, hors périmètre :** en production, le build n'a lieu qu'à la poussée. Tout visiteur d'un jour postérieur voit d'abord le menu du jour du build, puis l'écran change à l'hydratation. Il est consigné au backlog ; une reconstruction quotidienne en est la piste.

### D7 — Un marqueur d'hydratation, pour ne rien envoyer dans le vide

Une fois le pré-rendu aligné, un dernier test tombait sous la charge de la suite complète, et jamais isolé (20 passages sur 20) : il pressait une flèche avant que l'écouteur clavier soit branché. Le HTML pré-rendu est complet et visible avant l'hydratation, et une touche envoyée dans cet intervalle est perdue sans erreur.

**Retenu :** la coque pose `data-hydrate` sur `<html>` à son montage, qui suit celui de l'écran. `e2e/test.ts` exporte `hydratee(page)`, que les tests appellent avant une première interaction clavier.

**Écarté :** une attente fixe. Elle masque la course au lieu de la fermer, et rougit de nouveau sur une machine plus lente.

**Écarté :** attendre l'hydratation dans chaque `goto`. `coque.spec.ts` mesure justement l'avant et l'après ; l'attente doit rester un choix du test.

