# Menu Browsing Specification

## Requirements

### Requirement: Écran Aujourd'hui

Le système SHALL présenter, à l'ouverture, le menu du jour à afficher sous forme de liste verticale ordonnée par rôle. Chaque plat SHALL montrer son libellé et un repère de rôle lisible. L'écran SHALL être compréhensible sans zoom sur un écran de téléphone.

L'écran NE SHALL PAS afficher de squelette de chargement ni d'indicateur de progression lorsque les données sont déjà en cache.

#### Scenario: Ouverture un jour d'école
- **WHEN** l'utilisateur ouvre l'application un jour ouvré dont le menu est connu
- **THEN** la date, le thème éventuel du jour et la liste des plats par rôle sont affichés sans interaction supplémentaire

#### Scenario: Données déjà en cache
- **WHEN** l'application est ouverte alors que les données sont en cache
- **THEN** le contenu s'affiche directement, sans squelette ni indicateur de chargement intermédiaire

#### Scenario: Jour porteur d'un thème
- **WHEN** le jour affiché comporte un thème et une note éditoriale
- **THEN** ceux-ci sont affichés en tête du menu, distincts des plats

### Requirement: Grille compartimentée de l'écran Aujourd'hui

Les plats SHALL être disposés en compartiments dont la taille encode le rôle : le plat principal SHALL occuper le compartiment le plus large, et SHALL porter la couleur de sa famille.

Lorsqu'un rôle est absent du jour affiché, son compartiment SHALL rester en place et indiquer explicitement l'absence. La grille NE SHALL PAS se refermer, afin qu'un rôle absent reste distinguable d'une donnée manquante.

Lorsque le libellé d'un plat n'ajoute rien à son libellé de rôle, le compartiment SHALL nommer à sa place ce qui distingue ce plat des autres jours — sa qualité lorsqu'elle est renseignée. Il NE SHALL PAS énoncer deux fois le même mot.

Lorsqu'un tel libellé n'a aucune qualité à promouvoir, le compartiment SHALL signaler que le détail n'est pas publié. Il NE SHALL PAS laisser entendre que le plat n'est pas servi, lorsque d'autres informations sur ce plat — ses allergènes notamment — sont connues.

Le goûter SHALL être présenté hors de la grille, comme un objet distinct portant le poids visuel d'un compartiment, et séparé du plateau de telle sorte qu'il ne se lise pas comme une partie du déjeuner.

#### Scenario: Jour complet
- **WHEN** un jour comporte tous ses rôles
- **THEN** le plat principal occupe le compartiment le plus large et porte la couleur de sa famille

#### Scenario: Rôle absent
- **WHEN** un jour ne comporte pas d'entrée
- **THEN** le compartiment de l'entrée reste affiché avec la mention explicite qu'il n'y en a pas ce jour

#### Scenario: Plat principal de famille inconnue
- **WHEN** la famille du plat principal ne peut pas être déduite
- **THEN** le compartiment prend la couleur de repli neutre et reste lisible

#### Scenario: Libellé qui répète le rôle, qualité connue
- **WHEN** le pain du jour porte le libellé « Pain » et l'indicateur de qualité « Label Rouge »
- **THEN** le compartiment annonce le pain par sa qualité, et le mot « pain » n'apparaît qu'une fois

#### Scenario: Libellé qui répète le rôle, aucune qualité
- **WHEN** le goûter du jour porte le libellé « Goûter » et aucun indicateur de qualité
- **THEN** l'affichage signale que le détail n'est pas publié, sans répéter le mot « goûter » ni laisser croire qu'aucun goûter n'est servi

#### Scenario: Libellé porteur d'information
- **WHEN** le pain du jour porte le libellé « Pain du mois »
- **THEN** ce libellé est affiché tel quel, puisqu'il dit ce que le rôle ne dit pas

#### Scenario: Poids visuel du goûter
- **WHEN** un jour comporte un goûter détaillé
- **THEN** celui-ci est présenté avec le poids visuel d'un compartiment, hors du plateau, et une rupture visible le sépare du déjeuner

### Requirement: Navigation entre jours

Le système SHALL permettre de passer au jour servi précédent ou suivant. La navigation SHALL être possible au clavier et par une commande visible, et MAY être doublée d'un geste de balayage horizontal.

