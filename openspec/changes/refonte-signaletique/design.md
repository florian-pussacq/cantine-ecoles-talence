## Context

Voir `proposal.md` pour le pourquoi. Ce qui contraint le comment :

- **Tout passe par `tokens.css`.** `design-tokens.test.ts` refuse une valeur littérale dans un composant, et `contrast.test.ts` mesure chaque paire dans les deux palettes. Une refonte est donc, pour moitié, une réécriture des jetons, et les tests disent aussitôt ce qui casse.
- **La page 404 autonome recopie les jetons** qu'elle emploie, et un test vérifie qu'elle reste à jour.
- **Le sprite est injecté dans `app.html` au build** (D57). Les illustrations ne coûtent rien au JavaScript, et cette refonte ne les touche pas.
- **Le service worker précache `immutable`** (`$app/manifest`). Tout fichier que Vite émet, une police comprise, est donc disponible hors ligne sans code nouveau.
- **La maquette de référence est A2**, sur le canevas « Cantine Talence — pistes UI ». Elle a été dessinée avant la relecture des specs. Ce document tranche là où elle les contredisait, et le signale à chaque fois (« écart à la maquette »).

## Goals / Non-Goals

**Goals:**

- Remplacer le monde visuel en entier, et non le polir : la palette, la typographie, la composition de l'écran du jour et de la semaine, la position des onglets.
- Faire tenir le déjeuner entier dans un écran de téléphone de 390 × 844 pixels un jour ordinaire.
- Ne laisser au catalogue d'Impeccable rien à relever sur les deux écrans de menu.

**Non-Goals:**

- Le comportement : la fiche du jour, le filtre d'allergènes, le geste, le hors-ligne et la résolution du jour restent ce qu'ils sont. Seul leur habillage change.
- Les illustrations : le sprite et `classify()` sont inchangés. Les plats inclassables (« Croustade limousine ») relèvent d'un autre changement.
- Un réglage d'apparence : on suit toujours le système.
- Le mouvement : la glisse de 260 ms et sa courbe restent. Aucune animation n'est ajoutée.

## Decisions

### D1 — La direction « Signalétique », lue en mode Operate

L'écran est un outil qu'on consulte en dix secondes, le matin avant l'école ou le soir pour le dîner. Impeccable classe ce genre de surface en *Operate* : la précision et la retenue y tiennent lieu d'ambition, et la couleur ne sert qu'à ce qui informe. La direction emprunte au panneau d'affichage, avec une grille stricte, un grand chiffre, de l'encre sur un fond froid, et une couleur par information : la famille, l'alerte, et rien d'autre.

*Écartées :* « Plateau » (piste B), qui reprenait les alvéoles de D5 mais restait fragile devant les libellés longs dans de petites alvéoles ; « Nocturne » (piste C), pensée sombre d'abord, avec une famille de police en une seule graisse.

*Scène, pour l'apparence :* un parent, sur son téléphone, en plein jour comme à la lampe du soir. Les deux palettes sont donc composées l'une et l'autre, et la préférence du système décide.

### D2 — La palette claire quitte le crème

| Jeton | Valeur | Rôle |
|---|---|---|
| `--fond` | `#F2F3F0` | gris-vert froid ; le crème est l'habitude que le catalogue nomme « tasteful default » |
| `--carte` | `#FFFFFF` | surface des commandes et de la fiche |
| `--encre` | `#131614` | texte, filets forts, accent |
| `--encre-douce` | `#545A55` | rôles, mentions, allergènes (6,4:1 sur le fond) |
| `--bord` | `#DADDD6` | filets entre les lignes (décoratifs) |
| `--accent` | `= --encre` | l'onglet actif et l'étiquette « Aujourd'hui » |
| `--alerte` | `#F5C518` | le jaune de signalisation, sous une encre `#131614` (11:1) |

L'**accent devient l'encre.** Il n'y a plus de couleur d'accent qui ne veuille rien dire. L'exigence « Le jour courant se marque d'une seule façon » (une étiquette sur l'aplat de l'accent) tient donc sans être modifiée : l'étiquette est une inversion, du texte clair sur l'encre.

Les **familles gardent leurs valeurs claires** actuelles, qui tiennent déjà 4,5:1 sous du blanc. La viande est la plus juste (4,55:1), et le test la garde.

*Écart à la maquette :* la bordure des flèches y était `#C4C9C2`, à 1,7:1. Une bordure de commande porte une information et doit tenir 3:1. Elle reste donc `--voile-trait`.

