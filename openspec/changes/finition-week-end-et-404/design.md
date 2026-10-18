## Context

`resolveDisplayDay` (`src/lib/data/resolve.ts`) rend la cible présentée. Quand aujourd'hui n'est pas servi, il pose `skipped` à la nature du jour courant telle que les données la connaissent, ou `null`. Il le calcule lui-même, et non l'écran (D60). `targetEyebrow` (`src/lib/menu/labels.ts`) en tire la mention : férié, puis vacances, puis la générique. Le schéma connaît déjà la nature `weekend`, mais l'extraction ne la produit pas : les mensuels ne listent que du lundi au vendredi.

`static/404.html` est servie par Netlify pour toute adresse inconnue, sans passer par SvelteKit (`fallback: undefined`). Elle recopie ses couleurs, faute de pouvoir lire `tokens.css`, et ces copies sont celles de l'ancienne ardoise.

## Goals / Non-Goals

**Goals:**

- Le week-end se dit comme le férié se dit.
- Une page 404 qu'on reconnaît comme une page de l'application, en clair comme en sombre.
- Des copies de couleurs qui ne peuvent plus diverger en silence.

**Non-Goals:**

- Faire passer la 404 par SvelteKit : une page d'erreur qui dépendrait de l'application échouerait avec elle.
- Produire des jours `weekend` dans les données.

## Decisions

### D1 — Le résolveur reconnaît le week-end

`skipped` vaut la nature connue du jour courant, sinon `'weekend'` si ce jour est un samedi ou un dimanche à Paris, sinon `null`. Le calcul reste dans le résolveur, qui connaît déjà la date de Paris (D60) ; l'écran n'apprend rien de nouveau, il lit un champ qu'il lit déjà.

Un jour courant connu des données l'emporte : un samedi qui serait marqué férié reste un férié.

### D2 — « Week-end · service dans 2 jours », comme le férié

La mention suit le motif du férié : « Week-end · service demain » le dimanche, « Week-end · service dans 2 jours » le samedi. Nommer le jour (« service lundi ») ferait doublon : la date présentée, « Lundi 19 octobre », est écrite juste en dessous.

Les vacances gardent la priorité sur le week-end, comme elles l'ont aujourd'hui sur la générique : la veille des vacances, ce qui compte est que tous les enfants n'y déjeunent pas (`menus-vacances`, D5). L'e2e du 17 octobre le garde déjà.

### D3 — La 404 reprend les jetons, par copie gardée

Elle déclare les jetons qu'elle emploie sous leur nom (`--fond`, `--carte`, `--bord`, `--encre`, `--accent`) avec leurs valeurs claires, puis sombres sous `prefers-color-scheme: dark`. Le sourcil quitte son opacité, que le reste de l'application refuse sur un texte (`fermer-les-echelles`, D2), et prend `--accent` : c'est la couleur de la mention de l'écran du jour (`RangNavigation`), que ce sourcil imite. La proposition disait `--encre-douce` ; la lecture du composant a corrigé. Le lien de retour prend l'allure d'une commande de l'application : surface de carte, filet, cible de 44 px.

`contrast.test.ts` lit les couleurs de la 404 et exige, pour chaque jeton qu'elle déclare, la valeur de `tokens.css` dans la même palette. C'est la garde déjà posée pour les `theme-color` d'`app.html` (`mode-sombre`, D5), étendue au seul autre fichier qui ne peut pas lire les jetons.

## Risks / Trade-offs

- [Fuseau] Un samedi à Paris peut être un vendredi ailleurs. → Le résolveur raisonne déjà sur la date de Paris ; le week-end s'en déduit.
- [Copie élargie] La 404 recopie cinq jetons au lieu de quatre. → Chacun est gardé (D3) ; une valeur oubliée après un changement de palette fait échouer le test.
