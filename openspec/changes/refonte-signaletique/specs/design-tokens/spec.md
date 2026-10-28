## ADDED Requirements

### Requirement: Le texte posé sur une famille tient son contraste

Le texte posé sur l'aplat d'une famille SHALL présenter un contraste d'au moins 4,5:1 avec cet aplat, dans la palette claire comme dans la sombre. L'illustration du plat principal SHALL reposer sur la teinte pâle de sa famille, jamais directement sur l'aplat.

#### Scenario: Nom du plat sur la volaille
- **WHEN** la vérification mesure le texte de l'aplat sur la couleur de la volaille, dans chaque palette
- **THEN** le contraste atteint au moins 4,5:1

#### Scenario: Famille assombrie au-delà du seuil
- **WHEN** une couleur de famille de la palette sombre est éclaircie au point que le texte posé dessus tombe sous 4,5:1
- **THEN** la vérification échoue et nomme la famille et la palette

#### Scenario: Illustration du plat principal
- **WHEN** l'écran du jour affiche un filet de colin en plat principal
- **THEN** son illustration repose sur la teinte pâle du poisson, posée sur l'aplat du poisson

### Requirement: Les polices viennent de l'application

Les polices SHALL être servies par l'application, sans requête vers un domaine tiers, et disponibles hors ligne. Les familles SHALL être déclarées par des jetons de `tokens.css`, chacune suivie d'une pile de repli système. Un composant NE SHALL PAS nommer une famille de police. La famille d'affichage SHALL être réservée au titre de l'écran et au nom du plat principal.

#### Scenario: Famille nommée dans un composant
- **WHEN** un composant déclare `font-family: 'Funnel Sans'`
- **THEN** la vérification échoue et nomme le composant

#### Scenario: Aucune police tierce
- **WHEN** l'application se charge pour la première fois
- **THEN** chaque police est obtenue depuis l'origine de l'application

#### Scenario: Hors ligne
- **WHEN** l'application est rouverte sans réseau après une première visite
- **THEN** le texte est rendu dans les polices de l'application, et non dans la pile de repli

#### Scenario: Police indisponible
- **WHEN** un fichier de police n'a pas pu être chargé
- **THEN** le texte reste lisible dans la pile de repli, sans période d'invisibilité

### Requirement: Les surfaces du navigateur suivent la palette

La sélection de texte, l'indicateur de focus et le soulignement des liens SHALL être exprimés par les jetons de `tokens.css`, dans la palette claire comme dans la sombre. La sélection de texte SHALL tenir 4,5:1 entre son encre et sa surface.

#### Scenario: Sélection dans la palette sombre
- **WHEN** l'utilisateur sélectionne du texte alors que le système est en thème sombre
- **THEN** la sélection prend les couleurs déclarées pour la palette sombre, et non celles du navigateur

#### Scenario: Paire de sélection mesurée
- **WHEN** la vérification mesure l'encre de la sélection sur sa surface, dans chaque palette
- **THEN** le contraste atteint au moins 4,5:1

## REMOVED Requirements

### Requirement: L'anneau d'une famille se perçoit sur sa teinte

**Reason**: L'anneau disparaît. Le plat principal se présente sur l'aplat plein de sa famille, et la semaine sur une tuile pleine : la couleur de famille ne trace plus de contour sur sa teinte pâle.

**Migration**: Remplacée par « Le texte posé sur une famille tient son contraste », qui mesure le texte posé sur l'aplat et impose que l'illustration repose sur la teinte pâle.
