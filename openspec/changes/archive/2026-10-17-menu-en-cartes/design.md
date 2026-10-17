# Refonte « Menu en cartes » — décisions

Les décisions précédentes vont de D1 à D48. Celles-ci reprennent à D49. Quatre d'entre
elles **annulent** une décision en vigueur : elles le disent, et disent pourquoi, afin que la
prochaine lecture du dépôt ne les prenne pas pour des régressions.

## D49 — La palette passe au clair (annule D25)

D25 tenait qu'il n'y a qu'une palette, un fond profond, des plateaux clairs, et qu'il n'existe
donc pas de seconde valeur à tenir cohérente. **Le premier membre de cette phrase est conservé,
le second est retourné :** il n'y a toujours qu'une palette, et elle est claire.

Le motif n'est pas technique. L'ardoise sombre se lit comme un tableau d'affichage ; l'objet
qu'on veut est un menu de cantine d'école. C'est un arbitrage de goût, arrêté sur maquette.

Ce que D25 protégeait — l'absence de thème, l'absence de `prefers-color-scheme`, l'absence de
`data-theme` — reste protégé, et par le même test : `contrast.test.ts` continue de parcourir
tous les `.svelte` et d'échouer sur l'un de ces trois motifs.

```
  --fond        #f4ecdd   crème, remplace --table
  --carte       #ffffff
  --bord        #ddd0b8   séparation, décorative
  --accent      #7e6130   doré : enseigne, pilule active, retour
  --ink         #2b2318   13,19:1 sur le fond, 15,48:1 sur la carte
  --ink-muted   #6d6353    5,03:1 sur le fond,  5,90:1 sur la carte
  --on-accent   #ffffff    5,77:1 sur l'accent
```

`--on-table` **disparaît**. Avec lui disparaissent les huit transparences déclarées dans
`TRANSPARENCES` : elles portaient toutes sur une encre claire posée sur un fond sombre, et
aucune n'a de sens sur une carte blanche. Les atténuations qui restent nécessaires sont
réécrites en `color-mix` sur `--ink`, et **doivent être redéclarées** — le contrôle de
couverture du test échoue sur toute transparence qu'il ne connaît pas, et c'est ce qui fait sa
valeur.

## D50 — La couleur porte le rôle (annule D39, commit `08f232f`)

D39 s'intitulait « donne la surface à ce qui varie, pas au rôle ». L'argument était juste :
« Entrée » est écrit tous les jours de l'année, tandis que le plat est volaille un jour et
poisson le lendemain — colorer le rôle, c'est dépenser la couleur sur une constante.

**L'argument n'est pas réfuté, il est subordonné.** Avec sept cartes empilées et du défilement,
la couleur cesse de servir à distinguer un contenu pour servir à se repérer dans une liste :
elle ne dit plus *quoi*, elle dit *où l'on en est*. C'est une fonction que la famille, qui change
chaque jour, ne peut pas remplir — un repère qui bouge n'est pas un repère.

Le coût est celui que D28 reprochait au compartiment du pain : deux éléments pour un seul fait,
la pastille colorée et le libellé écrit à côté. Il est accepté ici, parce que le libellé seul ne
donne aucun rythme à une liste longue.

**Un seul jeton par rôle**, contre trois pour une famille. Chaque valeur est choisie pour tenir
4,5:1 à la fois sur la carte blanche et sur le fond crème, ce qui la rend utilisable **sans
variante** comme aplat de pastille (glyphe blanc dessus) et comme encre du libellé. Le patron à
trois valeurs des familles n'avait de raison d'être que parce qu'un aplat saturé ne peut pas
porter de texte ; en calculant l'aplat pour qu'il le puisse, la troisième valeur s'évapore.

```
  --role-entree          #217b2d    5,34:1 carte · 4,55:1 fond · 5,34:1 blanc dessus
  --role-plat            #ad510b    5,30:1 · 4,52:1 · 5,30:1
  --role-accompagnement  #8d6411    5,30:1 · 4,51:1 · 5,30:1
  --role-laitage         #1c70ac    5,30:1 · 4,51:1 · 5,30:1
  --role-dessert         #cb2461    5,30:1 · 4,51:1 · 5,30:1
  --role-pain            #955f35    5,29:1 · 4,51:1 · 5,29:1
  --role-gouter          #934cb6    5,32:1 · 4,53:1 · 5,32:1
```

La maquette n'en propose que quatre, et dans des tons plus pâles. Trois sont inventées, et les
sept sont assombries jusqu'au seuil : le dépôt tient déjà que « le parti pris est la couleur
franche plutôt que le pastel terreux », et un pastel ne porte pas de texte.

## D51 — Une illustration par carte (annule D40)

D40 tenait qu'un dessin sur l'écran signifie « c'est le plat du jour », et qu'un dessin porté
par tout le monde ne signifie plus rien. C'est vrai, et c'est perdu : deux cartes du même écran
pourront porter le même dessin — « Pain » et « Panibuns aux fromages » donnent tous deux
`ill-pain`.

Ce qui remplace ce sens : l'illustration devient un repère de balayage, au même titre que la
pastille. Elle ne hiérarchise plus, elle ancre. Le rang du plat n'est plus dit par le dessin
mais par le seul corps de son nom.

