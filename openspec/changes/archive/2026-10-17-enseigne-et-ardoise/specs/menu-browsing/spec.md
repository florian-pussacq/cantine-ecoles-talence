## RENAMED Requirements

- FROM: `### Requirement: Couche modale de détail d'un plat`
- TO: `### Requirement: Couche modale de détail de la journée`

## REMOVED Requirements

### Requirement: Grille compartimentée de l'écran Aujourd'hui

**Raison** : la géométrie prescrite — des compartiments dont la taille encode le rôle, disposés en grille qui ne se referme pas — coûte 470 pixels de hauteur pour six libellés courts et fait sortir le déjeuner de la fenêtre d'un téléphone. Les intentions de cette exigence sont conservées et reportées dans **Ardoise du jour** ci-dessous : la prééminence du plat principal, sa couleur de famille, la distinction entre un rôle absent et une donnée manquante, la règle du libellé tautologique, et le statut du goûter comme objet hors du déjeuner. C'est la forme qui est abandonnée, pas ce qu'elle voulait garantir.

**Migration** : voir **Ardoise du jour**, qui remplace terme à terme chaque garantie de l'exigence retirée.

## ADDED Requirements

### Requirement: Ardoise du jour

Les plats du déjeuner SHALL être présentés sous forme d'ardoise : une entrée par rôle, dans l'ordre du service, chacune énonçant son rôle et le libellé du plat. Les rôles SHALL être alignés entre eux, de sorte que la lecture verticale des rôles et celle des libellés forment deux colonnes distinctes.

Le plat principal SHALL être visuellement distinct de tous les autres rôles à la fois par sa couleur de famille, par la présence d'une illustration et par la taille de son libellé. Il SHALL conserver sa place dans l'ordre du service, sa prééminence étant portée par sa forme et non par son rang.

Le pain SHALL être présenté en fin d'ardoise, plus discrètement que les rôles servis, parce qu'il n'est pas servi à un moment du repas.

Lorsqu'un rôle est absent du jour affiché, son entrée SHALL rester en place et indiquer explicitement l'absence. L'ardoise NE SHALL PAS se refermer, afin qu'un rôle absent reste distinguable d'une donnée manquante.

Lorsque le libellé d'un plat n'ajoute rien à son libellé de rôle, l'entrée SHALL nommer à sa place ce qui distingue ce plat des autres jours — sa qualité lorsqu'elle est renseignée. Elle NE SHALL PAS énoncer deux fois le même mot.

Lorsqu'un tel libellé n'a aucune qualité à promouvoir, l'entrée SHALL signaler que le détail n'est pas publié. Elle NE SHALL PAS laisser entendre que le plat n'est pas servi, lorsque d'autres informations sur ce plat — ses allergènes notamment — sont connues.

Le goûter SHALL être présenté hors de l'ardoise, comme un objet distinct portant le même vocabulaire visuel que le plat principal, et séparé du déjeuner de telle sorte qu'il ne se lise pas comme une partie de celui-ci.

Le rôle `accompagnement` SHALL être désigné par le mot « Accompagnement ».

#### Scenario: Jour complet
- **WHEN** un jour comporte tous ses rôles
- **THEN** chaque rôle occupe une entrée de l'ardoise dans l'ordre du service, et le plat principal est le seul à porter une couleur de famille, une illustration et un libellé de grande taille

#### Scenario: Ordre du service
- **WHEN** l'ardoise d'un jour complet est lue de haut en bas
- **THEN** les rôles servis apparaissent dans l'ordre entrée, plat, accompagnement, laitage, dessert, et le pain vient après eux

#### Scenario: Rôle absent
- **WHEN** un jour ne comporte pas d'accompagnement
- **THEN** l'entrée de l'accompagnement reste affichée avec la mention explicite qu'il n'y en a pas ce jour

#### Scenario: Plat principal de famille inconnue
- **WHEN** la famille du plat principal ne peut pas être déduite
- **THEN** son entrée prend la couleur de repli neutre et reste lisible

