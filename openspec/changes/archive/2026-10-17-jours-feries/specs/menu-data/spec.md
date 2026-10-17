## MODIFIED Requirements

### Requirement: Schéma JSON versionné des menus

Le système SHALL publier les menus sous forme de fichiers JSON statiques, un par mois, conformes à un schéma portant un champ `schemaVersion` entier. Chaque fichier mensuel SHALL contenir la période couverte, les métadonnées de source, la légende des allergènes, et la liste des jours.

Chaque jour SHALL porter sa date ISO, sa nature (`school`, `holiday`, `public-holiday`, `weekend`, `strike-fallback`), un niveau de confiance (`high` ou `low`), et une liste de plats. Chaque plat SHALL porter un rôle (`slot`) parmi `pain`, `entree`, `plat`, `accompagnement`, `laitage`, `dessert`, `gouter`, un libellé, une liste d'allergènes numériques, et une liste de labels qualité.

La nature `public-holiday` désigne un jour férié : il n'est pas servi et SHALL ne porter aucun plat.

Le rôle d'un plat SHALL être une valeur sémantique explicite et NE SHALL PAS être déduit de sa position dans la liste.

#### Scenario: Chargement d'un mois conforme
- **WHEN** l'application charge un fichier mensuel dont `schemaVersion` vaut 1
- **THEN** elle expose les jours et leurs plats avec leurs rôles, allergènes et labels

#### Scenario: Version de schéma inconnue
- **WHEN** l'application charge un fichier dont `schemaVersion` est supérieur à celui qu'elle sait lire
- **THEN** elle refuse d'interpréter le fichier et affiche un message invitant à mettre à jour l'application, plutôt que d'afficher des données partielles

#### Scenario: Jour sans entrée
- **WHEN** un jour ne comporte aucun plat de rôle `entree`
- **THEN** les autres plats conservent leurs rôles corrects et aucun décalage de rôle ne se produit

#### Scenario: Jour férié dans un mois
- **WHEN** un fichier mensuel comporte un jour de nature `public-holiday`
- **THEN** ce jour est exposé sans plats et n'est jamais compté parmi les jours servis

## ADDED Requirements

### Requirement: Extraction du jour férié

L'extraction SHALL reconnaître une cellule de jour dont le texte entier, normalisé en casse, accents et espaces, vaut « jour férié », et SHALL produire pour cette date un jour de nature `public-holiday`, de confiance haute, sans plats.

Une cellule portant des plats en plus d'une mention de férié NE SHALL PAS être reconnue comme férié : elle SHALL suivre l'extraction ordinaire et ressortir en confiance faible.

#### Scenario: Cellule « JOUR FÉRIÉ »
- **WHEN** la cellule du 11 novembre ne contient que les lignes `JOUR` et `FÉRIÉ`
- **THEN** le jour du 11 novembre est produit en `public-holiday`, confiance haute, sans plats

#### Scenario: Plat dont le libellé contient « férié »
- **WHEN** une cellule porte des plats dont l'un mentionne « férié »
- **THEN** la cellule n'est pas reconnue comme jour férié et ses plats sont extraits normalement

### Requirement: Refus d'un férié lu comme un repas

La validation des données SHALL refuser un jour de nature `school` dont un plat porte le libellé `JOUR` ou `FÉRIÉ`, quel que soit son niveau de confiance.

#### Scenario: Férié mal extrait
- **WHEN** un fichier mensuel comporte un jour `school` dont le plat principal est libellé `JOUR`
- **THEN** la validation échoue et la publication est refusée
