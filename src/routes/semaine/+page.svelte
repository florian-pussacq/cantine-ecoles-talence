<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import Illustration from '$lib/illustrations/Illustration.svelte';
  import { classify } from '$lib/illustrations/families.js';
  import { allergenFilter } from '$lib/filter/allergens.svelte.js';
  import { isStale } from '$lib/data/load.js';
  import { horloge } from '$lib/data/horloge.svelte.js';
  import { parisDate, resolveDisplayDay, weekOf } from '$lib/data/resolve.js';
  import { selection } from '$lib/menu/selection.svelte.js';
  import { createBalayage } from '$lib/ui/balayage.js';
  import RangNavigation from '$lib/ui/RangNavigation.svelte';
  import PiedSource from '$lib/ui/PiedSource.svelte';
  import CommandeRetour from '$lib/ui/CommandeRetour.svelte';
  import AllergenChip from '$lib/menu/AllergenChip.svelte';
  import {
    allergenNames,
    allergensUndeclared,
    dayNumber,
    formatDay,
    formatWeekday,
    shortAllergenName,
    weekReturnLabel
  } from '$lib/menu/labels.js';
  import type { PageProps } from './$types.js';

  let { data }: PageProps = $props();

  /** Décale une date d'un nombre de jours, en restant sur le jour civil. */
  function shift(date: string, days: number): string {
    const time = Date.parse(`${date}T00:00:00Z`) + days * 24 * 60 * 60 * 1000;
    return new Date(time).toISOString().slice(0, 10);
  }

  /* L'instant vient de l'horloge et non du montage (design.md, D47). */
  const now = $derived(horloge.instant);
  const today = $derived(parisDate(now));
  const target = $derived(resolveDisplayDay(data.dataset, now));

  /** Le jour du repère : celui autour duquel la semaine se cale à l'ouverture. */
  const repere = $derived(target.status === 'not-published' ? today : target.date);

  /* Le choix cesse de valoir quand le jour civil change (D47). */
  const chosen = $derived(selection.dateLe(today));
  const anchor = $derived(chosen ?? repere);

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
  function flagged(day: NonNullable<(typeof days)[number]['day']>) {
    const codes = [
      ...new Set(day.courses.flatMap((course) => allergenFilter.matching(course)))
    ].sort((a, b) => a - b);
    return {
      codes,
      names: codes.map((code) =>
        shortAllergenName(
          allergenNames({ slot: 'plat', label: '', allergens: [code], flags: [] }, day.legend)[0]
            ?.name ?? String(code)
        )
      )
    };
  }

  async function open(date: string) {
    selection.set(date, today);
    await goto(resolve('/'));
  }

  /**
   * Le retour à la semaine du repère (design.md, D44).
   *
   * La comparaison porte sur le lundi de chaque semaine et non sur la date
   * ancrée : consulter mardi ou jeudi de la même semaine, c'est consulter la
   * même semaine, et la commande n'aurait alors rien à ramener.
   *
   * Le libellé ne dit pas « Cette semaine » quand le repère n'y est pas : une
   * semaine de vacances scolaires renvoie à celle du prochain service, et
   * l'annoncer autrement serait la confusion que D45 refuse pour le jour.
   */
  const ecarte = $derived(weekOf(anchor)[0] !== weekOf(repere)[0]);
  const retourLibelle = $derived(weekReturnLabel(target));
  const retour = $derived(
    ecarte && retourLibelle !== null
      ? { libelle: retourLibelle, action: () => selection.reset() }
      : null
  );

  /** Le même geste que sur l'écran du jour, d'une semaine à l'autre (D17). */
  const balayage = createBalayage({
    onPrevious: () => selection.set(shift(first, -7), today),
    onNext: () => selection.set(shift(first, 7), today)
  });

  /** Le sens de la dernière navigation, pour que la transition suive le geste. */
  let sens = $state(1);
  let precedente: string | null = null;

  $effect(() => {
    if (precedente !== null && first !== precedente) sens = first > precedente ? 1 : -1;
    precedente = first;
  });
</script>

<svelte:head>
  <title>La semaine — menus des écoles de Talence</title>
</svelte:head>

