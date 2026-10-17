## RENAMED Requirements

- FROM: `### Requirement: Détail des allergènes d'un plat`
- TO: `### Requirement: Détail des allergènes de la journée`

## MODIFIED Requirements

### Requirement: Détail des allergènes de la journée

Le système SHALL permettre de consulter, en une seule ouverture, la liste des plats de la journée affichée — goûter compris — accompagnés chacun de ses allergènes exprimés en libellés clairs issus de la légende du mois, que ceux-ci figurent ou non dans la sélection.

Le système NE SHALL PAS exiger une ouverture par plat pour obtenir cette liste.

L'ordre des plats dans cette liste SHALL être celui de l'écran du jour, afin que la lecture de l'écran et celle du détail se correspondent.

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

### Requirement: Mise en évidence des allergènes sélectionnés

Lorsqu'au moins un allergène est sélectionné, le système SHALL signaler les plats qui en contiennent, sur l'écran Aujourd'hui comme sur l'écran Semaine, en nommant le ou les allergènes concernés en toutes lettres.

Sur l'écran Aujourd'hui, le signalement SHALL désigner le plat concerné et non la seule journée : savoir quel plat porte l'allergène relève de la lecture de l'écran, et NE SHALL PAS exiger l'ouverture du détail.

Le signalement NE SHALL JAMAIS reposer sur la seule couleur : il SHALL être doublé d'un libellé textuel et d'une marque perceptible sans distinction chromatique.

#### Scenario: Plat contenant un allergène sélectionné
- **WHEN** un plat contient un allergène de la sélection
- **THEN** il est signalé visuellement et le ou les allergènes concernés sont nommés en clair

#### Scenario: Signalement au niveau du plat
- **WHEN** un seul plat du jour contient un allergène de la sélection
- **THEN** le signalement apparaît sur l'entrée de ce plat, et non sur l'ensemble du menu

#### Scenario: Signalement sans dépendance à la couleur
- **WHEN** un plat concerné est affiché
- **THEN** son signalement reste perceptible en niveaux de gris et est restitué par un lecteur d'écran

#### Scenario: Aucun allergène sélectionné
- **WHEN** la sélection est vide
- **THEN** les menus sont affichés sans signalement, sans invitation insistante à en configurer un
