## ADDED Requirements

### Requirement: Les données publiées se reproduisent depuis leur PDF

Chaque fichier de menus publié SHALL être reproductible à l'identique en rejouant l'extracteur sur le PDF qu'il cite dans `source.pdfUrl`, conservé dans `sources/pdf/`, à la seule exception de l'horodatage d'extraction `source.fetchedAt`. Chaque PDF conservé SHALL être cité par un fichier publié. L'extracteur SHALL écrire sur sa sortie standard un document JSON valide et rien d'autre. Sa dépendance de lecture des PDF SHALL être déclarée dans le dépôt, en version exacte.

#### Scenario: Retouche du parser qui change un mois publié
- **WHEN** une modification de l'extracteur change l'attribution d'un plat dans un mois déjà publié
- **THEN** la vérification de reproduction échoue et nomme le fichier publié qui diverge

#### Scenario: PDF remplacé sans réextraction
- **WHEN** un PDF de `sources/pdf/` est remplacé par une nouvelle version sans que ses données soient réextraites
- **THEN** la vérification échoue, l'empreinte du document ne correspondant plus

#### Scenario: PDF conservé sans données
- **WHEN** `sources/pdf/` contient un PDF qu'aucun fichier publié ne cite
- **THEN** la vérification échoue et nomme le PDF

#### Scenario: Sortie standard polluée
- **WHEN** la bibliothèque de lecture écrit un avertissement sur la sortie standard
- **THEN** la vérification échoue, le document lu n'étant pas un JSON valide
