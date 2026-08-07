# Corpus de test

## Le corpus golden

Un fichier golden associe un **PDF source** à la **sortie attendue**. C'est ce sur quoi le futur parser sera rejoué à chaque modification, et c'est ce qui permettra de le refactorer sans peur (PRD §10).

| PDF source                                          | Sortie attendue             |
| --------------------------------------------------- | --------------------------- |
| `sources/pdf/09-MENUS-WEB-SEPTEMBRE-2026.pdf`        | `static/data/2026-09.json`  |

La sortie attendue **n'est pas recopiée ici**. Le fichier publié est le fichier de référence : le dupliquer garantirait qu'une des deux copies dérive un jour sans qu'on le voie, et c'est justement le genre de divergence silencieuse que ce projet passe son temps à éviter.

Les couples sont déclarés dans `golden.json`, lisible depuis n'importe quel langage — le parser sera écrit en Python.

Un mois saisi à la main est donc deux choses à la fois : de la donnée de production, et l'attente d'un test qui n'existe pas encore.

## Les cas limites

`edge-cases.json` est un mois **synthétique**, daté en 2099 pour qu'aucun doute ne subsiste. Il porte les situations que les données réelles ne contiennent pas toujours, et que l'application doit pourtant traiter :

- un jour sans entrée, et un autre sans accompagnement — la grille ne se referme pas (design.md, D12) ;
- un jour `confidence: "low"` — le chemin de rendu dégradé doit exister avant que le parser ne produise le premier ;
- un jour de vacances et un jour de week-end, sans plats ;
- un plat dont la famille n'est déductible d'aucun mot-clé — le repli neutre (D11) ;
- un plat sans allergène déclaré, qui n'est pas un plat sans allergène ;
- un libellé long, proche de la borne des 80 caractères que le schéma refuse.

Ce fichier n'est pas publié sous `static/data/` : il ne doit jamais atteindre un utilisateur.
