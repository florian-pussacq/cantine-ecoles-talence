## Context

`scripts/check-budget.js` mesure après le build, en gzip, deux budgets du PRD §8 : le JavaScript (somme de tous les modules émis, 60 Ko) et le premier chargement (HTML le plus lourd, plus tout le CSS, plus tout le JavaScript, 150 Ko). Son commentaire justifie la somme : c'est une borne supérieure, et on refuse de « simuler un graphe de dépendances qui divergerait du vrai comportement du navigateur ».

Mesuré le 18 octobre 2026 :

| Page        | JavaScript chargé |
| ----------- | ----------------- |
| écran du jour (`index.html`) | 48,4 Ko |
| semaine     | 45,6 Ko |
| grève       | 44,5 Ko |
| à propos    | 41,5 Ko |
| réglages    | 38,9 Ko |
| somme émise | 57,9 Ko (dont 1,3 Ko de service worker) |

Environ 32 Ko de chaque page sont le framework (runtime Svelte 19 Ko, client SvelteKit 11 Ko, entrées 2 Ko).

## Goals / Non-Goals

**Goals:**

- Mesurer ce que le PRD cherche à protéger : l'affichage d'une page, et séparément le coût du hors-ligne.
- Une mesure lue dans le build, jamais reconstruite.
- Qu'un découpage du code (une page rare, un chargement à la demande) se voie dans la mesure.

**Non-Goals:**

- Alléger le code : aucune page n'en a besoin aujourd'hui.
- Mesurer le LCP lui-même : il dépend du réseau et de l'appareil ; le budget en est l'approximation statique que le PRD a choisie.

## Decisions

### D1 — Le JavaScript d'une page : ce qu'elle nomme, et ses imports statiques

Chaque page pré-rendue nomme les modules qu'elle charge : `entry/start`, `entry/app` et ses nœuds (`nodes/0` pour la coque, `nodes/N` pour la route). Le manifeste que Vite écrit (`.svelte-kit/output/client/.vite/manifest.json`) donne pour chaque module ses `imports` statiques. Le JavaScript d'une page est la fermeture de ses modules nommés par les imports statiques.

Les `dynamicImports` sont exclus : `entry/app` connaît tous les nœuds de toutes les pages, mais ne charge que ceux de la page présentée. C'est exactement ce qui distingue une page d'une autre.

Ce n'est pas la simulation que le commentaire refusait : la page et le manifeste sont deux productions du build, et la fermeture par imports statiques est ce que fait le navigateur avec des modules ES. Le calcul a été fait à la main le 18 octobre et donne les chiffres du contexte.

Alternative écartée : analyser les `import` dans le JavaScript minifié. Fragile, et le manifeste dit la même chose de première main.

### D2 — Trois budgets, chacun pour une question

| Budget | Mesure | Plafond | Protège |
| ------ | ------ | ------- | ------- |
| JavaScript par page | fermeture de D1, la page la plus lourde | 60 Ko | l'affichage (LCP) |
| Premier chargement par page | HTML de la page + son CSS + son JavaScript, la page la plus lourde | 150 Ko | le premier affichage complet |
| JavaScript préchargé | tout le JavaScript émis, service worker compris | 80 Ko | les données mobiles du hors-ligne |

Le CSS d'une page se lit au même endroit : le champ `css` des modules de sa fermeture.

Les 80 Ko de la somme sont un choix de produit, arrêté avec l'humain le 18 octobre : le hors-ligne télécharge toute l'application par construction, et ce plafond borne ce coût sans le confondre avec l'affichage.

### D3 — Un rapport qui dit où chercher

Le rapport du build donne les trois budgets, la page la plus lourde pour les deux premiers, et le détail par page. En cas de dépassement, il liste les modules les plus lourds **de la page fautive**, et non de tout le build : c'est là qu'il faut couper.

### D4 — Une page qu'on ne sait pas lire est une erreur

Une page pré-rendue qui ne nomme aucun module, ou un module absent du manifeste, fait échouer la vérification : une mesure qui manquerait une page passerait sans rien garder. La page 404 statique (`static/404.html`), sans JavaScript, est la seule exception, nommée.

## Risks / Trade-offs

- [Format du manifeste] Le manifeste de Vite et la forme des pages de SvelteKit peuvent changer avec une montée de version. → D4 fait échouer la mesure plutôt que de la fausser ; le test du script s'appuie sur un build réel.
- [Pages hors pré-rendu] Une future route non pré-rendue n'aurait pas de HTML à lire. → Toutes les routes le sont aujourd'hui (`prerender = true`) ; une route qui ne le serait plus échouerait par D4.
- [Plafond relevé] La somme passe de 60 à 80 Ko. → Elle est désormais mesurée pour ce qu'elle est, le coût du hors-ligne, et non plus comme approximation de l'affichage.
