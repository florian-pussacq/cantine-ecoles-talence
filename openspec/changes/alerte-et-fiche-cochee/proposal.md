## Why

L'audit du système de design (artefact « Audit design de la cantine », 17 octobre 2026) relève deux défauts qui touchent la sécurité de lecture. Son plan d'action les place en tête, « petit · tout de suite » :

- **L'alerte a la couleur d'un plat.** `--warn` et `--fam-volaille` valent tous deux `#e89406`. Le bandeau « allergènes non précisés » a exactement la couleur du disque d'un jour de dinde sur la semaine. Une alerte qui ressemble à un plat n'alerte plus. Au passage, l'anneau de la volaille sur sa propre teinte pâle ne tient que 2,07:1. C'est sous le 3:1 qu'exige WCAG 1.4.11 pour un élément graphique porteur de sens, et aucun test ne le mesure.
- **La fiche ne montre pas ce qu'on a coché.** La fiche du jour liste tous les allergènes au même poids, ceux que le parent surveille comme les autres. C'est pourtant l'écran où un parent d'enfant allergique vient vérifier, et la fiche ne lit même pas le filtre.

## What Changes

- `--fam-volaille` passe de `#e89406` à `#9a5c00`, un ambre brun. Il tient 4,5:1 sur le blanc, sur le fond et sur sa teinte pâle, et anticipe ainsi le changement « un seul code couleur », où la famille portera glyphe et libellé sur l'écran du jour. L'orange `#e89406` n'appartient plus qu'à l'alerte.
- `contrast.test.ts` vérifie que l'alerte s'écarte nettement de chaque couleur de famille, et mesure l'anneau de chaque famille sur sa teinte pâle à 3:1.
- La fiche du jour lit le filtre. Quand des allergènes sont surveillés :
  - un **résumé** en tête nomme, pour chaque allergène surveillé, les plats du jour qui le déclarent, ou dit qu'aucun plat ne le déclare ;
  - dans le **détail** plat par plat, les allergènes surveillés passent en tête et sont marqués, sans dépendre de la couleur ; les autres sont atténués ;
  - un jour dont le document **ne précise pas** les allergènes, le résumé le dit sur le ton de l'alerte, en nommant les allergènes qu'on ne peut pas vérifier.
- Sans allergène surveillé, la fiche est inchangée.

Hors périmètre : le composant Bandeau et l'« Aujourd'hui » unifié, le code couleur unique, les graisses et les voiles, le renommage, le mode sombre. Ce sont les étapes suivantes du plan, consignées au backlog (entrées 11 à 16).

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `allergen-filter` : le détail des allergènes de la journée met en avant la sélection, et dit ce qu'il ne peut pas vérifier.
- `design-tokens` : la couleur d'alerte se distingue de toute couleur de famille, et l'anneau d'une famille se perçoit sur sa teinte pâle.

## Impact

- **Jetons** : `src/lib/design/tokens.css`, une valeur.
- **Tests** : `src/lib/design/contrast.test.ts` (deux contrôles), `src/lib/menu/DaySheet.test.ts` (résumé, ordre, marque, jour non précisé, filtre vide).
- **Composants** : `src/lib/menu/DaySheet.svelte`. `labels.ts` reçoit les libellés du résumé si besoin.
- **Rendu** : la volaille fonce sur la semaine. La fiche s'allonge d'un résumé quand un filtre est actif. Les captures de l'audit servent de référence : le 14 octobre (filtre gluten et lait) et le 21 octobre (Toussaint, allergènes non précisés).
- **e2e** : à étendre sur la fiche, avec un filtre actif.
