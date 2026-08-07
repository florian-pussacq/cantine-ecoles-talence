import type { AllergenLegend, Day, MonthMenu, Source } from './schema.js';

/** Version du contrat que cette application sait lire. Voir docs/schema.md. */
export const SUPPORTED_SCHEMA_VERSION = 1;

/**
 * Nature d'un fichier de données, qui détermine sa priorité quand plusieurs
 * couvrent la même date (PRD §5).
 *
 * Le menu de grève porte une priorité nulle : il n'est jamais retenu
 * automatiquement, parce que l'application ne peut pas savoir qu'il y a grève.
 * Il ne s'affiche que sur action explicite.
 */
export type SourceKind = 'monthly' | 'transition' | 'event' | 'strike';

const PRIORITY: Record<SourceKind, number> = {
  strike: 0,
  monthly: 1,
  transition: 2,
  event: 3
};

/** Un jour, augmenté de ce dont l'affichage a besoin et qui vit au niveau du mois. */
export type ResolvedDay = Day & {
  readonly month: string;
  readonly legend: AllergenLegend;
  readonly source: Source;
};

export type MenuDataset = {
  readonly byDate: ReadonlyMap<string, ResolvedDay>;
  /** Dates servies, triées par ordre croissant. */
  readonly servedDates: readonly string[];
  /** Date de génération du manifeste, pour l'avertissement de fraîcheur. */
  readonly generatedAt: string | null;
};

export type MonthInput = {
  readonly menu: MonthMenu;
  readonly kind?: SourceKind;
};

export type MonthReadResult =
  | { readonly ok: true; readonly menu: MonthMenu }
  | { readonly ok: false; readonly reason: 'schema-too-new'; readonly version: number }
  | { readonly ok: false; readonly reason: 'malformed' };

/**
 * Interprète un fichier mensuel fraîchement téléchargé.
 *
 * Un fichier annonçant une version de contrat supérieure est refusé en bloc
 * plutôt que lu partiellement : mieux vaut demander une mise à jour de
 * l'application que d'afficher un menu amputé sans le dire.
 */
export function readMonth(raw: unknown): MonthReadResult {
  if (typeof raw !== 'object' || raw === null) return { ok: false, reason: 'malformed' };

  const candidate = raw as Partial<MonthMenu>;
  const version = candidate.schemaVersion;

  if (typeof version !== 'number') return { ok: false, reason: 'malformed' };
  if (version > SUPPORTED_SCHEMA_VERSION) return { ok: false, reason: 'schema-too-new', version };
  if (!Array.isArray(candidate.days) || typeof candidate.month !== 'string') {
    return { ok: false, reason: 'malformed' };
  }

  return { ok: true, menu: raw as MonthMenu };
}

/**
 * Fusionne plusieurs fichiers en une seule vue par date.
 *
 * L'ordre de résolution est déterministe et ne dépend pas de l'ordre d'arrivée
 * des fichiers : les entrées sont triées par priorité croissante puis par mois,
 * si bien qu'une source plus prioritaire écrase toujours la précédente.
 */
export function buildDataset(inputs: readonly MonthInput[], generatedAt = null as string | null) {
  const ordered = [...inputs]
    .filter((input) => PRIORITY[input.kind ?? 'monthly'] > 0)
    .sort((a, b) => {
      const byPriority = PRIORITY[a.kind ?? 'monthly'] - PRIORITY[b.kind ?? 'monthly'];
      return byPriority !== 0 ? byPriority : a.menu.month.localeCompare(b.menu.month);
    });

  const byDate = new Map<string, ResolvedDay>();

  for (const { menu } of ordered) {
    for (const day of menu.days) {
      byDate.set(day.date, {
        ...day,
        month: menu.month,
        legend: menu.allergenLegend,
        source: menu.source
      });
    }
  }

  const servedDates = [...byDate.values()]
    .filter((day) => day.kind === 'school')
    .map((day) => day.date)
    .sort();

  return { byDate, servedDates, generatedAt } satisfies MenuDataset;
}

export const EMPTY_DATASET: MenuDataset = {
  byDate: new Map(),
  servedDates: [],
  generatedAt: null
};
