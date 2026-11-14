<script lang="ts">
  import { qualityLabel, type QualityMark } from './labels.js';

  /**
   * Le pictogramme d'une mention de qualité, Bio ou Label Rouge
   * (accompagnement-dans-le-plat, D4).
   *
   * Contrairement aux illustrations, il n'est pas décoratif : il porte une
   * mention que le texte ne redit pas, et il a donc un nom accessible, lu par les
   * technologies d'assistance et affiché en info-bulle sur bureau. Le `<title>`
   * double l'`aria-label` pour les lecteurs qui ne lisent que l'un des deux.
   *
   * Il se dimensionne en `em` et suit ainsi le corps du texte qu'il accompagne :
   * `taille` en est le multiple. La pastille claire qui le détache de la surface
   * est le fond de l'élément (D5) ; `filet` y ajoute le trait qui l'empêche de se
   * fondre dans une surface elle aussi claire.
   *
   * Avec `mot`, le nom de la mention s'écrit à côté du pictogramme : c'est la
   * légende en situation (D6), sur la fiche de journée et pour une qualité promue
   * au rang de nom (D4). Le mot porte alors l'information, et le dessin se tait
   * pour que la mention ne soit pas lue deux fois.
   */
  let {
    marque,
    taille = 1,
    filet = false,
    mot = false
  }: { marque: QualityMark; taille?: number; filet?: boolean; mot?: boolean } = $props();

  const nom = $derived(qualityLabel(marque));
</script>

{#snippet dessin()}
  <svg
    class="marque"
    class:filet
    style:width={`${taille}em`}
    style:height={`${taille}em`}
    role={mot ? undefined : 'img'}
    aria-label={mot ? undefined : nom}
    aria-hidden={mot ? 'true' : undefined}
    focusable="false"
  >
    {#if !mot}<title>{nom}</title>{/if}
    <use href={`#marque-${marque}`} />
  </svg>
{/snippet}

{#if mot}
  <span class="mention">{@render dessin()}<span class="mot">{nom}</span></span>
{:else}
  {@render dessin()}
{/if}

<style>
  .marque {
    display: inline-block;
    flex: none;
    box-sizing: border-box;
    padding: 0.12em;
    border-radius: var(--rayon-pastille);
    background: var(--marque-fond);
    vertical-align: -0.2em;
    margin-inline-start: 0.3em;
  }

  .mention .marque {
    margin-inline-start: 0;
  }

  .mention {
    white-space: nowrap;
  }

  .mot {
    margin-inline-start: 0.3em;
  }

  .filet {
    border: 1px solid var(--bord);
  }
</style>
