## Context

Le dépôt ne contient aujourd'hui que `PRD-menus-talence.md`, la configuration agents et ce change. Aucun code applicatif, aucun dépôt distant, aucune infrastructure.

Le PRD décrit une chaîne complète : ingestion PDF → parser géométrique → JSON versionnés → PWA. Ce change ne construit que le dernier maillon, en court-circuitant volontairement les trois premiers par une saisie manuelle.

Trois contraintes structurantes, toutes issues du PRD et arbitrées avec le porteur du projet :

- **Aucune donnée personnelle côté serveur.** Le filtre allergènes est une préférence d'affichage qui vit dans le navigateur, sans nom ni identité. Conséquence : la question RGPD ne se pose pas, et la contrainte d'hébergement en France — reconnue comme idéologique et non juridique — a été levée.
- **Budgets de performance non décoratifs** (PRD §8). La proposition de valeur face à l'app officielle *est* la vitesse. LCP < 1 s en 4G sur mid-range Android, < 60 Ko JS gzip, < 150 Ko au premier chargement, interaction jour→jour < 100 ms.
- **Une donnée allergène fausse a des conséquences médicales.** C'est le seul risque non technique du projet et il oriente plusieurs décisions ci-dessous.

## Goals / Non-Goals

**Goals:**

- Écran Aujourd'hui utilisable et beau, ouvrable hors ligne, en moins de 300 ms perçues.
- Un schéma JSON figé et documenté, qui sera le contrat imposé au futur parser Python.
- Un mois de données réelles saisi à la main, exploitable à la fois comme donnée de production et comme fixture de test.
- Un filtre allergènes local qui met les plats concernés en évidence sans jamais reposer sur la seule couleur.
- Une base de code où l'ajout ultérieur du parser et du pipeline ne demande aucune reprise du front.

**Non-Goals:**

- Le parser PDF et le job d'ingestion. Ils font l'objet d'un change ultérieur.
- La vue Mois. Elle sert le besoin « quand y a-t-il des frites », qui est une recherche déguisée ; elle sera traitée comme telle plus tard.
- Les notifications push, le flux iCal, la variante sans porc, le calendrier scolaire, la page origine des viandes.
- Toute forme de compte, de synchronisation, de tracking ou d'analytics.
- La généralisation à d'autres communes.

## Decisions

### D1 — SvelteKit + `adapter-static`, plutôt que vanilla TS + Vite

Le premier arbitrage penchait vers vanilla : le budget de 60 Ko est confortable et l'application n'est qu'un lecteur de JSON. L'arbitrage a basculé quand la qualité visuelle et l'ergonomie ont été posées comme priorité n°1.

SvelteKit fournit le routing, le service worker typé, le préchargement et le build optimisé. Ce que l'on achète, c'est du temps qui va au design plutôt qu'à la plomberie, et des transitions (`transition:`, `crossfade`) natives pour la navigation entre jours.

*Mesuré après l'initialisation du socle :* la coque vide pèse **26,8 Ko de JavaScript gzip**, pas les 15 Ko estimés en amont. La marge sur le budget de 60 Ko n'est donc pas de 4× mais de 2,2× — il reste 33 Ko pour tout le code applicatif, ce qui est confortable pour un lecteur de JSON mais n'autorise aucune dépendance lourde. La vérification de budget au build (tâche 1.4) existe précisément pour que cette marge ne s'érode pas sans qu'on le voie.

*Alternatives écartées :* vanilla + Vite (fait économiser 10 Ko sur un budget qui n'est pas contraint, en échange d'un routeur et d'un service worker à écrire) ; React (40 Ko pour afficher une liste — un impôt sans contrepartie ici) ; Astro (excellent pour le statique, mais l'interactivité client de l'écran Aujourd'hui en ferait un détour).

**Le framework ne détermine pas la qualité visuelle.** Elle se joue dans la typographie, l'échelle d'espacement et la retenue chromatique. D5 traite ce point séparément.

### D2 — Hébergement statique sur Netlify

La contrainte « tout en France » du PRD §6.3 est levée : elle protégeait des données personnelles qui n'existent pas dans cette architecture.

Ce qui disparaît en conséquence : un compte alwaysdata, un secret SSH, une étape `rsync`, un quota de 100 Mo (et donc la question de la conservation des PDF bruts), et une clause d'usage non lucratif.

