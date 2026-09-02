## REMOVED Requirements

### Requirement: Ardoise du jour

**Raison :** l'ardoise en deux colonnes, avec un unique plat mis en vedette par un aplat de
famille, est remplacée par une liste de cartes de forme égale (D50). Elle est introduite par le
change `enseigne-et-ardoise`, qui n'est pas encore archivé : cette suppression ne s'applique
donc qu'après l'intégration de ce dernier à la ligne de base.

**Migration :** aucune donnée n'est concernée. Ce que l'ardoise garantissait — une ligne par
rôle du déjeuner, y compris pour un rôle absent — est repris intégralement par l'exigence
**Cartes du jour**.

### Requirement: Le jour tient dans la fenêtre

**Raison :** sept rôles rendus en cartes ne logent pas dans une fenêtre de téléphone (D53).
La contrainte est remplacée par une garantie plus faible et toujours vérifiable, portée par
l'exigence **Cartes du jour**.

**Migration :** aucune.

## ADDED Requirements

### Requirement: Cartes du jour

L'écran du jour SHALL présenter le déjeuner comme une suite de cartes de même forme, une par
rôle du déjeuner et jamais moins, dans l'ordre du service. Un rôle absent SHALL produire une
carte énonçant son absence, afin qu'un creux reste distinguable d'une donnée manquante.

Aucune carte NE SHALL être actionnable : la cible est la journée entière, portée par l'élément
qui contient la suite.

Chaque carte SHALL porter le libellé de son rôle, le nom du plat, et — lorsqu'ils existent — les
mentions de qualité et le signalement d'allergène. Elle NE SHALL PAS porter de texte descriptif :
les données n'en comportent pas.

La couleur d'une carte SHALL désigner le rôle et non le contenu. Chaque rôle SHALL disposer
d'une couleur propre, stable d'un jour à l'autre, tenant le rapport de contraste du texte normal
aussi bien sur la surface d'une carte que sur le fond de l'écran, de sorte qu'une seule valeur
serve d'aplat et d'encre.

Le rang du plat principal SHALL être dit par le corps de son nom seul, sans aplat ni cadre qui
le distinguerait des autres cartes.

La première carte SHALL être entièrement visible sans défilement, sur la plus petite fenêtre
prise en charge. Les cartes suivantes MAY demander un défilement.

#### Scenario: Un rôle par carte
- **WHEN** l'écran du jour affiche un jour servi
- **THEN** chaque rôle du déjeuner est présent, dans l'ordre du service, y compris ceux dont aucun plat n'est publié

#### Scenario: Rôle absent
- **WHEN** un jour ne comporte pas d'entrée
- **THEN** une carte énonce l'absence d'entrée, et ne se confond pas avec une carte portant un plat

#### Scenario: La couleur ne dépend pas du contenu
- **WHEN** deux jours différents sont affichés successivement
- **THEN** la couleur associée à un même rôle est identique sur les deux jours

#### Scenario: Aucune carte n'est actionnable
- **WHEN** l'écran du jour est parcouru au clavier
- **THEN** aucune carte ne reçoit le focus, et l'ouverture du détail se fait par la cible qui porte la journée

#### Scenario: La première carte est visible d'emblée
- **WHEN** l'écran du jour est affiché sur la plus petite fenêtre prise en charge
- **THEN** la première carte est entièrement visible sans défiler

### Requirement: Pied fixe de mentions

L'application SHALL porter un pied fixe, ancré au bas de la fenêtre, donnant accès aux mentions
et à la provenance des données depuis n'importe quel écran.

Ce pied SHALL réserver sous le contenu une hauteur égale à la sienne augmentée de l'encart que
le système réserve au bas de la fenêtre, afin qu'aucun contenu ne passe dessous.

Ce pied NE SHALL PAS porter d'information variant d'un écran à l'autre. La date de mise à jour
des données et le lien vers le document officiel SHALL rester dans le flux de l'écran qu'ils
qualifient.

#### Scenario: Le pied reste atteignable
- **WHEN** l'utilisateur défile jusqu'au bas d'un écran long
- **THEN** le pied est visible et son lien actionnable, sans recouvrir la dernière carte

#### Scenario: Encart bas du système
- **WHEN** l'application est affichée sur un appareil réservant un encart au bas de la fenêtre
- **THEN** le pied se place au-dessus de cet encart et le contenu ne passe pas dessous

## MODIFIED Requirements

### Requirement: En-tête d'écran

Chaque écran SHALL porter un en-tête énonçant ce qu'est l'application et ce que l'écran montre.

Chaque écran SHALL porter exactement un titre de premier niveau.

