## Contexte

Dans les PDF mensuels comme dans ceux des vacances, un jour férié occupe sa colonne comme un autre jour : la date en tête, puis, à la place des plats, `JOUR` et `FÉRIÉ` sur deux lignes, centrés dans la cellule, sans code d'allergène. La ligne `PAIN` est absente. `pdftotext -layout` sur `11-MENUS-WEB-NOVEMBRE-2026.pdf` :

```
       11/11/2026
           JOUR
           FÉRIÉ
```

Le parser découpe la cellule en lignes, puis `assign_slots` attribue les rôles par rang de ligne. Deux lignes au rang du plat et de l'accompagnement donnent un plat `JOUR` et un accompagnement `FÉRIÉ` ; la structure est jugée inhabituelle, d'où `confidence: low`. Rien n'empêche ce jour d'être publié : la validation tolère une incohérence sur un jour qui assume sa confiance faible.

Côté application, un seul prédicat compte : `kind === 'school'`. Il est lu par `dataset.ts` (jours servis), `resolve.ts` (jour courant) et l'écran Semaine. Aucun `switch` exhaustif ne porte sur `kind`.

## Décisions

### D1 — Une nature propre, plutôt que `holiday` ou l'absence

**Retenu :** `public-holiday`.

**Écarté :** déclarer le jour `holiday`. C'est le précédent des jeux d'essai et la solution la moins chère, mais elle fait dire « vacances » à un 11 novembre. La spec exige un message propre au férié ; le contrat doit pouvoir le porter avant que l'interface puisse le dire.

**Écarté :** retirer le jour du fichier, ce que le schéma permet. Un jour absent se lit « pas encore publié » sur l'écran Semaine. La Ville a publié une information — il n'y a pas de service — et la remplacer par un silence est la confusion que l'écran Semaine refuse déjà de faire.

### D2 — Pas de montée de `schemaVersion`

Une valeur d'énumération ajoutée est un changement compatible ici, et seulement ici, parce que tous les consommateurs lisent `kind` par égalité avec `'school'`. Une version antérieure de l'application, servie par un service worker en cache, lirait `public-holiday` comme un jour non servi et afficherait « Pas d'école ce jour » : exact, simplement moins précis.

Monter la version obligerait ces clients à refuser tous les mois, y compris ceux qui ne portent aucun férié. Le prix serait sans commune mesure avec le risque.

La condition est vérifiable et doit le rester : une tâche contrôle qu'aucun code ne traite `kind` de façon exhaustive. Le jour où un `switch` exhaustif apparaît, cet argument tombe.

### D3 — Reconnaissance stricte, avant l'attribution des rôles

Le parser teste la cellule **entière** avant d'appeler `assign_slots` : une fois les lignes jointes, normalisées (casse, accents, espaces), le texte doit valoir exactement `jour ferie`. Si oui, le jour sort `public-holiday`, confiance haute, sans plats.

Une recherche de sous-chaîne est écartée : « férié » peut un jour figurer dans un intitulé de plat ou dans un thème, et un plat avalé est pire qu'un férié mal lu, parce qu'il ne se voit pas.

Une cellule qui mentionne le férié **et** porte des plats n'est pas reconnue : elle suit le chemin ordinaire et ressort en confiance faible, pour relecture humaine. C'est le comportement voulu face à une forme qu'on n'a jamais vue.

### D4 — Un garde-fou dans la validation, pas seulement dans le parser

`validate-data.js` refuse un jour `school` dont un plat porte le libellé `JOUR` ou `FÉRIÉ`, quelle que soit sa confiance. Le parser est la seule voie d'entrée prévue, mais la validation est la seule qui s'applique à toutes : c'est elle qui protège la mise en ligne, en CI comme sur Netlify.

### D5 — La cible résolue dit pourquoi elle saute

Aujourd'hui, `next-served` porte la date cible et l'écart, pas la raison. Un 11 novembre, l'écran dirait « Demain » comme un mardi soir quelconque.

`DisplayTarget` de statut `next-served` gagne un champ `skipped` : la nature du jour courant telle que le jeu de données la connaît, ou `null` s'il n'y figure pas. `targetEyebrow` s'en sert pour le seul cas `public-holiday` — par exemple « Férié · service demain ». Les autres natures gardent leur mention actuelle : les distinguer est le travail suivant, et il n'aura plus qu'à lire ce champ.

La raison est calculée par la résolution, et non par l'écran, pour la même raison que l'écart (D60) : une seconde lecture du calendrier finirait par diverger de la première.
