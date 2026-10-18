# Allergen Filter Specification

## Purpose

Permettre à un parent de choisir les allergènes qui le concernent et de voir signalés, en toutes lettres, les plats qui en contiennent.

## Requirements

### Requirement: Réglage local des allergènes à signaler

Le système SHALL permettre de sélectionner un jeu unique d'allergènes à signaler, choisis parmi les quatorze allergènes réglementaires et présentés par leur libellé en clair.

Ce réglage NE SHALL PAS porter de nom, ni permettre la création de plusieurs jeux distincts : c'est une préférence d'affichage, pas un profil d'utilisateur.

Le réglage SHALL être stocké exclusivement dans le navigateur et NE SHALL PAS être transmis à un serveur.

#### Scenario: Sélection d'allergènes
- **WHEN** l'utilisateur coche des allergènes dans les réglages
- **THEN** la sélection est enregistrée localement et prend effet immédiatement sur les écrans de consultation

#### Scenario: Persistance entre sessions
- **WHEN** l'utilisateur ferme puis rouvre l'application
- **THEN** sa sélection d'allergènes est restaurée

#### Scenario: Aucune transmission réseau
- **WHEN** la sélection est modifiée
- **THEN** aucune requête réseau contenant cette sélection n'est émise

#### Scenario: Sélection par libellé
- **WHEN** l'utilisateur choisit ses allergènes
- **THEN** chacun est présenté par son libellé en clair et non par son seul code numérique

#### Scenario: Retrait d'un allergène
- **WHEN** l'utilisateur décoche un allergène précédemment sélectionné
- **THEN** les plats qui n'étaient signalés que par celui-ci cessent de l'être

### Requirement: Fonctionnement dégradé sans stockage

Lorsque le stockage local est indisponible, le système SHALL rester pleinement utilisable pour la consultation des menus, sans signalement, et SHALL en informer l'utilisateur au moment où il tente d'enregistrer une sélection.

#### Scenario: Stockage local inaccessible
- **WHEN** le stockage local est désactivé ou en échec
- **THEN** les écrans de consultation fonctionnent normalement et aucune erreur bloquante n'est affichée

#### Scenario: Tentative d'enregistrement sans stockage
- **WHEN** l'utilisateur modifie sa sélection alors que le stockage est indisponible
- **THEN** l'application l'informe que la préférence ne sera pas conservée après fermeture

### Requirement: Mise en évidence des allergènes sélectionnés

Lorsqu'au moins un allergène est sélectionné, le système SHALL signaler les plats qui en contiennent, sur l'écran Aujourd'hui comme sur l'écran Semaine, en nommant le ou les allergènes concernés en toutes lettres.

Sur l'écran Aujourd'hui, le signalement SHALL désigner le plat concerné et non la seule journée : savoir quel plat porte l'allergène relève de la lecture de l'écran, et NE SHALL PAS exiger l'ouverture du détail.

Le signalement NE SHALL JAMAIS reposer sur la seule couleur : il SHALL être doublé d'un libellé textuel et d'une marque perceptible sans distinction chromatique.

#### Scenario: Plat contenant un allergène sélectionné
- **WHEN** un plat contient un allergène de la sélection
- **THEN** il est signalé visuellement et le ou les allergènes concernés sont nommés en clair

#### Scenario: Signalement au niveau du plat
- **WHEN** un seul plat du jour contient un allergène de la sélection
- **THEN** le signalement apparaît sur l'entrée de ce plat, et non sur l'ensemble du menu

#### Scenario: Signalement sans dépendance à la couleur
- **WHEN** un plat concerné est affiché
- **THEN** son signalement reste perceptible en niveaux de gris et est restitué par un lecteur d'écran

#### Scenario: Aucun allergène sélectionné
- **WHEN** la sélection est vide
- **THEN** les menus sont affichés sans signalement, sans invitation insistante à en configurer un

