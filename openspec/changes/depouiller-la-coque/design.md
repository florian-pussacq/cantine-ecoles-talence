## Context

Ce changement défait une partie de `coque-lisible`, archivé quelques jours plus tôt. Trois de ses décisions — D20 (la palette sombre déclarée une fois), D21 (le script bloquant), D22 (l'interrupteur dans Réglages) — étaient correctes pour le problème qu'elles traitaient. Le problème n'existe plus, parce qu'il n'aurait pas dû être posé.

**La numérotation continue à D25**, pour la raison établie en tête de `coque-lisible/design.md` : le code cite les décisions par leur numéro seul.

Une précision de vocabulaire, parce qu'elle a failli produire la mauvaise spec. La demande était « par défaut c'est un thème clair », et la teinte retenue est une ardoise sombre. Les deux ne se contredisent pas : ce qui est retiré est le *mécanisme* de thème, pas la surface sombre. L'application n'aura ni thème clair ni thème sombre. Elle aura une apparence, et une seule — fond ardoise, plateaux clairs, encre sombre sur les plateaux.

## Goals / Non-Goals

**Goals :**

- Qu'il n'existe plus qu'une palette, et donc plus qu'une chose à vérifier.
- Que le fond cesse de tirer au vert.
- Que les rapports de contraste soient mesurés sur ce qui est peint, et non sur ce qui est déclaré.

**Non-Goals :**

- Aucun changement de structure : le plateau reste un plateau clair posé sur un fond profond. Ce changement ne déplace aucun élément.
- Aucun changement des cinq familles de plat ni de leurs teintes pâles.
- Aucune migration des préférences déjà stockées. Voir D25.

## Decisions

### D25 — Le thème disparaît en entier, y compris le suivi du système

Trois retraits étaient possibles : l'interrupteur seul, l'interrupteur et le stockage, ou tout.

Retirer l'interrupteur en gardant `prefers-color-scheme` est le pire des trois. L'application basculerait en sombre selon un réglage extérieur, sans que rien dans l'application ne permette de la ramener — un comportement qu'on ne peut ni prévoir ni corriger depuis l'écran où on le subit. Une apparence non choisie est acceptable ; une apparence non choisie *et* non annulable ne l'est pas.

Tout est donc retiré : le module, son stockage, le script en ligne, l'attribut de racine, les sélecteurs `[data-theme]`, la requête de média et les vingt-sept jetons préfixés.

*Conséquence sur les préférences déjà stockées :* la clé `cantine.theme` reste dans le stockage local des navigateurs qui l'ont écrite. Rien ne la lit plus, donc elle est inerte. Écrire du code de nettoyage pour la supprimer coûterait du JavaScript expédié à tous, pour effacer quelques octets chez quelques-uns — un mauvais échange. Elle disparaîtra quand le navigateur videra son stockage, ou jamais, sans conséquence.

*Ce que ça annule explicitement :* D20 devient sans objet (il n'y a plus deux voies), D21 aussi (il n'y a plus rien à poser avant la peinture), D22 aussi (il n'y a plus d'interrupteur à loger). Ces trois décisions restent lisibles dans l'archive avec leur raisonnement, qui était juste sous l'hypothèse de départ.

### D26 — Une seule teinte change, et c'est le fond

`--table` passe de `#1e5a6b` à `#2b3440`. Tout le reste de la palette est conservé au bit près.

Le fond de page est la seule grande surface unie de l'application, et la seule que rien d'autre ne contraint : il ne porte que du texte clair, et il ne doit concurrencer aucune des quatre couleurs de famille. C'est ce qui élimine d'emblée un terracotta (qui mange le rouge de la viande) ou un bleu franc (qui mange le poisson). Une ardoise froide, presque neutre, laisse les familles porter seules la couleur — ce qui est leur fonction, puisqu'elles encodent l'information.

*Mesuré, pas estimé :* le rapport entre l'encre de la table et la table passe de **7,01:1 à 11,48:1**. Le gain n'était pas recherché — la teinte a été choisie à l'œil — mais il est réel et il a une conséquence, voir D27.

*Alternative écartée — le fond sable et les plateaux blancs,* qui serait la lecture littérale d'un « thème clair ». Elle ne change pas une teinte, elle change la structure : sans le contraste entre un fond profond et un plateau clair, la métaphore du plateau posé sur la table s'effondre et il faut la reconstruire à l'ombre portée, dans une application qui n'utilise aujourd'hui aucune ombre. C'est un autre changement, il reste ouvert, et il se jugera sur écran plutôt que sur description.

### D27 — Le test de contraste mesure ce qui est peint, pas ce qui est déclaré

`contrast.test.ts` lit les jetons hexadécimaux de `tokens.css` et croise vingt paires. C'est ce qui a fait assombrir deux couleurs à la conception (D15), donc il travaille. Mais il ne voit que des couleurs opaques, or l'application peint aussi des surfaces translucides :

| Surface | Composition | Sur pétrole | Sur ardoise | Seuil |
|---|---|---|---|---|
| Lien « Source, mentions et vie privée » | encre de table à 70 % | **4,34:1** | 6,50:1 | 4,5:1 |
| Avis « menus non rafraîchis » | encre de table à 80 % | 5,14:1 | 7,95:1 | 4,5:1 |
| Bordure des boutons de jour | encre de table à 35 % | **2,22:1** | **2,81:1** | 3:1 |

Deux défauts, présents depuis l'origine, qu'aucun test ne pouvait attraper puisqu'aucun test ne regardait là. Le premier est réparé par le seul changement de fond. Le second ne l'est pas : il faut porter la bordure de 35 % à 40 %, ce qui donne 3,20:1.

Le test est donc étendu aux paires translucides, exprimées comme le CSS les exprime — un jeton, un fond, un pourcentage — et le mélange est calculé dans le test. Sans cette extension, la correction de la bordure serait un ajustement à l'œil que le prochain ajustement à l'œil défera.

*Ce que la mise en œuvre a ajouté au tableau ci-dessus.* La recherche des surfaces translucides en a trouvé deux de plus que la lecture initiale : le pied de page du jour à 72 %, et le libellé d'un onglet non courant, qui se pose non pas sur la table mais sur le fond translucide de la pilule d'onglets — un voile sur un voile, dont la couleur peinte demande deux compositions successives. Elle a surtout manqué, à la première passe, la bordure identique de l'écran de la semaine. D'où un troisième contrôle : le test relit les styles scopés et refuse tout `color-mix` sur l'encre de la table qui ne serait ni mesuré ni explicitement tenu pour décoratif. Recopier un taux dans une liste ne protège de rien si l'on peut ajouter une surface sans y penser ; la liste des décoratifs porte, pour chacun, la raison pour laquelle la norme ne s'y applique pas.

*Alternative écartée — mesurer par capture d'écran dans un test de bout en bout.* C'est ce que fait un contrôle d'accessibilité automatisé, et ça attrape plus de choses. Mais ça les attrape après le rendu, dans un test lent, et sans dire quel jeton corriger. La mesure sur la source dit exactement quelle ligne changer, et c'est elle qu'on lit quand on change une teinte.

## Risks / Trade-offs

**On retire quelque chose qui vient d'être construit et publié.** Un utilisateur ayant choisi le thème sombre sur son téléphone verra l'application revenir à son apparence unique sans explication. Le parc d'utilisateurs est connu et se compte sur une main ; le coût est nul en pratique. Le noter quand même, parce que le raisonnement ne serait pas le même sur une application publique.

**Le fond change pour tout le monde en une poussée.** C'est un jugement esthétique, il n'est vérifiable que sur un vrai écran, et il est réversible en une ligne. C'est précisément le genre de changement qui doit partir seul, pour être jugé seul.

**La suppression de vingt-sept jetons peut laisser un renvoi orphelin** — un `var(--dark-quelque-chose)` qui subsisterait quelque part rendrait la couleur invalide, donc héritée, donc silencieusement fausse. Le contrôle est mécanique : plus aucune occurrence de `--dark-` ni de `data-theme` dans `src/`, vérifié par recherche avant la validation.

**Le test de contraste est réécrit une seconde fois en peu de temps.** Il l'a déjà été en D20. Un test qu'on réécrit souvent est un test qui vérifie mal la bonne chose — mais ici la réécriture le simplifie (une palette au lieu de deux) et l'étend (les surfaces peintes). Si une troisième réécriture s'annonçait, ce serait le signal qu'il faut mesurer autrement.

## Open Questions

- Le fond sable à plateaux blancs reste une option non instruite. Elle ne se tranchera pas par argument mais par comparaison sur écran, et elle suppose un travail d'ombres qui n'existe pas dans le code aujourd'hui.
- L'ardoise `#2b3440` a été choisie à l'œil parmi les neutres froids. Sa luminance donne une marge confortable ; sa teinte exacte reste à confirmer sur un écran de téléphone en plein jour, ce qu'aucun test ne dira.
