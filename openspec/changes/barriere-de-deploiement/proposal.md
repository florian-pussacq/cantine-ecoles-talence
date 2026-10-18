## Why

On développe sur `main`, et Netlify publie chaque poussée par son intégration Git. La CI tourne en parallèle : un `e2e` rouge signale un défaut **déjà en ligne**. Jusqu'ici, la seule barrière était la vérification locale, et elle dépend de la discipline de celui qui pousse.

Depuis le 17 octobre, des commits arrivent de plusieurs sessions. Le prochain gros changement, le code couleur unique, touche toutes les cartes. C'est le moment de faire de la CI une barrière et non plus un constat.

## What Changes

- `netlify.toml` : une commande `ignore` annule toute construction de production déclenchée par une poussée. Netlify n'annule jamais une construction déclenchée par un build hook : seul le hook publie.
- `.github/workflows/verifier.yml` : un job `publier`, sur `main` seulement, après `verifier` et `e2e` verts, qui appelle le build hook — à condition que le commit vérifié soit toujours la tête de `main`.
- Les prévisualisations de pull request ne sont pas touchées.
- Côté plateforme, à faire par un humain : créer le build hook dans Netlify, l'enregistrer comme secret GitHub `NETLIFY_BUILD_HOOK`.

## Capabilities

### Modified Capabilities

- `delivery` : la production ne reçoit plus qu'un commit que la CI a vérifié.

## Impact

- **Publication retardée** de la durée de la CI, environ deux minutes.
- **Un déploiement par lot** : plusieurs commits poussés ensemble ne publient qu'une fois, ce que `CLAUDE.md` recherchait déjà.
- **Ordre de mise en place impératif** : le secret doit exister avant que ce changement ne parte. Sinon les poussées cessent de publier et `publier` échoue.
- **Risque assumé** : plusieurs fils du forum Netlify signalent des comportements irréguliers de `ignore`. La vérification se fait sur le site réel, après mise en place.
