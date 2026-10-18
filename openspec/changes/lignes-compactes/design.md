## Contexte

`Tray` rend une `PlatCarte` par rôle du déjeuner, plat ou non ; l'écran du jour rend le goûter dans un bouton à part, avec la même `PlatCarte`. Une carte vide se distingue par son fond creux et son texte en italique, mais garde la hauteur d'une carte servie, vignette comprise.

L'artefact « Audit design de la cantine » (piste 2) montre trois directions. Express met chaque rôle sur une ligne de deux colonnes — libellé du rôle, nom du plat — et tient la journée sans défiler, au prix des illustrations. Affinée garde les cartes. La décision prend Affinée et n'emprunte à Express que la ligne, pour ce qui n'a pas d'illustration à montrer.

## Décisions

### D1 — La forme suit ce qu'il y a à montrer

Une carte existe pour porter une illustration, un nom de plat mis en valeur et ses mentions. Un rôle absent n'a ni illustration ni nom : sa carte pleine ne montrait que du vide. Il devient une ligne : glyphe de rôle à 24 px, libellé du rôle, énoncé de l'absence, sur fond creux. Il reste présent — la liste ne se referme pas (D12) — et ne se confond pas avec un plat, puisque sa forme diffère.

### D2 — Le goûter en ligne, parce qu'il n'est pas du même service

Le goûter est servi l'après-midi. Sa carte pleine le mettait sur le même plan que le déjeuner ; une ligne le classe comme ce qu'il est, une information secondaire de la journée. Elle garde ce qu'une carte disait : libellé du rôle, nom (ou « Détail non publié »), mentions de qualité et signalement d'allergène. Elle perd la vignette.

Le goûter reste une cible distincte qui ouvre la fiche du jour, et le focus y revient à la fermeture (spec, « Couche modale de détail de la journée »).

Une cible ne descend pas sous `--touch` (44 px). À la mise en œuvre, la ligne du goûter mesurait 42 px, et `qualite.spec.ts` l'a refusée : la forme compacte porte donc `min-height: var(--touch)`, sur la ligne elle-même plutôt que sur le bouton, pour que le contour de focus épouse ce qu'on touche.

### D3 — Une forme de `PlatCarte`, pas un second composant

`PlatCarte` reçoit `compacte`. Les deux formes partagent le libellé du rôle, le nom, les mentions et le signalement : un second composant les dupliquerait, et les deux finiraient par diverger. La forme compacte retire la vignette, réduit la pastille et passe le corps en ligne.

`Tray` la demande pour un rôle sans plat ; l'écran du jour la demande toujours pour le goûter.