#### Scenario: Libellé qui répète le rôle, qualité connue
- **WHEN** le pain du jour porte le libellé « Pain » et l'indicateur de qualité « Label Rouge »
- **THEN** l'entrée annonce le pain par sa qualité, et le mot « pain » n'apparaît qu'une fois

#### Scenario: Libellé qui répète le rôle, aucune qualité
- **WHEN** le goûter du jour porte le libellé « Goûter » et aucun indicateur de qualité
- **THEN** l'affichage signale que le détail n'est pas publié, sans répéter le mot « goûter » ni laisser croire qu'aucun goûter n'est servi

#### Scenario: Libellé porteur d'information
- **WHEN** le pain du jour porte le libellé « Pain du mois »
- **THEN** ce libellé est affiché tel quel, puisqu'il dit ce que le rôle ne dit pas

#### Scenario: Le goûter reste hors du déjeuner
- **WHEN** un jour comporte un goûter détaillé
- **THEN** celui-ci est présenté hors de l'ardoise, avec le vocabulaire visuel du plat principal, et une rupture visible le sépare du déjeuner

#### Scenario: Désignation de l'accompagnement
- **WHEN** un jour comporte un accompagnement
- **THEN** son rôle est désigné par le mot « Accompagnement »

### Requirement: Le jour tient dans la fenêtre

Sur la fenêtre d'un téléphone courant, l'écran du jour SHALL présenter sans défilement : la date affichée, l'intégralité des rôles du déjeuner, le goûter lorsqu'il existe, et les commandes de navigation entre jours.

Le pied de page et les mentions MAY se trouver au-delà de la ligne de flottaison.

Cette exigence SHALL être vérifiée par une mesure automatisée sur le profil mobile des tests, et non par appréciation.

#### Scenario: Jour complet sur téléphone
- **WHEN** un jour comportant tous ses rôles et un goûter est affiché sur le profil mobile des tests
- **THEN** la date, tous les rôles du déjeuner, le goûter et les commandes de jour précédent et suivant sont dans le champ visible sans défilement

#### Scenario: Mention de situation sur deux lignes
- **WHEN** le jour affiché est éloigné du jour courant et que la mention de situation occupe une seconde ligne
- **THEN** l'exigence précédente reste satisfaite

### Requirement: Enseigne de l'application

L'application SHALL afficher son nom en permanence, sur tous les écrans de consultation comme de réglage, au moyen d'une enseigne rendue en tête d'écran.

L'enseigne SHALL être rendue avec un poids visuel inférieur à celui du titre de l'écran : elle est constante par construction et NE SHALL PAS prendre de surface à ce qui varie.

L'enseigne NE SHALL PAS être un titre de premier niveau, et NE SHALL PAS changer lorsque le jour ou la semaine affichés changent.

L'enseigne SHALL porter la commande d'accès au réglage des allergènes, laquelle NE SHALL PAS être affichée sur sa propre destination.

#### Scenario: Nom visible sur tous les écrans
- **WHEN** l'utilisateur ouvre l'un quelconque des écrans de l'application
- **THEN** le nom de l'application est visible sans défiler

#### Scenario: L'enseigne ne suit pas le jour
- **WHEN** l'utilisateur change de jour et qu'une transition accompagne le changement
- **THEN** l'enseigne reste immobile pendant que la date et le contenu changent

#### Scenario: Un seul titre de premier niveau
- **WHEN** un écran quelconque est chargé
- **THEN** le document contient exactement un titre de premier niveau, et ce n'est pas l'enseigne

## MODIFIED Requirements

### Requirement: En-tête d'écran

Chaque écran SHALL porter un en-tête énonçant ce que l'écran montre et pour quand.

Le titre de l'en-tête — la date sur l'écran du jour, la période sur l'écran de la semaine — SHALL tenir sur une seule ligne et NE SHALL JAMAIS être coupé. Lorsque l'en-tête ne peut pas loger sur une même ligne le titre et la mention qui le situe, c'est la mention qui SHALL se replier.

