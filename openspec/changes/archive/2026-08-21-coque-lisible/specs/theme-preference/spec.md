## ADDED Requirements

### Requirement: Choix du thème

Le système SHALL offrir trois choix de thème : suivre le système, clair, sombre. « Suivre le système » SHALL être la valeur par défaut, appliquée tant qu'aucun choix n'a été exprimé.

Le choix SHALL être présenté sous une forme énonçant chaque option en toutes lettres, et NE SHALL PAS reposer sur la seule couleur pour indiquer l'option retenue.

#### Scenario: Aucun choix exprimé
- **WHEN** l'utilisateur ouvre l'application pour la première fois
- **THEN** le thème suit la préférence de son système, et l'option « suivre le système » est celle indiquée comme retenue

#### Scenario: Thème forcé, préférence système contraire
- **WHEN** l'utilisateur a choisi le thème sombre et que son système est en thème clair
- **THEN** l'application reste en thème sombre

#### Scenario: Retour au suivi du système
- **WHEN** l'utilisateur, après avoir forcé un thème, choisit à nouveau de suivre le système
- **THEN** l'application suit de nouveau la préférence du système, y compris si celle-ci change ensuite

### Requirement: Persistance et application du thème

Le choix SHALL survivre à la fermeture de l'application.

Le thème retenu SHALL être appliqué avant la première peinture : l'application NE SHALL PAS afficher brièvement un thème avant de basculer vers l'autre.

Lorsque le stockage local est indisponible ou refusé, le système SHALL continuer de fonctionner en suivant la préférence du système, sans erreur visible.

#### Scenario: Aucun clignotement au chargement
- **WHEN** l'utilisateur a choisi un thème contraire à celui de son système et recharge la page
- **THEN** la page s'affiche directement dans le thème choisi, sans passer par l'autre

#### Scenario: Stockage local refusé
- **WHEN** le stockage local est indisponible
- **THEN** l'application s'affiche selon la préférence du système et le choix n'est simplement pas retenu

### Requirement: Cohérence du thème avec le navigateur

La couleur annoncée au navigateur pour teinter son interface SHALL correspondre au thème effectivement appliqué, y compris lorsque celui-ci contredit la préférence du système.

#### Scenario: Teinte du navigateur suit le thème forcé
- **WHEN** l'utilisateur force un thème contraire à celui de son système
- **THEN** la couleur annoncée au navigateur est celle du thème forcé

### Requirement: Contraste garanti dans les deux thèmes

Chaque couleur de texte SHALL présenter un rapport de contraste d'au moins 4.5:1 avec la surface qui la porte, dans le thème clair comme dans le thème sombre.

Les valeurs du thème sombre SHALL être définies en un seul endroit, de sorte qu'elles ne puissent pas diverger entre le thème appliqué automatiquement et le thème choisi explicitement.

#### Scenario: Mesure des paires de couleurs
- **WHEN** les couples texte/fond de la palette sont mesurés dans les deux thèmes
- **THEN** chacun atteint au moins 4.5:1

#### Scenario: Absence de divergence entre les deux voies
- **WHEN** le thème sombre est appliqué parce que le système le demande, puis parce que l'utilisateur l'a choisi
- **THEN** les couleurs obtenues sont identiques dans les deux cas
