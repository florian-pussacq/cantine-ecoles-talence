## ADDED Requirements

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
