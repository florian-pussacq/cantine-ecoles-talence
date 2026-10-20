# La livraison

Ce document décrit le chemin d'un commit jusqu'à la production, et surtout ce qui
ne vit pas dans le dépôt : deux réglages de plateforme sans lesquels rien ne se
publie. Ils ne sont pas versionnables ; ils sont donc écrits ici.

## Le chemin

```
commits sur main, en local ──► vérification locale ──► poussée groupée
                                                            │
                                    Netlify : construction annulée (ignore)
                                                            │
                                    GitHub Actions : verifier + e2e
                                                            │ et rien de plus
                                                            ┊
                         geste humain : Actions → publier → Run workflow
                                                            │ verifier et e2e verts
                                                            ▼ sur la tête de main
                                    build hook ──► Netlify publie
```

- **On travaille sur `main`** (développement sur le tronc). Les commits restent
  en local et partent ensemble.
- **Une poussée ne publie pas.** `netlify.toml` annule toute construction de
  production née d'une poussée ; Netlify n'annule jamais une construction
  déclenchée par un build hook. La CI vérifie, et s'arrête là.
- **Publier est un geste humain** (`deploiement-manuel`). Sur GitHub, ou dans
  son application mobile : _Actions → publier → Run workflow_, depuis `main`.
- **La CI reste la barrière.** Le workflow `publier` n'appelle le hook que si les
  jobs `verifier` et `e2e` ont réussi sur la tête de `main`. Sinon il refuse, et
  son résumé dit pourquoi : vérification rouge, en cours, absente, ou lancement
  depuis une autre branche. Une extraction rouge ne retient pas la publication.
  `node scripts/barriere-publication.js` donne la même réponse depuis un poste,
  sans rien publier.
- **La vérification locale** (`CLAUDE.md`) épargne un cycle de CI rouge ; ce
  n'est plus elle qui garde la production.
- **Le job `extraction`** rejoue l'extracteur sur chaque PDF de `sources/pdf/`
  et exige les menus publiés à l'identique. Il ne retient pas la publication :
  un extracteur cassé n'empêche pas de servir des données déjà commitées
  (`extraction-reproductible`, D5).

Fenêtre connue : entre la lecture de la tête de `main` et la récupération par
Netlify, quelques secondes pendant lesquelles une poussée pourrait passer sans
vérification. Pourquoi on l'accepte : `barriere-de-deploiement`, D2.

## Réglage 1 — Netlify relié au dépôt GitHub

Le site a été créé quand le dépôt vivait sur GitLab. À vérifier dans Netlify,
_Site configuration → Build & deploy → Continuous deployment_ :

- dépôt lié : `florian-pussacq/cantine-ecoles-talence` sur GitHub ;
- branche de production : `main` ;
- prévisualisations de déploiement : activées pour les pull requests.

Symptôme d'un lien resté sur GitLab : une fusion dans `main` ne déclenche aucun
déploiement, et le site garde ses anciens menus.

## Réglage 2 — Le build hook

Sans lui, plus rien ne se publie. Dans Netlify, _Site configuration → Build &
deploy → Build hooks_ : un hook sur la branche `main`. Son URL va dans GitHub,
_Settings → Secrets and variables → Actions_, sous le nom `NETLIFY_BUILD_HOOK`.

L'URL ne sait que déclencher une construction ; c'est pourquoi on l'a préférée à
un jeton Netlify (`barriere-de-deploiement`, D1). Si elle fuit, la remplacer
dans les deux interfaces.

Symptôme d'un hook absent : le workflow `publier` échoue en le nommant.

## La veille des menus

Le workflow `veille` (`.github/workflows/veille.yml`) compare chaque matin les
PDF de menus de la page de la Ville aux données publiées. Il **échoue** quand une
action est requise — un menu nouveau ou republié, un corpus qui couvre moins de
quatorze jours — et son résumé dit quoi faire : la procédure du skill
`menus-talence`. Il reste rouge chaque matin tant que ce n'est pas fait. Il
n'ouvre ni issue ni pull request, et n'écrit rien dans le dépôt
(`veille-des-pdf`, D3).

Deux réglages de GitHub, hors du dépôt, le concernent :

- **La notification.** GitHub prévient par courriel de l'échec d'un workflow
  planifié la personne qui a modifié son `cron` en dernier. Vérifier, dans
  _Settings → Notifications → System → Actions_ du compte, que les échecs sont
  bien notifiés.
- **La désactivation.** Le dépôt est public : GitHub y désactive un workflow
  planifié après 60 jours sans activité, ce qu'un été sans nouveaux menus peut
  atteindre. GitHub prévient par courriel avant. Pour le réactiver : _Actions →
  veille → Enable workflow_.

Symptôme d'une veille désactivée : plus aucune exécution quotidienne dans
l'onglet _Actions_, et des menus qui s'épuisent sans alerte. `npm run veille`
fait le même contrôle à la main.

## L'instant des tests

Les tests de bout en bout ne lisent jamais l'horloge réelle. `e2e/instant.ts`
fixe un instant que la fixture impose au navigateur et que la configuration
Playwright impose au pré-rendu, par `CANTINE_INSTANT` (`ci-github`, D5 et D6).

En local, arrêter tout serveur `preview` déjà lancé avant `npm run test:e2e` :
Playwright le réutiliserait, et un serveur construit sans `CANTINE_INSTANT`
énonce le jour réel.
