## REMOVED Requirements

### Requirement: Choix du thème

**Reason** : le réglage n'a jamais correspondu à un besoin. Une application consultée le matin pour savoir ce qui est servi ne se configure pas ; le choix coûtait deux palettes, un script bloquant, une clé de stockage dupliquée et le haut de l'écran Réglages, pour une fonction que personne n'a demandée (design.md, D25).

**Migration** : aucune. L'application présente désormais une apparence unique, décrite par l'exigence « Accessibilité des écrans de consultation » de `menu-browsing`. Le suivi de `prefers-color-scheme` disparaît avec le choix : une apparence non choisie et non annulable serait pire que pas de choix du tout.

### Requirement: Persistance et application du thème

**Reason** : conséquence du retrait du choix — il n'y a plus rien à persister ni à appliquer avant la première peinture. Le HTML prérendu arrive avec la seule apparence qui existe.

**Migration** : le script en ligne de `src/app.html` est supprimé. La clé `cantine.theme` déjà écrite dans le stockage local de certains navigateurs devient inerte et n'est pas nettoyée : le code de nettoyage coûterait, en JavaScript expédié à tous, plus que ce qu'il effacerait chez quelques-uns.

### Requirement: Cohérence du thème avec le navigateur

**Reason** : la couleur annoncée au navigateur n'a plus à suivre un thème variable.

**Migration** : les deux balises `theme-color` conditionnelles sont remplacées par une seule, sans requête de média, portant la couleur du fond unique.

### Requirement: Contraste garanti dans les deux thèmes

**Reason** : il n'y a plus deux thèmes. L'exigence de contraste ne disparaît pas pour autant : elle est reprise, étendue aux surfaces translucides, par l'exigence « Accessibilité des écrans de consultation » de `menu-browsing` (design.md, D27).

**Migration** : les vingt paires mesurées sur la palette sombre disparaissent ; les paires translucides apparaissent.
