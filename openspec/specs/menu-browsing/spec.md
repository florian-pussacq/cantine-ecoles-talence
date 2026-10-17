# Menu Browsing Specification

## Purpose

Présenter le menu du jour et celui de la semaine, dire toujours de quel jour on parle, et distinguer les jours sans service des jours non publiés.

## Requirements

### Requirement: Écran Aujourd'hui

Le système SHALL présenter, à l'ouverture, le menu du jour à afficher sous forme de liste verticale ordonnée par rôle. Chaque plat SHALL montrer son libellé et un repère de rôle lisible. L'écran SHALL être compréhensible sans zoom sur un écran de téléphone.

L'écran NE SHALL PAS afficher de squelette de chargement ni d'indicateur de progression lorsque les données sont déjà en cache.

Le menu du jour SHALL constituer une cible unique donnant accès au détail de la journée. Les plats pris isolément NE SHALL PAS être des cibles distinctes.

#### Scenario: Ouverture un jour d'école
- **WHEN** l'utilisateur ouvre l'application un jour ouvré dont le menu est connu
- **THEN** la date, le thème éventuel du jour et la liste des plats par rôle sont affichés sans interaction supplémentaire

#### Scenario: Données déjà en cache
- **WHEN** l'application est ouverte alors que les données sont en cache
- **THEN** le contenu s'affiche directement, sans squelette ni indicateur de chargement intermédiaire

#### Scenario: Jour porteur d'un thème
- **WHEN** le jour affiché comporte un thème et une note éditoriale
- **THEN** ceux-ci sont affichés en tête du menu, distincts des plats

#### Scenario: Une seule cible pour le déjeuner
- **WHEN** l'utilisateur parcourt l'écran du jour au clavier
- **THEN** le déjeuner est atteint comme un élément interactif unique, et non comme une suite d'éléments par rôle

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

#### Scenario: Une seule horloge
- **WHEN** l'utilisateur change de jour et qu'une transition accompagne le changement
- **THEN** la désignation du jour et le contenu du jour changent sous la même durée, et non l'un avant l'autre

#### Scenario: Le contenu n'attend pas l'animation
- **WHEN** une transition est en cours après un changement de jour
- **THEN** le menu du jour atteint est déjà présent dans le document et actionnable

### Requirement: Couche modale de détail de la journée

Le détail de la journée SHALL être présenté dans une couche modale unique, listant chaque plat du jour — goûter compris — avec ses allergènes. Le système NE SHALL PAS exiger une ouverture par plat pour obtenir cette liste.

Tant qu'elle est ouverte, la couche SHALL retenir le focus clavier, empêcher l'interaction et le défilement de ce qui se trouve derrière, et rendre inopérantes les commandes de navigation entre jours.

La couche SHALL être refermable par au moins trois chemins : une commande visible portant un libellé explicite, la touche d'échappement, et une action sur la surface qui la sépare du contenu. À sa fermeture, le focus SHALL revenir sur l'élément qui l'a ouverte, quel qu'il soit.

La couche NE SHALL PAS présenter d'affordance de manipulation à laquelle aucun comportement ne répond.

Sur un écran étroit, la couche SHALL occuper toute la largeur et être ancrée au bas de l'écran, de sorte que sa commande de fermeture reste à portée du pouce. Sur un écran large, elle SHALL être centrée et de largeur bornée.

#### Scenario: Une ouverture, tous les plats
- **WHEN** l'utilisateur actionne le menu du jour
- **THEN** la couche présente chaque plat du jour avec ses allergènes, sans qu'une seconde ouverture soit nécessaire

#### Scenario: Le focus ne quitte pas la couche ouverte
- **WHEN** la couche est ouverte et que l'utilisateur parcourt les éléments interactifs au clavier
- **THEN** le parcours reste enfermé dans la couche et n'atteint jamais le contenu situé derrière

#### Scenario: Retour du focus à la fermeture
- **WHEN** l'utilisateur ouvre la couche depuis le goûter puis la referme, par quelque chemin que ce soit
- **THEN** le focus revient sur le goûter, et non sur le menu du déjeuner ni au début du document

#### Scenario: Le fond ne défile pas
- **WHEN** la couche est ouverte et que l'utilisateur fait défiler au-delà de son contenu
- **THEN** le contenu situé derrière reste immobile

#### Scenario: Les commandes de jour sont neutralisées
- **WHEN** la couche est ouverte et que l'utilisateur actionne les flèches de navigation entre jours
- **THEN** le jour affiché ne change pas

#### Scenario: Adaptation à la largeur
- **WHEN** la couche est ouverte sur un écran large
- **THEN** elle est centrée et de largeur bornée, et non étirée sur toute la largeur disponible

### Requirement: Écran Semaine

Le système SHALL présenter les cinq jours ouvrés de la semaine du jour affiché, sous une forme compacte permettant une lecture d'ensemble. Chaque jour SHALL être actionnable pour ouvrir le détail correspondant sur l'écran Aujourd'hui.

