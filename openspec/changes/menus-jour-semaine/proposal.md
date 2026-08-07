## Why

Savoir ce que mange son enfant à la cantine de Talence exige aujourd'hui d'ouvrir une page municipale, trouver le bon PDF parmi neuf, télécharger 4,3 Mo, et zoomer sur une grille A3 illisible en mobile — chaque jour, parce qu'un PDF ne se mémorise pas. L'app officielle « Qui Dit Miam » couvre le besoin mais est jugée obsolète et peu pratique sur Android.

Ce premier change livre le cœur consommable du produit : **l'écran du jour lisible en moins de 300 ms, hors ligne, sans compte**. Il est délibérément alimenté par un JSON saisi à la main plutôt que par le parser PDF — cela débloque le travail d'UI immédiatement, et la saisie manuelle du premier mois devient le premier fixture golden du futur parser. Le même effort paie deux fois.

## What Changes

- Mise en place d'une PWA **SvelteKit + `adapter-static`**, déployée en fichiers statiques (GitHub Pages), sans aucun backend.
- Publication du **schéma JSON des menus** (`schemaVersion: 1`) comme contrat versionné entre producteur et consommateur — le producteur de ce change est un humain, le producteur suivant sera le parser.
- Saisie manuelle d'**un mois de menus réels** (juin 2026) conforme au schéma, commité comme donnée *et* comme fixture.
- Écran **Aujourd'hui** : date, thème éventuel, plats disposés en grille compartimentée façon plateau, illustration par plat, allergènes sélectionnés mis en évidence. Navigation jour précédent / suivant.
- Écran **Semaine** : les cinq jours ouvrés, lecture compacte.
- **Filtre allergènes** local : un jeu unique d'allergènes à signaler, stocké exclusivement en `localStorage`. Ni prénom, ni profils multiples — un réglage, pas une identité. Aucune donnée utilisateur ne quitte l'appareil.
- **Bibliothèque d'illustrations** vectorielles inline, une par famille d'aliment, associées aux plats par mots-clés sur le libellé, avec un dessin de repli quand aucune famille ne correspond.
- **Offline complet** : service worker, app shell en cache-first, données en stale-while-revalidate. Fonctionnel à 100 % après la première visite.
- Affichage de la **date de mise à jour de la source** et lien vers le PDF officiel (obligation CRPA + traçabilité).
- Écran **À propos** : source, disclaimer « seul le document officiel fait foi », mention explicite de non-affiliation à la Ville, lien vers l'app officielle.

Hors périmètre de ce change, explicitement : le parser PDF, le job d'ingestion, la vue Mois, les notifications, le flux iCal, la variante sans porc, le calendrier scolaire. Aucune décision ici ne doit les interdire.

## Capabilities

### New Capabilities

- `menu-data`: Schéma JSON versionné des menus (mois, jours, plats, rôles, allergènes, labels qualité, provenance et fraîcheur de la source), chargement côté client, et résolution déterministe du « jour à afficher » (jour ouvré courant, ou prochain jour servi si week-end / vacances / mois non publié).
- `menu-browsing`: Consultation des menus — écran Aujourd'hui, écran Semaine, navigation entre jours, affichage des états limites (week-end, vacances, jour non publié, données de confiance faible).
- `allergen-filter`: Réglage local du jeu d'allergènes à signaler, et mise en évidence des plats concernés dans les écrans de consultation. Persistance `localStorage` uniquement, sans nom ni notion d'utilisateur.
- `dish-illustration`: Association d'une illustration vectorielle à un plat à partir de son libellé, et comportement de repli lorsque aucune famille d'aliment ne correspond.
- `offline-app`: Installabilité PWA, stratégie de cache du service worker, comportement au premier lancement hors ligne, et affichage de la fraîcheur des données.

### Modified Capabilities

Aucune — premier change du projet, `openspec/specs/` est vide.

## Impact

- **Nouveau code** : arborescence SvelteKit complète (aucun code applicatif n'existe aujourd'hui, le dépôt ne contient que le PRD et la configuration agents).
- **Nouvelles dépendances** : `svelte`, `@sveltejs/kit`, `@sveltejs/adapter-static`, `vite`, `typescript`, `vitest`, `@playwright/test`. Budget à tenir : < 60 Ko JS gzip, < 150 Ko au premier chargement (PRD §8).
- **Nouvelles données versionnées** : `static/data/index.json` et `static/data/2026-06.json`, qui serviront aussi de fixtures de test.
- **Contrat inter-composants** : le JSON Schema publié devient la frontière que le futur parser Python devra respecter. Le figer correctement ici est le principal enjeu de conception de ce change.
- **Déploiement** : GitHub Actions → GitHub Pages. Ne nécessite pas de dépôt distant pour développer, seulement pour publier.
- **Conformité** : cible RGAA / WCAG 2.1 AA dès le départ (moins cher que de rattraper). Zéro tracking, zéro cookie, zéro CDN tiers, zéro Google Font.
- **Risque produit assumé** : une donnée allergène fausse a des conséquences médicales. Le disclaimer et le rappel du document officiel ne sont pas décoratifs.
