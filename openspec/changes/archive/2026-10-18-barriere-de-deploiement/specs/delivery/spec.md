## MODIFIED Requirements

### Requirement: Rien ne part sans vérification locale

Le développement se faisant sur `main`, aucun commit NE SHALL être poussé sans que `npm run validate`, `npm run build` et, pour un commit qui touche l'interface ou les données servies, `npm run test:e2e` aient réussi en local. La vérification locale épargne un cycle d'intégration continue ; ce n'est plus elle qui garde la production.

#### Scenario: Commit rouge en local
- **WHEN** une vérification locale échoue sur un commit
- **THEN** ce commit n'est ni créé ni poussé

## ADDED Requirements

### Requirement: La production ne publie qu'un commit vérifié

Une poussée sur `main` NE SHALL PAS publier par elle-même. La publication SHALL être déclenchée par l'intégration continue, une fois `verifier` et `e2e` réussis, et seulement si le commit vérifié est encore la tête de `main`.

#### Scenario: Poussée verte
- **WHEN** des commits poussés sur `main` passent `verifier` et `e2e`, et qu'aucune poussée ne les a suivis
- **THEN** l'intégration continue déclenche la publication, et Netlify publie la tête de `main`

#### Scenario: Poussée rouge
- **WHEN** un commit poussé sur `main` échoue à `e2e`
- **THEN** rien n'est publié, et la production reste sur le dernier commit vérifié

#### Scenario: Poussée dépassée
- **WHEN** une nouvelle poussée arrive sur `main` avant la fin de la vérification de la précédente
- **THEN** seule la plus récente, une fois vérifiée, déclenche la publication
