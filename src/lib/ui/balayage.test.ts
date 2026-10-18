import { describe, expect, it, vi } from 'vitest';
import {
  AMORTI,
  createBalayage,
  decalageAffiche,
  issueDuGeste,
  type Issue,
  type Voisins
} from './balayage.js';

const LARGEUR = 400;
const LES_DEUX: Voisins = { precedent: true, suivant: true };

function harnais(voisins: Voisins = LES_DEUX) {
  const suivi: number[] = [];
  const issues: Issue[] = [];
  // Un vrai élément, et non un objet ressemblant : le code exige un `Element`
  // avant de capturer, ce qui est justement ce qu'on veut vérifier. jsdom
  // n'implémente pas la capture de pointeur, d'où l'espion posé dessus.
  const capture = vi.fn();
  const surface = document.createElement('div');
  surface.setPointerCapture = capture;
  const gestes = createBalayage({
    largeur: () => LARGEUR,
    voisins: () => voisins,
    onSuivi: (decalage) => suivi.push(decalage),
    onIssue: (issue) => issues.push(issue)
  });

  const pointeur = (x: number, y: number, t: number, pointerType = 'touch') => ({
    pointerType,
    pointerId: 1,
    clientX: x,
    clientY: y,
    timeStamp: t,
    currentTarget: surface
  });

  /**
   * Rejoue un geste du poser au lever, en `pas` mouvements régulièrement
   * espacés sur `duree` millisecondes : la vitesse se règle par la durée.
   */
  function glisser(
    de: [number, number],
    vers: [number, number],
    { duree = 300, pas = 10, pointerType = 'touch', annule = false, leve = true } = {}
  ) {
    gestes.onpointerdown(pointeur(de[0], de[1], 0, pointerType));
    for (let i = 1; i <= pas; i++) {
      const f = i / pas;
      gestes.onpointermove(
        pointeur(
          de[0] + (vers[0] - de[0]) * f,
          de[1] + (vers[1] - de[1]) * f,
          duree * f,
          pointerType
        )
      );
    }
    if (annule) return gestes.onpointercancel();
    if (leve) gestes.onpointerup(pointeur(vers[0], vers[1], duree, pointerType));
  }

  return { gestes, glisser, suivi, issues, capture };
}

describe('le contenu suit le doigt', () => {
  it('rend à chaque mouvement le décalage du doigt', () => {
    const { glisser, suivi } = harnais();
    glisser([300, 100], [200, 100], { leve: false });
    expect(suivi.at(-1)).toBe(-100);
    // Une suite croissante, et non un saut au relâchement.
    expect(suivi.length).toBeGreaterThan(5);
  });

  it('ne bouge pas avant que le doigt ait choisi un axe', () => {
    const { glisser, suivi } = harnais();
    glisser([300, 100], [294, 100], { leve: false });
    expect(suivi).toEqual([]);
  });

  it('laisse un geste vertical au défilement de la page', () => {
    const { glisser, suivi, issues } = harnais();
    glisser([200, 100], [170, 400]);
    expect(suivi).toEqual([]);
    expect(issues).toEqual([]);
  });

  it('ignore la souris', () => {
    const { glisser, suivi, issues } = harnais();
    glisser([300, 100], [100, 100], { pointerType: 'mouse' });
    expect(suivi).toEqual([]);
    expect(issues).toEqual([]);
  });
});

describe('l’issue du geste', () => {
  it('vers la gauche, assez loin, présente le suivant', () => {
    const { glisser, issues } = harnais();
    glisser([350, 100], [200, 100], { duree: 600 });
    expect(issues).toEqual(['suivant']);
  });

  it('vers la droite, assez loin, présente le précédent', () => {
    const { glisser, issues } = harnais();
    glisser([50, 100], [200, 100], { duree: 600 });
    expect(issues).toEqual(['precedent']);
  });

  it('un geste vif et court aboutit', () => {
    // 60 px en 80 ms : 0,75 px/ms, bien au-dessus du seuil de vitesse.
    const { glisser, issues } = harnais();
    glisser([300, 100], [240, 100], { duree: 80, pas: 4 });
    expect(issues).toEqual(['suivant']);
  });

  it('un geste lent et court revient en place', () => {
    // 60 px en 600 ms, sous 30 % de la largeur : ni loin, ni vite.
    const { glisser, issues } = harnais();
    glisser([300, 100], [240, 100], { duree: 600 });
    expect(issues).toEqual(['retour']);
  });

  it('revient en place si le navigateur a repris le geste', () => {
    const { glisser, issues } = harnais();
    glisser([350, 100], [100, 100], { annule: true });
    expect(issues).toEqual(['retour']);
  });

  it('ne conclut rien sans poser préalable', () => {
    const { gestes, issues } = harnais();
    gestes.onpointerup({
      pointerType: 'touch',
      pointerId: 1,
      clientX: 0,
      clientY: 0,
      timeStamp: 0,
      currentTarget: null
    });
    expect(issues).toEqual([]);
  });
});

