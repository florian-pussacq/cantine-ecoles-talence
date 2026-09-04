## Contexte

Cinq défauts constatés à l'usage, dans la coque et dans les mentions qu'elle porte. Quatre sont des reliquats : une décision antérieure a déplacé quelque chose sans finir de déplacer ce qui en dépendait. Le cinquième est une lacune du filet de vérification, et c'est celui qui explique pourquoi les deux plus graves ont survécu à trois refontes.

Les décisions gardent la numérotation globale du dépôt, que le code cite : D60 à D64.

## D60 — La mention situe le jour consulté (précise D45)

`RangNavigation` reçoit `mention={targetEyebrow(target)}`. `target` est le résultat de `resolveDisplayDay(dataset, now)` : il ne dépend que de l'horloge, jamais de la date consultée. La date change sous la mention, la mention ne change pas.

Le symptôme rapporté — « Aujourd'hui » partout — n'est que le cas le plus fréquent. Le défaut réel est plus large : un dimanche, tous les jours parcourus s'annoncent « Demain » ou « Prochain service · dans 3 jours ». L'écran affirme d'un jour quelconque ce qui n'est vrai que du jour résolu.

**Retenu :** deux règles, séparées par `ecarte`, qui existe déjà et distingue exactement les deux situations.

| état | mention | ce qu'elle dit |
|---|---|---|
| `ecarte === false` | `targetEyebrow(target)` | pourquoi le système montre ce jour |
| `ecarte === true` | `browsedEyebrow(date, today)` | à quelle distance est le jour qu'on a demandé |

`browsedEyebrow` est une fonction de la seule distance en jours civils :

```
  -2      -1        0        +1       +2 …
 ──┬───────┬────────┬────────┬────────┬──
   │      Hier  Aujourd'hui Demain  Dans n jours
  Il y a n jours
```

**Écarté :** la distance seule, partout. Elle est plus simple — une règle, une fonction, `targetEyebrow` disparaît — mais elle perd ce que D45 avait acheté. À l'ouverture un samedi de vacances, « Dans 10 jours » est vrai et muet ; « Prochain service · dans 10 jours » dit *pourquoi* l'écran montre ça. Ce n'est pas une redondance : c'est la seule phrase de l'écran qui justifie son propre contenu.

**Écarté :** conserver le statut et lui ajouter la distance parcourue. « Prochain service · dans 10 jours · plus 2 » est un compteur, pas une mention.

Le prix est deux fonctions voisines à ne pas confondre — le même prix que `targetEyebrow` et `targetReturnLabel` payent déjà, pour la même raison, et leurs docblocks disent déjà lequel sert à quoi.

Aucun pluriel à traiter : une distance de 1 est captée par « Demain » et « Hier », donc `n` vaut toujours au moins 2.

## D61 — La date est le titre de l'écran (déplace D55)

« Menu de la cantine » et « Bon appétit ! » quittent l'écran. Le premier nomme l'application à l'intérieur de l'application ; le second est une politesse qui occupe la ligne où la maquette voulait de l'information.

Mais `EnTete` produit le `h1`, et D55 tient que ce `h1` est unique par construction parce qu'un seul endroit peut en produire un. Retirer le titre laisserait les deux écrans de menu sans titre de premier niveau.

**Retenu :** sur les écrans de menu, le `h1` est ce que `RangNavigation` désigne — « Jeudi 10 septembre » sur l'écran du jour, « 1 au 5 septembre » sur celui de la semaine. C'est déjà la seule chose que l'écran doive dire avant tout le reste ; son docblock le dit en ces termes.

Le titre reste unique et reste produit à un seul endroit. D55 n'est pas annulé : sa propriété est conservée, son porteur change.

**Écarté :** un `h1` visuellement masqué. Il faudrait le maintenir sans jamais le voir, et il redirait ce que la ligne suivante affiche déjà.

**Écarté :** promouvoir l'enseigne. Le docblock d'`Enseigne` argumente l'inverse depuis D35, et il a raison : un lecteur d'écran attend le nom de la page, pas le nom du lieu.