#### Scenario: Consultation de la semaine
- **WHEN** l'utilisateur ouvre l'écran Semaine
- **THEN** les cinq jours ouvrés sont visibles avec au minimum le plat principal de chacun

#### Scenario: Ouverture du détail d'un jour
- **WHEN** l'utilisateur actionne un jour depuis l'écran Semaine
- **THEN** l'écran Aujourd'hui s'ouvre sur ce jour

#### Scenario: Semaine partiellement publiée
- **WHEN** certains jours de la semaine ne figurent pas dans les données
- **THEN** ces jours sont présentés comme non publiés, distincts d'un jour sans école

### Requirement: États limites de consultation

Le système SHALL distinguer visuellement et textuellement les situations suivantes : week-end, vacances scolaires, jour férié, mois non encore publié, et jour dont les données sont de confiance faible. Chacune SHALL produire un message spécifique.

L'instant de référence dont dépendent le jour affiché, la mention qui le situe et l'avertissement de fraîcheur SHALL être remis à l'heure lorsque l'application revient au premier plan. Le système NE SHALL PAS raisonner sur l'instant de son dernier démarrage.

#### Scenario: Consultation le week-end
- **WHEN** l'utilisateur ouvre l'application un dimanche
- **THEN** le prochain jour servi est affiché avec une mention indiquant clairement qu'il ne s'agit pas du jour courant

#### Scenario: Jour de confiance faible
- **WHEN** le jour affiché porte `confidence: low`
- **THEN** une bannière signale que les données sont incertaines et renvoie vers le PDF officiel, le menu restant affiché

#### Scenario: Mois non publié
- **WHEN** aucun mois ne couvre la période courante
- **THEN** l'application explique que le menu n'est pas encore publié et propose le lien vers la source officielle

#### Scenario: Reprise après plusieurs jours de veille
- **WHEN** l'application installée est reprise alors que le jour civil a changé depuis sa dernière consultation
- **THEN** le jour choisi lors de la session précédente ne s'applique plus, et l'écran présente le jour du moment sans le confondre avec celui qui était consulté

### Requirement: Écran À propos et mentions

Le système SHALL fournir un écran indiquant la source des données, sa date de mise à jour, un lien vers le document officiel, l'absence d'affiliation avec la Ville de Talence, et un lien vers l'application officielle.

Un avertissement indiquant que seul le document officiel de la Ville fait foi SHALL être présent et NE SHALL PAS être masquable.

#### Scenario: Consultation des mentions
- **WHEN** l'utilisateur ouvre l'écran À propos
- **THEN** la source, la date de mise à jour, le lien officiel, la mention de non-affiliation et l'avertissement sont visibles

#### Scenario: Absence de suivi
- **WHEN** l'application est utilisée
- **THEN** aucune requête n'est émise vers un domaine tiers et aucun cookie n'est déposé

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

#### Scenario: Période de la semaine
- **WHEN** l'écran de la semaine est affiché
- **THEN** la période énoncée tient sur une seule ligne et n'est pas coupée

### Requirement: Lisibilité sur écran large

Sur un écran large, le système SHALL présenter la même structure d'écran que sur un téléphone, à une échelle supérieure, sans introduire de mise en page distincte.

La colonne de contenu SHALL rester de largeur bornée : le texte NE SHALL PAS s'étirer sur toute la largeur disponible.

#### Scenario: Structure conservée
- **WHEN** l'application est ouverte sur un écran de bureau
- **THEN** les écrans présentent les mêmes éléments dans le même ordre que sur téléphone, à une échelle supérieure

#### Scenario: Accessibilité vérifiée sur écran large
- **WHEN** les contrôles d'accessibilité sont exécutés sur un écran de bureau
- **THEN** ils portent les mêmes exigences que sur téléphone et les satisfont

### Requirement: Accessibilité des écrans de consultation

Les écrans de consultation SHALL respecter le niveau WCAG 2.1 AA : contraste de texte d'au moins 4.5:1, contraste d'au moins 3:1 pour les éléments d'interface non textuels qui portent une information ou délimitent une commande, cibles tactiles d'au moins 44 pixels, navigation clavier complète avec focus visible, et langue du document déclarée à `fr`.

Le système SHALL respecter `prefers-reduced-motion`.

Le système SHALL présenter une apparence unique. Il NE SHALL PAS offrir de choix d'apparence, ni faire dépendre son apparence d'une préférence extérieure à l'application.

Les rapports de contraste SHALL être vérifiés sur les couleurs telles qu'elles sont peintes, y compris lorsqu'une surface est obtenue par mélange à l'opacité ou par transparence partielle.

#### Scenario: Mouvement réduit demandé
- **WHEN** l'utilisateur a activé la réduction des animations dans son système
- **THEN** les transitions entre jours sont supprimées, la navigation restant fonctionnelle

#### Scenario: Préférence système d'apparence
- **WHEN** le système de l'utilisateur est en thème sombre
- **THEN** l'application présente la même apparence que sur un système en thème clair

