## ADDED Requirements

### Requirement: Chaque ton de message tient son contraste

L'encre de chaque ton de message SHALL présenter un contraste d'au moins 4,5:1 avec sa surface. La surface qui marque le jour courant SHALL laisser à chaque texte posé dessus le seuil qu'il tient sur une carte.

#### Scenario: Ton info
- **WHEN** la vérification mesure l'encre info sur la surface info
- **THEN** le contraste atteint au moins 4,5:1

#### Scenario: Texte atténué sur la ligne du jour courant
- **WHEN** la vérification mesure l'encre atténuée sur la teinte du jour courant posée sur une carte
- **THEN** le contraste atteint au moins 4,5:1
