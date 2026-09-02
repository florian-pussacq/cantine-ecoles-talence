## Why

**Une direction visuelle a été arrêtée sur maquette, et elle contredit quatre décisions en vigueur.** Ce n'est pas une découverte technique : c'est un arbitrage de goût, assumé par l'humain, entre deux critères qui ne se départagent pas par le raisonnement.

Le critère qui a construit l'écran actuel est l'économie : chaque pixel doit porter une information qui varie, la couleur ne décore pas, l'illustration signale un rang, tout le déjeuner tient au-dessus de la barre sans qu'un doigt ait à bouger. Cet écran est juste. Il est aussi austère : un plateau gris sur une ardoise sombre, six lignes alignées, un seul aplat de couleur. Il se lit comme un tableau d'affichage.

Le critère retenu maintenant est la reconnaissance. Une application consultée par des parents et par des enfants doit *ressembler* à une cantine d'école — claire, chaleureuse, faite de cartes qu'on parcourt. La maquette `docs/file_00000000b2748243998177dcf23b31b9.png` fixe cette direction : fond crème, cartes blanches, une pastille colorée par rôle, une vignette par plat, les onglets en haut, un pied fixe.

**Ce qu'on perd est réel et doit être écrit ici, pas découvert plus tard.**

1. **L'écran cesse de tenir d'un coup d'œil.** Sept rôles en cartes ne logent pas sur un téléphone. Un parent qui vérifie le menu en trois secondes devra faire défiler pour atteindre le dessert. `e2e/hauteur.spec.ts` existait précisément pour l'interdire.
2. **La couleur cesse de porter de l'information.** Le rôle est constant : « Entrée » est vert tous les jours de l'année. Le libellé du rôle est écrit en toutes lettres juste à côté de sa pastille — deux éléments pour un seul fait, exactement le reproche que D28 adressait au compartiment du pain. Ce reproche est ici accepté, au nom de la structure : la couleur ne dit plus *quoi*, elle dit *où l'on est dans la liste*.
3. **L'illustration cesse d'être un marqueur de rang.** D40 tenait qu'un dessin sur l'écran signifie « c'est le plat du jour ». Avec une vignette par carte, « Pain » et « Panibuns aux fromages » porteront le même `ill-pain` le même jour — ce que la règle actuelle interdit explicitement.
4. **Les onglets quittent la zone du pouce.** `navigation-basse` les y avait descendus pour une raison qui n'a pas cessé d'être vraie.

Ce qu'on gagne est une identité. Sur une application dont l'usage réel est un coup d'œil quotidien, ça compte assez pour payer ce prix — mais le prix doit être nommé.

**Il n'y aura pas de photos.** La maquette en montre ; le schéma n'a pas de champ `image`, la saisie est manuelle (`producerVersion: "manual"`), et `scripts/check-budget.js` fait échouer le build au-delà de 150 Ko de premier chargement. Vingt jours de menus par mois, six plats par jour : ce serait une chaîne de production éditoriale, pas une refonte d'interface. Les vignettes restent les treize illustrations du sprite, qui ne coûtent aucune requête.

**Il n'y aura pas de sous-titres non plus.** `Course.label` est un texte unique de 1 à 80 caractères ; « vinaigrette basilic » n'existe nulle part dans les données. La seconde ligne de chaque carte portera ce qui existe et qui informe : les capsules de qualité et la pastille d'allergène signalé.

## What Changes

- **La palette passe au clair.** L'ardoise `--table` disparaît, avec elle `--on-table` et les huit transparences déclarées qui en dépendent. Le fond devient crème, les cartes blanches, l'accent doré.
- **Sept rôles, sept couleurs.** La maquette n'en colore que quatre ; Laitage, Pain et Goûter sont à inventer. Chaque rôle porte un aplat pour sa pastille et une encre assombrie pour son libellé, sur le patron des familles — l'orange de la maquette ne fait que 2,9:1 sur blanc et ne peut pas servir de texte.
- **Les familles survivent, déplacées.** `classify()` reste : c'est lui qui choisit l'illustration. Les tokens `--fam-*` ne servent plus que le disque de l'écran de la semaine, où la famille est bien ce qui varie et où aucun rôle n'est à distinguer.
- **La vedette disparaît.** Toutes les cartes ont la même forme. Le plat garde son rang par le seul corps de son nom, sans aplat ni cadre.
- **Les onglets remontent, le pied se fixe.** La barre basse est remplacée par un pied fixe portant les mentions légales ; la date de mise à jour et le lien vers le PDF officiel redescendent dans le flux, après la dernière carte.
- **La commande de retour quitte l'en-tête.** Elle occupe un rang propre sous les cartes, ce qui rouvre la question que D44 avait fermée — et la referme autrement : la place n'est plus partagée, elle est conditionnelle.
- **Un seul rang de flèches.** La maquette en dessine deux, en haut et en bas. C'est une redondance de maquette, pas une intention : le rang haut porte les flèches et la date, le rang bas ne porte que le retour.

## Capabilities

### Modified Capabilities

- `menu-browsing` : l'exigence **Ardoise du jour** devient **Cartes du jour**. L'exigence **En-tête d'écran** perd la place partagée. L'exigence **Coque et navigation** voit les onglets remonter et le pied se fixer.
- `dish-illustration` : l'exigence d'unicité de l'illustration par écran est retirée.

## Impact

**Code applicatif** — `src/lib/design/tokens.css` (la palette entière), `src/lib/menu/Tray.svelte` (la grille devient une liste de cartes), `src/lib/menu/PlatCarte.svelte` (nouveau), `src/lib/ui/Onglets.svelte` (nouveau, extrait du layout), `src/routes/+layout.svelte` (la barre cède au pied fixe), `src/routes/+page.svelte`, `src/lib/ui/EnTete.svelte`, `src/lib/ui/Enseigne.svelte`, `src/lib/ui/Icone.svelte` (l'enseigne et les sept glyphes de rôle), puis l'adaptation au clair de `semaine`, `reglages`, `a-propos`, `DaySheet` et `AllergenChip`.

**Identité** — `static/manifest.webmanifest` et `static/favicon.svg` portent encore `#1e5a6b`, vestige d'une palette antérieure à l'ardoise, déjà divergent de `app.html`. Une refonte de palette est le seul moment où cette dette se solde sans être un détour.

**Tests** — `contrast.test.ts` est réécrit mais son contrôle de couverture est conservé : c'est lui qui empêche une transparence non déclarée de passer. `hauteur.spec.ts` est remplacé plutôt que supprimé — la contrainte périmée tombe, la garantie utile devient « la première carte est entièrement visible sans défiler ». `qualite.spec.ts` n'est pas touché : 44 pixels, un seul titre, aucune requête tierce, aucun cookie, ce filet-là ne dépend d'aucune direction visuelle.

**Données** — aucun changement.

**Hors périmètre** — les photographies de plats, qui demanderaient un champ au schéma, une chaîne de production éditoriale et une révision du budget ; un thème sombre, que D25 a écarté et que rien ici ne réclame.
