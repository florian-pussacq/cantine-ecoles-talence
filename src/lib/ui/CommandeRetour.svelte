<script lang="ts">
  /**
   * Le retour au repère, dans son rang propre sous le contenu (design.md, D55).
   *
   * D44 la logeait dans l'en-tête, à la place de la mention, avec une hauteur
   * réservée pour qu'un balayage ne déplace rien. La réservation n'a plus
   * d'objet : la commande apparaît en fin de flux, où son arrivée ne pousse
   * aucun contenu déjà lu.
   *
   * Son libellé nomme le jour vers lequel elle ramène et ne dit jamais
   * « aujourd'hui » quand le repère n'est pas aujourd'hui : quarante pour cent
   * des jours de l'année ne sont pas servis, et un libellé fixe rouvrirait par
   * l'autre bout le trou que `targetEyebrow` a été écrit pour fermer (D45).
   *
   * **Elle ne sert plus que les deux écrans de menu** (D62). Les écrans
   * secondaires s'en servaient comme sortie, ce qui a longtemps masqué qu'il
   * s'agit de deux commandes distinctes sous un même nom : celle-ci ramène à un
   * jour, dépend du contenu et paraît quand il y a lieu ; l'autre quitte un
   * écran, est permanente, et son libellé ne se calcule pas. La seconde est
   * remontée dans l'enseigne, où sa place était vacante — voir
   * `CommandeSortie.svelte`.
   *
   * D55 n'en est pas annulé, il est restreint à ce qu'il décrivait déjà.
   */
  let { libelle, action }: { libelle: string; action: () => void } = $props();
</script>

<div class="rang">
  <button type="button" class="retour" onclick={action}>
    <span aria-hidden="true">↩</span>
    {libelle}
  </button>
</div>

<style>
  .rang {
    display: flex;
    justify-content: center;
  }

  .retour {
    min-height: var(--cible);
    display: inline-flex;
    align-items: center;
    gap: var(--espace-2);
    padding-inline: var(--espace-4);
    font: inherit;
    font-size: var(--texte-sm);
    font-weight: var(--poids-fort);
    color: var(--sur-accent);
    background: var(--accent);
    border: none;
    border-radius: var(--rayon-pilule);
    cursor: pointer;
  }
</style>
