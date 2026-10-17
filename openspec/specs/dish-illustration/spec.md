# Dish Illustration Specification

## Purpose

Donner à chaque plat une illustration déduite de son libellé, qui aide à lire le menu sans jamais en affirmer davantage que le document source.

## Requirements

### Requirement: Bibliothèque d'illustrations par famille d'aliment

Le système SHALL embarquer une bibliothèque d'illustrations vectorielles couvrant les familles d'aliments présentes dans les menus scolaires. Les illustrations SHALL être intégrées au document, sans requête vers un domaine tiers ni police iconographique.

Les illustrations SHALL rester lisibles à leur plus petite taille d'affichage comme à leur plus grande, et NE SHALL PAS reposer sur des traits fins.

#### Scenario: Aucune requête externe
- **WHEN** un écran affichant des illustrations se charge
- **THEN** aucune requête réseau n'est émise pour les obtenir

#### Scenario: Lisibilité aux deux extrémités de l'échelle
- **WHEN** une illustration est rendue à sa plus petite et à sa plus grande taille d'affichage
- **THEN** son sujet reste identifiable dans les deux cas

### Requirement: Association d'une illustration à un plat

Le système SHALL associer une illustration à un plat à partir de mots-clés reconnus dans son libellé. L'association SHALL être une fonction pure du libellé, sans effet de bord ni dépendance au réseau.

Lorsque plusieurs familles correspondent, le système SHALL retenir la correspondance la plus spécifique de manière déterministe.

#### Scenario: Libellé reconnu
- **WHEN** un plat s'intitule « Paupiette de veau au jus »
- **THEN** l'illustration de la famille viande lui est associée

#### Scenario: Correspondances multiples
- **WHEN** un libellé contient des mots-clés de plusieurs familles, comme « Tarte au fromage blanc »
- **THEN** la famille retenue est toujours la même pour un libellé donné, selon une règle de spécificité documentée

#### Scenario: Insensibilité à la casse et aux accents
- **WHEN** deux libellés ne diffèrent que par la casse ou les accents
- **THEN** ils reçoivent la même illustration

### Requirement: Illustration de repli

Lorsque aucun mot-clé ne correspond, le système SHALL afficher une illustration de repli neutre. L'application NE SHALL PAS afficher d'espace vide ni de contenu cassé, et NE SHALL PAS deviner une famille par approximation.

#### Scenario: Libellé non reconnu
- **WHEN** un plat porte un libellé qu'aucune famille ne couvre
- **THEN** l'illustration de repli est affichée et la mise en page reste inchangée

#### Scenario: Recensement des libellés non reconnus
- **WHEN** des libellés déclenchent le repli
- **THEN** ils sont recensés de manière consultable, afin d'enrichir la bibliothèque

### Requirement: Déduction de la famille du plat

Le système SHALL déduire la famille d'un plat principal (viande, volaille, poisson, végétarien) à partir de son libellé, par la même table de mots-clés que l'illustration. La famille NE SHALL PAS être lue depuis les données publiées.

Lorsque aucun mot-clé ne correspond, le système SHALL appliquer une couleur de repli neutre, visuellement distincte de toutes les familles. Le système NE SHALL PAS retenir la famille la plus approchante.

La famille NE SHALL PAS porter d'information relative aux allergènes.

#### Scenario: Famille reconnue
- **WHEN** un plat principal s'intitule « Filet de colin sauce citron »
- **THEN** la famille poisson est retenue et sa couleur est appliquée

#### Scenario: Famille non reconnue
- **WHEN** un plat principal porte un libellé qu'aucun mot-clé ne couvre, comme « Gumbo de Tiana »
- **THEN** la couleur de repli neutre est appliquée, sans qu'une famille soit devinée

#### Scenario: Correction rétroactive
- **WHEN** un mot-clé est ajouté à la table
- **THEN** tous les mois déjà publiés bénéficient de la correction sans être régénérés

### Requirement: Rôle décoratif de l'illustration

Les illustrations SHALL être traitées comme décoratives par les technologies d'assistance : elles NE SHALL PAS porter d'information absente du texte, et leur absence NE SHALL PAS empêcher la compréhension du menu.

#### Scenario: Restitution par un lecteur d'écran
- **WHEN** un écran de menu est parcouru par un lecteur d'écran
- **THEN** les illustrations ne sont pas annoncées et le menu reste intégralement compréhensible

#### Scenario: Illustrations non rendues
- **WHEN** les illustrations ne sont pas rendues
- **THEN** chaque plat reste identifiable par son libellé et son rôle
