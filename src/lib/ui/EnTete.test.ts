import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import EnTete from './EnTete.svelte';

describe("l'en-tête tient sur une ligne", () => {
  it("porte un unique titre de premier niveau contenant la mention et l'objet", () => {
    const { container } = render(EnTete, {
      props: { quand: "Aujourd'hui", quoi: 'vendredi 8 août' }
    });

    const titres = container.querySelectorAll('h1');
    expect(titres).toHaveLength(1);
    expect(titres[0]?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      "Aujourd'hui · vendredi 8 août"
    );
  });

  it('expose la mention et l’objet au sein du même titre accessible', () => {
    // Le lecteur d'écran doit entendre la phrase entière, pas deux fragments.
    render(EnTete, { props: { quand: 'Cette semaine', quoi: 'du 4 au 8 août' } });
    expect(
      screen.getByRole('heading', { level: 1, name: /Cette semaine.*du 4 au 8 août/ })
    ).toBeInTheDocument();
  });

  it('masque le séparateur aux technologies d’assistance', () => {
    const { container } = render(EnTete, { props: { quand: 'Réglage', quoi: 'Allergènes' } });
    const point = container.querySelector('.point');
    expect(point?.getAttribute('aria-hidden')).toBe('true');
  });

  it('situe une date autre que celle du moment', () => {
    // C'est tout l'intérêt de la mention : « Demain » et « Menu du jour » ne
    // disent pas la même chose devant la même date.
    render(EnTete, { props: { quand: 'Demain', quoi: 'samedi 9 août' } });
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Demain');
  });
});
