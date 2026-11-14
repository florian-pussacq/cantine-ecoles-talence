import { render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import november from '../../../static/data/2026-11.json' with { type: 'json' };
import { buildDataset } from '../data/dataset.js';
import type { Course, MonthMenu } from '../data/schema.js';
import { allergenFilter } from '../filter/allergens.svelte.js';
import PlatCarte from './PlatCarte.svelte';

const real = buildDataset([{ menu: november as MonthMenu }]);

afterEach(() => allergenFilter.clear());

/** Le plat et l'accompagnement d'un jour réel, tels que la liste les passe à la carte. */
function principale(date: string) {
  const day = real.byDate.get(date);
  if (day === undefined) throw new Error(`jour absent : ${date}`);
  const course = (slot: Course['slot']) => day.courses.find((c) => c.slot === slot) ?? null;
  return render(PlatCarte, {
    props: {
      slot: 'plat',
      course: course('plat'),
      accompagnement: course('accompagnement'),
      legend: day.legend,
      principal: true
    }
  });
}

/** Ce qu'un lecteur d'écran lirait : sans ce qui est masqué, avec le nom des pictogrammes. */
function lu(noeud: Element): string {
  const copie = noeud.cloneNode(true) as Element;
  for (const masque of copie.querySelectorAll('[aria-hidden="true"]')) masque.remove();
  // Une image nommée se lit à part, par son nom : elle n'est pas collée au mot qui la précède.
  for (const image of copie.querySelectorAll('[role="img"]')) {
    image.replaceWith(` ${image.getAttribute('aria-label') ?? ''} `);
  }
  return (copie.textContent ?? '').replace(/\s+/g, ' ').trim();
}

describe('l’intitulé réunit le plat et son accompagnement (accompagnement-dans-le-plat, D1)', () => {
  it('rend un seul intitulé, l’accompagnement en minuscule et subordonné', () => {
    // Le 6 novembre : un filet de colin, avec une purée de panais à la vanille.
    const { container } = principale('2026-11-06');
    expect(container.querySelectorAll('.nom')).toHaveLength(1);
    expect(container.querySelector('.nom')?.textContent).toContain('purée de panais à la vanille');
    expect(container.querySelector('.accessoire')?.textContent).toContain(
      'purée de panais à la vanille'
    );
    expect(container.querySelector('.nom > :not(.accessoire)')?.textContent).toContain(
      'Filet de colin'
    );
  });

  it('montre l’esperluette, masquée aux technologies d’assistance', () => {
    const { container } = principale('2026-11-06');
    const esperluette = container.querySelector('.nom [aria-hidden="true"]');
    expect(esperluette?.textContent?.trim()).toBe('&');
  });

  it('relie les deux noms par « avec » pour qui ne voit pas l’écran', () => {
    const { container } = principale('2026-11-06');
    expect(lu(container.querySelector('.nom') as Element)).toMatch(
      /^Filet de colin avec purée de panais à la vanille/
    );
  });

  it('n’affiche aucune absence d’accompagnement pour un plat complet', () => {
    // Le 5 novembre : ravioli bolognaise, sans accompagnement.
    const { container } = principale('2026-11-05');
    expect(container.querySelector('.nom')?.textContent?.trim()).toBe('Ravioli Bolognaise');
    expect(container.querySelector('.accessoire')).toBeNull();
    expect(container.textContent).not.toMatch(/accompagnement/i);
  });
});

describe('la ligne sous l’intitulé ne dit que la famille', () => {
  it('ne porte ni le rôle ni le pictogramme, seulement la famille', () => {
    // Le 25 novembre : un rôti de bœuf bio, avec une poêlée de légumes bio.
    const { container } = principale('2026-11-25');
    expect(container.querySelector('.meta')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'Viande'
    );
    expect(container.querySelector('.role')).toBeNull();
  });

  it('écrit en texte une mention qui n’a pas de pictogramme', () => {
    const day = real.byDate.get('2026-11-25');
    if (day === undefined) throw new Error('jour absent');
    const plat = day.courses.find((c) => c.slot === 'plat') as Course;
    const { container } = render(PlatCarte, {
      props: {
        slot: 'plat',
        course: { ...plat, flags: ['vbf'] },
        accompagnement: null,
        legend: day.legend,
        principal: true
      }
    });
    expect(container.querySelector('.meta')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'Viande · Viande française'
    );
    expect(container.querySelector('.nom svg')).toBeNull();
  });

  it('n’a pas de ligne pour un plat inclassable', () => {
    const day = real.byDate.get('2026-11-06');
    if (day === undefined) throw new Error('jour absent');
    const { container } = render(PlatCarte, {
      props: {
        slot: 'plat',
        course: { slot: 'plat', label: 'Moussaka', allergens: [], flags: [] },
        accompagnement: null,
        legend: day.legend,
        principal: true
      }
    });
    expect(container.querySelector('.principal.inconnue')).not.toBeNull();
    expect(container.querySelector('.meta')).toBeNull();
  });
});

describe('le pictogramme suit le nom qu’il qualifie (accompagnement-dans-le-plat, D4)', () => {
  it('suit l’accompagnement bio, et aucun ne suit le plat', () => {
    // Le 6 novembre : seule la purée est bio.
    const { container } = principale('2026-11-06');
    const accessoire = container.querySelector('.accessoire') as Element;
    expect(accessoire.querySelector('svg[aria-label="Bio"]')).not.toBeNull();
    const plat = container.querySelector('.nom > :not(.accessoire)') as Element;
    expect(plat.querySelector('svg')).toBeNull();
  });

  it('suit chacun des deux noms quand le plat et l’accompagnement sont bio', () => {
    // Le 25 novembre : le rôti de bœuf et la poêlée sont bio.
    const { container } = principale('2026-11-25');
    expect(container.querySelectorAll('.nom svg[aria-label="Bio"]')).toHaveLength(2);
    expect(container.querySelector('.nom > :not(.accessoire) svg')).not.toBeNull();
    expect(container.querySelector('.accessoire svg')).not.toBeNull();
  });

  it('lit le nom puis « Bio » à voix haute', () => {
    const { container } = principale('2026-11-06');
    expect(lu(container.querySelector('.nom') as Element)).toMatch(/panais à la vanille Bio$/);
  });
});

describe('la pastille d’allergène couvre le plat et son accompagnement', () => {
  it('signale un allergène que seul l’accompagnement déclare', () => {
    // Le 6 novembre : le lait (7) est dans la purée, pas dans le colin.
    allergenFilter.toggle(7);
    const { container } = principale('2026-11-06');
    expect(container.querySelector('.chip')).not.toBeNull();
    expect(container.querySelector('.chip')?.textContent).toMatch(/lait/i);
  });

  it('ne signale rien quand ni l’un ni l’autre ne le déclare', () => {
    allergenFilter.toggle(2);
    const { container } = principale('2026-11-06');
    expect(container.querySelector('.chip')).toBeNull();
  });
});
