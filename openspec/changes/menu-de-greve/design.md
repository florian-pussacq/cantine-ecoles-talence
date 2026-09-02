## Contexte

Le PDF de grève (`00-MENUS-WEB-GREVES.pdf`) est une page A3 unique portant deux tableaux superposés, `REPAS CHAUDS` et `REPAS FROIDS`, chacun en cinq colonnes de lundi à vendredi. Dix menus, aucune date. Il n'a pas été réédité depuis octobre 2023.

Trois contraintes cadrent la conception :

1. L'application ne peut pas savoir qu'il y a grève. Aucune source ne le publie.
2. Le contrat mensuel exige `month: AAAA-MM` et `days[].date`. Le menu de grève n'a ni l'un ni l'autre.
3. Le menu de grève doit rester consultable hors ligne, comme le reste des données.

## Décisions

### D1 — Un second contrat, plutôt qu'une date inventée

**Retenu :** un schéma propre, `schemas/greve.schema.json`, indexé par `temperature` puis `weekday`.

**Écarté :** fabriquer une semaine fictive de dates pour entrer dans le contrat mensuel. Une date inventée est une donnée fausse, et rien n'empêcherait ensuite la résolution du jour de tomber dessus. Le schéma dirait le contraire de ce que le document dit.

**Écarté :** assouplir `month.schema.json` pour rendre `date` facultative. Un champ facultatif que trois consommateurs supposent présent est une panne différée.

Le prix est une duplication de la forme d'un plat entre deux schémas. C'est le prix juste : deux contrats indépendants qui versionnent séparément valent mieux qu'un contrat qui décrit deux choses.

### D2 — Hors du manifeste, donc hors de portée

**Retenu :** `greve.json` n'apparaît pas dans `index.json`.

`loadDataset` n'ouvre que les mois listés au manifeste. Un fichier absent du manifeste est donc structurellement hors d'atteinte de l'écran du jour et de celui de la semaine : ce n'est pas une garde qu'on ajoute, c'est une porte qui n'existe pas. Le service worker, lui, précache l'intégralité de `static/data/` — l'exclusion du manifeste ne coûte donc rien au fonctionnement hors ligne.

Le champ `kind: "strike"` du manifeste et son filtrage dans `load.ts` restent en place, inutilisés, comme garde-fou si un fichier de grève daté apparaissait un jour.

### D3 — Le rôle d'un plat reste le rang de sa ligne

Le PDF de grève partage la géométrie des mensuels : sept rangs de rôles, pas de ligne égal à 0,046 fois la largeur d'une colonne. Mesuré sur le document : `Chips` tombe au rang 4, accompagnement ; `Compote gourde` au rang 6, dessert. L'attribution des rôles est donc rigoureusement la même fonction.

Seul l'ancrage change : les colonnes se déduisent des cinq bandes verticales de codes d'allergènes plutôt que des jetons de date, et les deux bandes horizontales des titres `REPAS CHAUDS` et `REPAS FROIDS`. Les en-têtes `LUNDI`…`VENDREDI` sont centrés et de largeurs inégales : ils indiquent mal le centre d'une colonne, les codes d'allergènes le donnent au dixième de point.

### D4 — L'écran affiche les cinq jours, pas le jour courant

Un menu de grève se consulte la veille au soir, quand le préavis tombe. Restreindre l'écran au jour courant le rendrait inutile précisément au moment où on l'ouvre, et poserait la question insoluble du week-end. La variante — chaud ou froid — reste un choix, parce que le document lui-même dit « selon la possibilité ».

### D5 — `PlatCarte` plutôt que `Tray`

`Tray` rend les six rôles quoi qu'il arrive : sur l'écran du jour, voir qu'il n'y a pas de dessert est une information. Un menu de repli sert trois plats ; la même règle produirait quinze cartes d'absence pour rien.

`PlatCarte` est l'unité réutilisable. Elle ne lit du jour que sa légende d'allergènes : sa signature est resserrée en conséquence, ce qui évite de fabriquer un faux jour pour la rendre.

### D6 — Les réglages s'élargissent au lieu d'accueillir un intrus

`/reglages` s'appelle aujourd'hui « Allergènes à signaler » — dans son titre, dans son `<title>`, et dans le nom accessible de la roue crantée qui y mène. Un lien vers un menu sous ce titre serait incohérent.

L'écran devient « Réglages », avec une section « Allergènes » et une section « Menus ». La commande devient « Réglages — N allergènes surveillés » : la décision d'origine tient — voir l'état et aller le corriger restent le même geste — seul son libellé s'élargit.
