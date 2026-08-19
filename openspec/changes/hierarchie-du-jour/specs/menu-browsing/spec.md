## MODIFIED Requirements

### Requirement: Grille compartimentée de l'écran Aujourd'hui

Les plats SHALL être disposés en compartiments dont la taille encode le rôle : le plat principal SHALL occuper le compartiment le plus large, et SHALL porter la couleur de sa famille.

Lorsqu'un rôle est absent du jour affiché, son compartiment SHALL rester en place et indiquer explicitement l'absence. La grille NE SHALL PAS se refermer, afin qu'un rôle absent reste distinguable d'une donnée manquante.

Lorsque le libellé d'un plat n'ajoute rien à son libellé de rôle, le compartiment SHALL nommer à sa place ce qui distingue ce plat des autres jours — sa qualité lorsqu'elle est renseignée. Il NE SHALL PAS énoncer deux fois le même mot.

Lorsqu'un tel libellé n'a aucune qualité à promouvoir, le compartiment SHALL signaler que le détail n'est pas publié. Il NE SHALL PAS laisser entendre que le plat n'est pas servi, lorsque d'autres informations sur ce plat — ses allergènes notamment — sont connues.

Le goûter SHALL être présenté hors de la grille, comme un objet distinct portant le poids visuel d'un compartiment, et séparé du plateau de telle sorte qu'il ne se lise pas comme une partie du déjeuner.

#### Scenario: Jour complet
- **WHEN** un jour comporte tous ses rôles
- **THEN** le plat principal occupe le compartiment le plus large et porte la couleur de sa famille

#### Scenario: Rôle absent
- **WHEN** un jour ne comporte pas d'entrée
- **THEN** le compartiment de l'entrée reste affiché avec la mention explicite qu'il n'y en a pas ce jour

#### Scenario: Plat principal de famille inconnue
- **WHEN** la famille du plat principal ne peut pas être déduite
- **THEN** le compartiment prend la couleur de repli neutre et reste lisible

#### Scenario: Libellé qui répète le rôle, qualité connue
- **WHEN** le pain du jour porte le libellé « Pain » et l'indicateur de qualité « Label Rouge »
- **THEN** le compartiment annonce le pain par sa qualité, et le mot « pain » n'apparaît qu'une fois

#### Scenario: Libellé qui répète le rôle, aucune qualité
- **WHEN** le goûter du jour porte le libellé « Goûter » et aucun indicateur de qualité
- **THEN** l'affichage signale que le détail n'est pas publié, sans répéter le mot « goûter » ni laisser croire qu'aucun goûter n'est servi

#### Scenario: Libellé porteur d'information
- **WHEN** le pain du jour porte le libellé « Pain du mois »
- **THEN** ce libellé est affiché tel quel, puisqu'il dit ce que le rôle ne dit pas

#### Scenario: Poids visuel du goûter
- **WHEN** un jour comporte un goûter détaillé
- **THEN** celui-ci est présenté avec le poids visuel d'un compartiment, hors du plateau, et une rupture visible le sépare du déjeuner

### Requirement: Navigation entre jours

Le système SHALL permettre de passer au jour servi précédent ou suivant. La navigation SHALL être possible au clavier et par une commande visible, et MAY être doublée d'un geste de balayage horizontal.

Le passage d'un jour à l'autre SHALL être perçu comme immédiat : le menu du jour atteint SHALL être présent, lisible et actionnable dès la première image, sans être retenu par une animation.

Lorsqu'une transition accompagne le changement de jour, elle SHALL être décorative et gouverner l'écran entier sous une seule et même durée. Les éléments qui énoncent le jour affiché NE SHALL PAS changer selon un temps différent de celui du contenu qu'ils annoncent.

#### Scenario: Passage au jour suivant
- **WHEN** l'utilisateur demande le jour suivant depuis un vendredi
- **THEN** le lundi servi suivant est affiché, les jours non servis étant sautés

#### Scenario: Navigation au clavier
- **WHEN** l'utilisateur navigue au clavier uniquement
- **THEN** il peut atteindre et actionner les commandes de jour précédent et suivant, avec un indicateur de focus visible

#### Scenario: Limite du jeu de données
- **WHEN** l'utilisateur demande un jour au-delà des données disponibles
- **THEN** l'application le signale explicitement plutôt que d'afficher un écran vide

#### Scenario: Une seule horloge
- **WHEN** l'utilisateur change de jour et qu'une transition accompagne le changement
- **THEN** l'en-tête qui énonce la date et le contenu du jour changent sous la même durée, et non l'un avant l'autre

#### Scenario: Le contenu n'attend pas l'animation
- **WHEN** une transition est en cours après un changement de jour
- **THEN** le menu du jour atteint est déjà présent dans le document et actionnable
