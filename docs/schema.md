# Le contrat de données

Ce document s'adresse à qui écrira le producteur de données — aujourd'hui une saisie manuelle, demain le parser PDF en Python.

## Où sont les schémas

| Fichier                     | Décrit                              | Publié sous          |
| --------------------------- | ----------------------------------- | -------------------- |
| `schemas/month.schema.json` | Les menus d'un mois                 | `/data/<AAAA-MM>.json` |
| `schemas/index.schema.json` | Le manifeste des mois disponibles   | `/data/index.json`   |

Ce sont des JSON Schema draft 2020-12, lisibles depuis n'importe quel langage. Les types TypeScript de l'application (`src/lib/data/schema.d.ts`) en sont **dérivés** et jamais l'inverse : `npm run types` les régénère, et `npm run validate` échoue si les deux ont divergé.

Le producteur n'a donc à connaître que les deux fichiers `schemas/`. Il n'a aucune raison de lire le code de l'application.

## Ce que le schéma ne peut pas dire

JSON Schema valide la forme, pas la cohérence. Les règles suivantes viennent du PRD §6.2.5 et doivent être vérifiées par le producteur **avant publication** :

- un jour servi comporte entre 3 et 8 plats ;
- un jour servi comporte au moins un plat de rôle `plat` ;
- un jour non servi ne porte aucun plat ;
- les jours sont strictement croissants en date ;
- `allergenLegend` couvre tous les codes réellement cités dans les plats ;
- les dates ne s'écartent pas de plus d'une semaine du mois annoncé par `month`.

Un jour qui échoue à l'une de ces règles n'est pas retiré : il est publié avec `confidence: "low"`, ce qui déclenche un avertissement dans l'application. **Publier en dégradé plutôt que rien, mais jamais en silence.** Un jour incohérent qui se déclare `high`, lui, fait échouer la validation.

`npm run data` applique ces règles ; `npm run data:index` les applique puis régénère le manifeste.

> **Une règle a été corrigée par les données réelles.** La première rédaction exigeait que toute date appartienne au mois annoncé. Le document de septembre 2026 commence au **lundi 31 août** : la grille est découpée en semaines entières, pas en mois. La règle tolère donc une semaine de débordement de chaque côté. C'est exactement ce que la construction du consommateur avant le producteur était censée révéler.

Les types TypeScript générés perdent au passage quelques contraintes que le schéma exprime — `allergens` y devient `number[]` sans la borne 1–14. La validation à l'exécution, elle, s'appuie sur le schéma et les conserve.

## Les pièges du document source

Documentés au §4 du PRD, constatés sur des extractions réelles. Ils ne sont pas théoriques.

**Le rôle d'un plat ne se déduit pas de sa position.** Certains jours n'ont pas d'entrée, d'autres pas d'accompagnement. Assigner le rôle par rang dans la colonne produit des menus faux et *plausibles*, ce qui est le pire des cas. Le rôle doit venir d'une bande horizontale (coordonnée `y`) et d'heuristiques lexicales.

**La période ne se déduit ni du nom de fichier ni de l'URL.** `Menus-29.06-au-03.07.pdf` est hébergé sous `/2026/02/`. La période se lit dans le contenu.

**Un libellé de plus de 80 caractères est presque toujours une fusion de cellules.** Le schéma le refuse, exprès.

**Le menu de grève n'a pas de dates.** Il est organisé par jour de la semaine — croisé avec deux variantes, repas chauds et repas froids — et relève de son propre contrat, `schemas/greve.schema.json`. Il n'est jamais sélectionné automatiquement, et cette garantie n'est pas une garde ajoutée : `greve.json` n'étant pas inscrit au manifeste, et le chargement n'ouvrant que les mois qui y figurent, la porte n'existe pas. Le service worker le précache néanmoins, comme tout `static/data/`, si bien qu'il reste consultable hors ligne.

**Un jour férié prend la place d'un jour servi.** Sa colonne porte la date, puis `JOUR` et `FÉRIÉ` sur deux lignes, là où seraient les plats. Lu par rang, il donne un plat « JOUR » et un accompagnement « FÉRIÉ ». Le producteur reconnaît la cellule entière et produit un jour `public-holiday` sans plats ; la validation refuse en outre tout jour servi portant l'un de ces deux libellés.

**Un document peut ne pas préciser les allergènes.** Le menu des vacances de la Toussaint 2026 ne code que le gluten du pain. Ses listes vides ne disent alors rien, et `source.allergensDeclared` le dit : faux quand aucun plat hors du pain ne porte de code, absent sinon. L'application ne présente alors aucun plat comme « sans allergène déclaré », et le filtre dit qu'il ne peut rien signaler.

**Un menu de vacances partage son mois avec un mensuel.** La Toussaint et octobre couvrent le même mois ; Noël déborde sur janvier. Un menu de vacances est un fichier de menu ordinaire, nommé `AAAA-MM-vacances.json` d'après son mois majoritaire, avec un `title` repris du document. Le manifeste l'inscrit avec `kind: "vacation"` et son `file`. Une version antérieure de l'application ignore ces entrées : elle ne connaît pas leur nature.

**Le PDF est un export Excel.** Les métadonnées le disent (`Creator: Microsoft® Excel®`), ce qui laisse espérer une géométrie de cellules régulière — bien plus docile qu'une mise en page libre.

## Ce que le producteur ne décide pas

**La famille du plat** — viande, volaille, poisson, végétarien — n'est pas dans le schéma. Elle est déduite du libellé côté application, par une table de mots-clés (design.md, D11). Le document source ne la mentionne nulle part, et la déduire côté client permet d'enrichir la table sans régénérer les données déjà publiées.

**`revision` et `changedAt`** sont déclarés mais réservés. Ils n'ont de sens que face à un pipeline capable de comparer deux exécutions, qui n'existe pas encore.

## Compatibilité

`schemaVersion` vaut `1`. L'application refuse un fichier dont la version dépasse celle qu'elle sait lire, plutôt que d'en interpréter une partie.

Un ajout de champ facultatif ne change pas la version. L'ajout de la nature `public-holiday` non plus, et pour une raison qu'il faut garder vraie : l'application ne lit `kind` que par égalité avec `school`. Une version en cache lit donc un férié comme un jour non servi, ce qui est exact. Le jour où un traitement exhaustif de `kind` apparaît, une nouvelle valeur exigera une nouvelle version. `source.allergensDeclared` est un champ facultatif ajouté : une version qui l'ignore écrit « Aucun allergène déclaré », ce qui reste littéralement vrai. Un retrait, un renommage ou un changement de sens en exigent une nouvelle. Tant qu'il n'existe qu'un seul consommateur, ce coût est proche de zéro : ne pas hésiter à incrémenter plutôt qu'à tordre un champ existant.
