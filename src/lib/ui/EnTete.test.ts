import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import EnTete from './EnTete.svelte';

/*
  Le contrat de l'en-tête a rétréci trois fois (D55, D61).

  Il portait le titre, la mention qui situe le jour, la commande de retour au
  repère et une baseline. Les trois premiers ont trouvé un meilleur endroit : la
  mention entre les flèches qui la font changer, la commande sous le contenu, et
  le titre des écrans de menu dans le rang de navigation, où il désigne la
  période plutôt que l'application. Les garanties qui les concernaient n'ont pas
  disparu, elles ont suivi : voir `RangNavigation.test.ts` et
  `CommandeRetour.test.ts`. La baseline, elle, n'est allée nulle part : elle ne
  disait rien.

  Ce qui reste ici est ce qui n'a jamais bougé : un seul titre de premier niveau,
  et aucune commande dans la ligne du titre.
*/
describe("l'en-tête nomme l'écran", () => {
  it('porte un unique titre de premier niveau', () => {
    const { container } = render(EnTete, { props: { titre: 'Réglages' } });

    const titres = container.querySelectorAll('h1');
    expect(titres).toHaveLength(1);
    expect(titres[0]?.textContent).toBe('Réglages');
  });

  it('expose le titre comme titre accessible', () => {
    render(EnTete, { props: { titre: 'Menu de grève' } });
    expect(screen.getByRole('heading', { level: 1, name: 'Menu de grève' })).toBeInTheDocument();
  });

  it('ne rend rien que le titre', () => {
    // La baseline a disparu du contrat (D61). Ce contrôle vaut pour toute
    // tentative de la faire revenir par une prop oubliée : le titre est le seul
    // texte de l'en-tête, et son nom accessible ne contient rien d'autre.
    const { container } = render(EnTete, { props: { titre: "D'où viennent ces menus" } });

    const entete = container.querySelector('header');
    expect(entete?.textContent?.trim()).toBe("D'où viennent ces menus");
    expect(container.querySelector('p')).toBeNull();
  });

  it('ne porte aucune commande', () => {
    // Le réglage des allergènes vit sur l'enseigne depuis D36, et la sortie
    // d'écran l'y a rejoint depuis D62 : un en-tête qui reprendrait l'un ou
    // l'autre remettrait une commande dans la ligne du titre.
    const { container } = render(EnTete, { props: { titre: 'Réglages' } });
    expect(container.querySelectorAll('a, button')).toHaveLength(0);
  });
});
