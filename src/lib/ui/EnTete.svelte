<script lang="ts">
  /**
   * Le titre d'un écran (design.md, D55).
   *
   * Il ne porte plus qu'un titre et, facultativement, une baseline. Ce qu'il
   * portait en plus a été rendu à des endroits où c'est plus utile :
   *
   * - la mention qui situe le jour affiché est descendue dans le rang de
   *   navigation, entre les deux commandes qui la font changer ;
   * - la commande de retour au repère a pris un rang propre, sous les cartes.
   *
   * D44 avait donné à ces deux-là un emplacement unique, occupé par l'une ou par
   * l'autre, avec une hauteur réservée pour qu'un balayage ne déplace rien.
   * Cette réservation n'a plus d'objet : la commande apparaît désormais en fin
   * de flux, où son arrivée ne pousse aucun contenu déjà lu.
   *
   * Le contrat s'en trouve rétréci, pas élargi — et c'est le seul cas où
   * annuler une décision simplifie le composant qu'elle avait compliqué.
   */
  let { titre, baseline }: { titre: string; baseline?: string } = $props();
</script>

<header>
  <h1>{titre}</h1>
  {#if baseline}
    <p class="baseline">{baseline}</p>
  {/if}
</header>

<style>
  header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    text-align: center;
  }

  h1 {
    margin: 0;
    font-size: var(--text-2xl);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.1;
    color: var(--ink);
    text-wrap: balance;
  }

  .baseline {
    margin: 0;
    font-size: var(--text-base);
    font-weight: 700;
    color: var(--accent);
  }
</style>
