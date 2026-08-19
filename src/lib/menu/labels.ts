import type { Course } from '../data/schema.js';
import type { DisplayTarget } from '../data/resolve.js';

/** Les rôles du déjeuner, dans l'ordre du service. Le goûter en est exclu : il n'est pas servi sur le plateau. */
export const LUNCH_SLOTS = [
  'pain',
  'entree',
  'plat',
  'accompagnement',
  'laitage',
  'dessert'
] as const;

export type LunchSlot = (typeof LUNCH_SLOTS)[number];

const SLOT_LABELS: Record<Course['slot'], string> = {
  pain: 'Pain',
  entree: 'Entrée',
  plat: 'Plat',
  accompagnement: 'Garniture',
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
  accompagnement: 'Pas de garniture ce jour',
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
 * Le surtitre qui dit de quel jour l'écran parle.
 *
 * L'écran ne montre pas toujours aujourd'hui, et le taire serait le pire des
 * cas : un parent lisant le menu de lundi en croyant lire celui de vendredi.
 */
export function targetEyebrow(target: DisplayTarget): string {
  switch (target.status) {
    case 'today':
      return "Aujourd'hui";
    case 'next-served':
      if (target.daysAhead === 1) return 'Demain';
      return `Prochain service · dans ${target.daysAhead} jours`;
    case 'not-published':
      return 'Menu non publié';
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
