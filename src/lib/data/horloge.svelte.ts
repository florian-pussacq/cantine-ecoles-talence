import { browser } from '$app/env';

/**
 * L'instant de référence des écrans de consultation (design.md, D47).
 *
 * Les écrans lisaient jusqu'ici `new Date()` au montage. C'était juste tant que
 * l'application se consultait dans un onglet, qu'on recharge. **Une application
 * installée n'est pas rechargée : elle est mise en veille et reprise.** Un écran
 * repris après deux jours calculait donc sa cible, sa mention et son avis de
 * fraîcheur avec l'horloge d'avant-hier — et affirmait qu'un menu vieux de deux
 * jours était celui du jour.
 *
 * L'instant est donc un état, remis à l'heure quand l'application revient au
 * premier plan.
 *
 * **Il est destiné aux écrans, pas à l'usage général.** Tout ce qui le lit
 * devient réactif à la reprise et se redessinera : c'est voulu pour ce qui
 * énonce une date, et gratuit ailleurs. Une règle de temps qui n'a pas besoin
 * d'être réactive prend `now` en paramètre — c'est ce que fait
 * `resolveDisplayDay`, et c'est la discipline de D7.
 *
 * Aucune minuterie : minuit franchi sans que l'application quitte le premier
 * plan n'est pas traité. Il faudrait une horloge qui bat pour un cas où
 * l'utilisateur regarde l'écran à l'instant où il change — et le voir changer
 * sous ses yeux pendant qu'il lit poserait une autre question. La reprise couvre
 * le cas réel.
 */
/**
 * L'instant de départ.
 *
 * Au pré-rendu, il peut être imposé par `CANTINE_INSTANT` : le HTML cuit au
 * build énonce un jour, et les tests de bout en bout fixent celui du navigateur.
 * Si les deux divergent, l'hydratation change le jour affiché sous leurs yeux et
 * ce qu'ils mesurent n'a plus de sens (ci-github, D6). La variable n'est lue que
 * hors du navigateur, et le build de production ne la pose pas.
 */
function instantDeDepart(): Date {
  const impose = browser ? undefined : process.env.CANTINE_INSTANT;
  return impose ? new Date(impose) : new Date();
}

class Horloge {
  #instant = $state(instantDeDepart());
  #suivie = false;

  get instant(): Date {
    return this.#instant;
  }

  /**
   * S'abonne au retour au premier plan. À appeler une seule fois, depuis la
   * coque : plusieurs abonnements donneraient le même résultat pour plusieurs
   * écouteurs, ce qui est un coût sans contrepartie.
   */
  suivre(): void {
    if (!browser || this.#suivie) return;
    this.#suivie = true;

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.#instant = new Date();
    });
  }
}

export const horloge = new Horloge();
