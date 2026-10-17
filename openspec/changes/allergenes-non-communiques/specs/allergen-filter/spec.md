## ADDED Requirements

### Requirement: Allergènes non précisés par le document

Lorsque le document source d'un jour ne précise pas les allergènes, le système SHALL le signaler sur l'écran du jour, avec un accès au document officiel, et sur l'écran de la semaine. Il NE SHALL PAS présenter les plats de ce jour comme n'ayant aucun allergène déclaré, hormis ceux qui portent des codes.

Lorsque des allergènes sont surveillés, le système SHALL indiquer qu'ils ne peuvent pas être signalés pour ce jour. L'absence de plat signalé NE SHALL PAS être présentée comme l'absence des allergènes surveillés.

#### Scenario: Jour sans allergènes précisés
- **WHEN** l'utilisateur consulte un jour dont le document ne précise pas les allergènes
- **THEN** un avertissement le dit et renvoie au document officiel, et le détail des plats indique des allergènes non communiqués

#### Scenario: Filtre actif sur un jour sans allergènes précisés
- **WHEN** le lait est surveillé et que l'utilisateur consulte un jour dont le document ne précise pas les allergènes
- **THEN** l'avertissement indique que les allergènes surveillés ne peuvent pas être signalés pour ce jour

#### Scenario: Semaine contenant un tel jour
- **WHEN** l'utilisateur consulte une semaine contenant un jour dont le document ne précise pas les allergènes
- **THEN** ce jour est marqué comme ayant des allergènes non précisés
