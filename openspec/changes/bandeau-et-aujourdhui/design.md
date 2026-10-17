## Contexte

L'audit (pistes 4 et plan d'action, étape 3) a posé le constat. Les choix ci-dessous ont été arrêtés avec l'humain le 17 octobre 2026.

| Message | Où | Style actuel | Ton |
|---|---|---|---|
| Format plus récent, menus indisponibles, menu non publié | jour, semaine | `.notice` | info |
| Menus non rafraîchis depuis deux jours | jour, semaine | `.notice.subtle`, `.stale` | info, discret |
| Nouvelle version disponible | layout | `.update` (orange) | info, avec son action |
| Stockage indisponible | réglages | `.warn` | info |
| « Ne sait pas s'il y a grève » | grève | `.warn` | info |
| Avertissement légal | à propos | `.disclaimer` (orange) | info |
| Intitulé des vacances | jour | `.notice.subtle` | événement |
| Thème du jour et sa note | jour | `.theme` (carte blanche) | événement |
| Allergènes non précisés, données incertaines | jour | `.warn` | alerte |
| Menu de grève non chargé | grève | `.warn` | alerte |

Les trois messages ambigus (stockage, grève, avertissement légal) passent en info, sur décision de l'humain. Aucun ne signale un danger pour le repas qu'on regarde : ce sont des limites de l'application. L'alerte reste rare, donc lue.

## Décisions

### D1 — Un composant, trois tons, une variante

`Bandeau.svelte` prend un `ton` (`'info' | 'evenement' | 'alerte'`), un `discret` facultatif et un contenu (`children`). Il accepte des liens et des commandes dans ce contenu : la nouvelle version porte son bouton « Appliquer », et les alertes leur lien vers le PDF.

| Ton | Surface | Encre | Contraste |
|---|---|---|---|
| info | `--info` `#e4ecf2` | `--info-on` `#17384f` | 10,25:1 |
| événement | `--evenement` `#f6e3c4` | `--evenement-on` `#4a3510` | 9,24:1 |
| alerte | `--warn` `#e89406` | `--warn-on` `#2a1b00` | 6,91:1 |

Les valeurs sont celles de l'audit. Les noms suivent la famille `--warn`/`--warn-on` (fermer-les-echelles, D1).

Un **bandeau info discret** n'a pas de surface : il garde l'encre `--info-on`, sans aplat. C'est la place de l'avertissement de fraîcheur, qui doit se lire sans prendre le pas sur le menu.

Les liens et les commandes dans un bandeau prennent l'encre du bandeau (`currentColor`) et la graisse forte, comme aujourd'hui dans `.warn`. Le contraste est donc celui du ton.

*Corrigé à l'application.* La graisse du texte est normale, et l'alerte seule passe en `--poids-moyen`. Reprise de l'ancien `.warn`, la graisse moyenne partout effaçait le gras de l'avertissement légal (« Seul le document officiel… fait foi »), qui ne se détachait plus du reste. L'alerte garde son poids : c'est le seul ton qui doive arrêter la lecture.

Le contenu reste du texte courant : `<p>` par défaut. Le thème du jour a un titre et une note. Le composant accepte donc un `titre` facultatif, rendu en `<h2>`, pour garder la hiérarchie actuelle (l'écran a un seul `h1`, la désignation du jour).

### D2 — L'ordre de lecture

Sur l'écran du jour, au-dessus des plats : l'événement (intitulé des vacances), puis l'alerte (allergènes non précisés, données incertaines), puis l'info discrète (fraîcheur). C'est l'ordre de l'audit : ce qu'est le jour, puis ce qui menace la lecture, puis ce qui la relativise.

Le thème du jour (« Semaine du goût ») reste où il est : dans la zone qui glisse avec le jour, en tête des plats. C'est un contenu du jour, pas un message de l'écran. Il prend le ton événement.

### D3 — « Aujourd'hui » : une pastille, la même partout

La pastille est un aplat `--accent` portant `--on-accent`, en capitales `--text-2xs` et `--poids-titre`. Ce sont la paire et la typographie de l'onglet courant, déjà mesurées (4,5:1 et plus).

**Écran du jour.** La mention de `RangNavigation` porte la pastille quand le jour affiché est le jour courant, que l'utilisateur y soit arrivé de lui-même ou par navigation. Pour tout autre cas (« Demain », « Prochain service · dans 3 jours », « Férié · service demain », « Il y a 2 jours »), elle reste le sourcil doré actuel. Un jour de vacances courant affiche le sourcil « Vacances » suivi de la pastille. La chaîne « Vacances · aujourd'hui » disparaît.

Pour cela, `targetEyebrow` et `browsedEyebrow` cessent de rendre une chaîne seule. Elles rendent `{ texte, aujourdhui }`, où `texte` est ce qui reste à dire en sourcil (vide, ou « Vacances »). Le libellé « Aujourd'hui » de la pastille est écrit une seule fois, dans `RangNavigation`. Un lecteur d'écran lit toujours la mention entière, car la pastille est du texte.

**Semaine.** La pastille noire devient la pastille à l'accent. L'inversion déclarée dans `contrast.test.ts` (`--carte` sur `--ink`) disparaît avec elle.

### D4 — La ligne du jour de la semaine : fond teinté, et ce que la teinte ne dit pas

Le contour noir de 2 px cède la place à `--voile-accent: color-mix(in srgb, var(--accent) 12%, transparent)`, posé sur la carte (teinte peinte : `#f0ece6`).

Le taux est borné par les textes de la ligne. Les autres plats sont écrits en `--ink-muted`, qui doit garder 4,5:1 sur la teinte :

| Taux | Teinte | `--ink-muted` | `--accent` | Teinte / carte |
|---|---|---|---|---|
| **12 %** | `#f0ece6` | **5,01** | 4,90 | 1,18 |
| 18 % | `#e8e3da` | 4,62 | 4,51 | 1,28 |
| 24 % | `#e0d9cd` | 4,21 | 4,11 | 1,40 |

À aucun taux admissible, la teinte ne se distingue de la carte en niveaux de gris : elle ne dépasse jamais 1,3:1. Elle est donc un renfort de couleur, et pas un signal. Les signaux qui tiennent sans couleur sont la pastille, forme sombre (4,90:1 sur la teinte) écrite en toutes lettres, et le nom du plat grossi d'un cran. C'est conforme à la règle du dépôt : la marque du jour courant ne repose jamais sur la seule couleur. Le commentaire du composant, qui revendique « quatre signaux, dont aucun n'est une couleur », est corrigé en conséquence.

`contrast.test.ts` mesure `--voile-accent` sur `--carte` pour `--ink`, `--ink-muted` et la pastille. Il faut étendre `readVoiles`, qui ne connaît que les voiles d'encre, aux voiles d'accent.

### D5 — Les tons sur le fond

`--info` et `--evenement` ne se distinguent du fond crème que par la teinte (1,02:1 et 1,07:1). WCAG ne demande pas de contraste à la surface d'un message qui porte du texte, et le texte tient 9:1 ou plus. Un bandeau sans bordure se lit donc comme un encart coloré, ce qui est voulu.

## Risques

- **Les e2e** citent des textes exacts (« Vacances · aujourd'hui », la mention en `nav .mention`). La mention se décompose, et ces tests sont à relire, pas à affaiblir : ils doivent toujours prouver que le jour courant est nommé.
- **La place de la pastille dans le rang de navigation** à 320 px, entre les flèches : « VACANCES » suivi de la pastille doit tenir sur une ligne. À vérifier à l'œil.
