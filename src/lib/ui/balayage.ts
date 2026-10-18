/**
 * Le balayage horizontal, isolé de tout écran (design.md, D17).
 *
 * La fonction ne touche ni au DOM, ni à l'horloge, ni à aucun store : elle
 * reçoit des événements horodatés et appelle des rappels. Les seuils sont
 * exactement le genre de règle qu'on veut éprouver sans navigateur — même
 * discipline que `resolveDisplayDay` (menus-jour-semaine, D7).
 *
 * Elle suit le doigt (carrousel-des-jours, D1) : à chaque mouvement elle rend le
 * décalage à appliquer au contenu, et au relâchement l'issue du geste. C'est le
 * carrousel qui en fait un mouvement à l'écran.
 *
 * Le geste double la navigation, il ne la remplace pas : les commandes visibles
 * et le clavier restent le chemin principal, un geste ne se découvrant pas et
 * n'étant pas atteignable au clavier.
 *
 * La surface qui porte ces gestionnaires DOIT déclarer `touch-action: pan-y`.
 * Sans cela, le navigateur revendique le mouvement pour son propre défilement
 * et émet `pointercancel` : le `pointerup` n'arrive jamais et le geste meurt en
 * silence. C'est la panne qu'a connue ce projet, constatée en D18.
 */

/** Course, en pixels, avant laquelle le geste n'a pas encore d'axe. */
export const SEUIL_AXE = 10;
/** Part de la largeur au-delà de laquelle le geste aboutit, quelle que soit sa vitesse. */
export const FRACTION_ISSUE = 0.3;
/** Vitesse, en pixels par milliseconde, au-delà de laquelle un geste court aboutit. */
export const VITESSE_ISSUE = 0.4;
/** Part du mouvement que suit le contenu vers un voisin qui n'existe pas. */
export const AMORTI = 1 / 3;
/** Fenêtre, en millisecondes, sur laquelle se mesure la vitesse au relâchement. */
const FENETRE_VITESSE = 100;

export type Issue = 'precedent' | 'suivant' | 'retour';
export type Voisins = { precedent: boolean; suivant: boolean };

/** Le strict nécessaire d'un `PointerEvent`, pour pouvoir tester sans DOM. */
type Pointeur = {
  pointerType: string;
  pointerId: number;
  clientX: number;
  clientY: number;
  timeStamp: number;
  currentTarget: EventTarget | null;
};

/** Le strict nécessaire d'un `MouseEvent`. */
type Clic = {
  preventDefault: () => void;
  stopPropagation: () => void;
};

/** Le décalage montré pour une course `dx` : amorti vers un voisin absent. */
export function decalageAffiche(dx: number, voisins: Voisins): number {
  const versUnVoisin = dx < 0 ? voisins.suivant : voisins.precedent;
  return versUnVoisin ? dx : dx * AMORTI;
}

/**
 * L'issue d'un geste horizontal : assez loin, ou assez vif dans le même sens,
 * et vers un voisin qui existe. Sinon, le contenu revient en place.
 */
export function issueDuGeste({
  dx,
  vitesse,
  largeur,
  voisins
}: {
  dx: number;
  vitesse: number;
  largeur: number;
  voisins: Voisins;
}): Issue {
  if (dx === 0) return 'retour';
  const sens = dx < 0 ? 'suivant' : 'precedent';
  if (!voisins[sens]) return 'retour';
  if (Math.abs(dx) >= largeur * FRACTION_ISSUE) return sens;
  const vif = Math.abs(vitesse) >= VITESSE_ISSUE && Math.sign(vitesse) === Math.sign(dx);
  return vif ? sens : 'retour';
}

export type OptionsBalayage = {
  /** La largeur du contenu, qui rapporte la course à une part de l'écran. */
  largeur: () => number;
  /** Les voisins qui existent, lus au moment du geste. */
  voisins: () => Voisins;
  /** Le décalage à montrer, à chaque mouvement d'un geste horizontal. */
  onSuivi: (decalage: number) => void;
  /** L'issue d'un geste horizontal, au relâchement ou à l'annulation. */
  onIssue: (issue: Issue) => void;
};

export function createBalayage({ largeur, voisins, onSuivi, onIssue }: OptionsBalayage) {
  /** Le point de départ du geste en cours, ou `null` s'il n'y en a pas. */
  let depart: { x: number; y: number } | null = null;
  /** L'axe du geste : indécis tant que le doigt n'a pas assez bougé. */
  let axe: 'indecis' | 'horizontal' | 'vertical' = 'indecis';
  /** Les dernières positions horodatées, pour mesurer la vitesse. */
  let traces: { x: number; t: number }[] = [];

  /**
   * Un geste horizontal vient de finir, et le `click` qui suit doit être
   * supprimé : le doigt a glissé de côté, ce n'était pas une tape.
   *
   * Le drapeau est remis à zéro à chaque `pointerdown` : un clic légitime est
   * toujours précédé du sien, donc un drapeau resté levé faute de clic ne peut
   * jamais manger l'interaction suivante.
   */
  let consomme = false;

  function vitesse(x: number, t: number): number {
    const recentes = traces.filter((trace) => t - trace.t <= FENETRE_VITESSE);
    const reference = recentes[0];
    if (reference === undefined || t === reference.t) return 0;
    return (x - reference.x) / (t - reference.t);
  }

  function finir(issue: Issue) {
    depart = null;
    axe = 'indecis';
    traces = [];
    onIssue(issue);
  }

  return {
    onpointerdown(event: Pointeur) {
      consomme = false;
      if (event.pointerType === 'mouse') return;
      depart = { x: event.clientX, y: event.clientY };
      axe = 'indecis';
      traces = [{ x: event.clientX, t: event.timeStamp }];

      const cible = event.currentTarget;
      if (cible instanceof Element && typeof cible.setPointerCapture === 'function') {
        cible.setPointerCapture(event.pointerId);
      }
    },

    onpointermove(event: Pointeur) {
      if (depart === null || axe === 'vertical') return;
      const dx = event.clientX - depart.x;
      const dy = event.clientY - depart.y;

      if (axe === 'indecis') {
        if (Math.hypot(dx, dy) < SEUIL_AXE) return;
        axe = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
        if (axe === 'vertical') return;
      }

      traces.push({ x: event.clientX, t: event.timeStamp });
      onSuivi(decalageAffiche(dx, voisins()));
    },

    onpointerup(event: Pointeur) {
      if (depart === null) return;
      if (axe !== 'horizontal') {
        depart = null;
        axe = 'indecis';
        return;
      }
      consomme = true;
      finir(
        issueDuGeste({
          dx: event.clientX - depart.x,
          vitesse: vitesse(event.clientX, event.timeStamp),
          largeur: largeur(),
          voisins: voisins()
        })
      );
    },

    onpointercancel() {
      if (depart === null) return;
      if (axe === 'horizontal') finir('retour');
      depart = null;
      axe = 'indecis';
    },

    /**
     * Le geste démarre sur le déjeuner, qui est un bouton : sans cela, le
     * `click` de fin de course ouvrirait sa fiche par-dessus le jour changé.
     * L'interception est en phase de capture, donc avant que l'événement
     * n'atteigne le bouton.
     */
    onclickcapture(event: Clic) {
      if (!consomme) return;
      consomme = false;
      event.preventDefault();
      event.stopPropagation();
    }
  };
}
