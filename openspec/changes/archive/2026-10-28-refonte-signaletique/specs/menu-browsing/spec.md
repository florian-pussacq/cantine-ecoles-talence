## ADDED Requirements

### Requirement: Le déjeuner, un élément par rôle

L'écran du jour SHALL présenter le déjeuner comme une suite d'éléments, un par rôle du déjeuner et jamais moins. Le plat principal SHALL ouvrir la suite ; les autres rôles SHALL le suivre dans l'ordre du service. Un rôle absent SHALL produire une ligne compacte énonçant son absence, sans illustration, distincte d'une ligne portant un plat.

#### Scenario: Un rôle par élément
- **WHEN** l'écran du jour affiche un jour servi
- **THEN** chaque rôle du déjeuner est présent, le plat principal en tête puis les autres dans l'ordre du service, y compris ceux dont aucun plat n'est publié

#### Scenario: Rôle absent
- **WHEN** un jour ne comporte pas d'entrée
- **THEN** une ligne compacte énonce l'absence d'entrée, et ne se confond pas avec une ligne portant un plat

#### Scenario: Le plat principal est visible d'emblée
- **WHEN** l'écran du jour est affiché sur la plus petite fenêtre prise en charge
- **THEN** le plat principal, son aplat et son illustration sont entièrement visibles sans défiler

### Requirement: Le plat principal sur l'aplat de sa famille

Le plat principal SHALL être présenté sur un aplat de la couleur de sa famille, la même que sur l'écran de la semaine, avec le nom de cette famille écrit. Un plat principal dont la famille n'est pas reconnue SHALL porter la couleur de repli neutre, sans nom de famille. Aucun autre élément du déjeuner NE SHALL porter de couleur de famille ni de rôle.

#### Scenario: Le plat principal porte sa famille
- **WHEN** l'écran du jour affiche un rôti de bœuf en plat principal
- **THEN** son aplat porte la couleur de la famille viande et le mot « Viande », la même couleur que la tuile de ce jour sur l'écran de la semaine

#### Scenario: Plat principal inclassable
- **WHEN** le plat principal n'appartient à aucune famille reconnue
- **THEN** son aplat porte la couleur de repli neutre et aucun nom de famille

### Requirement: Les autres rôles en lignes

Les rôles du déjeuner autres que le plat principal SHALL être présentés par des lignes alignées sur une même grille, le libellé du rôle dans une colonne qui précède le nom du plat. Ces lignes NE SHALL PAS être présentées comme des cartes. Le libellé d'un rôle NE SHALL PAS être composé au-dessus du nom de son plat. Chaque ligne SHALL porter, lorsqu'ils existent, les mentions de qualité et le signalement d'allergène, et aucun texte descriptif.

#### Scenario: Les autres rôles restent en encre
- **WHEN** l'écran du jour affiche une salade grecque en entrée
- **THEN** sa ligne ne porte aucune couleur de famille ni de rôle, et son rôle se lit dans la colonne qui précède le nom du plat

#### Scenario: Pas de surtitre
- **WHEN** l'écran du jour est affiché
- **THEN** aucun libellé de rôle n'est composé au-dessus du nom de son plat

#### Scenario: Mentions d'une ligne
- **WHEN** l'accompagnement du jour est bio et déclare du céleri
- **THEN** sa ligne porte la mention « Bio » et nomme le céleri, sans autre texte

### Requirement: Le déjeuner est une seule cible

Aucun élément du déjeuner NE SHALL être actionnable isolément : la cible est la journée entière, portée par l'élément qui contient la suite.

#### Scenario: Aucun élément n'est actionnable
- **WHEN** l'écran du jour est parcouru au clavier
- **THEN** aucun élément de la suite ne reçoit le focus, et l'ouverture du détail se fait par la cible qui porte la journée

## MODIFIED Requirements

### Requirement: Écran Semaine

Le système SHALL présenter les cinq jours ouvrés de la semaine du jour affiché, sous une forme compacte permettant une lecture d'ensemble. Chaque jour SHALL être actionnable pour ouvrir le détail correspondant sur l'écran Aujourd'hui.

Chaque jour servi SHALL porter la couleur de la famille de son plat principal, la même que sur l'écran du jour, et le nom de cette famille écrit. La couleur NE SHALL PAS être le seul support de la famille. Un plat principal inclassable SHALL porter la couleur de repli neutre, sans nom de famille.

#### Scenario: Consultation de la semaine
- **WHEN** l'utilisateur ouvre l'écran Semaine
- **THEN** les cinq jours ouvrés sont visibles avec au minimum le plat principal de chacun

#### Scenario: Ouverture du détail d'un jour
- **WHEN** l'utilisateur actionne un jour depuis l'écran Semaine
- **THEN** l'écran Aujourd'hui s'ouvre sur ce jour

#### Scenario: Semaine partiellement publiée
- **WHEN** certains jours de la semaine ne figurent pas dans les données
- **THEN** ces jours sont présentés comme non publiés, distincts d'un jour sans école

#### Scenario: La famille se lit sans la couleur
- **WHEN** l'écran Semaine est affiché en niveaux de gris
- **THEN** la famille du plat principal de chaque jour servi reste lisible, écrite en toutes lettres

#### Scenario: Jour non servi
- **WHEN** la semaine contient un jour férié
- **THEN** ce jour ne porte aucune couleur de famille, et se distingue d'un jour servi

### Requirement: Accès aux écrans

Le système SHALL rendre atteignables depuis les écrans de consultation d'un menu, sans défiler ni ouvrir de menu, les deux destinations consultées quotidiennement — l'écran du jour et l'écran de la semaine. Ce choix SHALL être ancré au bas de la fenêtre.

