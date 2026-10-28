## Why

L'application est juste, accessible et mesurée, mais elle ressemble à ce que produit un modèle de langage quand on ne lui demande rien. Le catalogue d'Impeccable (impeccable.style), qui recense ces habitudes, en relève sur l'écran du jour presque autant qu'il y a d'éléments : le fond crème « tasteful default », le liseré coloré sur la carte du plat principal (`PlatCarte.svelte`, que D15 avait pourtant écarté), un surtitre en capitales au-dessus de chaque plat, sept cartes de même poids, la police système comme voix d'affichage, une pilule pour les onglets, une pour « Aujourd'hui », une pour « Bio ».

La dérive a une histoire. D5 et D15 avaient refusé « neutres chauds, une couleur d'accent » comme esthétique par défaut, et choisi une palette franche. D49 est revenu au crème et au brun doré. Le résultat se lit sur deux écrans de hauteur pour un déjeuner, et l'avertissement orange des allergènes y pèse plus que le repas.

Trois pistes ont été maquettées sur les données réelles du 2 au 13 novembre 2026. La piste A, « Signalétique », a été retenue et reprise en version de travail (A2), contrôlée contre les références d'Impeccable (`craft-floor`, `operate`, `typeset`, `layout`, `colorize`, `distill`).

## What Changes

- **Une nouvelle direction visuelle, « Signalétique ».** Elle emprunte au panneau d'affichage : une grille stricte, un grand chiffre pour la date, de l'encre sur un fond gris-vert froid, et la couleur réservée à ce qui informe. Le crème et le brun doré disparaissent.
- **Le plat principal pose sa famille en aplat.** Son nom est composé en blanc sur la couleur de sa famille, et son illustration repose sur la teinte pâle. Les autres rôles deviennent des **lignes d'un tableau** : le rôle dans une colonne à gauche, le plat, ses mentions et ses allergènes, sa vignette. **BREAKING (spec)** : un rôle servi n'est plus présenté par une carte.
- **La semaine marque chaque jour d'une tuile** à la couleur de la famille, portant le jour et son quantième. La famille est aussi écrite en toutes lettres, au lieu d'être confiée à la seule couleur.
- **Les onglets Jour et Semaine redescendent en bas**, à portée de pouce. Le pied fixe des mentions disparaît, et le lien vers les mentions rejoint le flux de chaque écran de menu, après la provenance des données. **BREAKING (spec)** : cela annule D52.
- **Une police servie par l'application** : Funnel Sans pour tout le texte, et sa coupe Display pour le seul grand chiffre et le nom du plat principal. Elles sont en woff2 variables, sous-ensemble latin, préchargées par le service worker, sous un budget que la construction fait respecter.
- **Le jaune de signalisation devient la couleur d'alerte.** Il sert à l'avertissement « Allergènes non précisés » et aux pastilles d'allergènes surveillés, toujours en texte noir. Il est plus clair que toutes les familles, l'ambre de la volaille compris.
- **Les messages s'allègent.** L'intitulé des vacances rejoint la mention du jour, et l'avertissement d'allergènes n'est plus un bloc mais une étiquette suivie d'une ligne.
- **La palette sombre est recomposée et non inversée** : surfaces quasi noires teintées de vert, familles en tons profonds sous du texte blanc.
- **Les surfaces du navigateur suivent la palette** : sélection de texte, anneau de focus, décalage du soulignement, chiffres à chasse fixe.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `menu-browsing` :
  - **Cartes du jour** est retirée, et remplacée par quatre exigences : un élément par rôle avec le plat principal en tête, le plat principal sur l'aplat de sa famille, les autres rôles en lignes, et le déjeuner comme cible unique ;
  - **Écran Semaine** écrit la famille du plat principal ;
  - **Accès aux écrans** pose la barre en bas et fait passer les mentions dans le flux ;
  - **Pied fixe de mentions** est retirée.
- `design-tokens` :
  - **L'anneau d'une famille se perçoit sur sa teinte** est remplacée par une exigence de contraste du texte posé sur l'aplat d'une famille ;
  - une nouvelle exigence porte la police servie par l'application et ses jetons.
- `offline-app` : **Budgets de performance** ajoute un budget de polices.
- `dish-illustration` : **Illustration de chaque plat** parle de lignes et non plus de cartes ; l'exigence ne change pas de sens.

## Impact

- **Jetons** : `src/lib/design/tokens.css` (palettes claire et sombre, échelle typographique, police), `contrast.test.ts`, `design-tokens.test.ts`, et la page 404 autonome qui recopie les jetons.
- **Composants** :
  - `PlatCarte.svelte`, `ListeDuJour.svelte`, `PastilleAllergene.svelte`, `PastilleRole.svelte` (les rôles deviennent une colonne de texte) ;
  - `EnTete.svelte`, `Enseigne.svelte`, `Onglets.svelte`, `RangNavigation.svelte`, `Bandeau.svelte`, `PiedSource.svelte` ;
  - `routes/+layout.svelte`, `routes/+page.svelte`, `routes/semaine/+page.svelte`, ainsi que `FicheJour.svelte` pour son habillage.
- **Ressources** : deux fichiers woff2 (environ 35 Ko au total), `@fontsource-variable/funnel-sans` et `@fontsource-variable/funnel-display` en dépendances de développement, et le service worker qui les précharge.
- **Construction** : `scripts/check-budget.js` mesure les polices.
- **Tests de bout en bout** : la barre basse, la zone sûre, le lien des mentions dans le flux, et les captures de référence s'il y en a.
- **Ce qui ne change pas** : les données, l'extraction, la veille, la fiche du jour (comportement), le filtre d'allergènes (comportement), la navigation par geste, le hors-ligne.
