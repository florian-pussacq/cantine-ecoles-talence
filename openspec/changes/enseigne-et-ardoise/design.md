## Context

Ce changement traite la hauteur. Il est le successeur direct de `hierarchie-du-jour` et de `navigation-basse`, qui avaient tous deux prélevé sur le même budget vertical sans pouvoir voir ce que l'autre prenait — la question ouverte laissée par `navigation-basse` disait exactement cela : « se juge une fois les deux changements en ligne, sur un téléphone, en regardant si le plat principal tient sans défiler ». La mesure est faite. Il ne tient pas : 1 016 pixels de page pour 839 de fenêtre.

Le verdict rendu ici est celui que cette question appelait : ce n'est pas la barre qui doit rendre de la place, c'est le plateau.

**La numérotation continue à D35.**

Les deux demandes qui ouvrent ce change — une enseigne, un plateau plus compact — semblaient indépendantes. Elles ne le sont pas : l'enseigne coûte une ligne, et c'est le plateau qui la paie. Les traiter séparément aurait fait juger l'une sans son financement.

## Goals / Non-Goals

**Goals :**

- Que la date, le déjeuner entier, le goûter et les commandes de jour tiennent dans la fenêtre d'un téléphone, sans défilement.
- Que l'application dise son nom, sans que ce nom coûte de la surface au contenu.
- Que la date ne puisse pas être coupée par ce qui la situe.
- Que le dessin d'un plat ne soit affiché que là où il distingue quelque chose.
- Que les deux écrans de consultation cessent d'être en désaccord sur ce qui compte.

**Non-Goals :**

- Aucun changement de la table de mots-clés, de la règle de spécificité ni du repli d'illustration.
- Aucun changement de l'écran de la semaine, dont la forme est déjà celle qu'on adopte.
- Aucune seconde mise en page pour l'écran large : un jeton, un palier (D23).
- Aucun changement du réglage des allergènes ni de son stockage.

## Decisions

### D35 — L'enseigne vit dans la coque, et elle est petite

Le nom du lieu est **constant par construction**. C'est exactement la situation que D28 a tranchée pour le compartiment du pain : ce qui ne varie jamais ne mérite pas la surface de ce qui varie tous les jours. L'enseigne est donc rendue en petit corps, à opacité réduite, sur la ligne la plus haute de l'écran — une plaque à la porte, pas un titre.

Elle vit dans `+layout.svelte` et non dans `EnTete`, pour trois raisons qui vont dans le même sens :

- elle est **commune aux quatre écrans**, et la recopier quatre fois est le défaut que `EnTete` avait précisément été créé pour supprimer ;
- elle **ne doit pas glisser avec le jour**. `EnTete` vit à l'intérieur du `{#key date}` depuis D30, sous l'horloge du contenu qu'il annonce. Une enseigne qui rentre par la droite à chaque changement de jour affirmerait que l'identité du lieu change avec la date ;
- le titre de premier niveau reste **unique et reste la date**. L'enseigne n'est pas un titre : c'est une mention. Elle ne prend pas le `h1`, qui est le repère principal d'un lecteur d'écran et qui doit rester ce que l'écran montre.

### D36 — La commande de réglages quitte l'en-tête pour l'enseigne

`navigation-basse` (D32) a placé la roue crantée dans `EnTete`, faute d'autre élément commun aux quatre écrans. L'enseigne est désormais cet élément, et elle est plus juste : un réglage d'application appartient à la ligne qui porte l'application, pas à celle qui porte une date.

Le gain n'est pas seulement conceptuel. La roue prend aujourd'hui 68 pixels sur les 388 disponibles, et le titre travaille sur 320. **Les rendre au titre est une part du remède au débordement de la date**, et cette part-là ne coûte rien.

L'exigence de `navigation-basse` — « le réglage des allergènes est atteignable par une commande d'en-tête » — reste satisfaite : l'enseigne est en tête d'écran. Ce qui change est le composant qui la porte, pas l'accessibilité de la destination. La règle « pas de roue sur sa propre destination » est reprise telle quelle.

