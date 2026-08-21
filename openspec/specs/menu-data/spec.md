# Menu Data Specification

## Requirements

### Requirement: Schéma JSON versionné des menus

Le système SHALL publier les menus sous forme de fichiers JSON statiques, un par mois, conformes à un schéma portant un champ `schemaVersion` entier. Chaque fichier mensuel SHALL contenir la période couverte, les métadonnées de source, la légende des allergènes, et la liste des jours.

Chaque jour SHALL porter sa date ISO, sa nature (`school`, `holiday`, `weekend`, `strike-fallback`), un niveau de confiance (`high` ou `low`), et une liste de plats. Chaque plat SHALL porter un rôle (`slot`) parmi `pain`, `entree`, `plat`, `accompagnement`, `laitage`, `dessert`, `gouter`, un libellé, une liste d'allergènes numériques, et une liste de labels qualité.

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
