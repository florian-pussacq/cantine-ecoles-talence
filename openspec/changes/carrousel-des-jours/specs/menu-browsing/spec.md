## ADDED Requirements

### Requirement: Le geste suit le doigt

Sur l'écran du jour comme sur l'écran de la semaine, le balayage horizontal SHALL déplacer le contenu avec le doigt pendant le geste, et SHALL faire apparaître sur le bord le jour, ou la semaine, voisin. Au relâchement, le système SHALL passer au voisin si la course ou la vitesse du geste le désignent, et SHALL sinon ramener le contenu en place. Là où il n'y a pas de voisin, le contenu SHALL résister puis revenir.

#### Scenario: Le contenu suit le doigt
- **WHEN** l'utilisateur glisse le doigt horizontalement sur le contenu du jour, sans le relever
- **THEN** le contenu se déplace avec le doigt et le jour voisin paraît sur le bord

#### Scenario: Un geste vif et court
- **WHEN** l'utilisateur balaie vivement, sur une course courte
- **THEN** le jour voisin est présenté

#### Scenario: Un geste hésitant
- **WHEN** l'utilisateur glisse lentement sur une faible distance puis relève le doigt
- **THEN** le jour présenté reste le même, et le contenu revient en place

#### Scenario: Le bord du corpus
- **WHEN** l'utilisateur balaie vers un jour qui n'existe pas dans les données
- **THEN** le contenu résiste puis revient, et le jour présenté ne change pas

#### Scenario: La semaine se balaie aussi
- **WHEN** l'utilisateur balaie l'écran de la semaine
- **THEN** la semaine suit le doigt, et la semaine voisine est présentée si le geste aboutit

### Requirement: Un seul mouvement de jour à jour

Les commandes visibles et le clavier SHALL produire le même mouvement qu'un geste abouti. Hors du geste, le document SHALL ne présenter que le jour, ou la semaine, affiché. Lorsque la réduction des animations est demandée, le contenu SHALL suivre le doigt pendant le geste, et aucun mouvement NE SHALL suivre le relâchement ni une commande.

#### Scenario: Le même mouvement aux flèches
- **WHEN** l'utilisateur actionne la commande du jour suivant
- **THEN** le jour suivant glisse en place comme après un balayage abouti

#### Scenario: Un seul jour au repos
- **WHEN** aucun geste n'est en cours
- **THEN** le document ne contient que le jour affiché, sans ses voisins

#### Scenario: Mouvement réduit
- **WHEN** l'utilisateur a demandé la réduction des animations et relève le doigt après un geste abouti
- **THEN** le jour voisin est présenté sans glissement
