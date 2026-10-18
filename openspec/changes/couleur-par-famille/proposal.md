## Why

Le même rôti de bœuf est brun-orangé sur l'écran du jour, parce que c'est la couleur du rôle « plat », et rouge sur la semaine, parce que c'est la couleur de la famille « viande ». Deux codes couleur coexistent, et ils ne disent pas la même chose. La question du matin — « il y a du poisson cette semaine ? » — ne se lit pas de la même façon d'un écran à l'autre.

Décision prise le 17 octobre 2026, sur l'audit du système de design : un seul code, la famille, porté par le plat principal seulement.

## What Changes

- Sur l'écran du jour, la carte du plat principal prend la couleur de sa famille, celle de son disque sur la semaine : pastille en aplat, libellé du rôle, filet à gauche, vignette teintée et cerclée, et le nom de la famille écrit (« Viande »).
- Les autres cartes perdent leur couleur : pastille neutre, glyphe et libellé en encre.
- Les sept jetons `--role-*` sont retirés, avec leurs mesures de contraste. Les familles sont mesurées à leur place, glyphe blanc dessus et encre sur la carte.
- D50 et D54 (`menu-en-cartes`) sont révisées.

Hors périmètre, au backlog : les cartes vides et le goûter en lignes compactes (14b) ; la pastille d'allergène de la semaine, qui ne montre que le premier allergène surveillé (14c).

## Capabilities

### Modified Capabilities

- `menu-browsing` : la couleur d'une carte désigne la famille du plat principal, et non plus le rôle.

## Impact

- **Composants** : `PlatCarte`, `PastilleRole` (glyphe seulement), `tokens.css`.
- **Tests** : `contrast.test.ts` (les sept paires de rôle remplacées par cinq familles), `Tray.test.ts`, `design-tokens.test.ts` (`--role` n'est plus un jeton local).
- **Palette inchangée** : les cinq familles tiennent déjà 4,5:1 sous un glyphe blanc et sur la carte (la viande au plus juste, 4,55).
- **Budget** : retire du CSS, n'ajoute pas de JavaScript.
