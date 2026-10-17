## Contexte

Trois faits, lus dans le code :

- Le pré-rendu résout le jour à afficher avec l'heure du build (`horloge.svelte.ts`).
- Le service worker range les pages pré-rendues dans le cache de la coque, servi en cache d'abord et jamais revalidé ; il n'en change qu'avec une nouvelle version, qui attend l'accord de l'utilisateur.
- La `version` du build n'est pas fixée : chaque build en crée une.

Le HTML servi a donc l'âge de la version installée, sans borne.

## Décisions

### D1 — Un script avant la peinture, malgré D32

D32 a refusé un script bloquant pour la pastille d'allergènes : « payer, sur chaque ouverture et pour tous, le confort d'éviter une apparition tardive », pour un défaut « visible mais inoffensif ». L'arbitrage était juste, et il est le bon critère ici. Ce qui est en jeu n'est pas une apparition tardive mais un menu faux sous la mention « Aujourd'hui ». Ce n'est pas inoffensif.

Le prix est connu : trois lignes exécutées à chaque ouverture, quelques microsecondes, sans dépendance ni requête.

**Écarté — la reconstruction quotidienne.** Sans effet sur l'application installée, et un bandeau de mise à jour chaque jour.

**Écarté — une page par jour publié.** Elle exige un routage par date, alourdit le précache d'un facteur vingt, et il faut encore un script pour choisir la bonne page avant la peinture. Le même script, plus du reste.

**Écarté — accepter le flash.** C'est le statu quo, et c'est ce que ce changement refuse.

### D2 — Comparer des jours civils de Paris, rien d'autre

Le rendu ne dépend de l'instant que par le jour civil de Paris (`parisDate`, D7 de `menus-jour-semaine`) : deux instants du même jour à Paris produisent le même écran. Le script compare donc deux chaînes `AAAA-MM-JJ`, la sienne calculée par `Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris' })`, comme `parisDate`.

Le jour du rendu est posé par le hook serveur, en attribut de `<html>` (`data-jour-rendu`), à partir du même instant que le rendu lui-même. Une seule source : si `CANTINE_INSTANT` fixe le rendu, il fixe aussi l'attribut.

### D3 — Masquer en gardant la place, révéler à l'hydratation

Une page périmée reçoit `data-perime` sur `<html>`. La règle CSS `html[data-perime]:not([data-hydrate]) .selon-le-jour { visibility: hidden }` masque la zone sans la retirer du flux : rien ne bouge autour d'elle. Le marqueur `data-hydrate`, posé par la coque à son montage (D7 de `ci-github`), la révèle — à ce moment, l'écran énonce le bon jour.

Seuls les écrans dont le contenu dépend du jour portent `.selon-le-jour` : le jour et la semaine. La classe est posée une fois, par la coque, sur un conteneur `display: contents` autour du contenu d'écran, sous la même condition que les onglets (`montrerOnglets`) : une seule source pour « écran de menu », et aucun écran ne peut l'oublier. L'enseigne, les onglets et le pied ne dépendent pas du jour et restent peints.

### D4 — Si l'hydratation n'arrive pas, la zone revient

Un JavaScript qui échoue laisserait la zone masquée pour toujours : un écran vide, sans explication. C'est pire que le défaut corrigé, parce que l'écran pré-rendu nomme au moins le jour qu'il montre (« Mercredi 2 septembre »), même si sa mention est fausse.

Une animation CSS rend donc la zone visible après trois secondes, quoi qu'il arrive. Trois secondes couvrent largement une hydratation depuis le cache, de l'ordre de la centaine de millisecondes.

Sans JavaScript du tout, le script ne s'exécute pas, `data-perime` n'est jamais posé et la page se peint comme aujourd'hui.

### D5 — Le cas se teste à dessein

`CANTINE_INSTANT` fixe le pré-rendu ; la fixture fixe le navigateur. Un test qui installe une horloge à un autre jour obtient une page périmée, sans rien simuler. En bloquant le JavaScript de l'application, il peut aussi constater la zone masquée, puis sa réapparition au délai.
