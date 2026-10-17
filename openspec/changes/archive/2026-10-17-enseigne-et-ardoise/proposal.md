## Why

**L'écran du jour ne tient pas dans l'écran.** Mesuré sur le profil mobile des tests, fenêtre de 412 × 839 pixels :

```
en-tête              53 px   ← deux lignes, la date coupée
plateau             470 px   ← 46 % de la page
goûter               93 px
navigation           44 px
pied                117 px
──────────────────────────
page              1 016 px   pour 839 px de fenêtre
                             → 177 px hors du champ
```

Le plat principal du jour, qui est la raison d'être de l'application, se lit après avoir défilé. Deux causes indépendantes, l'une en haut, l'autre au milieu.

**En haut, la date se fait couper par ce qui la situe.** L'en-tête énonce en une phrase la mention et la date — « Aujourd'hui · Vendredi 4 septembre ». La mention a quatre valeurs, dont deux longues ; le pire cas est en ligne aujourd'hui :

```
PROCHAIN SERVICE · DANS 10
JOURS · Lundi 31 août
```

`text-wrap: balance` casse la date pour loger la mention. La contrainte est subie par l'élément important, au profit de l'accessoire. Il manque par ailleurs à l'application ce que tout lieu affiche à sa porte : son nom. Rien sur les quatre écrans ne dit qu'on est chez la cantine des écoles de Talence.

**Au milieu, le plateau distribue 470 pixels à six libellés courts.** Deux gaspillages s'y additionnent.

*Le vide.* Une case fait 112 pixels de haut pour environ 60 pixels de contenu : le rôle est calé en haut, le nom poussé en bas par `margin-top: auto`, et le milieu est vide.

*Les dessins.* Chaque case porte une illustration déduite de son libellé. Sur les trente-cinq jours du jeu de données, part du dessin dominant par rôle :

| rôle | dessin dominant | part |
|---|---|---|
| pain | `pain` | **35/35 — 100 %** |
| laitage | `fromage` | 23/25 — 92 % |
| entrée | `legume` | 24/35 — 69 % |
| dessert | `fruit` | 23/35 — 66 % |
| accompagnement | `legume` | 16/30 — 53 % |
| **plat** | `viande` | **10/35 — 29 %** |

Le dessin du pain est le même tous les jours de l'année. Celui du laitage change deux fois sur vingt-cinq. Et **dix-sept jours sur trente-cinq affichent deux fois le même dessin** dans le même plateau — une entrée de légumes au-dessus d'un accompagnement de légumes. Le dessin ne gagne sa place que sur le plat principal, où il est le seul à varier vraiment, et où il complète une couleur de famille qui dit déjà l'essentiel.

L'écran de la semaine avait déjà tranché cette question, dans un commentaire que personne n'est allé retourner contre l'écran du jour : « le résumé écarte le pain et le goûter : ils sont présents presque chaque jour et ne distinguent rien ». Il montre un dessin par jour — celui du plat — et le reste en texte. **Les deux écrans ne sont pas d'accord sur ce qui compte.**

Enfin, une contrainte tient toute la géométrie sans être justifiée par l'usage : chaque plat est une cible tactile, donc chaque plat coûte 44 pixels de plancher. Or un parent qui surveille l'arachide veut savoir *si la journée est concernée*, pas *quelle case*. La cible est mal choisie, et c'est elle qui interdit de resserrer.

## What Changes

- **L'application affiche son nom.** Une enseigne « Cantine des écoles de Talence » vit dans la coque, commune aux quatre écrans, en petit corps : elle est constante par construction, et D28 lui applique la même règle qu'au compartiment du pain — ce qui ne varie pas ne prend pas de surface. La commande de réglages la rejoint : un réglage d'application n'a rien à faire dans l'en-tête d'un contenu daté.
- **La date ne se coupe jamais.** Elle devient insécable ; c'est la mention de situation, de longueur variable, qui passe à la ligne lorsqu'il le faut. L'en-tête cesse aussi de partager sa largeur avec l'engrenage, qu'il rend à l'enseigne.
- **La cible devient la journée.** Une seule couche modale, ouverte depuis le menu, listant chaque plat du jour avec ses allergènes. Cela répond mieux à la question réellement posée, et supprime le plancher de 44 pixels par plat qui interdisait toute compacité.
- **Le plateau compartimenté devient une ardoise.** Une ligne par rôle, les rôles alignés en colonne à gauche, les libellés à droite, dans l'ordre du service. Le plat principal garde sa vedette — un bloc coloré portant son illustration — à sa place de service et non en tête. Le pain descend en pied d'ardoise : il n'est pas un service, il est sur la table du début à la fin.
- **Le dessin ne reste que là où il distingue** : le plat principal et le goûter. Les cinq autres le perdent.
- **« Garniture » redevient « Accompagnement ».** Revirement explicite de `hierarchie-du-jour` : le mot est plus clair pour un parent, et c'est le seul juge.

## Capabilities

### Modified Capabilities

- `menu-browsing` : l'exigence **Grille compartimentée de l'écran Aujourd'hui** est remplacée par une exigence d'ardoise, qui prescrit une forme compacte plutôt qu'une grille et fixe ce qui doit rester visible sans défilement. L'exigence **En-tête d'écran** acquiert l'enseigne et l'insécabilité de la date. L'exigence **Couche modale de détail d'un plat** change de sujet : elle porte désormais sur la journée.
- `allergen-filter` : l'exigence **Détail des allergènes d'un plat** devient le détail des allergènes de la journée. Le signalement par plat, lui, ne bouge pas.
- `dish-illustration` : une exigence nouvelle borne la **portée** de l'illustration à l'écran. La table de mots-clés, la règle de spécificité et le repli ne changent pas.

## Impact

**Code applicatif** — `src/lib/menu/Tray.svelte` (la grille devient une ardoise), `src/lib/menu/CourseSheet.svelte` (change de sujet : une journée, pas un plat), `src/routes/+page.svelte` (une seule cible, le goûter s'aligne sur le vocabulaire restant), `src/lib/ui/EnTete.svelte` (perd la commande, gagne l'insécabilité), `src/routes/+layout.svelte` (l'enseigne), `src/lib/menu/labels.ts` (« Accompagnement », et sa formulation d'absence).

**Tests** — `Tray.test.ts` et `labels.test.ts` portent le libellé « Garniture » et l'ordre des rôles : ils changent avec eux. Un test de bout en bout nouveau mesure ce que ce change existe pour obtenir — que la date, le déjeuner entier, le goûter et les commandes de jour tiennent sans défilement. `contrast.test.ts` doit couvrir les surfaces de l'ardoise et de l'enseigne ; le contrôle de couverture des transparences (D27) refusera de lui-même toute opacité non déclarée.

**Données** — aucun changement de schéma, aucune régénération.

**Ce que ce change défait sciemment** — `hierarchie-du-jour` avait donné au goûter « le vocabulaire visuel des compartiments ». Ce vocabulaire disparaît : le goûter conserve son statut d'objet distinct mais emprunte désormais celui de la vedette. Sa règle de nommage, elle, est conservée intacte — c'est elle qui rend le pain lisible sur une ligne.

**Hors périmètre** — l'écran de la semaine, dont la forme est déjà celle qu'on adopte ici ; la barre d'onglets ; le pied de page, qui peut rester sous la ligne de flottaison sans dommage.
