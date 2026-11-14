## Context

Voir `proposal.md` pour le pourquoi, et la maquette (variante C, version 2) pour le rendu visé. Ce qui contraint le comment :

- **`LUNCH_SLOTS` est l'ordre de référence** (`labels.ts`) que lisent l'ardoise (`ListeDuJour`) et la fiche de journée (`FicheJour`). Le commentaire de cette constante pose que, sans elle, les deux lectures cesseraient de se correspondre.
- **`ListeDuJour` rend un `PlatCarte` par rôle**, absence comprise (D12 de la refonte). `PlatCarte` ne connaît qu'un plat. La mention « Plat · Famille · mentions » et la pastille d'allergène s'y calculent pour ce seul plat.
- **Les mentions s'écrivent aujourd'hui en texte**, par `qualityLabel()`. La règle D28 promeut une qualité au rang de nom quand le libellé répète le rôle (« Pain » → « Bio »).
- **Le sprite est injecté au build.** Ses symboles sont décoratifs (`aria-hidden`) : l'illustration ne porte aucune information.
- **Sur le corpus, seules deux mentions apparaissent** : `bio` (accompagnement 91, entrée 86, laitage 83, pain 74, dessert 68, plat 24) et `label-rouge` (pain 48). Les huit autres valeurs du schéma n'apparaissent jamais.
- **`design-tokens.test.ts` refuse les littéraux** de couleur, de taille, de graisse et de rayon, et **`contrast.test.ts` mesure les paires** dans les deux palettes.

## Goals / Non-Goals

**Goals :**

- Que le plat et son accompagnement se lisent comme un seul plat, sur l'écran du jour comme sur la semaine.
- Que chaque mention Bio ou Label Rouge désigne sans ambiguïté le plat qu'elle qualifie, par un pictogramme compris grâce à une légende.
- Que l'écran du jour reste lisible d'un coup d'œil : une ligne de moins dans le tableau, une ligne plus courte sous l'intitulé.

**Non-Goals :**

- **Toucher les données ou l'extracteur.** Le rôle `accompagnement` reste dans le schéma. La réunion se fait à l'affichage, si bien que les mois déjà publiés en bénéficient sans régénération.
- **Pictographier les autres mentions** (Viande française, Pêche durable, IGP…). Elles restent en texte, et rien ne les exerce aujourd'hui.
- **Reprendre les logos officiels.** AB, Eurofeuille et Label Rouge sont des marques avec une charte d'usage. Un pictogramme maison évite la question et s'accorde au dessin de l'application.
- **Fusionner les plats dans la fiche de journée.** La couche de détail continue de lister chaque plat avec ses allergènes : c'est là qu'on lit lequel des deux porte quoi.

## Decisions

### D1 — L'intitulé composé se calcule une fois, dans `labels.ts`, et se rend en parties

Une fonction `intitulePlat(plat, accompagnement)` rend une liste de **parties**, et non une chaîne : `{ texte, flags, accessoire }[]`. La partie du plat a `accessoire: false`, celle de l'accompagnement `accessoire: true` avec sa minuscule initiale. Le jour (`PlatCarte`) et la semaine la lisent tous les deux, et ne peuvent donc pas diverger sur la manière de composer.

Les parties, plutôt qu'une chaîne, parce que chaque partie porte ses propres pictogrammes et sa propre graisse. Une chaîne obligerait à la redécouper pour y raccrocher les mentions, et ce découpage serait fragile.

L'esperluette est visible mais masquée aux technologies d'assistance, doublée d'un « avec » visuellement masqué. Un lecteur d'écran énonce alors « Filet de colin avec purée de panais à la vanille, Bio », et non « esperluette ».

La minuscule initiale ne touche que le premier caractère, et seulement si le deuxième est en minuscule. Un sigle ou un nom propre en tête (« IGP… », « Pommes Pont-Neuf ») garde sa casse.

*Écartées :*

- **Composer dans les données** à l'extraction : cela mélangerait deux rôles que le schéma distingue, et obligerait à régénérer tout le corpus pour un choix d'affichage.
- **Une chaîne unique** : voir plus haut.

### D2 — `LUNCH_SLOTS` place l'accompagnement juste après le plat ; l'ardoise le fait porter par le plat

L'ordre de référence devient `plat, accompagnement, entrée, laitage, dessert, pain`. La fiche de journée le lit tel quel et liste l'accompagnement juste après le plat, comme l'écran le montre. L'ardoise prend le plat et l'accompagnement pour le seul `PlatCarte` principal, puis rend une ligne par rôle restant.

La correspondance entre l'ardoise et la fiche, raison d'être de la constante, est donc conservée : elles se lisent dans le même ordre.

`PlatCarte` reçoit une prop `accompagnement: Course | null`, qui n'a de sens que pour le plat principal. `slotAbsence('accompagnement')` disparaît avec sa formulation.

### D3 — Un plat complet ne dit rien de l'accompagnement (amende D12)

D12 voulait qu'un rôle absent s'énonce, pour qu'un creux reste distinguable d'une donnée manquante. Pour l'accompagnement, l'argument ne tient plus. Un plat complet (ravioli, lasagnes, brandade) n'a pas d'accompagnement par nature, et l'intitulé seul ne laisse aucun doute : ce n'est pas une ligne vide du tableau qu'on pourrait croire mal chargée. Les autres rôles gardent leur ligne d'absence.

