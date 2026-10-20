## Context

La barrière de déploiement (`barriere-de-deploiement`, archivée le 18 octobre 2026) a fait de la CI le seul chemin vers la production : `netlify.toml` annule toute construction née d'une poussée, et le job `publier` de `verifier.yml` appelle le build hook quand `verifier` et `e2e` réussissent, si le commit vérifié est encore la tête de `main`.

Ce changement garde la barrière et retire l'automatisme : la décision de publier revient à l'humain.

## Goals / Non-Goals

**Goals:**

- Une poussée verte ne publie rien.
- Publier est un geste explicite, possible depuis un téléphone.
- On ne peut toujours publier qu'une tête de `main` vérifiée.
- La garantie se lit dans le dépôt.

**Non-Goals:**

- Publier un commit autre que la tête de `main` (retour en arrière) : Netlify le permet déjà depuis son interface, en republiant un déploiement précédent.
- Attendre la fin d'une CI en cours : le workflow refuse et dit de relancer.
- Notifier quand une publication est possible.

## Decisions

### D1 — Un workflow à part, déclenché à la main

`.github/workflows/publier.yml` ne connaît que `workflow_dispatch`. Le geste : _Actions → publier → Run workflow_, sur le site ou dans l'application mobile de GitHub.

Écartée : l'approbation d'un environnement GitHub (« Approve and deploy » sur le job `publier`). Le geste est plus naturel, mais le caractère manuel tiendrait alors à un réglage du dépôt, invisible dans le code : si l'environnement perdait sa règle, la publication redeviendrait automatique sans que rien ne le signale. C'est le défaut que la barrière voulait éviter, déplacé.

Écartée : _Trigger deploy_ dans l'interface Netlify. Il publie sans regarder la CI.

### D2 — La barrière : les deux vérifications de la tête de `main`

Le workflow lit la tête de `main`, puis la dernière exécution de `verifier.yml` déclenchée par une poussée sur ce commit, puis ses jobs. Il publie seulement si `verifier` et `e2e` y sont en succès.

Il regarde les jobs et non la conclusion de l'exécution : `extraction` fait partie du même workflow et ne doit pas retenir la publication (`extraction-reproductible`, D5). Une exécution rouge pour la seule extraction reste publiable.

Refus, chacun avec un message qui nomme le commit et ce qui manque :

- aucune exécution de `verifier` pour ce commit ;
- exécution en cours ;
- `verifier` ou `e2e` autre qu'en succès.

Le jeton du workflow suffit, avec `actions: read` en plus de `contents: read`.

### D3 — Déclenché depuis `main` seulement

`workflow_dispatch` laisse choisir la branche. Le build hook construit toujours `main`, quelle que soit la branche choisie. Lancé depuis une autre branche, le workflow refuse : on croirait publier cette branche.

### D4 — La fenêtre reste celle qu'on a acceptée

Entre la lecture de la tête de `main` et la récupération par Netlify, une poussée peut passer. C'est la fenêtre déjà acceptée par `barriere-de-deploiement`, D2 ; elle ne s'élargit pas. Elle se réduit même en pratique : la poussée et la publication sont maintenant deux gestes du même humain.

### D5 — Le secret toujours vérifié d'abord

L'absence de `NETLIFY_BUILD_HOOK` fait échouer le workflow en le nommant, comme le job actuel (`barriere-de-deploiement`, D3).

## Risks / Trade-offs

- [Oubli de publier] Les menus d'un nouveau mois sont poussés, mais rien n'est publié. → Le skill `menus-talence` termine sur « pousser, puis publier » ; la veille ne voit que les données du dépôt et ne détecte pas cet oubli. Accepté : l'humain l'a demandé.
- [Geste caché] Le bouton vit dans l'onglet Actions. → `docs/livraison.md` et le README donnent le chemin exact.
- [API GitHub] La barrière dépend de l'API des exécutions. → En cas d'échec de l'appel, le workflow refuse : il ne publie jamais sur un doute.
