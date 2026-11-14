## ADDED Requirements

### Requirement: Bio et Label Rouge se signalent par un pictogramme

Les mentions de qualité Bio et Label Rouge SHALL être signalées par un pictogramme propre à l'application, et non par un logo officiel. Les autres mentions de qualité SHALL rester écrites en toutes lettres. La règle SHALL valoir sur l'écran Aujourd'hui, pour le plat principal comme pour les lignes du tableau, et sur l'écran Semaine.

Chaque pictogramme SHALL être posé sur une pastille qui le détache de la surface qui le porte, et le dessin SHALL tenir un contraste d'au moins 3:1 avec sa pastille, dans les deux palettes.

#### Scenario: Une entrée bio
- **WHEN** l'écran du jour affiche une salade de crudités bio en entrée
- **THEN** sa ligne porte le pictogramme Bio et non le mot « Bio » sous son nom

#### Scenario: Une mention sans pictogramme
- **WHEN** un plat porte la mention Viande française
- **THEN** cette mention est écrite en toutes lettres

#### Scenario: Lisible sur toutes les familles
- **WHEN** un plat principal végétarien est bio
- **THEN** son pictogramme reste distinct de l'aplat végétarien, dans l'apparence claire comme dans l'apparence sombre

### Requirement: Le pictogramme suit le nom qu'il qualifie

Un pictogramme de qualité SHALL être placé immédiatement après le nom du plat qu'il qualifie, et NE SHALL PAS en être séparé par un retour à la ligne. Lorsqu'un intitulé réunit plusieurs plats, chaque pictogramme SHALL suivre le nom de son propre plat, de sorte qu'on lise lequel est qualifié.

#### Scenario: Seul l'accompagnement est bio
- **WHEN** le jour sert un filet de colin avec une purée de panais bio
- **THEN** le pictogramme Bio suit « purée de panais à la vanille », et aucun ne suit « Filet de colin »

#### Scenario: Le plat et l'accompagnement sont bio
- **WHEN** le jour sert un rôti de bœuf bio avec une poêlée de légumes bio
- **THEN** un pictogramme Bio suit chacun des deux noms

#### Scenario: Pas de pictogramme orphelin
- **WHEN** l'intitulé passe à la ligne sur un écran étroit
- **THEN** le pictogramme reste sur la même ligne que le dernier mot du nom qu'il qualifie

### Requirement: Le pictogramme a un nom

Chaque pictogramme de qualité SHALL être restitué par les technologies d'assistance sous le nom de sa mention (« Bio », « Label Rouge »). Il NE SHALL PAS être traité comme une illustration décorative.

#### Scenario: Lecture à l'écran
- **WHEN** un lecteur d'écran lit l'intitulé d'un plat bio
- **THEN** il énonce le nom du plat suivi de « Bio »

### Requirement: Les pictogrammes ont une légende

L'écran À propos SHALL présenter chaque pictogramme de qualité avec le nom de sa mention. La couche de détail de la journée SHALL écrire chaque mention en toutes lettres à côté de son pictogramme.

Lorsque le nom d'un plat est la qualité elle-même, parce que son libellé ne fait que répéter son rôle, le système SHALL afficher le pictogramme suivi du nom de la mention, et non le pictogramme seul.

#### Scenario: La légende de l'écran À propos
- **WHEN** l'utilisateur ouvre l'écran À propos
- **THEN** il y trouve le pictogramme Bio et le pictogramme Label Rouge, chacun avec son nom

#### Scenario: La fiche nomme la mention
- **WHEN** l'utilisateur ouvre le détail d'un jour dont l'accompagnement est bio
- **THEN** la ligne de l'accompagnement porte le pictogramme Bio et le mot « Bio »

#### Scenario: Le pain Label Rouge
- **WHEN** l'écran du jour affiche un pain dont le libellé est « Pain » et qui porte la mention Label Rouge
- **THEN** sa ligne porte le pictogramme Label Rouge suivi des mots « Label Rouge »