#### Scenario: Surface obtenue par opacité
- **WHEN** un texte ou une bordure est peint par mélange à l'opacité sur le fond de page
- **THEN** le rapport de contraste de la couleur résultante est mesuré et satisfait le seuil applicable à cet élément

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

#### Scenario: Destinations quotidiennes atteignables partout
- **WHEN** l'utilisateur se trouve sur un écran quelconque de l'application
- **THEN** l'écran du jour et l'écran de la semaine sont atteignables sans défiler ni ouvrir de menu

#### Scenario: Écran hors de la barre
- **WHEN** l'utilisateur consulte le réglage des allergènes ou les mentions
- **THEN** la barre reste affichée, aucun de ses segments n'est marqué comme courant, et elle permet de rejoindre l'écran du jour ou celui de la semaine

#### Scenario: Le réglage s'atteint depuis l'enseigne
- **WHEN** l'utilisateur se trouve sur un écran autre que le réglage des allergènes
- **THEN** l'enseigne porte la commande qui y mène

#### Scenario: Barre sur écran large
- **WHEN** l'application est ouverte sur un écran de bureau
- **THEN** la barre reste bornée à la largeur de la colonne de contenu et ne s'étire pas sur toute la fenêtre

#### Scenario: Aucun réglage dans la barre
- **WHEN** la barre est affichée
- **THEN** elle ne contient que des destinations de consultation, à l'exclusion de tout écran de réglage

### Requirement: Le jour férié est nommé

Le système SHALL présenter un jour de nature `public-holiday` comme un jour férié, par un libellé distinct de celui d'un jour sans école et de celui d'un jour non publié.

Lorsque le jour courant est férié et que l'écran du jour présente le prochain jour servi, la mention SHALL indiquer que le jour courant est férié en plus de situer le jour présenté.

#### Scenario: Semaine contenant un jour férié
- **WHEN** l'utilisateur consulte la semaine du 9 au 13 novembre 2026, dont le 11 est férié
- **THEN** le 11 novembre est présenté comme « Jour férié », non actionnable, et les quatre autres jours présentent leur plat principal

#### Scenario: Ouverture un jour férié
- **WHEN** l'utilisateur ouvre l'application le 11 novembre 2026
- **THEN** l'écran présente le menu du 12 novembre, et la mention indique que le 11 est férié et que le menu présenté est celui du lendemain

#### Scenario: Navigation par-dessus un jour férié
- **WHEN** l'utilisateur passe du 10 au jour servi suivant
- **THEN** l'écran présente le 12 novembre, le férié n'étant pas un jour servi

### Requirement: Aucun menu d'un autre jour à la première peinture

Lorsque la page reçue a été rendue pour un jour civil de Paris différent de celui du navigateur, le système NE SHALL PAS peindre le contenu qui dépend du jour — écran du jour, écran de la semaine — avant que l'application ait résolu le jour courant. La place de ce contenu SHALL être conservée, et les éléments qui ne dépendent pas du jour SHALL rester peints.

Si l'application ne parvient pas à résoudre le jour courant dans un délai de trois secondes, le contenu pré-rendu SHALL être montré.

#### Scenario: Page rendue pour le jour courant
- **WHEN** la page a été rendue pour le jour civil de Paris du navigateur
- **THEN** elle se peint entière dès l'arrivée du HTML

#### Scenario: Page rendue un autre jour
- **WHEN** la page a été rendue pour un autre jour que celui du navigateur
- **THEN** l'enseigne et les onglets sont peints, la zone du jour est masquée en gardant sa place, puis elle apparaît avec le menu du jour courant une fois l'application prête

#### Scenario: Application qui ne démarre pas
- **WHEN** la page est périmée et que l'application ne démarre pas
- **THEN** la zone du jour apparaît au bout de trois secondes avec le contenu pré-rendu

### Requirement: Enseigne de l'application

L'application SHALL afficher son nom en permanence, sur tous les écrans de consultation comme de réglage, au moyen d'une enseigne rendue en tête d'écran.

L'enseigne SHALL être rendue avec un poids visuel inférieur à celui du titre de l'écran : elle est constante par construction et NE SHALL PAS prendre de surface à ce qui varie.

L'enseigne NE SHALL PAS être un titre de premier niveau, et NE SHALL PAS changer lorsque le jour ou la semaine affichés changent.

L'enseigne SHALL porter la commande d'accès au réglage des allergènes, laquelle NE SHALL PAS être affichée sur sa propre destination.

#### Scenario: Nom visible sur tous les écrans
- **WHEN** l'utilisateur ouvre l'un quelconque des écrans de l'application
- **THEN** le nom de l'application est visible sans défiler

#### Scenario: L'enseigne ne suit pas le jour
- **WHEN** l'utilisateur change de jour et qu'une transition accompagne le changement
- **THEN** l'enseigne reste immobile pendant que la date et le contenu changent

#### Scenario: Un seul titre de premier niveau
- **WHEN** un écran quelconque est chargé
- **THEN** le document contient exactement un titre de premier niveau, et ce n'est pas l'enseigne

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