Ce choix NE SHALL PAS mettre sur le même plan une vue de consultation et un réglage, et NE SHALL PAS être affiché sur un écran qu'il ne permet pas de choisir : rien de ce qu'il propose ne s'y consulte, et il n'en est donc pas une sortie.

L'en-tête de l'application SHALL réserver un emplacement unique, occupé sur tout écran par exactement une commande :

- sur les écrans de consultation d'un menu, la commande menant au réglage des allergènes ;
- sur tout autre écran, la commande de sortie de cet écran.

La commande de sortie SHALL nommer sa destination, et SHALL mener à l'écran depuis lequel son écran s'atteint.

Cet emplacement NE SHALL jamais rester vide, et sa hauteur SHALL être réservée de sorte que l'en-tête ne change pas de hauteur d'un écran à l'autre.

Les mentions SHALL rester atteignables depuis n'importe quel écran : par un lien rendu dans le flux des écrans de consultation d'un menu, à la suite de la provenance des données, et par un lien de l'écran des réglages.

Le choix entre les deux écrans SHALL compenser la zone sûre inférieure de l'appareil, et le contenu de l'écran SHALL réserver sa hauteur augmentée de cette zone sûre, de sorte qu'aucun contenu ne reste inaccessible derrière lui. Cette réserve NE SHALL PAS être augmentée d'un intervalle qui la doublerait.

Sur un écran large, le choix entre les deux écrans SHALL rester borné à la colonne de contenu, conformément à l'exigence de lisibilité sur écran large.

#### Scenario: Destinations quotidiennes atteignables
- **WHEN** l'utilisateur consulte l'écran du jour ou celui de la semaine
- **THEN** l'autre est atteignable sans défiler ni ouvrir de menu, depuis le bas de la fenêtre

#### Scenario: Écran secondaire
- **WHEN** l'utilisateur consulte le réglage des allergènes, le menu de grève ou les mentions
- **THEN** le choix entre les deux écrans de menu n'est pas affiché, la commande menant aux réglages n'est pas affichée, et une commande d'en-tête nommée permet de sortir de l'écran

#### Scenario: Sortie vers l'écran d'origine
- **WHEN** l'utilisateur ouvre le menu de grève depuis le réglage des allergènes puis actionne la commande de sortie
- **THEN** il revient au réglage des allergènes

#### Scenario: L'en-tête ne change pas de hauteur
- **WHEN** l'utilisateur passe d'un écran de consultation à un écran secondaire
- **THEN** l'en-tête conserve la même hauteur, une commande ayant remplacé l'autre au même emplacement

#### Scenario: Zone sûre inférieure
- **WHEN** l'application est ouverte sur un appareil dont le bas de l'écran est occupé par un indicateur système
- **THEN** le choix entre les deux écrans reste atteignable au-dessus de l'indicateur, et aucun contenu ne demeure caché derrière lui

#### Scenario: Les mentions depuis un écran de menu
- **WHEN** l'utilisateur défile jusqu'au bas de l'écran du jour ou de celui de la semaine
- **THEN** un lien vers les mentions suit la provenance des données, et reste visible au-dessus du choix entre les deux écrans

#### Scenario: Les mentions depuis les réglages
- **WHEN** l'utilisateur consulte l'écran des réglages
- **THEN** un lien y mène aux mentions

#### Scenario: Deux écrans, un actif
- **WHEN** l'écran du jour est affiché
- **THEN** le choix présente exactement deux entrées, et celle du jour est restituée comme active

#### Scenario: Le choix survit au changement d'écran
- **WHEN** l'utilisateur a choisi un jour puis passe à l'écran de la semaine et revient
- **THEN** le jour choisi est toujours affiché

#### Scenario: Pied de page sur écran large
- **WHEN** l'application est ouverte sur un écran de bureau
- **THEN** la provenance des données et le lien vers les mentions restent bornés à la largeur de la colonne de contenu

#### Scenario: Barre sur écran large
- **WHEN** l'application est ouverte sur un écran de bureau
- **THEN** le choix entre les deux écrans reste borné à la largeur de la colonne de contenu et ne s'étire pas sur toute la fenêtre

#### Scenario: Aucun réglage dans la barre
- **WHEN** le choix entre les deux écrans est affiché
- **THEN** il ne contient que des destinations de consultation, à l'exclusion de tout écran de réglage

## REMOVED Requirements

### Requirement: Cartes du jour

**Reason**: Le déjeuner cesse d'être une pile de cartes de même poids. Le plat principal se pose sur l'aplat de sa famille, les autres rôles deviennent les lignes d'un tableau, et le libellé du rôle quitte le surtitre pour une colonne.

**Migration**: Remplacée par quatre exigences, une par comportement : « Le déjeuner, un élément par rôle », « Le plat principal sur l'aplat de sa famille », « Les autres rôles en lignes » et « Le déjeuner est une seule cible ». La garantie « la première carte est visible d'emblée » devient « le plat principal est visible d'emblée ».


### Requirement: Pied fixe de mentions

**Reason**: Le bas de la fenêtre revient au choix entre le jour et la semaine, consulté chaque matin et placé sous le pouce (D31 rétabli, D52 annulé). Un pied fixe de mentions, consulté une fois, n'a pas à occuper en permanence la zone la plus accessible de l'écran.

**Migration**: Les mentions restent atteignables par un lien dans le flux des écrans de menu, à la suite de la provenance des données, et par un lien de l'écran des réglages (exigence « Accès aux écrans »). La compensation de la zone sûre inférieure passe du pied à la barre de choix.
