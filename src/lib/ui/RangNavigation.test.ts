import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import RangNavigation from './RangNavigation.svelte';

const base = {
  libelle: 'Navigation entre les jours',
  precedent: { nom: 'Jour précédent : mardi 1 septembre', action: () => {} },
  suivant: { nom: 'Jour suivant : jeudi 3 septembre', action: () => {} },
  cle: '2026-09-02',
  sens: 1,
  mention: "Aujourd'hui",
  principal: 'mercredi 2 septembre'
};

describe('le rang porte ce que ses commandes changent (D55)', () => {
  it('énonce la mention et la date entre les deux flèches', () => {
    const { container } = render(RangNavigation, { props: base });
    expect(screen.getByText("Aujourd'hui")).toBeInTheDocument();
    expect(screen.getByText('mercredi 2 septembre')).toBeInTheDocument();

    // L'ordre visuel est l'ordre du document : la commande, ce qu'elle change,
    // la commande. C'est cet encadrement qui évite l'aller-retour du regard.
    const enfants = [...(container.querySelector('.rang')?.children ?? [])];
    expect(enfants).toHaveLength(3);
    expect(enfants[0]?.tagName).toBe('BUTTON');
    expect(enfants[2]?.tagName).toBe('BUTTON');
  });

  it("n'est rendu qu'une fois : il n'y a plus qu'un rang de flèches (D56)", () => {
    const { container } = render(RangNavigation, { props: base });
    expect(container.querySelectorAll('nav')).toHaveLength(1);
    expect(container.querySelectorAll('button')).toHaveLength(2);
  });

  it('nomme la destination de chaque flèche', () => {
    // Le libellé « ← Mardi 1 sept. » a disparu de l'écran au profit d'un
    // chevron. L'information n'est pas perdue : elle est passée dans le nom
    // accessible, sans quoi le chevron serait muet.
    render(RangNavigation, { props: base });
    expect(
      screen.getByRole('button', { name: 'Jour précédent : mardi 1 septembre' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Jour suivant : jeudi 3 septembre' })
    ).toBeInTheDocument();
  });

  it('masque le chevron, qui ne dit rien que le nom accessible ne dise', () => {
    const { container } = render(RangNavigation, { props: base });
    for (const chevron of container.querySelectorAll('button span')) {
      expect(chevron.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('désactive une borne du jeu de données en disant pourquoi', () => {
    render(RangNavigation, {
      props: { ...base, suivant: { nom: 'Fin des menus', action: null } }
    });
    const fin = screen.getByRole('button', { name: 'Fin des menus' });
    expect(fin).toBeDisabled();
    // La commande reste présente : la faire disparaître ferait sauter la mise
    // en page au dernier jour publié, et priverait l'écran de dire pourquoi.
    expect(fin).toBeInTheDocument();
  });

  it('rend la main à son appelant quand une flèche est actionnée', () => {
    const action = vi.fn();
    render(RangNavigation, { props: { ...base, precedent: { nom: 'Précédent', action } } });
    screen.getByRole('button', { name: 'Précédent' }).click();
    expect(action).toHaveBeenCalledOnce();
  });

  it("porte le repère d'accessibilité que l'écran lui donne", () => {
    render(RangNavigation, { props: { ...base, libelle: 'Navigation entre les semaines' } });
    expect(
      screen.getByRole('navigation', { name: 'Navigation entre les semaines' })
    ).toBeInTheDocument();
  });

  it("désigne la période comme titre de premier niveau de l'écran (D61)", () => {
    const { container } = render(RangNavigation, { props: base });

    const titres = container.querySelectorAll('h1');
    expect(titres).toHaveLength(1);
    expect(titres[0]?.textContent).toBe('mercredi 2 septembre');
    expect(
      screen.getByRole('heading', { level: 1, name: 'mercredi 2 septembre' })
    ).toBeInTheDocument();
  });

  it("garde la mention hors du titre, où elle n'est pas le nom de l'écran", () => {
    // La mention situe, elle ne nomme pas. La faire entrer dans le `h1`
    // ajouterait « Aujourd'hui » au nom accessible de l'écran, qui changerait
    // alors de sens d'un jour à l'autre sans que l'écran ait changé.
    const { container } = render(RangNavigation, { props: base });
    expect(container.querySelector('h1')?.textContent).not.toContain("Aujourd'hui");
  });

  it('ne loge pas de contenu de flux dans un élément de phrasé', () => {
    // Le titre est du contenu de flux : son conteneur ne peut pas être un
    // `span`, qui n'en admet pas.
    const { container } = render(RangNavigation, { props: base });
    expect(container.querySelector('span h1')).toBeNull();
  });
});
