## ADDED Requirements

### Requirement: Un pictogramme par allergène signalé

La pastille de signalement SHALL dessiner un pictogramme par allergène signalé, dans l'ordre où son texte les nomme, et trois au plus. Au-delà de trois, le texte SHALL continuer de nommer chaque allergène signalé : le pictogramme double le texte et ne le remplace jamais. Cette règle SHALL valoir sur l'écran Aujourd'hui comme sur l'écran Semaine.

#### Scenario: Deux allergènes signalés sur un plat
- **WHEN** un plat contient des œufs et du lait, et que la sélection comprend les deux
- **THEN** sa pastille montre le pictogramme des œufs puis celui du lait, et nomme les deux

#### Scenario: Plus de trois allergènes signalés
- **WHEN** une journée de la semaine contient quatre allergènes de la sélection
- **THEN** sa pastille montre trois pictogrammes, et son texte nomme les quatre allergènes
