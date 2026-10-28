## Context

La veille (`veille-des-pdf`) identifie un menu par son nom de fichier : l'URL change à chaque réédition (`/uploads/2026/06/` puis `/2026/08/`), le nom restait stable. Il ne l'est plus quand la Ville téléverse un fichier dont le nom existe déjà dans sa médiathèque : WordPress ajoute alors `-1`, `-2`… avant l'extension. Le corpus en porte déjà un exemple dès la première publication, `10-MENUS-WEB-TOUSSAINT-2026-1.pdf`.

Chaque fichier de `static/data/` cite son PDF (`source.pdfUrl`, `source.pdfSha256`), et `test:extraction` exige que chaque PDF de `sources/pdf/` soit cité. Une réédition renommée laisse donc derrière elle un PDF qu'il faut retirer dans le même commit.

## Goals / Non-Goals

**Goals:**

- Que la veille dise quoi faire d'une réédition renommée : quel PDF elle remplace, quel fichier de données reprendre.
- Rendre compte d'une réextraction en lisant ce qui change pour un parent, et rien d'autre.

**Non-Goals:**

- Rapprocher deux noms par similarité (distance d'édition, mois lu dans le nom). Seul le suffixe de doublon de WordPress est reconnu (D1).
- Extraire, commiter ou pousser à la place de l'humain (`veille-des-pdf`, D3, inchangé).
- Normaliser la mise en forme des fichiers publiés : Prettier s'en charge déjà.

## Decisions

### D1 — Le suffixe de doublon, et lui seul

Deux noms désignent le même document quand ils sont égaux une fois retiré, de chacun, un `-` suivi d'un ou deux chiffres juste avant `.pdf`. C'est exactement ce que produit WordPress. L'année n'est pas touchée : dans `…-2027.pdf`, le tiret précède quatre chiffres.

Le nom exact a priorité : si la page porte à la fois `X.pdf` et `X-1.pdf`, `X.pdf` se rapproche de la donnée qui le cite sous ce nom.

Alternative écartée : reconnaître le mois dans le nom (`JANVIER-2027`). Plus large, mais fragile — la Ville a déjà nommé ses fichiers de vacances autrement que ses mensuels — et ce n'est pas le problème observé.

### D2 — Un quatrième constat, `renomme`

Pour un PDF de la page sans donnée qui cite son nom exact, mais avec une donnée qui cite le même nom au suffixe près :

- empreinte différente → action **renommé** : « `01-…-2027-1.pdf` remplace `01-…-2027.pdf` (`static/data/2027-01.json`) » ;
- empreinte égale → avertissement **déplacé**, comme aujourd'hui pour une autre URL.

Le constat porte le fichier de données, parce que c'est l'argument de `--merge` et de `--out` : la veille dit la commande, pas seulement le symptôme.

### D3 — Comparer des menus, pas des textes

`scripts/diff-menus.js` lit chaque fichier de `static/data/` dans la copie de travail et, par `git show HEAD:<chemin>`, au dernier commit. Il compare jour par jour, et pour chaque jour plat par plat, par créneau (`slot`) : libellé, allergènes, labels. Il compare aussi le genre du jour, le thème et sa note. Un fichier nouveau ou supprimé se dit comme tel.

La sortie est en français, une ligne par changement — `2026-11-13 dessert : Dessert maison → Cheesecake aux Oreo` —, prête à reprendre dans le corps du commit. La comparaison est une fonction pure, testée sans git ; seule la fonction principale lit le dépôt.

Alternatives écartées : `git diff --word-diff` (toujours sensible à la mise en forme) ; un pilote de diff git sur les JSON (configuration locale, invisible dans le dépôt).

### D4 — Le navigateur des tests est celui du verrou

Le skill dit que `npm run test:e2e` utilise le Chromium que le hook de session installe pour la version de `@playwright/test` du verrou, et qu'un navigateur d'une autre révision ne le remplace pas. Si le téléchargement est refusé, il faut faire autoriser `cdn.playwright.dev`, et non faire pointer Playwright vers un autre Chromium.

## Risks / Trade-offs

- [Faux rapprochement] Un document dont le nom ne diffère d'un autre que par `-1` sans être une réédition. → Improbable sur cette page ; l'extraction et sa relecture l'auraient vu de toute façon, et le constat nomme les deux fichiers.
- [Rapprochement manqué] Une réédition sous un nom tout autre. → Elle reste **nouveau**, comme aujourd'hui ; le skill dit de vérifier qu'un « nouveau » ne recouvre pas un mois déjà publié.
- [HEAD comme référence] Sur un dépôt sans commit, ou un fichier non suivi, il n'y a pas d'« avant ». → Le fichier est dit nouveau.
