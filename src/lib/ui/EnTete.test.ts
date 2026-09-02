import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import EnTete from './EnTete.svelte';

/*
  Le contrat de l'en-tête a rétréci (D55).

  Il portait le titre, la mention qui situe le jour, et la commande de retour au
  repère — trois choses dont deux ont trouvé un meilleur endroit : la mention
  entre les flèches qui la font changer, la commande sous le contenu. Les
  garanties qui les concernaient n'ont pas disparu, elles ont suivi : voir
  `RangNavigation.test.ts` et `CommandeRetour.test.ts`.

  Ce qui reste ici est ce qui n'a jamais bougé : un seul titre de premier niveau,
  et aucune commande dans la ligne du titre.
*/
describe("l'en-tête nomme l'écran", () => {
  it('porte un unique titre de premier niveau', () => {
    const { container } = render(EnTete, { props: { titre: 'Menu de la cantine' } });

    const titres = container.querySelectorAll('h1');
    expect(titres).toHaveLength(1);
    expect(titres[0]?.textContent).toBe('Menu de la cantine');
  });

  it('expose le titre comme titre accessible', () => {
    render(EnTete, { props: { titre: 'Allergènes à signaler' } });
    expect(
      screen.getByRole('heading', { level: 1, name: 'Allergènes à signaler' })
    ).toBeInTheDocument();
  });

  it('rend la baseline hors du titre', () => {
    // Elle accompagne le titre, elle n'en fait pas partie : la faire entrer dans
    // le `h1` l'ajouterait au nom accessible de l'écran, où « Bon appétit ! »
    // n'a rien à faire.
    const { container } = render(EnTete, {
      props: { titre: 'Menu de la cantine', baseline: 'Bon appétit !' }
    });
    const titre = container.querySelector('h1');
    expect(titre?.textContent).toBe('Menu de la cantine');
    expect(screen.getByText('Bon appétit !')).toBeInTheDocument();
    expect(titre?.textContent).not.toContain('Bon appétit');
  });

  it('se passe de baseline sans rien laisser derrière', () => {
    const { container } = render(EnTete, { props: { titre: "D'où viennent ces menus" } });
    expect(container.querySelector('.baseline')).toBeNull();
  });

  it('ne porte aucune commande', () => {
    // Le réglage des allergènes vit sur l'enseigne depuis D36 : un en-tête qui
    // le reprendrait remettrait un réglage dans la ligne d'un contenu daté. Le
    // retour au repère, seule commande qu'il ait jamais admise, a quitté la
    // place à son tour (D55).
    const { container } = render(EnTete, {
      props: { titre: 'Menu de la cantine', baseline: 'Bon appétit !' }
    });
    expect(container.querySelectorAll('a, button')).toHaveLength(0);
  });
});
