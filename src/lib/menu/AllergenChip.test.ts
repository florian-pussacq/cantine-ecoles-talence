import { readFileSync } from 'node:fs';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import AllergenChip from './AllergenChip.svelte';
import { contraste } from '../design/contrast.test.js';

/**
 * Le signalement d'allergène est la seule information de santé de
 * l'application. Il ne doit donc jamais reposer sur la couleur seule, ni
 * disparaître pour qui n'utilise pas ses yeux.
 */
describe('signalement sans dépendance à la couleur', () => {
  it('nomme les allergènes en toutes lettres', () => {
    const { getByText } = render(AllergenChip, { props: { names: ['Lait'] } });
    // Un lecteur d'écran lit ce texte : le signalement n'est pas qu'un décor.
    expect(getByText('Contient lait')).toBeInTheDocument();
  });

  it('énumère les allergènes multiples', () => {
    const { getByText } = render(AllergenChip, { props: { names: ['Œufs', 'Lait'] } });
    expect(getByText('Contient : œufs, lait')).toBeInTheDocument();
  });

  it('compte les plats concernés sur la vue semaine', () => {
    const { getByText } = render(AllergenChip, {
      props: { names: ['Œufs', 'Lait'], compact: true, count: 3 }
    });
    expect(getByText('3 plats · Œufs, Lait')).toBeInTheDocument();
  });

  it('accorde le singulier', () => {
    const { getByText } = render(AllergenChip, {
      props: { names: ['Lait'], compact: true, count: 1 }
    });
    expect(getByText('1 plat · Lait')).toBeInTheDocument();
  });

  it('masque le pictogramme aux technologies d’assistance', () => {
    // Il double le texte, il ne le remplace pas : l'annoncer le ferait lire deux
    // fois.
    const { container } = render(AllergenChip, { props: { names: ['Lait'] } });
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('se distingue par une bordure épaisse, qui survit aux niveaux de gris', () => {
    const { container } = render(AllergenChip, { props: { names: ['Lait'] } });
    const chip = container.querySelector('.chip');
    expect(chip).not.toBeNull();

    // Le style du composant est lu à la source : Vitest ne l'injecte pas dans le
    // document, et une assertion sur le style calculé passerait donc toujours.
    // La bordure est une différence de forme, perceptible sans les teintes.
    const style = readFileSync('src/lib/menu/AllergenChip.svelte', 'utf8');
    expect(style).toMatch(/\.chip\s*\{[^}]*border:\s*2px/);
  });
});

describe('un pictogramme par allergène signalé (pictogrammes-allergenes)', () => {
  const pictogrammes = (container: HTMLElement) =>
    [...container.querySelectorAll('use')].map((use) => use.getAttribute('href'));

  it('dessine chaque allergène signalé, dans l’ordre du texte', () => {
    const { container, getByText } = render(AllergenChip, {
      props: { names: ['Œufs', 'Lait'], codes: [3, 7] }
    });
    expect(pictogrammes(container)).toEqual(['#alg-oeufs', '#alg-lait']);
    expect(getByText('Contient : œufs, lait')).toBeInTheDocument();
  });

  it('s’arrête à trois pictogrammes, le texte nommant tout', () => {
    const { container, getByText } = render(AllergenChip, {
      props: {
        names: ['Gluten', 'Œufs', 'Poisson', 'Lait'],
        codes: [1, 3, 4, 7],
        compact: true,
        count: 2
      }
    });
    expect(pictogrammes(container)).toEqual(['#alg-gluten', '#alg-oeufs', '#alg-poisson']);
    expect(getByText('2 plats · Gluten, Œufs, Poisson, Lait')).toBeInTheDocument();
  });

  it('garde le pictogramme de repli sans code', () => {
    const { container } = render(AllergenChip, { props: { names: ['Lait'] } });
    expect(pictogrammes(container)).toEqual(['#alg-defaut']);
  });
});

describe('lisibilité de la pastille', () => {
  it('garde son texte lisible sur son fond, donc aussi en niveaux de gris', () => {
    // La pastille est en --ink sur --chip. Un rapport de contraste est un écart
    // de luminance : le tenir, c'est le tenir aussi sans les couleurs.
    expect(contraste('#16211f', '#ffffff')).toBeGreaterThanOrEqual(4.5);
    expect(contraste('#e8eef1', '#2c3941')).toBeGreaterThanOrEqual(4.5);
  });
});