### D4 — Le pictogramme est un élément d'information, avec son nom accessible

Un composant `MarqueQualite.svelte` rend `<svg role="img" aria-label="Bio">` avec un `<title>`, qui sert d'info-bulle sur bureau. Le dessin est un symbole `#marque-bio` ou `#marque-label-rouge`, ajouté au sprite injecté. Contrairement aux illustrations, ce symbole n'est pas `aria-hidden` : il porte une information que le texte ne redit pas.

`labels.ts` expose `QUALITY_MARKS = ['bio', 'label-rouge']` et `estMarque(flag)`. Une mention qui n'est pas une marque reste écrite par `qualityLabel()`.

**L'accroche** : une fonction `accrocher(texte)` rend `{ debut, dernierMot }`. Le composant met `dernierMot` et ses pictogrammes dans un `span` insécable (`white-space: nowrap`). Le pictogramme peut emmener son mot à la ligne, mais il ne s'y retrouve jamais seul.

**Qualité promue au rang de nom (D28)** : quand le nom est la qualité (« Pain » → « Bio »), on affiche le pictogramme **suivi** du mot « Bio ». On ne retire pas le texte, sans quoi la ligne n'aurait plus de nom. Ce cas sert aussi de légende en situation : le pain bio est servi presque chaque jour.

*Écartées :*

- **Le pictogramme dans le sprite décoratif sans nom** : un lecteur d'écran perdrait la mention.
- **Les pictogrammes regroupés en fin d'intitulé** : on ne saurait plus si c'est le plat ou l'accompagnement qui est bio. C'était le défaut à corriger.

### D5 — Une pastille claire dans les deux palettes, trois nouveaux jetons

Les jetons sont `--marque-fond`, `--marque-bio` et `--marque-label-rouge`. La pastille reste claire en apparence sombre (`--marque-fond` proche du blanc cassé). Un vert et un rouge de marque se reconnaissent sur fond clair, et la pastille se détache ainsi de tous les aplats sombres. Dans les lignes du tableau, posées sur `--carte`, la pastille prend un filet `--bord` pour ne pas se fondre dans le fond clair.

`contrast.test.ts` mesure le dessin sur la pastille à **3:1 au moins**, le seuil des composants graphiques (WCAG 1.4.11), dans chaque palette. La pastille se dimensionne en `em`, pour suivre le corps du texte qu'elle accompagne : environ 0,7 em dans la coupe d'affichage, 1,15 em dans une ligne.

### D6 — La légende vit à deux endroits, et un seul les décrit

- **L'écran À propos** gagne une section « Les labels de qualité », placée après « La source ». Elle montre chaque pictogramme avec son nom et une phrase sur ce qu'il garantit. Elle se rend depuis `QUALITY_MARKS`, et ne peut donc pas oublier une marque.
- **La fiche de journée** écrit la mention en toutes lettres à côté du pictogramme (« 🌿 Bio »). C'est là qu'on regarde quand on veut comprendre un jour, et on y apprend le pictogramme sur place.

Un lien « Que signifient ces pictogrammes ? » sur l'écran du jour a été écarté. D11 de `finitions-et-plat-inconnu` a justement retiré du bas de cet écran ce qui se consulte une fois et non chaque matin.

### D7 — La semaine reprend l'intitulé, et le résumé perd l'accompagnement

Le titre d'une tuile servie devient l'intitulé composé de D1, avec ses pictogrammes. Le résumé (« Volaille · entrée, laitage, dessert ») écarte désormais l'accompagnement, comme il écarte déjà le pain et le goûter.

## Risks / Trade-offs

- **[Libellés longs]** « Sauté de canard façon wakandaise & riz tchiké » prend quatre lignes à 360 px. L'exigence « le plat principal est visible d'emblée » peut tomber sur la plus petite fenêtre. → Un e2e charge la paire réelle la plus longue du corpus et vérifie l'aplat entier sans défilement. S'il échoue, on descend l'accompagnement d'un cran (`--texte-xl`) plutôt que de tronquer.
- **[Allergène de l'accompagnement]** La pastille d'allergène de l'aplat couvre l'union du plat et de l'accompagnement. L'écran dit qu'un des deux est concerné, sans dire lequel. → Le signalement reste au niveau de l'entrée de l'écran, et non de la journée, ce qui satisfait l'exigence. La fiche dit lequel, et le cas est rare puisque les accompagnements portent peu d'allergènes. Ce compromis est accepté.
- **[Pictogramme mal compris]** Une feuille peut se lire « végétarien ». → La légende, le nom accessible, l'info-bulle, et le mot « Bio » écrit chaque jour sur la ligne du pain. Le dessin évite le vert de la famille végétarienne (D5) et prend la forme d'une feuille stylisée sur pastille carrée, distincte de toute illustration.
- **[Sigles en tête d'accompagnement]** La règle de minuscule de D1 se trompe sur un nom propre en minuscule non accentuée. → Les cas rencontrés dans le corpus sont couverts par un test unitaire.

## Migration Plan

Aucune donnée à migrer. Le changement part dans une seule publication. Pour revenir en arrière, on annule le commit : les données ne dépendent pas de l'affichage.

## Open Questions

_Aucune._ Le pictogramme Bio en feuille et le Label Rouge en sceau rond « LR » sont ceux de la maquette. Leur dessin final se règle à l'implémentation, sous la contrainte de D5.
