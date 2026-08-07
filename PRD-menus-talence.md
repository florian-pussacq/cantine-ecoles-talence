# PRD — Menus des écoles de Talence

**Statut :** brouillon v0.1, à valider
**Date :** 07/08/2026
**Auteur :** rédigé avec Claude, à amender

---

## 0. Avertissement préalable : ce projet a déjà un concurrent officiel

Avant tout : la Ville de Talence met déjà à disposition une app gratuite, **« Qui Dit Miam »** (éditeur Zolivem, iOS + Android), qui fait *exactement* ce que tu décris : un menu par jour, allergènes filtrables par profil enfant, provenance, labels, suggestions de menu du soir, et — point important — **notification push en cas de changement de dernière minute dans la journée**.

**Différenciation retenue** (l'app officielle est jugée obsolète et peu pratique sur Android) : **vitesse, ergonomie, zéro compte, zéro tracking, offline, web installable** — pas de store à traverser, pas d'app abandonnée par son éditeur.

C'est un axe défendable, mais il impose une discipline : si ta version est aussi lente à ouvrir ou aussi confuse que la leur, le projet n'a pas de raison d'être. Les budgets du §8 ne sont donc pas décoratifs, ce sont *la* spécification.

Le reste du PRD suppose le scénario pessimiste : **PDF comme seule source**. C'est le scénario le plus coûteux, donc le bon à spécifier. Voir §4bis pour les deux autres pistes de source, dont une qui peut supprimer le parser purement et simplement.

---

## 1. Problème et proposition de valeur

**Problème.** Savoir ce que mange son enfant à la cantine demande aujourd'hui d'ouvrir une page web municipale, trouver le bon PDF parmi 9, le télécharger (4,3 Mo), zoomer sur une grille A3 illisible en mobile, et croiser mentalement des codes allergènes numériques avec la légende en bas de page. Le tout en refaisant l'opération chaque jour parce que le PDF n'est pas mémorisable.

**Proposition.** Ouvrir l'app → **le menu du jour est là, en moins de 300 ms, même sans réseau**, lisible sans zoom, avec les allergènes de *mon* enfant surlignés en clair. Tout le reste (semaine, mois, recherche) est secondaire.

**Anti-proposition.** Ce n'est pas une app de nutrition, pas un réseau social de parents, pas un tracker. Si une fonctionnalité ne sert pas « je veux savoir ce qu'il mange », elle passe la barre ou elle dégage.

---

## 2. Utilisateurs et Jobs To Be Done

| Persona | JTBD | Fréquence | Écran cible |
|---|---|---|---|
| Parent pressé (toi) | « C'est quoi ce midi ? » le matin en préparant le cartable | 1×/jour ouvré | Aujourd'hui |
| Parent organisateur | « Je fais quoi à dîner ce soir / cette semaine ? » | 1–2×/semaine | Semaine |
| Parent d'enfant allergique | « Est-ce qu'il y a un truc qu'il ne peut pas manger jeudi ? » | quotidien, anxiogène | Aujourd'hui + profil |
| Enfant | « Y'a des frites quand ? » | aléatoire | Semaine / recherche |
| Toi, mainteneur | « Est-ce que le parser a cassé ce matin ? » | 1×/jour, passif | Alerte, pas d'UI |

Le dernier persona est le plus important pour la survie du projet à 12 mois. Cf. §9.

---

## 3. Périmètre

### V1 (must)
- Vue **Aujourd'hui** (jour ouvré courant ; si week-end/vacances → prochain jour servi).
- Vue **Semaine** (5 jours, scroll horizontal ou vertical compact).
- Vue **Mois** (grille condensée, lecture rapide « le repas que je préfère est quand »).
- **Profil allergènes** local (multi-enfants), mise en évidence dans les plats.
- **Offline complet** (PWA, données en cache, installable).
- Détection et **affichage de la date de mise à jour** de la source + badge « menu modifié » sur les jours changés.
- Mode **grève** consultable (le PDF grève est générique, sans dates).
- Lien vers le PDF original (traçabilité, et c'est la source officielle en cas de litige).

### V1.1 (should)
- Calendrier scolaire zone A → masquer/marquer vacances et fériés (API officielle `data.education.gouv.fr`).
- Variante **sans porc** (le PDF mentionne explicitement la substitution : « œufs mayonnaise »).
- Page **origine des viandes** (PDF dédié, mensuel-ish).
- Flux **iCal (webcal)** : abonnement calendrier, menu du jour en événement journée entière. Coût ~50 lignes, valeur réelle pour ceux qui vivent dans leur agenda.
- **Partage** de la semaine (image ou lien profond).

### V2 (could)
- Notifications (cf. §7.4 — c'est là que l'architecture gratuite casse).
- Recherche plein texte (« quand y'a-t-il du poisson pané ? »).
- Menus des centres de loisirs / CME (menus événementiels type Conseil Municipal des Enfants).

### Hors périmètre — assumé
- **Comptes utilisateurs.** Jamais. Zéro donnée serveur = zéro RGPD, zéro question de souveraineté, zéro coût.
- **Suggestions de menu du soir générées.** L'app officielle le fait avec une diététicienne. Sans compétence nutritionnelle, produire « ce soir : légumes + poisson » à partir de règles bidon, c'est précisément du slop. Soit tu trouves une source sérieuse (GEMRCN), soit tu ne le fais pas.
- **Notation / avis / commentaires des plats.** Amusant 3 jours, modération à vie.
- **Statistiques « % bio ce mois-ci »**. Personne ne rouvre ça deux fois.
- Autres communes. Le parser est couplé au gabarit Talence ; généraliser maintenant = abstraction prématurée sur un seul cas.

---

## 4. Analyse de la source (fait, pas supposé)

Page source : `https://www.talence.fr/quotidien/enfance-scolarite/menu-ecoles/`

Documents constatés au 07/08/2026 :

| Type | Exemple | Cadence | Utilité |
|---|---|---|---|
| Menu mensuel | `06-MENUS-WEB-JUIN-2026.pdf` (4,3 Mo) | 1/mois, publiés en avance (jusqu'à oct. 2026 en ligne) | **cœur** |
| Menu de transition inter-mois | `Menus-29.06-au-03.07.pdf` | irrégulier | important, chevauche 2 mois |
| Menu grève | `00-MENUS-WEB-GREVES.pdf` | statique depuis 2023 | fallback, **sans dates** |
| Menu événementiel | `MENUS-CME.pdf` (11 juin) | ponctuel | enrichissement d'un jour |
| Origine des viandes | `Affichage-Origine-Viande_130525.pdf` | ~mensuel | annexe |

### Structure d'un menu mensuel
- Grille : 4–5 semaines × 5 jours (lun–ven), en-têtes `SEMAINE DU 1 JUIN AU 5 JUIN`.
- Chaque jour = une pile de lignes sémantiques, **dans cet ordre mais pas toujours toutes présentes** :
  `pain` → `entrée` → `plat` → `accompagnement` → `laitage/fromage` → `dessert` → `goûter`.
- Allergènes suffixés en clair : `Paupiette de veau au jus 1+6+9`, légende 1–14 en pied de page.
- Marqueurs qualité inline : `Bio`, `Label Rouge`, et légende VBF/VPF/VF/PF/AB/BBC/IGP/MSC.
- Encart éditorial `ZOOM SUR : …` (ex. menu à thème Disney du 25/06) → à afficher en note du jour.
- Astérisque régime sans porc + mentions légales (« susceptibles de modification selon les arrivages »).
- **`Menus mis à jour le 03 juin 2026`** ← la clé de la fraîcheur.

### Pièges identifiés (extraits d'une extraction réelle)
1. **L'ordre de lecture du PDF ne respecte pas la grille.** L'extraction texte brute donne des lignes concaténées horizontalement et les blocs de légende à la fin, dans le désordre. Un parser naïf ligne-par-ligne produira des menus faux et *plausibles* — le pire des cas.
2. **Les cellules vides décalent tout.** Le 15/06 n'a pas d'entrée, le 05/06 pas d'accompagnement. Impossible d'assigner le rôle par index dans la colonne : il faut assigner **par bande horizontale (coordonnée y)**, pas par rang.
3. **Le PDF grève contient deux tableaux** (repas chauds / repas froids) sans dates → modèle de données distinct (par jour de semaine, pas par date).
4. **Le fichier de transition** couvre des jours déjà (ou pas) présents dans les mensuels → il faut une règle de priorité déterministe.
5. Le chemin d'upload WordPress n'est pas fiable comme identifiant (`Menus-29.06-au-03.07.pdf` est dans `/2026/02/`). **Ne jamais déduire la période du nom de fichier ou de l'URL** : la déduire du contenu.

---

## 4bis. Sources alternatives au PDF (investigué)

### A. Open data Bordeaux Métropole — **la bonne réponse à long terme**
Le DataHub de Bordeaux Métropole héberge déjà un jeu de données **`met_menu_cantine`** (« Menu des cantines sur le territoire de Bordeaux Métropole »), au **standard national SCDL « Menus des cantines »** (schema.data.gouv.fr). Aujourd'hui **seule Bègles y publie ses menus**.

Or **Talence fait partie des six communes pilotes** de cette plateforme open data depuis 2019. Autrement dit : le tuyau existe, le standard existe, le portail existe, il manque juste que Talence y déverse ses menus.

**Action recommandée, coût = un mail :** écrire au service restauration municipale (05 56 80 73 96) et au référent open data de la ville, en demandant la publication des menus au format SCDL sur le DataHub, à l'exemple de Bègles. Arguments à mettre en avant : c'est déjà produit par leur logiciel de gestion (l'export existe probablement), ça sert leur propre app officielle, ça bénéficie à toutes les familles, et ça coûte moins cher que de maintenir un PDF de 4 Mo.

Si ça aboutit : le parser PDF disparaît, la fraîcheur devient réelle, et le problème est résolu pour tout le monde et durablement. C'est la seule action du projet dont la valeur survit à ton désintérêt. À lancer **dès maintenant**, en parallèle du dev — le délai administratif est de plusieurs mois, pas de plusieurs jours.

L'API Opendatasoft du DataHub est par ailleurs interrogeable en HTTP/JSON, hébergée par un acteur français. Elle deviendrait la source primaire, le PDF restant le fallback.

### B. API privée QuiDitMiam / MyMenus — **à ne pas fonder dessus**
Éditeur : Zolivem, backend sur `mymenus.fr`. **Aucune API publique documentée** : le site est purement commercial (offre B2B pour collectivités, admin web, notifications, IA anti-gaspi). Il existe forcément une API REST privée consommée par les apps mobiles, mais :

- pour la trouver il faut décompiler l'APK (`jadx` sur `fr.zolivem.QuiDitMiamGenerique`, chercher les URLs de base) ou intercepter le trafic (mitmproxy + certificat, si pas de pinning) ;
- c'est un contrat privé sans engagement : elle peut changer ou exiger une clé du jour au lendemain ;
- s'appuyer dessus sans autorisation est juridiquement gris, contrairement à la réutilisation d'information publique du PDF ;
- l'app étant manifestement peu maintenue, l'API l'est probablement autant.

**Verdict :** une heure de spike par curiosité, éventuellement pour comprendre le modèle de données qu'ils utilisent. Jamais comme source de production. Le PDF, lui, est une information publique dont la réutilisation est un droit.

---

## 5. Modèle de données

Un fichier JSON par mois, versionné. Format volontairement plat et bête à consommer.

```jsonc
{
  "schemaVersion": 1,
  "month": "2026-06",
  "source": {
    "pdfUrl": "https://www.talence.fr/wp-content/uploads/2026/06/06-MENUS-WEB-JUIN-2026.pdf",
    "pdfSha256": "…",
    "updatedLabel": "Menus mis à jour le 03 juin 2026",
    "updatedAt": "2026-06-03",          // parsé, null si absent
    "fetchedAt": "2026-08-07T03:12:07Z",
    "parserVersion": "1.4.2"
  },
  "allergenLegend": { "1": "Gluten", "7": "Lait", "…": "…" },
  "days": [
    {
      "date": "2026-06-25",
      "kind": "school",                  // school | holiday | weekend | strike-fallback
      "theme": "Disney",                 // depuis "ZOOM SUR", nullable
      "note": "Menu à thème…",
      "revision": 2,                     // incrémenté à chaque changement détecté
      "changedAt": "2026-06-18",
      "courses": [
        {
          "slot": "plat",
          "label": "Gumbo de Tiana",
          "allergens": [1, 7, 9],
          "flags": ["bio"],              // bio | label-rouge | vbf | vpf | msc | ue-subventionne
          "porkFree": null               // texte de substitution si applicable
        }
      ],
      "confidence": "high"               // high | low → pilote l'affichage d'un avertissement
    }
  ]
}
```

Fichiers publiés :
- `/data/index.json` — manifeste : liste des mois disponibles + `contentHash` de chacun + `generatedAt`. C'est le **seul** fichier que le client re-télécharge systématiquement (~1 Ko).
- `/data/2026-06.json` — ~20–30 Ko brut, ~5 Ko gzip. Immutable par `contentHash` dans le nom ou via `ETag`.
- `/data/strike.json` — menu grève.
- `/data/meat-origin.json` — origine des viandes.

**Ordre de résolution d'un jour** (déterministe, testé) : menu événementiel (CME) > menu de transition > menu mensuel. Le mode grève est un *toggle utilisateur*, jamais automatique (l'app ne peut pas savoir qu'il y a grève).

**Volume total :** une année scolaire complète ≈ 250 Ko de JSON. Ça change tout : **tu n'as pas besoin de base de données.** Un « stockage » ici, c'est un dossier de fichiers statiques. Toute solution qui commence par « on met un Postgres » est sur-dimensionnée d'un facteur 1000.

---

## 6. Architecture

```
                       1×/jour, 03:00 Europe/Paris
  talence.fr  ──GET──►  Job d'ingestion  ──►  JSON versionnés (git)  ──►  Hébergement statique FR
   (HTML+PDF)           (fetch/parse/diff)         (audit trail)              (PWA + /data/*.json)
                              │                                                      │
                              └──► alerte (mail) si échec/anomalie          Client PWA (cache-first)
```

### 6.1 Ingestion (job quotidien)
1. `GET` la page HTML → extraire la liste des liens PDF (sélecteur sur le bloc « LES MENUS DES ÉCOLES »).
2. Pour chaque PDF : `HEAD` puis `GET` conditionnel (`If-None-Match` / `If-Modified-Since`). Si 304 → skip. **C'est ça qui rend le job poli et quasi gratuit en bande passante.**
3. Si changé : hash SHA-256, parse, produire le JSON candidat.
4. **Diff** contre le JSON précédent → si différences : incrémenter `revision`, poser `changedAt`, lever une notif mainteneur avec le diff lisible.
5. Écrire, régénérer `index.json`, publier.

Toute la chaîne doit être **idempotente et rejouable** : conserver les PDF bruts (4 Mo × 12 = 50 Mo/an, à élaguer ou stocker hors du plan gratuit) permet de rejouer le parser après correction sans dépendre du site source. Sinon, conserver au minimum le texte+coordonnées extraits (quelques dizaines de Ko).

### 6.2 Parsing — la vraie difficulté du projet
Ce n'est **pas** un problème d'extraction de texte, c'est un problème de **reconstruction de grille**. Approche recommandée :

1. Extraire les mots avec leurs boîtes englobantes (`pdfplumber.extract_words()` en Python, ou `pdf.js` / `pdfjs-dist` avec `getTextContent()` et les transforms en TS).
2. Détecter les **colonnes** par clustering des `x` sur les en-têtes `LUNDI…VENDREDI`, et les **bandes de semaine** par les en-têtes `SEMAINE DU … AU …`.
3. Dans chaque cellule (semaine × jour), regrouper les mots en lignes par clustering des `y`, puis assigner le `slot` par **position relative dans la cellule + heuristiques lexicales** (`PAIN` = pain, `Goûter :` = goûter, fromage/yaourt/petit-suisse = laitage, etc.).
4. Post-traitement : extraire le suffixe allergènes `\d+(\+\d+)*`, les flags (`Bio`, `Label Rouge`), normaliser la casse.
5. **Validation** avant publication (un menu faux et plausible est pire qu'une erreur visible) :
   - chaque jour ouvré du mois est présent, sauf vacances scolaires ;
   - 3 ≤ nombre de plats/jour ≤ 8 ;
   - au moins un `plat` par jour ;
   - allergènes ∈ [1,14] ;
   - aucun libellé > 80 caractères (signe de fusion de cellules) ;
   - `updatedAt` parsé.
   Si un jour échoue → `confidence: "low"` + bannière « données incertaines, voir le PDF » + alerte mainteneur. **Publier quand même en dégradé plutôt que rien**, mais jamais silencieusement.

### 6.3 Hébergement — la contrainte « gratuit + France »
Deux remarques de fond avant les options :

- **La contrainte de localisation est plus idéologique que juridique** ici : le contenu est une donnée publique sans aucune donnée personnelle. Le RGPD ne s'applique pas au JSON des menus. Elle reste parfaitement légitime (souveraineté, cohérence, empreinte), simplement il faut savoir qu'elle te coûte des options (Cloudflare Pages/Workers, Netlify, Vercel, GitHub Pages sortent tous).
- Le seul endroit où la localisation compterait *vraiment*, c'est les données utilisateur (profil allergènes, tokens push). Solution : **il n'y en a pas côté serveur**. Le profil vit en `localStorage`. Le problème disparaît par conception.

| Option | Localisation | Gratuité | Verdict |
|---|---|---|---|
| **alwaysdata — Cloud public 100 Mo** | France (Paris), société française | Gratuit, permanent, **usage non lucratif uniquement** | **Recommandé.** 100 Mo largement suffisant, tâches planifiées (cron) incluses, Python/Node, SSL Let's Encrypt auto. Le job d'ingestion *et* l'hébergement statique tiennent dedans. |
| Scaleway Object Storage `fr-par` | France | Le « 75 Go gratuit » a évolué vers un essai 3 mois — **ne plus considérer comme gratuit à vie** | À écarter sauf vérification récente de ta part |
| OVHcloud / Clever Cloud | France | Pas de palier gratuit | Écarté |
| Cloudflare Pages + R2 | Global | Très généreux | Écarté par ta contrainte (mais imbattable techniquement — à reconsidérer si tu assouplis) |
| Raspberry Pi chez toi | France, littéralement | Coût électrique | Sérieux pour un projet perso, mais dispo/IP dynamique/TLS à gérer |

**Décision (arbitrage validé : 0 € strict, stockage en France, calcul hors France toléré) :**

- **Stockage + hébergement du site : alwaysdata, plan Cloud public gratuit 100 Mo, Paris.** Contrainte à accepter : usage non lucratif, donc jamais de pub ni de monétisation.
- **Calcul (fetch + parse + diff) : GitHub Actions**, cron quotidien. Runners hors France, mais ils ne manipulent que de la donnée publique et ne stockent rien de façon pérenne. Bénéfices : gratuit, logs, historique, secrets gérés, rejouable à la main.
- **Publication : `rsync`/SSH ou l'API alwaysdata** depuis le job. Le dépôt Git conserve le code **et l'historique des JSON générés** — c'est ton audit trail et ton meilleur outil de debug de régression de parser.
- Le cron alwaysdata reste en réserve : c'est le plan B si tu veux rapatrier le calcul, sans changer d'architecture.

Conséquence à assumer : GitHub Actions coupe les workflows planifiés d'un dépôt public inactif au bout de 60 jours. Il faut soit un commit périodique (le job en produit naturellement), soit un déclencheur externe.

### 6.4 Notifications — pourquoi je te déconseille de les faire en V1
La Web Push API impose de passer par un service de push tiers (FCM pour Chrome/Android, Mozilla, APNs pour iOS/Safari). Donc : hors de France, nécessite un serveur qui garde les abonnements (= donnée à caractère personnel, = RGPD, = ta contrainte de localisation revient par la fenêtre), et sur iOS ça ne marche que si l'utilisateur a **installé la PWA sur son écran d'accueil**.

Le coût/bénéfice est mauvais : une notification quotidienne « voici le menu » est du bruit qu'on désactive en 3 jours. La seule notif de valeur est « **le menu de demain a changé** », donc rare, donc peu perceptible.

Alternative V1, à coût quasi nul : au lancement de l'app, si `revision` a bougé sur un jour futur, afficher un badge discret « modifié le X ». Et proposer le **flux iCal** à ceux qui veulent que ça arrive à eux plutôt que l'inverse.

---

## 7. Expérience et design

### 7.1 Principes
Mobile-first, mais surtout **une seule chose par écran**. La contrainte forte : l'écran d'accueil doit être compréhensible d'un coup d'œil à bout de bras, à 7h30, en tenant un bol de céréales.

Direction contre le « slop » (= ce que produit un LLM laissé seul : dégradés violets, cards arrondies 2xl, emojis en puces, icônes Lucide partout, ombres portées molles) :
- **Une** couleur d'accent, dérivée de rien de générique. Le reste en neutres chauds.
- Hiérarchie **typographique**, pas décorative : la taille et le poids portent la structure. Une famille variable bien choisie, ou la pile système (`-apple-system`/`Inter`) assumée.
- Pas de cartes empilées : la journée est une **liste verticale** avec des repères de rôle discrets (petites capitales : ENTRÉE, PLAT, DESSERT). Ça ressemble à un menu de restaurant, pas à un dashboard.
- **Zéro skeleton, zéro spinner.** Les données sont en cache : elles s'affichent, point. Un shimmer sur des données instantanées, c'est du théâtre.
- Emojis : uniquement s'ils portent une information (allergène, thème du jour), jamais en décoration.
- Mode sombre via `prefers-color-scheme`, pas de toggle en V1.
- `prefers-reduced-motion` respecté. Transitions ≤ 200 ms, uniquement pour la continuité spatiale (swipe entre jours).

### 7.2 Écrans
1. **Aujourd'hui** — date, thème éventuel, la liste des plats, allergènes du profil surlignés. Swipe horizontal = jour précédent/suivant. Un tap sur un plat = détail allergènes en clair.
2. **Semaine** — 5 colonnes compactes en scroll horizontal snap, ou 5 blocs verticaux. À arbitrer sur maquette : le scroll horizontal est élégant mais cache de l'information.
3. **Mois** — grille dense, un plat principal par case, tap → jour.
4. **Profil** — sélection allergènes (14 cases, libellés clairs), option sans porc, multi-enfants (nom + jeu d'allergènes). 100 % local.
5. **À propos** — source, date de mise à jour, lien PDF officiel, disclaimer, lien vers l'app officielle (honnêteté, et ça te protège).

### 7.3 États limites (souvent oubliés, souvent visibles)
Week-end · vacances scolaires · jour férié · mois non encore publié · échec de parsing sur un jour · première ouverture hors ligne · menu modifié depuis la dernière visite · dernier jour de l'année scolaire.

### 7.4 Accessibilité
Cible **RGAA / WCAG 2.1 AA** — c'est un service qui rediffuse une donnée publique municipale, il serait ironique qu'il soit moins accessible que le PDF (qui l'est déjà mal). Contraste ≥ 4.5:1, cibles tactiles ≥ 44 px, navigation clavier, `lang="fr"`, l'information allergène **jamais portée uniquement par la couleur**.

---

## 8. Exigences non fonctionnelles

- **Perf** : LCP < 1 s en 4G sur un mid-range Android ; interaction jour→jour < 100 ms ; bundle JS < 60 Ko gzip ; poids total premier chargement < 150 Ko. Ces chiffres sont atteignables sans framework lourd — c'est un lecteur de JSON, pas une SPA d'entreprise.
- **Offline** : service worker, stratégie *stale-while-revalidate* sur `/data/*`, *cache-first* sur l'app shell. L'app doit être 100 % fonctionnelle après une première visite.
- **Fraîcheur** : au plus 24 h de retard sur la source, `updatedAt` affiché.
- **Disponibilité** : dégradation gracieuse — si le job casse, l'app continue de servir les dernières données valides. Jamais d'écran blanc parce qu'un PDF a changé de gabarit.
- **Zéro tracking**, zéro cookie, zéro CDN tiers, zéro Google Font. Ça se dit en une ligne dans l'à-propos et c'est un argument réel face à l'app officielle.

---

## 9. Observabilité (section non négociable)

Le mode de mort de ce projet est connu d'avance : **en septembre 2027, la mairie change de gabarit PDF, le parser sort silencieusement des données fausses, et personne ne s'en rend compte pendant trois semaines.**

Donc :
- Le job d'ingestion **envoie un mail au mainteneur** en cas d'échec, d'anomalie de validation, ou de diff inattendu. alwaysdata envoie déjà les rapports d'erreur des tâches planifiées.
- Un **heartbeat** : si `index.json.generatedAt` a plus de 48 h, l'app affiche un bandeau discret et toi tu reçois une alerte (dead man's switch type healthchecks.io, ou simple check maison).
- Le **diff lisible** entre deux exécutions est le meilleur outil de debug : garder les JSON en Git le donne gratuitement.
- Un **rapport de parsing** par exécution : nb de jours extraits, nb en `confidence: low`, règles de validation échouées.

---

## 10. Qualité et tests (tu es craftsman, donc)

- **Frontière claire** : `PdfMenuParser` ne connaît ni HTTP, ni système de fichiers, ni horloge. Il prend des octets, il rend un `MonthMenu` ou une liste d'erreurs. C'est le seul endroit qui mérite un vrai effort de conception.
- **Golden tests** : les PDF réels de chaque mois publié depuis 2023 (récupérables via l'historique du site / Wayback) en fixtures, avec le JSON attendu commité. Toute évolution du parser rejoue tout le corpus. C'est ce qui te permettra de refactorer sans peur.
- **Property-based** sur les invariants (allergènes ∈ 1..14, dates dans le mois, slots ordonnés).
- **Tests de contrat** sur le schéma JSON publié (le client et le job partagent le schéma, versionné par `schemaVersion`).
- **Test de non-régression sur la source** : un test « canari » lancé par le cron qui vérifie que la page HTML contient toujours le bloc attendu et que le gabarit PDF a la bonne signature structurelle.
- Le front n'a besoin que de tests de rendu sur les états limites du §7.3 et d'un test e2e du parcours « ouvrir → voir aujourd'hui → hors ligne → toujours visible ».

---

## 11. Juridique et éthique

- Les menus sont des **informations publiques** produites par une collectivité ; leur réutilisation, y compris commerciale, est libre sous réserve de ne pas les dénaturer et d'indiquer la source et la date de dernière mise à jour (CRPA, art. L321-1 et suivants). **Affiche la source et la date** — c'est à la fois une obligation et une bonne UX.
- **Scraping poli** : 1 requête/jour, `User-Agent` identifiable avec une adresse de contact, requêtes conditionnelles, respect de `robots.txt`. Idéalement, **préviens le service restauration** (05 56 80 73 96) — ça coûte un mail et ça évite un blocage IP surprise. Ils peuvent même te donner la source structurée.
- **Disclaimer** visible : « Les menus sont susceptibles d'être modifiés selon les arrivages. Seul le document officiel de la Ville fait foi. » Reprends la mention du PDF.
- **Allergènes** : c'est le point de risque réel. Un parsing faux sur un allergène peut avoir des conséquences médicales. Mentionne explicitement que l'app ne se substitue pas au document officiel ni au PAI, et fais confiance à `confidence: low` pour t'auto-censurer.
- Ne pas laisser croire à une app officielle : nom, ton, mentions doivent être clairement non municipaux. Ne reprends ni le logo ni la charte de la ville.
- alwaysdata gratuit = **usage non lucratif** : pas de pub, pas de monétisation. Ce qui tombe bien.

---

## 12. Roadmap indicative

| Jalon | Contenu | Sortie |
|---|---|---|
| **J-1 — Mail (1 h)** | Demande de publication open data au format SCDL (§4bis A) auprès de la mairie | Réponse sous quelques semaines/mois, sans bloquer la suite |
| **J0 — Spike (½ j)** | Extraire mots+coordonnées d'un PDF, prouver que la reconstruction de grille tient | Go/No-Go sur la faisabilité du parser |
| **J1 — Parser (2–3 j)** | Parser + validation + corpus golden sur 6 mois | JSON fiables en local |
| **J2 — Pipeline (1 j)** | Cron, fetch conditionnel, diff, alerting, publication | Données à jour automatiquement |
| **J3 — PWA (2–3 j)** | Aujourd'hui / Semaine / Mois, offline, profil allergènes | V1 utilisable |
| **J4 — Finition (1–2 j)** | États limites, a11y, perf budget, à-propos | V1 partageable |
| **J5 — V1.1** | Vacances scolaires, iCal, sans porc, origine viandes | — |

### Indicateurs de succès
1. Tu ouvres l'app plutôt que le PDF, tous les matins, pendant un mois. (Le seul qui compte vraiment.)
2. Zéro jour servi avec des données fausses non signalées.
3. Le job tourne 90 jours d'affilée sans intervention.
4. Un parent non technique l'utilise sans que tu aies eu à lui expliquer quoi que ce soit.

---

## 13. Questions ouvertes à trancher

**Tranché**
- Différenciation : vitesse / ergonomie / offline / zéro compte (§0).
- Hébergement : alwaysdata FR gratuit + calcul GitHub Actions (§6.3).
- Portée : non décidée → **on construit perso-first, mais aucune décision ne doit interdire d'ouvrir plus tard**. Concrètement, seules trois choses sont irréversibles : garder zéro donnée personnelle serveur (déjà acquis), tenir la barre RGAA dès le début (moins cher que de rattraper), et choisir un nom de domaine neutre plutôt que `menus-de-mes-gosses.fr`. Le reste peut attendre.

**Produit**
1. ~~Cible perso ou publique~~ → différé, cf. ci-dessus.
2. Combien d'enfants / de profils allergènes en pratique ? Un profil unique simplifie beaucoup l'UI.
3. Maternelle et élémentaire ont-ils réellement le même menu ? La page parle des deux, les PDF semblent uniques — à confirmer auprès de la mairie.
4. Le goûter t'intéresse-t-il autant que le déjeuner, ou est-ce du bruit ?

**Technique**
5. Stack front : quelles préférences ? (Mon avis : Svelte/SvelteKit ou vanilla + Vite. React ici est un impôt de 40 Ko pour afficher une liste.)
6. Langage du parser : Python (pdfplumber, nettement le plus mûr pour la géométrie PDF) ou TypeScript (mono-langage, pdfjs-dist) ? Le confort de mono-repo TS vaut-il la moindre maturité de l'outillage ?
7. Domaine perso ou sous-domaine alwaysdata ?
8. Es-tu prêt à conserver les PDF bruts (~50 Mo/an) hors du plan 100 Mo, ou on ne garde que le texte extrait ?
9. Historique : combien de mois passés veux-tu garder consultables ?

**Contraintes**
10. Le plan alwaysdata gratuit interdit l'usage lucratif — confirmé sans objet ? (Aucune monétisation prévue.)
11. Acceptes-tu de contacter la mairie (§4bis A) ? C'est le meilleur ratio effort/valeur du projet, mais ça t'expose comme réutilisateur de leurs données.
