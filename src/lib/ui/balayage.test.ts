import { describe, expect, it, vi } from 'vitest';
import { createBalayage } from './balayage.js';

function harnais(options: Partial<Parameters<typeof createBalayage>[0]> = {}) {
  const onPrevious = vi.fn();
  const onNext = vi.fn();
  // Un vrai élément, et non un objet ressemblant : le code exige un `Element`
  // avant de capturer, ce qui est justement ce qu'on veut vérifier. jsdom
  // n'implémente pas la capture de pointeur, d'où l'espion posé dessus.
  const capture = vi.fn();
  const surface = document.createElement('div');
  surface.setPointerCapture = capture;
  const gestes = createBalayage({ onPrevious, onNext, ...options });

  /** Rejoue un geste complet, du poser au lever. */
  function glisser(
    de: [number, number],
    vers: [number, number],
    pointerType = 'touch',
    annule = false
  ) {
    gestes.onpointerdown({
      pointerType,
      pointerId: 1,
      clientX: de[0],
      clientY: de[1],
      currentTarget: surface
    });
    if (annule) {
      gestes.onpointercancel();
      return;
    }
    gestes.onpointerup({
      pointerType,
      pointerId: 1,
      clientX: vers[0],
      clientY: vers[1],
      currentTarget: surface
    });
  }

  return { onPrevious, onNext, capture, gestes, glisser };
}

describe('sens du geste', () => {
  it('vers la gauche demande le suivant', () => {
    const { glisser, onNext, onPrevious } = harnais();
    glisser([300, 100], [100, 100]);
    expect(onNext).toHaveBeenCalledOnce();
    expect(onPrevious).not.toHaveBeenCalled();
  });

  it('vers la droite demande le précédent', () => {
    const { glisser, onNext, onPrevious } = harnais();
    glisser([100, 100], [300, 100]);
    expect(onPrevious).toHaveBeenCalledOnce();
    expect(onNext).not.toHaveBeenCalled();
  });
});

describe('ce qui ne doit rien déclencher', () => {
  it('ignore une course plus courte que le seuil', () => {
    const { glisser, onNext } = harnais();
    glisser([300, 100], [259, 100]); // 41 px, sous les 60 par défaut
    expect(onNext).not.toHaveBeenCalled();
  });

  it('ignore un geste trop vertical, fût-il long horizontalement', () => {
    // 100 px de côté pour 260 px de haut : c'est un défilement.
    const { glisser, onNext, onPrevious } = harnais();
    glisser([100, 40], [200, 300]);
    expect(onNext).not.toHaveBeenCalled();
    expect(onPrevious).not.toHaveBeenCalled();
  });

  it('ignore la souris', () => {
    const { glisser, onNext } = harnais();
    glisser([300, 100], [100, 100], 'mouse');
    expect(onNext).not.toHaveBeenCalled();
  });

  it("n'aboutit pas si le navigateur a repris le geste", () => {
    // C'est la panne de D18 : `pointercancel` sans `pointerup`.
    const { gestes, onNext } = harnais();
    gestes.onpointerdown({
      pointerType: 'touch',
      pointerId: 1,
      clientX: 300,
      clientY: 100,
      currentTarget: null
    });
    gestes.onpointercancel();
    gestes.onpointerup({
      pointerType: 'touch',
      pointerId: 1,
      clientX: 100,
      clientY: 100,
      currentTarget: null
    });
    expect(onNext).not.toHaveBeenCalled();
  });

  it('ne déclenche pas sur un lever sans poser préalable', () => {
    const { gestes, onNext } = harnais();
    gestes.onpointerup({
      pointerType: 'touch',
      pointerId: 1,
      clientX: 100,
      clientY: 100,
      currentTarget: null
    });
    expect(onNext).not.toHaveBeenCalled();
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
    glisser([300, 100], [100, 100], 'mouse');
    expect(capture).not.toHaveBeenCalled();
  });
});

describe('suppression du clic de fin de course', () => {
  function clic() {
    return { preventDefault: vi.fn(), stopPropagation: vi.fn() };
  }

  it('supprime le clic qui suit un balayage abouti', () => {
    const { glisser, gestes } = harnais();
    glisser([300, 100], [100, 100]);
    const event = clic();
    gestes.onclickcapture(event);
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(event.stopPropagation).toHaveBeenCalledOnce();
  });

  it('laisse passer un clic qui ne suit aucun balayage', () => {
    const { gestes } = harnais();
    const event = clic();
    gestes.onclickcapture(event);
    expect(event.stopPropagation).not.toHaveBeenCalled();
  });

  it("ne supprime qu'un seul clic", () => {
    const { glisser, gestes } = harnais();
    glisser([300, 100], [100, 100]);
    gestes.onclickcapture(clic());
    const suivant = clic();
    gestes.onclickcapture(suivant);
    expect(suivant.stopPropagation).not.toHaveBeenCalled();
  });

  it("un drapeau resté levé faute de clic ne mange pas l'interaction suivante", () => {
    // Le balayage aboutit sans qu'aucun clic ne suive — puis l'utilisateur
    // touche une cellule. Ce clic-là doit atteindre son bouton.
    const { glisser, gestes } = harnais();
    glisser([300, 100], [100, 100]);
    glisser([100, 100], [104, 102]); // simple pression, sous le seuil
    const event = clic();
    gestes.onclickcapture(event);
    expect(event.stopPropagation).not.toHaveBeenCalled();
  });
});

describe('seuils paramétrables', () => {
  it('respecte un seuil resserré', () => {
    const { glisser, onNext } = harnais({ seuil: 20 });
    glisser([300, 100], [270, 100]); // 30 px
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("respecte une contrainte d'horizontalité relâchée", () => {
    // 100 px de côté pour 260 de haut : il faut descendre sous 0,385 pour que
    // ce geste passe. C'est bien un réglage, pas une désactivation.
    const { glisser, onPrevious } = harnais({ horizontalite: 0.3 });
    glisser([100, 40], [200, 300]); // vers la droite, donc le précédent
    expect(onPrevious).toHaveBeenCalledOnce();
  });
});
