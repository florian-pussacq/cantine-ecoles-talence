## ADDED Requirements

### Requirement: Visibilité du filtre actif

Lorsqu'au moins un allergène est sélectionné, le système SHALL l'indiquer en permanence sur les écrans de consultation, indépendamment de la présence d'un plat concerné ce jour-là. L'indication SHALL énoncer le nombre d'allergènes surveillés.

Cette indication SHALL être portée par la commande qui mène au réglage, de sorte que voir l'état et aller le corriger soient le même geste.

Le nombre SHALL être restitué aux technologies d'assistance par le nom accessible de cette commande, et NE SHALL PAS reposer sur la seule présence d'une marque visuelle.

Lorsque la sélection est vide, aucune indication NE SHALL être affichée — ni marque, ni compte nul, ni invitation à configurer un filtre.

L'espace occupé par cette indication SHALL être réservé dans la mise en page indépendamment de l'état de la sélection, de sorte que sa lecture depuis le stockage local ne déplace aucun contenu.

#### Scenario: Filtre actif un jour sans plat concerné
- **WHEN** trois allergènes sont surveillés et qu'aucun plat du jour affiché n'en contient
- **THEN** l'écran indique néanmoins que trois allergènes sont surveillés

#### Scenario: Restitution du compte
- **WHEN** un lecteur d'écran atteint la commande qui mène au réglage des allergènes
- **THEN** il annonce ce que la commande ouvre et le nombre d'allergènes surveillés

#### Scenario: Sélection vide
- **WHEN** aucun allergène n'est sélectionné
- **THEN** aucune marque ni aucun compte n'est affiché sur la commande, et aucune invitation à en configurer un n'est présentée

#### Scenario: Aucun déplacement à l'hydratation
- **WHEN** l'application s'ouvre et lit une sélection non vide depuis le stockage local
- **THEN** l'indication apparaît sans déplacer aucun élément de l'écran

#### Scenario: Correction depuis l'indication
- **WHEN** l'utilisateur actionne la commande portant l'indication
- **THEN** il atteint l'écran de réglage des allergènes
