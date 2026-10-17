# Delivery Specification

## Purpose
Garantir qu'un commit ne part en production qu'après avoir été vérifié, et que cette vérification donne le même résultat quel que soit le jour où elle tourne.

## Requirements

### Requirement: Vérification de chaque poussée sur la production

Toute poussée sur `main`, et toute pull request qui la viserait, SHALL être vérifiée par l'intégration continue avec les contrôles exécutés en local et par Netlify — formatage, lint, types, validité des données, tests unitaires, construction et budgets — ainsi que par les tests de bout en bout.

#### Scenario: Poussée conforme
- **WHEN** des commits sont poussés sur `main` et que tous les contrôles passent
- **THEN** les deux vérifications `verifier` et `e2e` sont rapportées en succès sur le dernier commit poussé

#### Scenario: Test de bout en bout en échec
- **WHEN** un test de bout en bout échoue sur un commit poussé
- **THEN** la vérification `e2e` est rapportée en échec et le rapport Playwright est conservé en artefact

### Requirement: Rien ne part sans vérification locale

Le développement se faisant sur `main`, que Netlify publie à chaque poussée, aucun commit NE SHALL être poussé sans que `npm run validate`, `npm run build` et, pour un commit qui touche l'interface ou les données servies, `npm run test:e2e` aient réussi en local. L'intégration continue sur `main` constate après coup ; elle ne retient pas la publication.

#### Scenario: Commit rouge en local
- **WHEN** une vérification locale échoue sur un commit
- **THEN** ce commit n'est ni créé ni poussé

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
