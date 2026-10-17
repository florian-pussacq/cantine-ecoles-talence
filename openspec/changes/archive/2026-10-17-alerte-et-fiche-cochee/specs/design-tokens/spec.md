## ADDED Requirements

### Requirement: L'alerte ne ressemble à aucun plat

La couleur d'alerte SHALL se distinguer perceptiblement de chacune des couleurs de famille de plat. Une vérification automatique SHALL mesurer cet écart sur les valeurs des jetons et échouer en nommant la famille trop proche.

#### Scenario: Famille de la couleur de l'alerte
- **WHEN** une couleur de famille est rendue égale ou très proche de la couleur d'alerte
- **THEN** la vérification échoue et nomme la famille et le jeton d'alerte

#### Scenario: Écran de la semaine un jour de volaille
- **WHEN** l'utilisateur consulte une semaine dont un jour sert de la volaille et qu'un autre ne précise pas ses allergènes
- **THEN** l'anneau de la volaille et l'avertissement ne partagent pas la même couleur

### Requirement: L'anneau d'une famille se perçoit sur sa teinte

La couleur d'une famille SHALL présenter un contraste d'au moins 3:1 avec la teinte pâle de la même famille, sur laquelle elle trace l'anneau de l'illustration.

#### Scenario: Anneau de volaille
- **WHEN** la vérification mesure la couleur de la volaille sur la teinte pâle de la volaille
- **THEN** le contraste atteint au moins 3:1
