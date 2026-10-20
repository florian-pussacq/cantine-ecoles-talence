# Menus cantine Talence (non officiel)

Les menus de la cantine des écoles de Talence, lisibles d'un coup d'œil sur un
téléphone, hors ligne, sans compte ni pistage.

**→ [cantine-ecoles-talence.netlify.app](https://cantine-ecoles-talence.netlify.app/)**
— s'installe sur l'écran d'accueil du téléphone comme une application.

La Ville publie ses menus en PDF, une grille A3 par mois. Cette application en
tire le menu du jour et de la semaine, signale les allergènes qu'un parent
surveille, et reste lisible le soir, en mode sombre, au moment où l'on regarde
le repas du lendemain.

> **Seul le document officiel de la Ville fait foi.** Cette application n'est
> pas un service de la Ville de Talence, ne remplace pas un projet d'accueil
> individualisé (PAI), et l'absence d'allergène déclaré ne garantit pas
> l'absence de traces. Chaque écran renvoie au PDF d'origine.

## Ce qu'elle fait

- **L'écran du jour** — le déjeuner rôle par rôle (entrée, plat, accompagnement,
  laitage, dessert, pain), puis le goûter. Le plat principal porte la couleur de
  sa famille : viande, volaille, poisson, végétarien. Un jour sans service
  présente le prochain, et dit pourquoi : week-end, férié, vacances.
- **L'écran de la semaine** — les cinq jours, chacun résumé par son plat
  principal.
- **La fiche du jour** — chaque plat avec tous ses allergènes déclarés.
- **Les allergènes surveillés** — cochés dans les réglages, ils sont signalés sur
  chaque plat qui les contient, par un pictogramme et en toutes lettres. Le choix
  reste sur l'appareil.
- **Les menus de vacances et le menu de grève**, quand la Ville les publie.
- **Hors ligne** — après une première visite, tout fonctionne sans réseau.
  L'application prévient si l'appareil n'a pas pu vérifier les menus depuis une
  semaine.
- **Clair ou sombre**, selon le réglage du téléphone.

Aucun compte, aucun cookie, aucun pistage, aucune ressource tierce.

## Comment ça marche

```
 Page des menus de la Ville                         chaque matin
 (PDF : mensuels, vacances, grève)  ◀──────────────  veille (GitHub Actions)
            │                                        échoue s'il y a à faire :
            │ téléchargé, puis extrait               menu nouveau ou republié,
            ▼ par scripts/extract-menu-pdf.py        corpus de moins de 14 jours
 sources/pdf/*.pdf ──▶ static/data/*.json
                       (un fichier par mois, validé par JSON Schema
                        et par des règles de cohérence)
                              │
                              ▼ commit sur main, puis poussée
                       GitHub Actions : validation, tests, e2e, budgets
                              │ tout est vert, puis geste humain :
                              ▼ Actions → publier → Run workflow
                       build hook ──▶ Netlify publie le site
                                      (SvelteKit entièrement pré-rendu,
                                       service worker pour le hors-ligne)
```

**Les données.** Les menus ne se saisissent jamais à la main : ils sont extraits
des PDF par la géométrie de la grille, avec PyMuPDF. Chaque fichier publié cite
son PDF et son empreinte. Un test rejoue l'extraction de chaque PDF conservé et
exige les données publiées à l'identique : une retouche du parser qui changerait
un mois passé ne passe pas inaperçue.

**La veille.** Le workflow `veille` compare chaque matin la page de la Ville aux
données publiées. Quand il échoue, GitHub prévient par courriel, et il reste
rouge tant que les menus ne sont pas mis à jour.

**L'application.** Un site SvelteKit statique, pré-rendu, servi par Netlify. Les
menus sont intégrés aux pages au moment du build : l'écran s'affiche complet dès
la première peinture. Un service worker garde l'application et ses données pour
le hors-ligne.

**La livraison.** On travaille directement sur `main`. Une poussée ne publie pas :
la CI vérifie, et la mise en ligne est un second geste, le workflow `publier`,
qui refuse tout commit dont la vérification n'est pas verte. Le détail,
et les deux réglages de plateforme qui ne vivent pas dans le dépôt, sont dans
[`docs/livraison.md`](docs/livraison.md).

## Démarrer

Node 24 (la version est dans [`.nvmrc`](.nvmrc), lue aussi par la CI et Netlify).

```bash
npm ci
npm run dev          # http://localhost:5173
```

### Vérifier

```bash
npm run validate     # format, lint, types, données, tests unitaires
npm run build        # construction et budgets de performance
npm run test:e2e     # tests de bout en bout (Playwright, Chromium)
```

`validate` puis `build` passent avant tout commit. `test:e2e` aussi dès qu'on
touche à l'interface ou aux données servies.

### Mettre à jour les menus

```bash
npm run veille                         # ce que la Ville a publié de nouveau
pip install -r scripts/requirements.txt
npm run test:extraction                # l'extracteur reproduit-il les mois publiés ?
```

La procédure complète — télécharger, extraire, reprendre le thème du jour,
publier, vérifier — est dans le skill
[`menus-talence`](.claude/skills/menus-talence/SKILL.md).

## Organisation

```
src/
  routes/              les écrans : jour, semaine, réglages, grève, à propos
  lib/data/            chargement des menus, résolution du jour présenté
  lib/menu/            liste du jour, fiche, libellés
  lib/filter/          allergènes surveillés
  lib/design/          jetons (tokens.css) et leurs gardes de contraste
  lib/illustrations/   dessins des plats, pictogrammes d'allergènes
  lib/pwa/             mises à jour et contact avec le serveur
  service-worker.ts    hors-ligne
static/data/           les menus publiés, un JSON par document
sources/pdf/           les PDF de la Ville dont ils sont extraits
schemas/               le contrat des données (JSON Schema)
scripts/               extraction, veille, validation, budgets
e2e/                   tests de bout en bout
openspec/              specs, changements en cours et archivés
```

## Pour aller plus loin

- [`PRD-menus-talence.md`](PRD-menus-talence.md) — le pourquoi du projet, ses
  utilisateurs, ses exigences.
- [`CONTEXT.md`](CONTEXT.md) — le vocabulaire : rôle, famille, corpus, veille…
- [`openspec/specs/`](openspec/specs/) — ce que l'application garantit,
  exigence par exigence.
- [`openspec/changes/archive/`](openspec/changes/archive/) — chaque changement,
  avec sa raison d'être et ses décisions de conception.
- [`docs/livraison.md`](docs/livraison.md) — du commit à la production.
- [`docs/schema.md`](docs/schema.md) — le format des données.

Les changements se mènent avec [OpenSpec](https://github.com/Fission-AI/OpenSpec) :
proposition, conception, spec, tâches, puis archive. C'est le seul suivi du
projet.
