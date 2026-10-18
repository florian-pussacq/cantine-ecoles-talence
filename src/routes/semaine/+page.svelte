<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import Illustration from '$lib/illustrations/Illustration.svelte';
  import { classify } from '$lib/illustrations/families.js';
  import { allergenFilter } from '$lib/filter/allergens.svelte.js';
  import Bandeau from '$lib/ui/Bandeau.svelte';
  import { contactAncien } from '$lib/data/load.js';
  import { appUpdate } from '$lib/pwa/update.svelte.js';
  import LienExterne from '$lib/ui/LienExterne.svelte';
  import { horloge } from '$lib/data/horloge.svelte.js';
  import { parisDate, resolveDisplayDay, weekOf } from '$lib/data/resolve.js';
  import { selection } from '$lib/menu/selection.svelte.js';
  import Carrousel from '$lib/ui/Carrousel.svelte';
  import RangNavigation from '$lib/ui/RangNavigation.svelte';
  import PiedSource from '$lib/ui/PiedSource.svelte';
  import CommandeRetour from '$lib/ui/CommandeRetour.svelte';
  import PastilleAllergene from '$lib/menu/PastilleAllergene.svelte';
  import {
    allergenNames,
    allergensUndeclared,
    dayNumber,
    formatDay,
    formatWeekday,
    shortAllergenName,
    weekReturnLabel,
    PAGE_DES_MENUS
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

  /** Les cinq jours d'une semaine, chacun avec son menu s'il est publié. */
  function semaine(date: string) {
    return weekOf(date).map((jour) => ({ date: jour, day: data.dataset.byDate.get(jour) ?? null }));
  }

  const days = $derived(semaine(anchor));

  const first = $derived(days[0]?.date ?? anchor);
  const last = $derived(days[4]?.date ?? anchor);

  const source = $derived(days.find(({ day }) => day !== null)?.day?.source ?? null);
  // Comme l'écran du jour : le contact de l'appareil (fraicheur-par-appareil, D1).
  const joursSansContact = $derived(contactAncien(appUpdate.contact, now));

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
  <Bandeau ton="info">
    Aucun menu n'est disponible. Une première connexion est nécessaire pour les télécharger.
  </Bandeau>
{:else}
  {#if joursSansContact !== null}
    <Bandeau ton="info" discret>
      Cet appareil n'a pas pu vérifier les menus depuis {joursSansContact} jours. Ils ont pu changer :
      <LienExterne href={PAGE_DES_MENUS}>voir la page de la Ville</LienExterne>.
    </Bandeau>
  {/if}

  <!--
    Le geste est strictement redondant avec les commandes de semaine, toutes
    deux atteignables et annoncées. Lui inventer un rôle ARIA ajouterait un
    élément interactif de plus à parcourir pour la même fonction — voir la note
    équivalente sur l'écran du jour.

    Le même carrousel, d'une semaine à l'autre (carrousel-des-jours) : les
    semaines voisines existent toujours, même sans menu publié — elles le
    disent jour par jour.
  -->
  <Carrousel
    cle={first}
    precedent={shift(first, -7)}
    suivant={shift(first, 7)}
    aller={(lundi) => selection.set(lundi, today)}
  >
    {#snippet panneau(lundi)}
      <ul class="sheet">
        {#each semaine(lundi) as { date, day } (date)}
          {@const isToday = date === today}
          {@const course = day ? mainCourse(day) : null}
          {@const match = course ? classify(course.label) : null}
          <li class:today={isToday}>
            {#if day && day.kind === 'school' && course && match}
              <button type="button" onclick={() => open(date)}>
                <span
                  class="disc"
                  style:--pale={`var(--fam-${match.family}-pale)`}
                  style:--anneau={`var(--fam-${match.family})`}
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
                      <PastilleAllergene {...flagged(day)} count={flaggedCount(day)} compact />
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
    {/snippet}
  </Carrousel>

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
  .sheet {
    list-style: none;
    margin: 0;
    padding: 6px;
    background: var(--carte);
    border-radius: var(--rayon-carte);
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
    gap: var(--espace-3);
    align-items: center;
    padding: var(--espace-2) 0.55rem;
    border: 0;
    border-radius: var(--rayon-pastille);
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
    Le jour courant tient par deux signaux qui ne sont pas des couleurs : la
    pastille « Aujourd'hui », forme sombre écrite en toutes lettres, et le nom
    du plat qui monte d'un cran. La ligne reste repérable en niveaux de gris.

    Le fond teinté n'en est pas un troisième : à aucun taux qui laisse son seuil
    au texte atténué, il ne se distingue de la carte sans couleur. C'est un
    renfort. Il remplace le contour noir de 2 px, qui se lisait comme un focus
    clavier (bandeau-et-aujourdhui, D4).
  */
  li.today button,
  li.today .quiet {
    background: var(--voile-accent);
  }

  .disc {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: var(--pale);
    border: 4px solid var(--anneau);
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
    font-size: var(--texte-sm);
    font-weight: var(--poids-fort);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--encre);
  }

  .num {
    font-size: var(--texte-lg);
    font-weight: var(--poids-titre);
    letter-spacing: -0.02em;
    color: var(--encre);
    font-variant-numeric: tabular-nums;
  }

  /* La même pastille que la mention de l'écran du jour (D3). */
  .now {
    font-size: var(--texte-2xs);
    font-weight: var(--poids-titre);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--accent);
    color: var(--sur-accent);
    border-radius: var(--rayon-pilule);
    padding: 0.12rem 0.42rem;
  }

  .main {
    font-size: var(--texte-base);
    font-weight: var(--poids-fort);
    color: var(--encre);
    line-height: 1.25;
    letter-spacing: -0.01em;
  }

  li.today .main {
    font-size: var(--texte-lg);
    font-weight: var(--poids-titre);
    letter-spacing: -0.02em;
  }

  .quiet-label {
    font-weight: var(--poids-moyen);
    font-style: italic;
    color: var(--encre-douce);
  }

  .rest {
    font-size: var(--texte-xs);
    color: var(--encre-douce);
    line-height: 1.35;
  }

  .chips {
    margin-top: 0.22rem;
  }
</style>