<!--
  Le rang de navigation porte la période, entre les deux commandes qui la
  changent — même disposition que l'écran du jour, pour la même raison (D55,
  D56). Les commandes restent hors de la clé : les recréer perdrait le focus du
  clavier au milieu d'une navigation au clavier.

  Ce rang porte aussi le titre de premier niveau de l'écran : la période
  affichée, et non un titre constant nommant l'application (D61).
-->
<RangNavigation
  libelle="Navigation entre les semaines"
  precedent={{ nom: 'Semaine précédente', action: () => selection.set(shift(first, -7), today) }}
  suivant={{ nom: 'Semaine suivante', action: () => selection.set(shift(first, 7), today) }}
  cle={first}
  {sens}
  mention={days.some((d) => d.date === today) ? 'Cette semaine' : 'Semaine affichée'}
  principal={`${formatDay(first, { weekday: undefined })} au ${formatDay(last, { weekday: undefined })}`}
/>

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

  <!--
    Le geste est strictement redondant avec les commandes de semaine, toutes
    deux atteignables et annoncées. Lui inventer un rôle ARIA ajouterait un
    élément interactif de plus à parcourir pour la même fonction — voir la note
    équivalente sur l'écran du jour.
  -->
  <div class="balayage" {...balayage}>
    {#key first}
      <ul class="sheet glisse" style:--sens={sens}>
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
                  {#if day.title}<span class="rest">{day.title}</span>{/if}
                  {#if allergensUndeclared(day.source)}
                    <!-- Le filtre ne peut rien signaler ce jour-là : le dire (allergenes-non-communiques). -->
                    <span class="rest">Allergènes non précisés</span>
                  {/if}
                  {#if flagged(day).codes.length > 0}
                    <span class="chips">
                      <AllergenChip {...flagged(day)} count={flaggedCount(day)} compact />
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
                information là où il n'y en a aucune. Le férié est une donnée
                plus précise que la première, et se nomme.
              -->
                  <span class="main quiet-label">
                    {day === null
                      ? 'Menu pas encore publié'
                      : day.kind === 'public-holiday'
                        ? 'Jour férié'
                        : "Pas d'école ce jour"}
                  </span>
                </span>
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    {/key}
  </div>

  <!-- La commande de retour a son rang propre, sous la liste (D55). -->
  {#if retour}
    <CommandeRetour libelle={retour.libelle} action={retour.action} />
  {/if}

  {#if source}
    <PiedSource
      updatedLabel={source.updatedLabel}
      updatedAt={source.updatedAt}
      pdfUrl={source.pdfUrl}
    />
  {/if}
{/if}

<style>
  .notice {
    margin: 0;
    background: var(--carte);
    color: var(--ink);
    border-radius: var(--radius-pastille);
    padding: var(--space-3);
    font-size: var(--text-sm);
  }

  .stale {
    margin: 0;
    padding-inline: var(--space-2);
    color: var(--ink);
    opacity: 0.8;
    font-size: var(--text-sm);
  }

  /* `pan-y` rend le défilement vertical au navigateur et garde l'horizontal
     pour l'application. Sans cette ligne, le geste meurt sur `pointercancel`
     sans que rien ne le signale (D18). */
  .balayage {
    touch-action: pan-y;
    /* La transition d'entrée décale son contenu de 24 pixels : sans découpe, ce
       débordement s'ajoute brièvement à la largeur défilable et laisse la page
       glisser de côté pendant l'animation. `clip` découpe sans créer de conteneur
       de défilement, et laisse donc l'axe vertical intact. */
    overflow-x: clip;
  }

  .sheet {
    list-style: none;
    margin: 0;
    padding: 6px;
    background: var(--carte);
    border-radius: var(--radius-carte);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  li + li {
    box-shadow: 0 -1px 0 var(--bord);
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
    border-radius: var(--radius-pastille);
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
    background: var(--creux);
    border-color: var(--bord);
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
    font-size: var(--text-2xs);
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: var(--ink);
    color: var(--carte);
    border-radius: var(--radius-pilule);
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
    font-size: var(--text-xs);
    color: var(--ink-muted);
    line-height: 1.35;
  }

  .chips {
    margin-top: 0.22rem;
  }
</style>