**Netlify plutôt que GitHub Pages**, initialement retenu. Trois raisons, dans l'ordre où elles comptent :

1. **Le site est servi à la racine.** GitHub Pages impose `/<dépôt>/` sauf domaine personnalisé, ce qui oblige à porter un `base` partout et constitue une source classique de casse silencieuse : tout marche en local et rien en production. Cette classe de bogue disparaît.
2. **Les en-têtes HTTP sont configurables.** C'est ce qui permet de poser une politique de sécurité de contenu stricte, et donc de faire appliquer par le navigateur la promesse « aucune ressource tierce » que l'écran À propos formule et qu'un test vérifie. Trois façons de dire la même chose valent mieux qu'une. Le cache des données et du service worker devient également explicite, au lieu d'être laissé aux défauts de l'hébergeur.
3. **La publication ne dépend d'aucun hébergeur de dépôt.** `netlify deploy` publie depuis un poste de travail ; le projet peut vivre sans dépôt distant, ce qui était son état au moment de ce choix.

`paths.base` reste lu depuis l'environnement et `paths.relative` reste actif : le code n'écrit aucun chemin absolu, si bien qu'un retour vers un hébergement sous sous-chemin resterait une variable d'environnement, pas une refonte.

*Conséquence :* le dépôt vit sur GitLab et l'intégration continue y vit aussi. `.gitlab-ci.yml` ne publie pas : il vérifie — mêmes contrôles qu'en local, plus les tests de bout en bout — et Netlify, branché sur le dépôt, rejoue `npm run validate && npm run build` à la publication.

*Contrepartie assumée :* Netlify n'exécute pas les tests de bout en bout, qui demandent des navigateurs que son image de construction n'a pas. Un job `e2e` rouge n'empêche donc pas la publication. C'est le prix de l'intégration Git native, qui est ce qui donne les prévisualisations de merge request ; `npm run validate` reste joué des deux côtés. L'alternative — publier depuis GitLab CI avec `netlify deploy --prod` — rétablirait la séquence stricte au prix des prévisualisations.

*Note du 17 octobre 2026 :* le dépôt a migré sur GitHub. La vérification est passée à GitHub Actions, et la protection de `main` y rétablit la séquence stricte sans renoncer aux prévisualisations. Voir le changement `ci-github`, D1.

### D3 — Données saisies à la main, non générées

Le PRD ordonnait parser → pipeline → PWA, ce qui repousse le premier pixel à quatre jours. L'ordre est inversé.

La justification est déjà dans le PRD §10 : `PdfMenuParser` prend des octets et rend un `MonthMenu`, sans connaître HTTP, le système de fichiers ni l'horloge. Cette frontière rend l'ordre de construction libre. Construire d'abord le *consommateur* est par ailleurs la seule façon de découvrir qu'un schéma est mal conçu, depuis le seul côté qui en juge.

Le mois saisi à la main n'est pas jeté : il devient le premier fixture golden du corpus de non-régression du parser. Le même travail sert deux fois.

*Contrepartie assumée :* le schéma sera figé sur l'observation d'un seul mois. `schemaVersion` existe pour ça, et le parser, en rencontrant les cas tordus du PRD §4 (cellules vides, fichier de transition, menu grève sans dates), fera remonter les manques.

### D4 — Le modèle de données suit le PRD §5, avec deux champs déclarés mais non exploités

Le schéma retenu est celui du PRD §5 : un fichier par mois, `days[]`, chaque jour portant `courses[]` où chaque plat a un `slot` (`pain` | `entrée` | `plat` | `accompagnement` | `laitage` | `dessert` | `goûter`), des `allergens` numériques, des `flags` qualité.

Deux champs sont conservés dans le schéma mais **ne sont ni produits ni consommés** dans ce change : `revision` et `changedAt`. Ils n'ont de sens que face à un pipeline capable de diffusion, qui n'existe pas encore. Les déclarer maintenant évite un `schemaVersion: 2` pour un ajout prévisible ; les implémenter maintenant produirait du code mort.

Le champ `confidence` (`high` | `low`), lui, est **exploité dès maintenant** : il pilote l'affichage d'un avertissement. Sur des données saisies à la main il vaudra toujours `high`, mais le chemin de rendu dégradé doit exister et être testé avant que le parser ne produise le premier `low`. C'est précisément le cas qu'on ne veut pas découvrir en production.

