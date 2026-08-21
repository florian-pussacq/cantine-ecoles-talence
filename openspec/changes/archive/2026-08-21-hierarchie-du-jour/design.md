## Context

Ce changement traite le contenu de l'écran du jour, pas sa coque. Il vient d'une lecture d'écran à voix haute — le pain ne va pas, le goûter ne se voit pas, la transition est moche — dont la mesure sur les données a confirmé deux points sur trois et déplacé le troisième.

**La numérotation continue à D28.** Le code cite les décisions par leur numéro seul.

Une observation de méthode, parce qu'elle a coûté quelque chose. La conversation d'origine portait aussi sur une navigation basse et une roue crantée pour les réglages. Rien n'en subsistait : ni dans `openspec/`, ni dans l'historique Git, ni ailleurs. La seule trace était une mention « hors périmètre » dans un autre change, citant deux capacités qui n'ont jamais existé — une planification fabriquée qui donnait l'illusion d'un suivi. **Ce qui n'est pas écrit dans un artefact n'existe pas**, et une mention en creux dans le change du voisin ne compte pas comme une trace. D'où la section « Questions ouvertes » de ce document, qui consigne explicitement ce qu'on ne fait pas.

## Goals / Non-Goals

**Goals :**

- Que la surface d'un compartiment corresponde à ce qu'il apprend.
- Que le goûter se lise comme un autre moment de la journée, et non comme une note de bas de plateau.
- Qu'une absence de donnée cesse de se déguiser en donnée.

**Non-Goals :**

- Aucun changement de la grille elle-même : six compartiments, mêmes tailles, le plat toujours le plus large et coloré par sa famille.
- Aucun changement de schéma ni de saisie. Les mercredis sans goûter détaillé restent tels quels dans les données.
- Aucun carrousel. Voir les questions ouvertes.

## Decisions

### D28 — Un compartiment qui répète son rôle nomme ce qui varie

Le compartiment du pain affiche trois choses :

```
    PAIN            libellé de rôle    — constant par construction
    Pain            libellé du plat    — constant 33 jours sur 35
    [LABEL ROUGE]   qualité, 9 px      — la seule chose qui distingue ce jour
```

Mesuré sur les trente-cinq jours du jeu de données : `bio` quatorze fois, `label-rouge` dix-neuf fois, aucun indicateur les deux fois où le libellé est « Pain du mois ». L'information existe, elle est affichée, elle est simplement affichée en dernier et en plus petit que la tautologie qui la précède.

La règle retenue se formule sans nommer le pain : **lorsque le libellé d'un plat n'ajoute rien à son libellé de rôle, c'est sa qualité qui le nomme.** Trois raisons de la préférer à un cas particulier écrit pour le rôle `pain` :

1. Elle décrit le défaut réel — une redondance — et non le seul endroit où on l'a remarqué.
2. Elle attrape le goûter du mercredi sans qu'on ait eu à y penser, ce qui est précisément ce qu'on lui demande.
3. Elle se teste comme une fonction pure, sur une chaîne et un rôle, sans navigateur ni données réelles.

*Cas de repli.* Une tautologie sans qualité à promouvoir — le goûter du mercredi — ne peut pas être réparée par le nommage : il n'y a rien à nommer. Elle devient alors une absence déclarée, dans les termes de D12, qui exige déjà qu'un creux reste distinguable d'une donnée manquante. La formulation dit que le détail n'est pas publié, et non que le goûter n'existe pas : la différence compte, puisque les allergènes de ces sept jours *sont* renseignés — il y a bien un goûter, on ignore lequel.

*Tranché sur le PDF officiel.* Le document source imprime, tous les autres jours, `Goûter : Pain + Crème de marron`. Le mercredi, il imprime `Goûter` seul, suivi des mêmes allergènes `1+3+7+8`, et cela sans exception sur tous les mercredis du mois. **C'est un défaut de la source, pas de la saisie** : celle-ci a reproduit fidèlement ce qui est publié. Il n'y a donc rien à corriger dans les données, et la formulation retenue est la seule honnête — la Ville déclare les allergènes d'un goûter dont elle ne nomme pas le contenu.

*Ce qui n'est pas touché.* Les autres compartiments gardent leur qualité en capsule discrète, à sa place : là où le libellé désigne réellement un plat, la qualité est une précision, pas le sujet.

