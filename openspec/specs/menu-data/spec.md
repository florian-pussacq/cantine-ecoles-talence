# Menu Data Specification

## Purpose

Définir le contrat des données de menu produites depuis les PDF de la Ville : leur forme, leur traçabilité, et la résolution du jour à afficher.

## Requirements

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

### Requirement: Manifeste des mois disponibles

Le système SHALL publier un manifeste `index.json` listant les mois disponibles, l'empreinte de contenu de chacun, et la date de génération. Le manifeste SHALL être le seul fichier systématiquement retéléchargé au démarrage.

#### Scenario: Découverte des mois publiés
- **WHEN** l'application démarre avec un réseau disponible
- **THEN** elle récupère `index.json` et ne télécharge un fichier mensuel que si son empreinte diffère de celle en cache

#### Scenario: Manifeste inaccessible
- **WHEN** `index.json` ne peut pas être récupéré
- **THEN** l'application utilise le manifeste en cache et reste pleinement fonctionnelle

### Requirement: Traçabilité et fraîcheur de la source

Chaque fichier mensuel SHALL porter l'URL du PDF officiel dont il dérive, son empreinte SHA-256, le libellé de mise à jour tel qu'affiché par la source, et la date de récupération. L'application SHALL afficher la date de mise à jour de la source et proposer un lien vers le PDF officiel.

#### Scenario: Affichage de la provenance
- **WHEN** l'utilisateur consulte un menu
- **THEN** la date de mise à jour de la source et un lien vers le PDF officiel sont accessibles depuis l'écran

#### Scenario: Date de mise à jour absente de la source
- **WHEN** le champ de date de mise à jour est nul
- **THEN** l'application affiche le libellé brut de la source s'il existe, sans inventer de date

### Requirement: Résolution déterministe du jour à afficher

Le système SHALL déterminer le jour à afficher par une fonction pure prenant en paramètres le jeu de données et l'instant courant. Cette fonction NE SHALL PAS lire l'horloge système directement.

Si l'instant courant tombe un jour ouvré présent dans les données, ce jour SHALL être retenu. Sinon, le prochain jour servi disponible SHALL être retenu.

#### Scenario: Jour ouvré courant disponible
- **WHEN** l'instant courant est un mardi présent dans les données avec `kind: school`
- **THEN** ce mardi est le jour affiché

#### Scenario: Week-end
- **WHEN** l'instant courant est un samedi ou un dimanche
- **THEN** le prochain jour servi est affiché, accompagné d'une mention indiquant qu'il ne s'agit pas d'aujourd'hui

#### Scenario: Vacances scolaires
- **WHEN** l'instant courant tombe sur une suite de jours de nature `holiday`
- **THEN** le prochain jour de nature `school` est affiché avec la même mention

#### Scenario: Fin du mois publié
- **WHEN** l'instant courant dépasse le dernier jour du dernier mois publié
- **THEN** l'application indique que le menu n'est pas encore publié et propose le lien vers la source officielle

### Requirement: Ordre de résolution entre sources concurrentes

Lorsque plusieurs fichiers couvrent une même date, le système SHALL appliquer un ordre de priorité déterministe : menu événementiel, puis menu de transition, puis menu mensuel. Le menu de grève NE SHALL JAMAIS être sélectionné automatiquement.

#### Scenario: Date couverte par un mensuel et un fichier de transition
- **WHEN** une date apparaît dans un menu mensuel et dans un menu de transition
- **THEN** la version issue du menu de transition est retenue

#### Scenario: Menu de grève
- **WHEN** un menu de grève est disponible dans les données
- **THEN** il n'est affiché que sur action explicite de l'utilisateur, jamais par substitution automatique

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

### Requirement: Contrat du menu de grève

Le système SHALL publier le menu de grève sous forme d'un fichier JSON statique distinct des fichiers mensuels, conforme à un schéma portant un champ `schemaVersion` entier.

Ce fichier SHALL être indexé par variante de service (`chaud`, `froid`) puis par jour de semaine (`lundi` à `vendredi`), et NE SHALL PAS porter de date. Il SHALL porter les métadonnées de source et la légende des allergènes selon les mêmes règles que les fichiers mensuels.

Chaque plat SHALL porter les mêmes attributs qu'un plat de menu mensuel : un rôle sémantique, un libellé, une liste d'allergènes numériques et une liste de labels qualité.

