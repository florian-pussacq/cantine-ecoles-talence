import type { Course, Source } from '../data/schema.js';
import type { Family } from '../illustrations/families.js';
import { daysBetween, type DisplayTarget } from '../data/resolve.js';

/**
 * La page des menus de la Ville : la source, et le recours quand l'application
 * ne peut pas répondre. Une seule adresse pour tous les écrans.
 */
export const PAGE_DES_MENUS = 'https://www.talence.fr/quotidien/enfance-scolarite/menu-ecoles/';

/**
 * Les rôles du déjeuner, dans l'ordre où l'écran les montre.
 *
 * Le plat principal ouvre la liste : c'est la réponse à la question qu'on pose
 * à l'écran — qu'est-ce qu'il mange ? —, et la hiérarchie suit la priorité du
 * produit plutôt que l'ordre du menu imprimé (refonte-signaletique, D7). Les
 * autres suivent l'ordre du service — entrée, accompagnement, laitage, dessert —,
 * puis le pain. Le pain vient après, et ce n'est pas une entorse : il n'est pas
 * servi à un moment du repas, il est sur la table du début à la fin. Il s'appelle
 * par ailleurs « Pain » trente-trois jours sur trente-cinq, ce qui en fait la
 * ligne la moins informative de l'ardoise (design.md, D39).
 *
 * Le goûter est exclu de cette liste : il n'est pas servi au même moment que le
 * déjeuner, et l'y ranger dirait le contraire (D29).
 *
 * Cette constante est l'ordre de référence : l'ardoise et la fiche de journée la
 * lisent toutes deux, faute de quoi la lecture de l'écran et celle du détail
 * cesseraient de se correspondre.
 */
export const LUNCH_SLOTS = [
  'plat',
  'entree',
  'accompagnement',
  'laitage',
  'dessert',
  'pain'
] as const;

export type LunchSlot = (typeof LUNCH_SLOTS)[number];

const SLOT_LABELS: Record<Course['slot'], string> = {
  pain: 'Pain',
  entree: 'Entrée',
  plat: 'Plat',
  accompagnement: 'Accompagnement',
  laitage: 'Laitage',
  dessert: 'Dessert',
  gouter: 'Goûter'
};

export function slotLabel(slot: Course['slot']): string {
  return SLOT_LABELS[slot];
}

/** Formulation de l'absence, au genre du rôle. */
const SLOT_ABSENT: Record<LunchSlot, string> = {
  pain: 'Pas de pain ce jour',
  entree: "Pas d'entrée ce jour",
  plat: 'Pas de plat ce jour',
  accompagnement: "Pas d'accompagnement ce jour",
  laitage: 'Pas de laitage ce jour',
  dessert: 'Pas de dessert ce jour'
};

export function slotAbsence(slot: LunchSlot): string {
  return SLOT_ABSENT[slot];
}

const QUALITY_LABELS: Record<string, string> = {
  bio: 'Bio',
  'label-rouge': 'Label Rouge',
  vbf: 'Viande française',
  vpf: 'Porc français',
  vf: 'Volaille française',
  pf: 'Pêche française',
  msc: 'Pêche durable',
  igp: 'IGP',
  bbc: 'Bleu-Blanc-Cœur',
  'ue-subventionne': 'Soutenu par l’UE'
};

export function qualityLabel(flag: string): string {
  return QUALITY_LABELS[flag] ?? flag;
}

/**
 * Ce qui nomme un plat à l'écran, et la nature de ce nom.
 *
 * `label` — le libellé désigne le plat, c'est lui qui s'affiche.
 * `quality` — le libellé ne disait rien que son rôle ne disait déjà ; c'est la
 *   qualité qui nomme ce plat, parce qu'elle est la seule chose qui distingue
 *   ce jour des autres.
 * `undisclosed` — le libellé se répétait et il n'y avait aucune qualité à
 *   promouvoir : le détail n'est pas publié, et c'est ce qu'on dit.
 */
