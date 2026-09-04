<script lang="ts">
  /**
   * Le titre d'un écran secondaire (design.md, D55, D61).
   *
   * Il ne porte plus qu'un titre. Tout ce qu'il portait en plus a été rendu à
   * des endroits où c'est plus utile :
   *
   * - la mention qui situe le jour affiché est descendue dans le rang de
   *   navigation, entre les deux commandes qui la font changer ;
   * - la commande de retour au repère a pris un rang propre, sous les cartes ;
   * - la baseline a disparu, faute d'avoir jamais rien dit (D61).
   *
   * D44 avait donné aux deux premières un emplacement unique, occupé par l'une
   * ou par l'autre, avec une hauteur réservée pour qu'un balayage ne déplace
   * rien. Cette réservation n'a plus d'objet : la commande apparaît désormais en
   * fin de flux, où son arrivée ne pousse aucun contenu déjà lu.
   *
   * Il ne sert plus les écrans de menu : leur titre de premier niveau est la
   * période affichée, portée par `RangNavigation`. Un titre constant y nommait
   * l'application à l'intérieur de l'application.
   *
   * Le contrat s'en trouve rétréci trois fois de suite, jamais élargi.
   */
  let { titre }: { titre: string } = $props();
</script>

<header>
  <h1>{titre}</h1>
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
</style>
