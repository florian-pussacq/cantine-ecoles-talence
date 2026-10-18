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

#### Scenario: Deux écrans, un actif
- **WHEN** l'écran du jour est affiché
- **THEN** le choix présente exactement deux entrées, et celle du jour est restituée comme active

#### Scenario: Le choix survit au changement d'écran
- **WHEN** l'utilisateur a choisi un jour puis passe à l'écran de la semaine et revient
- **THEN** le jour choisi est toujours affiché

#### Scenario: Barre sur écran large
- **WHEN** l'application est ouverte sur un écran de bureau
- **THEN** le choix entre les deux écrans reste borné à la largeur de la colonne de contenu et ne s'étire pas sur toute la fenêtre

#### Scenario: Aucun réglage dans la barre
- **WHEN** le choix entre les deux écrans est affiché
- **THEN** il ne contient que des destinations de consultation, à l'exclusion de tout écran de réglage

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

L'écran du jour SHALL présenter le déjeuner comme une suite d'éléments, un par rôle du déjeuner
et jamais moins, dans l'ordre du service. Un rôle servi SHALL être présenté par une carte. Un
rôle absent SHALL produire une ligne compacte énonçant son absence, sans illustration, afin qu'un
creux reste distinguable d'une donnée manquante et ne pèse pas autant qu'un plat servi.

Aucune carte NE SHALL être actionnable : la cible est la journée entière, portée par l'élément
qui contient la suite.

Chaque carte SHALL porter le libellé de son rôle, le nom du plat, et — lorsqu'ils existent — les
mentions de qualité et le signalement d'allergène. Elle NE SHALL PAS porter de texte descriptif :
les données n'en comportent pas.

La couleur SHALL désigner la famille du plat principal, et elle seule : la carte du plat
principal SHALL porter la couleur de sa famille, la même que sur l'écran de la semaine, et le nom
de cette famille écrit. Les autres cartes NE SHALL PAS porter de couleur de rôle ni de famille.
Un plat principal dont la famille n'est pas reconnue SHALL porter la couleur de repli neutre, sans
nom de famille.

La première carte SHALL être entièrement visible sans défilement, sur la plus petite fenêtre
prise en charge. Les cartes suivantes MAY demander un défilement.

#### Scenario: Un rôle par carte
- **WHEN** l'écran du jour affiche un jour servi
- **THEN** chaque rôle du déjeuner est présent, dans l'ordre du service, y compris ceux dont aucun plat n'est publié

#### Scenario: Rôle absent
- **WHEN** un jour ne comporte pas d'entrée
- **THEN** une ligne compacte énonce l'absence d'entrée, et ne se confond pas avec une carte portant un plat

#### Scenario: Aucune carte n'est actionnable
- **WHEN** l'écran du jour est parcouru au clavier
- **THEN** aucune carte ne reçoit le focus, et l'ouverture du détail se fait par la cible qui porte la journée

#### Scenario: La première carte est visible d'emblée
- **WHEN** l'écran du jour est affiché sur la plus petite fenêtre prise en charge
- **THEN** la première carte est entièrement visible sans défiler

#### Scenario: Le plat principal porte sa famille
- **WHEN** l'écran du jour affiche un rôti de bœuf en plat principal
- **THEN** sa carte porte la couleur de la famille viande et le mot « Viande », la même couleur que son disque sur l'écran de la semaine

#### Scenario: Les autres cartes restent en encre
- **WHEN** l'écran du jour affiche une salade grecque en entrée
- **THEN** sa carte ne porte aucune couleur de famille ni de rôle

#### Scenario: Plat principal inclassable
- **WHEN** le plat principal n'appartient à aucune famille reconnue
- **THEN** sa carte porte la couleur de repli neutre et aucun nom de famille

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

### Requirement: Un jour de vacances se présente comme tel

Un jour issu d'un menu de vacances SHALL être présenté avec l'intitulé de ce menu, sur l'écran du jour comme sur l'écran de la semaine, de sorte qu'il ne soit pas confondu avec un jour d'école. Il SHALL rester un jour servi pour la navigation et la résolution du jour affiché.

Lorsque le système présente de lui-même un jour de vacances, la mention qui situe ce jour SHALL indiquer qu'il s'agit des vacances.

#### Scenario: Consultation pendant les vacances
- **WHEN** l'utilisateur ouvre l'application le 20 octobre 2026
- **THEN** l'écran présente le menu du 20 octobre, accompagné de l'intitulé « Vacances de Toussaint »

