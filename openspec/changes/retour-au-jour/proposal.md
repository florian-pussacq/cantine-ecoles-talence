## Why

**Il n'y a pas de chemin de retour.** Après six balayages vers l'avant, revenir au menu du moment demande six balayages en arrière, ou un détour par l'écran de la semaine. Le code prévoyait pourtant la commande : `selection.reset()` existe depuis l'origine, sans un seul appelant ni un seul test. La porte a été construite, la poignée jamais posée.

**Et l'écran cesse de dire où l'on est au moment précis où l'on s'y perd.** La mention de l'en-tête est calculée ainsi :

```js
chosen === null || chosen === target.date
  ? targetEyebrow(target)   // « Aujourd'hui » · « Demain » · « Prochain service · dans 10 jours »
  : 'Menu du jour'          // ← une constante
```

Sur le jour que l'application a choisi, elle situe. Dès que l'utilisateur navigue, elle devient « Menu du jour » — la même chaîne tous les jours, à toutes les distances, dans les deux directions. Elle occupe la place de l'information au lieu de la porter. L'écran de la semaine a le même trou, avec « Semaine » au lieu de « Cette semaine ».

**Le troisième défaut est le plus grave, et il ne se voit pas en développement.** `selection` vit en mémoire, et son commentaire de tête assume la conséquence :

> « Un rechargement complet ramène au jour du moment, ce qui est de toute façon le comportement attendu à l'ouverture. »

C'était vrai quand l'application se consultait dans un onglet. **Une application installée n'est pas rechargée : elle est mise en veille et reprise.** Le raisonnement date d'avant l'installation, et personne n'est allé le retourner contre elle.

```
  lundi      je navigue jusqu'à vendredi, je ferme l'application
             ↓ veille — pas rechargement, selection.date vaut toujours « vendredi »
  mercredi   je rouvre

  ┌────────────────────────────────┐
  │ Vendredi 4 septembre           │  le menu de dans deux jours
  │ ⟨MENU DU JOUR⟩                 │  et l'écran affirme que c'est celui du jour
  └────────────────────────────────┘
```

C'est exactement le risque que D15 a nommé — « un parent lisant le menu de lundi en croyant lire celui de vendredi » — à ceci près que l'application ne se contente pas de le taire : elle l'affirme.

Le défaut est plus profond que la sélection. `const now = new Date()` est évalué au montage de l'écran. Une application reprise après deux jours de veille calcule sa cible, sa mention et son avis de fraîcheur avec l'horloge d'avant-hier. **Réparer la sélection sans remettre l'horloge à l'heure ne répare que la moitié du bug.**

## What Changes

- **Une place, deux états qui ne coexistent jamais.** L'emplacement qui porte la mention porte, lorsque l'utilisateur a lui-même choisi le jour, une commande de retour. La constante « Menu du jour » disparaît, ainsi que son équivalent « Semaine ».
- **Le libellé de la commande est dynamique** — « Aujourd'hui », « Demain », « Prochain service » — parce que le repère de l'application n'est pas toujours aujourd'hui. Quarante pour cent des jours de l'année ne sont pas servis : un bouton fixe intitulé « Aujourd'hui » afficherait lundi un dimanche, et rouvrirait par l'autre bout le trou que `targetEyebrow` a été écrit pour fermer.
- **La distance n'est pas affichée.** Elle a été envisagée puis écartée : le nombre de jours civils et le nombre de jours servis diffèrent dès qu'un week-end s'intercale, et la présence même de la commande dit déjà qu'on n'est pas au repère. Deux éléments pour un seul fait, c'est le défaut que D28 reproche au compartiment du pain.
- **L'horloge se remet à l'heure au retour au premier plan**, et la sélection expire quand le jour civil a changé. Un choix de jour vaut pour la journée où il a été fait, pas au-delà.
- **L'onglet « Jour » ne change pas**, et l'argument est écrit : réinitialiser depuis la barre casserait le chemin « ouvrir un jour depuis la semaine », qui repose sur le partage délibéré de la sélection.

## Capabilities

### Modified Capabilities

- `menu-browsing` : l'exigence **En-tête d'écran** acquiert la commande de retour et l'exclusivité des deux états. L'exigence **Navigation entre jours** gagne le retour au repère et l'expiration du choix. L'exigence **États limites de consultation** cesse de supposer que l'instant de référence est celui du montage.

## Impact

**Code applicatif** — `src/lib/menu/selection.svelte.ts` (le choix mémorise le jour où il a été fait, et `reset()` cesse d'être du code mort), `src/lib/data/horloge.svelte.ts` (nouveau : l'instant de référence, réactif), `src/lib/ui/EnTete.svelte` (la place partagée), `src/lib/menu/labels.ts` (les libellés de retour), `src/routes/+page.svelte` et `src/routes/semaine/+page.svelte` (le repère et la commande), `src/routes/+layout.svelte` (l'horloge est suivie une fois pour toute l'application).

**Tests** — l'expiration du choix et les libellés de retour sont des fonctions pures : elles se testent sans navigateur, en passant le jour et la cible. Le retour au premier plan demande un test de bout en bout, faute de quoi seule la moitié testable serait vérifiée. `EnTete` change de contrat : ses tests changent avec lui.

**Données** — aucun changement.

**Hors périmètre** — la persistance du choix dans l'URL, écartée à l'origine pour le clignotement qu'elle causerait sur un site pré-rendu ; l'expiration à minuit sans reprise de l'application, qui demanderait une minuterie pour un cas que le retour au premier plan couvre déjà.
