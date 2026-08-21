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
  return render(Tray, { props: { day } });
}

describe("l'ardoise ne se referme pas", () => {
  it("dit explicitement qu'il n'y a pas d'entrée", () => {
    // Le 2 janvier du fixture n'a ni entrée ni laitage ni goûter.
    trayFor(edges, '2099-01-02');
    expect(screen.getByText("Pas d'entrée ce jour")).toBeInTheDocument();
    expect(screen.getByText('Pas de laitage ce jour')).toBeInTheDocument();
  });

  it('conserve les six rôles du déjeuner quel que soit le jour', () => {
    const { container } = trayFor(edges, '2099-01-02');
    // Les rôles sont interrogés par leur classe : « Pain » est à la fois un rôle
    // et un libellé de plat, une recherche par texte confondrait les deux.
    const roles = [...container.querySelectorAll('.role')].map((node) => node.textContent);
    expect(roles).toEqual(['Entrée', 'Plat', 'Accompagnement', 'Laitage', 'Dessert', 'Pain']);
  });

  it("suit l'ordre du service, le pain fermant l'ardoise", () => {
    // Le pain n'est pas servi à un moment du repas : il est sur la table du
    // début à la fin, et trente-trois jours sur trente-cinq il s'appelle
    // « Pain » (design.md, D39).
    const { container } = trayFor(real, '2026-09-03');
    const roles = [...container.querySelectorAll('.role')].map((node) => node.textContent);
    expect(roles[0]).toBe('Entrée');
    expect(roles.at(-1)).toBe('Pain');
  });

  it("n'affiche pas le goûter dans l'ardoise", () => {
    // Le 7 janvier en comporte un : il est rendu ailleurs, hors du déjeuner.
    trayFor(edges, '2099-01-07');
    expect(screen.queryByText('Pain + chocolat')).not.toBeInTheDocument();
  });
});

describe('couleur de famille du plat principal', () => {
  it('applique la famille déduite du libellé', () => {
    const { container } = trayFor(real, '2026-09-03');
    const vedette = container.querySelector('.vedette');
    expect(vedette?.getAttribute('style')).toContain('--fam: var(--fam-volaille)');
  });

  it('prend le repli neutre quand la famille est indéduisible', () => {
    // « Gumbo de Tiana » n'est couvert par aucun mot-clé.
    const { container } = trayFor(edges, '2099-01-06');
    const vedette = container.querySelector('.vedette');
    expect(vedette?.getAttribute('style')).toContain('--fam: var(--fam-inconnu)');
  });
});

describe('le dessin ne reste que là où il distingue (D40)', () => {
  it("n'illustre que le plat principal", () => {
    // Mesuré sur les trente-cinq jours publiés : le dessin du pain est le même
    // 35 fois sur 35, celui du laitage 23 fois sur 25. Une illustration qui ne
    // change ni d'un jour à l'autre ni d'une ligne à sa voisine n'est pas une
    // information.
    const { container } = trayFor(real, '2026-09-03');
    const dessins = container.querySelectorAll('.illustration');
    expect(dessins).toHaveLength(1);
    expect(container.querySelector('.vedette .illustration')).not.toBeNull();
  });

  it('ne répète jamais le même dessin deux fois dans la journée', () => {
    // Le 1er septembre porte une entrée et un accompagnement tous deux de la
    // famille des légumes : la grille y montrait deux fois le même dessin.
    const { container } = trayFor(real, '2026-09-01');
    expect(container.querySelectorAll('.illustration').length).toBeLessThanOrEqual(1);
  });

  it('laisse chaque plat identifiable par son libellé et son rôle', () => {
    // Les illustrations sont décoratives : elles sont masquées aux technologies
    // d'assistance, et le menu doit rester complet sans elles.
    const { container } = trayFor(real, '2026-09-03');
    for (const svg of container.querySelectorAll('svg')) {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    }
    expect(screen.getByText('Blanc de poulet au jus')).toBeInTheDocument();
    expect(container.querySelector('.vedette .role')?.textContent).toBe('Plat');
    expect(screen.getByText('Écrasé de pommes de terre')).toBeInTheDocument();
  });
});

describe("l'ardoise n'est pas actionnable (D38)", () => {
  it("ne porte aucune cible : c'est la journée qui en est une", () => {
    // Chaque plat était une cible, ce qui lui imposait 44 pixels de hauteur et
    // rendait le déjeuner incompressible. La cible vit désormais dans l'écran,
    // autour de cette ardoise.
    const { container } = trayFor(real, '2026-09-03');
    expect(container.querySelectorAll('button, a')).toHaveLength(0);
  });
});
