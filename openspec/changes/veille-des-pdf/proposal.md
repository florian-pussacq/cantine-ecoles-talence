## Why

Le 16 octobre 2026, l'application a épuisé ses menus alors que la Ville avait publié novembre dès septembre. Personne ne regardait la page : la mise à jour dépend de quelqu'un qui pense à y aller. Le corpus couvre aujourd'hui jusqu'à fin janvier 2027 ; sans veille, la même panne reviendra en février.

`extraction-reproductible` a posé le socle : les données publiées se reproduisent depuis leur PDF, et chacune cite son document. Il reste à surveiller la source.

## What Changes

- Un script de veille, `scripts/veille-pdf.js`, lit la page des menus de la Ville et relève ses PDF de menus. Il les compare aux données publiées et dit ce qui demande une action :
  - un menu **nouveau**, qu'aucune donnée ne cite ;
  - un menu **republié**, dont l'empreinte a changé ;
  - un corpus **court**, qui couvre moins de quatorze jours à venir.
- Un workflow GitHub planifié le lance chaque matin. Il **échoue** quand une action est requise, avec un résumé de ce qu'il faut faire. GitHub notifie l'échec ; il n'y a ni issue ni pull request.
- `npm run veille` lance le même contrôle à la main. Le skill `menus-talence` s'en sert pour ses deux premières étapes, faites aujourd'hui à la main.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `menu-data` : la source est surveillée, et un écart avec les données publiées se signale.

## Impact

- `scripts/veille-pdf.js` (nouveau) et son test.
- `.github/workflows/veille.yml` (nouveau), en lecture seule sur le dépôt.
- `vite.config.ts` : les tests de `scripts/` rejoignent ceux de `src/`.
- `package.json` (`veille`), skill `menus-talence`, `docs/livraison.md`.
- Aucun changement de l'application ni des données.
