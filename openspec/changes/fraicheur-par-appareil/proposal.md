## Why

L'écran du jour et la semaine affichent « Ces menus n'ont pas été rafraîchis depuis plus de deux jours. Ils peuvent être périmés. » quand `index.json.generatedAt` a plus de 48 heures. Le seuil vient du PRD §9, qui supposait un job d'ingestion quotidien régénérant le manifeste. Ce job n'existe pas : le manifeste ne change qu'à chaque mise à jour des menus, une fois par mois au mieux.

Le manifeste actuel date du 17 octobre 2026 à 20 h 34 UTC. **Le 19 octobre à 20 h 34 UTC, chaque parent verra l'avertissement, et le verra jusqu'à la prochaine extraction, mi-janvier**, alors que les menus sont à jour jusqu'au 29 janvier. Un avertissement permanent apprend à ignorer les bandeaux, y compris l'alerte « allergènes non précisés », qui compte.

Le commentaire d'`isStale` donne deux raisons au seuil. La première, « le job d'ingestion est cassé », est désormais l'affaire de la veille, qui prévient le mainteneur. La seconde, « l'appareil est hors ligne depuis longtemps », reste vraie, mais la date du manifeste ne la mesure pas.

## What Changes

- L'avertissement de fraîcheur ne dépend plus de la date du manifeste, mais du **dernier contact réussi de cet appareil avec le serveur**.
- Il s'affiche quand ce contact remonte à plus de **sept jours**, et le dit : l'appareil n'a pas pu vérifier les menus.
- L'application vérifie la présence d'une nouvelle version à chaque ouverture et à chaque retour au premier plan. Le premier succès de cette vérification date le contact.
- Sans contact connu (stockage indisponible, navigateur sans service worker), pas d'avertissement : on n'affirme pas un retard qu'on ne mesure pas.
- `isStale` disparaît. `generatedAt` reste dans les données et dans l'à-propos, comme date de génération.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `offline-app` : l'exigence « Affichage de la fraîcheur des données » porte sur le contact de l'appareil, et non sur l'âge du manifeste.
- `menu-browsing` : le scénario d'ordre des messages cite l'avertissement de fraîcheur sous sa nouvelle condition.

## Impact

- `src/lib/pwa/update.svelte.ts` : la vérification et la date du dernier contact.
- `src/lib/data/load.ts` : `isStale` remplacé par une fonction pure sur la date de contact.
- `src/routes/+page.svelte`, `src/routes/semaine/+page.svelte` : la condition et le texte du bandeau.
- Tests unitaires et e2e. À pousser avant le 19 octobre, 20 h 34 UTC.
