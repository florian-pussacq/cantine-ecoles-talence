<script lang="ts">
  /**
   * Le rang qui porte ce qu'on regarde, entre les deux commandes qui le changent
   * (design.md, D55, D56).
   *
   * Il est partagé par l'écran du jour et celui de la semaine parce que les deux
   * posent la même question — « lequel ? », avec un précédent et un suivant — et
   * que la version précédente les écrivait deux fois. La duplication n'était pas
   * visible tant que le rang tenait en deux boutons ; elle l'est devenue quand
   * il a fallu y loger la mention, la date, la forme des flèches et le seuil de
   * leur bordure.
   *
   * **Les commandes sont hors de la clé de transition, leur contenu dedans**
   * (D30). Recréer les boutons à chaque changement perdrait le focus au milieu
   * d'une navigation au clavier — ce que `retour.spec.ts` vérifie. Ce qui se
   * renouvelle sous la même horloge que le contenu, c'est ce qu'ils encadrent.
   *
   * Une commande dont l'action est `null` est une borne du jeu de données : elle
   * reste présente, désactivée, et son nom accessible dit pourquoi.
   */
  type Commande = { nom: string; action: (() => void) | null };

  let {
    libelle,
    precedent,
    suivant,
    cle,
    sens,
    mention,
    principal
  }: {
    libelle: string;
    precedent: Commande;
    suivant: Commande;
    /** Ce dont le changement déclenche la transition du bloc central. */
    cle: string | null;
    sens: number;
    mention: string;
    principal: string;
  } = $props();
</script>

<nav class="rang" aria-label={libelle}>
  <button
    type="button"
    class="fleche"
    onclick={precedent.action ?? undefined}
    disabled={precedent.action === null}
    aria-label={precedent.nom}
  >
    <span aria-hidden="true">‹</span>
  </button>

  {#key cle}
    <span class="quand glisse" style:--sens={sens}>
      <span class="mention">{mention}</span>
      <span class="designation">{principal}</span>
    </span>
  {/key}

  <button
    type="button"
    class="fleche"
    onclick={suivant.action ?? undefined}
    disabled={suivant.action === null}
    aria-label={suivant.nom}
  >
    <span aria-hidden="true">›</span>
  </button>
</nav>

<style>
  .rang {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  /*
    Une flèche ronde, et non un bouton pleine largeur portant la date voisine.

    Le libellé qui y figurait — « ← Mardi 1 sept. » — disait la destination.
    Cette information n'est pas perdue : elle est passée dans `aria-label`, qui
    la porte pour le lecteur d'écran, tandis que la date affichée au centre
    suffit à l'œil. Le chevron seul serait muet ; il ne l'est pas.
  */
  .fleche {
    width: var(--touch);
    height: var(--touch);
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font: inherit;
    font-size: var(--text-xl);
    line-height: 1;
    color: var(--ink);
    background: var(--carte);
    /* Une bordure qui délimite une commande porte une information et tient donc
       3:1 (WCAG 1.4.11). Sur le fond crème, l'encre à 40 % ne mesure que 2,32:1
       — le taux qui suffisait sur l'ardoise ne suffit plus. À 55 %, elle mesure
       3,46:1, vérifié par `contrast.test.ts` (D27, D49). */
    border: 1px solid color-mix(in srgb, var(--ink) 55%, transparent);
    border-radius: 50%;
    cursor: pointer;
  }

  .fleche:disabled {
    opacity: 0.45;
    cursor: default;
  }

  .quand {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .mention {
    font-size: var(--text-xs);
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
  }

  /* Ce que le rang désigne ne se coupe jamais : c'est la seule chose que l'écran
     doit dire avant tout le reste. */
  .designation {
    font-size: var(--text-base);
    font-weight: 700;
    color: var(--ink);
    white-space: nowrap;
  }
</style>