#### Scenario: Veille des vacances
- **WHEN** l'utilisateur ouvre l'application le samedi 17 octobre 2026
- **THEN** l'écran présente le menu du lundi 19 octobre, premier jour servi, avec l'intitulé des vacances

#### Scenario: Semaine de vacances
- **WHEN** l'utilisateur consulte la semaine du 19 au 23 octobre 2026
- **THEN** chaque jour est marqué de l'intitulé des vacances

#### Scenario: La mention nomme les vacances
- **WHEN** l'utilisateur ouvre l'application le samedi 17 octobre 2026
- **THEN** la mention indique les vacances et la distance au lundi 19, et non un simple « dans 2 jours »

### Requirement: Les messages portent un ton

Tout message qui n'est pas un plat SHALL être présenté, sur tous les écrans, sous l'un de trois tons : alerte pour ce qui compromet la lecture d'un repas, événement pour ce qui caractérise le jour présenté, info pour les limites de l'application et l'état de ses données.

La couleur d'alerte NE SHALL être employée par aucun autre ton. Sur l'écran du jour, les messages SHALL se lire dans l'ordre événement, alerte, info. Un message NE SHALL PAS emprunter la présentation d'une carte de plat.

#### Scenario: Un jour de vacances sans allergènes précisés
- **WHEN** l'utilisateur consulte le 21 octobre 2026, jour de vacances dont le document ne précise pas les allergènes, avec des menus non rafraîchis depuis plus de deux jours
- **THEN** l'intitulé des vacances se lit d'abord sur le ton événement, puis l'avertissement des allergènes sur le ton alerte, puis l'avertissement de fraîcheur sur le ton info

#### Scenario: Une limite de l'application n'alerte pas
- **WHEN** le stockage local est indisponible, ou qu'une nouvelle version est disponible
- **THEN** le message est présenté sur le ton info, et non avec la couleur d'alerte

#### Scenario: Le thème du jour
- **WHEN** le jour présenté porte un thème, comme « Semaine du goût »
- **THEN** le thème est présenté sur le ton événement, et non comme une carte de plat

### Requirement: Le jour courant se marque d'une seule façon

Le jour courant SHALL être désigné sur les deux écrans par une même étiquette « Aujourd'hui » en toutes lettres, sur l'aplat de l'accent, perceptible sans distinction chromatique.

Sur l'écran du jour, elle SHALL apparaître dans la mention lorsque, et seulement lorsque, le jour affiché est le jour courant. Sur la semaine, la ligne du jour courant NE SHALL PAS être cernée d'un contour qui ressemble à l'indicateur de focus.

#### Scenario: Écran du jour, le jour même
- **WHEN** l'utilisateur ouvre l'application un jour servi
- **THEN** la mention porte l'étiquette « Aujourd'hui » sur l'aplat de l'accent

#### Scenario: Écran du jour, un autre jour
- **WHEN** l'écran présente le lendemain, ou un jour atteint par navigation
- **THEN** la mention ne porte pas l'étiquette « Aujourd'hui »

#### Scenario: Vacances, le jour même
- **WHEN** l'utilisateur ouvre l'application le 20 octobre 2026
- **THEN** la mention indique les vacances et porte l'étiquette « Aujourd'hui »

#### Scenario: Écran de la semaine
- **WHEN** l'utilisateur consulte la semaine qui contient le jour courant
- **THEN** la ligne de ce jour porte la même étiquette « Aujourd'hui » que l'écran du jour, sans contour qui ressemble au focus

### Requirement: Le goûter en ligne compacte

Le goûter SHALL être présenté sous le déjeuner, séparé de lui, par une ligne compacte portant le
libellé de son rôle, son nom — ou l'énoncé que son détail n'est pas publié — ses mentions de
qualité et son signalement d'allergène. Il SHALL rester une cible distincte donnant accès au
détail de la journée.

#### Scenario: Goûter publié
- **WHEN** l'écran du jour affiche un jour dont le goûter est publié
- **THEN** le goûter apparaît sous le déjeuner, sur une ligne compacte, sans illustration

#### Scenario: Le goûter ouvre la journée
- **WHEN** l'utilisateur actionne le goûter
- **THEN** le détail de la journée s'ouvre, et le focus revient au goûter à sa fermeture
