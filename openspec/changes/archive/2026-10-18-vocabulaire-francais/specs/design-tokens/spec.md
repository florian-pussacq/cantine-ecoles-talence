## ADDED Requirements

### Requirement: Les jetons se nomment en français

Les jetons de `tokens.css` et les jetons locaux posés par les composants SHALL porter des noms français, échelles comprises. Les suffixes de taille (`2xs` à `2xl`) SHALL être admis comme crans de mesure. La couleur posée sur une surface SHALL se nommer `--sur-<surface>`. La vérification des jetons SHALL refuser une déclaration dont le nom commence par une racine anglaise retirée.

#### Scenario: Jeton anglais réintroduit
- **WHEN** `tokens.css` déclare `--ink: #16211f`
- **THEN** la vérification échoue et nomme le jeton

#### Scenario: Ancien nom encore cité
- **WHEN** un composant déclare `color: var(--ink-muted)` après le renommage
- **THEN** la vérification échoue et nomme le jeton inconnu

#### Scenario: Couleur sur une surface
- **WHEN** un texte se pose sur l'aplat d'alerte
- **THEN** sa couleur est le jeton `--sur-alerte`
