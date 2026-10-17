## 1. Jetons et contraste

- [x] 1.1 `contrast.test.ts` : paires `info-on`/`info`, `evenement-on`/`evenement` ; `--voile-accent` sur `--carte` pour `ink`, `ink-muted`, `accent` (D1, D4) ; `readVoiles` étendu aux voiles d'accent ; rouges d'abord
- [x] 1.2 `tokens.css` : `--info`, `--info-on`, `--evenement`, `--evenement-on`, `--voile-accent`, commentés

## 2. Bandeau

- [x] 2.1 `Bandeau.test.ts` : trois tons, variante discrète, titre facultatif en `h2`, lien et commande portés par l'encre du ton
- [x] 2.2 `src/lib/ui/Bandeau.svelte` (D1)

## 3. Écrans

- [x] 3.1 Écran du jour : intitulé des vacances (événement), allergènes non précisés et données incertaines (alerte), fraîcheur (info discret), dans cet ordre (D2) ; format, indisponibilité et non-publication (info)
- [x] 3.2 Thème du jour en bandeau événement avec titre et note, à sa place dans la zone qui glisse (D2)
- [x] 3.3 Semaine : indisponibilité (info), fraîcheur (info discret)
- [x] 3.4 Réglages : stockage indisponible (info) ; grève : « ne sait pas » (info), non chargé (alerte) ; à propos : avertissement légal (info) ; layout : nouvelle version (info, avec son bouton)
- [x] 3.5 Retirer `.notice`, `.warn`, `.stale`, `.theme`, `.update`, `.disclaimer` des écrans ; plus aucun `var(--warn)` hors de `Bandeau.svelte` et de la fiche (`.non-precise`, qui est une alerte : la faire passer par le Bandeau)

## 4. « Aujourd'hui »

- [x] 4.1 `labels.test.ts` : `targetEyebrow` et `browsedEyebrow` rendent `{ texte, aujourdhui }` ; jour courant, vacances courantes, lendemain, navigation (D3)
- [x] 4.2 `labels.ts` et `RangNavigation` : la pastille à l'accent quand `aujourdhui`, le sourcil pour le reste
- [x] 4.3 Semaine : la pastille à l'accent, `--voile-accent` au lieu du contour noir ; retirer l'inversion de `contrast.test.ts` ; corriger le commentaire des « quatre signaux » (D4)

## 5. Vérification

- [x] 5.1 Relire les e2e qui citent la mention ou les messages (`vacances`, `coque`, `feries`, `retour`…) : ils prouvent toujours que le jour courant et les vacances sont nommés
- [x] 5.2 Contrôle visuel à 320 px et sur écran large : 2 septembre, 20 et 21 octobre (vacances, allergènes non précisés, filtre actif), un jour à thème (24 septembre), la semaine courante, réglages sans stockage, grève, à propos. « VACANCES » et la pastille tiennent sur une ligne à 320 px. La nouvelle version n'a pas été provoquée dans le navigateur (elle dépend du service worker) : elle n'est couverte que par le test du Bandeau
- [x] 5.3 `npm run validate`, `npm run build`, `npm run test:e2e`
