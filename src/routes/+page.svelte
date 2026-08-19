<script lang="ts">
  import { isStale } from '$lib/data/load.js';
  import { resolveDisplayDay, servedNeighbour } from '$lib/data/resolve.js';
  import type { Course } from '$lib/data/schema.js';
  import CourseSheet from '$lib/menu/CourseSheet.svelte';
  import Tray from '$lib/menu/Tray.svelte';
  import {
    courseName,
    flaggedAllergenNames,
    formatDay,
    slotLabel,
    targetEyebrow
  } from '$lib/menu/labels.js';
  import Illustration from '$lib/illustrations/Illustration.svelte';
  import AllergenChip from '$lib/menu/AllergenChip.svelte';
  import ExternalLink from '$lib/ui/ExternalLink.svelte';
  import { allergenFilter } from '$lib/filter/allergens.svelte.js';
  import { classify } from '$lib/illustrations/families.js';
  import { selection } from '$lib/menu/selection.svelte.js';
  import { createBalayage } from '$lib/ui/balayage.js';
  import EnTete from '$lib/ui/EnTete.svelte';
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

  /** Le sens de la dernière navigation, pour que la transition suive le geste. */
  let sens = $state(1);
  let precedente: string | null = null;

  $effect(() => {
    if (date !== null && precedente !== null && date !== precedente) {
      sens = date > precedente ? 1 : -1;
    }
    precedente = date;
  });

  /** Le balayage vit dans `$lib/ui/balayage` (design.md, D17). */
  const balayage = createBalayage({
    onPrevious: () => previous !== null && selection.set(previous),
    onNext: () => next !== null && selection.set(next)
  });

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

<!--
  L'en-tête change sous la même horloge que le contenu qu'il annonce (D30).

  Il était rendu hors du bloc animé : la date passait au jour suivant pendant
  que le plateau du jour précédent n'avait pas fini de sortir. Un seul
  changement, deux temps — c'est ce défaut-là que l'œil enregistre, avant même
  de pouvoir nommer une vitesse.

  Deux blocs distincts et non un seul englobant : le contenu du jour vit à
  l'intérieur de la surface de geste, qui doit rester stable pendant qu'un doigt
  la touche. Ils partagent la même clé, le même sens et la même durée, ce qui
  est précisément ce que « une seule horloge » veut dire.