Chaque écran SHALL porter exactement un titre de premier niveau, qui SHALL être ce titre d'en-tête.

L'en-tête NE SHALL PAS porter de commande : celles qui sont communes à tous les écrans vivent sur l'enseigne.

#### Scenario: Un seul titre de premier niveau
- **WHEN** un écran de consultation est chargé
- **THEN** le document contient exactement un titre de premier niveau

#### Scenario: L'en-tête situe la date
- **WHEN** l'écran du jour affiche un jour autre que celui du moment
- **THEN** l'en-tête énonce la date affichée et la façon dont elle se situe par rapport à aujourd'hui

#### Scenario: Date longue et mention longue
- **WHEN** l'écran du jour affiche une date dont le libellé est le plus long possible, accompagnée de la mention de situation la plus longue possible
- **THEN** la date est rendue entière sur une seule ligne, et c'est la mention qui occupe une seconde ligne

#### Scenario: Période de la semaine
- **WHEN** l'écran de la semaine est affiché
- **THEN** la période énoncée tient sur une seule ligne et n'est pas coupée

### Requirement: Couche modale de détail de la journée

Le détail de la journée SHALL être présenté dans une couche modale unique, listant chaque plat du jour — goûter compris — avec ses allergènes. Le système NE SHALL PAS exiger une ouverture par plat pour obtenir cette liste.

Tant qu'elle est ouverte, la couche SHALL retenir le focus clavier, empêcher l'interaction et le défilement de ce qui se trouve derrière, et rendre inopérantes les commandes de navigation entre jours.

La couche SHALL être refermable par au moins trois chemins : une commande visible portant un libellé explicite, la touche d'échappement, et une action sur la surface qui la sépare du contenu. À sa fermeture, le focus SHALL revenir sur l'élément qui l'a ouverte, quel qu'il soit.

La couche NE SHALL PAS présenter d'affordance de manipulation à laquelle aucun comportement ne répond.

Sur un écran étroit, la couche SHALL occuper toute la largeur et être ancrée au bas de l'écran, de sorte que sa commande de fermeture reste à portée du pouce. Sur un écran large, elle SHALL être centrée et de largeur bornée.

#### Scenario: Une ouverture, tous les plats
- **WHEN** l'utilisateur actionne le menu du jour
- **THEN** la couche présente chaque plat du jour avec ses allergènes, sans qu'une seconde ouverture soit nécessaire

#### Scenario: Le focus ne quitte pas la couche ouverte
- **WHEN** la couche est ouverte et que l'utilisateur parcourt les éléments interactifs au clavier
- **THEN** le parcours reste enfermé dans la couche et n'atteint jamais le contenu situé derrière

#### Scenario: Retour du focus à la fermeture
- **WHEN** l'utilisateur ouvre la couche depuis le goûter puis la referme, par quelque chemin que ce soit
- **THEN** le focus revient sur le goûter, et non sur le menu du déjeuner ni au début du document

#### Scenario: Le fond ne défile pas
- **WHEN** la couche est ouverte et que l'utilisateur fait défiler au-delà de son contenu
- **THEN** le contenu situé derrière reste immobile

#### Scenario: Les commandes de jour sont neutralisées
- **WHEN** la couche est ouverte et que l'utilisateur actionne les flèches de navigation entre jours
- **THEN** le jour affiché ne change pas

#### Scenario: Adaptation à la largeur
- **WHEN** la couche est ouverte sur un écran large
- **THEN** elle est centrée et de largeur bornée, et non étirée sur toute la largeur disponible

### Requirement: Écran Aujourd'hui

Le système SHALL présenter, à l'ouverture, le menu du jour à afficher sous forme de liste verticale ordonnée par rôle. Chaque plat SHALL montrer son libellé et un repère de rôle lisible. L'écran SHALL être compréhensible sans zoom sur un écran de téléphone.

