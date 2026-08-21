## ADDED Requirements

### Requirement: Accès aux écrans

Le système SHALL rendre atteignables en permanence, depuis n'importe quel écran, les destinations consultées quotidiennement — l'écran du jour et l'écran de la semaine — au moyen d'une barre ancrée au bas de la fenêtre, à portée du pouce sur un téléphone tenu d'une main.

Cette barre NE SHALL PAS mettre sur le même plan une vue de consultation et un réglage. Elle NE SHALL contenir que des destinations consultées quotidiennement.

Les écrans que l'on consulte une fois — le réglage des allergènes, les mentions — SHALL être atteignables autrement : par une commande d'en-tête pour le premier, par le pied de page pour le second.

Lorsque l'écran courant ne figure pas dans la barre, celle-ci SHALL rester affichée sans marque d'écran courant, et SHALL suffire à en sortir.

La barre SHALL compenser la zone sûre inférieure de l'appareil, de sorte qu'aucune de ses commandes ne soit recouverte par un indicateur système. Le contenu de l'écran SHALL réserver la hauteur de la barre augmentée de cette zone sûre, de sorte qu'aucun contenu ne reste inaccessible derrière elle.

Sur un écran large, la barre SHALL rester bornée à la colonne de contenu, conformément à l'exigence de lisibilité sur écran large.

#### Scenario: Destinations quotidiennes atteignables partout
- **WHEN** l'utilisateur se trouve sur un écran quelconque de l'application
- **THEN** l'écran du jour et l'écran de la semaine sont atteignables sans défiler ni ouvrir de menu

#### Scenario: Écran hors de la barre
- **WHEN** l'utilisateur consulte le réglage des allergènes ou les mentions
- **THEN** la barre reste affichée, aucun de ses segments n'est marqué comme courant, et elle permet de rejoindre l'écran du jour ou celui de la semaine

#### Scenario: Zone sûre inférieure
- **WHEN** l'application est ouverte sur un appareil dont le bas de l'écran est occupé par un indicateur système
- **THEN** aucune commande de la barre ne se trouve sous cet indicateur, et le pied de page reste atteignable

#### Scenario: Barre sur écran large
- **WHEN** l'application est ouverte sur un écran de bureau
- **THEN** la barre reste bornée à la largeur de la colonne de contenu et ne s'étire pas sur toute la fenêtre

#### Scenario: Aucun réglage dans la barre
- **WHEN** la barre est affichée
- **THEN** elle ne contient que des destinations de consultation, à l'exclusion de tout écran de réglage