L'en-tête NE SHALL PAS porter la mention qui situe le jour affiché : celle-ci SHALL vivre dans
le rang de navigation, entre les commandes qui la font changer.

L'en-tête NE SHALL PAS porter la commande de retour au repère, ni aucune autre commande : celles
qui sont communes à tous les écrans vivent sur l'enseigne.

#### Scenario: Un seul titre de premier niveau
- **WHEN** un écran de consultation est chargé
- **THEN** le document contient exactement un titre de premier niveau

#### Scenario: La mention accompagne les commandes qui la changent
- **WHEN** l'écran du jour affiche un jour choisi par le système
- **THEN** la mention qui situe ce jour est rendue dans le rang de navigation, et non dans l'en-tête

#### Scenario: L'en-tête ne bouge pas d'un écran à l'autre
- **WHEN** l'utilisateur passe de l'écran du jour à l'écran de la semaine
- **THEN** l'en-tête énonce la même chose et conserve la même hauteur

### Requirement: Accès aux écrans

Le système SHALL offrir un accès permanent aux écrans du jour et de la semaine, présenté comme
un choix entre deux états dont un seul est actif.

Ce choix SHALL être rendu au-dessus du contenu, et non dans un élément ancré au bas de la
fenêtre. L'état actif SHALL être restitué comme tel aux technologies d'assistance.

Le passage d'un écran à l'autre NE SHALL PAS réinitialiser le jour choisi par l'utilisateur.

#### Scenario: Deux écrans, un actif
- **WHEN** l'écran du jour est affiché
- **THEN** le choix présente exactement deux entrées, et celle du jour est restituée comme active

#### Scenario: Le choix survit au changement d'écran
- **WHEN** l'utilisateur a choisi un jour puis passe à l'écran de la semaine et revient
- **THEN** le jour choisi est toujours affiché

### Requirement: Navigation entre jours

Le système SHALL permettre de passer au jour servi précédent ou suivant. La navigation SHALL être
possible au clavier et par une commande visible, et MAY être doublée d'un geste de balayage
horizontal.

Les commandes de jour précédent et suivant SHALL encadrer la mention qui situe le jour affiché,
et SHALL être rendues une seule fois par écran.

Lorsque le jour affiché n'est pas celui que le système aurait choisi, le système SHALL offrir une
commande ramenant à ce jour en une seule action, depuis l'écran du jour comme depuis l'écran de
la semaine. Cette commande SHALL être rendue à la suite du contenu, et non dans l'en-tête.

Le libellé de cette commande SHALL nommer le jour vers lequel elle ramène, et NE SHALL PAS
annoncer « aujourd'hui » lorsque le jour de retour n'est pas le jour courant. Lorsque aucun jour
n'est publié, la commande NE SHALL PAS être affichée. Cette commande NE SHALL PAS énoncer la
distance qui sépare le jour affiché du jour de retour.

Le choix d'un jour par l'utilisateur SHALL cesser de valoir lorsque le jour civil change.

Le passage d'un jour à l'autre SHALL être perçu comme immédiat, et toute transition qui
l'accompagne SHALL gouverner l'écran entier sous une seule et même durée.

#### Scenario: Un seul rang de commandes
- **WHEN** l'écran du jour est affiché
- **THEN** les commandes de jour précédent et suivant apparaissent une seule fois

#### Scenario: Passage au jour suivant
- **WHEN** l'utilisateur demande le jour suivant depuis un vendredi
- **THEN** le lundi servi suivant est affiché, les jours non servis étant sautés

#### Scenario: Retour au repère en une action
- **WHEN** l'utilisateur s'est éloigné de plusieurs jours puis actionne la commande de retour
- **THEN** l'écran affiche de nouveau le jour que le système avait choisi, et la commande disparaît

#### Scenario: Le retour ne ment pas sur le jour
- **WHEN** le jour courant n'est pas servi et que le système a choisi le prochain jour servi
- **THEN** la commande de retour ne s'intitule pas « Aujourd'hui »

#### Scenario: Aucun menu publié
- **WHEN** aucun jour n'est disponible dans les données
- **THEN** aucune commande de retour n'est affichée

#### Scenario: Navigation au clavier
- **WHEN** l'utilisateur navigue au clavier uniquement
- **THEN** il peut atteindre et actionner les commandes de jour précédent et suivant, avec un indicateur de focus visible

#### Scenario: Limite du jeu de données
- **WHEN** l'utilisateur demande un jour au-delà des données disponibles
- **THEN** l'application le signale explicitement plutôt que d'afficher un écran vide

#### Scenario: Reprise après plusieurs jours de veille
- **WHEN** l'application installée est reprise alors que le jour civil a changé
- **THEN** le jour choisi lors de la session précédente ne s'applique plus
