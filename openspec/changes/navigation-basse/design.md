## Context

Ce changement traite la coque : où l'on va, comment on y va, et ce que l'application montre de son propre état en permanence. Il est le pendant de `hierarchie-du-jour`, qui traite le contenu du même écran.

**La numérotation continue à D31.**

C'est le change qui rattrape la roue crantée perdue — une idée discutée, jamais consignée, dont la seule trace était une mention « hors périmètre » citant une capacité inexistante. Deux décisions de forme en découlent : elle porte le nom qui avait été inventé pour elle, et les questions ouvertes sont écrites plutôt que gardées en tête.

## Goals / Non-Goals

**Goals :**

- Que les deux écrans consultés chaque matin soient atteignables sans changer la prise du téléphone.
- Que la barre ne mette plus sur le même plan une vue et un réglage.
- Que l'état du filtre d'allergènes soit lisible ailleurs que sur les plats qu'il concerne.
- Que l'accès aux écrans cesse d'être la seule partie non spécifiée de l'interface.

**Non-Goals :**

- Aucun changement du réglage lui-même, de son stockage, ni de son effet sur les menus.
- Aucun renommage de route. `/reglages` reste `/reglages`.
- Aucune seconde mise en page pour l'écran large.

## Decisions

### D31 — La barre descend, et perd son troisième segment

Deux gestes distincts, décidés ensemble parce qu'ils touchent le même élément.

```
        Aujourd'hui                          Voulu

┌──────────────────────────────┐   ┌──────────────────────────────┐
│ ( Jour │ Semaine │Allergènes)│   │  MARDI 9 SEPTEMBRE       ⚙³  │
│  MARDI 9 SEPTEMBRE           │   │  ┌────────────────────────┐  │
│  ┌────────────────────────┐  │   │  │       plateau          │  │
│  │       plateau          │  │   │  └────────────────────────┘  │
│  └────────────────────────┘  │   │  🍪 goûter                   │
│  🍪 goûter                   │   │  Source, mentions            │
│  Source, mentions            │   ├══════════════════════════════┤
└──────────────────────────────┘   │    Jour     │    Semaine     │
      ↑ hors du pouce               └──────────────────────────────┘
      ↑ une vue et un réglage
        de même taille
```

**Le troisième segment part** parce que le raisonnement qui l'aurait exclu existait déjà et n'avait pas été appliqué : la barre porte ce qu'on consulte chaque matin, pas ce qu'on règle une fois. Le thème s'est vu opposer cet argument (D22), les allergènes non — sans doute parce qu'ils étaient là avant lui.

**La barre descend** pour une raison indépendante et plus banale : le haut d'un téléphone tenu d'une main n'est pas atteignable au pouce. Deux destinations quotidiennes y étaient placées.

*Conséquence sur les écrans sans onglet.* Depuis `/reglages` ou `/a-propos`, aucun segment n'est courant. La barre reste affichée, sans marque d'écran courant, et sert de retour : on en sort en désignant où l'on va, ce qui est plus sûr qu'une flèche de retour dont la destination dépend de l'historique.

*Conséquence sur l'écran large.* `coque-lisible` exige la même structure qu'un téléphone, à une échelle supérieure, sans mise en page distincte. La barre reste donc bornée à la colonne de contenu. Une barre étirée sur 1 400 pixels serait une seconde mise en page qui ne dit pas son nom, et ne servirait personne : le pouce n'est pas le sujet sur un écran de bureau.

*Ce que ça coûte.* Une bande permanente en bas de tous les écrans, prise sur la hauteur du plateau, qui est la raison d'être de l'application. C'est le même arbitrage que celui qui a réduit l'en-tête à une ligne, et il se juge de la même façon : sur un vrai appareil, en regardant si le plat principal reste visible sans défiler. Il se cumule avec la hauteur que `hierarchie-du-jour` donne au goûter — les deux changements se jugent donc ensemble, une fois les deux en ligne.

