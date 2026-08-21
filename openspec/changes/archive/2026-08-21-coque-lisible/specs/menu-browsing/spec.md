## ADDED Requirements

### Requirement: Couche modale de détail d'un plat

Le détail d'un plat SHALL être présenté dans une couche modale qui, tant qu'elle est ouverte, retient le focus clavier, empêche l'interaction et le défilement de ce qui se trouve derrière, et rend inopérantes les commandes de navigation entre jours.

La couche SHALL être refermable par au moins trois chemins : une commande visible portant un libellé explicite, la touche d'échappement, et une action sur la surface qui la sépare du contenu. À sa fermeture, le focus SHALL revenir sur l'élément qui l'a ouverte.

La couche NE SHALL PAS présenter d'affordance de manipulation à laquelle aucun comportement ne répond.

Sur un écran étroit, la couche SHALL occuper toute la largeur et être ancrée au bas de l'écran, de sorte que sa commande de fermeture reste à portée du pouce. Sur un écran large, elle SHALL être centrée et de largeur bornée.

#### Scenario: Le focus ne quitte pas la couche ouverte
- **WHEN** la couche est ouverte et que l'utilisateur parcourt les éléments interactifs au clavier
- **THEN** le parcours reste enfermé dans la couche et n'atteint jamais le contenu situé derrière

#### Scenario: Retour du focus à la fermeture
- **WHEN** l'utilisateur ferme la couche, par quelque chemin que ce soit
- **THEN** le focus revient sur le plat qui l'avait ouverte, et non au début du document

#### Scenario: Le fond ne défile pas
- **WHEN** la couche est ouverte et que l'utilisateur fait défiler au-delà de son contenu
- **THEN** le contenu situé derrière reste immobile

#### Scenario: Les commandes de jour sont neutralisées
- **WHEN** la couche est ouverte et que l'utilisateur actionne les flèches de navigation entre jours
- **THEN** le jour affiché ne change pas

#### Scenario: Adaptation à la largeur
- **WHEN** la couche est ouverte sur un écran large
- **THEN** elle est centrée et de largeur bornée, et non étirée sur toute la largeur disponible

### Requirement: En-tête d'écran

Chaque écran SHALL porter un en-tête tenant sur une seule ligne de contenu, énonçant en une phrase ce que l'écran montre et pour quand.

Chaque écran SHALL porter exactement un titre de premier niveau, qui SHALL être cet en-tête.

#### Scenario: Un seul titre de premier niveau
- **WHEN** un écran de consultation est chargé
- **THEN** le document contient exactement un titre de premier niveau

#### Scenario: L'en-tête situe la date
- **WHEN** l'écran du jour affiche un jour autre que celui du moment
- **THEN** l'en-tête énonce la date affichée et la façon dont elle se situe par rapport à aujourd'hui

### Requirement: Lisibilité sur écran large

Sur un écran large, le système SHALL présenter la même structure d'écran que sur un téléphone, à une échelle supérieure, sans introduire de mise en page distincte.

La colonne de contenu SHALL rester de largeur bornée : le texte NE SHALL PAS s'étirer sur toute la largeur disponible.

#### Scenario: Structure conservée
- **WHEN** l'application est ouverte sur un écran de bureau
- **THEN** les écrans présentent les mêmes éléments dans le même ordre que sur téléphone, à une échelle supérieure

#### Scenario: Accessibilité vérifiée sur écran large
- **WHEN** les contrôles d'accessibilité sont exécutés sur un écran de bureau
- **THEN** ils portent les mêmes exigences que sur téléphone et les satisfont

## MODIFIED Requirements

### Requirement: Navigation entre jours

Le système SHALL permettre de passer au jour servi précédent ou suivant. La navigation SHALL être possible au clavier et par une commande visible, et SHALL être doublée d'un geste de balayage horizontal sur l'écran du jour comme sur l'écran de la semaine.

Le geste SHALL doubler la navigation sans jamais s'y substituer : les commandes visibles et le clavier restent le chemin principal, un geste ne se découvrant pas et n'étant pas atteignable au clavier.

Le geste NE SHALL PAS se déclencher lorsque l'intention est un défilement vertical, et NE SHALL PAS produire, en fin de course, l'effet qu'aurait produit une simple pression au point de départ.

Le passage d'un jour à l'autre SHALL être perçu comme immédiat.

#### Scenario: Passage au jour suivant
- **WHEN** l'utilisateur demande le jour suivant depuis un vendredi
- **THEN** le lundi servi suivant est affiché, les jours non servis étant sautés

#### Scenario: Navigation au clavier
- **WHEN** l'utilisateur navigue au clavier uniquement
- **THEN** il peut atteindre et actionner les commandes de jour précédent et suivant, avec un indicateur de focus visible

#### Scenario: Limite du jeu de données
- **WHEN** l'utilisateur demande un jour au-delà des données disponibles
- **THEN** l'application le signale explicitement plutôt que d'afficher un écran vide

#### Scenario: Balayage au doigt sur un appareil tactile
- **WHEN** l'utilisateur balaie horizontalement l'écran du jour avec son doigt
- **THEN** le jour change dans le sens du geste, et le détail du plat situé sous le point de départ ne s'ouvre pas

#### Scenario: Défilement vertical préservé
- **WHEN** l'utilisateur fait défiler la page verticalement, fût-ce avec une composante horizontale
- **THEN** la page défile et le jour affiché ne change pas

#### Scenario: Balayage sur l'écran de la semaine
- **WHEN** l'utilisateur balaie horizontalement l'écran de la semaine
- **THEN** la semaine affichée change dans le sens du geste

### Requirement: Accessibilité des écrans de consultation

Les écrans de consultation SHALL respecter le niveau WCAG 2.1 AA : contraste de texte d'au moins 4.5:1, cibles tactiles d'au moins 44 pixels, navigation clavier complète avec focus visible, et langue du document déclarée à `fr`.

Le système SHALL respecter `prefers-reduced-motion`. Il SHALL proposer un thème sombre, dont la sélection est décrite par la capacité `theme-preference`, et SHALL conserver les rapports de contraste requis dans les deux thèmes.

#### Scenario: Mouvement réduit demandé
- **WHEN** l'utilisateur a activé la réduction des animations dans son système
- **THEN** les transitions entre jours sont supprimées, la navigation restant fonctionnelle

#### Scenario: Thème sombre système
- **WHEN** le système de l'utilisateur est en thème sombre et qu'aucun thème n'a été choisi dans l'application
- **THEN** l'application s'affiche en thème sombre en conservant les rapports de contraste requis
