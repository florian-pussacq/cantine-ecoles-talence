## Why

Le site est pré-rendu : le HTML livré énonce le jour résolu **au moment du build**. Netlify ne reconstruit qu'à la poussée, et le service worker sert ce HTML depuis son cache sans jamais le revalider, jusqu'à ce qu'une nouvelle version soit appliquée. Le HTML qu'un parent reçoit peut donc avoir des semaines.

À l'ouverture, il voit d'abord le menu du jour du build, sous la mention « Aujourd'hui ». Puis l'hydratation le remplace par le bon. C'est bref, mais c'est un menu faux, présenté comme celui du jour — la classe de défaut que ce site existe pour éviter.

Une reconstruction quotidienne, d'abord envisagée, ne règle rien pour l'application installée, qui garde le HTML de sa version, et elle ferait apparaître chaque jour le bandeau « Une nouvelle version est disponible ».

## What Changes

- Au pré-rendu, la page porte le jour civil de Paris pour lequel elle a été rendue.
- Un script en ligne de quelques lignes, dans `<head>`, compare ce jour à celui du navigateur avant la première peinture. S'ils diffèrent, il marque la page comme périmée.
- Une page périmée masque la zone qui dépend du jour (écran du jour, écran de la semaine) jusqu'à l'hydratation, signalée par le marqueur `data-hydrate` déjà posé par la coque. L'enseigne, les onglets et le pied restent visibles. La place de la zone est conservée.
- Si l'hydratation n'arrive pas, la zone réapparaît d'elle-même après un délai : une page blanche serait pire qu'un menu qui nomme son jour.

Hors périmètre : la reconstruction quotidienne et la barrière de déploiement par build hook (backlog).

## Capabilities

### Modified Capabilities

- `menu-browsing` : aucun menu d'un autre jour n'est montré comme celui du jour à la première peinture.

## Impact

- **Script bloquant réintroduit**, trois lignes, sans dépendance. D32 l'avait refusé pour la pastille d'allergènes, défaut « inoffensif » ; le critère de D32 conclut ici dans l'autre sens (design, D1).
- **CSP inchangée** : `'unsafe-inline'` y est déjà, pour SvelteKit. La dette notée par D21 demeure.
- **Hook serveur** : `transformPageChunk` injecte le jour du rendu, à côté du sprite.
- **Tests** : la couture `CANTINE_INSTANT` permet enfin de construire une page périmée à dessein — pré-rendu à un jour, navigateur à un autre.
