# Backlog

Ce qui attend, dans l'ordre où ça devrait partir. Une entrée devient un changement
sous `openspec/changes/` quand on commence à y réfléchir sérieusement, et quitte
alors cette liste. Les entrées restent ici, et non en changements vides, pour que
`openspec list` ne montre que le travail réellement en cours.

Relevé du 16 octobre 2026, sur la page de la Ville et ses PDF.

## 1. `jours-feries` — en cours

Proposition rédigée. Bloque l'entrée 2.

## 2. Mise à jour des menus d'octobre à janvier

Production de données par le skill `menus-talence`, pas un changement OpenSpec.
À lancer une fois `jours-feries` appliqué.

| Document | Empreinte en ligne | Ce qui l'attend |
|---|---|---|
| Octobre 2026 | `fa9498fd…` (`/uploads/2026/10/`) | réédité le 30 septembre — voir ci-dessous |
| Novembre 2026 | `6d1c81a5…` | nouveau ; 11/11 férié |
| Décembre 2026 | `6de53767…` | nouveau ; le PDF ne porte pas de date de mise à jour (`updatedAt` nul) |
| Janvier 2027 | `0ad452fa…` | nouveau |
| Grève | `2e51a293…` | inchangé |

Réédition d'octobre, à dire dans le commit :

- 1er octobre, cake maison : allergènes `1+3+7+8` → `1+2+3+4+7+8` (crustacés et poisson ajoutés).
- 8 octobre, accompagnement : boulgour → quinoa.
- 12 octobre, accompagnement : quinoa bio → gnocchis à la crème (allergènes `1+7`).

Août et septembre ont disparu de la page de la Ville. Leurs fichiers restent : ils
sont l'archive, pas un miroir de la page.

Outillage : PyMuPDF n'est pas déclaré comme dépendance du dépôt (le script échoue
sans lui), et le script importe `fitz`, dont PyMuPDF annonce le retrait au profit
de `import pymupdf`. Petite tâche à faire en passant : déclarer la dépendance
(un `requirements.txt` sous `scripts/`) et migrer l'import.

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

## 5. `ci-github` — à proposer

Le dépôt vient de GitLab et vit désormais sur GitHub. `.gitlab-ci.yml` n'est plus
exécuté par personne : aujourd'hui, **rien ne vérifie une branche ni une PR**, et
les tests de bout en bout ne tournent nulle part — Netlify ne rejoue que
`validate` et `build`.

À faire :

- Porter le pipeline en GitHub Actions : un job `verifier`
  (`npm run validate && npm run build`), un job `e2e` (Chromium installé à la
  demande, rapport Playwright en artefact sur échec). Mêmes déclencheurs : PR et
  poussée de branche, sans double exécution.
- `actions/setup-node` lit `.nvmrc` (`node-version-file`) : la duplication de la
  version de Node que `.gitlab-ci.yml` assumait disparaît.
- Côté Netlify : vérifier que le site est relié au dépôt GitHub et non plus à
  l'ancien dépôt GitLab, et que les prévisualisations se font sur les PR.
  Opération dans l'interface Netlify, à faire par un humain.
- Décider si `e2e` rouge doit bloquer la publication. Aujourd'hui non (prix de
  l'intégration Git native de Netlify, assumé dans D2 de `menus-jour-semaine`).
  Avec GitHub, une protection de branche sur `main` exigeant les deux jobs le
  permet sans changer de mode de déploiement — à condition de passer par des PR.
- Supprimer `.gitlab-ci.yml`, et reprendre le vocabulaire « merge request » dans
  `netlify.toml` et dans D2 de `menus-jour-semaine` (archive : on ajoute une note,
  on ne réécrit pas l'histoire).

## 6. Mention de l'écran du jour : week-end et vacances

La spec `menu-browsing` (« États limites de consultation ») exige un message
propre au week-end et aux vacances. L'écran dit aujourd'hui « Demain » ou
« Prochain service · dans N jours » dans tous les cas. `jours-feries` pose le
champ `skipped` sur la cible résolue et ne traite que le férié ; il ne restera
qu'à lire ce champ pour les autres natures.
