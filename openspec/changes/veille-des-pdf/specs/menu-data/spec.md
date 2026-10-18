## ADDED Requirements

### Requirement: Veille des documents de la Ville

Le système SHALL comparer chaque jour les PDF de menus publiés sur la page de la Ville aux données publiées, et signaler en échouant chaque action requise : un menu qu'aucune donnée ne cite, un menu cité dont l'empreinte a changé, ou un dernier jour publié à moins de quatorze jours de la date du jour à Paris. Un document republié ailleurs avec la même empreinte SHALL être signalé sans échec.

#### Scenario: Nouveau mois publié
- **WHEN** la page de la Ville liste `02-MENUS-WEB-FEVRIER-2027.pdf` et aucune donnée ne le cite
- **THEN** la veille échoue et nomme le document comme nouveau

#### Scenario: Mois réédité
- **WHEN** la page liste un PDF cité dont l'empreinte diffère de `source.pdfSha256`
- **THEN** la veille échoue et nomme le document comme republié

#### Scenario: Corpus qui s'épuise
- **WHEN** le dernier jour publié est à moins de quatorze jours, et que la page n'apporte rien de nouveau
- **THEN** la veille échoue en disant jusqu'à quand le corpus couvre

#### Scenario: Document déplacé
- **WHEN** un PDF cité est republié à une autre adresse, avec la même empreinte
- **THEN** la veille le signale sans échouer

#### Scenario: Mois passé retiré de la page
- **WHEN** un PDF cité n'est plus listé sur la page
- **THEN** la veille ne signale rien

### Requirement: Une veille qui ne se tait pas par erreur

Une page injoignable, ou qui ne contient aucun lien de menu, SHALL faire échouer la veille, distinctement d'un constat. La veille NE SHALL PAS modifier le dépôt.

#### Scenario: Page refondue
- **WHEN** la page répond sans aucun lien de menu
- **THEN** la veille échoue en disant que la page n'a plus de menus, et non qu'il n'y a rien de nouveau

#### Scenario: Page injoignable
- **WHEN** la page de la Ville ne répond pas
- **THEN** la veille échoue en nommant la panne réseau, sans la présenter comme un constat sur les menus
