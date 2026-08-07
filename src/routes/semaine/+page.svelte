<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import Illustration from '$lib/illustrations/Illustration.svelte';
  import { classify } from '$lib/illustrations/families.js';
  import { allergenFilter } from '$lib/filter/allergens.svelte.js';
  import { isStale } from '$lib/data/load.js';
  import { parisDate, resolveDisplayDay, weekOf } from '$lib/data/resolve.js';
  import { selection } from '$lib/menu/selection.svelte.js';
  import AllergenChip from '$lib/menu/AllergenChip.svelte';
  import ExternalLink from '$lib/ui/ExternalLink.svelte';
  import {
    allergenNames,
    dayNumber,
    formatDay,
    formatWeekday,
    shortAllergenName
  } from '$lib/menu/labels.js';
  import type { PageProps } from './$types.js';

  let { data }: PageProps = $props();

  /** Décale une date d'un nombre de jours, en restant sur le jour civil. */
  function shift(date: string, days: number): string {
    const time = Date.parse(`${date}T00:00:00Z`) + days * 24 * 60 * 60 * 1000;
    return new Date(time).toISOString().slice(0, 10);
  }

  const now = new Date();
  const today = parisDate(now);
  const target = $derived(resolveDisplayDay(data.dataset, now));
  const anchor = $derived(
    selection.date ?? (target.status === 'not-published' ? today : target.date)
  );

  const days = $derived(
    weekOf(anchor).map((date) => ({ date, day: data.dataset.byDate.get(date) ?? null }))
  );

  const first = $derived(days[0]?.date ?? anchor);
  const last = $derived(days[4]?.date ?? anchor);

  const source = $derived(days.find(({ day }) => day !== null)?.day?.source ?? null);
  const stale = $derived(isStale(data.dataset, now));

  /** Le plat principal, ou à défaut le premier plat qui existe. */
  function mainCourse(day: NonNullable<(typeof days)[number]['day']>) {
    return day.courses.find((course) => course.slot === 'plat') ?? day.courses[0] ?? null;
  }

  /*
    Le résumé écarte le pain et le goûter : ils sont présents presque chaque jour
    et ne distinguent rien. Ce qui reste est ce qui change d'un jour à l'autre.
  */
  function rest(day: NonNullable<(typeof days)[number]['day']>) {
    return day.courses
      .filter((course) => !['plat', 'pain', 'gouter'].includes(course.slot))
      .map((course) => course.label)
      .join(' · ');
  }

  /** Le nombre de plats du jour touchés par la sélection. */
  function flaggedCount(day: NonNullable<(typeof days)[number]['day']>): number {
    return day.courses.filter((course) => allergenFilter.matching(course).length > 0).length;
  }

  /** Les allergènes de la sélection présents quelque part dans la journée. */
  function flagged(day: NonNullable<(typeof days)[number]['day']>): string[] {
    const codes = new Set(day.courses.flatMap((course) => allergenFilter.matching(course)));
    return [...codes]
      .sort((a, b) => a - b)
      .map((code) =>
        shortAllergenName(
          allergenNames({ slot: 'plat', label: '', allergens: [code], flags: [] }, day.legend)[0]
            ?.name ?? String(code)
        )
      );
  }

  async function open(date: string) {
    selection.set(date);
    await goto(resolve('/'));
  }
</script>

<svelte:head>
  <title>La semaine — menus des écoles de Talence</title>
</svelte:head>

<header>
  <p class="eyebrow">
    {anchor === today || days.some((d) => d.date === today) ? 'Cette semaine' : 'Semaine'}
  </p>
  <h1>{formatDay(first, { weekday: undefined })} au {formatDay(last, { weekday: undefined })}</h1>
</header>

