## ADDED Requirements

### Requirement: Réglage local des allergènes à signaler

Le système SHALL permettre de sélectionner un jeu unique d'allergènes à signaler, choisis parmi les quatorze allergènes réglementaires et présentés par leur libellé en clair.

Ce réglage NE SHALL PAS porter de nom, ni permettre la création de plusieurs jeux distincts : c'est une préférence d'affichage, pas un profil d'utilisateur.

Le réglage SHALL être stocké exclusivement dans le navigateur et NE SHALL PAS être transmis à un serveur.

#### Scenario: Sélection d'allergènes
- **WHEN** l'utilisateur coche des allergènes dans les réglages
- **THEN** la sélection est enregistrée localement et prend effet immédiatement sur les écrans de consultation

#### Scenario: Persistance entre sessions
- **WHEN** l'utilisateur ferme puis rouvre l'application
- **THEN** sa sélection d'allergènes est restaurée

#### Scenario: Aucune transmission réseau
- **WHEN** la sélection est modifiée
- **THEN** aucune requête réseau contenant cette sélection n'est émise

#### Scenario: Sélection par libellé
- **WHEN** l'utilisateur choisit ses allergènes
- **THEN** chacun est présenté par son libellé en clair et non par son seul code numérique

#### Scenario: Retrait d'un allergène
- **WHEN** l'utilisateur décoche un allergène précédemment sélectionné
- **THEN** les plats qui n'étaient signalés que par celui-ci cessent de l'être

### Requirement: Fonctionnement dégradé sans stockage

Lorsque le stockage local est indisponible, le système SHALL rester pleinement utilisable pour la consultation des menus, sans signalement, et SHALL en informer l'utilisateur au moment où il tente d'enregistrer une sélection.

#### Scenario: Stockage local inaccessible
- **WHEN** le stockage local est désactivé ou en échec
- **THEN** les écrans de consultation fonctionnent normalement et aucune erreur bloquante n'est affichée

#### Scenario: Tentative d'enregistrement sans stockage
- **WHEN** l'utilisateur modifie sa sélection alors que le stockage est indisponible
- **THEN** l'application l'informe que la préférence ne sera pas conservée après fermeture

### Requirement: Mise en évidence des allergènes sélectionnés

Lorsqu'au moins un allergène est sélectionné, le système SHALL signaler les plats qui en contiennent, sur l'écran Aujourd'hui comme sur l'écran Semaine, en nommant le ou les allergènes concernés en toutes lettres.

Le signalement NE SHALL JAMAIS reposer sur la seule couleur : il SHALL être doublé d'un libellé textuel et d'une marque perceptible sans distinction chromatique.

#### Scenario: Plat contenant un allergène sélectionné
- **WHEN** un plat contient un allergène de la sélection
- **THEN** il est signalé visuellement et le ou les allergènes concernés sont nommés en clair

#### Scenario: Signalement sans dépendance à la couleur
- **WHEN** un plat concerné est affiché
- **THEN** son signalement reste perceptible en niveaux de gris et est restitué par un lecteur d'écran

#### Scenario: Aucun allergène sélectionné
- **WHEN** la sélection est vide
- **THEN** les menus sont affichés sans signalement, sans invitation insistante à en configurer un

### Requirement: Détail des allergènes d'un plat

Le système SHALL permettre de consulter, pour un plat donné, la liste de ses allergènes exprimés en libellés clairs issus de la légende du mois, que ceux-ci figurent ou non dans la sélection.

#### Scenario: Consultation du détail
- **WHEN** l'utilisateur actionne un plat
- **THEN** tous les allergènes de ce plat sont affichés en libellés clairs

#### Scenario: Plat sans allergène déclaré
- **WHEN** un plat ne déclare aucun allergène
- **THEN** l'application indique l'absence d'allergène déclaré, sans laisser entendre qu'elle garantit son absence
