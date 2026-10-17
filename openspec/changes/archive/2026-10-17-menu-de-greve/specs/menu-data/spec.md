## ADDED Requirements

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