*Vérifié sur la source, après coup.* Le PDF municipal de septembre imprime `PAIN BIO`, `PAIN LABEL ROUGE`, `PAIN DU MOIS` — la qualité fait partie du nom du pain **sur le document d'origine**. La saisie l'avait séparée en un libellé et un indicateur, ce qui est juste pour le modèle de données ; l'affichage, lui, l'avait perdue. La règle ne fabrique donc pas une information : elle reconstitue à l'écran ce que la Ville imprime sur son menu.

*Alternative écartée — masquer le compartiment du pain.* C'était ma proposition, et elle était moins bonne. Retirer le pain aurait supprimé, avec la tautologie, l'information de qualité que ce compartiment est le seul à porter ; et il aurait fallu la reloger ailleurs, ou la perdre. Le compartiment n'était pas de trop : il était mal rempli.

### D29 — Le goûter est un objet, pas une ligne

Vingt libellés distincts sur trente-cinq jours. En quantité d'information, le goûter est le deuxième élément de l'écran, derrière le plat principal et devant tous les compartiments de moitié de largeur. Il est rendu sans fond, sans bordure, en petit corps, sous le plateau — plus faible que n'importe quel creux vide de la grille.

Il ne rejoint pas la grille pour autant. Le plateau représente un plateau de cantine : ce qui y figure est servi au même moment, sur le même support. Un septième compartiment dirait que le goûter est un plat du déjeuner, ce qui est faux, et cette erreur-là serait pire que la discrétion actuelle.

Il devient donc **un objet distinct, du même vocabulaire visuel que les compartiments** — un fond, une forme, un intitulé de rôle, une illustration, la place d'une pastille d'allergène — **posé sous le plateau et séparé de lui par une rupture qui se voit**.

*Alternative écartée — un filet de séparation.* Un trait horizontal surmonté d'un titre serait la solution réflexe. Elle est faible ici pour deux raisons : l'écran porte déjà un filet, en pied de page, où il signifie « fin du contenu » — un second filet plus haut se lirait comme une fin de section, pas comme un changement de moment. Et un trait sépare deux choses de même nature, alors qu'on veut dire que celles-ci n'en sont pas. Un objet distinct, posé plus loin sur la table, dit la séparation par sa forme et non par un signe ajouté.

*Ce que la mise en œuvre devra vérifier.* Le goûter est aujourd'hui peint sur le fond de la table. Lui donner une surface propre change les paires de contraste qui le concernent, et le contrôle de couverture des transparences (D27) refusera toute opacité introduite sans être déclarée. Le test le signalera de lui-même — c'est ce pour quoi il a été écrit.

### D30 — La transition n'a qu'une horloge, et sa durée est une expérience

Trois défauts ont été relevés sur le changement de jour. Ce changement en traite un et demi, et l'assume.

```
 Aujourd'hui                              Voulu

 t=0        t=180ms                       t=0        t=Xms
┌─────────┐┌─────────┐                   ┌─────────┐┌─────────┐
│ 9 sept. ││ 9 sept. │  en-tête, HORS    │ 8→9     ││ 9 sept. │  un seul
├─────────┤├─────────┤  du bloc animé    ├─────────┤├─────────┤  mouvement
│         ││┌───────┐│                   │  ┌──────││┌───────┐│
│  vide → ││└───────┘│  plateau, animé   │  │  →   ││└───────┘│
└─────────┘└─────────┘                   └─────────┘└─────────┘
     ↑ la date est déjà celle de demain
       pendant que le plateau d'hier part
```

**Le défaut principal n'est pas la vitesse, c'est la désynchronisation.** `EnTete` est rendu hors du bloc `{#key date}` : il bascule instantanément, tandis que le plateau met 180 ms. Un seul changement, deux temps. C'est ce que l'œil enregistre comme « moche » avant même de pouvoir nommer la vitesse.

D'où l'ordre des opérations : **ralentir sans corriger la désynchronisation la rendrait plus visible, pas moins** — une animation plus longue expose son décalage plus longtemps. Mettre l'en-tête sous la même horloge n'est donc pas une amélioration séparée, c'est la condition pour qu'une durée soit jugeable. Sans elle, l'expérience mesurerait autre chose que ce qu'elle croit mesurer.

*La durée est ouverte et se juge sur un téléphone.* La valeur retenue à l'implémentation est un point de départ, pas un résultat. Elle vit dans un seul jeton de `tokens.css`, partagé par les deux écrans, et se change d'une ligne. Aucun argument ne tranchera 180 contre 280 millisecondes ; un pouce sur un vrai écran, oui.

