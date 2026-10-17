/**
 * FICHIER GÉNÉRÉ — ne pas modifier à la main.
 *
 * Source : schemas/month.schema.json, schemas/index.schema.json, schemas/greve.schema.json
 * Régénérer : npm run types
 */

/**
 * Les menus d'un mois. Un fichier par mois, publié sous /data/<AAAA-MM>.json. C'est le contrat entre le producteur des données et l'application ; toute évolution incompatible passe par un incrément de schemaVersion.
 */
export interface MonthMenu {
  /**
   * Version du contrat. Une application refuse un fichier dont la version dépasse celle qu'elle sait lire, plutôt que d'en interpréter une partie.
   */
  schemaVersion: 1;
  /**
   * Mois couvert, au format AAAA-MM.
   */
  month: string;
  source: Source;
  allergenLegend: AllergenLegend;
  /**
   * Les jours couverts, triés par date croissante. Un jour non servi peut être absent ; il n'a pas à être représenté.
   */
  days: Day[];
}
/**
 * D'où viennent ces données et à quel point elles sont fraîches. Ces champs remplissent une obligation légale autant qu'un besoin d'interface : le CRPA impose d'indiquer la source et la date de dernière mise à jour d'une information publique réutilisée.
 */
export interface Source {
  /**
   * URL du PDF officiel dont ce fichier dérive.
   */
  pdfUrl: string;
  /**
   * Empreinte du PDF, qui permet de savoir si la source a changé sans la ré-analyser.
   */
  pdfSha256: string;
  /**
   * Le libellé de mise à jour tel qu'imprimé sur le document, repris mot pour mot. Sert de repli quand la date n'a pas pu en être extraite.
   */
  updatedLabel?: string | null;
  /**
   * La date de mise à jour extraite du document. Nulle si le document ne la donne pas ou si elle n'a pas pu être lue — il ne faut jamais l'inventer.
   */
  updatedAt?: string | null;
  /**
   * Instant de récupération du document, en UTC.
   */
  fetchedAt: string;
  /**
   * Version du producteur ayant écrit ce fichier. « manual » pour une saisie humaine, un numéro de version pour le parser.
   */
  producerVersion?: string;
}
/**
 * Les quatorze allergènes réglementaires, du code numérique vers son libellé en clair. La légende est portée par le fichier plutôt que codée en dur : elle est imprimée sur le document source et peut y être formulée autrement.
 */
export interface AllergenLegend {
  [k: string]: string;
}
export interface Day {
  /**
   * Date du jour couvert, au format AAAA-MM-JJ.
   */
  date: string;
  /**
   * Nature du jour. « school » est un jour servi ; les autres ne le sont pas et n'ont pas de plats. « public-holiday » est un jour férié, que le document marque « JOUR FÉRIÉ » à la place des plats.
   */
  kind: 'school' | 'holiday' | 'public-holiday' | 'weekend' | 'strike-fallback';
  /**
   * Thème du jour, issu de l'encart « ZOOM SUR » du document. Nul la plupart du temps.
   */
  theme?: string | null;
  /**
   * Note éditoriale accompagnant le thème.
   */
  note?: string | null;
  /**
   * RÉSERVÉ — incrémenté par le pipeline à chaque changement détecté sur ce jour. Déclaré maintenant pour éviter un schemaVersion 2 sur un ajout prévisible, mais ni produit ni consommé tant que le pipeline de diff n'existe pas (design.md, D4).
   */
  revision?: number;
  /**
   * RÉSERVÉ — date du dernier changement détecté sur ce jour. Voir revision.
   */
  changedAt?: string | null;
  /**
   * Les plats du jour, dans l'ordre de service. Un jour non servi porte une liste vide.
   */
  courses: Course[];
  /**
   * Fiabilité des données de ce jour. « low » déclenche un avertissement dans l'application, le menu restant affiché : publier en dégradé plutôt que rien, mais jamais silencieusement.
   */
  confidence: 'high' | 'low';
}
export interface Course {
  /**
   * Rôle du plat dans le repas. C'est une valeur sémantique et jamais une position : le document source comporte des cellules vides, ce qui interdit toute déduction par index.
   */
  slot: 'pain' | 'entree' | 'plat' | 'accompagnement' | 'laitage' | 'dessert' | 'gouter';
  /**
   * Libellé du plat, tel qu'imprimé, débarrassé de son suffixe d'allergènes. La borne de 80 caractères est un garde-fou : au-delà, c'est presque toujours le signe de deux cellules fusionnées par erreur.
   */
  label: string;
  /**
   * Codes des allergènes déclarés pour ce plat. Une liste vide signifie « aucun allergène déclaré sur le document », ce qui ne garantit pas l'absence de traces.
   */
  allergens: number[];
  /**
   * Labels de qualité imprimés à côté du plat.
   */
  flags: (
    'bio' | 'label-rouge' | 'vbf' | 'vpf' | 'vf' | 'pf' | 'msc' | 'igp' | 'bbc' | 'ue-subventionne'
  )[];
  /**
   * Texte de substitution du régime sans porc, quand le document en propose une pour ce plat.
   */
  porkFree?: string | null;
}

