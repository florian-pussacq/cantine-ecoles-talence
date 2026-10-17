import {
  buildDataset,
  EMPTY_DATASET,
  readMonth,
  SUPPORTED_SCHEMA_VERSION,
  type MenuDataset,
  type MonthInput
} from './dataset.js';
import type { MenuIndex } from './schema.js';

export type LoadStatus =
  /** Des menus sont disponibles. */
  | { readonly kind: 'ok' }
  /** Rien n'a pu être récupéré : première ouverture sans réseau. */
  | { readonly kind: 'unavailable' }
  /** Les données publiées dépassent ce que cette version sait lire. */
  | { readonly kind: 'schema-too-new'; readonly version: number };

export type LoadResult = {
  readonly dataset: MenuDataset;
  readonly status: LoadStatus;
};

type Fetcher = typeof globalThis.fetch;

/**
 * Récupère le manifeste puis les mois qu'il annonce.
 *
 * Aucune stratégie de cache n'est écrite ici : c'est le rôle du service worker,
 * qui répond depuis son cache puis rafraîchit en arrière-plan. Vu d'ici, un
 * `fetch` qui aboutit peut donc parfaitement avoir été servi hors ligne — et un
 * `fetch` qui échoue signifie qu'il n'y a ni réseau ni cache, c'est-à-dire une
 * première ouverture sans connexion.
 *
 * Les mois sont demandés en parallèle : ils ne dépendent pas les uns des autres,
 * et l'écran ne peut rien afficher avant de les avoir tous.
 */
export async function loadDataset(fetch: Fetcher, base: string): Promise<LoadResult> {
  let manifest: MenuIndex;

  try {
    const response = await fetch(`${base}/data/index.json`);
    if (!response.ok) return { dataset: EMPTY_DATASET, status: { kind: 'unavailable' } };
    manifest = await response.json();
  } catch {
    return { dataset: EMPTY_DATASET, status: { kind: 'unavailable' } };
  }

  if (manifest.schemaVersion > SUPPORTED_SCHEMA_VERSION) {
    return {
      dataset: EMPTY_DATASET,
      status: { kind: 'schema-too-new', version: manifest.schemaVersion }
    };
  }

  const wanted = manifest.months.filter((entry) => entry.kind !== 'strike');

  const settled = await Promise.all(
    wanted.map(async (entry) => {
      try {
        // Un menu de vacances partage son mois avec un mensuel : il nomme son fichier.
        const response = await fetch(`${base}/data/${entry.file ?? `${entry.month}.json`}`);
        if (!response.ok) return null;
        return { entry, raw: await response.json() };
      } catch {
        return null;
      }
    })
  );

  const inputs: MonthInput[] = [];
  let tooNew: number | null = null;

  for (const settledMonth of settled) {
    if (settledMonth === null) continue;
    const parsed = readMonth(settledMonth.raw);
    if (parsed.ok) {
      inputs.push({ menu: parsed.menu, kind: settledMonth.entry.kind ?? 'monthly' });
    } else if (parsed.reason === 'schema-too-new') {
      tooNew = parsed.version;
    }
  }

  // Un mois illisible ne doit pas emporter les autres : on n'échoue en bloc que
  // si rien ne reste affichable.
  if (inputs.length === 0) {
    return tooNew === null
      ? { dataset: EMPTY_DATASET, status: { kind: 'unavailable' } }
      : { dataset: EMPTY_DATASET, status: { kind: 'schema-too-new', version: tooNew } };
  }

  return { dataset: buildDataset(inputs, manifest.generatedAt), status: { kind: 'ok' } };
}

/**
 * Vrai si le manifeste remonte à plus de 48 heures.
 *
 * Le seuil vient du PRD §9 : au-delà, soit le job d'ingestion est cassé, soit
 * l'appareil est hors ligne depuis longtemps. Dans les deux cas l'utilisateur a
 * le droit de savoir que ce qu'il lit peut être périmé.
 */
export function isStale(dataset: MenuDataset, now: Date): boolean {
  if (dataset.generatedAt === null) return false;
  const generated = Date.parse(dataset.generatedAt);
  if (Number.isNaN(generated)) return false;
  return now.getTime() - generated > 48 * 60 * 60 * 1000;
}