**Conséquence à vérifier.** Le titre vit dans `{#key cle}` et se remonte à chaque navigation. `{#key}` remplace de façon synchrone — l'animation `.glisse` est une animation CSS d'entrée, pas une transition de sortie — donc il n'existe à aucun instant zéro ni deux titres de premier niveau. C'est ce que les contrôles existants mesurent, et ils continuent de le mesurer.

`EnTete` perd sa `baseline` : plus aucun écran n'en passe. Le composant se rétrécit à un titre, et ne sert plus que les trois écrans secondaires.

## D62 — La sortie d'un écran secondaire est dans l'enseigne (restreint D55)

D44 avait mis la commande de retour dans l'en-tête ; D55 l'en a sortie. La ramener en haut ressemble à un aller-retour. Ce n'en est pas un, et la raison mérite d'être écrite, parce qu'elle est ce qui rend ce changement légitime.

**`CommandeRetour` sert aujourd'hui deux fonctions que seul son nom réunit :**

| | retour au repère | sortie d'écran |
|---|---|---|
| écrans | `/`, `/semaine` | `/reglages`, `/greve`, `/a-propos` |
| présence | conditionnelle (`ecarte`) | permanente |
| libellé | nomme le jour visé, calculé | constant par écran |
| dépend de | le contenu affiché | l'écran, rien d'autre |

D44 et D55 n'ont jamais parlé que de la première. La seconde est née avec les écrans secondaires et a hérité de son emplacement par ressemblance de nom.

**Retenu :** la seconde remonte dans l'enseigne, à l'emplacement qu'occupe la roue crantée. Cet emplacement porte l'un ou l'autre, jamais les deux, jamais rien :

```
  /  et  /semaine          ┌──────────────────────────────┬─────┐
                           │ ● Cantine des écoles         │  ⚙  │
                           └──────────────────────────────┴─────┘

  /reglages, /a-propos     ┌──────────────────────┬───────────────┐
                           │ ● Cantine des écoles │  ↩ Menu       │
                           └──────────────────────┴───────────────┘

  /greve                   ┌──────────────────────┬───────────────┐
                           │ ● Cantine des écoles │  ↩ Réglages   │
                           └──────────────────────┴───────────────┘
```

La première ne bouge pas : elle apparaît et disparaît avec le contenu, et l'emplacement de l'enseigne est déjà pris par la roue sur les écrans où elle vit. D55 la concerne, et D55 tient.

**La roue s'efface hors des écrans de menu.** Elle s'effaçait déjà sur `/reglages` — « une commande qui mène là où l'on est déjà ne mène nulle part ». La règle s'étend : sur `/greve` et `/a-propos`, elle mène quelque part, mais pas là où l'on cherche à aller. On y est venu pour lire, on en repart ; la seule commande utile est celle qui fait repartir.

**La commande est nommée, pas une flèche nue.** Le coin haut-gauche est déjà un retour au menu : l'enseigne est un lien vers `/`. Une flèche muette à droite serait un second chemin vers la même destination, sur la même ligne, sans rien qui les distingue. En nommant sa destination, la commande dit ce que l'enseigne ne dit pas — et sur `/greve` elle mène ailleurs qu'elle.

Le nom accessible est complet — « Retour au menu », « Retour aux réglages » — et contient le texte visible, comme WCAG 2.5.3 l'exige.

**Depuis `/greve`, la sortie ramène aux réglages.** On y arrive par eux et par aucun autre chemin. Une commande d'en-tête se lit comme « remonter d'un cran » ; la faire sauter par-dessus l'écran d'où l'on vient contredirait sa place.

**Écarté :** `history.back()`. Il rend la destination indevinable depuis le libellé, et un écran ouvert directement — depuis un signet, depuis le partage d'un lien — n'a pas d'historique à remonter.

**Écarté :** ne rien mettre et laisser l'enseigne faire le travail. Elle est un lien que rien n'annonce comme tel ; c'est une convention, pas une affordance.

## D63 — Le pied de source s'aligne sur sa cible tactile

Trois fichiers portent le même pied, avec le même défaut :

```css
footer { display: flex; justify-content: space-between; }   /* align-items: stretch */
footer :global(a) { min-height: var(--touch); display: inline-flex; align-items: center; }
```

