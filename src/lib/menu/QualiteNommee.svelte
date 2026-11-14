<script lang="ts">
  import MarqueQualite from './MarqueQualite.svelte';
  import { estMarque, qualityLabel } from './labels.js';

  /**
   * Une qualité promue au rang de nom (design.md, D28) : « Pain » qui ne dit que
   * « Bio », ou « Label Rouge ».
   *
   * Le pictogramme est suivi du mot, et non seul : sans le mot, la ligne n'aurait
   * plus de nom (accompagnement-dans-le-plat, D4). C'est aussi la légende en
   * situation : le pain bio est servi presque chaque jour. Une mention sans
   * pictogramme reste écrite en toutes lettres.
   */
  let {
    flags,
    taille = 1,
    filet = false
  }: { flags: readonly string[]; taille?: number; filet?: boolean } = $props();
</script>

{#each flags as flag, i (flag)}{i > 0 ? ' · ' : ''}{#if estMarque(flag)}<MarqueQualite
      marque={flag}
      {taille}
      {filet}
      mot
    />{:else}{qualityLabel(flag)}{/if}{/each}
