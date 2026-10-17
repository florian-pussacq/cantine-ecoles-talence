## REMOVED Requirements

### Requirement: Portée de l'illustration à l'écran

**Raison :** l'illustration cesse d'être un marqueur de rang pour devenir un repère de balayage,
porté par chaque carte (D51). La règle « deux éléments d'un même écran ne portent pas la même
illustration » devient inapplicable : « Pain » et « Panibuns aux fromages » relèvent tous deux de
`ill-pain` et coexistent le même jour.

Cette exigence est introduite par le change `enseigne-et-ardoise`, qui n'est pas encore archivé :
cette suppression ne s'applique donc qu'après l'intégration de ce dernier à la ligne de base.

**Migration :** aucune donnée n'est concernée. Ce que la règle protégeait — qu'aucune information
ne repose sur l'illustration — reste garanti par l'exigence **Rôle décoratif de l'illustration**,
qui n'est pas modifiée.

## ADDED Requirements

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
