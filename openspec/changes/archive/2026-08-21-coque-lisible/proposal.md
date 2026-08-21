## Why

Les menus s'affichent correctement, mais l'application se manipule mal. La feuille de détail d'un plat imite un composant natif sans en avoir le comportement : elle ne piège pas le focus, ne le restitue pas, laisse le fond défiler, et exhibe une poignée de glissement à laquelle rien n'est attaché. Le balayage entre jours ne se déclenche pas au doigt sur un téléphone réel — alors que son test de bout en bout passe, parce qu'il fabrique des événements DOM au lieu de gestes. L'en-tête est recopié à l'identique dans quatre écrans, le thème sombre ne peut pas être choisi, et la colonne reste large de 520 pixels sur un écran de bureau.

Ces cinq points partagent une cause : la coque a été assemblée en même temps que le contenu, et jamais éprouvée pour elle-même. Ils se traitent ensemble parce qu'ils touchent les mêmes fichiers et les mêmes tests — la palette, la surface de geste et l'en-tête sont trois façons de regarder le même `+layout`.

## What Changes

- **La feuille de détail devient un `<dialog>` natif.** Top-layer, `::backdrop`, Échap, piège de focus, restauration du focus sur l'élément qui a ouvert, défilement de fond bloqué : tout cela cesse d'être à écrire. Elle monte du bas sous 640 pixels de large et se centre au-dessus. La poignée décorative disparaît plutôt que de continuer à promettre un glissement qui n'existe pas.
- **Le balayage est réparé, puis étendu.** La cause est à établir par reproduction avant correction — trois suspects sont identifiés, dont l'absence de `touch-action` sur la surface de geste. Le geste est extrait dans une fonction pure, testable hors navigateur, et branché sur l'écran Semaine pour changer de semaine.
- **BREAKING (tests)** : le test de bout en bout du balayage est remplacé, pas complété. Il produit aujourd'hui une assurance fausse, et le conserver reviendrait à garder un témoin qui ment.
- **Un en-tête partagé d'une seule ligne** remplace quatre en-têtes recopiés, chacun sur deux lignes.
- **Le thème devient choisissable** : Système, Clair ou Sombre, persisté, appliqué avant la première peinture pour qu'un site prérendu ne clignote pas.
- **L'écran large est traité** sans seconde mise en page : la même colonne, élargie, avec un cran de plus en typographie et en illustrations. Un projet Playwright « bureau » est ajouté — aujourd'hui aucun test ne s'exécute ailleurs que sur un Pixel 7, donc rien ne vérifierait cette mise en page.

## Capabilities

### New Capabilities

- `theme-preference` : le choix explicite d'un thème clair ou sombre, sa persistance, son application sans clignotement, et sa cohabitation avec la préférence du système.

### Modified Capabilities

- `menu-browsing` : trois exigences changent. **Navigation entre jours** cesse d'autoriser le balayage à titre facultatif (« MAY ») pour le rendre obligatoire sur les deux écrans de consultation, avec un comportement défini face au défilement vertical. **Accessibilité des écrans de consultation** cesse de lier le thème sombre à la seule préférence du système. Et une exigence nouvelle porte sur le détail d'un plat, qui n'était jusqu'ici qu'un détail d'implémentation : ce qu'une couche modale doit garantir au clavier et au lecteur d'écran.

## Impact

**Code applicatif** — `src/lib/menu/CourseSheet.svelte` (réécrit autour de `<dialog>`), `src/routes/+page.svelte` et `src/routes/semaine/+page.svelte` (surface de geste), `src/lib/design/tokens.css` (palette restructurée, jeton de largeur), `src/routes/+layout.svelte` et `src/app.html` (thème avant peinture), `src/routes/reglages/+page.svelte` (l'interrupteur). Nouveaux : `src/lib/ui/EnTete.svelte`, `src/lib/ui/balayage.ts`, `src/lib/theme/theme.svelte.ts`.

**Tests** — `src/lib/design/contrast.test.ts` doit être réécrit : il classe les jetons par leur position dans le fichier CSS, ce que la restructuration de la palette invalide. `e2e/qualite.spec.ts` perd ses deux tests de balayage synthétiques au profit de séquences tactiles réelles. `playwright.config.ts` gagne un projet bureau. `src/vitest-setup.ts` doit simuler `showModal`, absent de jsdom.

**Contraintes à ne pas casser** — un seul `<h1>` par écran, vérifié par `qualite.spec.ts` ; les budgets de 60 Ko de JavaScript et 150 Ko au premier chargement, vérifiés à chaque construction ; les quarante mesures de contraste, dont celle qui exige que le blanc reste illisible sur l'ambre clair.

**Hors périmètre** — le parser PDF, la veille de la source, et toute modification du schéma de données. Cette refonte ne touche à aucun octet de `static/data/`.
