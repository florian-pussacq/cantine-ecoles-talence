## 1. Socle du projet

- [x] 1.1 Initialiser le projet SvelteKit avec TypeScript et `@sveltejs/adapter-static`, en mode prerender complet
- [x] 1.2 Configurer `base` de manière à supporter un déploiement sous sous-chemin GitHub Pages, et interdire les chemins absolus écrits à la main
- [x] 1.3 Mettre en place Vitest pour les tests unitaires et Playwright pour le test de bout en bout
- [x] 1.4 Ajouter une vérification de budget au build : échec si le JavaScript compressé dépasse 60 Ko ou le premier chargement 150 Ko
- [x] 1.5 Configurer le formatage, le lint et la vérification de types, exécutés en une seule commande

## 2. Contrat de données

- [x] 2.1 Écrire le JSON Schema du fichier mensuel (`schemaVersion` 1) : mois, source, légende des allergènes, jours, plats, rôles, allergènes, labels, `confidence`
- [x] 2.2 Déclarer `revision` et `changedAt` dans le schéma en les documentant comme réservés au futur pipeline, sans les consommer
- [x] 2.3 Écrire le JSON Schema du manifeste `index.json` : mois disponibles, empreinte de contenu, date de génération
- [x] 2.4 Dériver les types TypeScript du schéma et vérifier au build qu'ils ne divergent pas
- [x] 2.5 Documenter le schéma dans un fichier lisible par le futur auteur du parser Python

## 3. Données de septembre 2026 saisies à la main

- [x] 3.1 Ranger `09-MENUS-WEB-SEPTEMBRE-2026.pdf` sous `sources/pdf/`, versionné et exclu du build
- [x] 3.2 Saisir le mois complet dans `static/data/2026-09.json` : jours ouvrés, rôles, libellés, allergènes, labels qualité, thèmes
- [x] 3.3 Renseigner le bloc source : URL du PDF, empreinte SHA-256, libellé et date de mise à jour
- [x] 3.4 Générer `static/data/index.json` et vérifier la validation des deux fichiers contre leurs schémas
- [x] 3.5 Relire la saisie ligne à ligne contre le PDF, en accordant une attention particulière aux allergènes
- [x] 3.6 Déclarer le couple PDF → sortie attendue comme premier cas golden destiné au futur parser
- [x] 3.7 Construire un second fixture synthétique portant des cas limites : jour sans entrée, jour sans accompagnement, jour `confidence: low`, jour `holiday`
- [x] 3.8 Recenser les libellés de septembre non couverts par la table de mots-clés, pour alimenter le groupe 5bis

## 4. Chargement et résolution des données

- [x] 4.1 Implémenter le chargement du manifeste puis des mois, avec repli sur le cache en cas d'échec réseau
- [x] 4.2 Refuser un fichier dont `schemaVersion` est supérieur à la version supportée, et afficher le message dédié
- [x] 4.3 Implémenter `resolveDisplayDay(dataset, now)` en fonction pure, sans lecture de l'horloge
- [x] 4.4 Implémenter la navigation vers le jour servi précédent et suivant, en sautant les jours non servis
- [x] 4.5 Implémenter l'ordre de priorité entre sources : événementiel, transition, mensuel ; le menu de grève n'étant jamais sélectionné automatiquement
- [x] 4.6 Couvrir par des tests unitaires les états limites : week-end, vacances, fin de mois publié, mois absent, bornes du jeu de données

## 5. Direction visuelle

- [x] 5.1 Arrêter la direction visuelle sur maquettes — palette Réfectoire, encodage gommette (D15)
- [x] 5.2 Traduire la palette Réfectoire en CSS custom properties : cinq familles avec teinte pleine, teinte pâle et couleur de texte associée
- [x] 5.3 Définir l'échelle typographique et l'échelle d'espacement en jetons
- [x] 5.4 Décliner les jetons en thème sombre via `prefers-color-scheme`, sans bascule manuelle
- [x] 5.5 Vérifier les rapports de contraste sur les deux thèmes, y compris l'inversion de polarité de la volaille et les états de signalement d'allergène
- [x] 5.6 Choisir et auto-héberger la police, sans requête vers un domaine tiers

## 5bis. Bibliothèque d'illustrations

- [x] 5b.1 Recenser les familles d'aliments à partir d'une année de menus réels et arrêter la liste des dessins à produire
- [x] 5b.2 Dessiner les illustrations en SVG, dans un style cohérent, lisibles de la plus petite à la plus grande taille d'affichage
- [ ] 5b.3 Dessiner l'illustration de repli et les pictogrammes des quatorze allergènes
- [x] 5b.4 Implémenter l'association libellé → famille en fonction pure, insensible à la casse et aux accents, avec règle de spécificité documentée
- [x] 5b.5 Implémenter le repli et recenser les libellés non reconnus de manière consultable
- [x] 5b.6 Marquer les illustrations comme décoratives et vérifier que le menu reste compréhensible sans elles
- [x] 5b.7 Mesurer le poids de la bibliothèque, brut et compressé, contre le budget de 150 Ko

