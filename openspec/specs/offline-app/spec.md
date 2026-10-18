# Offline App Specification

## Purpose

Garder l'application installable, légère et consultable sans réseau, et dire de quand datent les menus qu'elle montre.

## Requirements

### Requirement: Fonctionnement hors ligne complet

Après une première visite réussie, le système SHALL rester pleinement fonctionnel sans réseau : consultation du jour, de la semaine, des réglages et des mentions.

#### Scenario: Ouverture hors ligne après une première visite
- **WHEN** l'utilisateur ouvre l'application sans réseau après une visite réussie
- **THEN** les écrans de consultation s'affichent avec les données mises en cache

#### Scenario: Perte de réseau en cours d'utilisation
- **WHEN** le réseau devient indisponible pendant l'utilisation
- **THEN** la navigation entre jours et écrans continue de fonctionner sans erreur

#### Scenario: Première ouverture sans réseau
- **WHEN** l'utilisateur ouvre l'application pour la première fois sans réseau
- **THEN** un message explicite indique qu'une première connexion est nécessaire, plutôt qu'un écran vide ou une erreur technique

### Requirement: Stratégies de cache du service worker

Le système SHALL enregistrer un service worker appliquant une stratégie *cache-first* à la coque applicative et *stale-while-revalidate* aux fichiers de données.

Le cache SHALL être versionné par build, et les caches obsolètes SHALL être supprimés à l'activation d'une nouvelle version.

#### Scenario: Données servies puis rafraîchies
- **WHEN** l'application démarre avec réseau et des données en cache
- **THEN** les données en cache sont affichées immédiatement, puis actualisées en arrière-plan si la source a changé

#### Scenario: Purge après déploiement
- **WHEN** une nouvelle version de l'application s'active
- **THEN** les caches des versions précédentes sont supprimés et la nouvelle coque applicative est servie

#### Scenario: Mise à jour disponible
- **WHEN** une nouvelle version est détectée alors que l'application est ouverte
- **THEN** l'utilisateur peut l'appliquer sans perdre son contexte de consultation

### Requirement: Installabilité PWA

Le système SHALL fournir un manifeste d'application web et les icônes nécessaires pour permettre l'installation sur l'écran d'accueil, en affichage autonome, avec la langue déclarée à `fr`.

#### Scenario: Installation sur écran d'accueil
- **WHEN** l'utilisateur installe l'application depuis son navigateur
- **THEN** elle se lance en affichage autonome avec son icône et son nom propres

#### Scenario: Nom non trompeur
- **WHEN** l'application est installée
- **THEN** son nom et son icône ne reprennent ni le logo ni la charte de la Ville de Talence

### Requirement: Affichage de la fraîcheur des données

Le système SHALL afficher la date de mise à jour des données consultées. Si la date de génération du manifeste remonte à plus de 48 heures, le système SHALL afficher un avertissement discret.

#### Scenario: Données récentes
- **WHEN** le manifeste a été généré il y a moins de 48 heures
- **THEN** la date de mise à jour est affichée sans avertissement particulier

#### Scenario: Données périmées
- **WHEN** le manifeste a été généré il y a plus de 48 heures
- **THEN** un avertissement discret signale que les données peuvent ne plus être à jour et renvoie vers le PDF officiel

### Requirement: Budgets de performance

Le JavaScript que charge chaque page SHALL rester sous 60 Ko compressés, et son premier chargement — son document, ses feuilles de style et son JavaScript — sous 150 Ko transférés. L'ensemble du JavaScript que le service worker précharge pour le hors-ligne SHALL rester sous 80 Ko compressés. Le passage d'un jour à l'autre SHALL s'effectuer en moins de 100 ms.

Le JavaScript d'une page SHALL être mesuré sur ce que le build produit : les modules que la page charge et leurs imports statiques, à l'exclusion des modules que l'application ne charge qu'à la demande.

Le dépassement d'un budget SHALL faire échouer la construction du projet.

#### Scenario: Budget dépassé au build
- **WHEN** une modification porte le JavaScript compressé d'une page au-delà de 60 Ko
- **THEN** la construction échoue en nommant la page et ses modules les plus lourds

#### Scenario: Code chargé à la demande
- **WHEN** une page n'importe un module qu'à la demande, à l'ouverture d'un élément
- **THEN** ce module ne compte pas dans le JavaScript de la page, et compte dans le JavaScript préchargé

#### Scenario: Somme préchargée dépassée
- **WHEN** l'ensemble du JavaScript émis dépasse 80 Ko compressés
- **THEN** la construction échoue en nommant ce budget

#### Scenario: Aucune ressource tierce
- **WHEN** l'application se charge
- **THEN** aucune police, aucun script et aucune ressource n'est requis depuis un domaine tiers
