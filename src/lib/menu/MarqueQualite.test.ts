import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import MarqueQualite from './MarqueQualite.svelte';

/**
 * Le pictogramme porte une information : il a un nom, et il n'est jamais
 * masqué aux technologies d'assistance (accompagnement-dans-le-plat, D4).
 */
describe('MarqueQualite', () => {
  it('se nomme « Bio » pour les technologies d’assistance', () => {
    const { getByRole } = render(MarqueQualite, { props: { marque: 'bio' } });
    const image = getByRole('img', { name: 'Bio' });
    expect(image.querySelector('title')?.textContent).toBe('Bio');
  });

  it('se nomme « Label Rouge »', () => {
    const { getByRole } = render(MarqueQualite, { props: { marque: 'label-rouge' } });
    expect(getByRole('img', { name: 'Label Rouge' })).toBeInTheDocument();
  });

  it('n’est pas masqué aux technologies d’assistance, à la différence d’une illustration', () => {
    const { getByRole } = render(MarqueQualite, { props: { marque: 'bio' } });
    expect(getByRole('img', { name: 'Bio' })).not.toHaveAttribute('aria-hidden');
  });

  it('emprunte le symbole de sa marque', () => {
    const { getByRole } = render(MarqueQualite, { props: { marque: 'label-rouge' } });
    expect(getByRole('img').querySelector('use')?.getAttribute('href')).toBe('#marque-label-rouge');
  });

  it('se dimensionne en em, pour suivre le texte qu’il accompagne', () => {
    const { getByRole } = render(MarqueQualite, { props: { marque: 'bio', taille: 0.7 } });
    expect(getByRole('img').style.width).toBe('0.7em');
  });

  it('écrit le nom de la mention à côté du dessin, qui se tait alors', () => {
    const { getByText, queryByRole, container } = render(MarqueQualite, {
      props: { marque: 'bio', mot: true }
    });
    expect(getByText('Bio')).toBeInTheDocument();
    // Le mot porte la mention : le dessin n'a pas à la redire aux lecteurs d'écran.
    expect(queryByRole('img')).toBeNull();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('ajoute son filet sur demande', () => {
    const { getByRole, rerender } = render(MarqueQualite, { props: { marque: 'bio' } });
    expect(getByRole('img')).not.toHaveClass('filet');
    return rerender({ marque: 'bio', filet: true }).then(() =>
      expect(getByRole('img')).toHaveClass('filet')
    );
  });
});
