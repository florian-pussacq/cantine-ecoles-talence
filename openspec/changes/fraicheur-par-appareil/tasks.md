## 1. Mesure

- [x] 1.1 Tests d'abord : `contactAncien(dernier, maintenant)` — vrai au-delà de sept jours, faux en deçà, faux sans contact connu ; rend le nombre de jours (D2, D3)
- [x] 1.2 `load.ts` : `contactAncien` remplace `isStale` (D4)
- [x] 1.3 `update.svelte.ts` : `registration.update()` à l'enregistrement et au retour au premier plan ; chaque succès consigne l'instant dans `cantine.contact` ; la date est exposée, lue sans échouer si le stockage manque (D1, D3)

## 2. Écrans

- [x] 2.1 Écran du jour et semaine : la nouvelle condition et le texte de D2, sur le ton info, avec le lien vers le PDF
- [x] 2.2 e2e : un contact de plus de sept jours affiche l'avertissement avec le nombre de jours ; un contact récent, ou aucun, ne l'affiche pas — l'horloge étant fixée bien après `generatedAt`

## 3. Vérification

- [x] 3.1 Passer `npm run validate`, `npm run build` et `npm run test:e2e`
