## Why

Le plateau distribue sa surface par rôle, jamais par information. Six compartiments d'une taille arrêtée à la conception, remplis par ce que la Ville publie ce jour-là, sans que rien ne demande jamais si le contenu justifie la place. Deux effets opposés en sortent, et ce sont les deux mêmes bugs vus par leurs deux bouts.

**Le pain reçoit de la place sans rien dire.** Il est servi les trente-cinq jours du jeu de données, et son libellé est « Pain » trente-trois fois. Le compartiment affiche donc « PAIN » en libellé de rôle, puis « Pain » en nom de plat — le même mot, deux fois, dans deux tailles — puis, en neuf pixels gris, la seule chose qui varie d'un jour à l'autre : `bio` quatorze fois, `label-rouge` dix-neuf fois. La hiérarchie est exactement inversée. Ce qui est constant est gros, ce qui distingue ce jour est chuchoté.

**Le goûter dit quelque chose et ne reçoit aucune place.** Vingt libellés distincts sur trente-cinq jours, c'est-à-dire la deuxième entropie de l'écran après le plat principal. Il est rendu hors du plateau, sans fond, sans bordure, en petit corps, sous une ligne de commentaire qui justifie son exil : « il n'est pas servi sur celui du déjeuner ». L'argument est juste — c'est un autre moment de la journée. Sa traduction en « donc plus discret » ne l'est pas. *Autre moment* ne veut pas dire *moins important*, et pour un parent qui prépare une fin d'après-midi, c'est souvent l'inverse.

En creusant le pain, une seconde chose est apparue : la tautologie n'est pas propre au pain. **Sept jours sur trente-cinq, tous des mercredis, le libellé du goûter est littéralement « Goûter ».** Les allergènes sont renseignés, le contenu ne l'est pas. La carte du goûter dirait donc « GOÛTER · Goûter » un jour d'école sur cinq — une absence de donnée déguisée en donnée.

## What Changes

- **Un compartiment dont le libellé répète son rôle nomme à sa place ce qui varie.** Le pain s'annonce par sa qualité — « Label Rouge », « Bio » — et non par le mot « pain » écrit deux fois. La règle est générale et non taillée pour le pain : elle se déclenche sur la tautologie, pas sur un rôle nommé dans le code. « Pain du mois » garde son libellé, puisqu'il dit quelque chose que le rôle ne dit pas.
- **Une tautologie sans qualité à promouvoir devient une absence déclarée.** Le goûter du mercredi cesse de se répéter et signale que le détail n'est pas publié. C'est l'esprit de D12 — un creux doit rester distinguable d'une donnée manquante — appliqué au cas où le creux se cache derrière un mot.
- **Le goûter devient un objet à part entière**, du poids visuel d'un compartiment, posé sous le plateau et séparé de lui par une rupture qui se voit. Il ne rentre pas dans la grille : il n'est pas servi au même moment, et le lire comme une septième case du déjeuner serait faux.
- **La transition entre jours ralentit, et cesse d'avoir deux horloges.** L'en-tête est aujourd'hui hors du bloc animé : la date passe à demain pendant que le plateau d'aujourd'hui n'a pas fini de partir. Un seul temps gouverne désormais le changement. Le ralentissement est **une expérience à juger sur un téléphone**, pas une décision ; il est réversible d'une ligne.

## Capabilities

### Modified Capabilities

- `menu-browsing` : l'exigence **Grille compartimentée de l'écran Aujourd'hui** cesse de supposer que le libellé d'un plat le désigne toujours, et cesse de laisser le goûter sans forme prescrite. L'exigence **Navigation entre jours** précise ce que « perçu comme immédiat » veut dire quand une transition existe.

## Impact

**Code applicatif** — `src/lib/menu/Tray.svelte` (compartiment tautologique), `src/lib/menu/labels.ts` (règle de nommage et formulation de l'absence), `src/routes/+page.svelte` (le goûter devient une carte, l'en-tête entre sous la même horloge), `src/lib/design/tokens.css` (durée de `.glisse`). L'écran de la semaine hérite de la durée, qu'il partage.

**Tests** — la règle de nommage est une fonction pure : elle se teste sans navigateur, sur les trois cas réellement présents dans les données (libellé tautologique avec qualité, libellé tautologique sans qualité, libellé porteur). Le goûter changeant de forme, `contrast.test.ts` doit couvrir sa nouvelle surface — le contrôle de couverture des transparences (D27) refusera toute opacité non déclarée, ce qui le signalera de lui-même.

**Données** — aucun changement de schéma. Les sept mercredis à libellé vide sont un défaut de la source, pas de la saisie ; ce changement les rend visibles au lieu de les masquer. Les corriger, s'ils sont corrigibles, est un autre travail.

**Hors périmètre** — la barre d'onglets et la place des allergènes, qui relèvent de la coque et non du contenu du jour. Le balayage qui suivrait le doigt : voir les questions ouvertes de `design.md`, où il est consigné plutôt que perdu.
