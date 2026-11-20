## Context

Voir `proposal.md` pour le pourquoi. La maquette comparative (trois directions, puis la version 2 des gommettes, les variantes du gâteau et des légumineuses, et le catalogue des 31) est une Artifact privée de Florian. Les dessins sources et la planche de contrôle sont dans les fichiers du projet, sous `pictos-directions/`.

Ce qui contraint le comment :

- **Le sprite est injecté dans la coque au build** (D57). Il ne passe pas par le bundle : son poids pèse sur chaque page HTML, pas sur le budget JavaScript.
- **`contrast.test.ts` lit le sprite** et y refuse toute dépendance au thème (`prefers-color-scheme`, `data-theme`, `data-apparence`). Les dessins doivent donc être les mêmes dans les deux palettes.
- **La spec `dish-illustration` veut une forme lisible sans relief** : le relief est un ornement, jamais porteur de la forme.
- **Le plat principal pose son dessin sur le disque pâle de sa famille** ; une ligne pose sa vignette directement sur le fond. Un dessin doit donc tenir sur six surfaces : le fond clair, le fond sombre, et les quatre disques pâles, clairs en clair et sombres en sombre.

## Goals / Non-Goals

**Goals :**

- Un jeu de 31 dessins qui se reconnaissent d'un coup d'œil, de 20 à 96 px.
- Une grammaire assez explicite pour qu'un 32e dessin s'ajoute sans casser la série.
- Un rendu qui s'accorde avec l'interface signalétique au lieu de la contredire.

**Non-Goals :**

- **Changer la correspondance des libellés** (`families.ts`) ou les familles. Seul le dessin change.
- **Toucher les allergènes et les marques de qualité.** Ils portent une information et suivent leurs propres règles.
- **Un thème de dessin par palette.** Les papiers sont les mêmes en clair et en sombre.

## Decisions

### D1 — Des gommettes de papier découpé, plutôt qu'un pictogramme d'une encre ou une vue du dessus

Les trois directions ont été dessinées sur les mêmes douze plats et posées dans l'écran du jour. Le pictogramme d'une encre prolongeait le mieux la signalétique et était le plus léger. La vue du dessus avait le concept le plus fort, mais devenait chargée à 32 px. Les gommettes apportent la chaleur qui manquait à un menu lu par des parents et montré à des enfants, sans retomber dans le volume. C'est le choix de Florian.

### D2 — Une grammaire écrite plutôt qu'une palette seule

La cohérence d'un jeu dessiné à la main tient à ses règles, pas à ses couleurs. Elles sont écrites dans l'en-tête du sprite :

- de deux à cinq pièces de papier par dessin, trois couleurs au plus ;
- une palette commune de papiers, écrits en dur : ce ne sont pas des jetons d'interface, et ils ne changent pas avec la palette ;
- un détail est une pièce collée (une rayure, une pépite, un reflet), jamais un trait dessiné ;
- chaque dessin est incliné de 0 à 8°, dans un sens ou dans l'autre, comme collé à la main ;
- les dessins sont bâtis sur une grille de 48, comme le reste du sprite.

*Écartée :* des couleurs en jetons (`var(--…)`). Elles feraient varier les papiers avec la palette, ce que personne n'a demandé, et ajouteraient trente paires à mesurer dans `contrast.test.ts` pour des dessins décoratifs.

### D3 — L'ombre de papier est la silhouette décalée, posée comme une forme

Chaque symbole contient deux fois son dessin. D'abord une silhouette, où chaque `fill` et chaque `stroke` deviennent l'encre (`#1F2A26`), décalée de `translate(1.3 1.8)` et posée à `opacity=".16"`. Ensuite le dessin lui-même. Le tout est enveloppé dans la rotation du dessin.

C'est ce qui fait le « collé » de la série, et c'est aussi ce qui détache du fond clair les pièces très claires (un os, un blanc d'œuf, un bol blanc). En sombre, l'ombre se fond dans le fond, sans gêne.

*Écartées :*

- **Un `feDropShadow` ou un `filter`** : c'est le choix que D58 avait déjà écarté, à cause du coût de rendu de sept vignettes simultanées sur un téléphone d'entrée de gamme.
- **Un `<use>` de la silhouette** : il hériterait des couleurs du dessin, qui sont écrites sur chaque pièce, et ne pourrait donc pas être recoloré.

Le coût est le poids : la géométrie est écrite deux fois. Le sprite passe de 7,5 à 10,3 Ko compressés. C'est négligeable pour une page, et ça ne touche pas le budget JavaScript.

Pour ajouter un dessin, on reproduit le procédé tel quel : on dessine les pièces, on duplique le groupe en silhouette à l'encre, on décale de 1,3 et 1,8 à 16 %, puis on incline l'ensemble.

### D4 — Le dessin grandit, le disque non

Les volumes laissaient de l'air autour d'eux, alors que les gommettes remplissent leur case. À taille égale, elles paraissaient pourtant plus petites, parce que leur ombre et leur inclinaison mangent le bord. Le dessin du plat passe donc de 64 à 70 px dans le disque de 88 px (de 76 à 84 px dans celui de 104 px au palier large), et la vignette d'une ligne de 32 à 36 px (de 40 à 44 px). Le disque garde sa taille, et la mise en page ne bouge pas : la colonne de la vignette suit `--ill-ligne`, et une ligne reste plus haute que la cible tactile.

## Risks / Trade-offs

- **La courgette et le concombre se ressemblent** → la courgette porte sa fleur, et le concombre une rondelle. Les deux se croisent rarement le même jour.
- **« Légume » est un dessin arbitraire** (un poivron et un champignon), parce que l'entrée couvre aussi bien les plats végétariens que les épinards. Ce n'est pas une régression : le dessin précédent l'était tout autant.
- **Les papiers ne sont pas mesurés en contraste.** Ils sont décoratifs, et la spec ne leur demande que d'être identifiables. La planche de contrôle les a vérifiés sur les six surfaces.
