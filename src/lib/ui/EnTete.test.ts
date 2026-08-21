import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import EnTete from './EnTete.svelte';

describe("l'en-tête ne coupe jamais son titre", () => {
  it("porte un unique titre de premier niveau contenant l'objet et la mention", () => {
    const { container } = render(EnTete, {
      props: { quand: "Aujourd'hui", quoi: 'vendredi 8 août' }
    });

    const titres = container.querySelectorAll('h1');
    expect(titres).toHaveLength(1);
    expect(titres[0]?.textContent?.replace(/\s+/g, ' ').trim()).toBe("vendredi 8 août Aujourd'hui");
  });

  it('expose l’objet et la mention au sein du même titre accessible', () => {
    // Le lecteur d'écran doit entendre les deux, pas une date seule. C'est la
    // raison pour laquelle la mention se replie sans quitter le titre (D37).
    render(EnTete, { props: { quand: 'Cette semaine', quoi: 'du 4 au 8 août' } });
    expect(
      screen.getByRole('heading', { level: 1, name: /du 4 au 8 août.*Cette semaine/ })
    ).toBeInTheDocument();
  });

  it("rend l'objet insécable, et lui seul", () => {
    // La date a une longueur bornée, la mention non : on rend insécable ce qui
    // est borné, et l'on fait céder ce qui ne l'est pas.
    const { container } = render(EnTete, {
      props: { quand: 'Prochain service · dans 10 jours', quoi: 'Mercredi 30 septembre' }
    });

    const quoi = container.querySelector('.quoi');
    const quand = container.querySelector('.quand');
    expect(quoi?.textContent).toBe('Mercredi 30 septembre');
    expect(quand?.textContent).toBe('Prochain service · dans 10 jours');
    // Deux éléments distincts : c'est la condition pour que l'un se replie sans
    // entraîner l'autre.
    expect(quoi).not.toBe(quand);
  });

  it('ne porte aucune commande hors le retour au repère', () => {
    // Le réglage des allergènes vit sur l'enseigne depuis D36 : un en-tête qui
    // le reprendrait remettrait un réglage dans la ligne d'un contenu daté. La
    // seule commande admise ici est le retour, qui parle du jour affiché — donc
    // du contenu, et non de l'application.
    const { container } = render(EnTete, { props: { quand: 'Réglages', quoi: 'Allergènes' } });
    expect(container.querySelectorAll('a, button')).toHaveLength(0);
  });

  it('situe une date autre que celle du moment', () => {
    // C'est tout l'intérêt de la mention : « Demain » et « Menu du jour » ne
    // disent pas la même chose devant la même date.
    render(EnTete, { props: { quand: 'Demain', quoi: 'samedi 9 août' } });
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Demain');
  });
});

describe('un emplacement, deux états qui ne coexistent jamais (D44)', () => {
  const retour = { libelle: "Aujourd'hui", action: () => {} };

  it('porte la mention quand le système a choisi le jour', () => {
    const { container } = render(EnTete, {
      props: { quand: "Aujourd'hui", quoi: 'Mardi 1 septembre' }
    });
    expect(container.querySelector('.quand')).not.toBeNull();
    expect(container.querySelector('.retour')).toBeNull();
  });

  it("porte la commande quand l'utilisateur a choisi le jour", () => {
    const { container } = render(EnTete, {
      props: { quand: "Aujourd'hui", quoi: 'Vendredi 4 septembre', retour }
    });
    expect(container.querySelector('.retour')).not.toBeNull();
    // Dire « vous n'êtes pas au repère » deux fois — en texte et par la présence
    // d'un bouton de retour — serait la faute que D28 reproche au pain.
    expect(container.querySelector('.quand')).toBeNull();
  });

  it('laisse le titre complet et vrai quand la commande occupe la place', () => {
    render(EnTete, { props: { quand: "Aujourd'hui", quoi: 'Vendredi 4 septembre', retour } });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Vendredi 4 septembre');
  });

  it('annonce le retour comme une commande, et non comme une partie du titre', () => {
    // Le bouton est frère du titre : un bouton dans le `h1` entrerait dans le
    // nom accessible du titre, ce que D37 refuse pour de bonnes raisons.
    const { container } = render(EnTete, {
      props: { quand: "Aujourd'hui", quoi: 'Vendredi 4 septembre', retour }
    });
    const bouton = screen.getByRole('button', { name: /Aujourd'hui/ });
    expect(bouton).toBeInTheDocument();
    expect(container.querySelector('h1')?.contains(bouton)).toBe(false);
  });

  it('rend la main à son appelant quand la commande est actionnée', async () => {
    const action = vi.fn();
    render(EnTete, {
      props: {
        quand: "Aujourd'hui",
        quoi: 'Vendredi 4 septembre',
        retour: { libelle: 'Demain', action }
      }
    });
    screen.getByRole('button', { name: /Demain/ }).click();
    expect(action).toHaveBeenCalledOnce();
  });

  it('masque la flèche, qui ne dit rien que le libellé ne dise', () => {
    const { container } = render(EnTete, {
      props: { quand: "Aujourd'hui", quoi: 'Vendredi 4 septembre', retour }
    });
    expect(container.querySelector('.retour [aria-hidden="true"]')).not.toBeNull();
  });
});
