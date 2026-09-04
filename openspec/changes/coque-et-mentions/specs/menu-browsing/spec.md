## MODIFIED Requirements

### Requirement: En-tête d'écran

Chaque écran SHALL porter exactement un titre de premier niveau, qui SHALL nommer ce que l'écran montre.

Sur les écrans de consultation d'un menu, ce titre SHALL être la période affichée — le jour sur l'écran du jour, l'intervalle sur l'écran de la semaine. Ces écrans NE SHALL PAS porter de titre constant nommant l'application, ni de formule de politesse.

Sur les écrans secondaires, ce titre SHALL nommer l'écran.

Les écrans de consultation d'un menu SHALL accompagner ce titre d'une mention qui situe la période affichée par rapport au jour courant.

Tant que la période affichée est celle que le système a choisie, cette mention SHALL énoncer la raison de ce choix. Dès que l'utilisateur a demandé une autre période, elle SHALL énoncer la distance qui sépare la période affichée du jour courant, et NE SHALL PAS continuer d'énoncer une raison qui ne vaut plus.

Cette mention NE SHALL en aucun cas désigner comme le jour courant une période qui ne l'est pas.

#### Scenario: Un seul titre de premier niveau
- **WHEN** un écran de consultation est chargé
- **THEN** le document contient exactement un titre de premier niveau

#### Scenario: Le titre suit la période
- **WHEN** l'utilisateur passe au jour servi suivant
- **THEN** le titre de premier niveau énonce la nouvelle date, et le document en contient toujours exactement un

#### Scenario: La mention justifie le jour proposé
- **WHEN** l'utilisateur ouvre l'application un jour non servi et que le système affiche le prochain jour servi
- **THEN** la mention énonce qu'il s'agit du prochain service et à quelle distance il se trouve

#### Scenario: La mention suit le jour demandé
- **WHEN** l'utilisateur navigue jusqu'à un jour distant de plusieurs jours du jour courant
- **THEN** la mention énonce cette distance, et n'énonce ni « aujourd'hui » ni la raison du choix initial

#### Scenario: Navigation vers le passé
- **WHEN** l'utilisateur navigue vers un jour antérieur au jour courant
- **THEN** la mention le situe dans le passé

### Requirement: Accès aux écrans

Le système SHALL rendre atteignables depuis les écrans de consultation d'un menu, sans défiler ni ouvrir de menu, les deux destinations consultées quotidiennement — l'écran du jour et l'écran de la semaine.

Ce choix NE SHALL PAS mettre sur le même plan une vue de consultation et un réglage, et NE SHALL PAS être affiché sur un écran qu'il ne permet pas de choisir : rien de ce qu'il propose ne s'y consulte, et il n'en est donc pas une sortie.

L'en-tête de l'application SHALL réserver un emplacement unique, occupé sur tout écran par exactement une commande :

- sur les écrans de consultation d'un menu, la commande menant au réglage des allergènes ;
- sur tout autre écran, la commande de sortie de cet écran.

La commande de sortie SHALL nommer sa destination, et SHALL mener à l'écran depuis lequel son écran s'atteint.

Cet emplacement NE SHALL jamais rester vide, et sa hauteur SHALL être réservée de sorte que l'en-tête ne change pas de hauteur d'un écran à l'autre.

Les mentions SHALL rester atteignables depuis n'importe quel écran par le pied de page.

Le pied de page SHALL compenser la zone sûre inférieure de l'appareil, et le contenu de l'écran SHALL réserver sa hauteur augmentée de cette zone sûre, de sorte qu'aucun contenu ne reste inaccessible derrière lui. Cette réserve NE SHALL PAS être augmentée d'un intervalle qui la doublerait.

Sur un écran large, le pied de page SHALL rester borné à la colonne de contenu, conformément à l'exigence de lisibilité sur écran large.

#### Scenario: Destinations quotidiennes atteignables
- **WHEN** l'utilisateur consulte l'écran du jour ou celui de la semaine
- **THEN** l'autre est atteignable sans défiler ni ouvrir de menu

#### Scenario: Écran secondaire
- **WHEN** l'utilisateur consulte le réglage des allergènes, le menu de grève ou les mentions
- **THEN** le choix entre les deux écrans de menu n'est pas affiché, la commande menant aux réglages n'est pas affichée, et une commande d'en-tête nommée permet de sortir de l'écran

#### Scenario: Sortie vers l'écran d'origine
- **WHEN** l'utilisateur ouvre le menu de grève depuis le réglage des allergènes puis actionne la commande de sortie
- **THEN** il revient au réglage des allergènes

#### Scenario: L'en-tête ne change pas de hauteur
- **WHEN** l'utilisateur passe d'un écran de consultation à un écran secondaire
- **THEN** l'en-tête conserve la même hauteur, une commande ayant remplacé l'autre au même emplacement

#### Scenario: Zone sûre inférieure
- **WHEN** l'application est ouverte sur un appareil dont le bas de l'écran est occupé par un indicateur système
- **THEN** le pied de page reste atteignable et aucun contenu ne demeure caché derrière lui

#### Scenario: Pied de page sur écran large
- **WHEN** l'application est ouverte sur un écran de bureau
- **THEN** le pied de page reste borné à la largeur de la colonne de contenu et ne s'étire pas sur toute la fenêtre

### Requirement: Accessibilité des écrans de consultation

Les écrans de consultation SHALL respecter le niveau WCAG 2.1 AA : contraste de texte d'au moins 4.5:1, contraste d'au moins 3:1 pour les éléments d'interface non textuels qui portent une information ou délimitent une commande, cibles tactiles d'au moins 44 pixels, navigation clavier complète avec focus visible, et langue du document déclarée à `fr`.

Le système SHALL respecter `prefers-reduced-motion`.

Le système SHALL présenter une apparence unique. Il NE SHALL PAS offrir de choix d'apparence, ni faire dépendre son apparence d'une préférence extérieure à l'application.

Les rapports de contraste SHALL être vérifiés sur les couleurs telles qu'elles sont peintes, y compris lorsqu'une surface est obtenue par mélange à l'opacité ou par transparence partielle.

Les jetons de couleur SHALL être partitionnés entre encres et surfaces. Un jeton de surface NE SHALL PAS être employé comme couleur de texte, et cette interdiction SHALL être vérifiée sur l'ensemble des composants.

Lorsqu'une inversion l'exige — un texte peint dans une couleur de surface sur un fond d'encre —, elle SHALL être déclarée avec la surface sur laquelle elle se pose, et son rapport de contraste SHALL être mesuré comme celui de toute autre paire. Une inversion NE SHALL PAS être exemptée de mesure.

Lorsqu'un texte partage sa ligne avec une commande dont la cible tactile impose une hauteur supérieure à la sienne, les deux SHALL être alignés sur cette hauteur.

#### Scenario: Mouvement réduit demandé
- **WHEN** l'utilisateur a activé la réduction des animations dans son système
- **THEN** les transitions entre jours sont supprimées, la navigation restant fonctionnelle

#### Scenario: Préférence système d'apparence
- **WHEN** le système de l'utilisateur est en thème sombre
- **THEN** l'application présente la même apparence que sur un système en thème clair

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