### D3 — La palette sombre est recomposée, pas inversée

Fond `#111412`, carte `#1A1E1B`, encre `#EDEFEA`, encre douce `#9AA29C` (7:1).

Les familles passent à des **tons profonds sous du blanc** plutôt qu'à des tons clairs sous du foncé : un aplat saumon de 150 pixels éblouit à la lampe. Les valeurs sont viande `#8E2A1F`, volaille `#7A4A00`, poisson `#0F5C91`, végétarien `#1B6B33` et repli `#4E5853`, toutes au-dessus de 6,5:1 sous du blanc. `--sur-famille` vaut donc blanc dans les deux palettes. Les teintes pâles sombres actuelles sont gardées pour le disque de l'illustration. Le jaune d'alerte est le même dans les deux palettes.

Le texte clair sur fond sombre reçoit un léger espacement de lettres (0,005em), comme le recommande Impeccable pour compenser la lecture en clair sur foncé.

### D4 — Une famille de police, deux coupes, servies par l'application

**Funnel Sans** compose tout le texte. **Funnel Display**, sa coupe d'affichage, est réservée au titre de l'écran (le grand chiffre) et au nom du plat principal. C'est une seule famille au sens d'Impeccable (« one family is often right » en Operate) : pas de serif d'emprunt. La piste C le suggérait, et la relecture des références l'a écarté.

- **Livraison :** les fichiers woff2 variables du sous-ensemble latin (17,4 Ko et 17,7 Ko), copiés depuis `@fontsource-variable/funnel-*` dans `src/lib/design/polices/` et déclarés par `@font-face` dans `tokens.css`. Vite les empreinte, et le service worker les précache par `immutable`. Le sous-ensemble latin couvre « Œ » et « œ ».
- **Chargement :** `font-display: swap`, une pile de repli système dont les métriques sont ajustées (`size-adjust`, `ascent-override`) pour limiter le saut, et un préchargement des deux fichiers par `resolve(…, { preload })` dans `hooks.server.ts`.
- **Jetons :** `--police-texte` et `--police-affichage`. Aucun composant ne nomme une famille (exigence « Les polices viennent de l'application »).
- **Budget :** 40 Ko pour l'ensemble des polices, mesuré par `check-budget.js`. Ajouter une graisse ou le sous-ensemble latin-ext (environ 9,5 Ko chacun) devient une décision visible.

*Écartée :* la pile système. Le `craft-floor` d'Impeccable la refuse comme voix d'affichage d'un monde propre. C'est elle qui rend l'application indiscernable de n'importe quelle autre.

*Écarté :* Google Fonts hébergé. Ce serait une requête tierce, refusée par `offline-app`.

### D5 — L'échelle typographique

Le rapport entre deux crans est d'environ 1,2, comme le veut Impeccable pour une interface Operate. Les crans sont 13 (rôle, mentions), 15 (commandes), 17 (nom d'un plat), 20 (jour et mois à côté du chiffre), 30 (plat principal, en Display), 56 (intervalle de la semaine) et 96 pixels (chiffre du jour).

Deux plafonds viennent d'Impeccable : 96 pixels au plus (6rem), et un espacement de lettres jamais sous -0,04em.

*Écart à la maquette :* la première version de A montait à 108 pixels et à -0,045em, au-delà de ces deux plafonds. A2 les respectait déjà.

Les chiffres sont à chasse fixe (`tabular-nums`). Le palier de l'écran large monte tout d'un cran sauf le chiffre du jour, déjà à son plafond.

### D6 — Le rang de navigation encadre toujours la mention

La spec impose des flèches qui encadrent la mention, et la mention dans le rang de navigation. La composition devient : `‹` à gauche ; entre les flèches, alignés à gauche, le titre (grand chiffre, jour et mois) puis la mention ; `›` à droite.

*Écart à la maquette :* A2 regroupait les deux flèches à droite. C'était plus compact, mais une exigence aurait dû céder pour un gain purement visuel.