*Mesuré, et l'inverse de ce qui était craint.* Sur le profil de test — 839 pixels de pli — le bas du plat principal passe de 436 à **374 pixels**, et la carte du goûter tient encore au-dessus de la barre. Le déménagement ne coûte pas de hauteur visible, il en rend : la barre du haut occupait la première chose que l'œil rencontre, celle du bas recouvre un contenu qui défile de toute façon. Le verdict au pouce, lui, reste à rendre sur un vrai appareil.

*La page 404 n'est pas concernée.* `static/404.html` est une page autonome servie par l'hébergeur hors de la coque SvelteKit. Elle n'a jamais porté la barre d'onglets, elle n'en reçoit pas, et elle porte son propre lien de retour vers le menu du jour.

### D32 — La roue porte l'état, et cet état ne peut pas être prérendu

Le filtre d'allergènes n'est pas une préférence inerte comme l'était le thème. Il modifie en permanence ce que montrent les deux écrans de consultation. Sortir son accès de la barre sans rien montrer rendrait cet état invisible partout où aucun plat n'est concerné — c'est-à-dire précisément les jours où l'on croit qu'il n'y a rien à signaler, sans savoir si c'est parce qu'il n'y a rien ou parce qu'on n'a rien coché.

La roue porte donc le nombre d'allergènes surveillés. Deux règles l'encadrent :

- **Rien lorsque la sélection est vide.** L'exigence existante interdit déjà « toute invitation insistante à en configurer un ». Un « 0 » serait exactement cela.
- **Le compte est dans le nom accessible de la commande, pas seulement dans une pastille.** Une pastille chiffrée est une information portée par un fragment visuel ; un lecteur d'écran doit entendre la même chose qu'un œil voit. La commande s'annonce donc par ce qu'elle ouvre *et* par ce qu'elle indique.

*Le problème sérieux : cet état ne peut pas être prérendu.* Le site est statique et prérendu par `adapter-static`. La sélection vit dans le stockage local et n'est lue qu'à l'hydratation, dans `+layout.svelte`. Le HTML livré porte donc toujours « aucune sélection », et la pastille ne peut apparaître qu'après le JavaScript.

C'est exactement la classe de problème que D21 décrivait pour le clignotement du thème, et qui avait justifié un script bloquant dans l'en-tête HTML — script que D25 vient de supprimer. **On ne le réintroduit pas.** Un script bloquant pour afficher une pastille serait payer, sur chaque ouverture et pour tous, le confort d'éviter une apparition tardive.

La réponse est géométrique, pas temporelle : **la place de la pastille est réservée dans la mise en page dès le prérendu**, qu'elle soit occupée ou non. Ce qui apparaît après l'hydratation apparaît alors *dans* un espace déjà tenu, sans rien déplacer. Le défaut résiduel — une pastille qui se pose une fraction de seconde après l'ouverture — est visible mais inoffensif, et il ne coûte rien à personne.

*Alternative écartée — un compte prérendu par défaut.* Il n'y a pas de valeur par défaut honnête : zéro serait faux pour qui a coché des allergènes, et c'est justement cette personne que l'indication concerne.

### D33 — Une icône de commande n'est pas une illustration

`Sprite.svelte` est spécifié : ses formes sont **décoratives**, non annoncées aux technologies d'assistance, et « leur absence NE SHALL PAS empêcher la compréhension du menu ». C'est juste pour un poisson dessiné à côté du mot « poisson ».

Une roue crantée qui ouvre un écran n'est pas dans ce cas : elle *est* la commande, et rien d'autre ne la nomme à l'écran. La ranger dans la même bibliothèque ferait porter à un même mécanisme deux contrats opposés, et la première personne qui appliquerait au sprite la règle du décoratif casserait le bouton.

Les icônes d'interface vivent donc dans un mécanisme distinct, dont le contrat est inverse : **une icône d'interface ne porte jamais son sens seule** — la commande qui la contient porte un nom accessible, et l'icône n'est que sa forme visible.

*Contrainte de dessin, héritée du sprite et qui s'applique quand même.* « Formes pleines et aucun trait fin, pour rester lisibles de 22 à 46 pixels. » Une roue crantée est le contre-exemple typique : dentelée, ajourée, elle se réduit mal. Elle doit être dessinée pour sa taille de destination, et jugée à cette taille, pas à 48 pixels dans un éditeur.