Le lien impose 44 pixels à la ligne. Le `<span>` s'étire à 44 pixels et pose son texte **en haut** ; le lien pose le sien **au centre**. Quatorze pixels séparent les deux lignes de base, ce qui se lit comme un chevauchement.

**Retenu :** `align-items: center` sur le pied, et le pied extrait en `PiedSource`. Trois copies d'un même bloc portant trois fois le même défaut sont l'argument pour l'extraction, pas contre.

Les trois copies divergent déjà : deux replient sur `Mis à jour le …` quand `updatedLabel` manque, la troisième non. L'extraction fixe la version complète — l'écran de la semaine gagne un repli qu'il n'avait pas de raison de ne pas avoir.

**Retenu aussi :** la réserve basse de la coque passe de `calc(var(--space-5) + var(--pied-reserve))` à `calc(var(--space-3) + var(--pied-reserve))`. `--pied-reserve` est déjà la hauteur du pied augmentée de la zone sûre ; le `--space-5` était un intervalle de plus, sans motif écrit, et c'est lui qu'on lit comme un grand vide au-dessus des mentions. `--space-3` est l'intervalle de la coque et de ses enfants : le pied fixe est séparé du contenu comme deux enfants le sont entre eux.

La ligne reste haute de 44 pixels. C'est la cible tactile, pas un défaut.

## D64 — Un jeton de surface n'est jamais une encre

`a-propos` et `DaySheet` peignent leurs liens en `color: var(--fond)` sur une carte blanche. **1,17:1.** Le seuil est 4,5:1.

Ces deux déclarations sont des survivantes de l'apparence sombre supprimée par D25 : `--fond` était alors la couleur claire, et un lien clair sur un panneau sombre était juste. La palette a été retournée par D49, les déclarations sont restées. Le docblock de `a-propos` raconte la suppression d'une requête média voisine, dans le même bloc, sans voir celle-ci.

**Retenu comme couleur :** `--accent`, à 5,77:1 sur la carte. Le jeton est défini pour « enseigne, onglet courant, commande de retour » : un lien est de cette famille. `--ink` passerait le seuil de très loin, mais rendrait le lien indistinct du texte qui l'entoure, et laisserait le soulignement porter seul la nature de la commande.

**Retenu comme filet :** `contrast.test.ts` refuse qu'un jeton de surface apparaisse en `color:` dans un composant. Les jetons sont partitionnés une fois — encres d'un côté, surfaces de l'autre — et la règle est structurelle, pas numérique.

**Écarté :** vérifier la paire réellement formée. C'est la règle juste, et elle demande de remonter la surface depuis le composant — donc de résoudre la cascade, donc un moteur CSS. Le coût est sans commune mesure avec ce qu'il attrape en plus.

Ce que la règle retenue ne voit pas, il faut le dire : une encre licite sur une surface où elle ne tient pas le seuil. Elle ferme la classe d'erreur constatée deux fois, pas toutes.

**Les inversions sont déclarées et mesurées, jamais exemptées.** Écrite telle quelle, la règle a trouvé une troisième occurrence à l'implémentation, et celle-là était juste : l'étiquette « Aujourd'hui » de l'écran de la semaine peint `--carte` sur `--ink`, blanc sur encre, à 15,48:1. La partition ne peut pas le voir — elle lit une déclaration, pas la surface qui la porte.

Une exemption ferait sortir la couleur de toute vérification, c'est-à-dire l'état d'où l'on vient. Une inversion se déclare donc avec le fond sur lequel elle se pose, et devient une paire de plus dans le contrôle numérique. Le prix est une ligne par inversion — et c'est le prix juste, puisque c'est ce qui force à dire sur quoi elle se pose.

**Le glob remplace la liste tenue à la main.** Le contrôle de couverture des transparences lisait neuf fichiers énumérés, complétés un par un au fil des découvertes. Trois fichiers portant des transparences n'y ont jamais figuré, et l'extraction du pied de source aurait fait sortir deux taux de la seule couverture qui les voyait. Une liste qu'il faut penser à compléter est une liste qui finit incomplète ; le contrôle d'apparence unique avait déjà tiré cette conclusion, deux blocs plus bas, pour la même raison.
