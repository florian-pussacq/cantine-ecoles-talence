## Why

L'audit mené avec les grilles d'Impeccable (`audit`, `critique`, `optimize`) sur le build de la refonte Signalétique ne relève aucun motif « AI slop », aucun défaut de contraste, ni aucun débordement. Il laisse trois défauts, que ce changement traite.

Le plus visible est le **plat principal inclassable**. Six à sept plats sur cent vingt-sept tombent dans ce cas (« Escalope viennoise » quatre fois, « Croustade limousine », « Moussaka », « Émincé au curry »). Ils occupent l'élément le plus regardé de l'écran du jour avec un aplat gris-vert terne et une assiette vide grise. Tout l'écran est en couleurs franches, et cet aplat se lit « désactivé » ou « pas encore chargé ». C'est la règle « placeholder-style illustration » du catalogue, sur un état que la spécification voulait au contraire honnête : on ne devine pas une famille.

Viennent ensuite des **finitions typographiques** :

- sur bureau, les paragraphes de l'À propos, des réglages et de la grève courent sur une centaine de caractères ;
- dix-sept paragraphes finissent sur un mot seul ;
- le titre des écrans secondaires est centré, alors que toute l'interface s'aligne à gauche sur un axe de panneau ;
- trois valeurs d'approche négative sont écrites en dur, hors des jetons.

Enfin, **le lien vers les mentions** a été placé au bas des écrans de menu par la refonte (D11), à défaut d'autre place. Il y ajoute une ligne de plus sur le seul écran consulté chaque jour, coincée au-dessus de la barre des onglets. Or les mentions se consultent une fois, pas chaque matin. L'écran des réglages leur consacre déjà une section, « Application ».

## What Changes

- **Le plat inclassable devient un état dessiné, et non une absence de couleur.**
  - Sur l'écran du jour, le plat principal sans famille se pose sur une carte claire cerclée d'un filet d'encre, et son nom s'écrit en encre. Il n'y a pas de couleur, donc pas d'affirmation.
  - Sur l'écran de la semaine, sa tuile reprend ce traitement avec un filet plein. Le filet tireté reste réservé aux jours sans service.
  - L'assiette vide grise est remplacée par une **cloche de service**, un dessin assumé qui dit « le plat du jour » sans prétendre en connaître la nature.
  - Les jetons `--fam-inconnu` et `--fam-inconnu-pale` disparaissent. **BREAKING (spec)** : « la couleur de repli neutre » n'existe plus, et l'état neutre se marque par l'absence de couleur.
- **La table des familles s'enrichit, sans approximation.**
  - « Moussaka » est de la viande par définition, et une moussaka végétarienne le dit, d'où le mot-clé « végétarienne » qui l'emporte par sa longueur.
  - Les plats dont la famille varie d'une cuisine à l'autre restent inclassables : l'escalope viennoise (veau ou dinde), l'émincé au curry, la croustade limousine.
  - Des libellés d'autres rôles reçoivent une illustration qui existe déjà dans la bibliothèque : potatoes, mâche, Babybel, tome, tiramisu, cheesecake, far, donut, houmous, saucisson, poêlée, maïs.
- **Le texte courant se compose pour être lu.**
  - Les paragraphes sont bornés à une mesure de lecture d'environ 65 caractères.
  - Ils évitent le mot seul en dernière ligne (`text-wrap: pretty`), et les titres s'équilibrent (`text-wrap: balance`). Les deux règles sont posées une fois dans `tokens.css`.
- **Le titre des écrans secondaires s'aligne à gauche**, dans la coupe d'affichage, comme le titre des écrans de menu. Les approches négatives passent par des jetons, et la vérification des jetons couvre désormais `letter-spacing`.
- **Les mentions quittent les écrans de menu.** On les atteint par les réglages, dont la section « Application » les porte déjà. La provenance des données, c'est-à-dire la date de mise à jour et le lien vers le PDF officiel, reste au bas de chaque écran de menu : elle dit d'où vient ce qu'on lit, et sa place est là. Le lien vers le PDF passe au cran de texte `--texte-sm`. **BREAKING (spec)** : cela annule la partie de D11 de la refonte qui posait les mentions dans le flux des écrans de menu.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `dish-illustration` : **Déduction de la famille du plat** remplace « la couleur de repli neutre » par une présentation sans couleur de famille.
- `menu-browsing` :
  - **Écran Semaine** : la tuile d'un plat inclassable ne porte aucune couleur de famille ;
  - **Le plat principal sur l'aplat de sa famille** : un plat inclassable se pose sur une carte cerclée et non sur un aplat ;
  - **Accès aux écrans** : les mentions ne s'atteignent plus que par les réglages.
- `design-tokens` : une nouvelle exigence, **Le texte courant se compose pour être lu**, couvre la mesure, le mot seul en dernière ligne et l'approche par jetons.

## Impact

- **Composants** : `PlatCarte.svelte`, `routes/semaine/+page.svelte`, `PiedSource.svelte`, `EnTete.svelte`, `Bandeau.svelte`, `FicheJour.svelte`, et les paragraphes de `a-propos`, `reglages` et `greve`.
- **Jetons** :
  - `tokens.css` perd `--fam-inconnu` et `--fam-inconnu-pale`, et gagne `--mesure` et des jetons d'approche ;
  - `static/404.html` est à vérifier ;
  - `contrast.test.ts` (liste des familles) et `design-tokens.test.ts` (`letter-spacing`) sont mis à jour.
- **Illustrations** : `sprite.svg` (le symbole `ill-inconnu` est redessiné) et `families.ts` (table enrichie), avec leurs tests.
- **Tests e2e** : `famille`, `coque` (mentions), `large` (ordre du pied), et un contrôle de mesure.
- **Données** : aucune. La famille et l'illustration se déduisent côté application, si bien que les mois déjà publiés bénéficient de la correction sans être régénérés.
