<script lang="ts">
  import { isStale } from '$lib/data/load.js';
  import { resolveDisplayDay, servedNeighbour } from '$lib/data/resolve.js';
  import type { Course } from '$lib/data/schema.js';
  import CourseSheet from '$lib/menu/CourseSheet.svelte';
  import Tray from '$lib/menu/Tray.svelte';
  import { formatDay, slotLabel, targetEyebrow } from '$lib/menu/labels.js';
  import Illustration from '$lib/illustrations/Illustration.svelte';
  import ExternalLink from '$lib/ui/ExternalLink.svelte';
  import { classify } from '$lib/illustrations/families.js';
  import { selection } from '$lib/menu/selection.svelte.js';
  import type { PageProps } from './$types.js';

  let { data }: PageProps = $props();

  const now = new Date();
  const target = $derived(resolveDisplayDay(data.dataset, now));

  /** La date consultée : celle choisie depuis la semaine, ou le jour résolu. */
  const chosen = $derived(selection.date);
  const date = $derived(chosen ?? (target.status === 'not-published' ? null : target.date));
  const day = $derived(date === null ? null : (data.dataset.byDate.get(date) ?? null));

  const eyebrow = $derived(
    chosen === null || chosen === (target.status === 'not-published' ? null : target.date)
      ? targetEyebrow(target)
      : 'Menu du jour'
  );

  const previous = $derived(date === null ? null : servedNeighbour(data.dataset, date, 'previous'));
  const next = $derived(date === null ? null : servedNeighbour(data.dataset, date, 'next'));

  const snack = $derived(day?.courses.find((course) => course.slot === 'gouter') ?? null);
  const stale = $derived(isStale(data.dataset, now));

  let selected = $state<Course | null>(null);

  function onKeydown(event: KeyboardEvent) {
    if (selected !== null) return;
    if (event.key === 'ArrowLeft' && previous !== null) selection.set(previous);
    if (event.key === 'ArrowRight' && next !== null) selection.set(next);
  }
</script>

<svelte:head>
  <title>Menus des écoles de Talence</title>
  <meta
    name="description"
    content="Le menu du jour des écoles de Talence, lisible en un coup d'œil et consultable hors ligne."
  />
</svelte:head>

<svelte:window on:keydown={onKeydown} />

<header>
  <p class="eyebrow">{eyebrow}</p>
  <h1>{date === null ? 'Menus des écoles' : formatDay(date)}</h1>
</header>

