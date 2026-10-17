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

Lire <https://www.talence.fr/quotidien/enfance-scolarite/menu-ecoles/> et en
extraire les liens PDF mensuels.

L'URL d'un mois change quand la Ville le réédite : septembre 2026 est passé de
`/uploads/2026/06/` à `/uploads/2026/08/`. Prendre l'URL sur la page, jamais
celle du fichier existant.

Le menu de grève est sur la même page mais suit un autre gabarit — cinq jours de
semaine croisés avec deux variantes, sans dates. Il se traite à l'étape 3, avec
`--greve`. En pratique il n'a pas bougé depuis 2023 : ce qu'on vérifie est son
empreinte, pas son contenu.

L'affichage de l'origine des viandes n'est pas un menu et ne se traite pas ici.

## 2. Télécharger et comparer les empreintes

```bash
curl -sSL -o sources/pdf/<nom>.pdf <url>
sha256sum sources/pdf/*.pdf
```

Comparer chaque empreinte au `source.pdfSha256` du fichier correspondant —
`static/data/<AAAA-MM>.json` pour un mois, `static/data/greve.json` pour la
grève. Empreinte identique, document inchangé : passer au suivant. Empreinte
différente ou fichier absent : le traiter.

## 3. Extraire

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

Le script écrit ses avertissements sur la sortie d'erreur. Un `⚠` sur un jour
signale une structure inhabituelle, et ce jour part en `confidence: "low"` :
le relire dans le PDF avant d'aller plus loin.

```bash
pdftotext -layout sources/pdf/<nom>.pdf - | less
```

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
npm run validate && npm run build && npm run test:e2e
```

Les tests unitaires lisent le corpus réel. Un menu qui change peut en faire
tomber un — c'est le test qui a figé une date, pas la donnée qui a tort :
le rendre indépendant du jour plutôt que figer la nouvelle date.

## 6. Rendre compte

Commiter, en disant ce qui a changé pour le lecteur des menus : quel mois, quel
jour, quel plat. Puis s'arrêter — la poussée met en ligne, et elle appartient à
l'humain.
