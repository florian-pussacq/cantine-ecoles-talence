## Context

`mode-sombre` a posé deux palettes dans `tokens.css`, la sombre sous `prefers-color-scheme: dark`, sans aucun JavaScript. Son D1 refusait un réglage propre, et notait qu'il s'ajouterait « par-dessus ce changement sans le défaire : un attribut sur la racine, prioritaire sur la requête de média ». C'est ce qui est fait ici.

## Goals / Non-Goals

**Goals:**

- Trois choix : comme l'appareil (défaut), clair, sombre.
- Aucun flash au premier rendu, choix fait ou non, avec ou sans le JavaScript de l'application.
- Aucun octet de plus dans le JavaScript des écrans de menu.

**Non-Goals:**

- La page autonome `static/404.html`, qui suit toujours le système seul : elle n'a pas de script et se voit trop rarement pour en justifier un.
- L'écran de lancement de l'application installée, que le manifeste fixe en clair (mode-sombre, D5).

## Decisions

### D1 — Trois positions, et non un interrupteur

Un interrupteur clair/sombre n'a que deux états, et aucun ne veut dire « comme l'appareil » : le premier geste ferait perdre le défaut sans moyen d'y revenir. Trois boutons radio, natifs, dans le patron des cases des allergènes. « Comme l'appareil » n'est pas une valeur stockée mais l'absence de clé : un appareil revenu au défaut ressemble trait pour trait à un appareil qui n'a jamais choisi.

La palette sombre s'écrit donc deux fois dans `tokens.css` :

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-apparence='clair']) { … }
}
:root[data-apparence='sombre'] { … }
```

Une requête de média et un sélecteur d'attribut ne se combinent pas en une seule règle. `light-dark()` le permettrait avec une seule écriture, mais exige iOS 17.5 : un iPhone plus ancien perdrait toutes ses couleurs, pas seulement le sombre. La copie est la solution sûre ; `contrast.test.ts` exige que les deux blocs déclarent les mêmes jetons avec les mêmes valeurs, et `color-scheme: dark`.

L'attribut s'appelle `data-apparence`, et non `data-theme` : le vocabulaire du dépôt est français, et l'interdiction de `data-theme` reste en place. Les composants restent interdits de l'un comme de l'autre ; la bascule appartient à `tokens.css` seul.

### D2 — Un second script avant la première peinture

Le choix doit être sur la racine avant la feuille de style, faute de quoi chaque ouverture peindrait d'abord la palette du système. `app.html` porte donc un second script en ligne, après les balises `color-scheme` et `theme-color`, qu'il ajuste. Sans choix enregistré, ou si le stockage refuse, il ne fait rien.

Il ne peut rien importer et recopie `appliquerApparence`. `apparence.test.ts` extrait le script de `app.html`, l'exécute sur le document servi, et compare l'état obtenu à celui que laisse `appliquerApparence`, pour chacun des trois choix. Ce n'est pas le texte qui est comparé, c'est l'effet.

### D3 — La barre du navigateur suit le choix, sans recopier de couleur

Les deux `theme-color` gardent leur couleur, et seul leur attribut `media` change : `all` pour la palette choisie, `not all` pour l'autre, et la requête d'origine pour « comme l'appareil ». Chaque balise porte `data-palette` pour être reconnue. La couleur de chaque palette reste écrite une seule fois, là où `contrast.test.ts` la compare déjà à `--fond`. `<meta name="color-scheme">` passe à `light`, `dark` ou `light dark`, pour le canevas peint avant la feuille.

### D4 — Le module n'est chargé que par l'écran des réglages

La coque n'a pas besoin de connaître le choix : le script l'a déjà peint. `apparence.svelte.ts` n'est importé que par `/reglages`, qui l'hydrate. Le JavaScript de l'écran du jour, le plus lourd, ne change pas.

## Risks / Trade-offs

- [Copie de la palette] Une valeur corrigée dans un seul bloc → le test d'identité échoue et nomme le jeton.
- [Copie du script] Une évolution de `appliquerApparence` non reportée dans `app.html` → le test de parité échoue.
- [Stockage bloqué] Le choix vaut pour l'onglet seulement ; un bandeau le dit, comme pour les allergènes.
- [Service worker] Les documents servis hors ligne contiennent le script : le choix s'applique hors ligne.
