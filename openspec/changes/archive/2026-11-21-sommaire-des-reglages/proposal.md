## Why

L'écran des réglages porte tout : les quatorze cases des allergènes, l'apparence, le menu de grève et les mentions. Sur un téléphone de 390 px, il mesure 1 570 px et l'apparence, ajoutée par `choix-d-apparence`, commence vers 1 100 px, sous le premier écran : on ne la trouve qu'en faisant défiler tous les allergènes. Chaque réglage futur aggraverait la chose.

Florian a choisi, parmi trois maquettes, celle d'un sommaire, avec l'apparence en tête et les allergènes sur leur propre écran.

## What Changes

- L'écran des réglages devient un sommaire qui tient dans le premier écran, dans cet ordre : Apparence, Allergènes, Menus, Application.
- L'apparence y reste réglable sur place, en une rangée de trois choix (Appareil, Clair, Sombre) au lieu d'une liste de trois boutons radio. Sa sémantique reste celle d'un groupe radio.
- Les allergènes y sont résumés en une ligne, qui nomme les allergènes surveillés et leur nombre, et mène à un écran dédié.
- **Nouvel écran** `/reglages/allergenes` : la section actuelle, déplacée telle quelle (intro, bandeau de stockage, cases, compte et « Tout décocher », avertissement). Sa sortie d'en-tête ramène aux réglages.
- La commande des écrans de menu (la roue et son compte) mène toujours aux réglages, où l'état des allergènes se lit sans défiler.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `allergen-filter` : le réglage vit sur un écran dédié, atteint depuis les réglages ; la commande portant le compte mène au sommaire, qui en redit l'état.
- `menu-browsing` : les réglages deviennent un sommaire ordonné ; la sortie de l'écran des allergènes ramène aux réglages.

## Impact

- `src/routes/reglages/+page.svelte` : réécrit en sommaire.
- `src/routes/reglages/allergenes/+page.svelte` : nouveau, reprend la section des allergènes.
- `src/routes/+layout.svelte` : une entrée dans `TITRES` et dans `SORTIES`.
- e2e : `coque.spec.ts` (tables d'écrans, sorties), `mesure.spec.ts`, `qualite.spec.ts`, `large.spec.ts` gagnent le nouvel écran ; les scénarios qui cochent des allergènes changent d'adresse.
- Budget : le JavaScript des écrans de menu ne change pas. Celui des réglages se répartit sur deux pages ; `check-budget` le borne page par page.
- Maquette de référence : « Réglages, trois plans », proposition B, version 2.
