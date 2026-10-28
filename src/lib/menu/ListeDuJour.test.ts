import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import edgeCases from '../../../fixtures/edge-cases.json' with { type: 'json' };
import september from '../../../static/data/2026-09.json' with { type: 'json' };
import { buildDataset } from '../data/dataset.js';
import type { MonthMenu } from '../data/schema.js';
import ListeDuJour from './ListeDuJour.svelte';

const edges = buildDataset([{ menu: edgeCases as MonthMenu }]);
const real = buildDataset([{ menu: september as MonthMenu }]);

function trayFor(dataset: typeof edges, date: string) {
  const day = dataset.byDate.get(date);
  if (day === undefined) throw new Error(`jour absent du fixture : ${date}`);
  return render(ListeDuJour, { props: { day } });
}

describe('la liste ne se referme pas', () => {
  it("dit explicitement qu'il n'y a pas d'entrée", () => {
    // Le 2 janvier du fixture n'a ni entrée ni laitage ni goûter.
    trayFor(edges, '2099-01-02');
    expect(screen.getByText("Pas d'entrée ce jour")).toBeInTheDocument();
    expect(screen.getByText('Pas de laitage ce jour')).toBeInTheDocument();
  });

  it('conserve les six rôles du déjeuner quel que soit le jour', () => {
    const { container } = trayFor(edges, '2099-01-02');
    // Les rôles sont interrogés par leur classe : « Pain » est à la fois un rôle
    // et un libellé de plat, une recherche par texte confondrait les deux.
    const roles = [...container.querySelectorAll('.role')].map((node) => node.textContent);
    expect(roles).toEqual(['Plat', 'Entrée', 'Accompagnement', 'Laitage', 'Dessert', 'Pain']);
  });

  it('donne un élément à chaque rôle, servi ou non', () => {
    const { container } = trayFor(edges, '2099-01-02');
    expect(container.querySelectorAll('.plat')).toHaveLength(6);
    // Un creux se distingue d'un contenu autrement que par son absence.
    expect(container.querySelectorAll('.plat.vide').length).toBeGreaterThan(0);
  });

  it("ouvre sur le plat principal, puis suit l'ordre du service, le pain fermant la liste", () => {
    // Le plat principal répond à la question qu'on pose à l'écran
    // (refonte-signaletique, D7). Le pain n'est pas servi à un moment du repas :
    // il est sur la table du début à la fin, et trente-trois jours sur
    // trente-cinq il s'appelle « Pain » (design.md, D39).
    const { container } = trayFor(real, '2026-09-03');
    const roles = [...container.querySelectorAll('.role')].map((node) => node.textContent);
    expect(roles[0]).toBe('Plat');
    expect(roles[1]).toBe('Entrée');
    expect(roles.at(-1)).toBe('Pain');
  });

  it("n'affiche pas le goûter dans le déjeuner", () => {
    // Le 7 janvier en comporte un : il est rendu ailleurs, hors du déjeuner.
    trayFor(edges, '2099-01-07');
    expect(screen.queryByText('Pain + chocolat')).not.toBeInTheDocument();
  });
});

