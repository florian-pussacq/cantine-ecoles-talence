## MODIFIED Requirements

### Requirement: Détail des allergènes de la journée

Le système SHALL permettre de consulter, en une seule ouverture, la liste des plats de la journée affichée — goûter compris — accompagnés chacun de ses allergènes exprimés en libellés clairs issus de la légende du mois, que ceux-ci figurent ou non dans la sélection.

Le système NE SHALL PAS exiger une ouverture par plat pour obtenir cette liste.

L'ordre des plats dans cette liste SHALL être celui de l'écran du jour, afin que la lecture de l'écran et celle du détail se correspondent.

Lorsqu'au moins un allergène est sélectionné, le détail SHALL s'ouvrir sur un résumé qui énonce, pour chaque allergène sélectionné, les plats de la journée qui le déclarent, ou qu'aucun plat ne le déclare. Dans la liste des plats, les allergènes sélectionnés SHALL précéder les autres et porter une marque perceptible sans distinction chromatique et restituée par un lecteur d'écran ; les autres allergènes SHALL rester lisibles.

Le résumé NE SHALL PAS présenter l'absence de déclaration comme l'absence de l'allergène.

Lorsque la sélection est vide, le détail NE SHALL comporter ni résumé ni invitation à configurer un filtre.

#### Scenario: Consultation du détail
- **WHEN** l'utilisateur actionne le menu du jour
- **THEN** tous les plats de la journée sont affichés, chacun avec ses allergènes en libellés clairs

#### Scenario: Plat sans allergène déclaré
- **WHEN** un plat de la journée ne déclare aucun allergène
- **THEN** l'application indique pour ce plat l'absence d'allergène déclaré, sans laisser entendre qu'elle garantit son absence

#### Scenario: Rôle absent de la journée
- **WHEN** un rôle n'est pas servi ce jour-là
- **THEN** il n'apparaît pas dans le détail, l'absence étant déjà énoncée sur l'écran du jour

#### Scenario: Correspondance des ordres
- **WHEN** l'utilisateur ouvre le détail depuis l'écran du jour
- **THEN** les plats y figurent dans le même ordre que sur l'écran du jour

#### Scenario: Résumé de la sélection
- **WHEN** le gluten et le lait sont surveillés, que le clafoutis déclare les deux et la salade grecque le lait seul
- **THEN** le détail s'ouvre sur un résumé qui associe le gluten au clafoutis, et le lait à la salade grecque et au clafoutis

#### Scenario: Allergène surveillé qu'aucun plat ne déclare
- **WHEN** l'arachide est surveillée et qu'aucun plat du jour ne la déclare
- **THEN** le résumé indique qu'aucun plat ne la déclare, sans affirmer que la journée en est exempte

#### Scenario: Allergènes surveillés en tête et marqués
- **WHEN** un plat déclare les œufs, le gluten et le lait, et que le gluten et le lait sont surveillés
- **THEN** le gluten et le lait figurent avant les œufs, marqués comme surveillés par un texte que restitue un lecteur d'écran, et la marque reste perceptible en niveaux de gris

#### Scenario: Sélection vide
- **WHEN** aucun allergène n'est surveillé et que l'utilisateur ouvre le détail
- **THEN** aucun résumé ni aucune invitation n'est affiché, et les allergènes sont présentés au même poids

#### Scenario: Jour sans allergènes précisés, filtre actif
- **WHEN** le lait est surveillé et que le document du jour ne précise pas les allergènes
- **THEN** le résumé est remplacé par un avertissement qui nomme le lait comme impossible à vérifier pour ce jour et renvoie au document officiel
