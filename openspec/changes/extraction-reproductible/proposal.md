## Why

Les menus publiés ne se saisissent pas à la main : ils sortent de `scripts/extract-menu-pdf.py`, qui lit la géométrie des PDF de la Ville. Ce script est le maillon le plus fragile de la chaîne, et le seul que rien ne vérifie.

- **Sa dépendance n'est déclarée nulle part.** PyMuPDF s'installe à la main, en version libre. Or le parser repose sur les positions du texte que rend MuPDF : une autre version peut déplacer une ligne et changer une attribution de rôle sans que rien ne casse visiblement.
- **Il importe `fitz`**, que PyMuPDF annonce retirer au profit de `import pymupdf`. Constaté le 18 octobre avec PyMuPDF 1.28.2 : l'avertissement de dépréciation s'écrit **sur la sortie standard**, si bien que le JSON que le script écrit sans `--out` commence par une ligne de texte et ne se lit plus.
- **Aucun test ne le couvre.** Une retouche du parser, pour le prochain gabarit de la Ville, peut dégrader les mois déjà publiés sans qu'on le sache avant leur prochaine réextraction.

Ce changement est aussi le socle de la veille planifiée des PDF (backlog, entrée 7) : un workflow qui lance l'extracteur doit pouvoir l'installer, et doit savoir s'il produit encore juste.

## What Changes

- `scripts/requirements.txt` déclare PyMuPDF, en version exacte.
- Le script importe `pymupdf` au lieu de `fitz`.
- Un test de non-régression rejoue l'extraction de chaque PDF de `sources/pdf/` et exige les données publiées à l'identique, l'horodatage d'extraction excepté. Mesuré le 18 octobre : les neuf fichiers publiés se reproduisent déjà exactement.
- Une commande `npm run test:extraction`, et un job de CI qui la lance à chaque poussée.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `menu-data` : les données publiées se reproduisent depuis leur PDF.
- `delivery` : la reproduction est vérifiée en CI, à chaque poussée.

## Impact

- `scripts/extract-menu-pdf.py` (import), `scripts/requirements.txt` (nouveau), `scripts/test_extraction.py` (nouveau).
- `package.json` : un script `test:extraction`.
- `.github/workflows/` : un job `extraction`, avec Python et la dépendance déclarée.
- `CLAUDE.md` et le skill `menus-talence` : l'installation, et quand lancer le test.
- Aucun changement des données publiées ni de l'application.
