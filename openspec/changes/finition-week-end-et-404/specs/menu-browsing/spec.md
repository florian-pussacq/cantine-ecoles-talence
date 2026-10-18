## ADDED Requirements

### Requirement: Le week-end se nomme

Lorsque le jour courant n'est pas servi parce que c'est un samedi ou un dimanche, la mention du jour présenté SHALL le dire, comme elle le dit d'un férié, et compter les jours jusqu'au service. Un jour de vacances présenté SHALL conserver sa mention propre.

#### Scenario: Samedi
- **WHEN** l'utilisateur ouvre l'application un samedi, et que lundi est servi
- **THEN** la mention dit « Week-end · service dans 2 jours » au-dessus de la date de lundi

#### Scenario: Dimanche
- **WHEN** l'utilisateur ouvre l'application un dimanche, et que lundi est servi
- **THEN** la mention dit « Week-end · service demain »

#### Scenario: Week-end avant des vacances
- **WHEN** le jour présenté après un week-end est un jour de vacances
- **THEN** la mention dit les vacances, et non le week-end