### Requirement: Détail des allergènes de la journée

Le système SHALL permettre de consulter, en une seule ouverture, la liste des plats de la journée affichée — goûter compris — accompagnés chacun de ses allergènes exprimés en libellés clairs issus de la légende du mois, que ceux-ci figurent ou non dans la sélection.

Le système NE SHALL PAS exiger une ouverture par plat pour obtenir cette liste.

L'ordre des plats dans cette liste SHALL être celui de l'écran du jour, afin que la lecture de l'écran et celle du détail se correspondent.

Lorsqu'au moins un allergène est sélectionné, le détail SHALL s'ouvrir sur un résumé qui énonce, pour chaque allergène sélectionné, les plats de la journée qui le déclarent, ou qu'aucun plat ne le déclare. Dans la liste des plats, les allergènes sélectionnés SHALL précéder les autres et porter une marque perceptible sans distinction chromatique et restituée par un lecteur d'écran ; les autres allergènes SHALL rester lisibles.

Le résumé NE SHALL PAS présenter l'absence de déclaration comme l'absence de l'allergène.

Lorsque la sélection est vide, le détail NE SHALL comporter ni résumé ni invitation à configurer un filtre.

#### Scenario: Consultation du détail
- **WHEN** l'utilisateur actionne le menu du jour
- **THEN** tous les plats de la journée sont affichés, chacun avec ses allergènes en libellés clairs

#### Scenario: Plat sans allergène déclaré
- **WHEN** un plat de la journée ne déclare aucun allergène
- **THEN** l'application indique pour ce plat l'absence d'allergène déclaré, sans laisser entendre qu'elle garantit son absence

#### Scenario: Rôle absent de la journée
- **WHEN** un rôle n'est pas servi ce jour-là
- **THEN** il n'apparaît pas dans le détail, l'absence étant déjà énoncée sur l'écran du jour

#### Scenario: Correspondance des ordres
- **WHEN** l'utilisateur ouvre le détail depuis l'écran du jour
- **THEN** les plats y figurent dans le même ordre que sur l'écran du jour

#### Scenario: Résumé de la sélection
- **WHEN** le gluten et le lait sont surveillés, que le clafoutis déclare les deux et la salade grecque le lait seul
- **THEN** le détail s'ouvre sur un résumé qui associe le gluten au clafoutis, et le lait à la salade grecque et au clafoutis

#### Scenario: Allergène surveillé qu'aucun plat ne déclare
- **WHEN** l'arachide est surveillée et qu'aucun plat du jour ne la déclare
- **THEN** le résumé indique qu'aucun plat ne la déclare, sans affirmer que la journée en est exempte

#### Scenario: Allergènes surveillés en tête et marqués
- **WHEN** un plat déclare les œufs, le gluten et le lait, et que le gluten et le lait sont surveillés
- **THEN** le gluten et le lait figurent avant les œufs, marqués comme surveillés par un texte que restitue un lecteur d'écran, et la marque reste perceptible en niveaux de gris

#### Scenario: Sélection vide
- **WHEN** aucun allergène n'est surveillé et que l'utilisateur ouvre le détail
- **THEN** aucun résumé ni aucune invitation n'est affiché, et les allergènes sont présentés au même poids

#### Scenario: Jour sans allergènes précisés, filtre actif
- **WHEN** le lait est surveillé et que le document du jour ne précise pas les allergènes
- **THEN** le résumé est remplacé par un avertissement qui nomme le lait comme impossible à vérifier pour ce jour et renvoie au document officiel

### Requirement: Visibilité du filtre actif

Lorsqu'au moins un allergène est sélectionné, le système SHALL l'indiquer en permanence sur les écrans de consultation, indépendamment de la présence d'un plat concerné ce jour-là. L'indication SHALL énoncer le nombre d'allergènes surveillés.

Cette indication SHALL être portée par la commande qui mène au réglage, de sorte que voir l'état et aller le corriger soient le même geste.

