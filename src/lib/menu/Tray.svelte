<script lang="ts">
  import Illustration from '../illustrations/Illustration.svelte';
  import { classify } from '../illustrations/families.js';
  import type { ResolvedDay } from '../data/dataset.js';
  import type { Course } from '../data/schema.js';
  import {
    allergenNames,
    LUNCH_SLOTS,
    qualityLabel,
    shortAllergenName,
    slotAbsence,
    slotLabel
  } from './labels.js';
  import { allergenFilter } from '../filter/allergens.svelte.js';
  import AllergenChip from './AllergenChip.svelte';

  let { day, onSelect }: { day: ResolvedDay; onSelect: (course: Course) => void } = $props();

  /** Les allergènes cochés que porte ce plat : leurs codes et leurs noms courts. */
  function flagged(course: Course) {
    const codes = allergenFilter.matching(course);
    return {
      codes,
      names: allergenNames({ ...course, allergens: codes }, day.legend).map((allergen) =>
        shortAllergenName(allergen.name)
      )
    };
  }

  /**
   * Les six compartiments du déjeuner, dans l'ordre du service.
   *
   * La grille ne se referme jamais sur un rôle absent : un creux vide reste
   * distinguable d'une donnée manquante, ce qu'une grille compactée rendrait
   * impossible (design.md, D12).
   */
  const compartments = $derived(
    LUNCH_SLOTS.map((slot) => ({
      slot,
      course: day.courses.find((course) => course.slot === slot) ?? null
    }))
  );
</script>

<div class="tray">
  {#each compartments as { slot, course } (slot)}
    {#if slot === 'plat'}
      {@const match = course ? classify(course.label) : null}
      <div
        class="cell main"
        class:empty={course === null}
        style:--fam={match ? `var(--fam-${match.family})` : 'var(--fam-inconnu)'}
        style:--on={match ? `var(--fam-${match.family}-on)` : 'var(--fam-inconnu-on)'}
      >
        {#if course && match}
          <button type="button" class="reset main-button" onclick={() => onSelect(course)}>
            <span class="disc"><Illustration name={match.illustration} size={46} /></span>
            <span class="main-body">
              <span class="role on-fam">{slotLabel(slot)}</span>
              <span class="main-name">{course.label}</span>
              {#if course.flags.length > 0}
                <span class="tags">
                  {#each course.flags as flag (flag)}<em>{qualityLabel(flag)}</em>{/each}
                </span>
              {/if}
              {#if flagged(course).codes.length > 0}
                <AllergenChip {...flagged(course)} />
              {/if}
            </span>
          </button>
        {:else}
          <span class="role">{slotLabel(slot)}</span>
          <span class="absent">{slotAbsence(slot)}</span>
        {/if}
      </div>
    {:else}
      {@const wide = slot === 'dessert'}
      <div class="cell" class:wide class:empty={course === null}>
        {#if course}
          {@const match = classify(course.label)}
          <button type="button" class="reset cell-button" onclick={() => onSelect(course)}>
            <span class="cell-top">
              <span class="role">{slotLabel(slot)}</span>
              <Illustration name={match.illustration} size={34} />
            </span>
            <span class="name">{course.label}</span>
            {#if course.flags.length > 0}
              <span class="tags muted-tags">
                {#each course.flags as flag (flag)}<em>{qualityLabel(flag)}</em>{/each}
              </span>
            {/if}
            {#if flagged(course).codes.length > 0}
              <AllergenChip {...flagged(course)} />
            {/if}
          </button>
        {:else}
          <span class="role">{slotLabel(slot)}</span>
          <span class="absent">{slotAbsence(slot)}</span>
        {/if}
      </div>
    {/if}
  {/each}
</div>

<style>
  .tray {
    background: var(--tray);
    border-radius: var(--radius-tray);
    padding: 8px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .cell {
    background: var(--cell);
    border: 1px solid var(--edge);
    border-radius: var(--radius-cell);
    min-height: 112px;
    display: flex;
    flex-direction: column;
    padding: 0;
  }

  .cell.wide,
  .cell.main {
    grid-column: 1 / -1;
    min-height: 0;
  }

  .cell.empty {
    background: var(--cell-empty);
    border-style: dashed;
    padding: var(--space-3);
    gap: var(--space-2);
    justify-content: space-between;
    min-height: 112px;
  }

  .reset {
    font: inherit;
    color: inherit;
    background: none;
    border: 0;
    text-align: left;
    cursor: pointer;
    width: 100%;
  }

  .cell-button {
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-height: 110px;
  }

  .cell-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .role {
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--ink-muted);
  }

  .name {
    font-size: var(--text-base);
    font-weight: 600;
    line-height: 1.25;
    margin-top: auto;
  }

  .absent {
    font-size: var(--text-sm);
    font-style: italic;
    color: var(--ink-muted);
    margin-top: auto;
  }

  /* Le compartiment du plat porte la couleur de sa famille. */
  .main {
    background: var(--fam);
    border-color: rgba(0, 0, 0, 0.22);
    color: var(--on);
  }

  .main-button {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
  }

  /*
    L'illustration repose sur un disque clair et jamais sur l'aplat saturé :
    un poisson bleu sur fond bleu ne se voit pas.
  */
  .disc {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: var(--tray);
    display: grid;
    place-items: center;
    flex: none;
  }

  .main-body {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }

  .on-fam {
    color: currentColor;
    opacity: 0.82;
  }

  .main-name {
    font-size: var(--text-xl);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.12;
    text-wrap: balance;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    margin-top: 0.15rem;
  }

  .tags em {
    font-style: normal;
    font-size: 0.5625rem;
    font-weight: 800;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    border: 1.5px solid currentColor;
    border-radius: 999px;
    padding: 0.08rem 0.4rem;
    opacity: 0.9;
  }

  .muted-tags {
    color: var(--ink-muted);
  }

  button:focus-visible {
    outline: 3px solid var(--ink);
    outline-offset: -3px;
  }

  .main button:focus-visible {
    outline-color: var(--on);
  }
</style>
