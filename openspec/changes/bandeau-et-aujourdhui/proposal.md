## Why

L'audit du système de design (artefact « Audit design de la cantine », piste 4, plan d'action étape 3) relève que chaque écran a ses propres messages. Quinze messages, dans six fichiers, portent sept styles : `.notice`, `.notice.subtle`, `.warn`, `.stale`, `.theme`, `.update` et `.disclaimer`. Un jour de vacances empile trois messages dans trois styles (texte gris, texte gris, aplat orange), et rien ne dit lequel est grave.

L'orange de l'alerte sert aussi à des messages qui n'alertent de rien : la nouvelle version disponible, l'avertissement légal de « À propos », le stockage indisponible. Une couleur qui sert à tout ne signale plus rien. Deux autres défauts relèvent du même désordre :

- **Le thème du jour** (« Semaine du goût ») a la surface blanche d'une carte de plat, sans pastille ni illustration. Il se lit comme un plat qui aurait perdu ses données.
- **« Aujourd'hui » a deux traitements.** Sur l'écran du jour, c'est un sourcil doré. Sur la semaine, c'est une pastille noire sur une ligne cerclée d'un contour noir de 2 px, le trait le plus lourd de l'application, qui ressemble à un focus clavier.

## What Changes

- **Un composant `Bandeau`** à trois tons :
  - **info** : limites de l'application et état des données. Menus périmés, format plus récent, menus indisponibles, menu non publié, nouvelle version, stockage indisponible, « ne sait pas s'il y a grève », avertissement légal. Le ton admet une variante discrète.
  - **événement** : ce qui caractérise le jour. Intitulé des vacances, thème du jour et sa note.
  - **alerte** : ce qui touche à la sécurité de lecture d'un repas. Allergènes non précisés, données incertaines, menu de grève non chargé.
- **L'orange n'appartient qu'à l'alerte.** Deux tons nouveaux et mesurés : `--info`/`--info-on` et `--evenement`/`--evenement-on`.
- **Un ordre de lecture** sur l'écran du jour : l'événement d'abord, l'alerte ensuite, l'info en dernier.
- Les styles `.notice`, `.warn`, `.stale`, `.theme`, `.update` et `.disclaimer` disparaissent des écrans.
- **Un seul « Aujourd'hui »** : une pastille à l'accent.
  - Sur l'écran du jour, la mention la porte quand le jour affiché est le jour courant. Pour « Demain », « Prochain service » et les autres cas, la mention reste un sourcil.
  - Sur la semaine, la pastille noire devient la même pastille, et le contour noir laisse place à un fond teinté à l'accent (`--voile-accent`, 12 %).

Hors périmètre : le code couleur unique (backlog, entrée 14) et le renommage (entrée 15). Les jetons nouveaux suivent leur famille, `--warn`/`--warn-on` (fermer-les-echelles, D1).

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `menu-browsing` : les messages portent un ton parmi trois, l'alerte est réservée à ce qui touche un repas, et le jour courant se marque d'une seule façon sur les deux écrans.
- `design-tokens` : chaque ton de message tient son contraste, et le fond du jour courant ne fait perdre son seuil à aucun texte de la ligne.

## Impact

- **Nouveau composant** : `src/lib/ui/Bandeau.svelte` et son test.
- **Écrans** : `+page`, `semaine`, `reglages`, `greve`, `a-propos`, `+layout`. **Composant** : `RangNavigation`, qui porte la pastille de la mention.
- **Libellés** : `targetEyebrow` et `browsedEyebrow` disent séparément si le jour affiché est le jour courant.
- **Tests** : `contrast.test.ts` (deux tons, un voile, l'inversion de la semaine qui disparaît), tests des écrans, e2e `vacances` et `coque` à relire.
- **Rendu** : trois messages quittent l'orange. Le thème du jour change de surface. La ligne du jour de la semaine perd son contour noir. La mention « Aujourd'hui » de l'écran du jour devient une pastille.