export type CourseName = {
  kind: 'label' | 'quality' | 'undisclosed';
  text: string;
};

/**
 * La forme de comparaison des libellés — jamais celle de l'affichage.
 *
 * Les accents sont retirés parce que la source les omet par endroits, et qu'un
 * « Gouter » sans circonflexe est la même tautologie qu'un « Goûter ». Cette
 * tolérance ne coûte aucun faux positif : un libellé qui égale son rôle aux
 * accents près ne désigne rien d'autre que son rôle.
 */
function comparable(texte: string): string {
  return texte
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

/**
 * Un compartiment qui répète son rôle nomme ce qui varie (design.md, D28).
 *
 * Le pain est servi tous les jours et s'appelle « Pain » : le compartiment
 * afficherait « PAIN » puis « Pain », et reléguerait en petit la seule chose
 * qui change d'un jour à l'autre — `bio` ou `label-rouge`. La règle se déclenche
 * sur la redondance et non sur un rôle nommé ici, ce qui lui fait attraper au
 * passage les goûters du mercredi, dont le libellé est « Goûter ».
 *
 * L'égalité est stricte : « Pain du mois » et « Pain bio » disent quelque chose
 * de plus que le rôle et gardent donc leur libellé.
 */
export function courseName(course: Course): CourseName {
  if (comparable(course.label) !== comparable(slotLabel(course.slot))) {
    return { kind: 'label', text: course.label };
  }

  if (course.flags.length > 0) {
    return { kind: 'quality', text: course.flags.map(qualityLabel).join(' · ') };
  }

  /*
    « Non publié » et non « pas de goûter » : ces jours-là, les allergènes du
    plat sont renseignés. Il y a bien quelque chose de servi, on ignore quoi —
    et confondre les deux ferait manquer un repas à qui lit vite.
  */
  return { kind: 'undisclosed', text: 'Détail non publié' };
}

/**
 * « Jeudi 10 septembre » pour une date AAAA-MM-JJ.
 *
 * La date est interprétée en UTC et formatée en UTC : elle ne désigne pas un
 * instant mais un jour civil, et la faire passer par le fuseau local la
 * décalerait d'un jour pour les fuseaux négatifs.
 */
export function formatDay(date: string, options: Intl.DateTimeFormatOptions = {}): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  const text = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    ...options
  }).format(parsed);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** « Lun » — l'abrégé utilisé par l'écran Semaine. */
export function formatWeekday(date: string): string {
  const text = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    timeZone: 'UTC'
  }).format(new Date(`${date}T00:00:00Z`));
  return text.charAt(0).toUpperCase() + text.slice(1).replace('.', '');
}

export function dayNumber(date: string): string {
  return String(Number(date.slice(8, 10)));
}

/**
 * Le titre de premier niveau d'un écran de menu, en trois parts
 * (refonte-signaletique, D6).
 *
 * Le chiffre se compose en grand, et le reste à côté de lui sur deux lignes :
 * `avant` en haut, `apres` en bas. Le document les lit dans cet ordre —
 * « Lundi 2 novembre » —, qui est aussi l'ordre de la phrase.
 *
 * Quand ce que l'œil lit et ce qu'on dirait diffèrent — « 2–6 » pour « 2 au
 * 6 » —, `lu` porte la phrase entière : les trois parts sont alors masquées aux
 * technologies d'assistance, qui n'entendent que `lu`.
 */
export type Titre = { avant?: string; chiffre: string; apres: string; lu?: string };