Le passage d'un jour à l'autre SHALL être perçu comme immédiat : le menu du jour atteint SHALL être présent, lisible et actionnable dès la première image, sans être retenu par une animation.

Lorsqu'une transition accompagne le changement de jour, elle SHALL être décorative et gouverner l'écran entier sous une seule et même durée. Les éléments qui énoncent le jour affiché NE SHALL PAS changer selon un temps différent de celui du contenu qu'ils annoncent.

#### Scenario: Passage au jour suivant
- **WHEN** l'utilisateur demande le jour suivant depuis un vendredi
- **THEN** le lundi servi suivant est affiché, les jours non servis étant sautés

#### Scenario: Navigation au clavier
- **WHEN** l'utilisateur navigue au clavier uniquement
- **THEN** il peut atteindre et actionner les commandes de jour précédent et suivant, avec un indicateur de focus visible

#### Scenario: Limite du jeu de données
- **WHEN** l'utilisateur demande un jour au-delà des données disponibles
- **THEN** l'application le signale explicitement plutôt que d'afficher un écran vide

#### Scenario: Une seule horloge
- **WHEN** l'utilisateur change de jour et qu'une transition accompagne le changement
- **THEN** l'en-tête qui énonce la date et le contenu du jour changent sous la même durée, et non l'un avant l'autre

#### Scenario: Le contenu n'attend pas l'animation
- **WHEN** une transition est en cours après un changement de jour
- **THEN** le menu du jour atteint est déjà présent dans le document et actionnable

### Requirement: Couche modale de détail d'un plat

Le détail d'un plat SHALL être présenté dans une couche modale qui, tant qu'elle est ouverte, retient le focus clavier, empêche l'interaction et le défilement de ce qui se trouve derrière, et rend inopérantes les commandes de navigation entre jours.

La couche SHALL être refermable par au moins trois chemins : une commande visible portant un libellé explicite, la touche d'échappement, et une action sur la surface qui la sépare du contenu. À sa fermeture, le focus SHALL revenir sur l'élément qui l'a ouverte.

La couche NE SHALL PAS présenter d'affordance de manipulation à laquelle aucun comportement ne répond.

Sur un écran étroit, la couche SHALL occuper toute la largeur et être ancrée au bas de l'écran, de sorte que sa commande de fermeture reste à portée du pouce. Sur un écran large, elle SHALL être centrée et de largeur bornée.

#### Scenario: Le focus ne quitte pas la couche ouverte
- **WHEN** la couche est ouverte et que l'utilisateur parcourt les éléments interactifs au clavier
- **THEN** le parcours reste enfermé dans la couche et n'atteint jamais le contenu situé derrière

#### Scenario: Retour du focus à la fermeture
- **WHEN** l'utilisateur ferme la couche, par quelque chemin que ce soit
- **THEN** le focus revient sur le plat qui l'avait ouverte, et non au début du document

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

#### Scenario: Consultation le week-end
- **WHEN** l'utilisateur ouvre l'application un dimanche
- **THEN** le prochain jour servi est affiché avec une mention indiquant clairement qu'il ne s'agit pas du jour courant

#### Scenario: Jour de confiance faible
- **WHEN** le jour affiché porte `confidence: low`
- **THEN** une bannière signale que les données sont incertaines et renvoie vers le PDF officiel, le menu restant affiché

#### Scenario: Mois non publié
- **WHEN** aucun mois ne couvre la période courante
- **THEN** l'application explique que le menu n'est pas encore publié et propose le lien vers la source officielle

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

Chaque écran SHALL porter un en-tête tenant sur une seule ligne de contenu, énonçant en une phrase ce que l'écran montre et pour quand.

Chaque écran SHALL porter exactement un titre de premier niveau, qui SHALL être cet en-tête.

#### Scenario: Un seul titre de premier niveau
- **WHEN** un écran de consultation est chargé
- **THEN** le document contient exactement un titre de premier niveau

#### Scenario: L'en-tête situe la date
- **WHEN** l'écran du jour affiche un jour autre que celui du moment
- **THEN** l'en-tête énonce la date affichée et la façon dont elle se situe par rapport à aujourd'hui

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
