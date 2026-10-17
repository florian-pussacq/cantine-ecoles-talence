## MODIFIED Requirements

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
