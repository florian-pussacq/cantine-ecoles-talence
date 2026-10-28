## MODIFIED Requirements

### Requirement: Budgets de performance

Le JavaScript que charge chaque page SHALL rester sous 60 Ko compressés, et son premier chargement — son document, ses feuilles de style et son JavaScript — sous 150 Ko transférés. L'ensemble du JavaScript que le service worker précharge pour le hors-ligne SHALL rester sous 80 Ko compressés. Les fichiers de police que l'application sert SHALL rester, ensemble, sous 40 Ko. Le passage d'un jour à l'autre SHALL s'effectuer en moins de 100 ms.

Le JavaScript d'une page SHALL être mesuré sur ce que le build produit : les modules que la page charge et leurs imports statiques, à l'exclusion des modules que l'application ne charge qu'à la demande.

Le dépassement d'un budget SHALL faire échouer la construction du projet.

#### Scenario: Budget dépassé au build
- **WHEN** une modification porte le JavaScript compressé d'une page au-delà de 60 Ko
- **THEN** la construction échoue en nommant la page et ses modules les plus lourds

#### Scenario: Code chargé à la demande
- **WHEN** une page n'importe un module qu'à la demande, à l'ouverture d'un élément
- **THEN** ce module ne compte pas dans le JavaScript de la page, et compte dans le JavaScript préchargé

#### Scenario: Somme préchargée dépassée
- **WHEN** l'ensemble du JavaScript émis dépasse 80 Ko compressés
- **THEN** la construction échoue en nommant ce budget

#### Scenario: Aucune ressource tierce
- **WHEN** l'application se charge
- **THEN** aucune police, aucun script et aucune ressource n'est requis depuis un domaine tiers

#### Scenario: Budget de polices dépassé
- **WHEN** l'ajout d'une graisse ou d'un sous-ensemble porte les fichiers de police au-delà de 40 Ko
- **THEN** la construction échoue en nommant ce budget et chaque fichier de police avec son poids
