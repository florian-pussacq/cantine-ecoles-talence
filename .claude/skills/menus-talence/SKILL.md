---
name: menus-talence
description: Met à jour les menus de la cantine depuis les PDF de la Ville de Talence. À utiliser pour rafraîchir les menus, ajouter un mois, ou vérifier si la Ville a republié un PDF.
---

# Mettre à jour les menus

Les menus se produisent depuis les PDF officiels, par `scripts/extract-menu-pdf.py`.
Aucun plat ne se saisit à la main : la saisie manuelle a déjà inventé un fromage
le 9 octobre 2026, recopié de la colonne voisine, et personne ne l'a vu pendant
un mois.

**Terminé quand** chaque mois publié sur la page de la Ville — plus le menu de
grève — a son fichier sous `static/data/`, que son `source.pdfSha256` vaut
l'empreinte du PDF en ligne, et que `npm run validate`, `npm run build` et
`npm run test:e2e` passent.

## 1. Relever ce que la Ville publie

```bash
npm run veille
```

La veille lit <https://www.talence.fr/quotidien/enfance-scolarite/menu-ecoles/>,
télécharge chaque PDF de menu et compare son empreinte au `source.pdfSha256` des
données publiées. Elle nomme ce qui est à traiter :

- **nouveau** : un menu qu'aucune donnée ne cite ;
- **republié** : un menu cité dont l'empreinte a changé ;
- **corpus court** : le dernier jour publié est à moins de quatorze jours ;
- **déplacé**, sans action : même document, autre URL — la prochaine extraction
  prendra la nouvelle.

Le même contrôle tourne chaque matin dans le workflow `veille`, qui échoue quand
il y a quelque chose à faire. C'est en général lui qui amène ici.

L'URL d'un mois change quand la Ville le réédite : septembre 2026 est passé de
`/uploads/2026/06/` à `/uploads/2026/08/`. Prendre l'URL que donne la veille,
jamais celle du fichier existant.

Le menu de grève est sur la même page mais suit un autre gabarit — cinq jours de
semaine croisés avec deux variantes, sans dates. Il se traite à l'étape 3, avec
`--greve`. En pratique il n'a pas bougé depuis 2023.

Les menus de vacances (`…-TOUSSAINT-…`, `…-NOEL-…`) se traitent comme les
mensuels, avec leur propre fichier : voir l'étape 3.

Les autres PDF de la page (origine des viandes, calendrier, guide) ne sont pas
des menus ; la veille les ignore.

## 2. Télécharger ce qui est à traiter

```bash
curl -sSL -o sources/pdf/<nom>.pdf <url>
```

Seulement les documents que la veille a nommés nouveaux ou republiés. Les PDF
conservés sous `sources/pdf/` sont la référence de `npm run test:extraction` :
un PDF remplacé exige sa réextraction dans le même commit.

## 3. Extraire

L'extracteur dépend de PyMuPDF, en version exacte :
`pip install -r scripts/requirements.txt`.

```bash
python3 scripts/extract-menu-pdf.py sources/pdf/<nom>.pdf \
  --url <url officielle> \
  --merge static/data/<AAAA-MM>.json \
  --out  static/data/<AAAA-MM>.json
```

`--merge` et `--out` désignent le même fichier : le thème « ZOOM SUR » et sa note
sont éditoriaux, rattachés à un jour par jugement humain, et le parser ne sait
pas les produire. `--merge` les reprend. Sur un mois nouveau, l'omettre.

Le menu de grève se produit avec `--greve`, sans `--merge` : il ne porte pas de
thème.

```bash
python3 scripts/extract-menu-pdf.py sources/pdf/00-MENUS-WEB-GREVES.pdf --greve \
  --url <url officielle> \
  --out static/data/greve.json
```

Un menu de vacances se produit sous `static/data/<AAAA-MM>-vacances.json`, d'après
son mois majoritaire — Noël 2026, du 21 décembre au 1er janvier, est
`2026-12-vacances.json`. Le script lit l'intitulé (« Vacances de Noël ») dans
l'en-tête ; sans lui, la validation refuse le fichier.

```bash
python3 scripts/extract-menu-pdf.py sources/pdf/12-MENUS-WEB-NOEL-2026.pdf \
  --url <url officielle> \
  --out static/data/2026-12-vacances.json
```

Le script écrit ses avertissements sur la sortie d'erreur. Un `⚠` sur un jour
signale une structure inhabituelle, et ce jour part en `confidence: "low"` :
le relire dans le PDF avant d'aller plus loin.

```bash
pdftotext -layout sources/pdf/<nom>.pdf - | less
```

L'avertissement « aucun allergène hors du pain » signale un document qui ne précise
pas ses allergènes : le fichier le déclare (`allergensDeclared: false`), et
l'application le dit aux parents. Le vérifier dans le PDF, puis le laisser.

Un jour férié — la cellule ne porte que `JOUR FÉRIÉ` — sort en `public-holiday`,
sans plats et sans avertissement. Un `⚠` sur une cellule qui mentionne « férié »
signifie qu'elle porte aussi autre chose : la relire.

Si un mois nouveau porte un thème « ZOOM SUR » rattaché à un jour précis, le
poser à la main dans le fichier, entre `kind` et `confidence`.

## 4. Publier localement

```bash
npx prettier --write static/data/*.json
npm run data:index
```

`data:index` régénère le manifeste : sans lui, `validate` rejette les fichiers
pour manifeste divergent.

## 5. Vérifier

```bash
npm run validate && npm run build && npm run test:e2e && npm run test:extraction
```

`test:extraction` rejoue l'extraction de chaque PDF conservé et exige les
fichiers publiés à l'identique. Après une extraction faite par cette procédure,
il passe par construction ; il échoue si un PDF a été remplacé sans réextraire
ses données, ou si un PDF conservé n'est cité par aucun fichier.

Les tests unitaires lisent le corpus réel. Un menu qui change peut en faire
tomber un — c'est le test qui a figé une date, pas la donnée qui a tort :
le rendre indépendant du jour plutôt que figer la nouvelle date.

## 6. Rendre compte

Commiter, en disant ce qui a changé pour le lecteur des menus : quel mois, quel
jour, quel plat. Puis s'arrêter — la poussée met en ligne, et elle appartient à
l'humain.