### D37 — La date est insécable ; c'est la mention qui cède

Le défaut n'est pas un manque de place, c'est une contrainte posée du mauvais côté.

```
        aujourd'hui                        voulu

  ┌────────────────────────┐       ┌────────────────────────┐
  │ PROCHAIN SERVICE · DANS│       │ Lundi 31 août          │
  │ 10 JOURS · Lundi 31 août│      │ ⟨PROCHAIN SERVICE ·    │
  └────────────────────────┘       │   DANS 10 JOURS⟩       │
                                   └────────────────────────┘
   text-wrap: balance casse          la date porte nowrap,
   la date pour loger la mention     la mention passe à la ligne
```

La date a une longueur bornée et connue : vingt et un caractères au pire (« Mercredi 30 septembre »), soit environ 240 pixels sur les 388 rendus par D36. Elle tient toujours. La mention, elle, va de dix à trente et un caractères. **On rend insécable ce qui est borné, et l'on fait céder ce qui ne l'est pas.**

La mention est placée après la date plutôt qu'en surtitre au-dessus : sur la grande majorité des jours — « Aujourd'hui », « Demain » — l'ensemble tient sur une ligne, et la seconde ligne n'apparaît que pour les cas longs, qui sont aussi les plus rares.

*Objection consignée.* L'exigence d'en-tête dit « une seule ligne de contenu ». La formulation est conservée mais son sens est précisé : une seule ligne **de titre**, la mention pouvant se replier. La refuser reviendrait à choisir entre couper la date et abréger la mention en « +10 J », ce qui est cryptique pour la seule information de sécurité de l'écran.

**Correction apportée à l'implémentation : la mention ne quitte pas le titre.** La première écriture sortait la mention du `h1` pour en faire un paragraphe voisin — c'était la façon évidente de la faire se replier, et elle était fausse. La mention est la seule information de sécurité de l'écran : elle dit qu'on ne lit pas le menu d'aujourd'hui. Hors du titre, elle disparaît du nom accessible, et quiconque navigue de titre en titre n'entend plus qu'une date sans savoir qu'elle n'est pas la bonne. Les tests d'`EnTete` l'ont refusée immédiatement, ce qui est exactement leur travail.

Le `h1` est donc une boîte qui se replie — deux éléments alignés sur la même ligne de base — et le repli porte sur la **disposition**, jamais sur le contenu du titre. Le séparateur en point médian disparaît avec la phrase qu'il ponctuait : deux corps de texte aussi différents se distinguent sans qu'on ajoute un signe à masquer aux technologies d'assistance.

### D38 — La cible est la journée, pas le plat

C'est la décision structurante, et elle précède la mise en page — c'est elle qui l'autorise.

Chaque plat est aujourd'hui une cible tactile, ce qui lui impose 44 pixels de hauteur. Six plats font 264 pixels de plancher **avant toute décoration**, et c'est ce plancher, non le style, qui rend le plateau incompressible.

Cette cible est mal choisie. La question qu'un parent pose à cet écran est « la journée contient-elle un allergène que je surveille », pas « quelle case le contient » — et la réponse utile est la liste complète, pas une case à la fois. Le geste actuel demande d'ouvrir six fiches pour obtenir ce que l'on voulait savoir d'un coup.

Le menu du jour devient donc **une seule cible**, ouvrant **une seule couche** qui liste tous les plats du jour avec leurs allergènes, goûter compris. Ce qui est perdu — désigner un plat précis — n'était pas demandé. Ce qui est gagné est double : la réponse est meilleure, et le plancher disparaît.

Le signalement par plat reste sur l'ardoise : savoir *quelle ligne* est concernée relève de la lecture, pas du geste, et `allergen-filter` continue de l'exiger.

*Le balayage n'est pas menacé.* `createBalayage` supprime déjà le `click` qui suit un geste abouti, et remet le drapeau à zéro à chaque `pointerdown`. Une grande surface cliquable ne rouvre donc pas la question réglée en D18.

### D39 — Le plateau devient une ardoise, dans l'ordre du service

