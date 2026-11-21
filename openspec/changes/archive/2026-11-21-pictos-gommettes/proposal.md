## Why

Les illustrations des plats étaient bien intégrées mais faibles. Elles étaient dessinées en volumes mous, éclairés par un lustre et une assise partagés (D58), et posées dans une interface plate et signalétique (refonte-signaletique) : les deux styles se contredisaient. Leurs formes étaient aussi trop abstraites. Le poisson du jour était une goutte bleue, la viande un rectangle à bandes, le gâteau un pavé.

Trois directions ont été dessinées et comparées en maquette, sur douze plats, dans l'écran du jour, en clair et en sombre : un pictogramme d'une seule encre, des gommettes de papier découpé, et le plat vu du dessus dans son contenant. Florian a retenu les gommettes. Il a ensuite fait reprendre le gâteau et les légumineuses (variantes « carré » et « trio »), puis validé les 31 dessins un par un.

## What Changes

- **Les 31 illustrations sont redessinées en gommettes de papier découpé**, une par entrée du type `Illustration` de `families.ts`. Les identifiants des symboles ne changent pas (`ill-pain` … `ill-inconnu`), ni la table de correspondance, ni les familles.
- **Une seule grammaire de dessin** tient le jeu : de deux à cinq pièces de papier par dessin, trois couleurs au plus, une palette commune, des détails en pièces collées et jamais en traits, une légère inclinaison propre à chaque dessin.
- **Une ombre de papier commune** remplace le lustre et l'assise. C'est la silhouette du dessin, décalée, posée comme une forme et non comme un filtre. Elle reste un ornement, et le dessin se lit sans elle. Les deux dégradés partagés quittent le sprite.
- **Le dessin du plat principal et la vignette d'une ligne grandissent un peu** (70 px au lieu de 64 dans le disque, 36 px au lieu de 32 en ligne, et l'équivalent au palier large). Le disque pâle ne change pas.
- La cloche du plat inconnu est redessinée dans la même grammaire, en acier neutre.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `dish-illustration` : la bibliothèque partage une seule grammaire de dessin, et chaque illustration reste lisible sur fond clair comme sur fond sombre.

## Impact

- `src/lib/illustrations/sprite.svg` : les 31 symboles `ill-*` et l'en-tête qui les décrit. Les dégradés `lustre` et `assise` sont retirés. Les allergènes et les marques de qualité ne changent pas.
- `src/lib/design/tokens.css` : `--ill-plat` et `--ill-ligne`, aux deux paliers.
- Poids : le sprite passe de 7,5 à 10,3 Ko compressés, posés une fois dans chaque page HTML. Le budget JavaScript est inchangé (D57).
- Aucune donnée, aucun composant, aucun test unitaire de correspondance n'est touché.