*Tension avec une exigence existante, assumée.* « Navigation entre jours » exige que le passage d'un jour à l'autre soit *perçu comme immédiat*. Ralentir une animation semble aller contre. La réconciliation est réelle et non verbale : **le contenu est présent dès la première image** — l'animation est décorative, elle ne retarde ni le rendu, ni la lecture, ni l'interaction. Ce qui doit être immédiat, c'est la disponibilité du menu, pas l'extinction du mouvement. L'exigence est reformulée pour dire cela explicitement, faute de quoi elle interdirait toute transition, ce qui n'a jamais été son objet.

*Ce qui reste non traité, et pourquoi c'est écrit ici.* L'animation n'a pas de sortie — le `{#key}` détruit l'ancien contenu d'un coup — et elle ne suit pas le doigt : le balayage promet un contenu solidaire de la main, et livre un décalage de 24 pixels après le relâchement. Réparer cela veut dire un vrai carrousel, avec les jours voisins pré-rendus de part et d'autre et une position pilotée par le pointeur. C'est un changement à part entière, pas un réglage de durée.

## Risks / Trade-offs

**La règle de D28 est déclenchée par une comparaison de chaînes.** Si la source publie un jour « pain » en minuscules, « Pain " avec une espace, ou « Le pain », la tautologie n'est plus détectée et le compartiment redevient ce qu'il est aujourd'hui. La dégradation est douce — on retombe sur le comportement actuel, pas sur une erreur — mais elle est silencieuse. La normalisation doit être explicite et testée sur ses bords, sinon elle donnera l'illusion de couvrir des cas qu'elle laisse passer.

**Promouvoir la qualité au rang de nom donne du poids à une donnée non vérifiée.** « Label Rouge » affiché en gros est une affirmation sur un produit, reprise d'un PDF municipal. Elle l'était déjà, en neuf pixels. Le risque ne change pas de nature, seulement d'échelle, et l'application renvoie au PDF officiel depuis chaque plat.

**Grossir le goûter prend de la hauteur au plateau sur un téléphone**, c'est-à-dire à la raison d'être de l'écran. C'est le même arbitrage que celui qui a réduit l'en-tête à une ligne. Il se juge sur un vrai appareil, en regardant si le plat principal reste visible sans défiler.

**Le changement porte à la fois une règle de contenu et un geste d'apparence.** La règle de nommage est vérifiable par un test ; la forme du goûter et la durée de la transition ne le sont pas, elles se jugent à l'œil. Les mélanger dans un même commit rend le jugement esthétique plus difficile à isoler. Ils partagent le même écran et les mêmes fichiers — les séparer coûterait deux passages sur `+page.svelte` pour un bénéfice de lisibilité d'historique, ce qui n'est pas l'arbitrage retenu ailleurs dans ce dépôt.

## Open Questions

*Consignées, et non laissées à la conversation — voir le Context.*

- **Le balayage qui suit le doigt.** Un carrousel à trois positions, les jours voisins pré-rendus, la position pilotée par le pointeur, un ressort au relâchement. C'est ce que le geste promet aujourd'hui sans le tenir. Coût réel : le rendu de trois jours au lieu d'un, sur un budget JavaScript à 89 %. À instruire avant de s'y engager.
- **La durée finale de la transition.** L'horloge est unifiée et la durée portée à 260 ms, mesurés identiques sur les deux blocs animés. Cette valeur reste un point de départ : elle ne se tranchera que sur un téléphone, et se change dans le seul jeton `--glisse`.
- ~~Les sept mercredis sans goûter détaillé.~~ **Tranché** : défaut de la source. Le PDF imprime `Goûter` seul, tous les mercredis, avec ses allergènes. Voir D28.
- ~~La coque : la barre d'onglets, la place des allergènes, la roue crantée.~~ **Instruite** dans le change `navigation-basse`, décisions D31 à D34.
- **La hauteur sur un téléphone court.** Mesuré sur le profil de test (839 pixels de pli) : le plat principal s'arrête à 436 pixels, la carte du goûter occupe 708 à 801, tout tient au-dessus du pli. Sur un appareil plus court — de l'ordre de 670 pixels — le goûter passe sous le pli. C'est acceptable puisqu'il est sous le plateau par construction, mais cela n'a pas été vu sur un vrai appareil de cette taille.
