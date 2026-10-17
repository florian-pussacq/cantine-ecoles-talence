## ADDED Requirements

### Requirement: Vérification de chaque proposition de changement

Toute pull request visant `main` SHALL être vérifiée par l'intégration continue avec les contrôles exécutés en local et par Netlify — formatage, lint, types, validité des données, tests unitaires, construction et budgets — ainsi que par les tests de bout en bout.

#### Scenario: PR conforme
- **WHEN** une pull request est ouverte ou mise à jour et que tous les contrôles passent
- **THEN** les deux vérifications `verifier` et `e2e` sont rapportées en succès sur son dernier commit

#### Scenario: Test de bout en bout en échec
- **WHEN** un test de bout en bout échoue sur une pull request
- **THEN** la vérification `e2e` est rapportée en échec et le rapport Playwright est conservé en artefact

### Requirement: La production ne reçoit qu'un commit vérifié

La branche `main`, que Netlify publie, SHALL n'accepter que des commits dont les vérifications `verifier` et `e2e` ont réussi, et NE SHALL PAS accepter de poussée directe.

#### Scenario: Fusion d'une PR rouge
- **WHEN** une pull request porte une vérification en échec
- **THEN** sa fusion dans `main` est refusée

### Requirement: Des vérifications indépendantes du jour d'exécution

Le résultat des tests de bout en bout NE SHALL PAS dépendre de la date à laquelle ils sont exécutés. Un test qui suppose un jour servi SHALL fixer l'horloge du navigateur sur une date du corpus publié.

#### Scenario: Corpus épuisé à la date d'exécution
- **WHEN** les tests de bout en bout tournent à une date postérieure au dernier jour publié
- **THEN** leur résultat est le même qu'à une date couverte par le corpus

### Requirement: Une seule déclaration de la version de Node

La version de Node SHALL être déclarée dans `.nvmrc` seulement, et lue de là par l'intégration continue comme par Netlify.

#### Scenario: Montée de version de Node
- **WHEN** `.nvmrc` change de version
- **THEN** l'intégration continue et Netlify construisent avec la nouvelle version sans autre modification
