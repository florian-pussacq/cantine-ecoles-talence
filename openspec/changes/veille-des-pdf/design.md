## Context

La page <https://www.talence.fr/quotidien/enfance-scolarite/menu-ecoles/> liste, au 18 octobre 2026, dix PDF. Sept sont des menus, reconnaissables à `MENUS-WEB` dans leur nom ; les trois autres sont un calendrier, un guide et l'affichage de l'origine des viandes. Les mois passés disparaissent de la page (août et septembre n'y sont plus). Chaque fichier de `static/data/` cite son PDF dans `source.pdfUrl` et son empreinte dans `source.pdfSha256`. Une réédition change l'URL (septembre est passé de `/uploads/2026/06/` à `/uploads/2026/08/`), mais garde le nom de fichier.

Le dépôt est public, et sur GitHub Node 24 (`.nvmrc`) a `fetch` et `crypto` sans aucune dépendance.

## Goals / Non-Goals

**Goals:**

- Apprendre qu'un menu a paru ou changé le jour même, sans aller voir.
- Être prévenu avant que le corpus ne s'épuise, même si la Ville ne publie rien.
- Un seul contrôle, le même à la main et dans le workflow.

**Non-Goals:**

- Extraire et publier automatiquement (D3).
- Surveiller les PDF qui ne sont pas des menus.
- Juger le contenu d'un PDF : la veille compare des empreintes, l'extraction et son test font le reste.

## Decisions

### D1 — Trois constats, et un seul qui ne demande rien

Pour chaque PDF de menu sur la page, retrouvé dans les données par son nom de fichier :

- **nouveau** : aucune donnée ne cite ce nom → action ;
- **republié** : le nom est cité, l'empreinte diffère → action ;
- **déplacé** : même nom, même empreinte, autre URL → avertissement seulement. Le document n'a pas changé, mais la prochaine extraction devra prendre la nouvelle URL (skill, étape 1).

S'y ajoute le **corpus court** : le dernier jour publié tombe à moins de quatorze jours de la date du jour à Paris → action. C'est le constat qui aurait évité la panne du 16 octobre, où rien n'avait changé côté données mais où le temps avait passé.

Un PDF cité mais absent de la page n'est pas un constat : c'est un mois passé.

### D2 — Une page sans menu est une panne, pas une bonne nouvelle

Si la page ne répond pas, ou si elle ne contient aucun lien de menu, la veille échoue et le dit, plutôt que de conclure qu'il n'y a rien de nouveau. Une page refondue par la Ville rendrait sinon la veille muette pour toujours.

### D3 — Le workflow échoue ; il n'ouvre ni issue ni pull request

Quand une action est requise, le job échoue, et son résumé (`$GITHUB_STEP_SUMMARY`) liste les constats et la commande à suivre. GitHub notifie l'échec d'un workflow planifié par courriel.

- **Pas d'issue** : OpenSpec est le seul tracker du dépôt (`CLAUDE.md`). Une issue par mois serait un second tracker, alimenté par un robot.
- **Pas de pull request d'extraction** : le dépôt travaille sur le tronc, sans pull request ; et une extraction demande un jugement humain (le thème « ZOOM SUR » et sa note, le nom d'un menu de vacances). Pousser le résultat publierait sans relecture.

Le rouge a donc le sens qu'il a ailleurs dans la CI : quelque chose est à faire. Il le reste chaque matin tant que ce n'est pas fait, ce qui sert de rappel.

### D4 — Node, sans dépendance

`scripts/veille-pdf.js`, comme `validate-data.js`. Le workflow n'a besoin ni de `npm ci` ni de Python : `fetch` et `crypto` suffisent. La logique (relever les liens, classer, calculer l'horizon) est faite de fonctions pures, testées avec une page HTML enregistrée et sans réseau. Le seul accès réseau est dans la fonction principale.

Les tests vivent sous `scripts/` et rejoignent `npm run validate` : `vite.config.ts` inclut `scripts/**/*.test.js`.

### D5 — Chaque matin, en semaine comme le week-end

`cron: '17 5 * * *'`, soit 7 h 17 l'été et 6 h 17 l'hiver à Paris, avant qu'on regarde le menu. La minute 17 évite l'heure pile, où GitHub retarde les exécutions. Le workflow accepte aussi `workflow_dispatch`, pour le lancer à la main. La requête s'identifie par son `User-Agent` et télécharge sept PDF par jour : une charge négligeable pour le site de la Ville.

## Risks / Trade-offs

- [Dépôt public] GitHub désactive un workflow planifié après 60 jours sans activité sur le dépôt, et l'été sans menus peut durer plus longtemps. → GitHub prévient par courriel avant de le désactiver. `docs/livraison.md` dit comment le réactiver.
- [Notification] GitHub notifie l'échec d'un workflow planifié à qui a modifié son `cron` en dernier. → Le dire dans `docs/livraison.md` ; c'est l'auteur du dépôt.
- [Faux positif réseau] Une page momentanément injoignable fait échouer un matin. → Le message distingue la panne réseau d'un constat. Le lendemain, le rouge disparaît de lui-même.
- [Réédition sous un autre nom] Si la Ville renomme un PDF réédité (`…-2026-2.pdf`), la veille le voit comme nouveau. → C'est vrai du point de vue de l'action à mener : le traiter.
