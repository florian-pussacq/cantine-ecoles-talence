import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import NomQualifie from './NomQualifie.svelte';

describe('NomQualifie (accompagnement-dans-le-plat, D4)', () => {
  it('pose le pictogramme après le nom qu’il qualifie', () => {
    const { container } = render(NomQualifie, {
      props: { texte: 'Purée de panais', flags: ['bio'] }
    });
    const accroche = container.querySelector('.accroche');
    expect(accroche?.textContent).toContain('panais');
    expect(accroche?.querySelector('svg')).not.toBeNull();
    // Le pictogramme est après le texte, et dans le même bloc insécable.
    expect(accroche?.firstChild?.nodeType).toBe(Node.TEXT_NODE);
  });

  it('garde le dernier mot et le pictogramme dans un même bloc insécable', () => {
    const { container } = render(NomQualifie, {
      props: { texte: 'Poêlée de légumes', flags: ['bio'] }
    });
    expect(container.textContent).toContain('Poêlée de');
    expect(container.querySelector('.accroche')?.textContent).toContain('légumes');
    expect(container.querySelector('.accroche svg')).not.toBeNull();
  });

  it('ne rend aucun pictogramme pour une mention qui n’en a pas', () => {
    const { container } = render(NomQualifie, {
      props: { texte: 'Rôti de bœuf', flags: ['vbf'] }
    });
    expect(container.querySelector('svg')).toBeNull();
  });

  it('rend un pictogramme par marque, dans l’ordre', () => {
    const { getAllByRole } = render(NomQualifie, {
      props: { texte: 'Pain', flags: ['bio', 'label-rouge'] }
    });
    expect(getAllByRole('img').map((image) => image.getAttribute('aria-label'))).toEqual([
      'Bio',
      'Label Rouge'
    ]);
  });
});
