## MODIFIED Requirements

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
