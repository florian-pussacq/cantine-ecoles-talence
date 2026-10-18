## Contexte

`ci-github` (D1 et sa révision) avait écarté la publication par la CI faute de PR, et laissé la CI constater après coup. Le build hook était consigné au backlog comme le moyen de rétablir une barrière sans PR.

Deux faits Netlify, relevés le 18 octobre 2026 (documentation inaccessible depuis l'environnement de développement ; recoupés par la recherche) :

- la commande `ignore` annule la construction quand elle sort avec le code 0 ;
- elle n'annule jamais une construction déclenchée par un build hook, quel que soit son code de sortie.

## Décisions

### D1 — Annuler les poussées, laisser passer le hook

`[build] ignore = '[ "$CONTEXT" = "production" ]'` sort à 0 en production, donc toute construction de production née d'une poussée est annulée. Le hook, lui, n'est jamais annulé. Les prévisualisations (`deploy-preview`) ne sont pas concernées.

**Écarté :** publier depuis la CI avec `netlify deploy --prod`. Il faudrait un jeton Netlify à pleins droits dans les secrets, et la CLI Netlify dans la CI. Une URL de hook ne sait que déclencher une construction : c'est le secret le moins dangereux possible.

**Écarté :** verrouiller les déploiements dans l'interface Netlify. Le verrou bloquerait aussi le hook, et il ne vivrait pas dans le dépôt.

### D2 — Ne publier que si le commit vérifié est encore la tête

Un hook construit la tête de la branche au moment de l'appel, pas un commit désigné. `publier` compare donc `github.sha` à la tête de `main` lue par `git ls-remote`. Si elles diffèrent, une poussée plus récente est en route : il s'abstient, et le passage suivant publiera. Le groupe de concurrence existant annule d'ailleurs l'exécution périmée.

Reste une fenêtre de quelques secondes, entre la lecture de la tête et la récupération par Netlify. Elle est connue et assumée : la refermer exigerait la CLI et le jeton écartés en D1.

### D3 — Un secret absent fait échouer `publier`

Sans `NETLIFY_BUILD_HOOK`, `publier` échoue en le nommant. Un échec silencieux laisserait le site figé sans que personne le sache, comme le 16 octobre.