`slot` est délibérément un rôle sémantique et non un index : le PRD §4 documente que les cellules vides du PDF interdisent toute assignation positionnelle.

### D5 — Direction visuelle « plateau », arrêtée sur maquettes avant toute ligne de CSS

Deux séries de maquettes HTML ont été produites en exploration. La première, purement typographique, a été rejetée : trop sèche, et trop proche de l'esthétique de document administratif. La direction retenue est **le plateau de cantine compartimenté**, vu de dessus.

Ce qui la porte : la grille d'alvéoles est l'objet réel du sujet, immédiatement reconnaissable, et **la taille de l'alvéole encode le rôle** — personne n'a besoin qu'on lui dise où est le plat principal. Chaque plat porte une illustration (D9). L'alvéole du plat principal prend la **couleur de sa famille** (viande, volaille, poisson, végétarien), donc l'écran change d'allure du lundi au vendredi et la couleur porte une information vraie plutôt qu'une humeur.

Le PRD §7.1 mérite ici une correction assumée. Il décrit l'anti-slop comme « neutres chauds, une couleur d'accent, hiérarchie typographique, pas de cartes » — c'est-à-dire, mot pour mot, l'esthétique par défaut que produit un modèle de langage en 2026. La direction retenue s'en écarte sur deux points : elle utilise des compartiments, et elle utilise la couleur comme porteuse de sens. Les autres règles du §7.1 restent en vigueur : **zéro skeleton et zéro spinner**, mode sombre par `prefers-color-scheme` sans bascule, `prefers-reduced-motion` respecté, transitions ≤ 200 ms réservées à la continuité spatiale, aucun emoji décoratif.

*Alternative écartée :* Tailwind ou tout framework utilitaire. Sur quatre écrans, il coûte une étape de build et pousse vers les valeurs par défaut qu'on cherche à fuir. Des CSS custom properties et quelques centaines de lignes suffisent.

### D15 — Palette « Réfectoire », encodage « gommette », date en tête de hiérarchie

**Palette.** Bleu canard `#1E5A6B` pour le fond, blanc froid `#F3F5F1` pour le plateau, et cinq familles en **couleurs franches plutôt que désaturées** : viande `#D93B2B`, volaille `#E89406`, poisson `#1479BE`, végétarien `#23803E`, repli `#5F6B66`. Chacune dispose d'une teinte pâle pour les fonds de disque.

Le refus du pastel terreux est le point de la palette. La première proposition — brique, ocre, sauge, bleu pétrole, tout désaturé — était l'esthétique par défaut d'un modèle de langage, et a été rejetée à ce titre.

Deux teintes ont été ajustées **pour le contraste, pas pour le goût** : le vert est passé de `#2E9E4F` à `#23803E` et le gris de repli de `#7B8681` à `#5F6B66`, faute de quoi le texte blanc tombait sous 4,5:1. La volaille, elle, garde son ambre vif et **inverse sa polarité** : texte sombre `#2A1B00` dessus, à 6,1:1. Assombrir l'ambre jusqu'au blanc lisible l'aurait transformé en marron. Une famille sur cinq porte donc du texte sombre — c'est une irrégularité assumée du système.

**Encodage.** La famille est portée par un **disque : anneau saturé, fond pâle, illustration au centre**. Le même geste sur l'écran Aujourd'hui (alvéole principale) et sur l'écran Semaine. Un seul code à apprendre pour deux écrans.

Sont explicitement écartés, comme réflexes par défaut plutôt que décisions : le liseré coloré à gauche d'une carte, et la carte arrondie elle-même sur l'écran Semaine, qui devient une liste de lignes.

Corollaire technique : **une illustration colorée n'est jamais posée sur un aplat saturé.** Elle repose toujours sur du blanc ou sur la teinte pâle de sa famille, faute de quoi elle perd sa lisibilité — un poisson bleu sur un fond bleu ne se voit pas.

