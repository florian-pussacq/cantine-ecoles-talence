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
   *
   * **Ce que le rang désigne est le titre de premier niveau de l'écran** (D61).
   * Sur ces deux écrans, la période affichée est la seule chose à dire avant
   * tout le reste ; le titre constant qui vivait plus haut nommait
   * l'application à l'intérieur de l'application.
   *
   * Le titre est dans la clé, et se remonte donc à chaque changement. C'est sans
   * conséquence sur son unicité : `{#key}` remplace de façon synchrone, et
   * l'animation qui suit est une animation CSS d'entrée, non une transition de
   * sortie. Il n'existe à aucun instant zéro ni deux titres de premier niveau —
   * ce que `qualite.spec.ts` mesure.
   */
  type Commande = { nom: string; action: (() => void) | null };

  let {
    libelle,
    precedent,
    suivant,
    cle,
    sens,
    mention,
    aujourdhui = false,
    principal
  }: {
    libelle: string;
    precedent: Commande;
    suivant: Commande;
    /** Ce dont le changement déclenche la transition du bloc central. */
    cle: string | null;
    sens: number;
    mention: string;
    /** Le jour désigné est le jour courant : la pastille le dit (bandeau-et-aujourdhui, D3). */
    aujourdhui?: boolean;
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
    <!-- Un `div` et non un `span` : il contient désormais un titre, qui est du
         contenu de flux et n'a rien à faire dans un élément de phrasé. -->
    <div class="quand glisse" style:--sens={sens}>
      <span class="mention">
        {#if mention}<span>{mention}</span>{/if}
        {#if aujourdhui}<span class="aujourdhui">Aujourd'hui</span>{/if}
      </span>
      <h1 class="designation">{principal}</h1>
    </div>
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
    gap: var(--espace-2);
  }

  /*
    Une flèche ronde, et non un bouton pleine largeur portant la date voisine.

    Le libellé qui y figurait — « ← Mardi 1 sept. » — disait la destination.
    Cette information n'est pas perdue : elle est passée dans `aria-label`, qui
    la porte pour le lecteur d'écran, tandis que la date affichée au centre
    suffit à l'œil. Le chevron seul serait muet ; il ne l'est pas.
  */
  .fleche {
    width: var(--cible);
    height: var(--cible);
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font: inherit;
    font-size: var(--texte-xl);
    line-height: 1;
    color: var(--encre);
    background: var(--carte);
    /* Une bordure qui délimite une commande porte une information et tient donc
       3:1 (WCAG 1.4.11). Sur le fond crème, l'encre à 40 % ne mesure que 2,32:1
       — le taux qui suffisait sur l'ardoise ne suffit plus. À 55 %, elle mesure
       3,46:1, vérifié par `contrast.test.ts` (D27, D49). */
    border: 1px solid var(--voile-trait);
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
    display: inline-flex;
    align-items: center;
    gap: var(--espace-1);
    font-size: var(--texte-xs);
    font-weight: var(--poids-titre);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
  }

  /* La même pastille que la ligne du jour de la semaine : un seul objet
     « Aujourd'hui » dans l'application (bandeau-et-aujourdhui, D3). */
  .aujourdhui {
    font-size: var(--texte-2xs);
    background: var(--accent);
    color: var(--sur-accent);
    border-radius: var(--rayon-pilule);
    padding: 0.12rem 0.42rem;
  }

  /* Ce que le rang désigne ne se coupe jamais : c'est la seule chose que l'écran
     doit dire avant tout le reste — et c'est, à ce titre, son titre de premier
     niveau (D61). Le corps reste celui d'une désignation dans un rang de
     commandes, et non celui d'un titre de page : le `h1` dit le rang dans le
     document, pas la taille à l'écran. */
  .designation {
    margin: 0;
    font-size: var(--texte-base);
    font-weight: var(--poids-fort);
    line-height: 1.35;
    color: var(--encre);
    white-space: nowrap;
  }
</style>
