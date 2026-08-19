## Why

Le thème choisissable était une erreur de conception, et il faut le dire ainsi plutôt que le laisser vivre. Une application qui affiche le menu de la cantine n'a pas de raison d'offrir un réglage d'apparence : personne ne l'ouvre pour le configurer, on l'ouvre pour savoir s'il y a du poisson. Ce réglage a coûté deux palettes à tenir cohérentes, un script bloquant dans l'en-tête HTML, une clé de stockage dupliquée entre un module et un fichier HTML, un test qui surveille cette duplication, un test de bout en bout d'absence de clignotement, et un panneau qui occupe le haut de l'écran Réglages avant les allergènes — c'est-à-dire avant la seule chose qu'on vient y faire.

Le fond de page, par ailleurs, tire au vert. `--table: #1e5a6b` est un pétrole qui, sur un écran de téléphone, se lit comme une teinte de piscine municipale. Ce n'est pas un défaut mesurable, c'est un jugement, et il est tranché : ardoise froide.

Les deux se traitent ensemble parce qu'ils touchent le même fichier et le même test. Restructurer la palette après avoir retiré sa moitié sombre est un geste ; le faire en deux fois, c'est mesurer deux fois quarante rapports de contraste.

## What Changes

- **BREAKING** : la capacité `theme-preference` disparaît en entier. Plus de choix, plus de suivi de la préférence du système, plus de seconde palette. Ce qui est retiré est le *mécanisme*, pas la surface sombre : l'application garde un fond profond et des plateaux clairs, et cette apparence unique cesse d'être négociable.
- **Le fond devient une ardoise froide** — `--table: #2b3440`, `--dark-table` et ses vingt-six frères supprimés. La structure ne bouge pas : plateau clair posé sur un fond profond, familles inchangées.
- **Le script de thème quitte `app.html`**, avec les deux balises `theme-color` conditionnelles qu'il pilotait. Il en reste une, sans requête de média.
- **`contrast.test.ts` perd sa moitié sombre et gagne les surfaces translucides.** Il mesure aujourd'hui des jetons opaques ; or deux surfaces réellement peintes sont des mélanges à l'opacité, et l'une d'elles ne tient pas son seuil depuis l'origine.
- **Deux défauts de contraste préexistants sont corrigés** : le lien de pied de page à 70 % d'opacité mesure 4,34:1 sur le fond actuel là où il en faut 4,5 ; les bordures des boutons de jour mesurent 2,22:1 là où WCAG 1.4.11 en exige 3. L'ardoise répare le premier par sa seule luminance ; le second demande de porter la bordure de 35 % à 40 %.

## Capabilities

### Removed Capabilities

- `theme-preference` : supprimée. Le choix de thème n'a jamais correspondu à un besoin, et sa mise en œuvre coûtait plus que ce que l'application entière coûte à afficher un jour.

### Modified Capabilities

- `menu-browsing` : l'exigence **Accessibilité des écrans de consultation** cesse de renvoyer à `theme-preference` et d'exiger un thème sombre. Elle exige désormais une apparence unique, et étend l'exigence de contraste aux surfaces translucides — ce qui, en pratique, est la partie de l'exigence qui n'était pas vérifiée.

## Impact

**Code applicatif** — Supprimés : `src/lib/theme/theme.svelte.ts`, `src/lib/theme/theme.test.ts`, `e2e/theme.spec.ts`. Modifiés : `src/app.html` (script et balises retirés), `src/lib/design/tokens.css` (moitié sombre retirée, `--table` changé, `color-scheme` figé), `src/routes/+layout.svelte` (hydratation du thème retirée), `src/routes/reglages/+page.svelte` (panneau retiré, l'écran redevient un écran d'allergènes), `src/routes/+page.svelte` (opacité de bordure).

**Tests** — `src/lib/design/contrast.test.ts` : les trois tests de cohérence des deux voies sombres n'ont plus d'objet et disparaissent ; les vingt paires du thème sombre disparaissent ; des paires translucides apparaissent. `AllergenChip.test.ts` importe `contraste` depuis ce fichier et doit continuer de passer.

**Sécurité** — le retrait du script en ligne supprime *une* raison de tolérer `'unsafe-inline'` dans `script-src` (D21). Il ne la supprime pas toutes : SvelteKit en produit d'autres. Le durcissement de la politique reste un travail distinct, désormais moins bloqué.

**Budget** — le poids retiré est du JavaScript expédié : le store de thème et son hydratation quittent le paquet. Le budget de 60 Ko est **à 90 %** — 53,8 Ko, mesuré à l'ouverture de ce changement, contre 84 % il y a peu. La marge est de 6,2 Ko et la construction échoue au dépassement. Ce changement la reconstitue, ce dont les deux qui suivent auront besoin.

*Mesuré après coup :* **52,9 Ko, soit 88 %**. La marge passe de 6,2 à 7,1 Ko. La baisse est de 0,9 Ko, moins que ce que « supprimer un module et son hydratation » laisse imaginer — le store de thème était petit, et l'essentiel du paquet est le cadriciel. À retenir pour les deux changements suivants : la marge ne se reconstitue pas en retirant des fonctions de cette taille.

**Hors périmètre** — la navigation basse et l'engrenage de réglages (`navigation-basse`), la hiérarchie interne du jour et la transition entre jours (`hierarchie-du-jour`). Aucune donnée, aucun schéma, aucune illustration.
