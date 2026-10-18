## Context

La palette tient dans `tokens.css` : vingt-six jetons de couleur, plus trois voiles dérivés de l'encre et de l'accent par `color-mix`. Les composants ne citent que des jetons, et `design-tokens.test.ts` le garantit. `contrast.test.ts` lit toutes les valeurs hexadécimales du fichier d'un seul tenant, et échoue sur toute trace de `prefers-color-scheme` ou de `data-theme`, dans `tokens.css` comme dans chaque composant.

## Goals / Non-Goals

**Goals:**

- Une palette sombre complète, qui tient les mêmes seuils que la claire, mesurée par les mêmes tests.
- Rien à changer dans les composants : la bascule tient dans les jetons.
- Aucun JavaScript, donc aucun flash de la mauvaise palette au premier rendu.

**Non-Goals:**

- Un réglage d'apparence dans l'application (D1).
- La page autonome `static/404.html`, qui a déjà ses deux palettes et sa propre identité.
- Retoucher les illustrations ou les pictogrammes d'allergène.

## Decisions

### D1 — Suivre le système, sans réglage : D25 rouvert, et sa réponse

D25 jugeait le suivi du système sans interrupteur « le pire des trois » choix : « une apparence non choisie *et* non annulable ». L'argument se tenait dans son contexte, où l'application avait une identité sombre qu'on lui imposait. Il ne tient plus ici, pour trois raisons.

- **L'apparence est choisie, au bon endroit.** Le parent a réglé son téléphone en sombre. Suivre ce réglage, c'est respecter un choix déjà fait, comme le font les applications natives et la plupart des sites. L'annulation existe aussi, dans le réglage du système.
- **Un réglage propre coûte ce que l'application n'a plus.** Il faudrait le stocker, et surtout poser la palette avant la première peinture par un script en ligne (D21, `coque-lisible`), sans quoi chaque ouverture flasherait. Le budget JavaScript est à 97 %.
- **Rien n'est fermé.** Si un utilisateur demande un réglage, il s'ajoutera par-dessus ce changement sans le défaire : `data-theme` sur la racine, prioritaire sur la requête de média.

Le cas qu'on ne sert pas, et qu'il faut écrire : un système qui passe en sombre automatiquement au coucher du soleil, chez un parent qui préfère le menu en clair. Il est assumé.

### D2 — Une seule requête de média, dans `tokens.css`

Le bloc `@media (prefers-color-scheme: dark) { :root { … } }` redéclare chaque jeton de couleur et pose `color-scheme: dark`, pour que les contrôles natifs (barres de défilement, `<dialog>`) suivent. Les composants restent interdits de toute requête de thème : `contrast.test.ts` continue de les parcourir. La bascule est ainsi visible en un seul endroit, et un composant ne peut pas la contourner.

### D3 — La palette de l'audit, complétée

On part des valeurs de la piste 6. Elles ne couvraient pas tous les jetons ; on complète ainsi :

- `--etiquette` prend la valeur de `--carte`, comme en clair ;
- `--sur-famille` devient sombre (`#1b1712`) : les familles s'éclaircissent, le glyphe passe en foncé ;
- `--fam-inconnu-pale` et les voiles de message suivent l'audit ;
- `--voile-fond`, `--voile-trait` et `--voile-accent` se recalculent seuls, puisqu'ils dérivent de l'encre et de l'accent ;
- `--voile-modale` reste noir à 45 % : assombrir derrière une feuille vaut sur les deux fonds.

### D4 — Deux palettes mesurées, et la seconde complète

`contrast.test.ts` lit deux palettes : les déclarations de `:root` hors média, et celles du bloc sombre. Chaque paire, chaque voile et chaque contrôle de famille s'exécute sur les deux. Une palette sombre qui oublierait un jeton de couleur hériterait en silence de la valeur claire : une encre sombre sur un fond sombre. Le test exige donc que le bloc sombre redéclare tous les jetons de couleur de la palette claire.

L'interdiction de `prefers-color-scheme` est levée pour `tokens.css` seul ; celle de `data-theme` demeure partout (D1).

### D5 — La barre du navigateur suit

`app.html` porte deux `<meta name="theme-color">`, chacune avec son attribut `media`. Le manifeste n'accepte qu'une couleur : l'écran de lancement de l'application installée reste crème. C'est un éclair d'une demi-seconde, et le manifeste ne permet pas mieux.

Découvert à la mise en œuvre : `app.html` déclarait aussi `<meta name="color-scheme" content="light">`. Il annonce au navigateur une page qui n'existe qu'en clair, et le canevas peint avant la feuille de style restait blanc chez qui est en sombre. Il passe à `light dark`. Les deux `theme-color` recopient `--fond`, faute de pouvoir lire un jeton ; `contrast.test.ts` garde la copie.

### D6 — L'ordre de la cascade est gardé

Découvert à la mise en œuvre. Le bloc sombre et la palette claire partagent le sélecteur `:root` : c'est leur ordre dans la feuille qui décide. Inséré par erreur avant `:root`, le bloc passait tous les tests de contraste, qui modélisaient la sombre comme recouvrant la claire, mais n'était jamais peint. Seules les captures l'ont montré. `contrast.test.ts` exige désormais que le bloc sombre suive `:root`.

## Risks / Trade-offs

- [Pictogrammes d'allergène] Certains ont des couleurs sombres (la goutte de lait est bleu foncé) et se posent sur une étiquette sombre. → Mesuré : sur l'étiquette sombre, chaque pictogramme garde au moins une couleur à 3:1 ou plus (au plus bas 3,04, les sulfites), quand deux sont déjà sous ce seuil sur l'étiquette claire (œufs 2,59, sésame 2,96). Le critère retient la couleur la plus contrastée de chaque dessin, ce qui est indulgent. Le sombre ne dégrade rien ; pas d'action.
- [Illustrations] L'audit les montre lisibles sur fond sombre sans retouche, sur maquette seulement → contrôle sur l'application réelle.
- [Premier rendu] Aucun : la requête de média s'applique avant la première peinture, sans script.
