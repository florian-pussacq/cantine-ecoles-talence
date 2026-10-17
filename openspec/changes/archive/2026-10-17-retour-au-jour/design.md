## Context

Ce changement traite le temps : celui que l'écran affiche, et celui qu'il croit qu'il est.

Il succède à `enseigne-et-ardoise`, dont il hérite deux choses. La marge de hauteur reconquise — 159 pixels sous la ligne de flottaison — qui rend une commande supplémentaire finançable. Et D37, qui a établi pourquoi la mention vit dans le titre : c'est ce raisonnement, poussé d'un cran, qui décide ici où va la commande de retour.

**La numérotation continue à D44.**

Il est parti d'une demande simple — « un bouton Aujourd'hui » — et deux des trois défauts qu'il corrige n'étaient pas dans cette demande. Le troisième ne se voit sur aucune machine de développement.

## Goals / Non-Goals

**Goals :**

- Qu'on revienne au menu du moment d'un seul geste, depuis les deux écrans de consultation.
- Que l'en-tête cesse d'afficher une constante là où il devrait situer.
- Qu'une application reprise après plusieurs jours de veille n'affirme jamais qu'un menu ancien est celui du jour.
- Que `reset()` cesse d'être du code écrit et jamais appelé.

**Non-Goals :**

- Aucune persistance du jour choisi dans l'URL ni dans le stockage local.
- Aucun changement du comportement de la barre d'onglets.
- Aucune minuterie : le passage de minuit sans reprise de l'application n'est pas traité.
- Aucun affichage de la distance entre le jour consulté et le repère.

## Decisions

### D44 — Une place, deux états qui ne coexistent jamais

```
   l'application a choisi le jour        l'utilisateur a choisi le jour

   Mardi 1 septembre                     Vendredi 4 septembre
   ⟨AUJOURD'HUI⟩                         [ ↩ Aujourd'hui ]
    ↑ mention : elle situe                ↑ commande : elle referme
```

La mention et la commande occupent le même emplacement et ne s'affichent jamais ensemble. Le partage n'est pas un arrangement de mise en page : il suit qui a décidé du jour affiché.

| qui a choisi | risque | ce que porte l'en-tête |
|---|---|---|
| **l'application** — week-end, vacances | l'utilisateur croit lire aujourd'hui | la mention, **dans** le `h1` |
| **l'utilisateur** — balayage, flèches, semaine | il sait qu'il a navigué | la commande, **frère** du `h1` |

C'est la lecture exacte de D37. La mention est une information de sécurité *parce qu'elle couvre un choix fait à la place de l'utilisateur* : c'est pour cela qu'elle doit entrer dans le nom accessible du titre. Lorsque l'utilisateur a navigué lui-même, le titre dit « Vendredi 4 septembre » — complet et vrai — et la commande est annoncée comme une commande. **D37 explique ce partage au lieu de s'y opposer.**

La hauteur de la ligne est **réservée en permanence**, occupée par la mention ou par la commande. Sans cette réserve, l'en-tête grandirait de dix-huit pixels au premier balayage et rétrécirait au retour, faisant sauter tout l'écran deux fois. C'est le raisonnement de D32 pour la pastille d'allergènes, repris tel quel.

**Correction apportée à l'implémentation : l'emplacement est une ligne à lui, sous le titre.** Il a d'abord partagé la ligne du titre, et la mesure a tranché. « Mercredi 2 septembre » occupe 215 pixels et « ↩ Prochain service » 149, soit 372 sur les 388 disponibles ; avec la date la plus longue du calendrier — « Mercredi 30 septembre » — il reste cinq pixels. Cinq pixels ne sont pas une marge : c'est un repli garanti sur la première plateforme dont la police est un peu plus large. Et un bouton qui se replie fait passer l'en-tête de 47 à 78 pixels, ce qui est exactement le saut que la réserve existe pour empêcher.

Sur sa propre ligne, l'emplacement cesse d'être contraint : trente et un caractères de mention en petites capitales tiennent largement sur 388 pixels, et la mention n'a plus besoin de se replier non plus. Mesuré après correction : **70 pixels dans les deux états, mention longue et commande longue comprises**, égalité stricte.

Le gain n'est pas que mécanique. Deux blocs de poids comparables qui se disputent une ligne se lisent moins bien qu'un titre suivi de ce qui le situe : sur la même ligne, la commande collait la date et la concurrençait. La contrainte technique et le jugement visuel disaient la même chose, ce qui est en général bon signe.

