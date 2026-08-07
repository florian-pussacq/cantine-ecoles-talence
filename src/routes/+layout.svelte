<script lang="ts">
  import '$lib/design/tokens.css';
  import Sprite from '$lib/illustrations/Sprite.svelte';

  let { children } = $props();
</script>

<Sprite />

<div class="shell">
  {@render children()}
</div>

<style>
  .shell {
    max-width: 520px;
    margin-inline: auto;
    min-height: 100dvh;
    padding: var(--space-4) var(--space-3) var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
</style>
