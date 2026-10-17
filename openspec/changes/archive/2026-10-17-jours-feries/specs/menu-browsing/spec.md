## ADDED Requirements

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
