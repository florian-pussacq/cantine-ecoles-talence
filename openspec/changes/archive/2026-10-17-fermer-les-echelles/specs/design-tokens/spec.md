## MODIFIED Requirements

### Requirement: Les valeurs visuelles viennent des jetons

Les tailles de police, les graisses, les rayons, les couleurs — voiles compris — et les durées et courbes de transition des composants SHALL être exprimés par les jetons de `tokens.css`. Une valeur littérale NE SHALL être admise que si elle figure dans une liste d'exceptions qui en donne la raison.

L'exigence SHALL s'appliquer aussi aux règles de base de `tokens.css`, aux propriétés raccourcies qui portent une couleur, et aux styles écrits dans le balisage. Un jeton cité qui n'existe pas dans `tokens.css` SHALL être refusé comme une valeur littérale.

#### Scenario: Taille de police écrite en dur
- **WHEN** un composant déclare `font-size: 0.5625rem`
- **THEN** la vérification échoue et nomme le composant, la propriété et la valeur

#### Scenario: Exception justifiée
- **WHEN** un composant déclare `border-radius: 50%` pour dessiner un disque
- **THEN** la vérification l'admet

#### Scenario: Graisse écrite en dur
- **WHEN** un composant déclare `font-weight: 700`
- **THEN** la vérification échoue et nomme le composant, la propriété et la valeur

#### Scenario: Couleur dans un raccourci
- **WHEN** un composant déclare `border: 1px solid #ccc`
- **THEN** la vérification échoue

#### Scenario: Durée de transition écrite en dur
- **WHEN** un composant déclare `transition: opacity 180ms ease-out`
- **THEN** la vérification échoue

#### Scenario: Règle de base de la feuille de jetons
- **WHEN** la règle `body` de `tokens.css` déclare `font-size: 16px`
- **THEN** la vérification échoue

#### Scenario: Jeton inexistant
- **WHEN** un composant déclare `font-weight: var(--poids-frot)`
- **THEN** la vérification échoue et nomme le jeton inconnu
