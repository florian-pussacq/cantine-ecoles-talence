# Dish Illustration Specification

## Purpose

Donner à chaque plat une illustration déduite de son libellé, qui aide à lire le menu sans jamais en affirmer davantage que le document source.

## Requirements

### Requirement: Bibliothèque d'illustrations par famille d'aliment

Le système SHALL embarquer une bibliothèque d'illustrations vectorielles couvrant les familles d'aliments présentes dans les menus scolaires. Les illustrations SHALL être intégrées au document, sans requête vers un domaine tiers ni police iconographique.

Les illustrations SHALL rester lisibles à leur plus petite taille d'affichage comme à leur plus grande, et NE SHALL PAS reposer sur des traits fins.

La bibliothèque SHALL être assez fine pour que deux plats couramment servis le même jour se distinguent à l'écran. Sa résolution SHALL être établie sur le corpus réellement publié et non sur une nomenclature théorique : une famille qui porte une part disproportionnée des libellés SHALL être éclatée.

La bibliothèque NE SHALL PAS comporter un dessin par plat nommé. La majorité des libellés n'apparaissant qu'une seule fois, un tel dessin ne resservirait pas.

Le coût d'une illustration supplémentaire NE SHALL PAS peser sur le budget de JavaScript. La bibliothèque SHALL être livrée par un chemin qui la porte une seule fois, faute de quoi son propre poids finit par interdire de l'enrichir.

#### Scenario: Aucune requête externe
- **WHEN** un écran affichant des illustrations se charge
- **THEN** aucune requête réseau n'est émise pour les obtenir

#### Scenario: Lisibilité aux deux extrémités de l'échelle
- **WHEN** une illustration est rendue à sa plus petite et à sa plus grande taille d'affichage
- **THEN** son sujet reste identifiable dans les deux cas

#### Scenario: Deux plats voisins se distinguent
- **WHEN** un même jour sert une salade composée et un légume cuit
- **THEN** les deux plats ne portent pas le même dessin

#### Scenario: La bibliothèque ne grève pas le JavaScript
- **WHEN** une illustration est ajoutée à la bibliothèque
- **THEN** le poids du JavaScript livré au navigateur est inchangé

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

Le retrait d'une illustration d'un élément NE SHALL PAS retirer d'information de l'écran : le libellé et le rôle SHALL suffire à identifier tout plat.

Le relief éventuel d'une illustration SHALL être un ornement posé sur une forme qui se lit sans lui. La forme NE SHALL PAS être portée par un dégradé, une ombre ou un filtre.

#### Scenario: Restitution par un lecteur d'écran
- **WHEN** un écran de menu est parcouru par un lecteur d'écran
- **THEN** les illustrations ne sont pas annoncées et le menu reste intégralement compréhensible

#### Scenario: Illustrations non rendues
- **WHEN** les illustrations ne sont pas rendues
- **THEN** chaque plat reste identifiable par son libellé et son rôle

#### Scenario: Relief non rendu
- **WHEN** les effets de relief ne sont pas rendus
- **THEN** chaque illustration reste identifiable par ses seuls aplats

#### Scenario: Rôle privé d'illustration
- **WHEN** un rôle cesse d'être illustré
- **THEN** aucune information disponible auparavant ne disparaît de l'écran

### Requirement: Illustration de chaque plat

Chaque plat affiché sur l'écran du jour SHALL porter l'illustration déduite de son libellé.

Deux plats d'un même écran MAY porter la même illustration lorsque leurs libellés relèvent de la
même famille. Le système NE SHALL PAS tenter de les différencier.

Un rôle sans plat publié NE SHALL PAS porter d'illustration : il n'y a pas de libellé d'où la
déduire, et l'illustration de repli signalerait une donnée là où il n'y en a pas.

L'illustration NE SHALL PAS être une photographie : le système NE SHALL PAS charger d'image
depuis le réseau pour représenter un plat.

#### Scenario: Chaque plat porte son illustration
- **WHEN** l'écran du jour affiche un jour dont tous les rôles sont publiés
- **THEN** chaque carte porte une illustration déduite du libellé de son plat

#### Scenario: Deux plats de même famille
- **WHEN** l'entrée et l'accompagnement d'un même jour relèvent tous deux de la famille des légumes
- **THEN** les deux cartes portent la même illustration, sans que le système la remplace

#### Scenario: Rôle absent
- **WHEN** un rôle ne comporte aucun plat publié
- **THEN** sa carte ne porte aucune illustration

#### Scenario: Aucune requête d'image
- **WHEN** un écran de menu est chargé
- **THEN** aucune requête réseau n'est émise pour représenter un plat
