import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import edgeCases from '../../../fixtures/edge-cases.json' with { type: 'json' };
import september from '../../../static/data/2026-09.json' with { type: 'json' };
import { buildDataset } from '../data/dataset.js';
import type { MonthMenu } from '../data/schema.js';
import Tray from './Tray.svelte';

const edges = buildDataset([{ menu: edgeCases as MonthMenu }]);
const real = buildDataset([{ menu: september as MonthMenu }]);

function trayFor(dataset: typeof edges, date: string) {
  const day = dataset.byDate.get(date);
  if (day === undefined) throw new Error(`jour absent du fixture : ${date}`);
  return render(Tray, { props: { day, onSelect: () => {} } });
}

describe('la grille ne se referme pas', () => {
  it("dit explicitement qu'il n'y a pas d'entrée", () => {
    // Le 2 janvier du fixture n'a ni entrée ni laitage ni goûter.
    trayFor(edges, '2099-01-02');
    expect(screen.getByText("Pas d'entrée ce jour")).toBeInTheDocument();
    expect(screen.getByText('Pas de laitage ce jour')).toBeInTheDocument();
  });

  it('conserve les six compartiments du déjeuner quel que soit le jour', () => {
    const { container } = trayFor(edges, '2099-01-02');
    // Les rôles sont interrogés par leur classe : « Pain » est à la fois un rôle
    // et un libellé de plat, une recherche par texte confondrait les deux.
    const roles = [...container.querySelectorAll('.role')].map((node) => node.textContent);
    expect(roles).toEqual(['Pain', 'Entrée', 'Plat', 'Garniture', 'Laitage', 'Dessert']);
  });

  it("n'affiche pas le goûter dans le plateau", () => {
    // Le 7 janvier en comporte un : il est rendu ailleurs, hors de la grille.
    trayFor(edges, '2099-01-07');
    expect(screen.queryByText('Pain + chocolat')).not.toBeInTheDocument();
  });
});

describe('couleur de famille du plat principal', () => {
  it('applique la famille déduite du libellé', () => {
    const { container } = trayFor(real, '2026-09-03');
    const main = container.querySelector('.main');
    expect(main?.getAttribute('style')).toContain('--fam: var(--fam-volaille)');
  });

  it('prend le repli neutre quand la famille est indéduisible', () => {
    // « Gumbo de Tiana » n'est couvert par aucun mot-clé.
    const { container } = trayFor(edges, '2099-01-06');
    const main = container.querySelector('.main');
    expect(main?.getAttribute('style')).toContain('--fam: var(--fam-inconnu)');
  });
});

describe('rendu sans illustration', () => {
  it('laisse chaque plat identifiable par son libellé et son rôle', () => {
    // Les illustrations sont décoratives : elles sont masquées aux technologies
    // d'assistance, et le menu doit rester complet sans elles.
    const { container } = trayFor(real, '2026-09-03');
    for (const svg of container.querySelectorAll('svg')) {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    }
    expect(screen.getByText('Blanc de poulet au jus')).toBeInTheDocument();
    expect(container.querySelector('.main .role')?.textContent).toBe('Plat');
  });

  it('rend chaque plat actionnable pour ouvrir son détail', () => {
    // Le 3 septembre remplit ses six compartiments ; le goûter est hors grille.
    const { container } = trayFor(real, '2026-09-03');
    expect(container.querySelectorAll('button')).toHaveLength(6);
  });
});
