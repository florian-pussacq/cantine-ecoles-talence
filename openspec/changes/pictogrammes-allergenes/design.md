## Context

`AllergenChip` reçoit `codes` et `names`, alignés : `flaggedAllergenNames` (jour) et `flagged()` (semaine) produisent les noms à partir des mêmes codes, dans le même ordre. Le composant ne dessine pourtant que `codes[0]`. Le pictogramme est décoratif (`aria-hidden`) : il double le texte sans jamais le remplacer, et c'est le texte qui fait foi.

## Goals / Non-Goals

**Goals:**

- Que le dessin ne dise jamais moins que ce que l'œil peut en attendre : chaque allergène signalé a son pictogramme, jusqu'au plafond.
- Garder la pastille sur une ligne, y compris sur la semaine à 320 px.

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

## Risks / Trade-offs

- [Largeur sur la semaine] Trois pictogrammes de 13 px ajoutent une trentaine de pixels à une pastille déjà chargée de texte → contrôle visuel à 320 px. Si elle passe à la ligne, l'espace entre pictogrammes se resserre avant que le plafond ne descende à deux.
- [Budget JavaScript à 96 %] Une boucle sur un tableau ne pèse presque rien, mais la mesure se relève quand même.
