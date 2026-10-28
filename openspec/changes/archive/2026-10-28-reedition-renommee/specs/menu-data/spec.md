## MODIFIED Requirements

### Requirement: Veille des documents de la Ville

Le système SHALL comparer chaque jour les PDF de menus publiés sur la page de la Ville aux données publiées, et signaler en échouant chaque action requise : un menu qu'aucune donnée ne cite, un menu cité dont l'empreinte a changé, un menu réédité sous le nom d'un document cité augmenté d'un suffixe de doublon, ou un dernier jour publié à moins de quatorze jours de la date du jour à Paris. Une réédition renommée SHALL nommer le document qu'elle remplace et le fichier de données qui le cite. Un document republié ailleurs ou sous un nom suffixé, avec la même empreinte, SHALL être signalé sans échec.

#### Scenario: Nouveau mois publié
- **WHEN** la page de la Ville liste `02-MENUS-WEB-FEVRIER-2027.pdf` et aucune donnée ne le cite
- **THEN** la veille échoue et nomme le document comme nouveau

#### Scenario: Mois réédité
- **WHEN** la page liste un PDF cité dont l'empreinte diffère de `source.pdfSha256`
- **THEN** la veille échoue et nomme le document comme republié

#### Scenario: Mois réédité sous un autre nom
- **WHEN** la page liste `01-MENUS-WEB-JANVIER-2027-1.pdf`, qu'aucune donnée ne cite, et que `static/data/2027-01.json` cite `01-MENUS-WEB-JANVIER-2027.pdf` avec une autre empreinte
- **THEN** la veille échoue, nomme le document comme réédité sous un autre nom, et dit qu'il remplace `01-MENUS-WEB-JANVIER-2027.pdf` dans `static/data/2027-01.json`

#### Scenario: L'année n'est pas un suffixe de doublon
- **WHEN** la page liste `01-MENUS-WEB-JANVIER-2027.pdf` et qu'une donnée cite `01-MENUS-WEB-JANVIER.pdf`
- **THEN** la veille nomme le document comme nouveau

#### Scenario: Corpus qui s'épuise
- **WHEN** le dernier jour publié est à moins de quatorze jours, et que la page n'apporte rien de nouveau
- **THEN** la veille échoue en disant jusqu'à quand le corpus couvre

#### Scenario: Document déplacé
- **WHEN** un PDF cité est republié à une autre adresse ou sous un nom suffixé, avec la même empreinte
- **THEN** la veille le signale sans échouer

#### Scenario: Mois passé retiré de la page
- **WHEN** un PDF cité n'est plus listé sur la page
- **THEN** la veille ne signale rien

## ADDED Requirements

### Requirement: Une réextraction se relit plat par plat

Le dépôt SHALL fournir une comparaison des menus publiés de la copie de travail avec ceux du dernier commit, qui nomme pour chaque jour changé le créneau, l'ancien et le nouveau libellé, les allergènes et les labels qui changent, ainsi que le genre du jour, le thème et sa note. Elle NE SHALL PAS signaler une différence de mise en forme seule.

#### Scenario: Plat remplacé
- **WHEN** une réextraction de novembre change le dessert du 13 de « Dessert maison » en « Cheesecake aux Oreo »
- **THEN** la comparaison écrit une ligne qui nomme le 13 novembre, le dessert, l'ancien et le nouveau libellé

#### Scenario: Allergène ajouté
- **WHEN** l'entrée du 19 novembre gagne l'allergène 14
- **THEN** la comparaison nomme le jour, l'entrée, et l'allergène ajouté

#### Scenario: Fichier reformaté sans changement
- **WHEN** un fichier publié est réécrit avec une autre indentation et les mêmes menus
- **THEN** la comparaison ne signale rien pour ce fichier

#### Scenario: Mois nouveau
- **WHEN** un fichier de menus n'existe pas au dernier commit
- **THEN** la comparaison le dit nouveau, avec son nombre de jours
