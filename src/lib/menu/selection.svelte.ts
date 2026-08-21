/**
 * Le jour consulté, partagé par les écrans Aujourd'hui et Semaine.
 *
 * Il vit en mémoire plutôt que dans l'URL. Le site étant intégralement
 * pré-rendu, une date en paramètre d'URL ferait afficher le jour résolu au
 * chargement puis basculer côté client — un clignotement pour un bénéfice que
 * seul le partage d'un lien profond justifierait, et qui n'est pas en V1.
 *
 * **Un choix ne vaut que pour la journée où il a été fait** (design.md, D47).
 *
 * Le commentaire d'origine assumait qu'« un rechargement complet ramène au jour
 * du moment ». C'était vrai d'un onglet de navigateur. Une application installée
 * n'est pas rechargée : elle est mise en veille et reprise, et le choix
 * survivait donc au jour où il avait été fait. Un parent qui consultait vendredi
 * un lundi, puis rouvrait l'application le mercredi, lisait le menu du vendredi
 * sous la mention « Menu du jour ». C'est exactement le risque nommé en D15, à
 * ceci près que l'écran ne se contentait pas de le taire : il l'affirmait.
 *
 * Le choix mémorise donc le jour civil de sa pose, et se lit à travers le jour
 * courant. Il n'est effacé par aucun écouteur ni aucune minuterie : il cesse
 * simplement de valoir, ce qui évite un état à tenir synchronisé avec un autre.
 *
 * Le jour est un paramètre et non une lecture de l'horloge : la règle s'éprouve
 * ainsi sans manipuler le temps système, même discipline que `resolveDisplayDay`
 * (design.md, D7).
 */
class DaySelection {
  #date = $state<string | null>(null);
  /** Le jour civil où le choix a été fait, et au-delà duquel il ne vaut plus. */
  #pose = $state<string | null>(null);

  /**
   * Le jour choisi, s'il vaut encore le jour civil donné.
   *
   * Rend `null` lorsque aucun choix n'a été fait, ou lorsque le choix date d'un
   * autre jour — l'écran retombe alors sur le jour que le système résout, ce qui
   * est le comportement attendu d'une nouvelle consultation.
   */
  dateLe(jour: string): string | null {
    if (this.#pose !== jour) return null;
    return this.#date;
  }

  set(date: string, jour: string) {
    this.#date = date;
    this.#pose = jour;
  }

  reset() {
    this.#date = null;
    this.#pose = null;
  }
}

export const selection = new DaySelection();