```
        aujourd'hui                          voulu

  ┌──────────┬──────────┐        ┌──────────────────────────────┐
  │ PAIN     │ ENTRÉE   │        │ Entrée      Salade grecque   │
  │          │          │        │ ┌──────────────────────────┐ │
  │ Bio      │ Salade   │        │ │ ⬤  Daube de bœuf         │ │
  ├──────────┴──────────┤        │ │    aux pruneaux          │ │
  │ ⬤  PLAT             │        │ │    ⟨VIANDE FRANÇAISE⟩    │ │
  │    Daube de bœuf    │        │ └──────────────────────────┘ │
  ├──────────┬──────────┤        │ Accompagnement  Ratatouille  │
  │ GARNITURE│ LAITAGE  │        │ Laitage         Fromage      │
  │          │          │        │ Dessert         Compote      │
  │ Ratat.   │ Fromage  │        │ Pain            Bio          │
  ├──────────┴──────────┤        └──────────────────────────────┘
  │ DESSERT             │
  │ Compote             │                    ≈ 240 px
  └─────────────────────┘
          470 px
```

Une ligne par rôle. Les rôles alignés en colonne à gauche, en petit corps discret ; les libellés à droite, alignés entre eux. C'est une ardoise de cantine — ce que l'objet est dans le monde, et ce que l'écran de la semaine fait déjà.

**La colonne des rôles est une grille, non une largeur.** La première écriture fixait sa largeur en `ch`, et « ACCOMPAGNEMENT » débordait sur le nom du plat — le risque annoncé plus bas, survenu à la première capture. Aucune valeur choisie à la main ne l'aurait durablement évité : elle dépend du corps, du crénage, des capitales et du mot le plus long, dont trois sur quatre échappent à celui qui écrit le nombre. Une grille à deux colonnes dont la première vaut `auto` se dimensionne d'elle-même sur le plus long libellé, et l'alignement qui fait la lisibilité de l'objet devient une propriété de la structure plutôt qu'une coïncidence à surveiller. C'est la même leçon que D37, un cran plus bas : on ne devine pas une largeur, on la fait calculer.

**L'ordre du service est conservé** : entrée, plat, accompagnement, laitage, dessert. Un parent lit ce menu à voix haute à un enfant, et le repas se déroule dans cet ordre. La hiérarchie visuelle passe par la forme, pas par le rang : le plat reste la seule chose colorée, la seule illustrée, la seule en gros corps. **Il n'a pas besoin d'être premier pour être vu ; il a besoin d'être le seul de son espèce.**

**Le pain descend en pied d'ardoise.** Ce n'est pas une entorse à l'ordre du service : le pain n'est pas un service. Il est sur la table du début à la fin, et trente-trois jours sur trente-cinq il s'appelle « Pain ». Il reste une ligne, plus discrète que les autres.

**Un rôle absent reste une ligne.** D12 ne disait rien de la géométrie, seulement qu'un creux doit rester distinguable d'une donnée manquante. Une ligne « Accompagnement — pas d'accompagnement ce jour » le dit aussi bien qu'une case en pointillés, et pour beaucoup moins cher.

### D40 — Le dessin ne reste que là où il distingue

Mesuré sur les trente-cinq jours publiés : le dessin du pain est identique 35 fois sur 35, celui du laitage 23 fois sur 25, et **dix-sept jours sur trente-cinq affichent deux fois le même dessin dans le même plateau**. Une illustration qui ne change ni d'un jour à l'autre ni d'une case à sa voisine n'est pas une information : c'est un motif, et il coûte 34 pixels de haut et une ligne de mise en page par case.

Le dessin est donc réservé au **plat principal** — 8 valeurs, la plus fréquente à 29 % — et au **goûter**, objet distinct dont les libellés sont les deuxièmes plus variés de l'écran.

Il change aussi de fonction, et c'est le vrai gain : de décoration de case, il devient **marqueur de rang**. « Il y a un dessin ici » finit par vouloir dire « c'est le plat du jour ». Ce sens n'existait pas tant que tout le monde en portait un.

