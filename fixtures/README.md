# Corpus de test

## Les cas limites

`edge-cases.json` est un mois **synthétique**, daté en 2099 pour qu'aucun doute ne subsiste. Il porte les situations que les données réelles ne contiennent pas toujours, et que l'application doit pourtant traiter :

- un jour sans entrée, et un autre sans accompagnement — la grille ne se referme pas (design.md, D12) ;
- un jour `confidence: "low"` — le chemin de rendu dégradé doit exister avant que le parser ne produise le premier ;
- un jour de vacances et un jour de week-end, sans plats ;
- un jour férié entre deux jours servis, que la navigation doit enjamber ;
- un plat dont la famille n'est déductible d'aucun mot-clé — le repli neutre (D11) ;
- un plat sans allergène déclaré, qui n'est pas un plat sans allergène ;
- un libellé long, proche de la borne des 80 caractères que le schéma refuse.

`sans-allergenes.json` est un second mois synthétique, en février 2099 : un document qui ne précise pas les allergènes de ses plats, hormis le gluten du pain — la forme du menu de la Toussaint 2026 (allergenes-non-communiques). Des lasagnes et un fromage blanc sans code, qui ne doivent jamais se lire « sans allergène ».

Ces fichiers ne sont pas publié sous `static/data/` : ils ne doivent jamais atteindre un utilisateur.
