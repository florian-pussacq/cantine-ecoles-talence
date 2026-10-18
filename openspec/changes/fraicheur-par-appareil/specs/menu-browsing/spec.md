## MODIFIED Requirements

### Requirement: Les messages portent un ton

Tout message qui n'est pas un plat SHALL être présenté, sur tous les écrans, sous l'un de trois tons : alerte pour ce qui compromet la lecture d'un repas, événement pour ce qui caractérise le jour présenté, info pour les limites de l'application et l'état de ses données.

La couleur d'alerte NE SHALL être employée par aucun autre ton. Sur l'écran du jour, les messages SHALL se lire dans l'ordre événement, alerte, info. Un message NE SHALL PAS emprunter la présentation d'une carte de plat.

#### Scenario: Un jour de vacances sans allergènes précisés
- **WHEN** l'utilisateur consulte le 21 octobre 2026, jour de vacances dont le document ne précise pas les allergènes, sur un appareil qui n'a pas joint le serveur depuis plus de sept jours
- **THEN** l'intitulé des vacances se lit d'abord sur le ton événement, puis l'avertissement des allergènes sur le ton alerte, puis l'avertissement de fraîcheur sur le ton info

#### Scenario: Une limite de l'application n'alerte pas
- **WHEN** le stockage local est indisponible, ou qu'une nouvelle version est disponible
- **THEN** le message est présenté sur le ton info, et non avec la couleur d'alerte

#### Scenario: Le thème du jour
- **WHEN** le jour présenté porte un thème, comme « Semaine du goût »
- **THEN** le thème est présenté sur le ton événement, et non comme une carte de plat
