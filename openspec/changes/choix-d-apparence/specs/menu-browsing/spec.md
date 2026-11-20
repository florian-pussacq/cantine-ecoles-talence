## MODIFIED Requirements

### Requirement: Accessibilité des écrans de consultation

Les écrans de consultation SHALL respecter le niveau WCAG 2.1 AA : contraste de texte d'au moins 4.5:1, contraste d'au moins 3:1 pour les éléments d'interface non textuels qui portent une information ou délimitent une commande, cibles tactiles d'au moins 44 pixels, navigation clavier complète avec focus visible, et langue du document déclarée à `fr`.

Le système SHALL respecter `prefers-reduced-motion`.

Le système SHALL offrir, dans l'écran des réglages, un choix d'apparence en trois positions : comme l'appareil, clair, sombre. Par défaut, et tant que l'utilisateur n'a rien choisi, il SHALL suivre la préférence d'apparence du système, claire ou sombre. Le choix SHALL être conservé dans le navigateur et SHALL s'appliquer dès la première peinture, sans dépendre du JavaScript de l'application. Chacune des deux palettes SHALL satisfaire les seuils de contraste de cette exigence.

Les rapports de contraste SHALL être vérifiés sur les couleurs telles qu'elles sont peintes, y compris lorsqu'une surface est obtenue par mélange à l'opacité ou par transparence partielle.

Les jetons de couleur SHALL être partitionnés entre encres et surfaces. Un jeton de surface NE SHALL PAS être employé comme couleur de texte, et cette interdiction SHALL être vérifiée sur l'ensemble des composants.

Lorsqu'une inversion l'exige — un texte peint dans une couleur de surface sur un fond d'encre —, elle SHALL être déclarée avec la surface sur laquelle elle se pose, et son rapport de contraste SHALL être mesuré comme celui de toute autre paire. Une inversion NE SHALL PAS être exemptée de mesure.

Lorsqu'un texte partage sa ligne avec une commande dont la cible tactile impose une hauteur supérieure à la sienne, les deux SHALL être alignés sur cette hauteur.

#### Scenario: Mouvement réduit demandé
- **WHEN** l'utilisateur a activé la réduction des animations dans son système
- **THEN** les transitions entre jours sont supprimées, la navigation restant fonctionnelle

#### Scenario: Préférence système d'apparence
- **WHEN** le système de l'utilisateur est en thème sombre
- **THEN** l'application présente sa palette sombre dès la première peinture, sans réglage à faire dans l'application

#### Scenario: Apparence choisie dans l'application
- **WHEN** le système de l'utilisateur est en thème clair et qu'il a choisi « Sombre » dans les réglages
- **THEN** l'application présente sa palette sombre, y compris dès la première peinture des ouvertures suivantes

#### Scenario: Retour au défaut
- **WHEN** l'utilisateur choisit « Comme l'appareil » après avoir imposé une apparence
- **THEN** l'application suit de nouveau la préférence du système, et ses changements

#### Scenario: Surface obtenue par opacité
- **WHEN** un texte ou une bordure est peint par mélange à l'opacité sur le fond de page
- **THEN** le rapport de contraste de la couleur résultante est mesuré et satisfait le seuil applicable à cet élément

#### Scenario: Surface employée comme encre
- **WHEN** un composant déclare comme couleur de texte un jeton désignant une surface
- **THEN** le contrôle échoue en nommant le composant et le jeton

#### Scenario: Inversion déclarée
- **WHEN** un texte est peint dans une couleur de surface sur un fond d'encre et que cette inversion est déclarée
- **THEN** le contrôle l'accepte pour ce composant et mesure le rapport de contraste de la paire déclarée

#### Scenario: Alignement d'un texte et d'une cible tactile
- **WHEN** une ligne porte un texte et un lien dont la cible tactile mesure 44 pixels
- **THEN** les deux sont centrés sur la même hauteur, et non l'un en haut et l'autre au milieu
