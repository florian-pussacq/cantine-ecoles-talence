## Context

Les pages sont pré-rendues, et les menus sont cuits dans le HTML au build : à l'hydratation, SvelteKit réutilise les réponses embarquées sans retourner au réseau. Ce qu'un appareil affiche est donc la version de l'application que son service worker a en cache. Un appareil en ligne est tenu à jour : à chaque ouverture, le navigateur revérifie le script du service worker, et une nouvelle version fait paraître « Mise à jour disponible » (`src/lib/pwa/update.svelte.ts`).

Un appareil qui ne joint plus le serveur garde sa version, et ses menus peuvent avoir été republiés entre-temps. C'est le seul cas où « ces menus peuvent être périmés » dit quelque chose de vrai à un parent.

## Goals / Non-Goals

**Goals:**

- Un avertissement qui ne s'allume que lorsqu'il dit vrai.
- Une mesure prise sur l'appareil, là où le retard se produit.
- Aucun script avant la première peinture : l'avertissement peut apparaître après l'hydratation.

**Non-Goals:**

- Surveiller le travail du mainteneur : c'est le rôle de la veille.
- Rafraîchir les données sans changer de version : l'architecture actuelle les sert avec l'application, et le reste.

## Decisions

### D1 — La mesure : le dernier contact réussi avec le serveur

`registration.update()` demande le script du service worker au serveur, en contournant le cache HTTP. La promesse se résout si le serveur a répondu, même s'il n'y a rien de nouveau, et se rejette hors ligne. Chaque résolution enregistre l'instant dans le stockage local (`cantine.contact`).

L'application l'appelle à l'enregistrement du service worker, puis à chaque retour au premier plan : une application installée peut rester en mémoire des jours sans être rechargée. C'est la même règle que pour l'horloge, remise à l'heure au retour au premier plan (spec `menu-browsing`).

Alternative écartée : l'en-tête `Date` de la réponse `index.json`. Les données de la page viennent du HTML pré-rendu, pas d'une réponse réseau, et l'en-tête dirait l'âge du build, pas celui du contact.

### D2 — Sept jours

En deçà, un appareil resté hors ligne un week-end ou quelques jours ne mérite pas d'alerte : les menus sont publiés pour le mois et ne changent que rarement. Au-delà d'une semaine, une réédition a pu passer. Le texte dit la mesure : « Cet appareil n'a pas pu vérifier les menus depuis N jours. Ils ont pu changer. », avec le lien vers le PDF officiel, sur le ton info.

### D3 — Sans contact connu, rien

Si le stockage est indisponible, ou si aucun contact n'a jamais réussi (navigateur sans service worker, première visite encore en cours), l'avertissement ne s'affiche pas. L'application ne sait pas ; elle ne prétend pas savoir. Un appareil qui a chargé la page depuis le réseau a, de fait, été en contact : la première vérification réussie le consignera.

### D4 — `isStale` disparaît, `generatedAt` reste

La date de génération du manifeste n'est plus une mesure de fraîcheur. Elle reste dans les données et dans l'à-propos, où elle dit quand le corpus a été produit. `isStale` et ses tests sont remplacés par une fonction pure, `contactAncien(dernier, maintenant)`, testée sans navigateur.

### D5 — Livré avant le 19 octobre, 20 h 34 UTC

Le manifeste en ligne date du 17 octobre à 20 h 34 UTC : l'ancien avertissement s'allume pour tous 48 heures plus tard. Le changement est petit et doit partir avant.

## Risks / Trade-offs

- [Une requête de plus au premier plan] Un retour au premier plan déclenche une vérification du script du service worker. → Le navigateur fait déjà la même au chargement ; la requête est petite et sans cache.
- [Un appareil qui n'ouvre jamais l'application] Il n'a pas de contact récent, mais personne ne le regarde : l'avertissement n'apparaît qu'à l'ouverture, et la vérification de cette ouverture le corrige si le réseau répond.
- [Fausse jeunesse] Un contact réussi ne garantit pas que la nouvelle version soit appliquée : elle peut attendre l'action « Appliquer ». → Le bandeau de mise à jour le dit déjà ; les deux messages ne se recouvrent pas.
