## Context

L'application est une PWA SvelteKit entièrement prérendue, servie en statique, sans backend. Cinq écrans, huit composants réutilisables, un seul fichier CSS global — `src/lib/design/tokens.css` — et des styles scopés colocalisés. Les décisions structurantes vivent dans `openspec/changes/menus-jour-semaine/design.md` sous les numéros D1 à D15, auxquels le code renvoie par référence textuelle (« design.md, D12 »).

**La numérotation continue à D16.** Le code cite les décisions par leur numéro seul, sans nommer le change ; repartir de D1 ici rendrait toute référence ambiguë. Le coût est un couplage entre changes ; le bénéfice est qu'un commentaire de code reste résoluble sans savoir de quel change il parle.

Trois contraintes du socle encadrent tout ce qui suit :

- **Le site est prérendu.** Le HTML arrive peint. Toute décision qui dépend d'un état lu au démarrage — le thème choisi — doit être prise avant la première peinture, sinon elle produit un clignotement.
- **Les budgets sont vérifiés à chaque construction** : 60 Ko de JavaScript, 150 Ko au premier chargement, en gzip. On est à 84 % et 43 %. Le premier laisse peu de marge.
- **L'accessibilité est une contrainte de conception, pas une relecture** (D8). Quarante mesures de contraste sont exécutées à chaque validation, et les tests de bout en bout vérifient les cibles tactiles, le focus et l'unicité du titre de premier niveau.

## Goals / Non-Goals

**Goals :**

- Que la couche modale se comporte comme une couche modale, au clavier et au lecteur d'écran, sans que ce comportement soit à écrire.
- Que le balayage fonctionne au doigt sur un appareil réel, et que le test qui l'affirme puisse échouer quand il ne fonctionne pas.
- Que la préférence de thème soit exprimable et respectée, sans dupliquer la palette.
- Qu'un écran de bureau soit servi par la même structure, à une autre échelle.

**Non-Goals :**

- Aucune seconde mise en page. Pas de vue à deux colonnes, pas de barre latérale.
- Aucune bibliothèque nouvelle. Ni gestionnaire de gestes, ni bibliothèque de composants, ni animation par JavaScript.
- Aucune modification du schéma de données ni du contenu de `static/data/`.
- Aucun changement de la palette elle-même : les teintes sont arrêtées (D15), seule leur organisation change.

## Decisions

### D16 — La couche modale est un `<dialog>` natif

`CourseSheet.svelte` est aujourd'hui un `<div role="dialog" aria-modal="true">` posé en `position: fixed`, doublé d'un voile. L'annotation ARIA promet un comportement que le navigateur n'a aucune raison de fournir : rien ne piège le focus, rien ne le restitue, le fond continue de défiler, et il n'y a pas de couche supérieure — la feuille est dans le flux de peinture, à la merci du prochain `z-index`.

`<dialog>` ouvert par `showModal()` fournit tout cela : couche supérieure, `::backdrop`, échappement natif, piège de focus, restitution du focus sur l'élément appelant. Le code applicatif rétrécit au lieu de grossir.

*Alternative écartée — écrire le comportement manquant.* Piéger le focus correctement demande d'énumérer les éléments focalisables, de gérer `Tab` et `Maj+Tab` aux bornes, et de survivre à un contenu qui change. C'est une bibliothèque, et elle existe déjà : c'est le navigateur.

*Alternative écartée — un détail dépliable dans le flux.* Zéro couche superposée, zéro gestion de focus. Mais ouvrir une section pousse le plateau vers le bas : on perd le repère spatial de la cellule qu'on vient de toucher, sur l'écran qu'on consulte tous les matins.

*Conséquences à gérer :* un clic sur `::backdrop` a pour cible le `<dialog>` lui-même, il faut donc un élément enfant pour distinguer « dehors » de « dedans » ; le défilement de fond reste à bloquer explicitement ; et **jsdom n'implémente ni `show`, ni `showModal`, ni `close`, ni `requestClose`** — vérifié sur la version 30 — ce qui impose une simulation dans la configuration de test.

*Deux constats faits à l'implémentation, qui ne se devinaient pas :*

