## MODIFIED Requirements

### Requirement: Bibliothèque d'illustrations par famille d'aliment

Le système SHALL embarquer une bibliothèque d'illustrations vectorielles couvrant les familles d'aliments présentes dans les menus scolaires. Les illustrations SHALL être intégrées au document, sans requête vers un domaine tiers ni police iconographique.

Les illustrations SHALL rester lisibles à leur plus petite taille d'affichage comme à leur plus grande, et NE SHALL PAS reposer sur des traits fins.

Les illustrations SHALL partager une seule grammaire de dessin, écrite à côté d'elles, de sorte qu'une illustration ajoutée se reconnaisse comme appartenant à la série. Chaque illustration SHALL rester identifiable sur le fond et sur le disque de chaque famille, dans la palette claire comme dans la palette sombre, sans dessin propre à une palette.

La bibliothèque SHALL être assez fine pour que deux plats couramment servis le même jour se distinguent à l'écran. Sa résolution SHALL être établie sur le corpus réellement publié et non sur une nomenclature théorique : une famille qui porte une part disproportionnée des libellés SHALL être éclatée.

La bibliothèque NE SHALL PAS comporter un dessin par plat nommé. La majorité des libellés n'apparaissant qu'une seule fois, un tel dessin ne resservirait pas.

Le coût d'une illustration supplémentaire NE SHALL PAS peser sur le budget de JavaScript. La bibliothèque SHALL être livrée par un chemin qui la porte une seule fois, faute de quoi son propre poids finit par interdire de l'enrichir.

#### Scenario: Aucune requête externe
- **WHEN** un écran affichant des illustrations se charge
- **THEN** aucune requête réseau n'est émise pour les obtenir

#### Scenario: Lisibilité aux deux extrémités de l'échelle
- **WHEN** une illustration est rendue à sa plus petite et à sa plus grande taille d'affichage
- **THEN** son sujet reste identifiable dans les deux cas

#### Scenario: Lisibilité dans les deux palettes
- **WHEN** une illustration est rendue sur le fond, puis sur le disque de sa famille, en palette claire puis en palette sombre
- **THEN** son sujet reste identifiable sur chacune de ces surfaces, avec le même dessin

#### Scenario: Une seule série
- **WHEN** une illustration est ajoutée à la bibliothèque
- **THEN** elle suit la grammaire de dessin écrite avec la bibliothèque

#### Scenario: Deux plats voisins se distinguent
- **WHEN** un même jour sert une salade composée et un légume cuit
- **THEN** les deux plats ne portent pas le même dessin

#### Scenario: La bibliothèque ne grève pas le JavaScript
- **WHEN** une illustration est ajoutée à la bibliothèque
- **THEN** le poids du JavaScript livré au navigateur est inchangé
