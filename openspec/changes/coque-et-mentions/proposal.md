## Why

Cinq défauts se sont accumulés dans la coque et dans les mentions qu'elle porte. Ils n'ont pas la même gravité, mais ils partagent une origine : chacun est le reliquat d'une décision antérieure que la suivante n'a pas fini de déplacer.

**Le plus grave est invisible.** Sur l'écran des mentions et dans la fiche de journée, les liens sont peints en `--fond` — la couleur crème du fond de page — sur une carte blanche. Le rapport mesuré est de **1,17:1**, là où le seuil est de 4,5:1. Ces liens sont pratiquement illisibles. C'est un survivant de l'apparence sombre supprimée par D25 : sur un fond sombre, `--fond` était la couleur claire, et c'était juste. La palette a été retournée, les deux déclarations sont restées.

Le contrôle de contraste ne l'a pas vu, et ne pouvait pas le voir : il vérifie des **paires de jetons** déclarées dans sa table, pas les paires que les composants forment réellement. Une encre qui est en fait une surface n'existe pas pour lui.

**Le plus visible est faux.** L'écran du jour affiche « Aujourd'hui » quel que soit le jour consulté, parce que la mention est calculée depuis la cible résolue à l'ouverture et non depuis le jour affiché. C'est exactement la confusion que D45 avait été écrit pour empêcher, rouverte par l'autre bout : un parent lisant le menu de jeudi sous la mention « Aujourd'hui ».

Les trois autres sont des dettes de disposition. Le pied de source aligne deux textes sur des lignes de base distantes de quatorze pixels et se lit comme un chevauchement. La coque réserve sous son contenu un intervalle qui s'ajoute à une réserve déjà dimensionnée. Et les commandes de sortie des écrans secondaires vivent en fin de flux, hors du champ, tandis que la roue crantée occupe le haut d'écrans où elle ne mène nulle part.

## What Changes

- **La mention situe le jour consulté.** Tant que l'écran montre ce que le système a choisi, elle dit pourquoi — « Prochain service · dans 10 jours ». Dès que l'utilisateur navigue, elle dit la distance — « Demain », « Dans 4 jours », « Il y a 2 jours ».
- **La date devient le titre de premier niveau** des écrans de menu. Le titre fixe « Menu de la cantine » et la baseline « Bon appétit ! » disparaissent : ils ne disaient rien que l'application ne dise déjà par sa seule présence. `EnTete` perd sa baseline et ne sert plus que les trois écrans secondaires.
- **La sortie d'un écran secondaire remonte dans l'enseigne**, à l'emplacement de la roue crantée, qui s'y efface. L'emplacement porte l'un ou l'autre, jamais les deux, jamais rien. Depuis le menu de grève, elle ramène aux réglages d'où l'on vient, et non au menu.
- **Le pied de source est extrait en un composant**, aligné sur sa cible tactile. Il était recopié trois fois, avec le même défaut d'alignement trois fois.
- **Les deux liens illisibles passent en `--accent`**, et le contrôle de contraste refuse désormais qu'un jeton de surface serve d'encre.

Hors périmètre, explicitement : la commande de retour au jour du repère, sur les écrans de menu, ne bouge pas. Elle dépend du contenu, apparaît et disparaît, et D55 l'a placée là où son arrivée ne pousse rien de déjà lu. Elle n'a de commun avec les sorties d'écran que son nom.

## Capabilities

### Modified Capabilities

- `menu-browsing`: la mention qui situe le jour devient relative au jour consulté ; le titre de premier niveau des écrans de menu devient la période affichée ; la sortie d'un écran secondaire passe de la fin du flux à l'en-tête ; le contrôle de contraste s'étend à la distinction entre encre et surface.

## Impact

- **Correction d'accessibilité** : deux liens passent de 1,17:1 à 5,77:1. C'est la seule partie de ce changement qui répare une violation WCAG effective.
- **Contrat en retard rattrapé** : l'exigence *Accès aux écrans* décrit encore une barre ancrée au bas de la fenêtre contenant les destinations quotidiennes. Les commits `06ec7d9` et `4ac2441` ont retiré les onglets hors des écrans de menu sans la reprendre. Elle décrit une application qui n'existe plus, et ce changement la réécrit de toute façon.
- **Composant retiré** : `EnTete` perd sa baseline ; `CommandeRetour` perd trois de ses cinq appelants et retrouve le seul rôle que son docblock décrit.
- **Composant ajouté** : `PiedSource`, qui absorbe trois copies du même pied.
- **Filet élargi** : `contrast.test.ts` acquiert une seconde règle, structurelle plutôt que numérique — les jetons de surface ne sont pas des encres. Elle ne vérifie pas la paire réellement formée ; elle rend la classe d'erreur impossible à écrire.
- **Tests à reprendre** : `EnTete.test.ts` (baseline), `coque.spec.ts` (la sortie change de rôle et de place), `labels.test.ts` (nouvelle fonction de mention), plus les contrôles de titre de premier niveau de `smoke`, `offline` et `qualite`, dont la cible change de texte sans changer de compte.