`dish-illustration` n'est pas amputée : la table, la spécificité, le repli, le rôle décoratif restent inchangés. C'est la **portée à l'écran** qui est bornée, et elle l'est par une exigence explicite plutôt que par l'usage — faute de quoi le prochain composant reposera un dessin partout, par analogie.

*Contrepartie assumée.* Un lecteur qui repérait « la case avec le fromage » perd ce raccourci. L'audience de cette application est constituée de parents, non d'enfants pré-lecteurs : le mot est lu. Si l'audience changeait, la décision se rouvrirait — un glyphe monochrome de 14 pixels en tête du mot de rôle coûterait presque rien en hauteur, et c'est le chemin de repli.

### D41 — Le goûter garde son rang et change de vocabulaire

D29 avait fait du goûter « un objet distinct, du même vocabulaire visuel que les compartiments ». Les compartiments disparaissent ; le vocabulaire aussi.

Le raisonnement de D29 survit intact, et c'est lui qui compte : le goûter n'est pas servi au même moment, il ne rejoint donc pas l'ardoise ; il porte la deuxième quantité d'information de l'écran, il ne devient donc pas une note de bas de page. Il reste **un second objet, plus petit, posé plus loin**, séparé par la distance et non par un filet. Ce qu'il emprunte désormais est le vocabulaire de la vedette — un disque, une illustration, un nom — puisque c'est le seul qui reste.

En pratique, il perd son cadre intérieur. Il portait deux surfaces emboîtées, une claire et un compartiment posé dessus, parce qu'il citait la construction des compartiments. Ceux-ci n'existant plus, le cadre intérieur ne renvoyait plus à rien : il ne restait qu'une bordure de plus à traverser du regard, et dix-huit pixels de haut. **Une citation dont l'original a disparu n'est plus une citation, c'est un résidu** — et c'est le genre de chose qu'un change de forme laisse derrière lui s'il ne relit pas ce qui empruntait à ce qu'il supprime.

### D42 — « Accompagnement » remplace « Garniture »

`hierarchie-du-jour` avait affiché le rôle `accompagnement` sous le libellé « Garniture ». Le mot est retenu à l'envers : « accompagnement » est plus long, plus clair, et c'est le mot que la source elle-même emploie.

Le revirement est consigné parce qu'un libellé changé deux fois sans trace donne l'impression d'une oscillation. Il n'y a pas de règle générale à en tirer, seulement un arbitrage de clarté, et le juge est le parent qui lit.

### D43 — L'apparence unique cesse d'être vérifiée à un seul endroit

Dette révélée par ce change, pas introduite par lui.

D25 a supprimé l'apparence sombre, et `contrast.test.ts` en surveille l'absence — mais dans `tokens.css` seulement. **Deux composants portaient encore une requête média sur le thème du système**, invisibles à ce contrôle : la fiche de plat, et l'écran des mentions. La seconde repeignait ses liens en clair sur un panneau clair lorsque le système de l'utilisateur était en sombre, c'est-à-dire les rendait illisibles pour exactement les utilisateurs qu'elle croyait servir.

La première est partie avec la fiche qu'elle habitait. La seconde a été trouvée en cherchant si la première avait des sœurs — et c'est le fait de chercher, non le fait de refondre, qui l'a trouvée.

Le contrôle lit désormais **tous** les composants. Une exigence vérifiée à un seul endroit n'est pas vérifiée : elle est vérifiée là, et nulle part ailleurs.

*Effet de bord amusant, et instructif.* Le test a d'abord échoué sur le commentaire écrit pour expliquer la suppression, qui citait le terme interdit. Le commentaire a été reformulé plutôt que le test assoupli : un contrôle qui doit distinguer le code de sa propre documentation est un contrôle qu'on finit par contourner sans le vouloir.

## Risks / Trade-offs

**On remplace une exigence, on ne l'amende pas.** « Grille compartimentée » prescrivait une géométrie — des compartiments, une taille qui encode le rôle, une grille qui ne se referme pas. L'ardoise garde les intentions et abandonne la forme. Le risque est de perdre au passage une intention qui n'était portée que par la forme : la relecture ligne à ligne des scénarios existants est une tâche à part entière, pas une conséquence.