**Le piège de focus repasse par `document.body`.** Au point de bouclage, Chromium redonne le focus au point de départ de la navigation séquentielle avant de revenir au premier élément de la couche. Le cycle observé est « lien → corps du document → commande de fermeture → lien ». Ce n'est pas une fuite : aucun élément interactif situé derrière n'est atteint. Un test qui exigerait que le focus soit *toujours* à l'intérieur du dialogue échouerait sur un comportement correct — c'est l'atteinte d'une commande située derrière qu'il faut interdire, pas le passage par le corps du document.

**`overflow: hidden` ne bloque pas le défilement programmatique.** Il empêche l'utilisateur de défiler ; `window.scrollTo` continue de fonctionner. Seul `overflow: clip` interdirait les deux. Le verrou est donc correct pour ce qu'on lui demande — un doigt, une molette — et un test qui le mesurerait par l'API mesurerait ce qu'il n'a jamais promis. `clip` a été écarté : il fige aussi la position de défilement, alors que rouvrir sur un écran qui a bougé pendant qu'on lisait est précisément ce qu'on cherche à éviter.

*La poignée disparaît.* Elle imite l'affordance d'une feuille déplaçable sans qu'aucun gestionnaire n'y soit attaché. Une promesse non tenue coûte plus cher qu'une absence de promesse.

### D17 — Le geste est une fonction pure, pas une action Svelte

La logique de balayage devient `createBalayage({ onPrevious, onNext })`, qui rend un jeu de gestionnaires. Elle ne touche ni au DOM, ni à l'horloge, ni au store : elle reçoit des événements et appelle des rappels. Même discipline que `resolveDisplayDay` (D7), et pour la même raison — les seuils et la contrainte d'horizontalité sont exactement le genre de règle qu'on veut éprouver sans navigateur.

*Alternative écartée — une action `use:`.* Elle coupléerait la logique au cycle de vie d'un élément et rendrait le test dépendant du montage d'un composant, pour aucun gain.

### D18 — La cause de la panne est établie par reproduction avant toute correction

Le geste ne se déclenche pas au doigt sur un téléphone réel. Trois causes plausibles, qui ne s'excluent pas :

1. **`touch-action` absent sur la surface de geste.** La page défile verticalement ; dès que le navigateur décide que le geste lui appartient, il émet `pointercancel`, et le gestionnaire d'annulation efface le point de départ. Le geste meurt en silence.
2. **Absence de capture du pointeur.** Si le doigt sort du rectangle de la surface, aucun `pointerup` n'atteint le gestionnaire.
3. **Le `click` de fin de geste.** Le balayage démarre sur une cellule, qui est un bouton. Même réussi, il est suivi d'un `click` qui ouvre le détail du plat. Vu de l'utilisateur, « le balayage ne marche pas » et « le détail s'ouvre tout le temps » peuvent être le même défaut.

Corriger les trois d'un bloc produirait un correctif qui marche sans qu'on sache pourquoi, donc un correctif qu'on ne saura pas défendre à la prochaine régression. La cause se constate d'abord.

### D19 — Le test de balayage est remplacé, pas complété

Le test actuel fabrique des événements DOM. Il court-circuite l'arbitrage de geste du navigateur, c'est-à-dire précisément la couche où la panne se produit. Il est vert pendant que la fonctionnalité est cassée.

Le remplacement injecte une séquence tactile réelle par le protocole de débogage du navigateur. Le conserver à côté reviendrait à garder un témoin dont on sait qu'il ment : un test qui ne peut pas échouer coûte du temps d'exécution et achète une fausse tranquillité.

### D20 — La palette sombre est déclarée une fois, les deux voies n'en sont que des renvois

Un thème choisissable impose d'appliquer les couleurs sombres selon deux conditions distinctes : une requête de média, et un attribut posé sur la racine. Rien en CSS ne permet de partager un bloc de déclarations entre ces deux conditions.

Plutôt que de copier vingt-cinq couleurs, les valeurs sombres sont déclarées une fois sous un préfixe, et les deux blocs conditionnels ne contiennent que des renvois mécaniques d'un jeton vers l'autre. Une valeur ne peut alors pas diverger entre le mode automatique et le mode forcé — au pire un renvoi manque, ce qui se voit immédiatement.

*Alternative écartée — dupliquer le bloc et vérifier par test qu'ils sont identiques.* Le test rattraperait la divergence, mais après coup, et il faudrait comparer deux blocs de texte plutôt que constater qu'il n'y en a qu'un.

