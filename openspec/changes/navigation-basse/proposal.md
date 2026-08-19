## Why

La barre d'onglets porte trois segments de même taille : Jour, Semaine, Allergènes. Elle affirme que ces trois choses sont de même nature. Elles ne le sont pas. Jour et Semaine sont deux vues des mêmes données, consultées chaque matin ; Allergènes est un réglage, coché une fois à l'installation et jamais rouvert.

L'argument qui condamne ce troisième segment est déjà écrit deux fois dans le dépôt, et n'a simplement jamais été retourné contre lui :

> « À propos n'est pas un onglet : on le consulte une fois, pas tous les matins. Un quatrième onglet volerait de la place à ce qu'on ouvre chaque jour. » — `+layout.svelte`

> « La barre d'onglets porte trois destinations consultées quotidiennement. Le thème se choisit une fois. » — `coque-lisible/design.md`, D22

Le thème a depuis disparu en entier (D25). Ce qui reste sous « Réglages » est un unique écran d'allergènes, occupant un tiers de la barre.

Et cette barre est en haut, c'est-à-dire hors du pouce. Les deux destinations réellement consultées chaque matin sont placées là où la main ne va pas sans changer de prise.

Ces deux défauts ont une cause commune : **aucune exigence ne décrit l'accès aux écrans**. Les capacités existantes spécifient l'écran Aujourd'hui, l'écran Semaine, l'écran À propos, l'en-tête, la couche modale — jamais la façon d'aller de l'un à l'autre. Ce qui n'est pas spécifié dérive.

## What Changes

- **La barre passe en bas et perd son troisième segment.** Deux destinations, Jour et Semaine, ancrées au bas de l'écran, à portée de pouce.
- **Les allergènes quittent la barre pour une commande d'en-tête** — une roue crantée en haut à droite, présente sur les écrans de consultation.
- **La roue porte le nombre d'allergènes surveillés.** Le filtre n'est pas un réglage inerte : il modifie en permanence ce qui s'affiche sur les deux écrans. Une commande muette laisserait cet état invisible partout ailleurs que sur les plats concernés. Aucune marque lorsque la sélection est vide — l'exigence existante interdit déjà toute « invitation insistante à en configurer un ».
- **`viewport-fit=cover` reçoit enfin sa zone sûre.** Il est déclaré dans `app.html` depuis l'origine et `env(safe-area-inset-*)` n'apparaît nulle part dans le code. Aujourd'hui sans effet, puisque rien n'est ancré au bas de l'écran ; une barre fixe transforme cette dette en défaut, sur tous les téléphones à indicateur d'accueil.
- **Une icône de commande cesse d'être rangée avec les illustrations.** La bibliothèque de `Sprite.svelte` est spécifiée décorative et non annoncée aux technologies d'assistance. Une roue qui ouvre un écran n'est pas décorative.

## Capabilities

### Modified Capabilities

- `menu-browsing` : nouvelle exigence **Accès aux écrans**, qui décrit ce qui n'avait jamais été spécifié — quelles destinations sont atteignables en permanence, où, et lesquelles ne le sont pas.
- `allergen-filter` : nouvelle exigence **Visibilité du filtre actif**, qui étend le signalement hors des plats concernés. Le réglage lui-même, son stockage et son effet sur les menus sont inchangés.

## Impact

**Code applicatif** — `src/routes/+layout.svelte` (la barre descend et perd un segment, la coque réserve la hauteur de la barre et la zone sûre), `src/lib/ui/EnTete.svelte` (l'en-tête accueille une commande), un nouveau composant d'icônes d'interface distinct de `Sprite.svelte`, `src/lib/design/tokens.css` (hauteur de barre, zone sûre).

**Ce qui ne change pas** — la route `/reglages` et son contenu, le stockage du filtre, le signalement sur les plats, l'écran À propos qui reste en pied de page.

**Tests** — l'accès aux écrans devient vérifiable de bout en bout, ce qu'il n'était pas. Deux tests existants sont exposés : « l'ouverture de la couche modale ne décale pas le contenu » et « la page ne défile jamais horizontalement » interagissent tous deux avec un élément fixe. La couche modale de détail est ancrée au bas de l'écran étroit et vit en top-layer : elle recouvre la barre, ce qui est le comportement voulu, mais doit être vérifié plutôt que supposé.

**Écran large** — l'exigence de `coque-lisible` impose la même structure qu'un téléphone, à une échelle supérieure, sans mise en page distincte. La barre reste donc bornée à la colonne de contenu et ne s'étire pas sur toute la largeur.

**Hors périmètre** — le contenu du jour, traité par `hierarchie-du-jour`. Le renommage de la route `/reglages`, qui casserait les signets et les raccourcis d'application installée pour un gain de vocabulaire.