#### Scenario: Lecture du menu de grève
- **WHEN** l'application charge le fichier de grève dont `schemaVersion` vaut 1
- **THEN** elle expose les dix menus — cinq jours de semaine pour chacune des deux variantes — avec leurs plats, rôles et allergènes

#### Scenario: Variante servant un plat que l'autre ne sert pas
- **WHEN** une variante comporte un plat de rôle `accompagnement` que l'autre ne comporte pas
- **THEN** chaque variante conserve ses plats propres, sans qu'aucun rôle ne se décale

### Requirement: Le menu de grève n'entre pas dans la résolution du jour

Le menu de grève NE SHALL PAS figurer au manifeste des mois disponibles, et NE SHALL JAMAIS être retenu par la résolution du jour à afficher.

L'application ne disposant d'aucune source lui indiquant qu'une grève a lieu, elle NE SHALL PAS substituer le menu de grève à un menu mensuel, ni signaler une grève de sa propre initiative.

#### Scenario: Consultation d'un jour ouvré ordinaire
- **WHEN** l'utilisateur consulte l'écran du jour ou celui de la semaine
- **THEN** aucun plat du menu de grève n'y apparaît, quelle que soit la date

#### Scenario: Fichier de grève présent mais absent du manifeste
- **WHEN** le fichier de grève est publié sous `/data/` sans entrée correspondante au manifeste
- **THEN** le chargement des menus mensuels se déroule normalement et le manifeste reste considéré comme cohérent

### Requirement: Validation et traçabilité du menu de grève

Le fichier de grève SHALL être validé contre son schéma au même titre qu'un fichier mensuel, et SHALL porter l'URL du PDF officiel dont il dérive ainsi que son empreinte SHA-256.

Le système SHALL refuser de publier un fichier de grève ne comportant pas les deux variantes, ou dont un jour ne comporterait aucun plat de rôle `plat`, ou dont un code d'allergène serait absent de la légende.

#### Scenario: Fichier de grève incomplet
- **WHEN** le fichier de grève ne comporte qu'une seule des deux variantes
- **THEN** la validation échoue et la publication est refusée

#### Scenario: Empreinte du PDF de grève
- **WHEN** le PDF officiel de grève est republié par la Ville sous une empreinte différente
- **THEN** la comparaison d'empreinte le signale, le fichier étant par ailleurs stable depuis 2023

### Requirement: Document ne précisant pas les allergènes

Un fichier de menu SHALL pouvoir déclarer, dans ses métadonnées de source, que le document dont il dérive ne précise pas les allergènes de ses plats. En l'absence de cette déclaration, le document SHALL être réputé les préciser.

L'extraction SHALL faire cette déclaration lorsque aucun plat autre que le pain ne porte de code d'allergène. La validation SHALL refuser un fichier qui fait cette déclaration tout en portant un code d'allergène sur un plat autre que le pain.

#### Scenario: Document sans allergènes hors du pain
- **WHEN** l'extraction lit un document dont seuls les pains portent un code d'allergène
- **THEN** le fichier produit déclare que le document ne précise pas les allergènes

#### Scenario: Document qui déclare ses allergènes
- **WHEN** l'extraction lit un document dont des plats autres que le pain portent des codes
- **THEN** le fichier produit ne fait aucune déclaration, et le document est réputé préciser ses allergènes

#### Scenario: Déclaration contradictoire
- **WHEN** un fichier déclare ne pas préciser les allergènes mais porte un code sur un plat principal
- **THEN** la validation échoue et la publication est refusée

### Requirement: Menus de vacances

Le système SHALL publier les menus de vacances de la Ville comme des fichiers de menu datés, conformes au même schéma que les mensuels, portant l'intitulé du document dont ils dérivent.

Le manifeste SHALL les inscrire avec une nature propre et le nom de leur fichier. Lorsqu'un menu de vacances et un mensuel couvrent une même date, la version du menu de vacances SHALL être retenue.

#### Scenario: Deux documents pour un même mois
- **WHEN** octobre 2026 a un mensuel et un menu de vacances
- **THEN** le manifeste inscrit les deux, chacun avec son fichier, et les jours de chacun sont disponibles

#### Scenario: Menu de vacances à cheval sur deux mois
- **WHEN** le menu de Noël couvre du 21 décembre au 1er janvier
- **THEN** il est publié en un seul fichier, et ses jours de janvier sont disponibles comme ceux de décembre

#### Scenario: Version antérieure de l'application
- **WHEN** une version qui ne connaît pas les menus de vacances lit le manifeste
- **THEN** elle les ignore et affiche les mensuels comme auparavant
