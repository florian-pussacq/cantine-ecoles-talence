<script lang="ts">
  import EnTete from '$lib/ui/EnTete.svelte';
  import { allergenFilter } from '$lib/filter/allergens.svelte.js';
  import { ALLERGEN_CODES } from '$lib/filter/storage.js';
  import type { PageProps } from './$types.js';

  let { data }: PageProps = $props();

  /**
   * Les libellés viennent des données, pas du code.
   *
   * La légende est imprimée sur le document source et peut y être formulée
   * autrement ; la recopier ici la ferait diverger en silence.
   */
  const legend = $derived(
    [...data.dataset.byDate.values()][0]?.legend ?? ({} as Record<string, string>)
  );

  const rows = $derived(
    ALLERGEN_CODES.map((code) => ({
      code,
      name: legend[String(code)] ?? `Allergène ${code}`
    }))
  );

  const count = $derived(allergenFilter.codes.size);
</script>

<svelte:head>
  <title>Allergènes à signaler — menus des écoles de Talence</title>
</svelte:head>

<EnTete quand="Réglages" quoi="Allergènes à signaler" />

<div class="panel">
  <p class="intro">
    Les plats contenant l'un des allergènes cochés seront signalés sur les écrans du jour et de la
    semaine. Ce réglage reste sur cet appareil et n'est jamais envoyé nulle part.
  </p>

  {#if !allergenFilter.persists}
    <p class="warn">
      Le stockage de ce navigateur est indisponible : votre choix ne sera pas conservé après la
      fermeture de l'onglet. Le reste de l'application fonctionne normalement.
    </p>
  {/if}

  <ul>
    {#each rows as row (row.code)}
      <li>
        <label>
          <input
            type="checkbox"
            checked={allergenFilter.has(row.code)}
            onchange={() => allergenFilter.toggle(row.code)}
          />
          <span>{row.name}</span>
        </label>
      </li>
    {/each}
  </ul>

  <div class="foot">
    <!--
      Aucune invitation insistante quand rien n'est coché : consulter un menu sans
      filtre est un usage complet, pas un état inachevé.
    -->
    <span
      >{count === 0
        ? 'Aucun allergène signalé'
        : `${count} allergène${count > 1 ? 's' : ''} signalé${count > 1 ? 's' : ''}`}</span
    >
    {#if count > 0}
      <button type="button" onclick={() => allergenFilter.clear()}>Tout décocher</button>
    {/if}
  </div>

  <p class="legal">
    <strong>Seul le document officiel de la Ville fait foi.</strong> Cette application n'est pas un service
    municipal, ne remplace pas un PAI, et l'absence d'allergène déclaré ne garantit pas l'absence de traces.
  </p>
</div>

<style>
  .panel {
    background: var(--tray);
    color: var(--ink);
    border-radius: var(--radius-tray);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .intro {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--ink-muted);
    line-height: 1.5;
  }

  .warn {
    margin: 0;
    background: var(--warn);
    color: var(--warn-on);
    border-radius: var(--radius-cell);
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    font-weight: 600;
    line-height: 1.4;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  li + li {
    border-top: 1px solid var(--edge);
  }

  label {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-height: var(--touch);
    padding-block: var(--space-1);
    font-size: var(--text-base);
    cursor: pointer;
  }

  input {
    width: 24px;
    height: 24px;
    flex: none;
    accent-color: var(--table);
    cursor: pointer;
  }

  input:focus-visible {
    outline: 3px solid var(--ink);
    outline-offset: 2px;
  }

  .foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    border-top: 1px solid var(--edge);
    padding-top: var(--space-3);
    font-size: var(--text-sm);
    color: var(--ink-muted);
  }

  .foot button {
    font: inherit;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--ink);
    background: none;
    border: 1px solid var(--edge);
    border-radius: 999px;
    min-height: var(--touch);
    padding-inline: var(--space-3);
    cursor: pointer;
  }

  .legal {
    margin: 0;
    font-size: 0.75rem;
    color: var(--ink-muted);
    line-height: 1.45;
  }

  .legal strong {
    color: var(--ink);
  }
</style>
