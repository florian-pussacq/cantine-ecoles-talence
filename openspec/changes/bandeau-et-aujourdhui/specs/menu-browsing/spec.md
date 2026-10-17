## ADDED Requirements

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