/** Un mois en toutes lettres, ou abrégé, pour une date AAAA-MM-JJ. */
function mois(date: string, month: 'long' | 'short'): string {
  return new Intl.DateTimeFormat('fr-FR', { month, timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`)
  );
}

/** « Lundi », « 2 », « novembre » : le titre de l'écran du jour. */
export function dayTitle(date: string): Titre {
  return {
    avant: formatDay(date, { day: undefined, month: undefined }),
    chiffre: dayNumber(date),
    apres: mois(date, 'long')
  };
}

/**
 * « 2–6 novembre » : le titre de l'écran de la semaine, lu « 2 au 6 novembre ».
 *
 * Une semaine à cheval sur deux mois abrège ses mois — « nov. – déc. » —, faute
 * de quoi ils ne tiendraient pas à côté du chiffre sur un téléphone ; la
 * lecture, elle, les dit en entier.
 */
export function weekTitle(first: string, last: string): Titre {
  const debut = dayNumber(first);
  const fin = dayNumber(last);
  const memeMois = first.slice(0, 7) === last.slice(0, 7);
  return {
    chiffre: `${debut}–${fin}`,
    apres: memeMois ? mois(first, 'long') : `${mois(first, 'short')} – ${mois(last, 'short')}`,
    lu: memeMois
      ? `${debut} au ${fin} ${mois(first, 'long')}`
      : `${debut} ${mois(first, 'long')} au ${fin} ${mois(last, 'long')}`
  };
}

/**
 * Le surtitre du jour que le système a choisi — il dit *pourquoi* ce jour-là.
 *
 * L'écran ne montre pas toujours aujourd'hui, et le taire serait le pire des
 * cas : un parent lisant le menu de lundi en croyant lire celui de vendredi.
 *
 * Il ne vaut que tant que l'utilisateur n'a pas navigué. Passé ce point, la
 * raison du choix initial ne décrit plus ce qui est à l'écran, et c'est
 * `browsedEyebrow` qui prend la suite (D60).
 */
/**
 * Une mention en deux parts (bandeau-et-aujourdhui, D3) : ce qui se dit en
 * sourcil, et si le jour affiché est le jour courant. Dans ce cas, c'est la
 * pastille « Aujourd'hui » qui le dit, la même que sur la semaine : le mot ne
 * s'écrit qu'à un endroit, `RangNavigation`.
 */
export type Mention = { texte: string; aujourdhui: boolean };

const sourcil = (texte: string): Mention => ({ texte, aujourdhui: false });

export function targetEyebrow(target: DisplayTarget): Mention {
  switch (target.status) {
    case 'today':
      return { texte: target.vacation ? 'Vacances' : '', aujourdhui: true };
    case 'next-served':
      // Le férié et le week-end se nomment, sur le même motif ; la date écrite
      // juste en dessous dit le jour, la mention dit l'écart
      // (finition-week-end-et-404, D2).
      if (target.skipped === 'public-holiday') {
        return sourcil(
          target.daysAhead === 1
            ? 'Férié · service demain'
            : `Férié · service dans ${target.daysAhead} jours`
        );
      }
      // Les vacances aussi : tous les enfants n'y déjeunent pas (menus-vacances, D5).
      if (target.vacation) {
        return sourcil(
          target.daysAhead === 1 ? 'Vacances · demain' : `Vacances · dans ${target.daysAhead} jours`
        );
      }
      if (target.skipped === 'weekend') {
        return sourcil(
          target.daysAhead === 1
            ? 'Week-end · service demain'
            : `Week-end · service dans ${target.daysAhead} jours`
        );
      }
      if (target.daysAhead === 1) return sourcil('Demain');
      return sourcil(`Prochain service · dans ${target.daysAhead} jours`);
    case 'not-published':
      return sourcil('Menu non publié');
  }
}

/**
 * Le surtitre du jour que l'utilisateur a demandé — il dit à quelle distance.
 *
 * `targetEyebrow` est calculé sur la cible résolue, qui ne dépend que de
 * l'horloge : il ne bouge pas quand on change de jour. L'écran affichait donc
 * « Aujourd'hui » sur n'importe quel jour parcouru — et, un dimanche,
 * « Prochain service · dans 3 jours » sur tous. C'est la confusion que D45
 * ferme d'un côté, rouverte de l'autre.
 *
 * Dès qu'on a navigué, il n'y a plus de raison à énoncer : le jour affiché est
 * celui qu'on a demandé. Ce qui reste utile est sa distance au jour courant, et
 * c'est tout ce que cette fonction dit.
 *
 * Aucun singulier à traiter : les écarts de un sont captés par « Demain » et
 * « Hier », donc le compte vaut toujours au moins deux (D60).
 */
export function browsedEyebrow(date: string, today: string): Mention {
  const ecart = daysBetween(today, date);

  if (ecart === 0) return { texte: '', aujourdhui: true };
  if (ecart === 1) return sourcil('Demain');
  if (ecart === -1) return sourcil('Hier');

  return sourcil(ecart > 0 ? `Dans ${ecart} jours` : `Il y a ${-ecart} jours`);
}

/**
 * Le libellé de la commande qui ramène au jour que le système a choisi (D45).
 *
 * Il ne dit pas « Aujourd'hui » par défaut, et c'est tout l'objet de cette
 * fonction. La commande ne ramène pas au jour civil : elle ramène à la cible,
 * c'est-à-dire à aujourd'hui **s'il est servi**, et au prochain jour servi
 * sinon. Week-ends et vacances scolaires réunis, le jour civil n'est pas servi
 * environ quarante pour cent des jours de l'année ; un libellé fixe afficherait
 * donc lundi un dimanche, et rouvrirait par l'autre bout la confusion que
 * `targetEyebrow` existe pour empêcher.
 *
 * C'est la version courte de cette mention, et non la même chaîne : « Prochain
 * service · dans 10 jours » situe bien dans un en-tête et ne tient pas sur une
 * commande. Les deux fonctions sont voisines pour rester cohérentes sans être
 * confondues.
 *
 * Rend `null` lorsque rien n'est publié : il n'existe alors aucun jour où
 * revenir, et la commande ne doit pas être affichée.
 */
export function targetReturnLabel(target: DisplayTarget): string | null {
  switch (target.status) {
    case 'today':
      return "Aujourd'hui";
    case 'next-served':
      return target.daysAhead === 1 ? 'Demain' : 'Prochain service';
    case 'not-published':
      return null;
  }
}

/**
 * Le même libellé, pour l'écran de la semaine.
 *
 * Une semaine ne se nomme pas comme un jour : « Demain » n'y veut rien dire. La
 * commande y ramène à la semaine qui contient la cible, et l'annonce comme
 * telle.
 */
export function weekReturnLabel(target: DisplayTarget): string | null {
  switch (target.status) {
    case 'today':
      return 'Cette semaine';
    case 'next-served':
      return 'Prochain service';
    case 'not-published':
      return null;
  }
}

/**
 * Les allergènes d'un plat, en libellés clairs.
 *
 * Un code absent de la légende est rendu tel quel plutôt que masqué : mieux vaut
 * afficher « allergène 11 » qu'escamoter une information de santé.
 */
export function allergenNames(
  course: Course,
  legend: Record<string, string>
): { code: number; name: string }[] {
  return course.allergens.map((code) => ({
    code,
    name: legend[String(code)] ?? `Allergène ${code}`
  }));
}

/** Le nom court d'un allergène, pour les pastilles : « Gluten » et non toute sa parenthèse. */
export function shortAllergenName(name: string): string {
  const withoutDetail = name.split('(')[0] ?? name;
  return withoutDetail.trim();
}

/**
 * Les noms courts des allergènes surveillés que porte ce plat.
 *
 * Les codes sont fournis plutôt que calculés ici : la sélection vit dans un
 * état réactif, et la faire entrer dans ce module y ferait entrer les runes.
 * Le plateau et le goûter partagent cette mise en forme, faute de quoi elle
 * serait recopiée à deux endroits et finirait par diverger.
 */
export function flaggedAllergenNames(
  course: Course,
  legend: Record<string, string>,
  codes: number[]
): string[] {
  return allergenNames({ ...course, allergens: codes }, legend).map((allergen) =>
    shortAllergenName(allergen.name)
  );
}

/**
 * Le résumé de la fiche : pour chaque allergène surveillé, les plats qui le
 * déclarent (alerte-et-fiche-cochee, D4).
 *
 * Les allergènes suivent l'ordre de la légende, les plats celui qu'on leur
 * donne — celui de l'écran. Une liste vide se lit « aucun plat ne le déclare »,
 * jamais « la journée en est exempte ».
 *
 * Un plat s'y nomme par son libellé et non par `courseName` : dans une phrase,
 * le pain du jour est « Pain », pas « Bio », qualité que l'écran du jour
 * promeut au rang de nom parce que le rôle la précède.
 */
export function watchedSummary(
  courses: Course[],
  legend: Record<string, string>,
  codes: Iterable<number>
): { code: number; name: string; courses: string[] }[] {
  return [...codes]
    .sort((a, b) => a - b)
    .map((code) => ({
      code,
      name: shortAllergenName(legend[String(code)] ?? `Allergène ${code}`),
      courses: courses
        .filter((course) => course.allergens.includes(code))
        .map((course) => course.label)
    }));
}

/** Les allergènes d'un plat, ceux qu'on surveille en tête, chacun à sa place sinon. */
export function watchedFirst<T extends { code: number }>(
  allergens: T[],
  watched: ReadonlySet<number>
): (T & { watched: boolean })[] {
  const marked = allergens.map((allergen) => ({
    ...allergen,
    watched: watched.has(allergen.code)
  }));
  return [...marked.filter((a) => a.watched), ...marked.filter((a) => !a.watched)];
}

/**
 * L'avertissement de la fiche, un jour dont le document ne précise pas les
 * allergènes et où l'on en surveille : il nomme ce qu'on ne peut pas vérifier.
 */
export function undeclaredWatched(names: string[]): string {
  return `Ce menu ne précise pas les allergènes de ses plats : impossible de vérifier ${names.join(', ')} pour ce jour.`;
}

/**
 * Le document de ce jour ne précise pas les allergènes de ses plats
 * (allergenes-non-communiques).
 *
 * Ses listes vides ne disent alors rien. Absent, le champ vaut vrai : c'est
 * l'état de tous les mensuels.
 */
export function allergensUndeclared(source: Source): boolean {
  return source.allergensDeclared === false;
}

/**
 * L'avertissement d'un jour dont le document ne précise pas les allergènes.
 *
 * Quand des allergènes sont surveillés, il dit ce que le silence du filtre
 * voudrait autrement dire : rien n'est signalé parce que rien n'est connu, pas
 * parce que rien n'est présent (D3).
 */
export function undeclaredNotice(watching: boolean): string {
  return watching
    ? 'Ce menu ne précise pas les allergènes : ceux que vous surveillez ne peuvent pas être signalés ce jour-là.'
    : 'Ce menu ne précise pas les allergènes de ses plats.';
}

/** Le libellé d'un plat sans code, selon que son document précise ou non les allergènes. */
export function noAllergenLabel(source: Source): string {
  return allergensUndeclared(source) ? 'Allergènes non communiqués' : 'Aucun allergène déclaré';
}

/**
 * Le nom d'une famille, écrit sur la carte du plat principal
 * (couleur-par-famille, D3) : la couleur ne porte jamais seule l'information.
 *
 * Rien pour un plat inclassable : on ne devine pas une famille.
 */
export function familyLabel(family: Family): string | null {
  const noms: Record<Family, string | null> = {
    viande: 'Viande',
    volaille: 'Volaille',
    poisson: 'Poisson',
    vegetarien: 'Végétarien',
    inconnu: null
  };
  return noms[family];
}
