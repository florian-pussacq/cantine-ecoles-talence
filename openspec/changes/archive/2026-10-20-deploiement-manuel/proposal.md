## Why

Aujourd'hui, une poussée verte met en ligne d'elle-même : la CI appelle le build hook dès que `verifier` et `e2e` réussissent. Pousser et publier sont donc un seul geste. L'humain veut les séparer : pousser pour faire vérifier, partager, ou faire tourner la veille à un nouvel horaire, sans que la production change ; publier quand il l'a décidé.

## What Changes

- **BREAKING** — La CI ne publie plus. Le job `publier` quitte `verifier.yml`.
- Un workflow `publier`, déclenché à la main seulement (GitHub, _Actions → publier → Run workflow_, y compris depuis l'application mobile), appelle le build hook.
- La barrière reste : le workflow refuse de publier, en disant pourquoi, si les vérifications `verifier` et `e2e` de la tête de `main` ne sont pas en succès — rouges, en cours ou absentes.
- `docs/livraison.md`, le README, `CLAUDE.md` et le skill `menus-talence` disent qu'une poussée ne met plus en ligne.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `delivery` : la publication n'est plus déclenchée par la CI au terme d'une poussée verte, mais par un geste humain, et seulement sur une tête de `main` vérifiée.

## Impact

- `.github/workflows/verifier.yml` : retrait du job `publier`.
- `.github/workflows/publier.yml` : nouveau.
- `docs/livraison.md`, `README.md`, `CLAUDE.md`, `.claude/skills/menus-talence/SKILL.md` : le chemin vers la production.
- Hors du dépôt : rien de nouveau. Le secret `NETLIFY_BUILD_HOOK` et `netlify.toml` restent tels quels.
