## Why

Les jours de grève, la Ville sert un menu de repli qu'elle publie dans un PDF distinct, inchangé depuis 2023. L'application l'ignore complètement : le parent qui se demande ce que mange son enfant un jour de grève n'a aucun moyen de le savoir depuis l'app, alors même que c'est le jour où l'information manque le plus.

Ce PDF n'est pas un menu générique. C'est une grille de cinq jours de semaine croisés avec deux variantes — repas chauds, repas froids —, soit dix menus, et **sans aucune date**. Il ne peut donc pas entrer dans le contrat mensuel, qui exige un mois et une date par jour. `docs/schema.md` relève déjà cette contradiction sans la résoudre.

La difficulté n'est pas de l'afficher, c'est de l'afficher **sans mentir**. L'application ne peut pas savoir qu'il y a grève : aucune source ne le lui dit. Un menu de grève poussé automatiquement sur l'écran du jour affirmerait un fait que personne n'a vérifié. Il se consulte, on ne le subit pas.

## What Changes

- Publication de `static/data/greve.json`, sous un **schéma propre** organisé par jour de semaine et par variante, jamais par date.
- Le fichier n'est **pas inscrit au manifeste** : `index.json` exige un mois au format `AAAA-MM`, qu'un menu sans date ne peut pas porter. Conséquence recherchée — `loadDataset` ne le voit jamais, tandis que le service worker le précache comme tout `static/data/`.
- Extension du parser (`scripts/extract-menu-pdf.py --greve`) : même géométrie, même attribution des rôles par rang de ligne, ancrage différent. Le fichier est produit, jamais saisi.
- Nouvel écran `/greve`, **hors des onglets**, atteint par un lien depuis les réglages.
- `/reglages` s'élargit d'« Allergènes à signaler » à « Réglages », avec une section par sujet.

Hors périmètre, explicitement : tout basculement automatique en mode grève, et toute substitution du menu du jour. Le PRD §5 a déjà tranché — c'est un choix de l'utilisateur, jamais une déduction.

## Capabilities

### Modified Capabilities

- `menu-data`: ajout d'un second contrat de données, le menu de grève, indexé par jour de semaine et variante plutôt que par date, exclu du manifeste et donc de la résolution du jour.
- `menu-browsing`: ajout d'un écran de consultation du menu de grève, atteignable depuis les réglages et absent des onglets.

## Impact

- **Nouveau contrat** : `schemas/greve.schema.json`, dérivé en types comme les deux autres.
- **Nouvelle route** : `src/routes/greve/`, prérendue comme le reste.
- **Interface resserrée** : `PlatCarte` ne recevra plus un jour entier mais la seule légende dont elle se sert — trois appelants suivent.
- **Identité d'écran modifiée** : le titre de `/reglages` et le nom accessible de la commande qui y mène s'élargissent ; trois tests de bout en bout les couvrent et suivent.
- **Risque assumé** : le PDF de grève n'a pas bougé depuis 2023. Un fichier qui ne change jamais est un fichier dont on ne remarque pas qu'il a changé — d'où la comparaison d'empreinte inscrite dans la procédure de mise à jour.
