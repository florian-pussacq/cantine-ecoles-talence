## 1. Suivi, en fonction pure

- [x] 1.1 Tests d'abord : verrou d'axe à 10 px ; décalage qui suit le doigt ; issue par distance (30 %) ou par vitesse (0,4 px/ms) ; retour sinon ; amorti et retour sans voisin (D1)
- [x] 1.2 `balayage.ts` : le suivi et l'issue ; la suppression du `click` de fin de geste conservée

## 2. Carrousel

- [x] 2.1 `Carrousel.svelte` : surface `pan-y`, panneau courant décalé, voisins rendus pendant le geste seulement, inertes et masqués (D2)
- [x] 2.2 Issue : le jour se pose aussitôt, puis les panneaux finissent leur course en `--glisse` ; date en fondu sous la même durée (D3) ; retour en haut (D5)
- [x] 2.3 Flèches et clavier : le même glissement depuis le bord (D4)
- [x] 2.4 Mouvement réduit : suivi conservé, pose sans glissement (D6)
- [x] 2.5 `tokens.css` : `--courbe-glisse`

## 3. Écrans

- [x] 3.1 Écran du jour sur le carrousel, voisins par `servedNeighbour`
- [x] 3.2 Écran de la semaine sur le carrousel, semaines voisines

## 4. Preuves

- [x] 4.1 e2e par vrais événements tactiles : suivi pendant le geste ; geste abouti ; geste hésitant ; bord ; le `click` de fin de geste n'ouvre pas la fiche ; un seul jour dans le document au repos
- [x] 4.2 e2e : les tests de navigation existants (flèches, retour, mention, semaine) passent inchangés — sauf deux mesures de page (`hauteur`, `retour`), qui attendent désormais le repos : pendant la course, le document contient aussi le jour qui s'en va, et une mesure se fait au repos (`auRepos`, `e2e/test.ts`)
- [x] 4.3 Passer `npm run validate`, `npm run build` (budget par page) et `npm run test:e2e`

## 5. Réglage au doigt

- [x] 5.1 Essai sur un vrai téléphone par l'humain ; seuils, durée et courbe ajustés et consignés dans `design.md`
