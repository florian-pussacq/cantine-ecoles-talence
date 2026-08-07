<script lang="ts">
  import type { Illustration } from './families.js';

  /**
   * Une illustration de plat.
   *
   * Toujours décorative : elle ne porte aucune information absente du texte, et
   * le menu reste intégralement compréhensible sans elle. C'est pourquoi elle
   * est masquée aux technologies d'assistance.
   */
  let { name, size = 34 }: { name: Illustration; size?: number } = $props();
</script>

<svg width={size} height={size} aria-hidden="true" focusable="false" class="illustration">
  <use href={`#ill-${name}`} />
</svg>

<style>
  .illustration {
    display: block;
    flex: none;
  }
</style>
