## ADDED Requirements

### Requirement: Les valeurs visuelles viennent des jetons

Les tailles de police, les rayons et les couleurs des composants SHALL être exprimés par les jetons de `tokens.css`. Une valeur littérale NE SHALL être admise que si elle figure dans une liste d'exceptions qui en donne la raison.

#### Scenario: Taille de police écrite en dur
- **WHEN** un composant déclare `font-size: 0.5625rem`
- **THEN** la vérification échoue et nomme le composant, la propriété et la valeur

#### Scenario: Exception justifiée
- **WHEN** un composant déclare `border-radius: 50%` pour dessiner un disque
- **THEN** la vérification l'admet

### Requirement: Aucun texte sous le plus petit cran de l'échelle

Aucun texte de l'application NE SHALL être rendu plus petit que le plus petit cran de l'échelle typographique, et chaque taille de texte SHALL suivre le palier de l'écran large.

#### Scenario: Étiquette de qualité
- **WHEN** une carte affiche la capsule « Bio »
- **THEN** sa taille est celle d'un cran de l'échelle, et elle grandit sur écran large comme les autres textes
