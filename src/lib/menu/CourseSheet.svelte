<script lang="ts">
  import Illustration from '../illustrations/Illustration.svelte';
  import { classify } from '../illustrations/families.js';
  import type { Course } from '../data/schema.js';
  import { allergenNames, qualityLabel, slotLabel } from './labels.js';
  import ExternalLink from '../ui/ExternalLink.svelte';

  let {
    course,
    legend,
    pdfUrl,
    onClose
  }: {
    course: Course;
    legend: Record<string, string>;
    pdfUrl: string;
    onClose: () => void;
  } = $props();

  const match = $derived(classify(course.label));
  const allergens = $derived(allergenNames(course, legend));

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') onClose();
  }
</script>

<svelte:window on:keydown={onKeydown} />

<div class="scrim" role="presentation" onclick={onClose}></div>

<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
  <div class="grab"></div>

  <div class="head">
    <span
      class="disc"
      style:--pale={`var(--fam-${match.family}-pale)`}
      style:--ring={`var(--fam-${match.family})`}
    >
      <Illustration name={match.illustration} size={34} />
    </span>
    <span class="head-body">
      <span class="role">{slotLabel(course.slot)}</span>
      <h2 id="sheet-title">{course.label}</h2>
    </span>
    <button type="button" class="close" onclick={onClose}>Fermer</button>
  </div>

  <section>
    <h3>Allergènes déclarés</h3>
    {#if allergens.length > 0}
      <ul class="allergens">
        {#each allergens as allergen (allergen.code)}
          <li>
            <svg width="21" height="21" aria-hidden="true" focusable="false" class="alg-icon">
              <use
                href={allergen.code === 7
                  ? '#alg-lait'
                  : allergen.code === 3
                    ? '#alg-oeufs'
                    : '#alg-defaut'}
              />
            </svg>
            <span>{allergen.name}</span>
          </li>
        {/each}
      </ul>
    {:else}
      <!--
        La formulation est volontairement lourde : « aucun allergène déclaré »
        n'est pas « sans allergène », et l'écrire autrement serait une promesse
        qu'aucune donnée ne permet de tenir.
      -->
      <p class="none">
        <strong>Aucun allergène déclaré</strong>
        <span>
          Le document source n'en mentionne aucun pour ce plat. Cela ne garantit pas l'absence de
          traces.
        </span>
      </p>
    {/if}
  </section>

  {#if course.flags.length > 0}
    <section>
      <h3>Labels</h3>
      <ul class="flags">
        {#each course.flags as flag (flag)}
          <li>{qualityLabel(flag)}</li>
        {/each}
      </ul>
    </section>
  {/if}

  {#if course.porkFree}
    <section>
      <h3>Régime sans porc</h3>
      <p class="pork">{course.porkFree}</p>
    </section>
  {/if}

  <footer>
    <span>Susceptible de modification selon les arrivages.</span>
    <span>
      <strong>Seul le document officiel de la Ville fait foi.</strong> Cette application n'est pas un
      service municipal et ne remplace pas un PAI.
    </span>
    <ExternalLink href={pdfUrl}>Voir le PDF officiel</ExternalLink>
  </footer>
</div>

<style>
  .scrim {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 0.45);
    border: 0;
    padding: 0;
  }

  .sheet {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    max-height: 88vh;
    overflow-y: auto;
    background: var(--sheet);
    color: var(--ink);
    border-radius: 20px 20px 0 0;
    padding: var(--space-2) var(--space-4) var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin-inline: auto;
    max-width: 520px;
  }

  .grab {
    width: 38px;
    height: 4px;
    border-radius: 999px;
    background: var(--edge);
    align-self: center;
    margin-block: var(--space-1);
  }

  .head {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .disc {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    flex: none;
    display: grid;
    place-items: center;
    background: var(--pale);
    border: 4px solid var(--ring);
  }

  .head-body {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }

  .role {
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--ink-muted);
  }

  h2 {
    margin: 0;
    font-size: var(--text-lg);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.15;
  }

  .close {
    margin-left: auto;
    align-self: flex-start;
    min-height: var(--touch);
    padding-inline: var(--space-3);
    font: inherit;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--ink);
    background: none;
    border: 1px solid var(--edge);
    border-radius: 999px;
    cursor: pointer;
  }

  section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  h3 {
    margin: 0;
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--ink-muted);
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .allergens li {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background: var(--chip);
    border: 1px solid var(--edge);
    border-radius: var(--radius-cell);
    padding: 0.42rem 0.55rem;
    font-size: var(--text-base);
    font-weight: 600;
  }

  .alg-icon {
    display: block;
    flex: none;
  }

  .none {
    margin: 0;
    background: var(--chip);
    border: 1px solid var(--edge);
    border-radius: var(--radius-cell);
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    font-size: var(--text-sm);
    color: var(--ink-muted);
  }

  .none strong {
    font-size: var(--text-base);
    color: var(--ink);
  }

  .flags li,
  .pork {
    margin: 0;
    font-size: var(--text-sm);
  }

  footer {
    border-top: 1px solid var(--edge);
    padding-top: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    font-size: 0.75rem;
    color: var(--ink-muted);
    line-height: 1.45;
  }

  footer strong {
    color: var(--ink);
  }

  footer :global(a) {
    color: var(--table);
    font-weight: 700;
    min-height: var(--touch);
    display: inline-flex;
    align-items: center;
  }

  @media (prefers-color-scheme: dark) {
    footer :global(a) {
      color: var(--on-table);
    }
  }
</style>
