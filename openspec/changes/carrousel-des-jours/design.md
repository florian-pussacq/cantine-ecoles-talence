## Context

`createBalayage` (`src/lib/ui/balayage.ts`) est une fonction pure : elle reçoit des événements de pointeur et appelle `onPrevious` ou `onNext` au relâchement, si la course horizontale dépasse 60 pixels et domine la verticale d'un facteur 1,5. La surface déclare `touch-action: pan-y` (D18). Les écrans enveloppent leur contenu dans un `{#key date}` qui joue `glisser` : fondu et décalage de 24 pixels, `--glisse` (260 ms), `--courbe`. La date de l'en-tête (`RangNavigation`) joue la même animation (D30, « Une seule horloge »).

Deux exigences cadrent le changement : la date et le contenu changent sous la même durée, et le jour atteint est présent et actionnable pendant la transition.

## Goals / Non-Goals

**Goals:**

- Un contenu solidaire du doigt pendant le geste.
- Une issue qui prend en compte la vitesse autant que la distance.
- Un seul mouvement pour le doigt, les flèches et le clavier, sur les deux écrans.
- La décision testable sans navigateur, comme aujourd'hui.

**Non-Goals:**

- Défiler plusieurs jours d'un seul geste : un geste, un jour.
- Changer la navigation au clavier ou les commandes visibles, qui restent le chemin principal.
- Animer l'en-tête avec le contenu.

## Decisions

### D1 — Un suivi continu, toujours en fonction pure

`createBalayage` devient un suivi : à chaque mouvement il rend un **décalage** à appliquer, et au relâchement une **issue** (`precedent`, `suivant` ou `retour`). Il ne touche toujours ni au DOM ni à l'horloge : il reçoit des positions horodatées.

- **Verrou d'axe.** Tant que le doigt n'a pas parcouru 10 pixels, rien ne bouge. Ensuite, si le mouvement est surtout horizontal, le geste appartient au carrousel ; sinon il appartient au défilement vertical, et le carrousel l'ignore jusqu'au relâchement.
- **Issue.** Le jour change si la course dépasse 30 % de la largeur, ou si la vitesse au relâchement dépasse 0,4 pixel par milliseconde dans le même sens (un geste vif). Sinon, retour.
- **Bord.** Sans voisin de ce côté, le décalage est amorti (un tiers du mouvement), et l'issue est toujours le retour.

Les seuils sont des constantes nommées, à régler au doigt (D7).

### D2 — Les voisins n'existent que pendant le geste

Le jour précédent et le suivant sont rendus quand le geste devient horizontal, de part et d'autre, inertes et masqués aux technologies d'assistance. Ils disparaissent quand le jour s'est posé. Au repos, le document ne contient que le jour présenté : le lecteur d'écran, le focus et les tests ne voient qu'un jour, et le DOM ne triple pas.

Alternative écartée : trois panneaux permanents. Les tests trouveraient chaque libellé trois fois, et il faudrait garder les voisins hors du focus en permanence.

Alternative écartée : le défilement natif (`scroll-snap`). L'inertie vient gratuitement, mais il faut recentrer après chaque défilement sur un `scrollend` que Safari ne garantit pas, et le conteneur prend la hauteur du plus grand jour.

### D3 — Le jour se pose avant l'animation

À l'issue `suivant`, le jour présenté change aussitôt : la date de l'application, la commande de retour, la fiche ouvrable. Le panneau qui part et celui qui arrive finissent ensuite leur course, de leur position sous le doigt jusqu'à leur place, en `--glisse` sur `--courbe-glisse`. C'est ce qu'exige « Le contenu n'attend pas l'animation ».

La date de l'en-tête change en fondu sous la même durée, au même instant : « Une seule horloge » reste vraie, puisque le mouvement commun commence quand le jour se pose. Pendant le geste lui-même, rien n'a encore changé.

### D4 — Flèches et clavier : le même mouvement, complet

Une flèche ou une touche pose le jour (D3), puis joue le glissement depuis le bord, sans geste. Il n'existe qu'un mouvement de jour à jour, quelle que soit sa cause.

### D5 — Le nouveau jour arrive en haut

Si la page a défilé au-delà du rang de navigation, elle y revient sans animation quand le jour se pose : on change de repas, on le lit depuis le début.

### D6 — Mouvement réduit

Le suivi du doigt reste : c'est la main qui bouge, pas une animation. Après le relâchement, le jour se pose sans glissement, comme les flèches. C'est ce que demande l'exigence existante : « les transitions entre jours sont supprimées, la navigation restant fonctionnelle ».

### D7 — Un composant pour deux écrans, et un réglage au doigt

Un composant `Carrousel` porte la surface, le suivi et les panneaux. Chaque écran lui fournit le contenu courant et la façon de rendre un voisin : un jour pour l'écran du jour, une semaine pour la semaine.

Les seuils et la courbe ne se jugent pas en test, mais au doigt. Le changement prévoit un passage de réglage après le premier essai sur un vrai téléphone, et les valeurs retenues sont écrites ici.

**Premier essai au doigt (19 octobre 2026).** Le comportement est jugé bon : seuils (10 px, 30 %, 0,4 px/ms), durée (`--glisse`, 260 ms) et courbe (`--courbe-glisse`) restent tels quels. Un seul défaut : en mouvement, les deux jours se touchent. Un écart de 16 px les sépare désormais (deux fois `--espace-2`), logé dans les panneaux : la surface déborde d'un demi-écart dans la gouttière de la page, et chaque panneau le lui rend en marge intérieure. Au repos, rien ne bouge ; la course d'un panneau reste la largeur de la surface, et le script ignore l'écart.

## Risks / Trade-offs

- [Coût du premier mouvement] Les voisins se rendent au moment où le geste devient horizontal. → Une liste de jour est légère ; si une saccade se voit au doigt, ils seront rendus dès le contact.
- [Budget] Quelques kilo-octets sur l'écran du jour. → Mesurés par le budget par page (60 Ko, 48,6 au départ).
- [Hauteurs inégales] Un voisin plus long que le jour courant dépasse sous lui pendant le geste. → Le carrousel découpe à la hauteur du jour courant ; le voisin prend la sienne quand il se pose.
- [Tests du geste] Un geste se rejoue par le protocole de débogage, comme aujourd'hui, mais la vitesse dépend du rythme des événements injectés. → La décision est testée en fonction pure avec des horodatages fixés ; l'e2e vérifie le suivi et les issues franches.
