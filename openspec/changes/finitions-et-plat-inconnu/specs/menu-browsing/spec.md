## MODIFIED Requirements

### Requirement: Écran Semaine

Le système SHALL présenter les cinq jours ouvrés de la semaine du jour affiché, sous une forme compacte permettant une lecture d'ensemble. Chaque jour SHALL être actionnable pour ouvrir le détail correspondant sur l'écran Aujourd'hui.

Chaque jour servi SHALL porter la couleur de la famille de son plat principal, la même que sur l'écran du jour, et le nom de cette famille écrit. La couleur NE SHALL PAS être le seul support de la famille. Un plat principal inclassable NE SHALL PAS porter de couleur de famille ni de nom de famille ; sa présentation SHALL se distinguer à la fois d'un jour servi d'une famille reconnue et d'un jour sans service.

#### Scenario: Consultation de la semaine
- **WHEN** l'utilisateur ouvre l'écran Semaine
- **THEN** les cinq jours ouvrés sont visibles avec au minimum le plat principal de chacun

#### Scenario: Ouverture du détail d'un jour
- **WHEN** l'utilisateur actionne un jour depuis l'écran Semaine
- **THEN** l'écran Aujourd'hui s'ouvre sur ce jour

#### Scenario: Semaine partiellement publiée
- **WHEN** certains jours de la semaine ne figurent pas dans les données
- **THEN** ces jours sont présentés comme non publiés, distincts d'un jour sans école

#### Scenario: La famille se lit sans la couleur
- **WHEN** l'écran Semaine est affiché en niveaux de gris
- **THEN** la famille du plat principal de chaque jour servi reste lisible, écrite en toutes lettres

#### Scenario: Jour non servi
- **WHEN** la semaine contient un jour férié
- **THEN** ce jour ne porte aucune couleur de famille, et se distingue d'un jour servi

#### Scenario: Plat principal inclassable sur la semaine
- **WHEN** le plat principal d'un jour servi n'appartient à aucune famille reconnue
- **THEN** ce jour ne porte aucune couleur de famille ni aucun nom de famille, et ne se confond ni avec un jour d'une famille reconnue ni avec un jour sans service

### Requirement: Le plat principal sur l'aplat de sa famille

Le plat principal SHALL être présenté sur un aplat de la couleur de sa famille, la même que sur l'écran de la semaine, avec le nom de cette famille écrit. Un plat principal dont la famille n'est pas reconnue NE SHALL PAS être posé sur un aplat : il SHALL être présenté sur une surface claire délimitée par un filet d'encre, son nom en encre, sans nom de famille, avec l'illustration de repli. Aucun autre élément du déjeuner NE SHALL porter de couleur de famille ni de rôle.

#### Scenario: Le plat principal porte sa famille
- **WHEN** l'écran du jour affiche un rôti de bœuf en plat principal
- **THEN** son aplat porte la couleur de la famille viande et le mot « Viande », la même couleur que la tuile de ce jour sur l'écran de la semaine

#### Scenario: Plat principal inclassable
- **WHEN** le plat principal n'appartient à aucune famille reconnue
- **THEN** il est présenté sur une surface claire cerclée d'un filet d'encre, sans couleur ni nom de famille, et reste désigné comme le plat principal

### Requirement: Accès aux écrans

Le système SHALL rendre atteignables depuis les écrans de consultation d'un menu, sans défiler ni ouvrir de menu, les deux destinations consultées quotidiennement — l'écran du jour et l'écran de la semaine. Ce choix SHALL être ancré au bas de la fenêtre.

Ce choix NE SHALL PAS mettre sur le même plan une vue de consultation et un réglage, et NE SHALL PAS être affiché sur un écran qu'il ne permet pas de choisir : rien de ce qu'il propose ne s'y consulte, et il n'en est donc pas une sortie.

L'en-tête de l'application SHALL réserver un emplacement unique, occupé sur tout écran par exactement une commande :

- sur les écrans de consultation d'un menu, la commande menant au réglage des allergènes ;
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
- **WHEN** l'utilisateur consulte le réglage des allergènes, le menu de grève ou les mentions
- **THEN** le choix entre les deux écrans de menu n'est pas affiché, la commande menant aux réglages n'est pas affichée, et une commande d'en-tête nommée permet de sortir de l'écran

#### Scenario: Sortie vers l'écran d'origine
- **WHEN** l'utilisateur ouvre le menu de grève depuis le réglage des allergènes puis actionne la commande de sortie
- **THEN** il revient au réglage des allergènes

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
