import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import september from '../../../static/data/2026-09.json' with { type: 'json' };
import type { Course, MonthMenu } from '../data/schema.js';
import CourseSheet from './CourseSheet.svelte';

const menu = september as MonthMenu;
const legend = menu.allergenLegend;

/** Un plat réel du corpus, désigné par sa date et son rôle. */
function course(date: string, slot: Course['slot']): Course {
  const day = menu.days.find((d) => d.date === date);
  const found = day?.courses.find((c) => c.slot === slot);
  if (found === undefined) throw new Error(`plat absent du corpus : ${date} / ${slot}`);
  return found;
}

function sheetFor(subject: Course, onClose = () => {}) {
  return render(CourseSheet, {
    props: { course: subject, legend, pdfUrl: 'https://exemple.test/menus.pdf', onClose }
  });
}

describe('la feuille est une couche modale', () => {
  it("s'ouvre modalement dès son montage", () => {
    // La feuille n'est rendue que lorsqu'un plat est choisi : elle n'a pas
    // d'état fermé à afficher, et ne doit donc pas attendre une interaction.
    const { container } = sheetFor(course('2026-08-31', 'plat'));
    const dialog = container.querySelector('dialog');
    expect(dialog).not.toBeNull();
    expect(dialog?.open).toBe(true);
  });

  it('rend la main à son appelant quand la commande de fermeture est actionnée', async () => {
    const onClose = vi.fn();
    const { container } = sheetFor(course('2026-08-31', 'plat'), onClose);

    container.querySelector('dialog')?.close();
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });
});

describe('contenu du détail', () => {
  it('annonce le plat par un titre et son rôle', () => {
    sheetFor(course('2026-08-31', 'plat'));
    expect(screen.getByRole('heading', { name: 'Moussaka' })).toBeInTheDocument();
    expect(screen.getByText('Plat')).toBeInTheDocument();
  });

  it('nomme les allergènes en toutes lettres plutôt que par leur code', () => {
    // La moussaka porte 1, 7 et 9. Un code réglementaire ne se lit pas.
    sheetFor(course('2026-08-31', 'plat'));
    expect(screen.getByText(legend['1'] as string)).toBeInTheDocument();
    expect(screen.getByText(legend['7'] as string)).toBeInTheDocument();
    expect(screen.queryByText('1, 7, 9')).not.toBeInTheDocument();
  });

  it('distingue « aucun allergène déclaré » de « sans allergène »', () => {
    // La nuance n'est pas rhétorique : aucune donnée ne permet de promettre
    // l'absence de traces, et l'écrire autrement serait une promesse fausse.
    sheetFor(course('2026-08-31', 'dessert'));
    expect(screen.getByText('Aucun allergène déclaré')).toBeInTheDocument();
    expect(screen.getByText(/ne garantit pas l'absence de traces/)).toBeInTheDocument();
  });

  it('affiche les labels de qualité quand le plat en porte', () => {
    sheetFor(course('2026-08-31', 'plat'));
    expect(screen.getByText('Bio')).toBeInTheDocument();
  });

  it('rappelle que seul le document officiel fait foi', () => {
    sheetFor(course('2026-08-31', 'dessert'));
    expect(screen.getByText(/Seul le document officiel de la Ville fait foi/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /PDF officiel/ })).toHaveAttribute(
      'href',
      'https://exemple.test/menus.pdf'
    );
  });
});

describe('les pictogrammes ne portent aucune information seuls', () => {
  it('masque toutes les illustrations aux technologies d’assistance', () => {
    const { container } = sheetFor(course('2026-08-31', 'plat'));
    const svgs = [...container.querySelectorAll('svg')];
    expect(svgs.length).toBeGreaterThan(0);
    for (const svg of svgs) expect(svg.getAttribute('aria-hidden')).toBe('true');
  });
});
