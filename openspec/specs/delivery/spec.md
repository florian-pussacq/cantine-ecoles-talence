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

Le développement se faisant sur `main`, aucun commit NE SHALL être poussé sans que `npm run validate`, `npm run build` et, pour un commit qui touche l'interface ou les données servies, `npm run test:e2e` aient réussi en local. La vérification locale épargne un cycle d'intégration continue ; ce n'est plus elle qui garde la production.

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

### Requirement: La production ne publie qu'un commit vérifié

Une poussée sur `main` NE SHALL PAS publier, ni par elle-même ni par l'intégration continue. La publication SHALL être déclenchée par un geste humain explicite, et SHALL être refusée, avec la raison, si les vérifications `verifier` et `e2e` de la tête de `main` ne sont pas en succès.

#### Scenario: Poussée verte
- **WHEN** des commits poussés sur `main` passent `verifier` et `e2e`
- **THEN** rien n'est publié tant que l'humain ne le demande pas ; à sa demande, Netlify publie la tête de `main`

#### Scenario: Poussée rouge
- **WHEN** la publication est demandée alors que `e2e` a échoué sur la tête de `main`
- **THEN** la demande est refusée en nommant la vérification en échec, et la production reste sur le dernier commit publié

#### Scenario: Poussée dépassée
- **WHEN** la publication est demandée alors que la vérification de la tête de `main` est encore en cours
- **THEN** la demande est refusée, et peut être renouvelée une fois la vérification terminée

#### Scenario: Seule l'extraction en échec
- **WHEN** la publication est demandée alors que `verifier` et `e2e` réussissent sur la tête de `main`, et que seule la vérification de l'extraction échoue
- **THEN** Netlify publie la tête de `main`

### Requirement: La reproduction des menus est vérifiée à chaque poussée

La CI SHALL rejouer l'extraction de chaque PDF conservé à chaque poussée, dans un environnement installé depuis la dépendance déclarée. Cette vérification NE SHALL PAS conditionner la publication : l'application sert des données déjà commitées, que l'extracteur ne modifie pas.

#### Scenario: Extracteur cassé
- **WHEN** une poussée rend l'extracteur incapable de reproduire un mois publié
- **THEN** le job d'extraction échoue et le signale, et la publication des données déjà commitées reste possible

#### Scenario: Installation depuis le dépôt
- **WHEN** le job d'extraction prépare son environnement
- **THEN** il installe la bibliothèque de lecture depuis `scripts/requirements.txt`, à la version qui y est déclarée
