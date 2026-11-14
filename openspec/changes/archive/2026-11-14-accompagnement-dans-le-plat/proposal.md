## Why

L'accompagnement va avec le plat : on mange du colin _avec_ une purée de panais, pas un colin puis, trois lignes plus bas, une purée. L'écran du jour les sépare pourtant. Le plat principal ouvre la suite sur son aplat, et l'accompagnement est relégué dans le tableau, entre l'entrée et le laitage, comme un rôle indépendant. Sur l'écran de la semaine, il se perd dans la suite du résumé.

L'aplat porte aussi une ligne trop bavarde : « Plat · Volaille · Bio ». « Plat » se lit déjà à la place et à la couleur de l'aplat. La mention « Bio », elle, ne dit pas à quoi elle s'applique, et une fois l'accompagnement réuni au plat, elle ne pourrait plus le dire. Or la qualité est presque toujours celle de l'accompagnement : sur le corpus, 91 accompagnements sont bio contre 24 plats principaux.

## What Changes

- **L'accompagnement rejoint l'intitulé du plat principal.** Un seul intitulé dans la coupe d'affichage : le plat, une esperluette, puis l'accompagnement en graisse moyenne et en minuscule initiale (« Filet de colin & purée de panais à la vanille »). La ligne « Accompagnement » quitte le tableau. Maquette : la variante C, retenue après comparaison de trois variantes.
- **Un plat complet n'énonce plus d'absence d'accompagnement.** Ravioli, tikka massala ou brandade s'affichent seuls, sans « Pas d'accompagnement ce jour ». **BREAKING (spec)** : la règle « un élément par rôle, et jamais moins » (D12) ne vaut plus pour l'accompagnement. Elle vaut toujours pour l'entrée, le laitage, le dessert et le pain.
- **La ligne sous l'intitulé ne dit plus que la famille.** « Volaille » au lieu de « Plat · Volaille · Bio ». Un plat inclassable n'a pas de ligne.
- **Bio et Label Rouge deviennent des pictogrammes.**
  - Ce sont des pictogrammes maison et non les logos officiels AB, Eurofeuille ou Label Rouge, qui sont des marques avec une charte d'usage.
  - Chaque pictogramme suit le mot qu'il qualifie, sans retour à la ligne entre eux. On voit ainsi lequel du plat ou de l'accompagnement est bio, ou si ce sont les deux.
  - La règle vaut partout où une mention s'affiche à côté d'un nom : l'aplat, les lignes du tableau et l'écran de la semaine.
  - Chaque pictogramme est posé sur une pastille claire, pour rester lisible sur l'aplat de toutes les familles, y compris une feuille verte sur l'aplat végétarien.
  - Les autres mentions du schéma (Viande française, Pêche durable, IGP…) restent écrites en texte. Aucune n'apparaît dans le corpus actuel.
- **Les pictogrammes ont une légende.** Une section de l'écran À propos les présente. La couche de détail de la journée écrit chaque mention en toutes lettres à côté de son pictogramme, pour qu'on l'apprenne là où on la rencontre. Chaque pictogramme porte aussi son nom accessible.
- **L'écran de la semaine reprend l'intitulé composé** comme titre de chaque jour servi. L'accompagnement quitte le résumé qui suit.

## Capabilities

### New Capabilities

- `quality-marks` : les mentions de qualité Bio et Label Rouge, signalées par un pictogramme accolé au nom qu'elles qualifient, avec leur légende (écran À propos et fiche de journée) et leur nom accessible.

### Modified Capabilities

- `menu-browsing` :
  - **Le déjeuner, un élément par rôle** : l'accompagnement n'a plus d'élément propre ; il est porté par le plat principal, et son absence ne s'énonce pas ;
  - **Le plat principal sur l'aplat de sa famille** : l'intitulé réunit le plat et son accompagnement, et sous lui, la famille seule ;
  - **Les autres rôles en lignes** : le scénario des mentions d'une ligne passe de l'accompagnement à l'entrée, et la mention Bio s'y lit par son pictogramme ;
  - **Écran Semaine** : le titre d'un jour servi est l'intitulé composé.

## Impact

- **Composants** :
  - `PlatCarte.svelte` : intitulé composé, ligne de famille seule, pictogrammes ;
  - `ListeDuJour.svelte` : la liste ne rend plus l'accompagnement ;
  - `FicheJour.svelte` : la mention en toutes lettres à côté du pictogramme ;
  - `routes/semaine/+page.svelte` : intitulé composé, résumé sans accompagnement ;
  - `routes/a-propos/+page.svelte` : la légende.
- **Libellés** : `labels.ts` gagne la composition de l'intitulé, partagée par le jour et la semaine. `LUNCH_SLOTS` et les formulations d'absence perdent l'accompagnement.
- **Pictogrammes** : deux symboles dessinés, un nouveau composant, et des jetons de couleur pour la pastille, mesurés dans les deux palettes par `contrast.test.ts`.
- **Tests** : tests unitaires de `PlatCarte`, `ListeDuJour`, `FicheJour` et `labels`, et tests e2e de l'écran du jour et de la semaine.
- **Données** : aucune. Le schéma garde le rôle `accompagnement`, et l'extracteur n'est pas touché : la réunion se fait à l'affichage.
