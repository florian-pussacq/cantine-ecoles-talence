## ADDED Requirements

### Requirement: Écran de consultation du menu de grève

Le système SHALL offrir un écran dédié présentant le menu de grève : les cinq jours de semaine, pour la variante choisie parmi repas chauds et repas froids.

Cet écran SHALL énoncer que l'application ne sait pas s'il y a grève, et que le menu présenté est un repli que la Ville sert selon la possibilité. Il SHALL donner accès au PDF officiel de grève et à sa date de mise à jour.

#### Scenario: Consultation des deux variantes
- **WHEN** l'utilisateur bascule de la variante chaude à la variante froide
- **THEN** les plats affichés pour les cinq jours changent en conséquence, sans quitter l'écran

#### Scenario: Consultation hors ligne
- **WHEN** l'utilisateur ouvre l'écran du menu de grève sans réseau
- **THEN** le menu reste consultable

### Requirement: Le menu de grève reste hors des écrans quotidiens

L'écran du menu de grève NE SHALL PAS figurer parmi les onglets de navigation, et aucun lien NE SHALL y mener depuis l'écran du jour ni depuis celui de la semaine.

Il SHALL être atteignable depuis l'écran des réglages.

#### Scenario: Navigation quotidienne
- **WHEN** l'utilisateur consulte l'écran du jour ou celui de la semaine
- **THEN** aucun onglet ni aucun lien ne mène au menu de grève

#### Scenario: Accès délibéré
- **WHEN** l'utilisateur ouvre les réglages et actionne le lien du menu de grève
- **THEN** l'écran du menu de grève s'affiche

### Requirement: Les réglages regroupent plusieurs sujets

L'écran des réglages SHALL porter un titre couvrant l'ensemble des sujets qu'il regroupe, et SHALL distinguer chaque sujet par un intitulé de section.

La commande menant aux réglages SHALL continuer d'annoncer le nombre d'allergènes surveillés dans son nom accessible.

#### Scenario: Nom accessible de la commande
- **WHEN** trois allergènes sont surveillés
- **THEN** la commande menant aux réglages annonce les réglages et le nombre d'allergènes surveillés
