## MODIFIED Requirements

### Requirement: Déduction de la famille du plat

Le système SHALL déduire la famille d'un plat principal (viande, volaille, poisson, végétarien) à partir de son libellé, par la même table de mots-clés que l'illustration. La famille NE SHALL PAS être lue depuis les données publiées.

Lorsque aucun mot-clé ne correspond, le système SHALL présenter le plat sans aucune couleur de famille, de façon visuellement distincte de toutes les familles. Le système NE SHALL PAS retenir la famille la plus approchante.

La famille NE SHALL PAS porter d'information relative aux allergènes.

#### Scenario: Famille reconnue
- **WHEN** un plat principal s'intitule « Filet de colin sauce citron »
- **THEN** la famille poisson est retenue et sa couleur est appliquée

#### Scenario: Famille non reconnue
- **WHEN** un plat principal porte un libellé qu'aucun mot-clé ne couvre, comme « Gumbo de Tiana »
- **THEN** aucune couleur de famille n'est appliquée, sans qu'une famille soit devinée

#### Scenario: Famille variable d'une cuisine à l'autre
- **WHEN** un plat principal s'intitule « Escalope viennoise », servie de veau ou de dinde selon la cuisine
- **THEN** aucune famille n'est retenue

#### Scenario: Le libellé contredit le plat
- **WHEN** un plat principal s'intitule « Moussaka végétarienne »
- **THEN** la famille végétarienne est retenue, et non celle de la moussaka

#### Scenario: Correction rétroactive
- **WHEN** un mot-clé est ajouté à la table
- **THEN** tous les mois déjà publiés bénéficient de la correction sans être régénérés
