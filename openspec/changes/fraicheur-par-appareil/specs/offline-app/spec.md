## MODIFIED Requirements

### Requirement: Affichage de la fraîcheur des données

Le système SHALL afficher la date de mise à jour des données consultées. Lorsque le dernier contact réussi de l'appareil avec le serveur remonte à plus de sept jours, le système SHALL afficher un avertissement discret disant que l'appareil n'a pas pu vérifier les menus. Le système NE SHALL PAS afficher cet avertissement en fonction de l'âge du manifeste, ni lorsque aucun contact n'est connu.

#### Scenario: Données récentes
- **WHEN** l'appareil a joint le serveur il y a moins de sept jours, quel que soit l'âge du manifeste
- **THEN** la date de mise à jour est affichée sans avertissement particulier

#### Scenario: Données périmées
- **WHEN** le dernier contact réussi de l'appareil avec le serveur remonte à plus de sept jours
- **THEN** un avertissement discret dit que l'appareil n'a pas pu vérifier les menus depuis ce nombre de jours, et renvoie vers le PDF officiel

#### Scenario: Contact inconnu
- **WHEN** le stockage local est indisponible, ou qu'aucun contact n'a encore réussi
- **THEN** aucun avertissement de fraîcheur n'est affiché
