## 1. Contrat de données

- [ ] 1.1 Écrire `schemas/greve.schema.json` : `schemaVersion`, source, légende, deux services, cinq jours de semaine par service, plats
- [ ] 1.2 Documenter dans le schéma pourquoi ce fichier ne porte pas de date et pourquoi il reste hors du manifeste
- [ ] 1.3 Dériver les types TypeScript du nouveau schéma et vérifier au build qu'ils ne divergent pas
- [ ] 1.4 Valider `static/data/greve.json` dans `scripts/validate-data.js` sans jamais l'inscrire au manifeste
- [ ] 1.5 Contrôler la cohérence propre au fichier : deux variantes, cinq jours chacune, un plat de rôle `plat` par jour, allergènes présents dans la légende

## 2. Extraction

- [ ] 2.1 Ranger `00-MENUS-WEB-GREVES.pdf` sous `sources/pdf/`
- [ ] 2.2 Extraire dans `scripts/extract-menu-pdf.py` le cœur partagé entre les deux gabarits : découpage d'une cellule en lignes, fusion des codes débordants, attribution des rôles par rang
- [ ] 2.3 Ajouter le mode `--greve` : colonnes ancrées sur les bandes de codes d'allergènes, bandes ancrées sur `REPAS CHAUDS` et `REPAS FROIDS`
- [ ] 2.4 Vérifier la non-régression du chemin mensuel : régénérer les trois mois et n'observer que `fetchedAt` au diff
- [ ] 2.5 Produire `static/data/greve.json` et relire les dix menus contre le PDF

## 3. Écran du menu de grève

- [ ] 3.1 Resserrer la signature de `PlatCarte` sur la seule légende d'allergènes, et suivre ses appelants
- [ ] 3.2 Créer `src/routes/greve/+page.ts`, qui charge le fichier au prérendu et rend `null` s'il manque
- [ ] 3.3 Créer l'écran : mention de ce que l'application ne sait pas, sélecteur de variante, cinq jours, pied de source
- [ ] 3.4 Déclarer le titre de l'écran dans la table des titres du layout

## 4. Accès depuis les réglages

- [ ] 4.1 Élargir l'identité de `/reglages` : titre, `<title>`, sections « Allergènes » et « Menus »
- [ ] 4.2 Élargir le nom accessible de la commande de réglages en conservant le compte d'allergènes
- [ ] 4.3 Ajouter le lien vers l'écran du menu de grève

## 5. Vérification

- [ ] 5.1 Écrire `e2e/greve.spec.ts` : absence des onglets et de tout lien depuis les écrans quotidiens, accès depuis les réglages, bascule de variante, consultation hors ligne
- [ ] 5.2 Mettre à jour les tests existants qui nomment la commande de réglages
- [ ] 5.3 Ajouter l'écran à la boucle d'accessibilité de bout en bout
- [ ] 5.4 Passer `npm run validate`, `npm run build` et `npm run test:e2e`

## 6. Documentation

- [ ] 6.1 Reprendre `docs/schema.md` : le menu de grève a désormais son contrat
- [ ] 6.2 Reprendre le skill de mise à jour des menus : le PDF de grève se traite, son empreinte se compare
