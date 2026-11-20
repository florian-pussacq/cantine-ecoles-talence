## Context

`/reglages` empile quatre sections. Celle des allergènes en occupe les deux tiers (quatorze cases, un compte, un avertissement), et l'apparence passe sous le pli. Trois réorganisations ont été maquettées : resserrer la page (A), en faire un sommaire avec un écran dédié aux allergènes (B), sortir les allergènes des réglages vers une commande propre sur l'enseigne (C). Florian a retenu B, avec l'apparence en tête.

## Goals / Non-Goals

**Goals:**

- Un sommaire des réglages qui tient dans le premier écran d'un téléphone de 390 × 844 (environ 660 px utiles sous Safari).
- Un écran dédié aux allergènes, sans rien changer à son contenu ni à son comportement.
- Aucun changement sur les écrans de menu.

**Non-Goals:**

- Une commande dédiée aux allergènes sur l'enseigne (proposition C) : elle ferait tomber l'emplacement unique de l'en-tête et dépenserait la ligne la plus haute de l'écran quotidien pour un réglage qu'on fait une fois.
- Raccourcir les libellés des allergènes : ils restent ceux de la légende du PDF.

## Decisions

### D1 — L'apparence en tête, les allergènes en second

C'est le choix de Florian. L'apparence se règle sur place, d'un geste ; les allergènes, eux, ouvrent un écran. Mettre en tête ce qui se fait sans quitter la page laisse le sommaire se lire de haut en bas comme une liste de gestes de plus en plus longs. La ligne des allergènes reste au-dessus du pli (vers 300 px sur la maquette), de sorte que l'état du filtre se lit sans défiler.

### D2 — Une rangée de trois choix pour l'apparence

Trois boutons radio en liste occupent environ 170 px ; la rangée en occupe 44, plus une ligne d'explication. Ce sont toujours des `input type="radio"` natifs, dans un `role="radiogroup"` nommé par l'intitulé de section, habillés en segments : le clavier, la restitution et le formulaire restent ceux du navigateur. Le segment choisi est une inversion (`--accent` sous `--sur-accent`), une paire déjà mesurée par `contrast.test.ts`.

« Comme l'appareil » devient « Appareil », trop long sinon pour un tiers de 320 px ; la ligne dessous le dit en entier : « Appareil : clair ou sombre, selon le réglage du téléphone. »

### D3 — La ligne des allergènes résume l'état

Elle nomme les allergènes surveillés (« Arachides et Lait ») et porte le même compte que la roue, dans la même inversion. Sans sélection, elle dit « Aucun allergène surveillé », sans compte nul ni invitation insistante, comme la roue. Le nom accessible du lien redit le compte.

La roue des écrans de menu mène toujours à `/reglages`, jamais directement à l'écran des allergènes : une commande nommée « Réglages » doit mener aux réglages. Le geste de correction s'allonge d'un pas, et la spécification `allergen-filter` est assouplie en ce sens : l'état se relit, sans défiler, dès l'arrivée sur le sommaire. C'est le compromis assumé de B ; on le paie deux ou trois fois par an, à la rentrée ou quand un PAI change.

### D4 — L'écran des allergènes est un écran secondaire comme les autres

`/reglages/allergenes` entre dans `TITRES` (« Allergènes ») et dans `SORTIES`, avec la sortie « ↩ Réglages », celle que le menu de grève a déjà (D62). Le type de `SORTIES` prévoit déjà `/reglages` comme destination. Le choix entre jour et semaine n'y est pas affiché.

Le contenu de la section est déplacé tel quel, avertissement compris : il suit toujours les cases, sur le même écran.

## Risks / Trade-offs

- [Un pas de plus vers les cases] La correction passe par le sommaire → la ligne y est la deuxième, au-dessus du pli, et redit l'état.
- [Lien profond] Un signet sur `/reglages` ne mène plus aux cases → l'écran est prérendu sous sa propre adresse, que l'on peut garder.
- [Budget] Une page de plus → le code est déplacé, pas ajouté ; `check-budget` mesure chaque page.
- [Tests] Les scénarios qui cochent sur `/reglages` cassent → ils passent sur `/reglages/allergenes`, et un scénario vérifie le résumé du sommaire.