describe('la forme suit le contenu (lignes-compactes)', () => {
  it('ramène un rôle absent à une ligne compacte, sans vignette', () => {
    const { container } = trayFor(edges, '2099-01-02');
    const vides = [...container.querySelectorAll('.plat.vide')];
    expect(vides).toHaveLength(2);
    for (const ligne of vides) {
      expect(ligne).toHaveClass('compacte');
      expect(ligne.querySelector('.vignette')).toBeNull();
    }
  });

  it('garde une ligne entière, avec sa vignette, à chaque rôle servi', () => {
    // Le 2 septembre sert tout sauf le laitage.
    const { container } = trayFor(real, '2026-09-02');
    const servies = [...container.querySelectorAll('.plat:not(.vide)')];
    expect(servies).toHaveLength(5);
    for (const plat of servies) {
      expect(plat).not.toHaveClass('compacte');
      expect(plat.querySelector('.vignette')).not.toBeNull();
    }
    expect(container.querySelector('.plat.vide')).toHaveClass('compacte');
  });

  it('ne compose aucun rôle au-dessus du nom de son plat', () => {
    // Le surtitre est le défaut qu'Impeccable refuse sans exception
    // (refonte-signaletique, D7). Dans une ligne, le rôle a sa colonne, qui
    // précède celle du nom ; sur l'aplat, il suit le nom.
    const { container } = trayFor(real, '2026-09-03');
    for (const plat of container.querySelectorAll('.plat:not(.vide)')) {
      const role = plat.querySelector('.role') as Element;
      const nom = plat.querySelector('.nom') as Element;
      if (plat.classList.contains('principal')) {
        expect(nom.compareDocumentPosition(role) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      } else {
        expect(role.parentElement).toBe(plat);
        expect(nom.parentElement).not.toBe(plat);
      }
    }
  });
});

describe('la couleur dit la famille du plat principal (couleur-par-famille)', () => {
  it('pose le plat principal sur l’aplat de sa famille, et la nomme', () => {
    // Le 3 septembre sert un blanc de poulet : volaille, comme sa tuile sur
    // l'écran de la semaine.
    const { container } = trayFor(real, '2026-09-03');
    const principale = container.querySelector('.plat.principal');
    expect(principale?.classList.contains('famille')).toBe(true);
    expect(principale?.getAttribute('style')).toContain('var(--fam-volaille)');
    expect(principale?.querySelector('.famille-nom')?.textContent).toBe('Volaille');
  });

  it('laisse les autres rôles en encre', () => {
    // Une entrée « végétarienne » au sens de classify() ne dit rien de la
    // famille du repas : seul le plat principal est coloré (D3).
    const { container } = trayFor(real, '2026-09-03');
    const autres = [...container.querySelectorAll('.plat:not(.principal)')];
    expect(autres.length).toBeGreaterThan(0);
    for (const plat of autres) {
      expect(plat.classList.contains('famille')).toBe(false);
      expect(plat.getAttribute('style') ?? '').not.toContain('--fam-');
      expect(plat.querySelector('.famille-nom')).toBeNull();
    }
  });

  it('ne devine pas la famille d’un plat inclassable', () => {
    // La moussaka du 31 août : couleur de repli, aucun nom de famille.
    const { container } = trayFor(real, '2026-08-31');
    const principale = container.querySelector('.plat.principal');
    expect(principale?.getAttribute('style')).toContain('var(--fam-inconnu)');
    expect(principale?.querySelector('.famille-nom')).toBeNull();
  });

  it('ne porte plus aucune couleur de rôle', () => {
    const { container } = trayFor(real, '2026-09-03');
    expect(container.innerHTML).not.toContain('--role');
  });
});

describe('le dessin accompagne chaque plat (D51)', () => {
  it('illustre tous les rôles servis', () => {
    // D40 réservait le dessin au plat principal, pour qu'il signifie « c'est le
    // plat du jour ». Ce sens est abandonné : l'illustration ne hiérarchise
    // plus, elle ancre le regard dans une liste devenue longue.
    const { container } = trayFor(real, '2026-09-03');
    const plats = container.querySelectorAll('.plat');
    const dessins = container.querySelectorAll('.illustration');
    expect(dessins).toHaveLength(plats.length);
  });

  it('accepte deux fois le même dessin le même jour', () => {
    /*
      Le 31 août sert « Panibuns aux fromages » et « Fromage » : deux laitages,
      un seul dessin. La règle qui l'interdisait est levée, et rien ne tente de
      les différencier.

      Ce test portait sur le 1er septembre, dont l'entrée et l'accompagnement
      relevaient tous deux du paquet « légume ». La bibliothèque affinée les a
      séparés (D59) — c'est le but, et c'est pourquoi le jour de référence a
      changé plutôt que l'assertion.
    */
    const { container } = trayFor(real, '2026-08-31');
    const href = [...container.querySelectorAll('.illustration use')].map((n) =>
      n.getAttribute('href')
    );
    expect(href.length).toBeGreaterThan(new Set(href).size);
  });

  it("n'illustre pas un rôle sans plat", () => {
    // Poser le repli « inconnu » sur une absence signalerait une donnée là où il
    // n'y en a pas — l'inverse de ce que la carte vide est là pour dire.
    const { container } = trayFor(edges, '2099-01-02');
    for (const vide of container.querySelectorAll('.plat.vide')) {
      expect(vide.querySelector('.illustration')).toBeNull();
    }
  });

  it('laisse chaque plat identifiable par son libellé et son rôle', () => {
    // Les illustrations comme les glyphes de rôle sont décoratifs : ils sont
    // masqués aux technologies d'assistance, et le menu doit rester complet
    // sans eux.
    const { container } = trayFor(real, '2026-09-03');
    for (const svg of container.querySelectorAll('svg')) {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    }
    expect(screen.getByText('Blanc de poulet au jus')).toBeInTheDocument();
    expect(container.querySelector('.plat.principal .role')?.textContent).toBe('Plat');
    expect(screen.getByText('Écrasé de pommes de terre')).toBeInTheDocument();
  });
});

describe("la liste n'est pas actionnable (D38)", () => {
  it("ne porte aucune cible : c'est la journée qui en est une", () => {
    // Chaque plat était une cible, ce qui lui imposait 44 pixels de hauteur et
    // rendait le déjeuner incompressible. La cible vit désormais dans l'écran,
    // autour de cette liste.
    const { container } = trayFor(real, '2026-09-03');
    expect(container.querySelectorAll('button, a')).toHaveLength(0);
  });
});
