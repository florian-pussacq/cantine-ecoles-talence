<script lang="ts">
  import '$lib/design/tokens.css';
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import Sprite from '$lib/illustrations/Sprite.svelte';
  import { allergenFilter } from '$lib/filter/allergens.svelte.js';
  import { appUpdate } from '$lib/pwa/update.svelte.js';

  let { children } = $props();

  allergenFilter.hydrate();
  appUpdate.register();

  const tabs = [
    { path: '/', label: 'Jour' },
    { path: '/semaine', label: 'Semaine' },
    { path: '/reglages', label: 'Allergènes' }
  ] as const;
</script>

<Sprite />

<div class="shell">
  <nav class="tabs" aria-label="Écrans">
    {#each tabs as tab (tab.path)}
      {@const current = page.url.pathname.replace(/\/$/, '') === tab.path.replace(/\/$/, '')}
      <a href={resolve(tab.path)} aria-current={current ? 'page' : undefined}>{tab.label}</a>
    {/each}
  </nav>

  {#if appUpdate.available}
    <!--
      La nouvelle version attend : elle ne remplace pas l'application pendant
      qu'on la consulte, ce qui ferait perdre le jour qu'on regardait.
    -->
    <p class="update">
      <span>Une nouvelle version est disponible.</span>
      <button type="button" onclick={() => appUpdate.apply()}>Appliquer</button>
    </p>
  {/if}

  {@render children()}

  <!--
    « À propos » n'est pas un onglet : on le consulte une fois, pas tous les
    matins. Un quatrième onglet volerait de la place à ce qu'on ouvre chaque jour.
  -->
  <footer class="about">
    <a href={resolve('/a-propos')}>Source, mentions et vie privée</a>
  </footer>
</div>

<style>
  .shell {
    max-width: var(--shell);
    margin-inline: auto;
    min-height: 100dvh;
    padding: var(--space-3) var(--space-3) var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .tabs {
    display: flex;
    max-width: 360px;
    gap: var(--space-1);
    padding: 3px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--on-table) 12%, transparent);
  }

  .tabs a {
    flex: 1;
    min-height: var(--touch);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--on-table);
    text-decoration: none;
    opacity: 0.75;
  }

  .about {
    margin-top: auto;
    padding-top: var(--space-4);
    text-align: center;
  }

  .about a {
    color: var(--on-table);
    opacity: 0.7;
    font-size: var(--text-xs);
    min-height: var(--touch);
    display: inline-flex;
    align-items: center;
    padding-inline: var(--space-3);
  }

  .update {
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    background: var(--warn);
    color: var(--warn-on);
    border-radius: var(--radius-cell);
    padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    font-weight: 600;
  }

  .update button {
    font: inherit;
    font-weight: 700;
    color: var(--warn-on);
    background: none;
    border: 2px solid currentcolor;
    border-radius: 999px;
    min-height: var(--touch);
    padding-inline: var(--space-3);
    cursor: pointer;
  }

  /* L'onglet courant est signalé par un fond plein autant que par aria-current :
     ni la couleur ni l'opacité ne portent seules l'information. */
  .tabs a[aria-current='page'] {
    background: var(--tray);
    color: var(--ink);
    opacity: 1;
    font-weight: 700;
  }
</style>
