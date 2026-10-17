## 1. Contrat de données

- [x] 1.1 Ajouter `public-holiday` à l'énumération `kind` de `schemas/month.schema.json`, avec sa description : non servi, sans plats
- [x] 1.2 Régénérer les types (`npm run types`) et vérifier `schema.d.ts`
- [x] 1.3 Vérifier qu'aucun code ne traite `kind` de façon exhaustive (condition de D2) ; consigner le résultat dans le commit
- [x] 1.4 Ajouter à `fixtures/edge-cases.json` un jour `public-holiday` encadré de deux jours servis
- [x] 1.5 Dans `validate-data.js`, refuser un jour `school` dont un plat est libellé `JOUR` ou `FÉRIÉ`, vérifié sur le novembre tel que l'ancien parser le produit (le script n'a pas de banc de test unitaire)

## 2. Extraction

- [x] 2.1 Dans le chemin mensuel de `extract-menu-pdf.py`, reconnaître avant `assign_slots` une cellule dont le texte entier normalisé vaut `jour ferie`
- [x] 2.2 Produire pour elle `kind: public-holiday`, `confidence: high`, `courses: []`, sans avertissement
- [x] 2.3 Non-régression : régénérer août, septembre et octobre depuis leurs PDF archivés, n'observer que `fetchedAt` au diff
- [x] 2.4 Contrôler sur les PDF en ligne de novembre et de Noël que le 11/11, le 25/12 et le 01/01 sortent en `public-holiday`, et qu'aucun autre jour ne change de nature

## 3. Résolution

- [x] 3.1 Ajouter `skipped` (nature du jour courant, ou `null` s'il est absent) au statut `next-served` de `DisplayTarget`
- [x] 3.2 Tests unitaires de `resolveDisplayDay` : un férié en semaine, un férié la veille d'un week-end, un jour absent

## 4. Interface

- [x] 4.1 `targetEyebrow` : mention propre quand `skipped` vaut `public-holiday` ; les autres cas inchangés
- [x] 4.2 Écran Semaine : libellé « Jour férié » pour un jour `public-holiday`, distinct de « Pas d'école ce jour » et de « Menu pas encore publié »
- [x] 4.3 Vérifier que la mention tient dans le rang de navigation à 320 px

## 5. Vérification

- [ ] 5.1 Test de bout en bout : semaine contenant un férié, ouverture un jour férié, navigation par-dessus. Les données sont cuites au pré-rendu : intercepter `/data/` ne change rien à l'écran. Écrit avec la mise à jour des menus, sur le 11 novembre réel et l'horloge fixée
- [x] 5.2 Passer `npm run validate`, `npm run build` et `npm run test:e2e`

## 6. Documentation

- [x] 6.1 `docs/schema.md` : la nature `public-holiday`, et pourquoi elle n'a pas monté `schemaVersion`
- [x] 6.2 Skill `menus-talence` : un férié sort désormais sans avertissement ; un `⚠` sur une cellule mentionnant « férié » se relit
