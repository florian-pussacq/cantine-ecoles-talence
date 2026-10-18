## Contexte

Aujourd'hui, `PlatCarte` pose `--role: var(--role-{slot})` et peint la pastille, le libellé du rôle et la vignette de cette couleur. L'écran de la semaine, lui, peint chaque disque de la famille du plat principal (`classify()`), en `--fam-*` et `--fam-*-pale`.

Contrastes mesurés le 18 octobre 2026, blanc dessus et sur la carte blanche : viande 4,55, poisson 4,66, végétarien 4,97, volaille 5,38, inconnu 5,55. Aucune famille n'est posée sur le fond crème.

## Décisions

### D1 — Révision de D50 : la couleur dit la famille, pas le rang

D50 donnait la couleur au rôle avec un argument réel : sur sept cartes empilées, une couleur par rôle donne un repère fixe dans la liste, ce que la famille, qui change chaque jour, ne fait pas. L'argument n'est pas réfuté, il est **jugé moins important** que la cohérence entre les deux écrans : un parent qui apprend le rouge de la viande sur la semaine le retrouve sur le jour.

Le repère de liste reste porté par les glyphes de rôle et par leurs libellés, en encre.

### D2 — Révision de D54 : les familles ne sont plus cantonnées à la semaine

Les jetons `--fam-*` servent désormais les deux écrans. `classify()` décidait déjà de l'illustration ; il décide maintenant aussi de la couleur de la carte principale.

### D3 — Le plat principal seul

`classify()` range une salade grecque et un clafoutis en « végétarien ». Colorer toutes les cartes repeindrait la moitié du menu en vert sans rien dire. Seule la carte qui porte `principal` prend la famille.

Elle est marquée par la pastille en aplat, le libellé du rôle, un filet de 4 px à gauche, la vignette teintée de `--fam-*-pale` et cerclée de `--fam-*` — le disque de la semaine en petit — et le nom de la famille écrit. La couleur ne porte jamais seule l'information.

Un plat principal inclassable prend `--fam-inconnu` et **aucun** nom de famille : on ne devine pas.

La spec disait jusqu'ici que le rang du plat principal tenait « au corps de son nom seul, sans aplat ni cadre ». Le filet et l'aplat de la pastille sont un cadre partiel : la spec est révisée en conséquence.

### D4 — Les autres cartes, en encre

Pastille sur `--creux`, glyphe en `--ink-muted`, libellé du rôle en `--ink-muted`, vignette sur `--creux`. C'est déjà le traitement des cartes vides : une carte non principale se distingue d'une carte vide par son nom de plat, pas par sa couleur.

### D5 — Scénario retiré

« La couleur ne dépend pas du contenu » devient faux : c'est désormais le contenu qui la fixe. Le CLI ne sait pas retirer un scénario d'un bloc modifié ; il sera retiré à la main de la spec principale à l'archivage, comme pour `menu-en-cartes`.
