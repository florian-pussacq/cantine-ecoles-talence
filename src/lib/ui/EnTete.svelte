<script lang="ts">
  /**
   * L'en-tête de tous les écrans : ce que l'écran montre, et pour quand.
   *
   * Le titre — la date sur l'écran du jour, la période sur celui de la semaine —
   * ne se coupe jamais (design.md, D37). Il a une longueur bornée et connue,
   * vingt et un caractères au pire ; la mention qui le situe va de dix à
   * trente et un. On rend donc insécable ce qui est borné, et l'on fait céder ce
   * qui ne l'est pas. Auparavant l'inverse se produisait : `text-wrap: balance`
   * coupait la date pour loger la mention, et la contrainte était subie par
   * l'élément important au profit de l'accessoire.
   *
   * **Un emplacement, deux états qui ne coexistent jamais** (design.md, D44).
   *
   * Le même emplacement porte la mention ou la commande de retour, selon qui a
   * choisi le jour affiché. Quand le système a choisi — week-end, vacances —
   * c'est la mention, et elle vit **dans** le titre : elle couvre un choix fait
   * à la place de l'utilisateur, et doit donc entrer dans le nom accessible du
   * titre, ce que D37 a établi. Quand l'utilisateur a navigué lui-même, le titre
   * dit la date, ce qui est complet et vrai, et le retour est une commande —
   * frère du titre, annoncée comme une commande.
   *
   * L'en-tête ne porte aucune autre commande : le réglage des allergènes vit sur
   * l'enseigne, qui est la ligne de l'application et non celle d'un contenu
   * daté (D36).
   *
   * Le titre de premier niveau reste unique par écran : c'est une exigence
   * vérifiée de bout en bout, et le repère principal d'un lecteur d'écran.
   */
  let {
    quand,
    quoi,
    retour = null
  }: {
    quand: string;
    quoi: string;
    /** Le retour au repère, lorsque l'utilisateur s'en est éloigné. */
    retour?: { libelle: string; action: () => void } | null;
  } = $props();
</script>

<header>
  <h1>
    <span class="quoi">{quoi}</span>
    <!--
      La mention s'efface quand la commande prend sa place : dire « vous n'êtes
      pas au repère » deux fois, une fois en texte et une fois par la présence
      d'un bouton de retour, serait la faute que D28 reproche au compartiment du
      pain — le même fait, deux fois, dans deux tailles.
    -->
    {#if retour === null}
      <span class="quand">{quand}</span>
    {/if}
  </h1>

  {#if retour !== null}
    <button type="button" class="retour" onclick={retour.action}>
      <!-- La flèche ne dit rien que le libellé ne dise : elle le décore. -->
      <span aria-hidden="true">↩</span>
      {retour.libelle}
    </button>
  {/if}
</header>

<style>
  /*
    Deux lignes, et la seconde est réservée qu'elle porte la mention ou la
    commande.

    Elles ont d'abord partagé la ligne du titre. Mesuré : « Mercredi 2 septembre »
    occupe 215 pixels et « ↩ Prochain service » 149, soit 372 sur les 388
    disponibles — cinq pixels de marge avec la date la plus longue du calendrier,
    et un repli garanti sur toute plateforme dont la police est un peu plus
    large. Or un bouton qui se replie fait passer l'en-tête de 47 à 78 pixels :
    précisément le saut que la réserve existe pour empêcher.

    Sur sa propre ligne, la mention n'a plus besoin de se replier — 31 caractères
    en petites capitales tiennent largement sur 388 pixels — et la commande ne
    concurrence plus le titre. Le gain n'est donc pas que mécanique : deux blocs
    de poids comparables qui se disputent une ligne se lisent moins bien qu'un
    titre suivi de ce qui le situe.

    La réserve elle-même est le raisonnement de D32 pour la pastille
    d'allergènes, repris tel quel : la place d'un élément intermittent se
    réserve, elle ne se prend pas.
  */
  header {
    color: var(--on-table);
    padding-inline: var(--space-2);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  /*
    Le titre porte la date, puis la mention lorsqu'elle est là — en colonne, sur
    deux lignes distinctes.

    Le séparateur en point médian a disparu avec la phrase qu'il ponctuait : deux
    éléments dans deux corps très différents, sur deux lignes, se distinguent
    sans qu'on ajoute un signe à masquer aux technologies d'assistance.
  */
  h1 {
    margin: 0;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    font-size: var(--text-xl);
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  /*
    `nowrap` est la décision, tout le reste n'est que mise en forme : la date est
    rendue entière ou pas du tout, et il n'existe pas de largeur à laquelle elle
    se brise. `text-wrap: balance` a disparu pour la même raison — il n'avait
    d'effet que sur un titre qu'on autorisait à couper.
  */
  .quoi {
    white-space: nowrap;
  }

  /* La mention occupe la hauteur d'une cible tactile sans en être une : c'est la
     réserve, et c'est ce qui fait que la commande peut prendre sa place sans
     rien déplacer. */
  .quand {
    min-height: var(--touch);
    display: flex;
    align-items: center;
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--on-table) 72%, transparent);
  }

  /*
    La commande emprunte la forme des boutons de jour — pilule bordée, même taux
    de transparence — parce que c'est déjà le vocabulaire de la navigation dans
    le temps sur cet écran. Le taux de 40 % est celui que D27 a mesuré : sur le
    fond de la table, un mélange à 35 % ne tient pas les 3:1 qu'une bordure
    délimitant une commande exige.
  */
  .retour {
    min-height: var(--touch);
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding-inline: var(--space-3);
    font: inherit;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--on-table);
    background: none;
    border: 1px solid color-mix(in srgb, var(--on-table) 40%, transparent);
    border-radius: 999px;
    cursor: pointer;
    white-space: nowrap;
  }

  .retour:focus-visible {
    outline: 3px solid var(--on-table);
    outline-offset: 2px;
  }
</style>