*Objection honnête, consignée.* Une roue promet des « réglages » au pluriel, et il n'y en a plus qu'un depuis D25. Une icône d'allergène serait plus juste et moins reconnaissable. La roue est retenue pour sa convention ; si l'écran ne reçoit jamais d'autre réglage, la question mérite d'être reposée.

### D34 — `viewport-fit=cover` reçoit enfin sa zone sûre

Constat : `<meta name="viewport" … viewport-fit=cover>` est déclaré dans `app.html` depuis l'origine, et `env(safe-area-inset-*)` n'apparaît **nulle part** dans le dépôt.

`viewport-fit=cover` demande au navigateur d'étendre la page sous les encoches et l'indicateur d'accueil. Sans compensation, tout ce qui est ancré aux bords passe dessous. Aujourd'hui rien ne l'est — la seule protection est le rembourrage bas de la coque, qui tient par chance. **Une barre fixe ancrée en bas transforme cette dette en défaut visible sur tout iPhone récent** : la barre passerait sous l'indicateur d'accueil, et sa moitié basse deviendrait intouchable.

La zone sûre entre donc dans la hauteur réservée par la coque et dans le rembourrage de la barre. La hauteur réservée n'est pas la hauteur de la barre : c'est la hauteur de la barre *plus* l'encart bas. Confondre les deux fait passer le pied de page « Source, mentions et vie privée » sous la barre sur les appareils concernés, et nulle part ailleurs — un défaut qui ne se reproduit pas sur la machine de développement.

*Ce n'est pas une régression introduite ici, c'est une dette révélée ici.* Elle est notée comme telle pour qu'on ne la cherche pas dans ce change quand elle réapparaîtra ailleurs.

## Risks / Trade-offs

**La barre prend de la hauteur, et `hierarchie-du-jour` en prend aussi.** Les deux changements grignotent le même budget vertical, chacun pour une bonne raison, et aucun des deux ne peut voir ce que l'autre a pris. Le verdict se rend une fois les deux en ligne, sur un téléphone réel, et il peut conclure que l'un des deux doit rendre de la place.

**Un élément fixe touche deux tests de bout en bout existants.** « La page ne défile jamais horizontalement » et « l'ouverture de la couche modale ne décale pas le contenu » interagissent tous deux avec un ancrage au viewport. La couche modale est un `<dialog>` en top-layer, ancré au bas de l'écran étroit : elle recouvre la barre, ce qui est voulu, mais la commande de fermeture et la barre occupent désormais la même zone du pouce. À vérifier au doigt, pas au test.

**La pastille apparaît après l'hydratation.** Décision assumée en D32 : la place est réservée, donc rien ne bouge, mais une marque se pose une fraction de seconde après l'ouverture. C'est le prix de ne pas réintroduire de script bloquant.

**On spécifie une chose qui existait déjà sans exigence.** L'accès aux écrans a vécu deux changements sans jamais être décrit, et il a dérivé. En l'écrivant maintenant, on fige aussi des choix qui n'avaient jamais été discutés — notamment le fait qu'À propos reste en pied de page. Ce choix est repris tel quel, avec son argument d'origine, plutôt que rouvert au passage.

## Open Questions

- **La roue survivra-t-elle à son écran ?** Elle promet des réglages au pluriel pour un seul réglage. Si rien d'autre ne rejoint `/reglages`, l'icône devra être reposée — et peut-être la route avec.
- **La hauteur cumulée de la barre et du goûter.** Se juge une fois les deux changements en ligne, sur un téléphone, en regardant si le plat principal tient sans défiler.
- **Le comportement de la barre au défilement.** Toujours visible, ou effacée vers le bas quand on descend ? La seconde option rend de la hauteur au contenu et coûte un mouvement de plus à comprendre. Non instruite ; la version toujours visible est le point de départ.
- **La zone sûre latérale.** D34 ne traite que le bas. Les encarts gauche et droit restent non compensés, ce qui se voit en orientation paysage sur un appareil à encoche. Aucun test ne couvre le paysage aujourd'hui.
