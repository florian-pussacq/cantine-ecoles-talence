## MODIFIED Requirements

### Requirement: Le déjeuner, un élément par rôle

L'écran du jour SHALL présenter le déjeuner comme une suite d'éléments. Le plat principal SHALL ouvrir la suite et porter l'accompagnement. Les autres rôles du déjeuner SHALL le suivre dans l'ordre du service, un élément par rôle et jamais moins. Un rôle absent autre que l'accompagnement SHALL produire une ligne compacte énonçant son absence, sans illustration, distincte d'une ligne portant un plat. L'absence d'accompagnement NE SHALL PAS être énoncée.

#### Scenario: Un rôle par élément
- **WHEN** l'écran du jour affiche un jour servi
- **THEN** le plat principal est en tête avec son accompagnement, puis chacun des autres rôles est présent dans l'ordre du service, y compris ceux dont aucun plat n'est publié

#### Scenario: Rôle absent
- **WHEN** un jour ne comporte pas d'entrée
- **THEN** une ligne compacte énonce l'absence d'entrée, et ne se confond pas avec une ligne portant un plat

#### Scenario: Plat complet
- **WHEN** un jour sert des ravioli bolognaise sans accompagnement
- **THEN** le plat principal s'affiche seul, et aucun élément n'énonce l'absence d'accompagnement

#### Scenario: Le plat principal est visible d'emblée
- **WHEN** l'écran du jour est affiché sur la plus petite fenêtre prise en charge, avec la paire plat et accompagnement la plus longue du corpus
- **THEN** le plat principal, son accompagnement, son aplat et son illustration sont entièrement visibles sans défiler

### Requirement: Le plat principal sur l'aplat de sa famille

Le plat principal SHALL être présenté sur un aplat de la couleur de sa famille, la même que sur l'écran de la semaine, avec le nom de cette famille écrit sous son intitulé, et seul sur cette ligne avec les mentions qui ne sont pas des pictogrammes. Le rôle « Plat » NE SHALL PAS y être écrit.

Lorsque le jour sert un accompagnement, l'intitulé du plat principal SHALL réunir le nom du plat et celui de l'accompagnement, le second subordonné au premier par sa graisse, de sorte qu'ils se lisent comme un seul plat. L'accompagnement NE SHALL PAS faire l'objet d'une ligne propre.

Un plat principal dont la famille n'est pas reconnue NE SHALL PAS être posé sur un aplat : il SHALL être présenté sur une surface claire délimitée par un filet d'encre, son intitulé en encre, sans nom de famille, avec l'illustration de repli. Aucun autre élément du déjeuner NE SHALL porter de couleur de famille ni de rôle.

#### Scenario: Le plat principal porte sa famille
- **WHEN** l'écran du jour affiche un rôti de bœuf en plat principal
- **THEN** son aplat porte la couleur de la famille viande et, sous son intitulé, le seul mot « Viande », la même couleur que la tuile de ce jour sur l'écran de la semaine

#### Scenario: Le plat et son accompagnement
- **WHEN** l'écran du jour affiche un filet de colin servi avec une purée de panais à la vanille
- **THEN** l'intitulé de l'aplat se lit « Filet de colin & purée de panais à la vanille », l'accompagnement en graisse moindre, et le tableau ne comporte pas de ligne d'accompagnement

#### Scenario: L'intitulé se lit à voix haute
- **WHEN** un lecteur d'écran lit l'intitulé d'un plat servi avec un accompagnement
- **THEN** il relie les deux noms par « avec »

#### Scenario: Plat principal inclassable
- **WHEN** le plat principal n'appartient à aucune famille reconnue
- **THEN** il est présenté sur une surface claire cerclée d'un filet d'encre, sans couleur ni nom de famille, et reste désigné comme le plat principal

### Requirement: Les autres rôles en lignes

Les rôles du déjeuner autres que le plat principal et l'accompagnement SHALL être présentés par des lignes alignées sur une même grille, le libellé du rôle dans une colonne qui précède le nom du plat. Ces lignes NE SHALL PAS être présentées comme des cartes. Le libellé d'un rôle NE SHALL PAS être composé au-dessus du nom de son plat. Chaque ligne SHALL porter, lorsqu'ils existent, les mentions de qualité et le signalement d'allergène, et aucun texte descriptif.

#### Scenario: Les autres rôles restent en encre
- **WHEN** l'écran du jour affiche une salade grecque en entrée
- **THEN** sa ligne ne porte aucune couleur de famille ni de rôle, et son rôle se lit dans la colonne qui précède le nom du plat

#### Scenario: Pas de surtitre
- **WHEN** l'écran du jour est affiché
- **THEN** aucun libellé de rôle n'est composé au-dessus du nom de son plat

#### Scenario: Mentions d'une ligne
- **WHEN** l'entrée du jour est bio et déclare du céleri
- **THEN** sa ligne porte le pictogramme Bio et nomme le céleri, sans autre texte

### Requirement: Écran Semaine

Le système SHALL présenter les cinq jours ouvrés de la semaine du jour affiché, sous une forme compacte permettant une lecture d'ensemble. Chaque jour SHALL être actionnable pour ouvrir le détail correspondant sur l'écran Aujourd'hui.

Le titre de chaque jour servi SHALL être l'intitulé de son plat principal, composé comme sur l'écran du jour, accompagnement compris. Le résumé qui le suit NE SHALL PAS redire l'accompagnement.

Chaque jour servi SHALL porter la couleur de la famille de son plat principal, la même que sur l'écran du jour, et le nom de cette famille écrit. La couleur NE SHALL PAS être le seul support de la famille. Un plat principal inclassable NE SHALL PAS porter de couleur de famille ni de nom de famille ; sa présentation SHALL se distinguer à la fois d'un jour servi d'une famille reconnue et d'un jour sans service.

#### Scenario: Consultation de la semaine
- **WHEN** l'utilisateur ouvre l'écran Semaine
- **THEN** les cinq jours ouvrés sont visibles avec au minimum le plat principal de chacun

#### Scenario: Le plat et son accompagnement sur la semaine
- **WHEN** la semaine contient un jour servant du filet de colin avec une purée de panais
- **THEN** le titre de ce jour réunit les deux noms comme sur l'écran du jour, et le résumé qui suit ne nomme pas la purée

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

#### Scenario: Plat principal inclassable sur la semaine
- **WHEN** le plat principal d'un jour servi n'appartient à aucune famille reconnue
- **THEN** ce jour ne porte aucune couleur de famille ni aucun nom de famille, et ne se confond ni avec un jour d'une famille reconnue ni avec un jour sans service

#### Scenario: Mouvement réduit
- **WHEN** l'utilisateur a demandé la réduction des animations et relève le doigt après un geste abouti
- **THEN** le jour voisin est présenté sans glissement
