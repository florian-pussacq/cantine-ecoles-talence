import { describe, expect, it } from 'vitest';
import september from '../../../static/data/2026-09.json' with { type: 'json' };
import { isStale, loadDataset } from './load.js';
import { EMPTY_DATASET } from './dataset.js';

type Body = Record<string, unknown>;

/** Un `fetch` de laboratoire : une table d'URL vers réponses, ou une panne. */
function stubFetch(routes: Record<string, Body | 'network-error' | 'not-found'>) {
  return (async (input: RequestInfo | URL) => {
    const url = String(input);
    const route = routes[url];
    if (route === undefined || route === 'not-found') {
      return new Response('', { status: 404 });
    }
    if (route === 'network-error') throw new TypeError('Failed to fetch');
    return new Response(JSON.stringify(route), { status: 200 });
  }) as typeof globalThis.fetch;
}

const manifest = (months: Body[]): Body => ({
  schemaVersion: 1,
  generatedAt: '2026-09-10T03:00:00Z',
  months
});

const entry = (extra: Body = {}) => ({
  month: '2026-09',
  contentHash: 'a'.repeat(64),
  ...extra
});

describe('loadDataset', () => {
  it('charge le manifeste puis les mois annoncés', async () => {
    const result = await loadDataset(
      stubFetch({
        '/data/index.json': manifest([entry()]),
        '/data/2026-09.json': september as unknown as Body
      }),
      ''
    );

    expect(result.status).toEqual({ kind: 'ok' });
    expect(result.dataset.servedDates).toHaveLength(20);
    expect(result.dataset.generatedAt).toBe('2026-09-10T03:00:00Z');
  });

  it('honore le préfixe de déploiement', async () => {
    const result = await loadDataset(
      stubFetch({
        '/cantine/data/index.json': manifest([entry()]),
        '/cantine/data/2026-09.json': september as unknown as Body
      }),
      '/cantine'
    );

    expect(result.status).toEqual({ kind: 'ok' });
  });

  it('signale l’indisponibilité quand le manifeste est injoignable', async () => {
    const result = await loadDataset(stubFetch({ '/data/index.json': 'network-error' }), '');

    expect(result.status).toEqual({ kind: 'unavailable' });
    expect(result.dataset).toBe(EMPTY_DATASET);
  });

  it('signale l’indisponibilité quand le manifeste répond en erreur', async () => {
    const result = await loadDataset(stubFetch({}), '');
    expect(result.status).toEqual({ kind: 'unavailable' });
  });

  it('refuse un manifeste de contrat plus récent', async () => {
    const result = await loadDataset(
      stubFetch({ '/data/index.json': { ...manifest([]), schemaVersion: 2 } }),
      ''
    );

    expect(result.status).toEqual({ kind: 'schema-too-new', version: 2 });
  });

  it('refuse un mois de contrat plus récent', async () => {
    const result = await loadDataset(
      stubFetch({
        '/data/index.json': manifest([entry()]),
        '/data/2026-09.json': { ...(september as unknown as Body), schemaVersion: 3 }
      }),
      ''
    );

    expect(result.status).toEqual({ kind: 'schema-too-new', version: 3 });
  });

  it('charge un menu de vacances par le fichier qu’il nomme, à côté du mensuel', async () => {
    const vacances = {
      ...(september as unknown as Body),
      title: 'Vacances de Toussaint',
      days: [
        {
          date: '2026-10-19',
          kind: 'school',
          confidence: 'high',
          courses: [{ slot: 'plat', label: 'Blanc de poulet', allergens: [], flags: [] }]
        }
      ]
    };
    const result = await loadDataset(
      stubFetch({
        '/data/index.json': manifest([
          entry(),
          entry({ file: '2026-09-vacances.json', kind: 'vacation' })
        ]),
        '/data/2026-09.json': september as unknown as Body,
        '/data/2026-09-vacances.json': vacances
      }),
      ''
    );

    expect(result.status).toEqual({ kind: 'ok' });
    expect(result.dataset.servedDates).toHaveLength(21);
    const jour = result.dataset.byDate.get('2026-10-19');
    expect(jour?.sourceKind).toBe('vacation');
    expect(jour?.title).toBe('Vacances de Toussaint');
  });

  it('ignore le menu de grève annoncé par le manifeste', async () => {
    const result = await loadDataset(
      stubFetch({
        '/data/index.json': manifest([entry({ kind: 'strike' })]),
        '/data/2026-09.json': september as unknown as Body
      }),
      ''
    );

    // Aucun mois exploitable ne reste : le fichier de grève n'est pas téléchargé.
    expect(result.status).toEqual({ kind: 'unavailable' });
  });

  it('n’emporte pas les mois lisibles quand l’un d’eux échoue', async () => {
    const result = await loadDataset(
      stubFetch({
        '/data/index.json': manifest([entry(), entry({ month: '2026-10' })]),
        '/data/2026-09.json': september as unknown as Body,
        '/data/2026-10.json': 'network-error'
      }),
      ''
    );

    expect(result.status).toEqual({ kind: 'ok' });
    expect(result.dataset.servedDates).toHaveLength(20);
  });
});

describe('isStale', () => {
  const dataset = { ...EMPTY_DATASET, generatedAt: '2026-09-10T03:00:00Z' };

  it('reste silencieux en deçà de 48 heures', () => {
    expect(isStale(dataset, new Date('2026-09-12T02:00:00Z'))).toBe(false);
  });

  it('avertit au-delà de 48 heures', () => {
    expect(isStale(dataset, new Date('2026-09-12T04:00:00Z'))).toBe(true);
  });

  it('n’avertit pas faute de date de génération', () => {
    expect(isStale(EMPTY_DATASET, new Date('2030-01-01T00:00:00Z'))).toBe(false);
  });
});
