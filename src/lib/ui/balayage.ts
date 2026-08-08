/**
 * Le balayage horizontal, isolé de tout écran (design.md, D17).
 *
 * La fonction ne touche ni au DOM, ni à l'horloge, ni à aucun store : elle
 * reçoit des événements et appelle des rappels. Les seuils sont exactement le
 * genre de règle qu'on veut éprouver sans navigateur — même discipline que
 * `resolveDisplayDay` (menus-jour-semaine, D7).
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

/** Le strict nécessaire d'un `PointerEvent`, pour pouvoir tester sans DOM. */
type Pointeur = {
  pointerType: string;
  pointerId: number;
  clientX: number;
  clientY: number;
  currentTarget: EventTarget | null;
};

/** Le strict nécessaire d'un `MouseEvent`. */
type Clic = {
  preventDefault: () => void;
  stopPropagation: () => void;
};

export type OptionsBalayage = {
  onPrevious: () => void;
  onNext: () => void;
  /** Course horizontale minimale, en pixels, sous laquelle rien ne se déclenche. */
  seuil?: number;
  /** Rapport minimal entre course horizontale et verticale pour que le geste compte. */
  horizontalite?: number;
};

export function createBalayage({
  onPrevious,
  onNext,
  seuil = 60,
  horizontalite = 1.5
}: OptionsBalayage) {
  /** Le point de départ du geste en cours, ou `null` s'il n'y en a pas. */
  let depart: { x: number; y: number } | null = null;

  /**
   * Un balayage vient d'aboutir, et le `click` qui suit doit être supprimé.
   *
   * Le drapeau est remis à zéro à chaque `pointerdown` : un clic légitime est
   * toujours précédé du sien, donc un drapeau resté levé faute de clic ne peut
   * jamais manger l'interaction suivante.
   */
  let consomme = false;

  return {
    onpointerdown(event: Pointeur) {
      consomme = false;
      // La souris est exclue : un glisser à la souris n'est pas un balayage, et
      // les commandes visibles la servent déjà.
      if (event.pointerType === 'mouse') return;
      depart = { x: event.clientX, y: event.clientY };

      // Le doigt sort du rectangle de la surface avant de se lever dès que le
      // balayage traverse l'écran. Sans capture, le `pointerup` se produit
      // ailleurs et ne remonte pas jusqu'ici.
      const cible = event.currentTarget;
      if (cible instanceof Element && typeof cible.setPointerCapture === 'function') {
        cible.setPointerCapture(event.pointerId);
      }
    },

    onpointerup(event: Pointeur) {
      if (depart === null) return;
      const dx = event.clientX - depart.x;
      const dy = event.clientY - depart.y;
      depart = null;

      if (Math.abs(dx) < seuil) return;
      if (Math.abs(dx) < Math.abs(dy) * horizontalite) return;

      consomme = true;
      if (dx < 0) onNext();
      else onPrevious();
    },

    onpointercancel() {
      depart = null;
    },

    /**
     * Le geste démarre sur une cellule, qui est un bouton : sans cela, le
     * `click` de fin de course ouvrirait son détail par-dessus le jour changé.
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