*Coût.* L'en-tête passe de 44 à 70 pixels, sur tous les écrans. Il en restait 159 de marge sous la ligne de flottaison après `enseigne-et-ardoise` ; il en reste 115.

*Ce que la commande fait disparaître.* « Menu du jour » et « Semaine » sont des constantes : la même chaîne tous les jours, dans les deux directions, à toutes les distances. Elles n'ont jamais rien appris à personne, et elles occupaient la place de ce qui aurait pu le faire.

### D45 — Le libellé est dynamique, parce que le repère ne l'est pas

`reset()` ne ramène pas à aujourd'hui. Il ramène à `target`, c'est-à-dire à aujourd'hui **s'il est servi**, et au prochain jour servi sinon.

```
  today   = parisDate(now)          le jour civil
  target  = resolveDisplayDay(…)    ce que l'écran montre à l'ouverture
```

Week-ends et vacances scolaires réunis, le jour civil n'est pas servi environ **quarante pour cent des jours de l'année**. Un bouton fixe intitulé « Aujourd'hui » afficherait donc lundi un dimanche — précisément la confusion que `targetEyebrow` existe pour empêcher, rouverte par l'autre bout.

Le libellé suit donc la cible : « Aujourd'hui », « Demain », « Prochain service ». Lorsque rien n'est publié, il n'y a pas de commande : il n'existe aucun jour où revenir.

*Version courte, et non le texte de la mention.* « Prochain service · dans 10 jours » situe bien dans un en-tête, mais ne tient pas sur un bouton. Les deux libellés sont donc deux fonctions du même objet, voisines dans `labels.ts`, ce qui les garde cohérentes sans les confondre.

### D46 — La distance n'est pas affichée

Elle a été envisagée sérieusement, comme le remplaçant naturel de « Menu du jour ». Elle est écartée pour deux raisons.

**Le nombre admet deux lectures.** `daysAhead` compte en jours civils. De mardi 1er à lundi 7 septembre : six jours civils, quatre jours servis. Un parent qui compte les repas de son enfant n'obtient pas le même nombre que l'écran. Sur un écran dont le principe est de ne jamais mentir sur le jour, publier un chiffre ambigu est un recul, pas un gain.

**Et ce serait dire deux fois la même chose.** Une commande intitulée « ↩ Aujourd'hui » affirme, par sa seule présence, qu'on n'y est pas. Lui adjoindre « Dans 3 jours » est la faute que D28 reproche au compartiment du pain : le même fait, deux fois, dans deux tailles.

Ce qui manquait n'était pas une mesure, c'était un repère. La commande **est** le repère.

### D47 — L'horloge se remet à l'heure, et le choix expire avec le jour

Deux symptômes, une seule cause.

`const now = new Date()` est évalué au montage de l'écran, et `selection` vit en mémoire. Le commentaire de `selection` assume que « un rechargement complet ramène au jour du moment » — ce qui était vrai d'un onglet de navigateur. **Une application installée n'est pas rechargée : elle est mise en veille et reprise.** Le raisonnement précède l'installation et n'a jamais été retourné contre elle.

```
  lundi      navigation jusqu'à vendredi, fermeture
             ↓ veille
  mercredi   reprise

  now         = lundi      ← l'horloge du montage
  target      = lundi      ← calculé avec elle
  selection   = vendredi   ← posé lundi, jamais expiré
  mention     = « Menu du jour »

  → l'écran affiche le menu de dans deux jours en l'appelant celui du jour
```

Réparer la sélection seule ne répare que la moitié : avec une horloge périmée, la mention dirait encore « Aujourd'hui » devant une date passée. L'instant de référence devient donc **un état réactif, remis à l'heure au retour au premier plan**, dont dépendent la cible, la mention, l'avis de fraîcheur et l'expiration du choix.

**Le choix mémorise le jour civil où il a été fait**, et cesse de valoir dès que ce jour change. Il n'est pas effacé par une minuterie ni par un écouteur : il est simplement lu à travers le jour courant, ce qui évite un état à tenir synchronisé avec un autre.

Le jour est passé en paramètre plutôt que lu depuis l'horloge par le module lui-même. C'est la discipline de D7 — `resolveDisplayDay(dataset, now)` a été écrit ainsi pour que les règles de bascule s'éprouvent sans manipuler le temps système — et l'expiration relève exactement de la même catégorie de règle.

*Ce qui n'est pas traité.* Minuit franchi sans que l'application quitte le premier plan. Il faudrait une minuterie, pour un cas où l'utilisateur regarde l'écran au moment où il change — et il le verrait changer sous ses yeux, ce qui poserait une autre question. Le retour au premier plan couvre le cas réel.

