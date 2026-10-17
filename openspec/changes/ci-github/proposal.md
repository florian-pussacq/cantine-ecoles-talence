## Why

Le dépôt a quitté GitLab pour GitHub, et `.gitlab-ci.yml` est parti avec lui sans que rien ne le remplace. Aujourd'hui, aucune branche ni aucune PR n'est vérifiée, et les tests de bout en bout ne tournent nulle part : Netlify ne rejoue que `validate` et `build`.

Ce que cela coûte, constaté le 16 octobre 2026 : le corpus s'est épuisé, l'application dit « menu non publié », et quatorze tests de bout en bout sont passés au rouge. Personne ne l'a vu, parce que personne ne les exécutait.

Ces quatorze tests ont aussi montré une faiblesse : ils lisent l'horloge de la machine. Ils tombent au calendrier, sans qu'aucun code ait changé. Brancher une CI bloquante sur eux en l'état produirait une barrière qui rougit seule, et qu'on apprend vite à contourner.

## What Changes

- Un workflow GitHub Actions, `.github/workflows/verifier.yml`, qui reprend les deux jobs de GitLab : `verifier` (`npm run validate && npm run build`) et `e2e` (Chromium installé à la demande, rapport Playwright en artefact sur échec). Déclenché sur chaque PR et sur chaque poussée vers `main`.
- La version de Node est lue dans `.nvmrc` : la duplication assumée dans `.gitlab-ci.yml` disparaît.
- Les tests de bout en bout qui dépendent de l'horloge réelle la fixent, sur une date du corpus dont ils ont besoin.
- `.gitlab-ci.yml` est supprimé ; le vocabulaire « merge request » de `netlify.toml` suit.
- Côté plateforme, hors du dépôt et à faire par un humain : relier le site Netlify au dépôt GitHub. La protection de `main` envisagée d'abord est abandonnée avec le passage au tronc (design, D1).

Hors périmètre : publier depuis GitHub Actions (voir design, D1), et une veille planifiée des PDF de la Ville (consignée au backlog).

## Capabilities

### New Capabilities

- `delivery` : ce qui est vérifié avant qu'un changement atteigne `main`, et donc la production.

## Impact

- **Nouveaux fichiers** : `.github/workflows/verifier.yml`.
- **Supprimés** : `.gitlab-ci.yml`.
- **Tests** : `e2e/retour.spec.ts`, `qualite.spec.ts`, `balayage.spec.ts`, `hauteur.spec.ts` fixent leur horloge ; leur comportement n'est plus lié au jour où ils tournent.
- **Mode de travail** : développement sur le tronc, sans PR. La CI sur `main` constate après la publication ; la barrière est la vérification locale.
- **Risque** : la protection de branche et le lien Netlify se règlent dans des interfaces que le dépôt ne versionne pas. Le design en donne la liste, pour qu'elle ne vive pas seulement dans une mémoire.
