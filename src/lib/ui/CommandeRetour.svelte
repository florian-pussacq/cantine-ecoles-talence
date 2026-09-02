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
    min-height: var(--touch);
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding-inline: var(--space-4);
    font: inherit;
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--on-accent);
    background: var(--accent);
    border: none;
    border-radius: var(--radius-pilule);
    cursor: pointer;
  }
</style>