### D48 — L'onglet « Jour » ne réinitialise pas, et c'est écrit ici pour qu'on cesse de le proposer

Le comportement actuel a l'air d'un défaut : depuis un jour éloigné, passer par Semaine puis revenir sur Jour ramène au jour éloigné.

Il n'en est pas un. Le partage de `selection` entre les deux écrans est délibéré : c'est lui qui fait qu'ouvrir un jour depuis la semaine ouvre *ce* jour. Un onglet qui réinitialiserait casserait la moitié du contrat pour réparer une gêne — et la gêne, elle, est traitée par D44.

L'idiome « retaper l'onglet courant ramène à la racine » a été envisagé. Il ne coûte rien en pixels, mais il ne se découvre pas, et il ne dit pas qu'on est ailleurs. Il devient de surcroît redondant avec une commande visible.

## Risks / Trade-offs

**L'en-tête grandit de dix-huit pixels, sur tous les écrans.** La réserve de hauteur vaut aussi pour les réglages et les mentions, qui n'auront jamais de commande de retour. C'est le prix de la stabilité : une hauteur d'en-tête qui dépendrait de l'écran ferait sauter la mise en page à chaque changement d'onglet, ce qui coûterait plus cher que les pixels épargnés.

**Le contrat d'`EnTete` s'élargit.** Il recevait deux chaînes ; il reçoit désormais aussi une commande facultative. C'est le composant le plus partagé de l'application, et chaque paramètre ajouté est un paramètre que les quatre écrans doivent comprendre. La contrepartie est qu'aucun écran ne redessine sa propre ligne d'en-tête.

**Un état réactif d'horloge est une porte ouverte.** `horloge.instant` peut être lu de partout, et rendra réactif tout ce qui le lit. Le risque n'est pas la justesse mais la prolifération : un composant qui s'y abonne sans raison se redessinera à chaque retour au premier plan. Le module est écrit pour un usage — l'instant de référence des écrans — et le dit.

**Le retour au premier plan n'est couvert par aucun test, et c'est une dette assumée.** L'expiration du choix est une fonction pure : elle se teste à l'unité en passant deux jours civils différents, et c'est fait. Mais que l'horloge soit effectivement remise à l'heure au retour au premier plan repose sur un abonnement à `visibilitychange` que rien ne vérifie — Playwright ne met pas une page en veille, et simuler l'événement testerait le gestionnaire, pas le fait qu'il soit branché. **On vérifie donc la moitié facile d'un bug dont la moitié difficile est justement celle qui a échappé à tout le monde pendant deux changes.** C'est écrit ici pour que ce soit un choix et non un oubli.

**On répare un bug que personne n'a signalé.** Il n'est pas apparu en développement, et il n'apparaîtra pas davantage après le correctif — un correctif invisible est un correctif qu'on retire par mégarde. C'est la raison pour laquelle il est écrit ici, avec son scénario, plutôt que confié au seul test.

**Un test de mise en page peut demander plus que ce qui est promis.** L'égalité stricte des hauteurs a d'abord échoué pour une raison étrangère à la commande : la mention longue se repliait sur deux lignes, si bien que la commande *réduisait* l'en-tête de trois pixels et demi. La tentation était d'assouplir le test en « ne grandit pas ». Elle a été écartée : c'est la mise en page qui devait changer, pas la mesure. Une fois l'emplacement sur sa propre ligne, l'égalité stricte tient et le test la vérifie. **Un test qu'on desserre pour le faire passer cesse de dire ce qu'il disait.**

## Open Questions

- **La mention devrait-elle revenir après un retour au premier plan sur un jour toujours valide ?** Si l'utilisateur consulte un jour, met l'application en veille dix minutes et revient le même jour, le choix survit et la commande reste. C'est cohérent, mais on peut soutenir qu'une reprise est une nouvelle consultation.
- **La commande a-t-elle sa place sur l'écran de la semaine au même endroit ?** Elle y est posée par symétrie, parce qu'`EnTete` est partagé. La semaine se navigue par pas de sept jours et se perd donc moins vite ; la symétrie est peut-être plus une commodité d'implémentation qu'un besoin constaté.
- **Minuit franchi au premier plan.** Non traité, et le comportement souhaitable n'est pas évident : voir l'écran changer de jour sous les yeux pendant qu'on le lit n'est pas manifestement mieux que de le voir périmé.