La mention garde son vocabulaire (« Aujourd'hui », « Demain », « Férié · service dans 2 jours »). L'étiquette « Aujourd'hui » est une inversion, en texte clair sur l'encre. *Écart à la maquette :* A2 la marquait d'un point rond.

### D7 — Le déjeuner : un aplat, puis un tableau

- **Le plat principal ouvre la suite.** Impeccable le dit ainsi : la hiérarchie suit la priorité du produit, pas l'ordre du gabarit. Pour un parent, la question est « qu'est-ce qu'il mange », et la réponse est le plat principal. Il occupe un aplat de sa famille (rayon 8 pixels) : le nom en Display 30 pixels blanc, puis « Plat principal · Volaille », puis son signalement d'allergène. L'illustration repose sur un disque de 88 pixels à la teinte pâle, jamais sur l'aplat (D15, toujours valable).
- **Les autres rôles sont des lignes** sur une grille de trois colonnes : 112 pixels pour le rôle, la colonne flexible pour le plat, 32 pixels pour la vignette. Un filet `--bord` sépare les lignes, sans carte ni ombre. Le nom du plat est en 17 pixels de graisse 500. Dessous, en 13 pixels d'encre douce, viennent les mentions de qualité (« Bio », « Label Rouge »), puis la pastille d'allergène s'il y en a une.
- **Le pain** garde la règle de `labels.ts` : quand le libellé n'est que le nom du rôle, la mention de qualité le remplace (« Pain » → « Label Rouge »).
- **Le goûter** reste une ligne compacte et une cible distincte, séparée du déjeuner par un filet d'encre de 2 pixels et un intervalle plus grand au-dessus qu'en dessous.
- **Ordre de la fiche.** `allergen-filter` exige que la fiche suive l'ordre de l'écran : elle ouvre donc, elle aussi, sur le plat principal.

*Écart à la maquette :* A2 écrivait tous les allergènes de chaque plat sous son nom. On ne garde que la pastille des allergènes surveillés, et la liste complète reste dans la fiche, comme aujourd'hui. Un parent sans allergie surveillée n'a pas à lire « lait, moutarde, sulfites » sept fois (`distill`). C'est réversible, et c'est le premier point à rouvrir si l'usage le contredit.

`PastilleRole.svelte` disparaît : le rôle est un mot dans une colonne, et le glyphe en tuile arrondie était l'« icon tile » du catalogue. Le repli prévu par `enseigne-et-ardoise` (un glyphe monochrome devant le mot) reste possible.

### D8 — Les messages restent trois tons, en plus compacts

Les tons alerte, événement et info, et leur ordre, sont inchangés (exigence « Les messages portent un ton »). Ce qui change est leur forme : une étiquette sur la surface du ton, suivie au besoin d'une ligne d'encre douce, au lieu d'un bloc pleine largeur.

L'intitulé des vacances reste un message de ton événement, posé sous le rang de navigation. *Écart à la maquette :* A2 le fondait dans la mention, ce qui aurait cassé le scénario « l'intitulé des vacances se lit d'abord sur le ton événement ».

### D9 — La pastille d'allergène passe au jaune

Elle prend la surface d'alerte avec l'encre noire, le pictogramme de chaque allergène surveillé (trois au plus, exigence inchangée) et leurs noms. Un allergène surveillé dans un plat compromet ce repas pour cet enfant : c'est le sens même de l'alerte. L'exigence ne réserve la couleur d'alerte que parmi les **tons de message**, et la pastille n'en est pas un.

Le triangle de la maquette est remplacé par les pictogrammes d'allergènes, que la spec impose.

L'indication du filtre actif reste portée par la commande des réglages, avec le compte (exigence « Visibilité du filtre actif »). *Écart à la maquette :* A2 ajoutait un lien « Œufs signalés » à côté de « Aujourd'hui ». Ce serait une seconde commande pour le même état. Il est retiré.

### D10 — La semaine : une tuile par jour, la famille écrite

- **Chaque ligne** porte une tuile de 56 pixels à la couleur de la famille, avec le jour abrégé et le quantième en Display. À côté : le plat principal en 17 pixels de graisse 600, puis « Volaille · » suivi des autres plats en encre douce, puis la pastille d'allergène du jour.
- **Plus de légende.** La famille écrite la rend inutile, et elle était le seul endroit où la couleur parlait seule.
- **Un plat inclassable** a une tuile au gris de repli et pas de nom de famille. *Écart à la maquette :* A2 écrivait « Non précisé ».
- **Un jour non servi** (férié, sans école, non publié) a une tuile au contour pointillé, sans aplat, avec son libellé propre.
- **Le jour courant** porte l'étiquette « Aujourd'hui » (D6). *Écart à la maquette :* A2 le cernait d'un contour de 2 pixels décalé, exactement ce que la spec interdit parce que cela ressemble au focus.
- **Le titre** est l'intervalle en Display 56 pixels (« 2–6 »), suivi du mois, sur une seule ligne (scénario « Période de la semaine »).

### D11 — La barre redescend, les mentions entrent dans le flux (annule D52)

La barre Jour/Semaine revient au bas de la fenêtre, sous le pouce : la raison de D31 n'a jamais cessé d'être vraie. D52 l'avait sacrifiée à la fidélité d'une maquette. C'est cette fois la maquette retenue qui la remet en bas, et l'humain l'a confirmé.

Le pied fixe des mentions disparaît. Une page consultée une fois n'a pas à occuper en permanence la zone la plus accessible de l'écran. Le lien vers les mentions suit la provenance des données (« Menus mis à jour le… · PDF officiel ») à la fin de chaque écran de menu, et l'écran des réglages en porte un aussi.

Les jetons `--pied`, `--encart-bas` et `--pied-reserve` deviennent `--barre`, `--encart-bas` et `--barre-reserve`. Le calcul de D34 est inchangé : la réserve vaut la hauteur de la barre plus la zone sûre, et non la seule hauteur.

L'onglet actif est souligné par un trait d'encre de 3 pixels au haut de la barre, sans pilule.

### D12 — Les surfaces du navigateur

`tokens.css` déclare, dans chaque palette :

- `::selection` : l'encre en surface et le fond en texte ;
- `caret-color` ;
- un `:focus-visible` de 2 pixels d'encre décalé de 2 pixels, le même pour tous ;
- `text-underline-offset: 3px` et une épaisseur de soulignement qui double au survol.

Le `craft-floor` d'Impeccable note que c'est le signal le moins coûteux d'une page construite plutôt qu'assemblée.

## Risks / Trade-offs

- **Troisième aller-retour des onglets (D31 → D52 → D11).** Le risque est qu'une prochaine maquette les remonte. → La raison est écrite dans D11, et « Accès aux écrans » le spécifie maintenant (« ancré au bas de la fenêtre ») : le remonter exigera de modifier une exigence, pas seulement un composant.
- **Le plat principal avant l'entrée** rompt avec l'ordre du menu imprimé, et la fiche suit. → C'est assumé (D7). Les tests de l'ordre de la fiche changent avec l'écran, dans le même commit.
- **Saut de mise en page au chargement de la police.** → Repli aux métriques ajustées, préchargement, et un fichier par coupe. Le test « aucun déplacement à l'hydratation » doit rester vert.
- **Jaune et volaille.** Le test « l'alerte ne ressemble à aucun plat » mesure une distance entre couleurs. Le jaune est bien plus clair que l'ambre, mais leurs teintes sont voisines. → On fait tourner le test tôt. S'il échoue, on décale le jaune vers le citron (`#F2D50F`) plutôt que de toucher à la volaille.
- **Jaune sur fond clair.** La pastille ne se détache du fond qu'à environ 1,5:1. → Elle ne porte pas d'information par son contour : son texte noir (11:1) et ses pictogrammes la portent. C'est le cas de la surface d'un ton de message, que la spec traite déjà ainsi.
- **La viande claire est à 4,55:1 sous du blanc**, juste au seuil. → Inchangée, et mesurée. Un nom de plat de 30 pixels en Display relève du seuil du grand texte (3:1).
- **Réécriture des tests de composants** (`ListeDuJour`, `FicheJour`, `EnTete`, `Bandeau`) **et de bout en bout.** → Les tests qui décrivent un comportement inchangé sont adaptés, pas supprimés. Ceux qui décrivaient la carte sont remplacés par les scénarios des nouvelles exigences.

## Migration Plan

Aucune donnée ne migre. Le changement se livre en un lot de commits locaux, chacun vert (`npm run validate && npm run build && npm run test:e2e`). Le premier commit pose les jetons et les polices sans toucher aux composants, ce qui est possible parce que ceux-ci ne lisent que des jetons. La mise en ligne reste le geste `publier` de l'humain. Le retour arrière consiste à revenir sur ces commits : aucun état n'est stocké chez l'utilisateur, hors le filtre d'allergènes, qui ne change pas.

## Open Questions

- **La semaine de vacances** répète l'intitulé sur chaque jour, comme l'exige le scénario « Semaine de vacances ». Le catalogue d'Impeccable relèverait cette répétition. Le dire une fois au niveau de la semaine, quand les cinq jours le partagent, serait un changement de spec à part.
- **Les captures de référence**, s'il en existe dans `e2e/`, seront régénérées. Leur liste se fera à l'implémentation.
