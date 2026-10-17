## Contexte

Les PDF de vacances partagent le gabarit des mensuels : même grille, mêmes rôles par rang. Le parser les découpe déjà correctement, et `jours-feries` a réglé le seul défaut rencontré. Leurs plages ne chevauchent celles d'aucun mensuel : octobre s'arrête au 16, la Toussaint commence le 19 ; décembre s'arrête au 18, Noël commence le 21 et finit le 1er janvier, janvier commence le 4.

Ce qui manque, c'est la place : le manifeste est indexé par mois, et octobre aurait deux documents.

## Décisions

### D1 — Un fichier de menu ordinaire, un nom à lui

**Retenu :** le menu de vacances suit `month.schema.json`. Son `month` est son mois majoritaire, ce qui garde la borne de cohérence d'une semaine autour du mois (Noël : décembre, et le 1er janvier reste dans la borne). Son fichier s'appelle `AAAA-MM-vacances.json`, et il porte un champ facultatif `title`, l'intitulé du document.

**Écarté :** un troisième schéma, comme celui de la grève. La grève n'a pas de dates ; un menu de vacances en a, et tout ce que l'application sait faire d'un jour daté vaut pour lui.

### D2 — Au manifeste : une nature et un nom de fichier

Une entrée du manifeste gagne un champ facultatif, `file`, absent pour un mensuel (`AAAA-MM.json`). Le menu de vacances y entre avec `kind: "vacation"` et son `file`.

Une version antérieure de l'application ignore `file` et charge `AAAA-MM.json`, c'est-à-dire le mensuel déjà chargé ; puis elle écarte l'entrée, parce qu'une nature qu'elle ne connaît pas n'a pas de priorité (`PRIORITY[kind] > 0` est faux). Elle se comporte donc exactement comme aujourd'hui.

La nature `vacation` prend la priorité de `transition`, au-dessus du mensuel : si un mensuel marquait un jour de vacances comme non servi, le menu de vacances, qui le sert, l'emporte.

### D3 — L'intitulé vient du document

Le parser lit `VACANCES DE …` dans l'en-tête et en fait l'intitulé, en casse de phrase, avec l'accent que l'export a perdu rétabli pour les mots connus (`NOEL` → « Noël »), comme il rétablit déjà les ligatures. Il ne dit pas « accueil de loisirs » : le document ne le dit pas.

### D4 — Un jour de vacances se nomme

Le jour résolu porte la nature et l'intitulé de son document. L'écran du jour affiche l'intitulé en tête de contenu, l'écran de la semaine le marque sur chaque jour concerné. Un jour de vacances reste un jour servi : la navigation et la résolution du jour le traitent comme tel.

### D5 — La mention dit que c'est les vacances

Décidé le 17 octobre 2026, en exploration. Un jour de vacances est servi pour tous, mais tous les enfants n'y déjeunent pas. L'intitulé seul, posé sous le rang de navigation, laissait la mention dire « Demain » à un parent dont l'enfant reste à la maison.

**Retenu :** quand le jour que le système présente est un jour de vacances, la mention le dit — « Vacances · aujourd'hui », « Vacances · demain », « Vacances · dans N jours ». La cible résolue porte `vacation`, comme elle porte déjà la raison d'un saut (`skipped`, `jours-feries`). Un férié reste nommé en premier : c'est la raison du saut.

**Écarté :** un réglage « mon enfant déjeune à la restauration municipale pendant les vacances ». Personne ne sait quelle valeur par défaut serait la bonne ; un réglage dont on ignore la valeur par défaut déplace la question sans y répondre.

**Écarté :** ne jamais faire d'un jour de vacances le jour proposé. Le parent qui en a besoin devrait le chercher.

