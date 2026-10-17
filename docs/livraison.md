# La livraison

Ce document décrit le chemin d'un commit jusqu'à la production, et surtout ce qui
ne vit pas dans le dépôt : un réglage de plateforme sans lequel rien ne se
publie. Il n'est pas versionnable ; il est donc écrit ici.

## Le chemin

```
commits sur main, en local ──► vérification locale ──► poussée groupée ──► Netlify publie
                                                              │
                                                              └──► GitHub Actions : verifier + e2e
```

- **On travaille sur `main`** (développement sur le tronc). Les commits restent
  en local et partent ensemble : chaque poussée déclenche un déploiement.
- **La vérification locale est la barrière** : `npm run validate && npm run
build`, et `npm run test:e2e` dès que l'interface ou les données servies
  changent (`CLAUDE.md`).
- **Netlify publie** `main` à chaque poussée, par son intégration Git, et rejoue
  `npm run validate && npm run build` (`netlify.toml`). Il n'exécute pas les
  tests de bout en bout.
- **GitHub Actions vérifie** chaque poussée sur `main`
  (`.github/workflows/verifier.yml`). Il constate après la publication ; il ne la
  retient pas. Un `e2e` rouge sur `main` signale donc un défaut déjà en ligne.

Pourquoi ce compromis, et comment rétablir une barrière sans PR : `ci-github`,
D1 et sa révision.

## Réglage 1 — Netlify relié au dépôt GitHub

Le site a été créé quand le dépôt vivait sur GitLab. À vérifier dans Netlify,
_Site configuration → Build & deploy → Continuous deployment_ :

- dépôt lié : `florian-pussacq/cantine-ecoles-talence` sur GitHub ;
- branche de production : `main` ;
- prévisualisations de déploiement : activées pour les pull requests.

Symptôme d'un lien resté sur GitLab : une fusion dans `main` ne déclenche aucun
déploiement, et le site garde ses anciens menus.

## L'instant des tests

Les tests de bout en bout ne lisent jamais l'horloge réelle. `e2e/instant.ts`
fixe un instant que la fixture impose au navigateur et que la configuration
Playwright impose au pré-rendu, par `CANTINE_INSTANT` (`ci-github`, D5 et D6).

En local, arrêter tout serveur `preview` déjà lancé avant `npm run test:e2e` :
Playwright le réutiliserait, et un serveur construit sans `CANTINE_INSTANT`
énonce le jour réel.
