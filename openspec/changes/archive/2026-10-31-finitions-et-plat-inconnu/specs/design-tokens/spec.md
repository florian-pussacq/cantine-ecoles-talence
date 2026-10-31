## ADDED Requirements

### Requirement: Le texte courant se compose pour être lu

Un paragraphe de texte courant SHALL être borné à une mesure de lecture d'au plus 75 caractères par ligne, quelle que soit la largeur de l'écran. Un paragraphe NE SHALL PAS s'achever sur un mot seul lorsque le navigateur sait l'éviter. L'approche d'un texte (`letter-spacing`) SHALL venir des jetons, comme sa taille et sa graisse.

#### Scenario: Mesure sur un écran de bureau
- **WHEN** l'écran des mentions est ouvert sur un écran de bureau
- **THEN** aucun de ses paragraphes ne dépasse 75 caractères par ligne

#### Scenario: Mot seul en dernière ligne
- **WHEN** un paragraphe de plusieurs lignes est affiché dans un navigateur qui sait équilibrer ses fins de paragraphe
- **THEN** sa dernière ligne ne porte pas un mot seul

#### Scenario: Approche écrite en dur
- **WHEN** un composant déclare `letter-spacing: -0.03em`
- **THEN** la vérification échoue et nomme le composant
