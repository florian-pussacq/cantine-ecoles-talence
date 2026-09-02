## 1. Sortir le sprite du bundle, avant de l'agrandir (D57)

- [x] 1.1 Mesurer la double facturation plutôt que la supposer : chercher le sprite dans le JS et dans le HTML construits
- [x] 1.2 Extraire l'art dans un fichier propre, éditable comme un dessin et non comme un composant
- [x] 1.3 L'injecter au pré-rendu par un hook serveur — `transformIndexHtml` ne s'applique pas à la coque de SvelteKit
- [x] 1.4 Écarter le `<use>` externe et écrire pourquoi : WebKit ne le suit pas de façon fiable
- [x] 1.5 Retirer le montage du layout et supprimer le composant
- [x] 1.6 Faire lire le nouveau fichier au test des pictogrammes d'allergène
- [x] 1.7 Joindre le sprite au balayage anti-thème : devenu un `.svg`, il était sorti du filtre sans bruit
- [x] 1.8 Vérifier le gain avant d'aller plus loin : 55,0 → 52,2 Ko de JavaScript

## 2. La table de correspondance (D59)

- [x] 2.1 Recenser le corpus réel : libellés distincts, fréquences, collisions par dessin
- [x] 2.2 Éclater les quatre paquets qui collisionnent, et eux seuls
- [x] 2.3 Corriger « salade de fruits », que la règle du mot-clé le plus long envoyait chez les légumes
- [x] 2.4 Corriger les laitages sucrés, qui recevaient une part de fromage
- [x] 2.5 Laisser sans correspondance ce qui est authentiquement ambigu, et l'écrire
- [x] 2.6 Écarter `gratin`, dont la famille dépend d'un ingrédient que le mot-clé ne voit pas
- [x] 2.7 Vérifier qu'aucune correspondance existante n'a disparu au passage — « dessert » avait été perdu
- [x] 2.8 Verrouiller les deux corrections par des tests de non-régression

## 3. Les dessins (D58, D60)

- [x] 3.1 Déclarer les deux voiles et l'ombre une seule fois, en valeurs d'opacité neutres
- [x] 3.2 Écarter le dégradé par symbole (×1,8 en octets) et le filtre (coût de rendu), en mesurant
- [x] 3.3 Dessiner les trente et une illustrations sur le même patron : ombre, aplats, voile
- [x] 3.4 Laisser les glyphes de rôle et les pictogrammes d'allergène plats
- [x] 3.5 Contrôler la planche entière à la taille réelle de la vignette
- [x] 3.6 Reprendre les dessins qui ne se lisent pas à 46 pixels — six l'ont été

## 4. Vérification

- [x] 4.1 `npm run validate` et `npm run build` verts, budget tenu
- [x] 4.2 `npm run test:e2e` vert, LCP médian sous la seconde en 4G bridée
- [x] 4.3 Vérifier que le sprite est absent de tout JavaScript construit
- [x] 4.4 Vérifier l'absence d'erreur de console à l'hydratation
- [ ] 4.5 Contrôler sur un téléphone réel que le relief se lit à la taille de la vignette
