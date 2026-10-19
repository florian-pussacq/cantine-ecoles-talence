## Why

Le passage d'un jour à l'autre, au doigt, est le geste le plus fréquent de l'application, et il est raté. Rien ne bouge pendant que le doigt glisse. Au relâchement, au-delà de 60 pixels, l'ancien jour disparaît d'un coup (le `{#key}` le détruit, sans sortie), puis le nouveau apparaît en fondu, décalé de 24 pixels. Un geste vif et court est ignoré, puisque seule la distance compte. On pousse un écran inerte, sans savoir si le geste a pris, et on reçoit un saut.

Le défaut était connu et reporté en connaissance de cause. `hierarchie-du-jour` l'écrivait : « le balayage promet un contenu solidaire de la main, et livre un décalage de 24 pixels après le relâchement. Réparer cela veut dire un vrai carrousel, avec les jours voisins pré-rendus de part et d'autre et une position pilotée par le pointeur. C'est un changement à part entière. »

## What Changes

- Pendant le geste, le contenu du jour **suit le doigt**, et le jour voisin arrive sur le bord.
- Au relâchement, le jour change si le doigt a parcouru **assez de chemin, ou assez vite** ; sinon le jour revient en place.
- Au bord du corpus, là où il n'y a pas de voisin, le contenu **résiste** puis revient.
- Les flèches et le clavier jouent **le même glissement**, complet.
- L'en-tête reste fixe ; la date change en fondu court quand le jour se pose, sous la même durée (« Une seule horloge »).
- Le nouveau jour arrive en haut de sa liste.
- **La semaine reçoit le même traitement**, d'une semaine à l'autre, par le même module.
- Mouvement réduit : le contenu suit toujours le doigt, mais rien ne s'anime après le relâchement.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `menu-browsing` : deux exigences nouvelles, « Le geste suit le doigt » et « Un seul mouvement de jour à jour », pour les jours et les semaines.

## Impact

- `src/lib/ui/balayage.ts` : de la décision au relâchement à un suivi continu, toujours en fonction pure.
- Un composant de carrousel partagé, et les deux écrans qui l'emploient.
- `tokens.css` : la courbe du glissement.
- Tests unitaires du suivi et de la décision ; e2e par vrais événements tactiles.
- JavaScript : quelques kilo-octets de plus sur l'écran du jour (48,6 Ko sur 60 au 18 octobre).
- Un réglage au doigt, sur un vrai téléphone, après le premier essai.