## 6. Écran Aujourd'hui

- [x] 6.1 Construire la grille compartimentée : alvéoles dimensionnées par rôle, alvéole principale pleine largeur
- [x] 6.2 Appliquer la couleur de famille à l'alvéole du plat principal, avec une teinte de repli honnête pour les plats inclassables
- [x] 6.3 Traiter le cas du jour à rôle manquant selon l'arbitrage « creux vide ou grille réorganisée »
- [x] 6.4 Placer le goûter hors du plateau, sous une séparation
- [x] 6.5 Afficher le surtitre de date (« Aujourd'hui » / « Prochain service · dans N jours ») au-dessus de la date, plus le thème et la note éditoriale du jour
- [x] 6.6 Implémenter la navigation entre jours au clavier et par commande visible, avec focus visible
- [ ] 6.7 Ajouter le balayage horizontal et la transition associée, désactivée sous `prefers-reduced-motion`
- [x] 6.8 Implémenter le détail des allergènes d'un plat en libellés clairs, avec le cas « aucun allergène déclaré »
- [x] 6.9 Afficher la bannière de confiance faible et son renvoi vers le PDF officiel
- [x] 6.10 Afficher les mentions de source et de date de mise à jour accessibles depuis l'écran
- [x] 6.11 Vérifier l'absence de squelette et d'indicateur de chargement lorsque les données sont en cache

## 7. Écran Semaine

- [x] 7.1 Construire la liste des cinq jours ouvrés, une ligne par jour, avec le disque de famille et le plat principal
- [x] 7.2 Placer jour et numéro en tête de ligne, en encre pleine
- [x] 7.3 Marquer le jour courant par quatre signaux dont aucun n'est chromatique
- [x] 7.4 Rendre chaque jour actionnable vers l'écran Aujourd'hui correspondant
- [x] 7.5 Distinguer visuellement un jour non publié d'un jour sans école
- [x] 7.6 Reporter le signalement d'allergène sur cette vue
- [x] 7.7 Dessiner les états vacances scolaires, jour férié et semaine non publiée

## 8. Filtre allergènes

- [x] 8.1 Implémenter la persistance du jeu d'allergènes en `localStorage`, avec dégradation silencieuse si le stockage est indisponible
- [x] 8.2 Construire l'écran de réglage : les quatorze allergènes en libellés clairs, cibles tactiles d'au moins 44 pixels
- [x] 8.3 Implémenter le signalement des plats concernés, doublé d'un libellé textuel et d'une marque non chromatique
- [x] 8.4 Restituer le signalement aux lecteurs d'écran et vérifier sa lisibilité en niveaux de gris
- [x] 8.5 Traiter le cas « sélection vide » sans invitation insistante à en configurer une
- [x] 8.6 Informer l'utilisateur si l'enregistrement est impossible faute de stockage

## 9. Hors ligne et installabilité

- [x] 9.1 Implémenter le service worker : cache-first sur la coque, stale-while-revalidate sur les données
- [x] 9.2 Versionner le cache par build et purger les caches obsolètes à l'activation
- [x] 9.3 Proposer l'application d'une nouvelle version sans perte du contexte de consultation
- [x] 9.4 Gérer la première ouverture hors ligne par un message explicite
- [x] 9.5 Écrire le manifeste PWA et produire les icônes, sans reprendre le logo ni la charte de la Ville
- [x] 9.6 Afficher l'avertissement de fraîcheur au-delà de 48 heures depuis la génération du manifeste

## 10. Écran À propos

- [x] 10.1 Rédiger et afficher la source, la date de mise à jour et le lien vers le PDF officiel
- [x] 10.2 Afficher l'avertissement non masquable « seul le document officiel de la Ville fait foi »
- [x] 10.3 Afficher la mention de non-affiliation et le lien vers l'application officielle
- [x] 10.4 Documenter l'absence de suivi, de cookie et de ressource tierce
- [x] 10.5 Documenter la limitation d'installation sur iOS

## 11. Vérification

- [x] 11.1 Écrire les tests de rendu couvrant chaque état limite de la spécification
- [x] 11.2 Écrire le test de bout en bout : ouvrir, voir aujourd'hui, passer hors ligne, vérifier que le menu reste visible
- [x] 11.3 Vérifier l'accessibilité au clavier et au lecteur d'écran sur les quatre écrans
- [x] 11.4 Mesurer le LCP en 4G simulée sur profil mobile milieu de gamme et confirmer la tenue des budgets
- [x] 11.5 Vérifier qu'aucune requête n'est émise vers un domaine tiers
- [x] 11.6 Contrôler que les données affichées correspondent exactement au PDF de septembre 2026, allergènes compris

## 12. Déploiement

- [x] 12.1 Écrire le workflow GitHub Actions de construction et de publication sur GitHub Pages
- [x] 12.2 Vérifier le rendu sous sous-chemin, en particulier la résolution des fichiers de données
- [x] 12.3 Ajouter un contrôle post-déploiement vérifiant que le manifeste est bien servi
- [ ] 12.4 Vérifier l'installation et le fonctionnement hors ligne sur un appareil réel