**Date.** Sur les deux écrans, la date monte en tête : un surtitre (« Aujourd'hui », « Prochain service · dans 2 jours ») au-dessus de la date en corps 24 gras. L'écran dit **toujours** quel jour il montre, parce qu'il ne montre pas toujours aujourd'hui.

Le jour courant de l'écran Semaine est marqué par **quatre signaux dont aucun n'est une couleur** : fond blanc, contour épais, étiquette « Aujourd'hui », et le nom du plat qui monte d'un cran. La ligne reste repérable en niveaux de gris.

### D9 — Illustrations vectorielles inline, associées par mots-clés, avec repli explicite

Aucune source photographique n'existe pour ces plats, et une photo de plat de cantine mal éclairée dessert le menu plus qu'elle ne le sert. Les illustrations sont donc **dessinées à la main en SVG et intégrées au document** — pas de police iconographique, pas de sprite distant, pas de requête réseau.

Couvrir une année de menus demande de l'ordre de **vingt-cinq dessins**, un par famille d'aliment. C'est la dépense principale de cette direction et elle est indépendante de la mise en page. Comptée brute, la bibliothèque pèse une vingtaine de kilo-octets ; les formes se répétant beaucoup, elle compresse bien, mais elle reste à surveiller face au budget de 150 Ko (D et §8).

L'association plat → illustration est une **fonction pure du libellé**, par mots-clés, avec une règle de spécificité documentée quand plusieurs familles correspondent. Deux points ne sont pas négociables : il existe une **illustration de repli** pour les libellés non reconnus, et l'application ne devine jamais une famille par approximation — un « Émincé de dinde sauce forestière » non reconnu prend le repli plutôt qu'une illustration de viande rouge qui mentirait.

Les illustrations sont **décoratives** au sens des technologies d'assistance : elles ne portent aucune information absente du texte, et le menu reste intégralement compréhensible sans elles.

*Alternative écartée :* générer les illustrations à la demande par un modèle. Coût, latence, dépendance réseau, et surtout aucune garantie de cohérence graphique d'un plat à l'autre.

### D11 — La famille du plat est déduite du libellé, pas stockée

L'alvéole du plat principal prend la couleur de sa famille (viande, volaille, poisson, végétarien). Cette famille est **déduite du libellé par la même table de mots-clés que l'illustration**, et non portée par le JSON.

La raison est que le PDF ne mentionne la famille nulle part. La stocker obligerait le futur parser à la produire, c'est-à-dire à faire exactement cette même déduction — mais en amont, sans possibilité de la corriger sans régénérer les données. Déduire côté client garde la correction à un seul endroit : enrichir la table de mots-clés améliore rétroactivement tous les mois déjà publiés.

La contrepartie est réelle : **une déduction peut se tromper**, et elle se trompe sur l'élément le plus visible de l'écran. Trois garde-fous :

1. Une **couleur de repli neutre** — un gris-brun désaturé — quand aucun mot-clé ne correspond. Elle est visuellement franche, pas une teinte au hasard qui passerait pour une vraie famille.
2. La règle **ne devine jamais par approximation**. Un libellé inconnu prend le repli ; il ne prend pas la famille la plus proche. Une couleur fausse est pire qu'une couleur absente.
3. La famille **ne porte aucune information critique**. Elle ne dit rien des allergènes, qui viennent des données. Au pire, un plat végétarien apparaît en gris — désagréable, sans conséquence.

Une table de correspondance des couleurs est mise à jour à mesure que les libellés non reconnus sont recensés (D9).

### D12 — Un rôle absent laisse son alvéole vide plutôt que de refermer la grille

Le PRD §4 documente que certains jours n'ont pas d'entrée ou pas d'accompagnement. Deux traitements possibles : refermer la grille, ou conserver le creux.

**Le creux est conservé**, avec un libellé explicite (« Pas d'entrée ce jour »). Deux raisons : c'est fidèle au plateau réel, qu'on ne recompose pas parce qu'une case est vide ; et surtout c'est honnête sur la donnée. Une grille qui se referme rend indistinguables « il n'y a pas d'entrée » et « le parser n'a pas trouvé l'entrée » — or c'est précisément la confusion que le §9 du PRD cherche à éviter.

*Contrepartie :* l'écran est moins dense. C'est le bon échange sur un écran qui porte de l'information allergène.

### D13bis — Un menu unique pour toutes les écoles

Confirmé : maternelle et élémentaire partagent le même menu, et la Ville publie une grille unique pour l'ensemble des écoles.

Le modèle de données du PRD §5 tient donc tel quel : un fichier par mois, un jour par date, sans dimension d'établissement ni de niveau. C'était la seule question ouverte dont la réponse aurait coûté cher tardivement, puisqu'elle aurait ajouté un axe au modèle. Elle est fermée avant que le schéma ne soit figé.

*Si cela changeait un jour* (un mois publiant deux grilles), la migration passerait par un `schemaVersion: 2` et non par une correction en place.

### D13 — Les PDF sources vivent dans le dépôt

Les PDF mensuels sont conservés sous `sources/pdf/`, versionnés et exclus du build. Environ 4 Mo par mois, soit 50 Mo par année scolaire.

C'est ce que demande le PRD §6.1 — « conserver les PDF bruts permet de rejouer le parser après correction sans dépendre du site source » — et le quota qui l'interdisait est parti avec alwaysdata (D2). Sans eux, corriger le parser six mois plus tard suppose que la mairie n'a ni déplacé ni remplacé ses fichiers, ce qui est un pari que le §4 du PRD déconseille explicitement.

Bénéfice secondaire : les PDF sont aussi les fixtures des tests golden. Un dépôt qui les contient est un dépôt où l'on peut rejouer tout le corpus hors ligne.

*À surveiller :* un dépôt Git ne rétrécit jamais. Au-delà de deux ou trois années scolaires, il faudra élaguer ou passer à un stockage annexe. Ce n'est pas un problème avant 2029.

### D14 — Le parser PDF est la seule source, sans démarche auprès de la mairie

Le PRD §4bis A recommande de demander la publication des menus en open data, et note que c'est la seule action du projet dont la valeur survive au désintérêt de son auteur. L'argument tient toujours, et il est renforcé : les métadonnées du PDF montrent qu'il est **exporté depuis Microsoft Excel**, donc le classeur source existe et la demande serait modeste.

La décision est néanmoins de **ne pas engager cette démarche**. Le projet est personnel, et l'exposer comme réutilisateur des données n'est pas souhaité pour l'instant. Le parser PDF est donc la source unique, sans repli.

Deux conséquences à assumer. La première est que le mode de mort décrit au §9 du PRD reste entier : un changement de gabarit peut produire des données fausses et plausibles, et l'observabilité du groupe de tâches correspondant n'est pas optionnelle. La seconde est que ce choix reste réversible à tout moment et sans coût d'architecture : une source structurée remplacerait le parser sans toucher au front, puisque la frontière du §10 est le JSON.

*Point favorable découvert en cours de route :* un PDF issu d'un export Excel présente une géométrie de cellules régulière, bien plus docile que la mise en page libre que redoutait le §6.2. Le spike de faisabilité reste nécessaire, mais son issue est moins incertaine.

### D10 — Un filtre allergènes, pas un profil utilisateur

La première rédaction prévoyait des profils enfants nommés, multiples. C'est écarté : le réglage retenu est un **jeu unique d'allergènes à signaler**, sans nom.

Ce qui disparaît en conséquence : un écran de gestion de profils, la bascule entre profils, le recalcul de l'affichage au changement de profil, et la question de savoir ce qu'on affiche quand deux enfants ont des allergies différentes. Ce qui reste est une préférence d'affichage — de la même nature qu'un choix de thème.

Le bénéfice secondaire n'est pas mince : sans prénom, il ne reste rien dans le stockage local qui ressemble même de loin à une donnée personnelle.

### D6 — `localStorage` pour le filtre, en écriture synchrone, avec dégradation silencieuse

Le filtre tient en quelques dizaines d'octets. IndexedDB serait de la complexité pour rien ; un cookie ferait entrer le sujet du consentement par la fenêtre.

Si `localStorage` est indisponible (mode privé strict, stockage désactivé), l'application **fonctionne sans signalement** plutôt que d'échouer. Le filtre est un confort, pas un prérequis à la lecture d'un menu.

*Conséquence assumée :* effacer les données du navigateur perd le réglage. C'est le prix de l'absence de compte, et c'est le bon prix.

### D7 — La résolution du « jour à afficher » est une fonction pure, isolée de l'horloge

`resolveDisplayDay(dataset, now)` prend la date en paramètre plutôt que d'appeler `Date.now()`. Sans cela, les règles de bascule (vendredi soir → lundi, dernier jour du mois publié → premier du suivant, mois non publié → message dédié) ne sont testables qu'en manipulant le temps système.

C'est la même discipline que le PRD §10 impose au parser, appliquée au front. C'est aussi l'endroit où se concentrent tous les états limites du PRD §7.3, donc l'endroit où les tests ont le meilleur rendement.

### D8 — Accessibilité RGAA / WCAG 2.1 AA traitée comme une contrainte de conception, pas comme une passe finale

Un service qui rediffuse une donnée publique municipale en étant moins accessible que sa source serait difficile à défendre. Rattraper l'accessibilité coûte par ailleurs beaucoup plus cher que la tenir.

Point non négociable : **l'information allergène n'est jamais portée par la seule couleur.** Elle est doublée d'un libellé textuel et d'une marque de forme. Contrastes ≥ 4.5:1, cibles tactiles ≥ 44 px, navigation clavier complète, `lang="fr"`.

## Risks / Trade-offs

**Le schéma est figé sur un seul mois observé** → `schemaVersion` est présent dès la V1. Le change « parser » aura explicitement le droit de proposer un `schemaVersion: 2` ; le coût de migration est nul tant qu'un seul consommateur existe.

**Une donnée allergène erronée peut avoir des conséquences médicales** → trois lignes de défense : la saisie manuelle est relue, le disclaimer « seul le document officiel de la Ville fait foi » est visible et non repliable, et le lien vers le PDF source est présent sur chaque écran de menu. Le chemin de rendu `confidence: low` est implémenté et testé maintenant, avant d'être nécessaire.

**Un chemin qui marche en local et casse en production** → aucun chemin absolu écrit à la main ; les chemins de données passent par `$app/paths`. Le risque a beaucoup baissé depuis que le site est servi à la racine (D2) plutôt que sous un sous-chemin, mais il n'est pas nul : un déploiement vert ne prouve pas qu'un site est servi. Le contrôle post-déploiement qui vérifiait que `index.json` répondait effectivement est tombé avec la publication GitHub Pages ; il reste à réintroduire (tasks 12.3).

**Le service worker sert du contenu périmé après un déploiement** → versionnement du cache indexé sur le build, `stale-while-revalidate` sur `/data/*` et non `cache-only`, et suppression des anciens caches à l'activation. Un service worker mal purgé est le mode de panne le plus pénible d'une PWA, parce qu'il survit au rechargement.

**iOS n'installe une PWA que depuis « Ajouter à l'écran d'accueil »** → sans impact en V1 puisqu'il n'y a pas de notifications, mais cela plafonne l'ergonomie sur iPhone. À documenter dans l'écran À propos plutôt qu'à cacher.

**Le projet meurt d'abandon, pas de concurrence** → l'indicateur de succès est « ouvrir l'app plutôt que le PDF tous les matins pendant un mois ». Livrer un écran utilisable avant d'avoir écrit une ligne de parser est la principale mitigation de ce risque, et c'est l'objet même de D3.

**SvelteKit peut déborder le budget de 60 Ko si on l'oublie** → mesure du bundle intégrée au build, avec un seuil qui fait échouer la CI plutôt qu'un rapport que personne ne lit.

## Migration Plan

Aucune migration : le projet part de zéro, il n'existe ni utilisateur, ni donnée, ni déploiement antérieur.

Le déploiement initial dépend de la création du dépôt distant, qui n'existe pas encore. Le développement et les tests n'en dépendent pas — seule la mise en ligne est bloquée, et elle peut arriver en dernier.

## Open Questions

1. **Le goûter est-il utile ou du bruit ?** Affiché par défaut, hors du plateau et sous une séparation — un goûter n'est pas servi sur le plateau du déjeuner, et la mise en page le dit. Une règle CSS le retire si la réponse est « bruit ».
2. **Déclinaison sombre de la palette.** Réfectoire est claire ; sa version `prefers-color-scheme: dark` reste à dessiner. Les cinq familles devront y retrouver leur contraste, ce qui les fera probablement éclaircir — et pourrait rendre inutile l'inversion de polarité de la volaille.
3. **États manquants de l'écran Semaine :** vacances scolaires, jour férié, semaine non publiée. Aucun n'apparaît dans le PDF de septembre.
4. **Nom de domaine.** Le PRD note qu'un nom neutre plutôt que personnel est l'une des trois décisions irréversibles du projet. Non tranché, et non bloquant tant que le dépôt distant n'existe pas.
