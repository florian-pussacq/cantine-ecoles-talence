## ADDED Requirements

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

Le goûter SHALL être présenté hors de la grille.

#### Scenario: Jour complet
- **WHEN** un jour comporte tous ses rôles
- **THEN** le plat principal occupe le compartiment le plus large et porte la couleur de sa famille

#### Scenario: Rôle absent
- **WHEN** un jour ne comporte pas d'entrée
- **THEN** le compartiment de l'entrée reste affiché avec la mention explicite qu'il n'y en a pas ce jour

#### Scenario: Plat principal de famille inconnue
- **WHEN** la famille du plat principal ne peut pas être déduite
- **THEN** le compartiment prend la couleur de repli neutre et reste lisible

### Requirement: Navigation entre jours

Le système SHALL permettre de passer au jour servi précédent ou suivant. La navigation SHALL être possible au clavier et par une commande visible, et MAY être doublée d'un geste de balayage horizontal.

Le passage d'un jour à l'autre SHALL être perçu comme immédiat.

#### Scenario: Passage au jour suivant
- **WHEN** l'utilisateur demande le jour suivant depuis un vendredi
- **THEN** le lundi servi suivant est affiché, les jours non servis étant sautés

#### Scenario: Navigation au clavier
- **WHEN** l'utilisateur navigue au clavier uniquement
- **THEN** il peut atteindre et actionner les commandes de jour précédent et suivant, avec un indicateur de focus visible

#### Scenario: Limite du jeu de données
- **WHEN** l'utilisateur demande un jour au-delà des données disponibles
- **THEN** l'application le signale explicitement plutôt que d'afficher un écran vide

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

### Requirement: Accessibilité des écrans de consultation

Les écrans de consultation SHALL respecter le niveau WCAG 2.1 AA : contraste de texte d'au moins 4.5:1, cibles tactiles d'au moins 44 pixels, navigation clavier complète avec focus visible, et langue du document déclarée à `fr`.

Le système SHALL respecter `prefers-reduced-motion` et SHALL proposer un thème sombre piloté par `prefers-color-scheme`.

#### Scenario: Mouvement réduit demandé
- **WHEN** l'utilisateur a activé la réduction des animations dans son système
- **THEN** les transitions entre jours sont supprimées, la navigation restant fonctionnelle

#### Scenario: Thème sombre système
- **WHEN** le système de l'utilisateur est en thème sombre
- **THEN** l'application s'affiche en thème sombre en conservant les rapports de contraste requis
