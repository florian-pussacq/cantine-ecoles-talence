## Why

Deux finitions restent au backlog.

**Le week-end n'a pas de mention propre.** Un samedi, l'écran du jour présente lundi avec « Prochain service · dans 2 jours ». C'est juste, mais générique, alors que le férié se nomme (« Férié · service demain ») et les vacances aussi (« Vacances · dans 2 jours »). Le backlog proposait de lire le champ `skipped` de la cible résolue, comme pour le férié. Or les données ne contiennent aucun jour de week-end : 127 jours servis et 3 fériés au 18 octobre. Le samedi, `skipped` vaut donc `null`, et c'est au résolveur de reconnaître le week-end.

**La page 404 a une autre identité.** `static/404.html` a gardé l'ardoise : fond bleu pétrole, ou noir en sombre, et ses propres couleurs. C'est la seule page qui ne ressemble pas à l'application.

## What Changes

- Le résolveur pose `skipped: 'weekend'` quand le jour courant, absent des données, est un samedi ou un dimanche à Paris.
- La mention en tient compte : « Week-end · service demain », « Week-end · service dans 2 jours ». Les vacances gardent la priorité, comme aujourd'hui.
- Le commentaire de `targetEyebrow`, faux depuis `menus-vacances`, est corrigé.
- La page 404 reprend la palette de l'application, claire et sombre, toujours sans JavaScript ni feuille externe ; ses couleurs sont liées aux jetons par un test.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `menu-browsing` : le week-end se nomme dans la mention.
- `design-tokens` : la page autonome reprend les valeurs des jetons, vérifiées.

## Impact

- `src/lib/data/resolve.ts`, `src/lib/menu/labels.ts` et leurs tests ; un e2e un samedi.
- `static/404.html` ; `src/lib/design/contrast.test.ts` (la garde).
- Aucune donnée ni dépendance ; le JavaScript ne bouge pas de façon mesurable.
