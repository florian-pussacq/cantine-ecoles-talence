## ADDED Requirements

### Requirement: La page autonome reprend les jetons

La page servie pour une adresse inconnue, qui ne peut pas lire `tokens.css`, SHALL déclarer les jetons qu'elle emploie sous leur nom et avec leur valeur, dans la palette claire comme dans la sombre. La vérification SHALL refuser une valeur qui diffère de celle de `tokens.css` dans la même palette.

#### Scenario: Palette modifiée sans la page 404
- **WHEN** `tokens.css` change la valeur de `--fond` et que la page 404 garde l'ancienne
- **THEN** la vérification échoue et nomme le jeton et la palette
