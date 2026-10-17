import { render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import Bandeau from './Bandeau.svelte';

/** Un contenu de bandeau, avec un lien comme en portent les alertes. */
const contenu = createRawSnippet(() => ({
  render: () =>
    '<span>Ce menu ne précise pas ses allergènes. <a href="/pdf">PDF officiel</a></span>'
}));

const commande = createRawSnippet(() => ({
  render: () => '<button type="button">Appliquer</button>'
}));

describe('un message porte un ton (bandeau-et-aujourdhui, D1)', () => {
  for (const ton of ['info', 'evenement', 'alerte'] as const) {
    it(`porte le ton ${ton}`, () => {
      const { container } = render(Bandeau, { props: { ton, children: contenu } });
      const bandeau = container.querySelector('.bandeau');
      expect(bandeau?.classList.contains(ton)).toBe(true);
      expect(screen.getByRole('link', { name: 'PDF officiel' })).toBeInTheDocument();
    });
  }

  it('se fait discret sans changer de ton', () => {
    const { container } = render(Bandeau, {
      props: { ton: 'info', discret: true, children: contenu }
    });
    const bandeau = container.querySelector('.bandeau');
    expect(bandeau?.classList.contains('info')).toBe(true);
    expect(bandeau?.classList.contains('discret')).toBe(true);
  });

  it('porte un titre de second niveau quand il en a un, comme le thème du jour', () => {
    render(Bandeau, { props: { ton: 'evenement', titre: 'Semaine du goût', children: contenu } });
    expect(screen.getByRole('heading', { level: 2, name: 'Semaine du goût' })).toBeInTheDocument();
  });

  it('peut n’avoir qu’un titre', () => {
    const { container } = render(Bandeau, {
      props: { ton: 'evenement', titre: 'Semaine du goût' }
    });
    expect(container.querySelector('p')).toBeNull();
  });

  it('ne porte aucun titre sans qu’on le lui demande', () => {
    const { container } = render(Bandeau, { props: { ton: 'alerte', children: contenu } });
    expect(container.querySelector('h1, h2, h3')).toBeNull();
  });

  it('porte une commande à sa suite, comme la nouvelle version', () => {
    render(Bandeau, { props: { ton: 'info', children: contenu, action: commande } });
    expect(screen.getByRole('button', { name: 'Appliquer' })).toBeInTheDocument();
  });
});
