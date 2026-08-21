## ADDED Requirements

### Requirement: Portée de l'illustration à l'écran

Le système NE SHALL PAS afficher d'illustration sur un plat dont le rôle rend cette illustration constante d'un jour à l'autre. Une illustration affichée SHALL distinguer le jour affiché des autres jours.

Sur l'écran Aujourd'hui, l'illustration SHALL être réservée au plat principal du déjeuner et au goûter. Les autres rôles SHALL être identifiés par leur libellé seul.

Deux éléments d'un même écran NE SHALL PAS porter la même illustration.

Cette portée SHALL être une règle explicite et non un effet de la mise en page, afin qu'un composant nouveau ne repose pas d'illustration partout par analogie.

#### Scenario: Rôle à illustration constante
- **WHEN** l'écran du jour affiche le pain, dont l'illustration serait la même tous les jours
- **THEN** aucune illustration n'accompagne le pain, qui reste identifié par son libellé

#### Scenario: Deux rôles de même famille le même jour
- **WHEN** l'entrée et l'accompagnement d'un même jour relèvent tous deux de la famille des légumes
- **THEN** l'écran ne présente pas deux fois la même illustration

#### Scenario: L'illustration marque le rang
- **WHEN** l'écran du jour est affiché
- **THEN** la présence d'une illustration au sein du déjeuner désigne le plat principal, et lui seul

#### Scenario: Le goûter reste illustré
- **WHEN** un jour comporte un goûter dont le détail est publié
- **THEN** celui-ci porte l'illustration déduite de son libellé

## MODIFIED Requirements

### Requirement: Rôle décoratif de l'illustration

Les illustrations SHALL être traitées comme décoratives par les technologies d'assistance : elles NE SHALL PAS porter d'information absente du texte, et leur absence NE SHALL PAS empêcher la compréhension du menu.

Le retrait d'une illustration d'un élément NE SHALL PAS retirer d'information de l'écran : le libellé et le rôle SHALL suffire à identifier tout plat.

#### Scenario: Restitution par un lecteur d'écran
- **WHEN** un écran de menu est parcouru par un lecteur d'écran
- **THEN** les illustrations ne sont pas annoncées et le menu reste intégralement compréhensible

#### Scenario: Illustrations non rendues
- **WHEN** les illustrations ne sont pas rendues
- **THEN** chaque plat reste identifiable par son libellé et son rôle

#### Scenario: Rôle privé d'illustration
- **WHEN** un rôle cesse d'être illustré
- **THEN** aucune information disponible auparavant ne disparaît de l'écran
