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
