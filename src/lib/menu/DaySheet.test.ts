import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import september from '../../../static/data/2026-09.json' with { type: 'json' };
import type { ResolvedDay } from '../data/dataset.js';
import type { MonthMenu } from '../data/schema.js';
import DaySheet from './DaySheet.svelte';

const menu = september as MonthMenu;
const legend = menu.allergenLegend;

/** Un jour réel du corpus, augmenté de ce que l'affichage attend. */
function jour(date: string): ResolvedDay {
  const day = menu.days.find((d) => d.date === date);
  if (day === undefined) throw new Error(`jour absent du corpus : ${date}`);
  return {
    ...day,
    month: menu.month,
    legend,
    source: { ...menu.source, pdfUrl: 'https://exemple.test/menus.pdf' }
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

function sheetFor(date: string, onClose = () => {}) {
  return render(DaySheet, { props: { day: jour(date), onClose } });
}

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
