import { render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import september from '../../../static/data/2026-09.json' with { type: 'json' };
import toussaint from '../../../static/data/2026-10-vacances.json' with { type: 'json' };
import { allergenFilter } from '../filter/allergens.svelte.js';
import type { ResolvedDay } from '../data/dataset.js';
import type { MonthMenu } from '../data/schema.js';
import FicheJour from './FicheJour.svelte';

const menu = september as MonthMenu;
const legend = menu.allergenLegend;

/** Un jour réel du corpus, augmenté de ce que l'affichage attend. */
function jour(date: string, source: MonthMenu = menu): ResolvedDay {
  const day = source.days.find((d) => d.date === date);
  if (day === undefined) throw new Error(`jour absent du corpus : ${date}`);
  return {
    ...day,
    month: source.month,
    legend: source.allergenLegend,
    source: { ...source.source, pdfUrl: 'https://exemple.test/menus.pdf' },
    sourceKind: 'monthly',
    title: null
  };
}

/**
 * Un jour qui sert les sept rôles. Le corpus est réel et la Ville réédite ses
 * PDF en cours de mois : figer une date ici ferait tomber le test au premier
 * jour où un laitage disparaît, ce qui ne dit rien de l'ordre d'affichage.
 */
function jourComplet(): string {
  const day = menu.days.find((d) => d.courses.length === 7);
  if (day === undefined) throw new Error('aucun jour ne sert les sept rôles dans le corpus');
  return day.date;
}

function sheetFor(date: string, onClose = () => {}, source: MonthMenu = menu) {
  return render(FicheJour, { props: { day: jour(date, source), onClose } });
}

/** Le filtre est un état partagé : chaque test le règle, et le rend vide. */
function surveiller(...codes: number[]) {
  for (const code of codes) allergenFilter.toggle(code);
}

afterEach(() => allergenFilter.clear());

describe('la feuille est une couche modale', () => {
  it("s'ouvre modalement dès son montage", () => {
    // La feuille n'est rendue que lorsque le menu est actionné : elle n'a pas
    // d'état fermé à afficher, et ne doit donc pas attendre une interaction.
    const { container } = sheetFor('2026-08-31');
    const dialog = container.querySelector('dialog');
    expect(dialog).not.toBeNull();
    expect(dialog?.open).toBe(true);
  });

  it('rend la main à son appelant quand la commande de fermeture est actionnée', async () => {
    const onClose = vi.fn();
    const { container } = sheetFor('2026-08-31', onClose);

    container.querySelector('dialog')?.close();
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });
});

describe('la feuille porte la journée, pas un plat', () => {
  it('annonce la date en titre', () => {
    sheetFor('2026-08-31');
    expect(screen.getByRole('heading', { name: 'Lundi 31 août' })).toBeInTheDocument();
  });

  it('liste tous les plats du jour en une seule ouverture', () => {
    // C'est la raison d'être de D38 : la question posée est « la journée
    // contient-elle un allergène », et six ouvertures n'y répondaient pas.
    sheetFor('2026-08-31');
    for (const nom of ['Moussaka', 'Panibuns aux fromages', 'Fromage', 'Fruit de saison']) {
      expect(screen.getByText(nom)).toBeInTheDocument();
    }
  });

  it('inclut le goûter, qui fait partie de la journée', () => {
    sheetFor('2026-08-31');
    expect(screen.getByText('Goûter')).toBeInTheDocument();
    expect(screen.getByText('Pain au lait Bio + Lingotin')).toBeInTheDocument();
  });

  it("suit l'ordre de l'écran, pour que les deux lectures se correspondent", () => {
    const { container } = sheetFor(jourComplet());
    const roles = [...container.querySelectorAll('.plat-role')].map((n) => n.textContent);
    expect(roles).toEqual([
      'Entrée',
      'Plat',
      'Accompagnement',
      'Laitage',
      'Dessert',
      'Pain',
      'Goûter'
    ]);
  });

  it("n'inscrit pas les rôles que le jour ne sert pas", () => {
    // L'absence est déjà énoncée sur l'écran du jour ; la répéter ici
    // allongerait la liste sans rien apprendre.
    const { container } = sheetFor('2026-08-31');
    const roles = [...container.querySelectorAll('.plat-role')].map((n) => n.textContent);
    expect(roles).not.toContain('Accompagnement');
  });
});

describe('contenu du détail', () => {
  it('nomme les allergènes en toutes lettres plutôt que par leur code', () => {
    // La moussaka porte 1, 7 et 9. Un code réglementaire ne se lit pas.
    sheetFor('2026-08-31');
    expect(screen.getAllByText(legend['1'] as string).length).toBeGreaterThan(0);
    expect(screen.getAllByText(legend['7'] as string).length).toBeGreaterThan(0);
    expect(screen.queryByText('1, 7, 9')).not.toBeInTheDocument();
  });

  it('distingue « aucun allergène déclaré » de « sans allergène »', () => {
    // La nuance n'est pas rhétorique : aucune donnée ne permet de promettre
    // l'absence de traces, et l'écrire autrement serait une promesse fausse.
    sheetFor('2026-08-31');
    expect(screen.getAllByText('Aucun allergène déclaré').length).toBeGreaterThan(0);
    expect(screen.getByText(/ne garantit pas l'absence de traces/)).toBeInTheDocument();
  });

  it('affiche les labels de qualité quand un plat en porte', () => {
    sheetFor('2026-08-31');
    expect(screen.getAllByText(/Bio/).length).toBeGreaterThan(0);
  });

  it('rappelle que seul le document officiel fait foi', () => {
    sheetFor('2026-08-31');
    expect(screen.getByText(/Seul le document officiel de la Ville fait foi/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /PDF officiel/ })).toHaveAttribute(
      'href',
      'https://exemple.test/menus.pdf'
    );
  });
});

describe('les pictogrammes ne portent aucune information seuls', () => {
  it('masque toutes les illustrations aux technologies d’assistance', () => {
    const { container } = sheetFor('2026-08-31');
    const svgs = [...container.querySelectorAll('svg')];
    expect(svgs.length).toBeGreaterThan(0);
    for (const svg of svgs) expect(svg.getAttribute('aria-hidden')).toBe('true');
  });
});

/*
  Le 31 août : pain [gluten], panibuns [gluten, œufs, lait], moussaka [gluten,
  lait, céleri], fromage [lait], fruit [rien], goûter [gluten, œufs, lait,
  fruits à coques]. Le filtre se règle avant le rendu, comme à l'ouverture
  réelle de la fiche.
*/
describe('la fiche met en avant ce que le parent surveille (alerte-et-fiche-cochee)', () => {
  it("s'ouvre sur un résumé qui associe chaque allergène surveillé à ses plats", () => {
    surveiller(7, 1);
    const { container } = sheetFor('2026-08-31');
    const resume = container.querySelector('.resume');
    expect(resume).not.toBeNull();

    // L'ordre est celui de la légende, et les plats celui de l'écran.
    const lignes = [...(resume?.querySelectorAll('li') ?? [])].map((li) => li.textContent?.trim());
    expect(lignes).toEqual([
      expect.stringMatching(
        /^Gluten\s*Panibuns aux fromages, Moussaka, Pain, Pain au lait Bio \+ Lingotin$/
      ),
      expect.stringMatching(
        /^Lait\s*Panibuns aux fromages, Moussaka, Fromage, Pain au lait Bio \+ Lingotin$/
      )
    ]);
  });

  it("dit qu'aucun plat ne déclare un allergène surveillé, sans promettre son absence", () => {
    surveiller(5);
    const { container } = sheetFor('2026-08-31');
    const resume = container.querySelector('.resume');
    expect(resume?.textContent).toMatch(/Arachides\s*Aucun plat ne le déclare/);
    expect(resume?.textContent).not.toMatch(/sans arachide|ne contient pas/i);
  });

  it('place les allergènes surveillés en tête de chaque plat, marqués en toutes lettres', () => {
    surveiller(7);
    const { container } = sheetFor('2026-08-31');
    const panibuns = [...container.querySelectorAll('.plats > li')].find((li) =>
      li.textContent?.includes('Panibuns aux fromages')
    );
    const pastilles = [...(panibuns?.querySelectorAll('.allergens li') ?? [])];

    expect(pastilles.map((li) => li.querySelector('.nom')?.textContent)).toEqual([
      'Lait',
      legend['1'],
      'Œufs'
    ]);
    // La marque est un texte, que lit un lecteur d'écran et qui tient en gris.
    expect(pastilles[0]?.textContent).toMatch(/surveillé/);
    expect(pastilles[0]?.classList.contains('surveille')).toBe(true);
    expect(pastilles[1]?.textContent).not.toMatch(/surveillé/);
  });

  it('reste inchangée quand rien n’est surveillé', () => {
    const { container } = sheetFor('2026-08-31');
    expect(container.querySelector('.resume')).toBeNull();
    expect(container.querySelector('.surveille')).toBeNull();
    expect(screen.queryByText(/surveillé/)).not.toBeInTheDocument();
    expect(screen.queryByText(/réglages/i)).not.toBeInTheDocument();
  });

  it('avertit, un jour sans allergènes précisés, de ce qui ne peut pas être vérifié', () => {
    surveiller(7);
    const { container } = sheetFor('2026-10-19', () => {}, toussaint as MonthMenu);
    expect(container.querySelector('.resume')).toBeNull();

    const alerte = container.querySelector('.non-precise');
    expect(alerte?.textContent).toMatch(/ne précise pas/);
    expect(alerte?.textContent).toMatch(/Lait/);
    expect(alerte?.querySelector('a')).toHaveAttribute('href', 'https://exemple.test/menus.pdf');
  });

  it("n'avertit pas un jour sans allergènes précisés si rien n'est surveillé", () => {
    const { container } = sheetFor('2026-10-19', () => {}, toussaint as MonthMenu);
    expect(container.querySelector('.non-precise')).toBeNull();
  });
});
