## Contexte

`design-tokens.test.ts` (`audit-design-system`, D1) lit les blocs `<style>` des composants et les feuilles CSS hors `tokens.css`. Il refuse une valeur en dur pour `font-size`, `border-radius` et sept propriétés de couleur. `contrast.test.ts` mesure les transparences à partir d'une liste de taux recopiés depuis les composants. Un contrôle de couverture refuse tout `color-mix(… var(--ink) N% …)` dont le taux n'est pas déclaré.

Décisions prises avec l'humain le 17 octobre 2026 : on garde le plancher à 10 px, les nouveaux jetons ont des noms français, le texte à 72 % passe à `--ink-muted`, et l'espacement reste minimal.

## Décisions

### D1 — Les nouveaux jetons sont nommés en français, un membre d'une famille existante suit sa famille

`--poids-*`, `--voile-*`, `--courbe` et `--apparition` sont en français. Créer en anglais un jeton qu'on renommera deux changements plus loin (backlog, entrée 15), ce serait du travail jeté. Le dépôt mêle déjà les deux langues (`--fond`, `--carte` à côté de `--ink`).

Le rayon du focus rejoint en revanche la famille `--radius-*` : `--radius-focus`. Un `--rayon-focus` isolé au milieu de quatre `--radius-*` ferait deviner la langue membre par membre, ce que l'audit reprochait justement. Le renommage traitera la famille entière.

### D2 — Trois voiles, et deux taux qui rejoignent un jeton existant

| Taux | Emploi | Devient |
|---|---|---|
| 12 % | aplat de la pilule d'onglets, `Onglets` et `greve` | `--voile-fond` |
| 55 % | bordure des commandes : `CommandeSortie`, `RangNavigation` | `--voile-trait` |
| `rgb(0 0 0 / 0.45)` | fond derrière la fiche | `--voile-modale` (renommé depuis `--voile`) |
| 72 % | texte atténué : nom de l'enseigne | `--ink-muted` |
| 22 % | filet du pied de source | `--bord` |

Le 72 % est du texte, et l'application a un jeton pour le texte atténué. Le garder en voile laisserait deux façons d'atténuer un texte.

Le 22 % est un filet décoratif, et `--bord` est déclaré dans `tokens.css` comme « séparation décorative ». Ce choix n'a pas été posé à l'humain : il suit la même logique que le 72 %. Le filet s'éclaircit légèrement, ce qui se défait en une ligne si l'œil le refuse.

*Corrigé à l'application.* Le relevé ne cherchait que `color-mix`, et il a manqué les voiles posés par `opacity`. Le pied de source en portait un à 72 %, sur le texte : c'est lui que mesurait la ligne des 72 % de `contrast.test.ts`, et la retirer l'aurait laissé sans mesure. Trois autres textes étaient atténués de la même façon, sans être mesurés : le détail non publié (`.unknown`, 75 %), et deux mentions (`.stale` et `.notice.subtle`, 80 %). Les quatre passent à `--ink-muted`, comme l'enseigne. Le lien du pied de source reprend l'encre pleine : son `opacity: 1` ne pouvait pas défaire l'opacité de son parent, et le lien restait à 72 % sans qu'on le veuille. `design-tokens.test.ts` refuse désormais toute opacité partielle qui n'est pas déclarée. Une seule l'est : la flèche désactivée, à 45 %, une commande inactive que WCAG exempte du seuil.

Les voiles se déclarent dans `tokens.css` sous la forme `color-mix(in srgb, var(--ink) N%, transparent)`, que `contrast.test.ts` connaît déjà. Le test lit donc les taux dans les jetons et non plus dans les composants. Sa liste `TRANSPARENCES` nomme le jeton au lieu de recopier le taux. Le contrôle de couverture continue de lire les composants, pour refuser qu'un nouveau `color-mix` d'encre y revienne en dur.

### D3 — Graisses : trois jetons et une exception

`--poids-moyen` (600), `--poids-fort` (700) et `--poids-titre` (800). Le seul `font-weight: 400`, celui des allergènes atténués sur la fiche, s'écrit `normal`. Ce mot-clé rejoint la liste d'exceptions : c'est le retour à la graisse du texte courant, pas un cran choisi.

Au palier large, les graisses ne bougent pas. Une graisse n'a pas à grandir avec l'écran.

### D4 — Pas de jeton d'ombre

L'audit comptait cinq « ombres ». Ce n'en sont pas :

