# Backlog

Ce qui attend, dans l'ordre où ça devrait partir. Une entrée devient un changement
sous `openspec/changes/` quand on commence à y réfléchir sérieusement, et **quitte
alors cette liste**. Les entrées restent ici, et non en changements vides, pour que
`openspec list` ne montre que le travail réellement en cours.

Ce qui est fait ne s'y garde pas : son histoire est dans `openspec/changes/archive/`
et dans git. Ménage du 18 octobre 2026 ; le vocabulaire est celui de `CONTEXT.md`.

## 1. Budget JavaScript à 97 % — investigation

Mesuré le 18 octobre 2026 : 57,9 Ko gzip pour un plafond de 60 Ko (PRD §8). Environ
19 Ko sont le runtime Svelte et 11 Ko le client SvelteKit, incompressibles ; le
code de l'application pèse environ 28 Ko. Toute fonctionnalité à venir se paiera
sur deux kilo-octets.

Avant de couper ou de relever le plafond : ventiler les 28 Ko par module (la fiche
du jour, chargée alors que tout le monde ne l'ouvre pas ? un découpage par écran ?)
et retrouver ce que le plafond protège — quel téléphone, quel réseau — pour savoir
s'il le protège encore.

## 2. Mention de l'écran du jour, le week-end

La spec est tenue : « Prochain service · dans 2 jours » dit bien qu'on ne regarde
pas aujourd'hui. Le férié et les vacances ont leur mention propre ; le week-end
garde la générique. Resterait « Week-end · service lundi », en lisant le champ
`skipped` de la cible résolue comme le fait déjà le férié. Le commentaire de
`targetEyebrow` (`src/lib/menu/labels.ts`), qui dit que les vacances n'ont pas
encore leur mention, est faux depuis `menus-vacances` : à corriger au passage.

## 3. La page 404, d'une autre identité

`static/404.html` a gardé l'apparence de l'ardoise sombre, sans la palette crème ni
ses jetons, et ses deux palettes à elle. C'est la seule page qui ne ressemble pas à
l'application. Rarement vue ; à reprendre avec l'entrée 2, dans un même changement
de finition.