L'écran NE SHALL PAS afficher de squelette de chargement ni d'indicateur de progression lorsque les données sont déjà en cache.

Le menu du jour SHALL constituer une cible unique donnant accès au détail de la journée. Les plats pris isolément NE SHALL PAS être des cibles distinctes.

#### Scenario: Ouverture un jour d'école
- **WHEN** l'utilisateur ouvre l'application un jour ouvré dont le menu est connu
- **THEN** la date, le thème éventuel du jour et la liste des plats par rôle sont affichés sans interaction supplémentaire

#### Scenario: Données déjà en cache
- **WHEN** l'application est ouverte alors que les données sont en cache
- **THEN** le contenu s'affiche directement, sans squelette ni indicateur de chargement intermédiaire

#### Scenario: Jour porteur d'un thème
- **WHEN** le jour affiché comporte un thème et une note éditoriale
- **THEN** ceux-ci sont affichés en tête du menu, distincts des plats

#### Scenario: Une seule cible pour le déjeuner
- **WHEN** l'utilisateur parcourt l'écran du jour au clavier
- **THEN** le déjeuner est atteint comme un élément interactif unique, et non comme une suite d'éléments par rôle

### Requirement: Accès aux écrans

Le système SHALL rendre atteignables en permanence, depuis n'importe quel écran, les destinations consultées quotidiennement — l'écran du jour et l'écran de la semaine — au moyen d'une barre ancrée au bas de la fenêtre, à portée du pouce sur un téléphone tenu d'une main.

Cette barre NE SHALL PAS mettre sur le même plan une vue de consultation et un réglage. Elle NE SHALL contenir que des destinations consultées quotidiennement.

Les écrans que l'on consulte une fois — le réglage des allergènes, les mentions — SHALL être atteignables autrement : par une commande portée par l'enseigne pour le premier, par le pied de page pour le second.

Lorsque l'écran courant ne figure pas dans la barre, celle-ci SHALL rester affichée sans marque d'écran courant, et SHALL suffire à en sortir.

La barre SHALL compenser la zone sûre inférieure de l'appareil, de sorte qu'aucune de ses commandes ne soit recouverte par un indicateur système. Le contenu de l'écran SHALL réserver la hauteur de la barre augmentée de cette zone sûre, de sorte qu'aucun contenu ne reste inaccessible derrière elle.

Sur un écran large, la barre SHALL rester bornée à la colonne de contenu, conformément à l'exigence de lisibilité sur écran large.

#### Scenario: Destinations quotidiennes atteignables partout
- **WHEN** l'utilisateur se trouve sur un écran quelconque de l'application
- **THEN** l'écran du jour et l'écran de la semaine sont atteignables sans défiler ni ouvrir de menu

#### Scenario: Écran hors de la barre
- **WHEN** l'utilisateur consulte le réglage des allergènes ou les mentions
- **THEN** la barre reste affichée, aucun de ses segments n'est marqué comme courant, et elle permet de rejoindre l'écran du jour ou celui de la semaine

#### Scenario: Le réglage s'atteint depuis l'enseigne
- **WHEN** l'utilisateur se trouve sur un écran autre que le réglage des allergènes
- **THEN** l'enseigne porte la commande qui y mène

#### Scenario: Zone sûre inférieure
- **WHEN** l'application est ouverte sur un appareil dont le bas de l'écran est occupé par un indicateur système
- **THEN** aucune commande de la barre ne se trouve sous cet indicateur, et le pied de page reste atteignable

#### Scenario: Barre sur écran large
- **WHEN** l'application est ouverte sur un écran de bureau
- **THEN** la barre reste bornée à la largeur de la colonne de contenu et ne s'étire pas sur toute la fenêtre

#### Scenario: Aucun réglage dans la barre
- **WHEN** la barre est affichée
- **THEN** elle ne contient que des destinations de consultation, à l'exclusion de tout écran de réglage