| Où | Déclaration | Ce que c'est |
|---|---|---|
| `CommandeReglages` | `0 0 0 2px var(--fond)` | anneau qui détache la pastille de la roue |
| `PlatCarte` | `inset 0 0 0 1px var(--bord)` | contour intérieur |
| semaine | `0 -1px 0 var(--bord)` | filet |
| semaine | `none` | — |
| semaine | `0 0 0 2px var(--ink)` | anneau du jour courant, remplacé à l'entrée 13 |

Ce sont des filets et des anneaux. Leurs couleurs sont déjà des jetons, et leurs épaisseurs relèvent des épaisseurs de filet, que le test admet en pixels. Une échelle `--ombre-*` n'aurait aucune ombre à porter. Le test lira en revanche `box-shadow` pour y refuser une couleur en dur.

### D5 — Le `line-height: 17px` de la pastille de compte reste

Je l'avais relevé comme un défaut à la vérification de l'audit. Ce n'en est pas un : la pastille est une boîte fixe de 17 px de haut (`height: 17px`), et une hauteur de ligne égale à cette hauteur centre le chiffre verticalement. Le texte grandit au palier large (`--text-2xs`, de 10 à 11 px) et tient toujours dans les 17 px. `line-height` n'entre pas dans les propriétés surveillées.

### D6 — Mouvement

`--courbe: ease-out`, la courbe actuelle, et `--apparition: 180ms`, la durée d'ouverture de la fiche, à côté de `--glisse: 260ms`. L'audit proposait une courbe `cubic-bezier(0.2, 0.7, 0.2, 1)` : c'est un choix esthétique, que ce changement ne fait pas. Le changement ramène le code au système, il ne réécrit pas le système.

Le test refuse une durée (`\d+m?s`) ou une courbe nommée (`ease`, `ease-in`, `ease-out`, `ease-in-out`, `linear`, `cubic-bezier(`) écrite en dur dans `transition`, `animation` et leurs propriétés détaillées. Un seul cas est admis : `0.01ms !important`, dans la règle `prefers-reduced-motion` de `tokens.css`. C'est une neutralisation, pas une durée choisie, et l'exception le dit.

*Corrigé à l'application.* Les règles de base de `tokens.css` portaient un troisième mouvement en dur : `reveler 0s 3s`, le secours du premier rendu (jour-au-premier-rendu, D4). Le `0s` est une absence de durée, et les durées nulles sont retirées avant le contrôle. Le `3s` est un délai qui a un sens, et il devient `--secours`.

### D7 — Ce que le test lit en plus

- **Les règles de base de `tokens.css`.** Le fichier entre dans la lecture. Les déclarations de jetons (`--nom: valeur`) ne sont pas des propriétés surveillées et passent d'elles-mêmes ; seules les règles `body`, `:focus-visible`, `.glisse` et `prefers-reduced-motion` sont réellement contrôlées.
- **Les raccourcis.** `border`, `border-top`, `border-right`, `border-bottom`, `border-left`, `outline` et `box-shadow` sont contrôlés pour la couleur littérale. `font` n'admet que `inherit`.
- **Les attributs de balisage.** `style="…"` et `style:propriété="…"` dans le balisage des composants, pour les mêmes propriétés et les mêmes règles.
- **Les jetons inconnus.** Tout `var(--…)` doit être déclaré dans `tokens.css`, sauf deux cas. Les quatre jetons posés en ligne par les composants (`--role`, `--sens`, `--pale`, `--ring`) sont connus du composant qui les pose. Les noms construits (`var(--fam-${famille})`) sont lus coupés à leur partie fixe, et leurs valeurs viennent d'un type fermé que le compilateur vérifie.

### D8 — Espacements : le minimum

Les deux `4px` (`Onglets`, `CommandeReglages`) doublent `--space-1` et le prennent. Les quinze valeurs qui restent sont toutes sous `--space-1` (`0.06rem`, `0.12rem`, `2px`…). Ce sont des réglages optiques autour d'une capsule ou d'une pastille. Une échelle qui les porterait aurait des crans sans intention (`--space-0-5`), ce que `audit-design-system` (D2) refusait. Le commentaire du test est corrigé : l'échelle existe, mais ces valeurs sont sous son premier cran.

## Risques

- **Graisses en masse** : environ cinquante remplacements mécaniques sur une quinzaine de fichiers. Le risque est une faute de frappe dans un nom de jeton : `var(--poids-frot)` ne lève aucune erreur CSS, et le texte retombe silencieusement sur sa graisse héritée. Le test doit donc aussi refuser un `var(--poids-*)` qui n'existe pas dans `tokens.css`, et plus généralement tout `var(--…)` inconnu dans une propriété surveillée.
- **Rendu** : les trois écarts visibles listés dans la proposition, à vérifier à l'œil.
