# Design Tokens Specification

## Purpose
Garantir que l'apparence de l'application vient d'un seul système de jetons — tailles, rayons, couleurs — et qu'aucun texte ne descend sous son plus petit cran.

## Requirements

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

### Requirement: Aucun texte sous le plus petit cran de l'échelle

Aucun texte de l'application NE SHALL être rendu plus petit que le plus petit cran de l'échelle typographique, et chaque taille de texte SHALL suivre le palier de l'écran large.

#### Scenario: Étiquette de qualité
- **WHEN** une carte affiche la capsule « Bio »
- **THEN** sa taille est celle d'un cran de l'échelle, et elle grandit sur écran large comme les autres textes

### Requirement: L'alerte ne ressemble à aucun plat

La couleur d'alerte SHALL se distinguer perceptiblement de chacune des couleurs de famille de plat. Une vérification automatique SHALL mesurer cet écart sur les valeurs des jetons et échouer en nommant la famille trop proche.

#### Scenario: Famille de la couleur de l'alerte
- **WHEN** une couleur de famille est rendue égale ou très proche de la couleur d'alerte
- **THEN** la vérification échoue et nomme la famille et le jeton d'alerte

#### Scenario: Écran de la semaine un jour de volaille
- **WHEN** l'utilisateur consulte une semaine dont un jour sert de la volaille et qu'un autre ne précise pas ses allergènes
- **THEN** l'anneau de la volaille et l'avertissement ne partagent pas la même couleur

### Requirement: Chaque ton de message tient son contraste

L'encre de chaque ton de message SHALL présenter un contraste d'au moins 4,5:1 avec sa surface. La surface qui marque le jour courant SHALL laisser à chaque texte posé dessus le seuil qu'il tient sur une carte.

#### Scenario: Ton info
- **WHEN** la vérification mesure l'encre info sur la surface info
- **THEN** le contraste atteint au moins 4,5:1

#### Scenario: Texte atténué sur la ligne du jour courant
- **WHEN** la vérification mesure l'encre atténuée sur la teinte du jour courant posée sur une carte
- **THEN** le contraste atteint au moins 4,5:1

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

### Requirement: Deux palettes complètes, mesurées l'une comme l'autre

`tokens.css` SHALL déclarer une palette claire et une palette sombre, celle-ci sous `prefers-color-scheme: dark`. La palette sombre SHALL redéclarer chaque jeton de couleur de la palette claire. Chaque paire et chaque voile dont le contraste est vérifié SHALL l'être dans les deux palettes. Seul `tokens.css` SHALL dépendre de la préférence d'apparence : aucun composant NE SHALL contenir de requête `prefers-color-scheme` ni de sélecteur `data-theme`.

#### Scenario: Jeton oublié dans la palette sombre
- **WHEN** la palette claire déclare `--etiquette` et la palette sombre ne le redéclare pas
- **THEN** la vérification échoue et nomme le jeton

#### Scenario: Paire qui ne tient pas dans le sombre
- **WHEN** l'encre douce sombre ne tient pas 4,5:1 sur la carte sombre
- **THEN** la vérification échoue et nomme la paire et la palette

#### Scenario: Requête de thème dans un composant
- **WHEN** un composant déclare une règle sous `prefers-color-scheme: dark`
- **THEN** la vérification échoue et nomme le composant

### Requirement: La page autonome reprend les jetons

La page servie pour une adresse inconnue, qui ne peut pas lire `tokens.css`, SHALL déclarer les jetons qu'elle emploie sous leur nom et avec leur valeur, dans la palette claire comme dans la sombre. La vérification SHALL refuser une valeur qui diffère de celle de `tokens.css` dans la même palette.

#### Scenario: Palette modifiée sans la page 404
- **WHEN** `tokens.css` change la valeur de `--fond` et que la page 404 garde l'ancienne
- **THEN** la vérification échoue et nomme le jeton et la palette

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