describe('le bord du corpus', () => {
  it('amortit le mouvement vers un voisin absent', () => {
    const { glisser, suivi } = harnais({ precedent: true, suivant: false });
    glisser([300, 100], [150, 100], { leve: false });
    expect(suivi.at(-1)).toBeCloseTo(-150 * AMORTI);
  });

  it('revient toujours en place, même loin et vite', () => {
    const { glisser, issues } = harnais({ precedent: true, suivant: false });
    glisser([390, 100], [10, 100], { duree: 100 });
    expect(issues).toEqual(['retour']);
  });

  it('laisse libre le côté où le voisin existe', () => {
    expect(decalageAffiche(80, { precedent: true, suivant: false })).toBe(80);
  });
});

describe('issueDuGeste, sans événement', () => {
  it('exige la vitesse dans le sens de la course', () => {
    // Le doigt a reculé au dernier moment : la course dit « suivant », la
    // vitesse dit l'inverse. Ni assez loin, ni vif dans le bon sens : retour.
    expect(issueDuGeste({ dx: -60, vitesse: 0.8, largeur: LARGEUR, voisins: LES_DEUX })).toBe(
      'retour'
    );
  });

  it('aboutit à 30 % de la largeur, quelle que soit la vitesse', () => {
    expect(issueDuGeste({ dx: -120, vitesse: 0, largeur: LARGEUR, voisins: LES_DEUX })).toBe(
      'suivant'
    );
  });
});

describe('capture du pointeur', () => {
  it('capture dès le poser, pour que le lever revienne même hors de la surface', () => {
    const { glisser, capture } = harnais();
    glisser([300, 100], [100, 100]);
    expect(capture).toHaveBeenCalledWith(1);
  });

  it('ne capture pas pour la souris', () => {
    const { glisser, capture } = harnais();
    glisser([300, 100], [100, 100], { pointerType: 'mouse' });
    expect(capture).not.toHaveBeenCalled();
  });
});

describe('suppression du clic de fin de course', () => {
  const clic = () => ({ preventDefault: vi.fn(), stopPropagation: vi.fn() });

  it('supprime le clic qui suit un balayage abouti', () => {
    const { glisser, gestes } = harnais();
    glisser([350, 100], [100, 100]);
    const evenement = clic();
    gestes.onclickcapture(evenement);
    expect(evenement.preventDefault).toHaveBeenCalled();
    expect(evenement.stopPropagation).toHaveBeenCalled();
  });

  it('supprime aussi le clic qui suit un geste revenu en place', () => {
    // Le doigt a bougé de côté : ce n'était pas une tape sur la journée.
    const { glisser, gestes } = harnais();
    glisser([300, 100], [240, 100], { duree: 600 });
    const evenement = clic();
    gestes.onclickcapture(evenement);
    expect(evenement.preventDefault).toHaveBeenCalled();
  });

  it('laisse passer un clic qui ne suit aucun balayage', () => {
    const { gestes } = harnais();
    const evenement = clic();
    gestes.onclickcapture(evenement);
    expect(evenement.preventDefault).not.toHaveBeenCalled();
  });

  it("ne supprime qu'un seul clic", () => {
    const { glisser, gestes } = harnais();
    glisser([350, 100], [100, 100]);
    gestes.onclickcapture(clic());
    const second = clic();
    gestes.onclickcapture(second);
    expect(second.preventDefault).not.toHaveBeenCalled();
  });

  it("un drapeau resté levé faute de clic ne mange pas l'interaction suivante", () => {
    const { glisser, gestes } = harnais();
    glisser([350, 100], [100, 100]);
    // Un nouveau poser, sans glissement : une tape.
    glisser([200, 100], [200, 100], { pas: 1 });
    const evenement = clic();
    gestes.onclickcapture(evenement);
    expect(evenement.preventDefault).not.toHaveBeenCalled();
  });
});
