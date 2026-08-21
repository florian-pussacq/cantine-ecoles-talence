## MODIFIED Requirements

### Requirement: En-tête d'écran

Chaque écran SHALL porter un en-tête énonçant ce que l'écran montre et pour quand.

Le titre de l'en-tête — la date sur l'écran du jour, la période sur l'écran de la semaine — SHALL tenir sur une seule ligne et NE SHALL JAMAIS être coupé. Lorsque l'en-tête ne peut pas loger sur une même ligne le titre et la mention qui le situe, c'est la mention qui SHALL se replier.

Chaque écran SHALL porter exactement un titre de premier niveau, qui SHALL être ce titre d'en-tête.

L'en-tête SHALL réserver un emplacement unique, occupé soit par la mention qui situe le jour affiché, soit par la commande de retour au repère, jamais par les deux. Lorsque le jour affiché est celui que le système a choisi, cet emplacement SHALL porter la mention ; lorsque l'utilisateur a lui-même choisi le jour affiché, il SHALL porter la commande.

La hauteur de cet emplacement SHALL être réservée indépendamment de son occupant, de sorte que le passage de la mention à la commande ne déplace aucun contenu.

L'en-tête NE SHALL PAS porter d'autre commande : celles qui sont communes à tous les écrans vivent sur l'enseigne.

#### Scenario: Un seul titre de premier niveau
- **WHEN** un écran de consultation est chargé
- **THEN** le document contient exactement un titre de premier niveau

#### Scenario: L'en-tête situe la date
- **WHEN** l'écran du jour affiche un jour autre que celui du moment, choisi par le système
- **THEN** l'en-tête énonce la date affichée et la façon dont elle se situe par rapport à aujourd'hui

#### Scenario: Date longue et mention longue
- **WHEN** l'écran du jour affiche une date dont le libellé est le plus long possible, accompagnée de la mention de situation la plus longue possible
- **THEN** la date est rendue entière sur une seule ligne, et c'est la mention qui occupe une seconde ligne

#### Scenario: Période de la semaine
- **WHEN** l'écran de la semaine est affiché
- **THEN** la période énoncée tient sur une seule ligne et n'est pas coupée

#### Scenario: La mention cède la place à la commande
- **WHEN** l'utilisateur navigue vers un jour autre que celui que le système avait choisi
- **THEN** la mention disparaît et la commande de retour apparaît au même emplacement, sans que la hauteur de l'en-tête change

#### Scenario: Le titre reste complet sans la mention
- **WHEN** la commande de retour occupe l'emplacement
- **THEN** le titre de premier niveau énonce la date affichée, et la commande est restituée comme une commande et non comme une partie du titre

### Requirement: Navigation entre jours

Le système SHALL permettre de passer au jour servi précédent ou suivant. La navigation SHALL être possible au clavier et par une commande visible, et MAY être doublée d'un geste de balayage horizontal.

Lorsque le jour affiché n'est pas celui que le système aurait choisi, le système SHALL offrir une commande ramenant à ce jour en une seule action, depuis l'écran du jour comme depuis l'écran de la semaine.

Le libellé de cette commande SHALL nommer le jour vers lequel elle ramène, et NE SHALL PAS annoncer « aujourd'hui » lorsque le jour de retour n'est pas le jour courant. Lorsque aucun jour n'est publié, la commande NE SHALL PAS être affichée.

Cette commande NE SHALL PAS énoncer la distance qui sépare le jour affiché du jour de retour.

Le choix d'un jour par l'utilisateur SHALL cesser de valoir lorsque le jour civil change. Le système NE SHALL PAS présenter comme jour du moment un jour choisi lors d'une session antérieure.

Le passage d'un jour à l'autre SHALL être perçu comme immédiat : le menu du jour atteint SHALL être présent, lisible et actionnable dès la première image, sans être retenu par une animation.

Lorsqu'une transition accompagne le changement de jour, elle SHALL être décorative et gouverner l'écran entier sous une seule et même durée. Les éléments qui énoncent le jour affiché NE SHALL PAS changer selon un temps différent de celui du contenu qu'ils annoncent.

#### Scenario: Passage au jour suivant
- **WHEN** l'utilisateur demande le jour suivant depuis un vendredi
- **THEN** le lundi servi suivant est affiché, les jours non servis étant sautés

#### Scenario: Retour au repère en une action
- **WHEN** l'utilisateur s'est éloigné de plusieurs jours puis actionne la commande de retour
- **THEN** l'écran affiche de nouveau le jour que le système avait choisi, et la commande cède la place à la mention

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

#### Scenario: Une seule horloge
- **WHEN** l'utilisateur change de jour et qu'une transition accompagne le changement
- **THEN** l'en-tête qui énonce la date et le contenu du jour changent sous la même durée, et non l'un avant l'autre

#### Scenario: Le contenu n'attend pas l'animation
- **WHEN** une transition est en cours après un changement de jour
- **THEN** le menu du jour atteint est déjà présent dans le document et actionnable

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
