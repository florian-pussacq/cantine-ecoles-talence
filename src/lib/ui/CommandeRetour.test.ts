import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import CommandeRetour from './CommandeRetour.svelte';

describe('le retour au repère (D45, D55)', () => {
  it('est une commande, nommée par son libellé', () => {
    render(CommandeRetour, { props: { libelle: "Aujourd'hui", action: () => {} } });
    expect(screen.getByRole('button', { name: /Aujourd'hui/ })).toBeInTheDocument();
  });

  it('rend la main à son appelant quand elle est actionnée', () => {
    const action = vi.fn();
    render(CommandeRetour, { props: { libelle: 'Demain', action } });
    screen.getByRole('button', { name: /Demain/ }).click();
    expect(action).toHaveBeenCalledOnce();
  });

  it('masque la flèche, qui ne dit rien que le libellé ne dise', () => {
    const { container } = render(CommandeRetour, {
      props: { libelle: 'Prochain service', action: () => {} }
    });
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('ne porte aucun titre : elle accompagne le contenu, elle ne le nomme pas', () => {
    // Elle vivait dans l'en-tête, où elle voisinait le titre de premier niveau
    // (D44). Sortie de là, elle ne doit rien réintroduire de cette parenté.
    const { container } = render(CommandeRetour, {
      props: { libelle: "Aujourd'hui", action: () => {} }
    });
    expect(container.querySelector('h1, h2, h3')).toBeNull();
  });
});
