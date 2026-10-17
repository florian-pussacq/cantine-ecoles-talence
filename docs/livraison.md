# La livraison

Ce document décrit le chemin d'un commit jusqu'à la production, et surtout ce qui
ne vit pas dans le dépôt : deux réglages de plateforme sans lesquels la garantie
ne tient pas. Ils ne sont pas versionnables ; ils sont donc écrits ici.

## Le chemin

```
branche ──► pull request ──► verifier + e2e verts ──► fusion dans main ──► Netlify publie
                 │
                 └──► Netlify : prévisualisation de la PR
```

- **GitHub Actions vérifie** (`.github/workflows/verifier.yml`) : `verifier`
  rejoue `npm run validate && npm run build`, `e2e` les tests de bout en bout.
- **Netlify publie** `main`, par son intégration Git, et rejoue lui aussi
  `npm run validate && npm run build` (`netlify.toml`). Il n'exécute pas les
  tests de bout en bout.
- **Personne ne pousse sur `main`.** On y fusionne une pull request verte.

Pourquoi Netlify publie plutôt que GitHub Actions : `ci-github`, D1.

## Réglage 1 — Netlify relié au dépôt GitHub

Le site a été créé quand le dépôt vivait sur GitLab. À vérifier dans Netlify,
_Site configuration → Build & deploy → Continuous deployment_ :

- dépôt lié : `florian-pussacq/cantine-ecoles-talence` sur GitHub ;
- branche de production : `main` ;
- prévisualisations de déploiement : activées pour les pull requests.

Symptôme d'un lien resté sur GitLab : une fusion dans `main` ne déclenche aucun
déploiement, et le site garde ses anciens menus.

## Réglage 2 — `main` protégée

Dans GitHub, _Settings → Rules → Rulesets_ (ou _Branches → Branch protection
rules_), une règle ciblant `main` :

- pull request obligatoire avant fusion ;
- vérifications exigées : `verifier` et `e2e`, à jour avec `main` ;
- poussée directe et réécriture d'historique interdites.

Sans cette règle, un `e2e` rouge n'empêche rien : Netlify publie tout ce qui
arrive sur `main`.

## L'instant des tests

Les tests de bout en bout ne lisent jamais l'horloge réelle. `e2e/instant.ts`
fixe un instant que la fixture impose au navigateur et que la configuration
Playwright impose au pré-rendu, par `CANTINE_INSTANT` (`ci-github`, D5 et D6).

En local, arrêter tout serveur `preview` déjà lancé avant `npm run test:e2e` :
Playwright le réutiliserait, et un serveur construit sans `CANTINE_INSTANT`
énonce le jour réel.
