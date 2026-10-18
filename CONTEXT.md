# Contexte

Le vocabulaire de l'application des menus de la cantine des écoles de Talence.
Un terme défini ici s'emploie tel quel dans le code, les specs, les tests et les
messages de commit ; ses synonymes écartés ne s'emploient pas.

Les décisions, elles, vivent dans les `design.md` des changements archivés sous
`openspec/changes/archive/` : ils tiennent lieu de registre des décisions.

## La source

**Document** — un PDF publié par la Ville sur la page des menus. Il en existe
trois sortes :

- **mensuel** : une grille de semaines entières, du lundi au vendredi ; il
  déborde légitimement sur les mois voisins ;
- **menu de vacances** : la Toussaint, Noël, l'hiver… Il partage son mois avec
  un mensuel et porte un **intitulé** (« Vacances de Toussaint »), repris du
  document ;
- **menu de grève** : une grille de repli, cinq jours de semaine croisés avec
  deux variantes, chaude et froide, sans aucune date.

_À éviter_ : « fichier » pour le document (le fichier est le JSON publié).

**Empreinte** — le SHA-256 d'un document, gardée dans `source.pdfSha256`. Deux
documents de même empreinte sont le même document, quelle que soit leur URL.

**Extraction** — la production d'un fichier publié depuis un document, par
`scripts/extract-menu-pdf.py`. Aucun plat ne se saisit à la main.

**Corpus** — l'ensemble des fichiers publiés sous `static/data/`. Son
**horizon** est le dernier jour servi qu'il contient.

**Veille** — le contrôle quotidien de la page de la Ville contre le corpus. Ses
**constats** : un document **nouveau**, **republié** (empreinte changée),
**déplacé** (même empreinte, autre URL), ou un **corpus court** (horizon à
moins de quatorze jours).

## Le jour

**Jour servi** — un jour où la cantine sert un repas (`kind: "school"`). Les
autres jours ne sont pas servis et n'ont pas de plats : **férié**, **week-end**,
**vacances** (sans menu de vacances).

**Jour présenté** — le jour que l'écran montre. C'est aujourd'hui s'il est
servi, sinon le **prochain service**. Quand aucun jour à venir n'est publié, le
menu est **non publié** — ce qui n'est pas la même chose qu'un jour non servi.

**Mention** — le court texte au-dessus de la date qui situe le jour présenté :
« Demain », « Férié · service dans 2 jours », « Vacances · demain ». Le jour
courant porte la pastille **Aujourd'hui**.

**Thème du jour** — l'encart « ZOOM SUR » du document (« Semaine du goût »), et
sa **note**. Il s'attache à un jour par jugement humain.

_À éviter_ : « thème » pour l'apparence claire ou sombre ; on dit **apparence**.

**Confiance** — la fiabilité d'un jour extrait : `high`, ou `low` quand la
structure est inhabituelle. Un jour de confiance faible s'affiche avec un
avertissement, jamais en silence.

**Périmé** — se dit d'une page pré-rendue un autre jour que celui du
navigateur. Elle masque son jour jusqu'à ce que l'application le recalcule.

## Le repas

**Rôle** — la place d'un plat dans le repas : entrée, plat, accompagnement,
laitage, dessert, pain, goûter. C'est une valeur et jamais une position : le
document a des cellules vides. Le **déjeuner** réunit les six premiers rôles ;
le **goûter** est servi l'après-midi, à part.

_À éviter_ : « slot » hors du code et des données, où le nom vient du schéma.

**Plat principal** — le plat du rôle « plat ». C'est le seul qui porte une
couleur.

**Famille** — la nature du plat principal : viande, volaille, poisson,
végétarien, ou **inconnu** quand aucun mot du libellé ne la dit. C'est le seul
code couleur de l'application, le même sur le jour et sur la semaine.

**Rôle absent** — un rôle du déjeuner sans plat ce jour-là. Il s'énonce (« Pas
de laitage ce jour ») et ne disparaît pas : un **creux** doit rester
distinguable d'une donnée manquante.

**Mention de qualité** — un label imprimé à côté d'un plat : bio, label rouge…
(`flags` dans les données).

## Les allergènes

**Allergène déclaré** — un code allergène que le document attache à un plat.
Une liste vide veut dire « aucun allergène déclaré », jamais « sans allergène ».

**Allergènes non précisés** — un document qui ne déclare d'allergènes pour
aucun plat hors du pain (la Toussaint 2026). Ses listes vides ne disent rien,
et l'application le dit.

**Allergène surveillé** — un allergène coché par le parent dans les réglages.
Il reste sur l'appareil.

**Signalement** — la mise en évidence d'un plat qui contient un allergène
surveillé : la **pastille d'allergène**, avec ses pictogrammes et les noms en
toutes lettres. Jamais par la couleur seule.

## L'écran

**Écran du jour** et **écran de la semaine** — les deux écrans de consultation.

**Liste du jour** — la suite des éléments du déjeuner sur l'écran du jour, un
par rôle. Un rôle servi est une **carte** ; un rôle absent et le goûter sont des
**lignes compactes**.

_À éviter_ : « plateau », « ardoise » — deux états passés de cette liste.

**Fiche du jour** — la couche modale qui liste chaque plat du jour avec tous
ses allergènes déclarés, surveillés ou non.

**Bandeau** — un message sur l'un de trois **tons** : **alerte** (ce qui
compromet la lecture d'un repas), **info** (les limites de l'application),
**événement** (ce qui caractérise le jour).

**Apparence** — claire ou sombre, selon la préférence du système. L'application
n'a pas de réglage d'apparence.

**Jeton** — une valeur de `src/lib/design/tokens.css` (couleur, taille, rayon,
espace…), nommée en français par son sens. Les composants ne citent que des
jetons.
