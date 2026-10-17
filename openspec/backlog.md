# Backlog

Ce qui attend, dans l'ordre où ça devrait partir. Une entrée devient un changement
sous `openspec/changes/` quand on commence à y réfléchir sérieusement, et quitte
alors cette liste. Les entrées restent ici, et non en changements vides, pour que
`openspec list` ne montre que le travail réellement en cours.

Relevé du 16 octobre 2026, sur la page de la Ville et ses PDF.

## 1. `jours-feries` — archivé le 17 octobre 2026

## 2. Mise à jour des menus d'octobre à janvier — faite le 17 octobre 2026

Reste l'outillage : PyMuPDF n'est pas déclaré comme dépendance du dépôt (le
script échoue sans lui), et le script importe `fitz`, dont PyMuPDF annonce le
retrait au profit de `import pymupdf`. Déclarer la dépendance (un
`requirements.txt` sous `scripts/`) et migrer l'import.

## 3. `allergenes-inconnus` — à proposer, prérequis de l'entrée 4

Le PDF des vacances de la Toussaint ne porte **aucun** code allergène. Le parser
écrit alors `allergens: []`, que le filtre lit « ne contient rien » : un parent
qui surveille le lait verrait des lasagnes et un fromage blanc sans alerte.

Le contrat ne distingue pas « aucun allergène » de « allergènes non communiqués ».
À trancher :

- la représentation (`allergens: null` par plat, ou un drapeau au niveau du
  document — l'absence est ici une propriété du PDF entier) ;
- ce que le filtre affiche quand il ne sait pas : l'incertitude doit se voir
  autant qu'une alerte, jamais moins ;
- la règle d'extraction : quand le parser conclut-il à l'absence de codes plutôt
  qu'à un plat sans allergène ? Un document sans aucun code sur aucun plat est un
  signal fort ; un plat isolé sans code ne l'est pas ;
- `schemaVersion` : contrairement à `public-holiday`, `null` là où un tableau
  était garanti casse les clients en cache. Montée de version probable.

## 4. `menus-vacances` — à proposer

Périmètre accepté le 16 octobre 2026 : les menus « restauration municipale —
vacances » entrent dans l'application. Deux PDF en ligne :

- `10-MENUS-WEB-TOUSSAINT-2026-1.pdf` — du 19 au 30 octobre, sans allergènes
  (entrée 3) ;
- `12-MENUS-WEB-NOEL-2026.pdf` — du 21 décembre au 1er janvier, avec allergènes,
  deux fériés (25/12, 01/01).

Ce qu'on sait déjà :

- Le parser mensuel les découpe correctement : même géométrie, dix jours chacun.
  Seul le férié échoue, et `jours-feries` le règle.
- Les plages ne chevauchent pas celles des mensuels (octobre s'arrête au 16,
  la Toussaint commence le 19). L'ordre de priorité entre sources n'est donc pas
  sollicité ; c'est le **stockage** qui manque.
- Le manifeste est indexé par mois (`month: AAAA-MM`, unique). Noël chevauche
  deux mois, et octobre aurait deux documents. Il faut une clé par document
  (`2026-toussaint` ?) et une `kind` qui le dise — `event`, existante, ou une
  nouvelle valeur. Montée de `schemaVersion` du manifeste à évaluer.
- Le goûter des vacances est un simple « Goûter », sans détail : `labels.ts` sait
  déjà dire « Détail non publié ».
- Le bandeau « ZOOM SUR » est présent (Semaine du goût, SIQO) mais rattaché au
  document, pas à un jour.
- L'URL porte un suffixe `-1` : la Ville a déjà réédité la Toussaint une fois.
  Le skill doit traiter ces documents comme les mensuels : URL lue sur la page,
  empreinte comparée.
- Question produit : l'écran doit-il dire qu'il s'agit d'un menu de centre de
  loisirs et non de cantine scolaire ? Probablement oui, la population servie
  n'étant pas la même.

## 5. `ci-github` — archivé le 17 octobre 2026

## 6. Mention de l'écran du jour : week-end et vacances

La spec `menu-browsing` (« États limites de consultation ») exige un message
propre au week-end et aux vacances. L'écran dit aujourd'hui « Demain » ou
« Prochain service · dans N jours » dans tous les cas. `jours-feries` pose le
champ `skipped` sur la cible résolue et ne traite que le férié ; il ne restera
qu'à lire ce champ pour les autres natures.

## 7. Veille planifiée des PDF de la Ville

Le 16 octobre, le corpus s'est épuisé alors que la Ville avait publié novembre
dès septembre. Un workflow planifié (quotidien) pourrait relever les liens de la
page, comparer les empreintes et ouvrir une issue — ou une PR produite par le
script — quand un PDF change ou quand le corpus couvre moins de deux semaines à
venir. À concevoir après `ci-github`, dont il réutilise le socle.

## 8. Jour figé au pré-rendu — `jour-au-premier-rendu`, archivé le 17 octobre 2026

La reconstruction quotidienne d'abord envisagée ne règle rien : le service worker
sert le HTML de la version installée sans le revalider, et chaque build crée une
version, donc un bandeau de mise à jour par jour. Voir
`openspec/changes/jour-au-premier-rendu/`.

## 9. Barrière de déploiement par build hook — à proposer

Le même build hook peut rétablir une barrière sans PR. On développe sur le tronc
et Netlify publie à la poussée : un `e2e` rouge signale un défaut déjà en ligne.
En coupant la publication automatique de Netlify, pour qu'elle ne parte que du
hook appelé par la CI une fois verte, la production ne recevrait plus que des
commits vérifiés. Ce serait aussi un seul déploiement par lot de commits poussés.

## 10. Archiver les changements restés ouverts — fait le 17 octobre 2026

Tous archivés, dans l'ordre de leurs décisions ; `openspec list` n'en montre plus
aucun. Ce qu'il faut retenir pour les suivants :

- une exigence MODIFIED remplace le bloc entier : archiver dans l'ordre, et
  recopier dans le delta les scénarios ajoutés entre-temps par un autre
  changement ;
- un renommage d'exigence se déclare (`RENAMED`), sinon l'archive est refusée ;
- le CLI ne sait pas retirer un scénario : le retirer à la main de la spec
  principale, et en écrire la raison dans le design du changement ;
- `menus-jour-semaine`, le socle, est archivé sans synchronisation : ses
  exigences sont toutes dans `openspec/specs/`, renommées ou retirées depuis par
  des changements archivés.
