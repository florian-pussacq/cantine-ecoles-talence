## 1. Suivi, en fonction pure

- [ ] 1.1 Tests d'abord : verrou d'axe à 10 px ; décalage qui suit le doigt ; issue par distance (30 %) ou par vitesse (0,4 px/ms) ; retour sinon ; amorti et retour sans voisin (D1)
- [ ] 1.2 `balayage.ts` : le suivi et l'issue ; la suppression du `click` de fin de geste conservée

## 2. Carrousel

- [ ] 2.1 `Carrousel.svelte` : surface `pan-y`, panneau courant décalé, voisins rendus pendant le geste seulement, inertes et masqués (D2)
- [ ] 2.2 Issue : le jour se pose aussitôt, puis les panneaux finissent leur course en `--glisse` ; date en fondu sous la même durée (D3) ; retour en haut (D5)
- [ ] 2.3 Flèches et clavier : le même glissement depuis le bord (D4)
- [ ] 2.4 Mouvement réduit : suivi conservé, pose sans glissement (D6)
- [ ] 2.5 `tokens.css` : `--courbe-glisse`

## 3. Écrans

- [ ] 3.1 Écran du jour sur le carrousel, voisins par `servedNeighbour`
- [ ] 3.2 Écran de la semaine sur le carrousel, semaines voisines

## 4. Preuves

- [ ] 4.1 e2e par vrais événements tactiles : suivi pendant le geste ; geste abouti ; geste hésitant ; bord ; le `click` de fin de geste n'ouvre pas la fiche ; un seul jour dans le document au repos
- [ ] 4.2 e2e : les tests de navigation existants (flèches, retour, mention, semaine) passent inchangés
- [ ] 4.3 Passer `npm run validate`, `npm run build` (budget par page) et `npm run test:e2e`

## 5. Réglage au doigt

- [ ] 5.1 Essai sur un vrai téléphone par l'humain ; seuils, durée et courbe ajustés et consignés dans `design.md`
