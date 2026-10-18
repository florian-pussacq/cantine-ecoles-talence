## ADDED Requirements

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
