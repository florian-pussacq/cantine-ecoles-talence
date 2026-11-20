## MODIFIED Requirements

### Requirement: Les réglages regroupent plusieurs sujets

L'écran des réglages SHALL porter un titre couvrant l'ensemble des sujets qu'il regroupe, et SHALL distinguer chaque sujet par un intitulé de section.

Il SHALL être un sommaire tenant sans défiler dans la plus petite fenêtre de téléphone prise en charge, et SHALL présenter ses sujets dans cet ordre : Apparence, Allergènes, Menus, Application.

L'apparence SHALL s'y régler sur place. Le réglage des allergènes NE SHALL PAS y figurer : il SHALL occuper un écran dédié, atteint par l'entrée de la section Allergènes. Cet écran SHALL porter, à la suite des allergènes à cocher, l'avertissement selon lequel seul le document officiel de la Ville fait foi.

La commande menant aux réglages SHALL continuer d'annoncer le nombre d'allergènes surveillés dans son nom accessible.

#### Scenario: Nom accessible de la commande
- **WHEN** trois allergènes sont surveillés
- **THEN** la commande menant aux réglages annonce les réglages et le nombre d'allergènes surveillés

#### Scenario: Le sommaire tient dans le premier écran
- **WHEN** l'utilisateur ouvre les réglages sur un téléphone de 390 × 844
- **THEN** les sections Apparence, Allergènes, Menus et Application sont visibles dans cet ordre, sans défiler

#### Scenario: L'apparence se règle sur place
- **WHEN** l'utilisateur choisit « Sombre » dans le sommaire des réglages
- **THEN** l'application passe en palette sombre sans quitter l'écran

#### Scenario: Le réglage des allergènes a son écran
- **WHEN** l'utilisateur actionne l'entrée de la section Allergènes
- **THEN** l'écran des allergènes s'affiche, avec les quatorze allergènes à cocher suivis de l'avertissement

### Requirement: Accès aux écrans

Le système SHALL rendre atteignables depuis les écrans de consultation d'un menu, sans défiler ni ouvrir de menu, les deux destinations consultées quotidiennement — l'écran du jour et l'écran de la semaine. Ce choix SHALL être ancré au bas de la fenêtre.

Ce choix NE SHALL PAS mettre sur le même plan une vue de consultation et un réglage, et NE SHALL PAS être affiché sur un écran qu'il ne permet pas de choisir : rien de ce qu'il propose ne s'y consulte, et il n'en est donc pas une sortie.

L'en-tête de l'application SHALL réserver un emplacement unique, occupé sur tout écran par exactement une commande :

- sur les écrans de consultation d'un menu, la commande menant aux réglages ;
- sur tout autre écran, la commande de sortie de cet écran.

La commande de sortie SHALL nommer sa destination, et SHALL mener à l'écran depuis lequel son écran s'atteint.

Cet emplacement NE SHALL jamais rester vide, et sa hauteur SHALL être réservée de sorte que l'en-tête ne change pas de hauteur d'un écran à l'autre.

Les mentions SHALL être atteignables depuis l'écran des réglages. Les écrans de consultation d'un menu NE SHALL PAS porter de lien vers les mentions : ils s'achèvent sur la provenance des données, et les mentions s'y atteignent par la commande menant aux réglages.

Le choix entre les deux écrans SHALL compenser la zone sûre inférieure de l'appareil, et le contenu de l'écran SHALL réserver sa hauteur augmentée de cette zone sûre, de sorte qu'aucun contenu ne reste inaccessible derrière lui. Cette réserve NE SHALL PAS être augmentée d'un intervalle qui la doublerait.

Sur un écran large, le choix entre les deux écrans SHALL rester borné à la colonne de contenu, conformément à l'exigence de lisibilité sur écran large.

#### Scenario: Destinations quotidiennes atteignables
- **WHEN** l'utilisateur consulte l'écran du jour ou celui de la semaine
- **THEN** l'autre est atteignable sans défiler ni ouvrir de menu, depuis le bas de la fenêtre

#### Scenario: Écran secondaire
- **WHEN** l'utilisateur consulte les réglages, le réglage des allergènes, le menu de grève ou les mentions
- **THEN** le choix entre les deux écrans de menu n'est pas affiché, la commande menant aux réglages n'est pas affichée, et une commande d'en-tête nommée permet de sortir de l'écran

#### Scenario: Sortie vers l'écran d'origine
- **WHEN** l'utilisateur ouvre le menu de grève ou le réglage des allergènes depuis les réglages, puis actionne la commande de sortie
- **THEN** il revient aux réglages

#### Scenario: L'en-tête ne change pas de hauteur
- **WHEN** l'utilisateur passe d'un écran de consultation à un écran secondaire
- **THEN** l'en-tête conserve la même hauteur, une commande ayant remplacé l'autre au même emplacement

#### Scenario: Zone sûre inférieure
- **WHEN** l'application est ouverte sur un appareil dont le bas de l'écran est occupé par un indicateur système
- **THEN** le choix entre les deux écrans reste atteignable au-dessus de l'indicateur, et aucun contenu ne demeure caché derrière lui

#### Scenario: Les mentions depuis un écran de menu
- **WHEN** l'utilisateur consulte l'écran du jour ou celui de la semaine et veut lire les mentions
- **THEN** il les atteint en ouvrant les réglages, et aucun lien vers les mentions ne figure au bas de l'écran de menu

#### Scenario: La provenance reste au bas des écrans de menu
- **WHEN** l'utilisateur défile jusqu'au bas de l'écran du jour ou de celui de la semaine
- **THEN** la date de mise à jour des menus et le lien vers le PDF officiel y figurent, visibles au-dessus du choix entre les deux écrans

#### Scenario: Les mentions depuis les réglages
- **WHEN** l'utilisateur consulte l'écran des réglages
- **THEN** un lien y mène aux mentions

#### Scenario: Deux écrans, un actif
- **WHEN** l'écran du jour est affiché
- **THEN** le choix présente exactement deux entrées, et celle du jour est restituée comme active

#### Scenario: Le choix survit au changement d'écran
- **WHEN** l'utilisateur a choisi un jour puis passe à l'écran de la semaine et revient
- **THEN** le jour choisi est toujours affiché

#### Scenario: Pied de page sur écran large
- **WHEN** l'application est ouverte sur un écran de bureau
- **THEN** la provenance des données reste bornée à la largeur de la colonne de contenu

#### Scenario: Barre sur écran large
- **WHEN** l'application est ouverte sur un écran de bureau
- **THEN** le choix entre les deux écrans reste borné à la largeur de la colonne de contenu et ne s'étire pas sur toute la fenêtre

#### Scenario: Aucun réglage dans la barre
- **WHEN** le choix entre les deux écrans est affiché
- **THEN** il ne contient que des destinations de consultation, à l'exclusion de tout écran de réglage