/**
 * Le manifeste des mois disponibles, publié sous /data/index.json. C'est le seul fichier que l'application retélécharge systématiquement au démarrage ; il doit donc rester petit.
 */
export interface MenuIndex {
  schemaVersion: 1;
  /**
   * Instant de génération du manifeste, en UTC. Au-delà de 48 heures, l'application affiche un avertissement de fraîcheur.
   */
  generatedAt: string;
  /**
   * Les mois publiés, triés par mois croissant.
   */
  months: MonthEntry[];
}
export interface MonthEntry {
  /**
   * Mois couvert, au format AAAA-MM. Le fichier correspondant est /data/<mois>.json.
   */
  month: string;
  /**
   * Empreinte du fichier mensuel. L'application ne le retélécharge que si cette empreinte diffère de celle qu'elle a en cache.
   */
  contentHash: string;
  /**
   * Nature du fichier, qui fixe sa priorité quand plusieurs couvrent la même date : « event » l'emporte sur « transition », qui l'emporte sur « monthly ». Un fichier « strike » n'est jamais retenu automatiquement, l'application ne pouvant pas savoir qu'il y a grève. Absent, la valeur est « monthly ».
   */
  kind?: 'monthly' | 'transition' | 'event' | 'strike';
  /**
   * Date de mise à jour de la source de ce mois, recopiée depuis le fichier mensuel pour permettre un affichage sans le télécharger.
   */
  updatedAt?: string | null;
}

/**
 * Le menu de repli servi les jours de grève, publié sous /data/greve.json. C'est un second contrat, distinct de celui des mois, parce que le document source décrit autre chose : dix menus indexés par jour de la semaine et par variante de service, sans aucune date. Le forcer dans le contrat mensuel imposerait d'inventer des dates, c'est-à-dire de publier des données fausses. Ce fichier n'est jamais inscrit au manifeste : celui-ci ne référence que des mois, et un fichier absent du manifeste est structurellement hors d'atteinte de la résolution du jour — l'application ne pouvant pas savoir qu'il y a grève, elle ne doit jamais servir ce menu d'elle-même.
 */
export interface StrikeMenu {
  /**
   * Version du contrat. Une application refuse un fichier dont la version dépasse celle qu'elle sait lire, plutôt que d'en interpréter une partie.
   */
  schemaVersion: 1;
  source: StrikeSource;
  allergenLegend: StrikeAllergenLegend;
  /**
   * Les deux variantes de service. Le document dit « selon la possibilité, des repas chauds ou froids peuvent être proposés » : aucune des deux ne prime, et l'application ne peut pas deviner laquelle sera servie.
   *
   * @minItems 2
   * @maxItems 2
   */
  services: [StrikeService, StrikeService];
}
/**
 * D'où viennent ces données et à quel point elles sont fraîches. Mêmes champs et mêmes obligations que la source d'un fichier mensuel : le CRPA impose d'indiquer la source et la date de dernière mise à jour d'une information publique réutilisée. Ce document n'ayant pas été réédité depuis 2023, l'empreinte est ici le seul moyen d'apprendre qu'il a changé.
 */