{#if data.status.kind !== 'ok'}
  <p class="notice">
    Aucun menu n'est disponible. Une première connexion est nécessaire pour les télécharger.
  </p>
{:else}
  {#if stale}
    <p class="stale">
      Ces menus n'ont pas été rafraîchis depuis plus de deux jours. Ils peuvent être périmés.
    </p>
  {/if}

  <ul class="sheet">
    {#each days as { date, day } (date)}
      {@const isToday = date === today}
      {@const course = day ? mainCourse(day) : null}
      {@const match = course ? classify(course.label) : null}
      <li class:today={isToday}>
        {#if day && day.kind === 'school' && course && match}
          <button type="button" onclick={() => open(date)}>
            <span
              class="disc"
              style:--pale={`var(--fam-${match.family}-pale)`}
              style:--ring={`var(--fam-${match.family})`}
            >
              <Illustration name={match.illustration} size={32} />
            </span>
            <span class="body">
              <span class="when">
                <span class="dow">{formatWeekday(date)}</span>
                <span class="num">{dayNumber(date)}</span>
                {#if isToday}<span class="now">Aujourd'hui</span>{/if}
              </span>
              <span class="main">{course.label}</span>
              {#if rest(day)}<span class="rest">{rest(day)}</span>{/if}
              {#if flagged(day).length > 0}
                <span class="chips">
                  <AllergenChip names={flagged(day)} count={flaggedCount(day)} compact />
                </span>
              {/if}
            </span>
          </button>
        {:else}
          <div class="quiet">
            <span class="disc muted"><Illustration name="inconnu" size={32} /></span>
            <span class="body">
              <span class="when">
                <span class="dow">{formatWeekday(date)}</span>
                <span class="num">{dayNumber(date)}</span>
                {#if isToday}<span class="now">Aujourd'hui</span>{/if}
              </span>
              <!--
                Deux absences très différentes. « Pas d'école » est une donnée :
                la Ville a dit qu'il n'y avait pas de service. « Pas encore
                publié » est un silence. Les confondre ferait croire à une
                information là où il n'y en a aucune.
              -->
              <span class="main quiet-label">
                {day === null ? 'Menu pas encore publié' : "Pas d'école ce jour"}
              </span>
            </span>
          </div>
        {/if}
      </li>
    {/each}
  </ul>

  <nav class="weeks" aria-label="Navigation entre les semaines">
    <button type="button" onclick={() => selection.set(shift(first, -7))}>
      <span aria-hidden="true">←</span> Semaine précédente
    </button>
    <button type="button" onclick={() => selection.set(shift(first, 7))}>
      Semaine suivante <span aria-hidden="true">→</span>
    </button>
  </nav>

  <footer>
    <span>{source?.updatedLabel ?? 'Source : Ville de Talence'}</span>
    {#if source}<ExternalLink href={source.pdfUrl}>PDF officiel</ExternalLink>{/if}
  </footer>
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
  }

  .stale {
    margin: 0;
    padding-inline: var(--space-2);
    color: var(--on-table);
    opacity: 0.8;
    font-size: var(--text-sm);
  }

  .sheet {
    list-style: none;
    margin: 0;
    padding: 6px;
    background: var(--tray);
    border-radius: var(--radius-tray);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  li + li {
    box-shadow: 0 -1px 0 var(--edge);
  }

  li.today + li {
    box-shadow: none;
  }

  li button,
  .quiet {
    width: 100%;
    display: grid;
    grid-template-columns: 58px 1fr;
    gap: var(--space-3);
    align-items: center;
    padding: var(--space-2) 0.55rem;
    border: 0;
    border-radius: 11px;
    background: none;
    font: inherit;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .quiet {
    cursor: default;
  }

  /*
    Le jour courant porte quatre signaux, dont aucun n'est une couleur : fond
    plein, contour appuyé, étiquette en toutes lettres, et le nom du plat qui
    monte d'un cran. La ligne reste repérable en niveaux de gris.
  */
  li.today button,
  li.today .quiet {
    background: var(--chip);
    box-shadow: 0 0 0 2px var(--ink);
  }

  .disc {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: var(--pale);
    border: 4px solid var(--ring);
    display: grid;
    place-items: center;
  }

  .disc.muted {
    background: var(--cell-empty);
    border-color: var(--edge);
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 0.12rem;
    min-width: 0;
  }

  .when {
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .dow {
    font-size: var(--text-sm);
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink);
  }

  .num {
    font-size: var(--text-lg);
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--ink);
    font-variant-numeric: tabular-nums;
  }

  .now {
    font-size: 0.5625rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: var(--ink);
    color: var(--tray);
    border-radius: 999px;
    padding: 0.12rem 0.42rem;
  }

  .main {
    font-size: var(--text-base);
    font-weight: 700;
    color: var(--ink);
    line-height: 1.25;
    letter-spacing: -0.01em;
  }

  li.today .main {
    font-size: var(--text-lg);
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .quiet-label {
    font-weight: 600;
    font-style: italic;
    color: var(--ink-muted);
  }

  .rest {
    font-size: 0.75rem;
    color: var(--ink-muted);
    line-height: 1.35;
  }

  .chips {
    margin-top: 0.22rem;
  }

  .weeks {
    display: flex;
    gap: var(--space-2);
  }

  .weeks button {
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