**Il n'y a pas de photographies**, et il n'y en aura pas dans ce change : pas de champ `image`
au schéma, saisie manuelle, et un budget de premier chargement à 150 Ko que `check-budget.js`
fait respecter. Les vignettes sont les treize illustrations du sprite, déjà montées une fois
pour toute l'application et sans coût réseau.

## D52 — Les onglets remontent, le pied se fixe (annule `navigation-basse`)

`navigation-basse` avait descendu les onglets dans la zone du pouce. La raison n'a pas cessé
d'être vraie ; elle est écartée au profit de la fidélité à la direction visuelle.

La barre basse est remplacée par un **pied fixe** portant les mentions légales. Il doit mesurer
au moins `44px + env(safe-area-inset-bottom)` : `qualite.spec.ts` exige toute cible visible à
44 pixels, et son sélecteur ne dispense pas un `<a>` posé directement dans un `footer`.

`--barre` et `--barre-reservee` deviennent `--pied` et `--pied-reserve`. Le calcul reste celui
de D34, et pour la même raison : `viewport-fit=cover` étend la page sous l'indicateur d'accueil,
et réserver la seule hauteur du pied ferait passer la dernière carte dessous — sur les appareils
concernés uniquement, donc jamais sur une machine de développement.

La date de mise à jour et le lien vers le PDF officiel, aujourd'hui dans le `footer` de chaque
écran de menu, redescendent **dans le flux**, après la dernière carte. Un pied fixe ne peut pas
porter une information qui varie d'un écran à l'autre sans devenir un second en-tête.

## D53 — Le défilement est assumé, mais borné

Sept rôles en cartes ne tiennent pas sur un téléphone. `hauteur.spec.ts` interdisait exactement
cela ; il est **remplacé, non supprimé**. La contrainte périmée — « tout tient au-dessus de la
barre » — tombe. La garantie qui la motivait est conservée sous une forme plus faible et
toujours vérifiable : **la première carte est entièrement visible sans défiler.**

Un test supprimé ne laisse aucune trace de ce qu'il garantissait. Un test affaibli le dit.

Conséquence à vérifier au doigt, que rien n'automatise : le défilement vertical devient l'usage
normal de l'écran, ce qui augmente mécaniquement le risque qu'un appui destiné à faire défiler
ouvre la fiche du jour. `touch-action: pan-y` reste obligatoire sur la surface de balayage.

## D54 — Les familles survivent, déplacées

`classify()` reste : c'est lui qui choisit l'illustration, et `families.test.ts` continue de
vérifier sur le corpus réel que « Moussaka » est le seul plat principal inclassable.

Les jetons `--fam-*` ne servent plus l'écran du jour. Ils sont **conservés pour l'écran de la
semaine**, où le disque de 58 pixels distingue les cinq jours. Là, D39 n'est pas annulée : il
n'y a aucun rôle à distinguer sur cet écran, et la famille est bien ce qui varie d'un jour à
l'autre. Les deux décisions ne se contredisent pas — elles s'appliquent à deux écrans qui ne
posent pas la même question.

## D55 — La commande de retour quitte l'en-tête (annule D44)

D44 avait donné à la mention et à la commande de retour **un emplacement unique**, occupé par
l'une ou par l'autre, jamais par les deux, avec une hauteur réservée pour qu'un balayage ne
déplace rien.

L'en-tête n'est plus le même objet : il porte désormais un titre fixe et une baseline, et la
mention qui situe le jour est descendue dans le rang de navigation, entre les deux flèches —
c'est là que la maquette la place, et c'est là qu'elle est le plus utile, contre le geste qui la
fait changer.

La commande de retour prend donc un rang propre, **sous les cartes**. Elle reste conditionnelle,
et la réservation de hauteur cesse d'être nécessaire : elle apparaît en fin de flux, où son
arrivée ne pousse aucun contenu déjà lu. Le contrat de `EnTete` s'en trouve rétréci, pas élargi.

## D56 — Un seul rang de flèches

La maquette dessine la navigation deux fois, en haut et en bas de la liste. C'est une redondance
de maquette, pas une intention : deux jeux de commandes pour une seule action, dont l'un sort du
champ dès qu'on défile.

Le rang **haut** porte les deux flèches et, entre elles, la mention et la date. Le rang **bas**
ne porte que le retour, et seulement lorsqu'on est écarté du jour repère.

## Scénarios retirés de la spec principale

Ajouté à l'archivage, le 17 octobre 2026. Un bloc MODIFIED remplace l'exigence entière ; ces scénarios de la spec principale décrivaient un état que ce changement abandonne, et sont retirés délibérément. Les autres ont été recopiés dans le delta.

- **En-tête d'écran — « L'en-tête situe la date », « Date longue et mention longue »** : la mention quitte l'en-tête pour le rang de navigation.
- **En-tête d'écran — « La mention cède la place à la commande », « Le titre reste complet sans la mention »** : la commande de retour quitte l'en-tête pour la suite du contenu (D55).
- **Accès aux écrans — « Zone sûre inférieure »** : les onglets ne sont plus ancrés au bas de la fenêtre ; l'encart bas relève de « Pied fixe de mentions », scénario « Encart bas du système ».

