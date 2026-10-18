## Context

`extract-menu-pdf.py` lit un PDF d'une page avec PyMuPDF et en déduit, par la géométrie, les jours, les rôles et les allergènes. Il écrit le JSON sur la sortie standard, ou dans `--out`. Sa sortie n'a qu'une valeur non déterministe : `source.fetchedAt`, l'heure de l'extraction. Les neuf PDF publiés sont dans `sources/pdf/`, et chaque fichier de `static/data/` nomme le sien dans `source.pdfUrl`.

Rejoué le 18 octobre 2026 avec PyMuPDF 1.28.2 : les neuf fichiers publiés se reproduisent à l'identique, `fetchedAt` excepté. C'est ce qui rend le test simple : il n'y a pas d'écart à expliquer avant de le poser.

## Goals / Non-Goals

**Goals:**

- Une installation de l'extracteur en une commande, identique sur un poste et en CI.
- Toute retouche du parser, ou toute montée de version de PyMuPDF, confrontée aux neuf documents déjà publiés.
- Un JSON valide sur la sortie standard, quoi que la bibliothèque y écrive.

**Non-Goals:**

- La veille planifiée des PDF (entrée 7) : elle viendra par-dessus.
- Réécrire le parser, ou le couvrir de tests unitaires par fonction.
- Empêcher une publication sur l'échec de ce test (D5).

## Decisions

### D1 — `scripts/requirements.txt`, en version exacte

`pymupdf==1.28.2`. Le parser dépend des coordonnées que MuPDF rend, et une version mineure peut les décaler. Monter de version devient un acte délibéré, que le test de D3 juge. Le fichier vit sous `scripts/`, à côté du seul code Python qui s'en sert : le dépôt est un projet Node, et un `pyproject.toml` à la racine annoncerait un paquet Python qui n'existe pas.

Alternative écartée : épingler par empreintes (`--require-hashes`). Les roues de PyMuPDF sont propres à chaque plateforme, et la liste d'empreintes coûterait plus à tenir qu'elle ne protège sur un outil lancé à la main et en CI.

### D2 — `import pymupdf`, et rien d'autre sur la sortie standard

Le nouvel import supprime l'avertissement. Il ne garantit pas qu'une bibliothèque n'écrira plus jamais sur la sortie standard. C'est le test de D3 qui le garantit : il lit le JSON sur la sortie standard, comme le ferait un workflow, et échoue si la moindre ligne s'y glisse.

### D3 — La référence est la donnée publiée

Le test parcourt `static/data/` : chaque mensuel, chaque menu de vacances, et le menu de grève. Il retrouve le PDF par le nom de fichier de `source.pdfUrl`, relance l'extraction avec les mêmes options que la procédure (`--merge` pour reprendre thème et note, `--greve` pour la grève), et compare le document entier, `fetchedAt` retiré. L'empreinte `pdfSha256` fait partie de la comparaison : un PDF remplacé sans réextraction échoue aussi.

Il n'y a donc pas de fichiers attendus à part. Une donnée publiée est par construction ce que le script a produit (CLAUDE.md : aucun plat ne se saisit à la main), et la dupliquer en référence créerait deux vérités à tenir alignées.

Il vérifie aussi la complétude dans les deux sens : un PDF de `sources/pdf/` qu'aucune donnée ne cite, ou une donnée dont le PDF manque, est une erreur.

### D4 — En Python, avec la bibliothèque standard

`scripts/test_extraction.py`, sous `unittest`. Il lance le script comme un processus, par sa ligne de commande, pour tester ce qu'on exécute vraiment. Pas de pytest : ce serait une seconde dépendance pour un seul fichier de test. `npm run test:extraction` le lance, pour qu'il se trouve là où on cherche les autres commandes du dépôt.

### D5 — Un job de CI à part, qui ne retient pas la publication

Le job `extraction` installe Python et `scripts/requirements.txt`, puis lance le test, à chaque poussée. Il n'entre pas dans les `needs` du job `publier` : l'application sert des données déjà commitées, que l'extracteur ne touche pas au moment de publier. Un extracteur cassé n'empêche pas de servir des menus justes. Il empêche d'en produire de nouveaux, et le job rouge le dit.

Il ne rejoint pas non plus `npm run validate`, qui précède chaque commit. Exiger Python et PyMuPDF pour corriger une couleur serait disproportionné. `CLAUDE.md` demande le test pour les commits qui touchent l'extracteur, ses dépendances ou les PDF.

## Risks / Trade-offs

- [Durée] Neuf extractions à chaque poussée. → Elles prennent quelques secondes en local ; la durée du job, installation de PyMuPDF comprise, se mesure à la première exécution en CI.
- [Référence et code changés ensemble] Une retouche du parser qui modifie la sortie oblige à réextraire les données dans le même commit, et le diff de `static/data/` montre alors ce qui change pour l'utilisateur. C'est voulu : le test ne refuse pas le changement, il refuse qu'il soit silencieux.
- [Version épinglée vieillissante] Une version exacte ne reçoit plus de correctif. → Une montée se fait sur un commit à part, que le test juge.