*Conséquence :* `contrast.test.ts` classe aujourd'hui les jetons par leur **position** dans le fichier, relativement à la ligne de la requête de média. Cette restructuration invalide le procédé. Le remplacement — clair = jetons sans préfixe, sombre = clair surchargé par les jetons préfixés — ne dépend plus de l'ordre des règles, ce qui le rend accessoirement plus robuste qu'avant.

### D21 — Le thème est posé par un script en ligne bloquant

Le site est prérendu : le HTML arrive avec le thème du système. Attendre l'hydratation pour appliquer un thème contraire produit un flash. Un script en ligne, placé avant le reste de l'en-tête, lit le choix stocké et pose l'attribut avant la première peinture.

C'est un script bloquant assumé — quelques lignes, aucune dépendance, exécuté avant tout rendu. La politique de sécurité de contenu actuelle l'autorise déjà.

*Dette à connaître :* cette autorisation repose sur `'unsafe-inline'` dans `script-src`, ce qui affaiblit la politique. Le remplacer par des empreintes est un travail distinct, et ce script en augmente l'intérêt sans en dépendre.

### D22 — L'interrupteur de thème vit dans Réglages

La barre d'onglets porte trois destinations consultées quotidiennement. Le thème se choisit une fois. Lui donner une place permanente en tête d'écran coûterait de la surface à ce qu'on ouvre chaque matin — même raisonnement que pour « À propos », délibérément placé en pied de page et non en quatrième onglet.

### D23 — L'écran large, c'est un jeton et un palier

La largeur de la coque devient un jeton. Au-delà d'un seuil, ce jeton grandit, et la typographie comme les illustrations montent d'un cran. Aucune règle de mise en page n'est dupliquée, aucun composant ne connaît deux dispositions.

*Alternative écartée — deux colonnes au-delà d'un large seuil,* la semaine à gauche et le jour à droite. Séduisant, mais c'est une seconde mise en page à maintenir et à tester, sur laquelle le balayage perd son sens, pour un usage qui est le téléphone du matin.

### D24 — Un projet de test « bureau », parce que sinon rien ne vérifie rien

Les tests de bout en bout ne s'exécutent aujourd'hui que sur un profil de téléphone. Livrer une mise en page large sans l'ajouter reviendrait à livrer du code que personne ne vérifie. Les contrôles d'accessibilité et de cibles tactiles s'exécutent sur les deux profils ; ceux qui portent sur le geste restent réservés au profil tactile.

## Risks / Trade-offs

**Le remplacement du test de balayage pourrait masquer la panne au lieu de la révéler** → écrire le nouveau test **avant** la correction et le voir échouer. Un test de non-régression qui n'a jamais été rouge ne prouve rien.

**La restructuration de la palette touche les quarante mesures de contraste d'un coup** → les valeurs ne changent pas, seule leur organisation change. La réécriture du test doit produire exactement les mêmes couples et les mêmes seuils ; toute variation de résultat signale une erreur de restructuration, pas une amélioration.

**`@starting-style` et l'animation de couche supérieure ne sont pas également répandus** → l'animation est un agrément. Là où elle n'est pas comprise, la couche apparaît sans transition, ce qui est le comportement que `prefers-reduced-motion` impose déjà par ailleurs. Aucun repli à écrire.

**Le budget JavaScript est à 84 %** → le store de thème et la fonction de geste sont petits, mais la marge est de 9 Ko et la construction échoue au dépassement. À surveiller à chaque étape plutôt qu'à la fin.

**Bloquer le défilement du fond peut faire sauter la page** lorsque la barre de défilement disparaît sur les navigateurs de bureau qui en réservent la place → à constater sur le profil bureau ; la compensation, si elle est nécessaire, se fait par une gouttière de défilement stable plutôt que par un calcul de largeur en JavaScript.

**Le geste extrait doit rester redondant** → si une régression rendait les commandes visibles inopérantes, le geste masquerait la panne pour les utilisateurs tactiles et la laisserait entière au clavier. Les tests de navigation par commande et par clavier restent la référence.

## Open Questions

- Le seuil de bascule de la couche modale entre feuille ancrée en bas et boîte centrée : 640 pixels est proposé, à confirmer en le regardant sur une tablette en portrait.
- L'échelle typographique de l'écran large : un cran sur toutes les tailles, ou seulement sur les corps de texte ? Le titre de premier niveau est déjà volumineux.
- Faut-il conserver l'animation de transition entre jours maintenant que le geste est continu ou non — la réponse dépend de ce que D18 établit.
