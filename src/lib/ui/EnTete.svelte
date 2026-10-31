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
  /*
    Sur l'axe gauche de la colonne, dans la coupe d'affichage : comme le titre
    des écrans de menu. Centré, il était la seule entorse à la grille
    (finitions-et-plat-inconnu, D6).
  */
  header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--espace-1);
  }

  h1 {
    margin: 0;
    font-family: var(--police-affichage);
    font-size: var(--texte-2xl);
    font-weight: var(--poids-titre);
    letter-spacing: var(--serrage-intitule);
    line-height: 1.1;
    color: var(--encre);
    text-wrap: balance;
  }
</style>
