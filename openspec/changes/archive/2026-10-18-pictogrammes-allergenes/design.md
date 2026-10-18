## Context

`AllergenChip` reçoit `codes` et `names`, alignés : `flaggedAllergenNames` (jour) et `flagged()` (semaine) produisent les noms à partir des mêmes codes, dans le même ordre. Le composant ne dessine pourtant que `codes[0]`. Le pictogramme est décoratif (`aria-hidden`) : il double le texte sans jamais le remplacer, et c'est le texte qui fait foi.

## Goals / Non-Goals

**Goals:**

- Que le dessin ne dise jamais moins que ce que l'œil peut en attendre : chaque allergène signalé a son pictogramme, jusqu'au plafond.
- Ne pas allonger la pastille : autant de lignes avec trois pictogrammes qu'avec un seul, sur les deux écrans à 320 px. Une seule ligne n'est pas atteignable : avant ce changement, le texte passait déjà à la ligne sur la carte du jour dès trois allergènes surveillés, et sur la semaine dès cinq.

**Non-Goals:**

- Changer le texte de la pastille, ni ce qu'elle compte sur la semaine (« 3 plats · … »).
- Toucher au filtre, à la fiche ou à la légende.

## Decisions

### D1 — Un pictogramme par allergène signalé, dans l'ordre du texte

Les pictogrammes suivent `codes`, donc l'ordre des noms. Un dessin à la position *n* correspond au nom à la position *n* : on lit l'un et l'autre dans le même sens, sans réappariement.

### D2 — Trois au plus, et le texte porte le reste

Au-delà de trois, la pastille cesse d'être un repère et devient une frise, et sur la semaine elle passerait à la ligne. On s'arrête donc à trois, sans marqueur « +N » : ce marqueur répéterait en moins bien ce que le texte dit en entier juste à côté. La règle « le pictogramme double le texte, ne le remplace pas » rend ce plafond sûr : rien de ce qui est tronqué n'est perdu.

Alternative écartée : les pictogrammes en chevauchement, comme une pile d'avatars. Le gain de largeur se paie en lisibilité, et un pictogramme d'allergène à demi masqué est pire qu'un pictogramme absent.

### D3 — Dans le composant, pour les deux écrans

Le défaut est dans `AllergenChip` ; la correction y est aussi. Le jour et la semaine en héritent sans changement d'appel.

### D4 — Le texte coule après les pictogrammes, dans une pastille arrondie

Découvert à la mise en œuvre. La pastille était une rangée flexible : le pictogramme d'un côté, le texte dans une colonne de l'autre. Avec trois pictogrammes, cette colonne rétrécissait, et la pastille de l'entrée du 31 août passait de deux lignes à trois (36 → 51 px).

La pastille devient un bloc en ligne : les pictogrammes ouvrent la première ligne, et le texte qui passe à la ligne suivante reprend toute la largeur. Le nombre de lignes redevient celui d'avant (38 px sur le jour ; jamais plus de deux sur la semaine avec cinq allergènes surveillés). Le gain se paie de 1 à 2 px de hauteur, ceux de la boîte de ligne.

Cette seconde ligne commence au bord gauche, qu'un arrondi de pilule mordait. La pastille prend donc `--radius-pastille` au lieu de `--radius-pilule`, avec un retrait égal des deux côtés. Sur une ligne, 10 px de rayon pour 20 à 23 px de hauteur se lisent encore comme une pilule.

Alternative écartée : baisser le plafond à deux. Le défaut venait de la mise en page, pas du nombre de pictogrammes.

## Risks / Trade-offs

- [Largeur sur la semaine] Trois pictogrammes de 13 px ajoutent une trentaine de pixels à une pastille déjà chargée de texte → mesuré à 320 px, et résolu par D4.
- [Budget JavaScript à 96 %] Une boucle sur un tableau ne pèse presque rien, mais la mesure se relève quand même.
