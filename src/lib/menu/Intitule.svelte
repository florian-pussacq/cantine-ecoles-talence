<script lang="ts">
  import NomQualifie from './NomQualifie.svelte';
  import type { PartieIntitule } from './labels.js';

  /**
   * L'intitulé d'un plat principal : le plat, une esperluette, puis son
   * accompagnement (accompagnement-dans-le-plat, D1).
   *
   * Le jour et la semaine le rendent tous deux par ce composant, et ne peuvent
   * donc pas diverger sur la manière de composer. Il ne pose pas d'élément
   * englobant : c'est l'appelant qui dit où l'intitulé se loge.
   *
   * L'esperluette se voit et ne se lit pas : un lecteur d'écran dit « avec », et
   * non « esperluette ». L'accompagnement se subordonne au plat par sa graisse —
   * on mange du colin avec une purée, et la purée n'est pas un second titre.
   */
  let { parties, taille = 0.8 }: { parties: PartieIntitule[]; taille?: number } = $props();
</script>

{#each parties as partie, i (i)}
  {#if i > 0}<span class="esperluette" aria-hidden="true">&amp;&nbsp;</span><span
      class="lu-seulement">&nbsp;avec&nbsp;</span
    >{/if}<span class="partie" class:accessoire={partie.accessoire}
    ><NomQualifie texte={partie.texte} flags={partie.flags} {taille} /></span
  >
{/each}

<style>
  /*
    L'espace qui précède l'esperluette est un blanc ordinaire, que la ligne peut
    rompre : collée au mot qui précède par une espace insécable, l'esperluette
    faisait déborder « wakandaise & » de sa colonne à 320 pixels, sous
    l'illustration. L'espace qui la suit, elle, est insécable : l'esperluette ne
    finit jamais une ligne. Un blanc écrit dans le balisage serait écarté à la
    compilation, d'où le contenu généré.
  */
  .esperluette::before {
    content: ' ';
  }

  .accessoire {
    font-weight: var(--poids-moyen);
  }
</style>