export interface StrikeSource {
  /**
   * URL du PDF officiel dont ce fichier dérive.
   */
  pdfUrl: string;
  /**
   * Empreinte du PDF, qui permet de savoir si la source a changé sans la ré-analyser.
   */
  pdfSha256: string;
  /**
   * Le libellé de mise à jour tel qu'imprimé sur le document, repris mot pour mot. Nul quand le document n'en porte pas — c'est le cas de celui-ci.
   */
  updatedLabel?: string | null;
  /**
   * La date de mise à jour extraite du document. Nulle si le document ne la donne pas — il ne faut jamais l'inventer.
   */
  updatedAt?: string | null;
  /**
   * Instant de récupération du document, en UTC.
   */
  fetchedAt: string;
  /**
   * Version du producteur ayant écrit ce fichier. « manual » pour une saisie humaine, un numéro de version pour le parser.
   */
  producerVersion?: string;
}
/**
 * Les quatorze allergènes réglementaires, du code numérique vers son libellé en clair. La légende est portée par le fichier plutôt que codée en dur : elle est imprimée sur le document source et peut y être formulée autrement.
 */
export interface StrikeAllergenLegend {
  [k: string]: string;
}
export interface StrikeService {
  /**
   * Variante de service, telle que le document la nomme : « REPAS CHAUDS » ou « REPAS FROIDS ».
   */
  temperature: 'chaud' | 'froid';
  /**
   * Les cinq jours ouvrés, dans l'ordre de la semaine. Contrairement aux fichiers mensuels, aucun jour ne peut manquer : le document est une grille pleine, et un jour absent serait une extraction ratée plutôt qu'un jour non servi.
   *
   * @minItems 5
   * @maxItems 5
   */
  days: [StrikeDay, StrikeDay, StrikeDay, StrikeDay, StrikeDay];
}
export interface StrikeDay {
  /**
   * Jour de la semaine couvert. C'est la clé de ce contrat, là où le contrat mensuel a une date : le menu de grève se répète à l'identique tant que le document n'est pas réédité.
   */
  weekday: 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi';
  /**
   * Les plats du jour, dans l'ordre de service.
   *
   * @minItems 1
   */
  courses: [StrikeCourse, ...StrikeCourse[]];
}
/**
 * Un plat du menu de grève. Même forme qu'un plat de menu mensuel — la duplication est assumée : deux contrats indépendants qui versionnent séparément valent mieux qu'un contrat qui décrit deux documents.
 */
export interface StrikeCourse {
  /**
   * Rôle du plat dans le repas. C'est une valeur sémantique et jamais une position : le document source comporte des cellules vides, ce qui interdit toute déduction par index.
   */
  slot: 'pain' | 'entree' | 'plat' | 'accompagnement' | 'laitage' | 'dessert' | 'gouter';
  /**
   * Libellé du plat, tel qu'imprimé, débarrassé de son suffixe d'allergènes. La borne de 80 caractères est un garde-fou : au-delà, c'est presque toujours le signe de deux cellules fusionnées par erreur.
   */
  label: string;
  /**
   * Codes des allergènes déclarés pour ce plat. Une liste vide signifie « aucun allergène déclaré sur le document », ce qui ne garantit pas l'absence de traces.
   */
  allergens: number[];
  /**
   * Labels de qualité imprimés à côté du plat.
   */
  flags: (
    'bio' | 'label-rouge' | 'vbf' | 'vpf' | 'vf' | 'pf' | 'msc' | 'igp' | 'bbc' | 'ue-subventionne'
  )[];
}