-->
{#key date}
  <div class="glisse" style:--sens={sens}>
    <EnTete quand={eyebrow} quoi={date === null ? 'Menus des écoles' : formatDay(date)} />
  </div>
{/key}

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

  <!--
    Le geste est strictement redondant avec les boutons de navigation et les
    flèches du clavier, tous deux atteignables et annoncés. Lui inventer un rôle
    ARIA ajouterait un élément interactif de plus à parcourir au lecteur d'écran
    pour la même fonction.

    Contrepartie du branchement par diffusion : Svelte ne voit plus les
    gestionnaires, donc son contrôle d'accessibilité ne s'exprime plus ici. Le
    raisonnement ci-dessus tient lieu de justification, sans directive à tenir
    à jour.

    La surface de geste reste hors de la clé : elle porte les gestionnaires et
    la capture du pointeur, et la détruire pendant qu'un doigt la touche tuerait
    le geste en cours. C'est son contenu qui se renouvelle, pas elle.
  -->
  <div class="balayage" {...balayage}>
    {#key date}
      <div class="jour glisse" style:--sens={sens}>
        {#if day.theme}
          <section class="theme">
            <h2>{day.theme}</h2>
            {#if day.note}<p>{day.note}</p>{/if}
          </section>
        {/if}

        <Tray {day} onSelect={(course) => (selected = course)} />

        {#if snack}
          {@const match = classify(snack.label)}
          {@const nom = courseName(snack)}
          {@const codes = allergenFilter.matching(snack)}
          <!--
            Le goûter n'est pas sur le plateau du déjeuner : il n'est pas servi au
            même moment, et l'y ranger dirait le contraire. Il n'est pas non plus
            une note de bas de plateau — vingt libellés distincts sur trente-cinq
            jours, c'est la deuxième quantité d'information de l'écran (D29).

            La séparation est portée par sa forme et son éloignement, et non par
            un filet : l'écran en porte déjà un en pied de page, où il signifie
            « fin du contenu », et un trait sépare deux choses de même nature.
          -->
          <button type="button" class="snack" onclick={() => (selected = snack)}>
            <span class="snack-cell">
              <span class="snack-disc"><Illustration name={match.illustration} /></span>
              <span class="snack-body">
                <span class="snack-role">{slotLabel('gouter')}</span>
                <span class="snack-name" class:unknown={nom.kind === 'undisclosed'}>
                  {nom.text}
                </span>
                {#if codes.length > 0}
                  <AllergenChip {codes} names={flaggedAllergenNames(snack, day.legend, codes)} />
                {/if}
              </span>
            </span>
          </button>
        {/if}
      </div>
    {/key}
  </div>

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

  /*
    `pan-y` rend le défilement vertical au navigateur et garde l'horizontal pour
    l'application. Sans cette ligne, le navigateur revendique le mouvement, émet
    `pointercancel`, et le geste meurt sans que rien ne le signale — c'est la
    panne constatée en D18.
  */
  .balayage {
    touch-action: pan-y;
    /* La transition d'entrée décale son contenu de 24 pixels : sans découpe, ce
       débordement s'ajoute brièvement à la largeur défilable et laisse la page
       glisser de côté pendant l'animation. `clip` découpe sans créer de conteneur
       de défilement, et laisse donc l'axe vertical intact. */
    overflow-x: clip;
  }

  /* Le contenu du jour reproduit l'intervalle de la coque : il est devenu un
     seul enfant de celle-ci, pour n'avoir qu'une horloge (D30). */
  .jour {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
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

  /*
    Le goûter est un second plateau, plus petit, posé plus loin sur la table.

    Il reprend la construction du plateau du déjeuner — une surface claire, un
    compartiment posé dessus — parce que c'est le vocabulaire que l'application
    a déjà pour dire « ce qui est servi ». Ce qui le sépare est la distance : la
    coque espace déjà ses enfants, cette marge double l'intervalle, et la rupture
    se lit sans qu'aucun trait ne soit ajouté (D29).
  */
  .snack {
    margin-top: var(--space-3);
    padding: 8px;
    background: var(--tray);
    border: 0;
    border-radius: var(--radius-tray);
    font: inherit;
    color: var(--ink);
    text-align: left;
    cursor: pointer;
    display: block;
    width: 100%;
  }

  .snack-cell {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    background: var(--cell);
    border: 1px solid var(--edge);
    border-radius: var(--radius-cell);
  }

  /* Le disque suit l'échelle des illustrations plutôt qu'une valeur fixe : un
     seul palier de largeur les fait toutes grandir (D23). */
  .snack-disc {
    width: calc(var(--ill-cellule) * 1.5);
    height: calc(var(--ill-cellule) * 1.5);
    border-radius: 50%;
    background: var(--tray);
    display: grid;
    place-items: center;
    flex: none;
  }

  .snack :global(.illustration) {
    width: var(--ill-cellule);
    height: var(--ill-cellule);
  }

  .snack-body {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    align-items: flex-start;
    min-width: 0;
  }

  .snack-role {
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--ink-muted);
  }

  .snack-name {
    font-size: var(--text-lg);
    font-weight: 700;
    line-height: 1.2;
    text-wrap: balance;
  }

  /* Voir Tray.svelte : un détail non publié s'écrit comme une mention, pas
     comme un titre — et ne se confond pas avec une absence. */
  .snack-name.unknown {
    font-style: italic;
    font-weight: 600;
    font-size: var(--text-base);
    color: var(--ink-muted);
  }

  /* Le liseré rentre dans la carte plutôt que d'en sortir : il vit désormais
     dans une surface découpée horizontalement, et un décalage vers l'extérieur
     serait rogné sur ses deux bords. Même choix que les compartiments. */
  .snack:focus-visible {
    outline: 3px solid var(--ink);
    outline-offset: -3px;
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
    /* 40 % et non 35 % : sur le fond de la table, le mélange à 35 % ne mesure
       que 2,81:1 alors qu'une bordure délimitant une commande en demande 3
       (WCAG 1.4.11). À 40 %, elle mesure 3,20:1 — vérifié par `contrast.test.ts`,
       qui mesure désormais aussi les surfaces obtenues par opacité (D27). */
    border: 1px solid color-mix(in srgb, var(--on-table) 40%, transparent);
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
    /* Cible tactile : un lien isolé doit être atteignable au pouce. */
    min-height: var(--touch);
    display: inline-flex;
    align-items: center;
  }
</style>
