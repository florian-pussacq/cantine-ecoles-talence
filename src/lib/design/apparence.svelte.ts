import { browser } from '$app/env';
import {
  appliquerApparence,
  ecrireApparence,
  lireApparence,
  stockageNavigateur,
  type Apparence,
  type StockageApparence
} from './apparence.js';

/**
 * Le choix d'apparence, tel que l'écran des réglages le lit et le change.
 *
 * Il n'est pas hydraté par la coque : le script en ligne de `app.html` a déjà
 * peint le choix avant la première peinture, et seul l'écran des réglages a
 * besoin de le connaître. Le module ne pèse donc que sur cet écran
 * (choix-d-apparence, D4).
 */
class ChoixApparence {
  #choix = $state<Apparence>('appareil');
  #persiste = $state(true);
  #stockage: StockageApparence | null = null;
  #charge = false;

  /** Relit le stockage. Sans effet côté serveur, où il n'y en a pas. */
  hydrate() {
    if (!browser || this.#charge) return;
    this.#charge = true;
    this.#stockage = stockageNavigateur();
    this.#persiste = this.#stockage !== null;
    this.#choix = lireApparence(this.#stockage);
  }

  get choix(): Apparence {
    return this.#choix;
  }

  /** Faux si le choix ne survivra pas à la fermeture de l'onglet. */
  get persiste(): boolean {
    return this.#persiste;
  }

  choisir(choix: Apparence) {
    this.#choix = choix;
    appliquerApparence(document, choix);
    this.#persiste = ecrireApparence(this.#stockage, choix);
  }
}

export const apparence = new ChoixApparence();
