## Context

Le système de jetons compte une soixantaine de noms. Les plus récents sont en français (`--poids-*`, `--voile-*`, `--courbe`, `--fam-*`, `--creux`). Les plus anciens et les plus cités sont en anglais : `--ink` (38 occurrences), `--space-*` (92), `--text-*` (70), `--radius-*` (37). Deux gardes lisent ces noms : `design-tokens.test.ts` refuse tout `var(--x)` qui n'est pas déclaré, et `contrast.test.ts` mesure des paires désignées par leur nom.

## Goals / Non-Goals

**Goals:**

- Une seule langue pour le vocabulaire de l'interface : jetons et composants.
- Un renommage qu'on peut prouver complet, sans relecture ligne à ligne.
- Un rendu identique avant et après.

**Non-Goals:**

- Le contrat de données : schémas JSON, types générés (`Course`, `slot`, `allergens`…), extracteur Python, fichiers publiés.
- Les identifiants TypeScript du domaine (`courseName`, `slotLabel`, `LUNCH_SLOTS`…).
- Les classes CSS (`.chip`, `.snack`, `.tray`…).

## Decisions

### D1 — Le vocabulaire de l'interface, et lui seul

On renomme ce que l'interface nomme : les jetons et les composants. C'est le vocabulaire qu'on emploie pour discuter d'un écran, et c'est là que le mélange gêne.

Le contrat de données reste tel quel. Ses noms sont partagés avec l'extracteur Python et avec les fichiers déjà en cache chez les utilisateurs, et les renommer est une migration, pas un renommage. Les identifiants TypeScript du domaine reflètent ce contrat (`course.slot`, `course.allergens`). Les traduire sans lui créerait une couche de traduction entre le code et ses données, pire que le mélange actuel.

Les classes CSS sont des noms locaux à un composant, sauf là où les tests e2e les visent. Les renommer mêlerait au changement des sélecteurs de test, ce qui en ferait autre chose qu'un renommage mécanique. Si le besoin se confirme, ce sera un changement à part.

### D2 — Les échelles aussi

`--space-*` → `--espace-*`, `--text-*` → `--texte-*`, `--radius-*` → `--rayon-*`, `--font` → `--police`. Garder les échelles en anglais ferait de l'exception (199 occurrences) une part plus grosse que la règle.

Les suffixes de taille (`2xs`, `xs`, `sm`, `base`, `lg`, `xl`, `2xl`) restent : ce sont des crans de mesure, pas des mots.

### D3 — Un seul motif pour ce qui se pose sur une surface : `--sur-*`

`--on-accent`, `--warn-on`, `--info-on`, `--evenement-on` et `--on-fam` deviennent `--sur-accent`, `--sur-alerte`, `--sur-info`, `--sur-evenement` et `--sur-famille`. Le préfixe range ces jetons ensemble et se lit comme une phrase : la couleur *sur* l'alerte.

### D4 — La table

| Avant | Après | Pourquoi ce nom |
| --- | --- | --- |
| `--ink` | `--encre` | |
| `--ink-muted` | `--encre-douce` | |
| `--chip` | `--etiquette` | le fond des étiquettes d'allergène, sur la pastille comme dans la fiche ; `--pastille` heurterait `PastilleRole` et `--rayon-pastille` |
| `--shell` | `--colonne` | la largeur de la colonne de lecture |
| `--touch` | `--cible` | la taille minimale d'une cible tactile |
| `--warn` | `--alerte` | |
| `--font` | `--police` | |
| `--space-N` | `--espace-N` | D2 |
| `--text-*` | `--texte-*` | D2 |
| `--radius-*` | `--rayon-*` | D2 |
| `--on-*`, `--*-on` | `--sur-*` | D3 |
| `--ring` (local) | `--anneau` | jeton local de `PlatCarte` |
| `--on-table` (404) | `--sur-table` | D3 |

`--accent`, `--info`, `--ill-*` et `--fam-*` restent : ce sont déjà des mots ou des abréviations françaises.

Composants : `Tray` → `ListeDuJour`, `DaySheet` → `FicheJour`, `AllergenChip` → `PastilleAllergene`, `ExternalLink` → `LienExterne`. Leurs tests suivent.

### D5 — Complet par construction, et gardé

Les anciennes déclarations disparaissent de `tokens.css`. Un `var(--ink)` oublié devient alors un jeton inconnu, que `design-tokens.test.ts` refuse déjà. Un nom oublié dans `contrast.test.ts` ne se résout plus, et le test échoue. Le compilateur Svelte refuse un import de composant introuvable. Le renommage est donc prouvé par les gardes existantes, sans relecture.

Pour que le mélange ne revienne pas, `design-tokens.test.ts` refuse en plus toute déclaration de jeton dont le nom commence par une racine anglaise retirée (`ink`, `chip`, `shell`, `touch`, `warn`, `on`, `space`, `text`, `radius`, `font`, `ring`). Ce n'est pas un dictionnaire, mais ces racines sont celles qu'on écrirait par réflexe.

### D6 — Seul dans son commit

Le renommage part seul, sans aucun autre changement. Un diff de plusieurs centaines de lignes mécaniques ne se relit que s'il ne cache rien d'autre. La preuve du « rendu identique » est une comparaison de captures avant et après, au pixel.

## Risks / Trade-offs

- [Collision de remplacement] `--text-*` est un préfixe de `--texte-*`, et `--on-` apparaît à l'intérieur d'autres noms. → Remplacer sur des noms entiers, bornés par une limite de mot, puis vérifier par les gardes de D5.
- [Archives] Les design archivés citent les anciens noms. → On ne réécrit pas l'histoire : un design archivé décrit l'état du code à sa date.
- [Mélange résiduel] Le code TypeScript reste en partie anglais (D1). → Assumé et écrit. La frontière passe là où passe le contrat de données.
