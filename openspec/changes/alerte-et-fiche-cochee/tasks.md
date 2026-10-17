## 1. Alerte et volaille

- [ ] 1.1 `contrast.test.ts` : contrôle de l'écart OKLab entre `--warn` et chaque `--fam-*` (D2.1), seuil commenté ; vérifier qu'il échoue sur l'état actuel (volaille = alerte)
- [ ] 1.2 `contrast.test.ts` : paires anneau / teinte pâle à 3:1 pour les cinq familles (D2.2) ; vérifier que la volaille échoue à 2,07
- [ ] 1.3 `tokens.css` : `--fam-volaille: #9a5c00`, avec un commentaire sur la raison (D1) ; les deux contrôles passent
- [ ] 1.4 Caler le seuil OKLab sur l'écart le plus faible obtenu, avec une marge, et écrire la valeur et sa raison

## 2. Fiche du jour

- [ ] 2.1 `DaySheet.test.ts` : scénarios du delta `allergen-filter`. Résumé, allergène non déclaré, ordre et marque des surveillés, sélection vide, jour non précisé. Rouges d'abord
- [ ] 2.2 `DaySheet.svelte` : lire `allergenFilter` (D3) ; résumé par allergène surveillé, dans l'ordre de la légende (D4)
- [ ] 2.3 Détail : surveillés en tête, marqués (graisse, contour, « surveillé » en texte) ; les autres en `--ink-muted`
- [ ] 2.4 Jour non précisé : avertissement au ton `--warn`, allergènes surveillés nommés, lien vers le document officiel
- [ ] 2.5 Libellés dans `labels.ts` si réutilisés ; aucune formulation sans le mot « déclare »

## 3. Vérification

- [ ] 3.1 e2e : ouvrir la fiche avec un filtre actif (gluten et lait) ; un jour de la Toussaint avec le lait surveillé
- [ ] 3.2 Contrôle visuel à 320 px et sur écran large : 14 octobre avec gluten et lait, 21 octobre (Toussaint), sélection complète des 14 allergènes ; semaine avec un jour de volaille
- [ ] 3.3 `npm run validate`, `npm run build`, `npm run test:e2e`
