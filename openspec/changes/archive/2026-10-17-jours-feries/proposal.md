## Why

Les PDF de la Ville marquent un jour férié par une cellule portant deux mots, `JOUR` et `FÉRIÉ`, à la place des plats. Le parser ne connaît pas ce cas : il range `JOUR` en plat principal, `FÉRIÉ` en accompagnement, et déclare le jour servi (`kind: school`). Mesuré le 16 octobre 2026 sur les PDF en ligne : le 11 novembre, le 25 décembre et le 1er janvier sortent ainsi.

La confiance faible que le parser leur attribue ne rattrape rien. L'application afficherait un repas nommé « JOUR » sous une bannière « données incertaines » : c'est publier une erreur en s'en excusant. Et la résolution du jour, qui ne regarde que `kind === 'school'`, s'arrêterait sur un jour où aucun enfant ne mange.

Le défaut bloque la mise à jour de novembre, décembre et janvier.

Le contrat a par ailleurs un trou que la spec `menu-browsing` signale sans le combler : elle exige un message propre au jour férié, alors que le schéma ne sait pas dire « férié ». Le seul précédent, le 1er janvier des jeux d'essai, est déclaré `holiday` — donc présenté comme des vacances.

## What Changes

- Nouvelle nature de jour `public-holiday` dans `schemas/month.schema.json` : non servi, sans plats.
- Le parser reconnaît une cellule dont le texte entier est « JOUR FÉRIÉ » et produit un jour `public-holiday`, confiance haute, sans plats. Reconnaissance stricte sur la cellule entière, jamais sur une sous-chaîne d'un plat.
- La validation refuse un jour `school` dont le plat principal serait le libellé `JOUR` ou `FÉRIÉ` : garde-fou contre un retour du défaut par un autre chemin.
- L'écran Semaine nomme le jour : « Jour férié », distinct de « Pas d'école ce jour » et de « Menu pas encore publié ».
- L'écran du jour, quand le jour courant est férié et qu'il saute au prochain service, en dit la raison.

Hors périmètre : la distinction week-end / vacances dans la mention de l'écran du jour, que la même spec exige et que l'application ne fait pas non plus. Le présent changement pose le mécanisme (la cible résolue porte la raison du saut) sans traiter les autres raisons.

## Capabilities

### Modified Capabilities

- `menu-data` : la nature de jour gagne la valeur `public-holiday` ; l'extraction reconnaît le jour férié.
- `menu-browsing` : le jour férié a son libellé propre sur l'écran Semaine et sur la mention de l'écran du jour.

## Impact

- **Contrat** : ajout d'une valeur d'énumération, sans montée de `schemaVersion` (voir design, D2). Types dérivés à régénérer.
- **Parser** : `scripts/extract-menu-pdf.py`, chemin mensuel uniquement ; le chemin `--greve` n'est pas concerné.
- **Résolution** : `DisplayTarget` de statut `next-served` porte la nature du jour courant ; ses consommateurs suivent.
- **Données** : aucune donnée publiée ne change — les trois mois actuels n'ont pas de férié en semaine. Les fichiers de novembre à janvier seront produits après ce changement, par la procédure ordinaire.
