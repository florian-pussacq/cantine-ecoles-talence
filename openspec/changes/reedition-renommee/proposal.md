## Why

Le 23 octobre 2026, la Ville a réédité janvier 2027 sous un autre nom : `01-MENUS-WEB-JANVIER-2027-1.pdf`, le `-1` que WordPress ajoute quand un fichier du même nom existe déjà. La veille l'a dit **nouveau**, ce qui envoie vers la procédure d'un mois neuf : un nouveau fichier de données, sans `--merge`. Or c'était une réédition, qui doit reprendre le fichier existant, son thème et sa note, et remplacer le PDF conservé. Le design de `veille-des-pdf` avait vu le risque et l'avait jugé acceptable (« c'est vrai du point de vue de l'action à mener ») ; ce n'est pas le cas : l'action n'est pas la même.

La même mise à jour a montré un second manque. Le skill demande de dire, au commit, ce qui change pour le lecteur — quel mois, quel jour, quel plat. Le diff texte de deux réextractions faisait 1 100 lignes, presque toutes de mise en forme, pour six plats changés. Il a fallu écrire à la main une comparaison jour par jour. Les rééditions reviennent chaque mois ou presque : l'outil doit être dans le dépôt.

## What Changes

- La veille reconnaît une **réédition renommée** : un PDF de la page dont le nom, privé du suffixe de doublon `-N`, est celui d'un document cité. Elle nomme le document qu'il remplace et le fichier de données à reprendre. À empreinte égale, c'est un déplacement, sans action.
- Un script, `npm run data:diff`, compare les menus publiés de la copie de travail à ceux du dernier commit, plat par plat, et ne dit rien de la mise en forme.
- Le skill `menus-talence` traite la réédition renommée, se sert de `data:diff` pour rendre compte, et dit d'où vient le navigateur des tests de bout en bout.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `menu-data` : la veille distingue une réédition renommée d'un menu nouveau ; une réextraction se relit plat par plat.

## Impact

- `scripts/veille-pdf.js` et son test.
- `scripts/diff-menus.js` (nouveau) et son test ; `package.json` (`data:diff`).
- Skill `menus-talence`.
- Aucun changement de l'application ni des données.
