## ADDED Requirements

### Requirement: La reproduction des menus est vérifiée à chaque poussée

La CI SHALL rejouer l'extraction de chaque PDF conservé à chaque poussée, dans un environnement installé depuis la dépendance déclarée. Cette vérification NE SHALL PAS conditionner la publication : l'application sert des données déjà commitées, que l'extracteur ne modifie pas.

#### Scenario: Extracteur cassé
- **WHEN** une poussée rend l'extracteur incapable de reproduire un mois publié
- **THEN** le job d'extraction échoue et le signale, et la publication des données déjà commitées reste possible

#### Scenario: Installation depuis le dépôt
- **WHEN** le job d'extraction prépare son environnement
- **THEN** il installe la bibliothèque de lecture depuis `scripts/requirements.txt`, à la version qui y est déclarée
