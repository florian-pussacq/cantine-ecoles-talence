# Illustrations en volume — décisions

Les décisions précédentes vont de D1 à D56. Celles-ci reprennent à D57.

## D57 — Le sprite quitte le bundle pour la coque HTML

`Sprite.svelte` était un composant monté par le layout. Son contenu partait donc **deux fois** :
dans le bundle JavaScript, pour l'hydratation, et dans chaque page pré-rendue, par le rendu
serveur. Vérifié avant le changement : `grep 'symbol id="ill-'` le trouvait dans
`build/index.html` *et* dans `build/_app/immutable/nodes/0.*.js`.

Le JavaScript était à **55,0 / 60,0 Ko gzip**, soit 92 %, avant d'avoir ajouté un seul dessin.
Extrapolé sur le taux de compression réel du sprite (24,3 %), passer à cinquante-cinq symboles en
style volumétrique donnait 58,3 Ko — 97 % du budget. La bibliothèque devenait ingrandissable au
moment précis où l'on découvrait qu'il fallait l'agrandir.

Rien dans ce fichier n'a d'état ni de réactivité : c'est du décor statique. Il n'a donc aucune
raison de traverser Svelte. Il vit maintenant dans `src/lib/illustrations/sprite.svg` et est
injecté dans `app.html` au pré-rendu.

**Le mécanisme est un hook serveur, et le premier essai s'est trompé.** `transformIndexHtml` de
Vite ne s'applique pas à `app.html` : SvelteKit lit ce fichier lui-même, hors du traitement des
points d'entrée HTML de Vite. Un greffon écrit ainsi ne s'exécute jamais — le pré-rendu échoue en
signalant que `#marque` n'existe pas, ce qui est la bonne erreur au bon moment, mais pas la bonne
solution. `transformPageChunk`, dans `src/hooks.server.ts`, est le point prévu pour cela. Le site
étant entièrement pré-rendu, ce module tourne à la construction et n'est jamais livré.

**Un `<use href="sprite.svg#…">` externe a été écarté.** Il aurait sorti le sprite du HTML aussi,
mais le support WebKit des références inter-documents est peu fiable, et le public de cette
application est largement sur iOS. Un dessin qui ne s'affiche pas chez la moitié des parents
n'est pas une économie.

Résultat : **JS 52,6 Ko (88 %) avec trente et un dessins**, contre 55,0 Ko (92 %) avec treize.
Le premier chargement passe de 70,2 à 72,1 Ko sur un budget de 150. Agrandir la bibliothèque ne
coûte désormais plus rien au JavaScript.

**Un piège rencontré, à ne pas refaire.** Le commentaire posé dans `app.html` mentionnait
`%sveltekit.body%` pour expliquer la position du sprite. SvelteKit substitue ses jetons **partout
dans le fichier, y compris à l'intérieur d'un commentaire** : tout le corps de l'application
s'est retrouvé injecté au milieu de la phrase, et le document ne s'en relevait pas. Le
commentaire actuel porte l'avertissement.

## D58 — Le volume vient de voiles partagés, jamais d'un filtre

Trois façons d'obtenir du relief, mesurées pour cinquante-cinq symboles :

| Style | Brut | Gzip |
|---|---|---|
| Plat | 25,0 Ko | 6,1 Ko |
| Voiles partagés | 27,4 Ko | 6,7 Ko |
| Dégradé par symbole | 44,8 Ko | 10,9 Ko |

Un dégradé propre à chaque symbole coûte 1,8 fois plus d'octets pour le même rendu. Deux voiles
suffisent, et ils sont **neutres** : un lustre blanc en haut à gauche, une assise sombre en bas.
Étant des voiles d'opacité et non des couleurs, ils se posent sur n'importe quelle teinte — un
seul jeu sert les trente et un dessins.

**L'ombre est une forme posée, pas un `feDropShadow`.** Un filtre se recalcule à chaque peinture,
et l'écran du jour en affiche sept simultanément, contre un LCP tenu sous la seconde en 4G bridée
et CPU divisé par quatre. Une ellipse à 10 % d'opacité donne la même lecture pour un coût de
rendu nul. Mesuré après : LCP médian 568 ms.

La discipline du fichier ne bouge pas : formes pleines, aucun trait fin, lisibles de 15 à 46
pixels. Les aplats portent la forme ; le voile n'ajoute que du relief.

## D59 — La granularité suit le corpus, pas le dictionnaire

Treize dessins pour 149 libellés distincts, c'est un dessin pour onze plats. Le paquet `legume`
en portait quarante à lui seul.

On éclate ce qui collisionne réellement, mesuré sur les deux mois publiés — et l'on ne descend
pas jusqu'au plat nommé : **129 libellés sur 149 n'apparaissent qu'une seule fois**, et environ
65 nouveaux arrivent chaque mois. Un dessin par plat serait un dessin jetable par plat.

| Paquet | Éclaté en |
|---|---|
| `legume` (40) | `salade-composee` `salade-verte` `crudite-rapee` `tomate` `concombre` `chou` `courgette` `poireau` `legumineuse` `courge` `legume` |
| `fromage` (15) | `yaourt` `laitage-sucre` `fromage` |
| `fruit` (15) | `compote` `melon` `fruit-sirop` `fruit` |
| `gateau` (14) | `biscuit` `gateau` `mousse` |
| — | `fruits-de-mer` |

Viandes, volailles, poissons, féculents, pâtes, œufs, pain et chocolat restent groupés : leurs
paquets ne dépassaient pas onze libellés. **Pire collision ramenée de 40 à 11**, échecs de 8 %
à 5 %.

**Les cinq libellés restants le restent.** « Moussaka » peut être à l'agneau comme végétarienne ;
« Émincé au curry » et « Escalope viennoise » ne disent pas leur protéine ; « Goûter » est ce que
le document écrit quand il ne détaille pas ; « Dessert de l'Ordre Noir » est un intitulé de
journée à thème. Leur inventer un mot-clé serait l'approximation que D11 interdit — et comme la
famille colore le disque de l'écran de la semaine, une mauvaise déduction s'y verrait.

`gratin` a été envisagé puis écarté pour la même raison : « gratin de thon » et « gratin
dauphinois » ne relèvent pas de la même famille, et le mot-clé le plus long aurait fait gagner
`gratin` sur `thon`. `dauphinois` rejoint les féculents, ce qui est exact et sans pari.

## D60 — Seules les illustrations de plat prennent du volume

Les glyphes de rôle se rendent à 20 pixels, en blanc sur un aplat de couleur ; les pictogrammes
d'allergène à 15 pixels dans une pastille. À ces tailles, un dégradé ne se lit pas comme du
relief mais comme une salissure, et il coûterait des octets pour dégrader la lisibilité.

Ils gardent donc leur contrat : formes pleines, une seule teinte, silhouette distincte. Le volume
est réservé à ce qui se rend à 46 pixels sur un disque clair.
