## MODIFIED Requirements

### Requirement: Cartes du jour

L'écran du jour SHALL présenter le déjeuner comme une suite de cartes de même forme, une par
rôle du déjeuner et jamais moins, dans l'ordre du service. Un rôle absent SHALL produire une
carte énonçant son absence, afin qu'un creux reste distinguable d'une donnée manquante.

Aucune carte NE SHALL être actionnable : la cible est la journée entière, portée par l'élément
qui contient la suite.

Chaque carte SHALL porter le libellé de son rôle, le nom du plat, et — lorsqu'ils existent — les
mentions de qualité et le signalement d'allergène. Elle NE SHALL PAS porter de texte descriptif :
les données n'en comportent pas.

La couleur SHALL désigner la famille du plat principal, et elle seule : la carte du plat
principal SHALL porter la couleur de sa famille, la même que sur l'écran de la semaine, et le nom
de cette famille écrit. Les autres cartes NE SHALL PAS porter de couleur de rôle ni de famille.
Un plat principal dont la famille n'est pas reconnue SHALL porter la couleur de repli neutre, sans
nom de famille.

La première carte SHALL être entièrement visible sans défilement, sur la plus petite fenêtre
prise en charge. Les cartes suivantes MAY demander un défilement.

#### Scenario: Un rôle par carte
- **WHEN** l'écran du jour affiche un jour servi
- **THEN** chaque rôle du déjeuner est présent, dans l'ordre du service, y compris ceux dont aucun plat n'est publié

#### Scenario: Rôle absent
- **WHEN** un jour ne comporte pas d'entrée
- **THEN** une carte énonce l'absence d'entrée, et ne se confond pas avec une carte portant un plat

#### Scenario: Aucune carte n'est actionnable
- **WHEN** l'écran du jour est parcouru au clavier
- **THEN** aucune carte ne reçoit le focus, et l'ouverture du détail se fait par la cible qui porte la journée

#### Scenario: La première carte est visible d'emblée
- **WHEN** l'écran du jour est affiché sur la plus petite fenêtre prise en charge
- **THEN** la première carte est entièrement visible sans défiler

#### Scenario: Le plat principal porte sa famille
- **WHEN** l'écran du jour affiche un rôti de bœuf en plat principal
- **THEN** sa carte porte la couleur de la famille viande et le mot « Viande », la même couleur que son disque sur l'écran de la semaine

#### Scenario: Les autres cartes restent en encre
- **WHEN** l'écran du jour affiche une salade grecque en entrée
- **THEN** sa carte ne porte aucune couleur de famille ni de rôle

#### Scenario: Plat principal inclassable
- **WHEN** le plat principal n'appartient à aucune famille reconnue
- **THEN** sa carte porte la couleur de repli neutre et aucun nom de famille