{#if data.status.kind === 'schema-too-new'}
  <p class="notice">
    Ces menus ont été publiés dans un format plus récent que celui que cette version sait lire.
    Rechargez la page pour mettre l'application à jour.
  </p>
{:else if data.status.kind === 'unavailable'}
  <p class="notice">
    Aucun menu n'est disponible. Une première connexion est nécessaire pour les télécharger.
  </p>
{:else if day === null}
  <p class="notice">
    Le menu de cette période n'est pas encore publié par la Ville.
    <ExternalLink href="https://www.talence.fr/quotidien/enfance-scolarite/menu-ecoles/">
      Consulter la page officielle
    </ExternalLink>
  </p>
{:else}
  {#if stale}
    <p class="notice subtle">
      Ces menus n'ont pas été rafraîchis depuis plus de deux jours. Ils peuvent être périmés.
    </p>
  {/if}

  {#if day.confidence === 'low'}
    <p class="warn">
      Données incertaines pour ce jour.
      <ExternalLink href={day.source.pdfUrl}>Vérifier sur le PDF officiel</ExternalLink>
    </p>
  {/if}

  {#if day.theme}
    <section class="theme">
      <h2>{day.theme}</h2>
      {#if day.note}<p>{day.note}</p>{/if}
    </section>
  {/if}

  <Tray {day} onSelect={(course) => (selected = course)} />

  {#if snack}
    {@const match = classify(snack.label)}
    <button type="button" class="snack" onclick={() => (selected = snack)}>
      <Illustration name={match.illustration} size={26} />
      <span><b>{slotLabel('gouter')}</b> · {snack.label}</span>
    </button>
  {/if}

  <nav aria-label="Navigation entre les jours">
    <button
      type="button"
      onclick={() => previous && selection.set(previous)}
      disabled={previous === null}
    >
      <span aria-hidden="true">←</span>
      {previous === null ? 'Début des menus' : formatDay(previous, { month: 'short' })}
    </button>
    <button type="button" onclick={() => next && selection.set(next)} disabled={next === null}>
      {next === null ? 'Fin des menus' : formatDay(next, { month: 'short' })}
      <span aria-hidden="true">→</span>
    </button>
  </nav>

  <footer>
    <span>
      {day.source.updatedLabel ??
        (day.source.updatedAt
          ? `Mis à jour le ${formatDay(day.source.updatedAt)}`
          : 'Source : Ville de Talence')}
    </span>
    <ExternalLink href={day.source.pdfUrl}>PDF officiel</ExternalLink>
  </footer>
{/if}

{#if selected && day}
  <CourseSheet
    course={selected}
    legend={day.legend}
    pdfUrl={day.source.pdfUrl}
    onClose={() => (selected = null)}
  />
{/if}

<style>
  header {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    color: var(--on-table);
    padding-inline: var(--space-2);
  }

  .eyebrow {
    margin: 0;
    font-size: var(--text-xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 700;
    opacity: 0.72;
  }

  h1 {
    margin: 0;
    font-size: var(--text-2xl);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.1;
  }

  .notice {
    margin: 0;
    background: var(--tray);
    color: var(--ink);
    border-radius: var(--radius-cell);
    padding: var(--space-3);
    font-size: var(--text-sm);
    line-height: 1.5;
  }

  .notice.subtle {
    background: none;
    color: var(--on-table);
    opacity: 0.8;
    padding-inline: var(--space-2);
  }

  .warn {
    margin: 0;
    background: var(--warn);
    color: var(--warn-on);
    border-radius: var(--radius-cell);
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    font-weight: 600;
    line-height: 1.35;
  }

  .warn :global(a),
  .notice :global(a) {
    color: currentcolor;
    font-weight: 700;
  }

  .theme {
    background: var(--tray);
    color: var(--ink);
    border-radius: var(--radius-cell);
    padding: var(--space-3);
  }

  .theme h2 {
    margin: 0;
    font-size: var(--text-base);
    font-weight: 800;
    letter-spacing: -0.01em;
  }

  .theme p {
    margin: var(--space-1) 0 0;
    font-size: var(--text-sm);
    color: var(--ink-muted);
    line-height: 1.45;
  }

  /* Le goûter est hors du plateau : il n'est pas servi sur celui du déjeuner. */
  .snack {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2);
    min-height: var(--touch);
    font: inherit;
    font-size: var(--text-sm);
    color: var(--on-table);
    background: none;
    border: 0;
    border-radius: var(--radius-cell);
    cursor: pointer;
    text-align: left;
  }

  nav {
    display: flex;
    gap: var(--space-2);
  }

  nav button {
    flex: 1;
    min-height: var(--touch);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);
    font: inherit;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--on-table);
    background: none;
    border: 1px solid color-mix(in srgb, var(--on-table) 35%, transparent);
    border-radius: 999px;
    cursor: pointer;
  }

  nav button:disabled {
    opacity: 0.45;
    cursor: default;
  }

  footer {
    display: flex;
    justify-content: space-between;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-2) 0;
    border-top: 1px solid color-mix(in srgb, var(--on-table) 22%, transparent);
    color: var(--on-table);
    opacity: 0.72;
    font-size: var(--text-xs);
  }

  footer :global(a) {
    color: var(--on-table);
    font-weight: 700;
    opacity: 1;
  }
</style>
