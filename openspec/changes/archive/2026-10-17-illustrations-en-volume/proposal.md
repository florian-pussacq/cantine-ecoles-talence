## Why

`menu-en-cartes` a donné une vignette à chaque plat. Le résultat déçoit devant la maquette, et la
mesure dit pourquoi : **ce n'est pas la qualité des dessins, c'est leur nombre.**

Recensement sur septembre et octobre :

| | |
|---|---|
| Plats servis | 230 |
| Libellés distincts | **149**, dont **129 vus une seule fois** |
| Illustrations disponibles | 13 |
| Pire collision | `legume` = **40 libellés distincts sur un seul dessin** |
| Échecs de reconnaissance | 19 / 230 (8 %) |

Le moteur de mots-clés fonctionne — 8 % d'échecs, c'est peu. Ce qui manque n'est pas la
couverture mais la **résolution** : « Radis beurre », « Taboulé », « Ratatouille », « Lentilles »
et « Salade grecque » recevaient tous la même courgette verte.

**Deux défauts de classement, trouvés en mesurant.** « Salade de fruits » affichait un légume :
`salade` compte six lettres, `fruit` cinq, et la règle du mot-clé le plus long se retournait
contre elle-même. Et « Liégeois vanille », « Yaourt à boire » et « Boudoir + Yaourt » recevaient
une part de fromage.

**Le budget interdisait d'agrandir la bibliothèque.** Le JavaScript était à 55,0 / 60,0 Ko gzip —
92 % — et `Sprite.svelte`, étant un composant Svelte, était facturé **deux fois** : une fois dans
le bundle, une fois dans chaque page pré-rendue. Ajouter dix-huit dessins en style volumétrique
aurait porté le budget à 97 %, c'est-à-dire condamné la bibliothèque à ne plus jamais grandir.
Une bibliothèque qu'on ne peut pas agrandir n'est pas une bibliothèque.

**Les photographies sont écartées, et cette fois chiffrées.** 149 libellés distincts, environ 65
nouveaux chaque mois, aucune source photo, saisie manuelle, et `img-src 'self' data:` en
production. D9 et D51 l'avaient déjà tranché ; les chiffres ne les contredisent pas, ils les
confirment. Le rendu de la maquette est obtenu autrement : par du volume dessiné.

## What Changes

- **Le sprite quitte le bundle JavaScript** pour la coque HTML, injecté au pré-rendu par un hook
  serveur. Le JS tombe à 52,6 Ko (88 %) *avec* trente et un dessins au lieu de treize, et la
  taille de la bibliothèque cesse définitivement de peser sur lui.
- **Trente et une illustrations au lieu de treize**, en éclatant ce qui collisionne réellement.
  Pire collision ramenée de **40 à 11** libellés, échecs de 8 % à 5 %.
- **Du volume, par deux voiles partagés** — un lustre et une assise — plus une ombre de contact
  posée. Le rendu mat de la maquette, sans photographie et sans filtre coûteux.
- **Les cinq libellés qui restent sans correspondance le restent** : « Moussaka », « Émincé au
  curry » et « Escalope viennoise » sont authentiquement ambigus quant à leur protéine. Leur
  inventer un mot-clé serait exactement l'approximation que D11 interdit.
- **Les glyphes de rôle et les pictogrammes d'allergène ne changent pas.** À 20 et 15 pixels, un
  dégradé est du bruit, pas du relief.

## Capabilities

### Modified Capabilities

- `dish-illustration` : l'exigence sur la bibliothèque acquiert une contrainte de résolution, et
  celle sur l'intégration au document précise le mécanisme de livraison.

## Impact

**Code applicatif** — `src/lib/illustrations/sprite.svg` (nouveau, l'art seul),
`src/hooks.server.ts` (nouveau, l'injection), `src/app.html` (le point d'injection),
`src/routes/+layout.svelte` (ne monte plus rien), `src/lib/illustrations/Sprite.svelte`
(supprimé), `src/lib/illustrations/families.ts` (union et table).

**Tests** — `allergens.test.ts` lit le nouveau fichier. `families.test.ts` gagne deux cas de
non-régression sur les défauts corrigés. `contrast.test.ts` joint le sprite à son balayage
anti-thème : devenu un `.svg`, il était sorti du filtre `src/**/*.svelte` sans bruit, et une
exigence qui cesse d'être vérifiée à un endroit n'est plus vérifiée du tout.

**Données** — aucun changement. La déduction reste côté application, ce qui permet d'enrichir la
table sans régénérer les mois déjà publiés (D11).

**Hors périmètre** — les photographies ; un dessin par plat nommé, que la traîne de 129 libellés
uniques rend absurde.