Le nombre SHALL être restitué aux technologies d'assistance par le nom accessible de cette commande, et NE SHALL PAS reposer sur la seule présence d'une marque visuelle.

Lorsque la sélection est vide, aucune indication NE SHALL être affichée — ni marque, ni compte nul, ni invitation à configurer un filtre.

L'espace occupé par cette indication SHALL être réservé dans la mise en page indépendamment de l'état de la sélection, de sorte que sa lecture depuis le stockage local ne déplace aucun contenu.

#### Scenario: Filtre actif un jour sans plat concerné
- **WHEN** trois allergènes sont surveillés et qu'aucun plat du jour affiché n'en contient
- **THEN** l'écran indique néanmoins que trois allergènes sont surveillés

#### Scenario: Restitution du compte
- **WHEN** un lecteur d'écran atteint la commande qui mène au réglage des allergènes
- **THEN** il annonce ce que la commande ouvre et le nombre d'allergènes surveillés

#### Scenario: Sélection vide
- **WHEN** aucun allergène n'est sélectionné
- **THEN** aucune marque ni aucun compte n'est affiché sur la commande, et aucune invitation à en configurer un n'est présentée

#### Scenario: Aucun déplacement à l'hydratation
- **WHEN** l'application s'ouvre et lit une sélection non vide depuis le stockage local
- **THEN** l'indication apparaît sans déplacer aucun élément de l'écran

#### Scenario: Correction depuis l'indication
- **WHEN** l'utilisateur actionne la commande portant l'indication
- **THEN** il atteint l'écran de réglage des allergènes

### Requirement: Allergènes non précisés par le document

Lorsque le document source d'un jour ne précise pas les allergènes, le système SHALL le signaler sur l'écran du jour, avec un accès au document officiel, et sur l'écran de la semaine. Il NE SHALL PAS présenter les plats de ce jour comme n'ayant aucun allergène déclaré, hormis ceux qui portent des codes.

Lorsque des allergènes sont surveillés, le système SHALL indiquer qu'ils ne peuvent pas être signalés pour ce jour. L'absence de plat signalé NE SHALL PAS être présentée comme l'absence des allergènes surveillés.

#### Scenario: Jour sans allergènes précisés
- **WHEN** l'utilisateur consulte un jour dont le document ne précise pas les allergènes
- **THEN** un avertissement le dit et renvoie au document officiel, et le détail des plats indique des allergènes non communiqués

#### Scenario: Filtre actif sur un jour sans allergènes précisés
- **WHEN** le lait est surveillé et que l'utilisateur consulte un jour dont le document ne précise pas les allergènes
- **THEN** l'avertissement indique que les allergènes surveillés ne peuvent pas être signalés pour ce jour

#### Scenario: Semaine contenant un tel jour
- **WHEN** l'utilisateur consulte une semaine contenant un jour dont le document ne précise pas les allergènes
- **THEN** ce jour est marqué comme ayant des allergènes non précisés

### Requirement: Un pictogramme par allergène signalé

La pastille de signalement SHALL dessiner un pictogramme par allergène signalé, dans l'ordre où son texte les nomme, et trois au plus. Au-delà de trois, le texte SHALL continuer de nommer chaque allergène signalé : le pictogramme double le texte et ne le remplace jamais. Cette règle SHALL valoir sur l'écran Aujourd'hui comme sur l'écran Semaine.

#### Scenario: Deux allergènes signalés sur un plat
- **WHEN** un plat contient des œufs et du lait, et que la sélection comprend les deux
- **THEN** sa pastille montre le pictogramme des œufs puis celui du lait, et nomme les deux

#### Scenario: Plus de trois allergènes signalés
- **WHEN** une journée de la semaine contient quatre allergènes de la sélection
- **THEN** sa pastille montre trois pictogrammes, et son texte nomme les quatre allergènes
