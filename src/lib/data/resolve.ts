import type { MenuDataset } from './dataset.js';
import type { Day } from './schema.js';

/**
 * Le jour civil à Talence pour un instant donné.
 *
 * L'application affiche des menus servis en France ; le fuseau du navigateur ne
 * doit donc pas entrer dans le calcul. Sans cela, un utilisateur à l'étranger —
 * ou simplement une machine mal réglée — verrait le mauvais jour à la bascule de
 * minuit. Le format « sv-SE » donne AAAA-MM-JJ sans manipulation de chaîne.
 */
export function parisDate(instant: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris' }).format(instant);
}

/**
 * Ce que l'écran doit montrer.
 *
 * L'écran ne montre pas toujours aujourd'hui : le week-end et les vacances le
 * font sauter au prochain jour servi. Le statut est donc explicite, pour que
 * l'interface puisse toujours dire de quel jour elle parle (design.md, D15).
 */
export type DisplayTarget =
  | {
      readonly status: 'today';
      readonly date: string;
      /** Posé, et seulement alors, quand le jour présenté est un jour de vacances (menus-vacances, D5). */
      readonly vacation?: true;
    }
  | {
      readonly status: 'next-served';
      readonly date: string;
      readonly daysAhead: number;
      /**
       * Pourquoi aujourd'hui n'est pas montré : la nature du jour courant telle
       * que les données la connaissent, ou `null` s'il n'y figure pas. Calculée
       * ici et non par l'écran, pour la même raison que l'écart (D60).
       */
      readonly skipped: Day['kind'] | null;
      readonly vacation?: true;
    }
  | { readonly status: 'not-published' };

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * L'écart en jours civils entre deux dates AAAA-MM-JJ, signé.
 *
 * Les deux bornes sont interprétées en UTC : elles ne désignent pas des instants
 * mais des jours civils, et les faire passer par le fuseau local produirait un
 * écart faux d'une unité aux abords d'un changement d'heure.
 *
 * Exportée parce que la mise en forme en a besoin autant que la résolution : le
 * surtitre qui situe le jour consulté se calcule sur cet écart, et une seconde
 * arithmétique des jours civils finirait par diverger de celle-ci (D60).
 */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

/**
 * Un samedi ou un dimanche, pour une date AAAA-MM-JJ de Paris.
 *
 * Les mensuels ne listent que du lundi au vendredi : le week-end n'est pas dans
 * les données, et se reconnaît au calendrier (finition-week-end-et-404, D1). Midi
 * UTC tombe le même jour civil à Paris, quelle que soit l'heure d'été.
 */
function estWeekEnd(date: string): boolean {
  const jour = new Date(`${date}T12:00:00Z`).getUTCDay();
  return jour === 0 || jour === 6;
}

/**
 * Détermine le jour à afficher.
 *
 * `now` est un paramètre et non une lecture de l'horloge : sans cela, les règles
 * de bascule ne seraient testables qu'en manipulant le temps système
 * (design.md, D7).
 */
export function resolveDisplayDay(dataset: MenuDataset, now: Date): DisplayTarget {
  const today = parisDate(now);

  // Un jour de vacances est servi, mais pas à tous les enfants : la mention doit
  // pouvoir le dire. Le champ n'est posé que lorsqu'il est vrai.
  const vacation = (date: string) =>
    dataset.byDate.get(date)?.sourceKind === 'vacation' ? { vacation: true as const } : {};

  const kind = dataset.byDate.get(today)?.kind ?? null;
  if (kind === 'school') {
    return { status: 'today', date: today, ...vacation(today) };
  }

  const next = dataset.servedDates.find((date) => date > today);
  if (next === undefined) return { status: 'not-published' };

  return {
    status: 'next-served',
    date: next,
    daysAhead: daysBetween(today, next),
    skipped: kind ?? (estWeekEnd(today) ? 'weekend' : null),
    ...vacation(next)
  };
}

/**
 * Le jour servi voisin, en sautant tout ce qui ne l'est pas.
 *
 * Rend `null` aux bornes du jeu de données, pour que l'interface puisse le dire
 * plutôt que d'afficher un écran vide.
 */
export function servedNeighbour(
  dataset: MenuDataset,
  date: string,
  direction: 'previous' | 'next'
): string | null {
  if (direction === 'next') {
    return dataset.servedDates.find((candidate) => candidate > date) ?? null;
  }
  for (let i = dataset.servedDates.length - 1; i >= 0; i -= 1) {
    const candidate = dataset.servedDates[i];
    if (candidate !== undefined && candidate < date) return candidate;
  }
  return null;
}

/**
 * Les cinq jours ouvrés de la semaine contenant `date`, servis ou non.
 *
 * Les jours absents du jeu de données sont rendus tels quels : c'est à
 * l'interface de distinguer « pas d'école » de « pas encore publié », et elle a
 * besoin des cinq cases pour le faire.
 */
export function weekOf(date: string): string[] {
  const time = Date.parse(`${date}T00:00:00Z`);
  const weekday = new Date(time).getUTCDay();
  // Un dimanche appartient à la semaine ouvrée qui le précède.
  const offsetToMonday = weekday === 0 ? -6 : 1 - weekday;
  const monday = time + offsetToMonday * DAY_MS;

  return Array.from({ length: 5 }, (_unused, index) =>
    new Date(monday + index * DAY_MS).toISOString().slice(0, 10)
  );
}
