/**
 * Le jour consulté, partagé par les écrans Aujourd'hui et Semaine.
 *
 * Il vit en mémoire plutôt que dans l'URL. Le site étant intégralement
 * pré-rendu, une date en paramètre d'URL ferait afficher le jour résolu au
 * chargement puis basculer côté client — un clignotement pour un bénéfice que
 * seul le partage d'un lien profond justifierait, et qui n'est pas en V1.
 *
 * Conséquence assumée : un rechargement complet ramène au jour du moment, ce qui
 * est de toute façon le comportement attendu à l'ouverture.
 */
class DaySelection {
  #date = $state<string | null>(null);

  get date(): string | null {
    return this.#date;
  }

  set(date: string) {
    this.#date = date;
  }

  reset() {
    this.#date = null;
  }
}

export const selection = new DaySelection();