**La couche modale change de sujet, et les tests qui la couvrent parlent d'un plat.** Piège d'accessibilité en particulier : le focus doit revenir sur l'élément qui a ouvert la couche, et il y en a désormais deux — le menu et le goûter. Un retour de focus câblé sur « le plateau » serait faux pour l'un des deux chemins.

**Une grande surface cliquable est une grande surface cliquable.** Le balayage est protégé, mais le doigt qui se pose pour faire défiler la page se pose désormais sur une cible. À juger au doigt, pas au test.

**La hauteur visée est un calcul, pas une mesure.** L'estimation de 240 pixels pour l'ardoise vient d'une addition de lignes, sur une police système dont les métriques varient d'une plateforme à l'autre. Le seul verdict qui compte est le test de bout en bout écrit pour cela, et il doit être écrit **avant** la mise en page, faute de quoi on mesurera ce qu'on a obtenu au lieu de viser ce qu'on voulait.

**Le libellé le plus long dicte la colonne des rôles.** « Accompagnement » fait quatorze caractères et fixe à lui seul la largeur réservée aux rôles, donc ce qui reste aux libellés. C'est la contrepartie directe de D42. *Survenu, et traité* : la largeur devinée en `ch` laissait le mot chevaucher le nom du plat dès la première capture, et la grille l'a réglé en dimensionnant la colonne au lieu de la déclarer. Le risque n'est plus une largeur à surveiller mais un mot très long qui rétrécirait la seconde colonne — ce que seul un nouveau rôle produirait.

**La mesure d'exigence n'était pas celle du proposal.** La page débordait de 191 pixels, mais le pied de page en représentait l'essentiel et l'exigence l'y autorise. Ce que le test constatait réellement était plus modeste : les commandes de jour finissaient à 809 pixels pour une ligne de flottaison à 783, soit 26 pixels sous la barre. Le chiffre spectaculaire et le chiffre vrai ne sont pas le même, et c'est le second qui est écrit dans le test. *Le gain, lui, est bien celui qui était visé* : l'ardoise passe de 470 à 263 pixels, et les commandes de jour finissent à 624 pour une flottaison inchangée — 159 pixels de marge là où il en manquait 26.

## Open Questions

- **Le pied de page mérite-t-il ses 117 pixels ?** Il porte deux liens et une date de mise à jour, redondants avec l'écran À propos. Hors périmètre ici parce qu'il peut rester sous la ligne de flottaison sans dommage — mais c'est le prochain gisement, et il est plus gros que ce qu'on vient de gagner sur l'en-tête.
- **L'ardoise devrait-elle remonter dans l'écran de la semaine ?** La semaine résume aujourd'hui les rôles secondaires par une suite de libellés séparés par des points médians. La même colonne alignée y serait plus lisible, au prix de la hauteur d'une ligne par jour.
- **Que devient la vedette un jour sans plat principal ?** Le cas n'est pas dans les données publiées et la grille le traitait par un compartiment en pointillés. L'ardoise doit décider si la vedette disparaît ou reste vide, et rien ne permet aujourd'hui de trancher autrement que par principe.
- **Le glyphe de rang, si l'audience change.** D40 est prise pour des parents lecteurs. Le repli est identifié — un glyphe monochrome en tête du mot de rôle — mais il n'est ni dessiné ni chiffré.
- **La hauteur sur un écran de bureau n'est vérifiée par personne.** Le test de hauteur ne tourne que sur le profil mobile, conformément à l'exigence. Or la fenêtre de bureau est plus basse (720 px contre 839) même si sa colonne est plus large, et la typographie y monte d'un cran. Le cas est différent, pas plus permissif, et il n'est pas mesuré.
- **L'avis « menus non rafraîchis » est présent dans toutes les mesures.** Il dépend de la date de génération des données face à l'horloge réelle, donc de quand on lance les tests. Il occupe une soixantaine de pixels que le budget absorbe aujourd'hui, mais aucune mesure du dépôt ne distingue l'écran nominal de l'écran en avertissement.
