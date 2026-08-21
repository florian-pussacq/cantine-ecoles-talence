<script lang="ts">
  import Illustration from '../illustrations/Illustration.svelte';
  import { classify } from '../illustrations/families.js';
  import type { ResolvedDay } from '../data/dataset.js';
  import type { Course } from '../data/schema.js';
  import {
    courseName,
    flaggedAllergenNames,
    LUNCH_SLOTS,
    qualityLabel,
    slotAbsence,
    slotLabel
  } from './labels.js';
  import { allergenFilter } from '../filter/allergens.svelte.js';
  import AllergenChip from './AllergenChip.svelte';

  let { day }: { day: ResolvedDay } = $props();

  /** Les allergènes cochés que porte ce plat : leurs codes et leurs noms courts. */
  function flagged(course: Course) {
    const codes = allergenFilter.matching(course);
    return { codes, names: flaggedAllergenNames(course, day.legend, codes) };
  }

  /**
   * Le déjeuner, dans l'ordre où l'écran le montre (design.md, D39).
   *
   * Une ligne par rôle, et jamais moins : l'ardoise ne se referme pas sur un
   * rôle absent, faute de quoi un creux cesserait d'être distinguable d'une
   * donnée manquante (D12). Ce que la grille garantissait par une case en
   * pointillés, une ligne le dit aussi bien et pour beaucoup moins cher.
   */
  const lignes = $derived(
    LUNCH_SLOTS.map((slot) => ({
      slot,
      course: day.courses.find((course) => course.slot === slot) ?? null
    }))
  );
</script>

<!--
  Le plateau compartimenté est devenu une ardoise (D39).

  Six compartiments distribuaient 470 pixels à six libellés courts, dont cinq
  portaient une illustration que le rôle rendait constante d'un jour à l'autre.
  Ce qui reste est ce que l'écran devait dire depuis le début : un rôle, un nom,
  et une seule chose qui se détache — le plat du jour.

  Aucune ligne n'est actionnable : la cible est la journée entière, et elle est
  portée par l'élément qui contient cette ardoise (D38).
-->
<div class="tray">
  {#each lignes as { slot, course } (slot)}
    {#if slot === 'plat'}
      {@const match = course ? classify(course.label) : null}
      <div
        class="vedette"
        class:empty={course === null}
        style:--fam={match ? `var(--fam-${match.family})` : 'var(--fam-inconnu)'}
        style:--on={match ? `var(--fam-${match.family}-on)` : 'var(--fam-inconnu-on)'}
      >
        {#if course && match}
          {@const nom = courseName(course)}
          <!--
            La seule illustration du déjeuner. Elle a cessé d'être une décoration
            de case pour devenir un marqueur de rang : « il y a un dessin ici »
            veut dire « c'est le plat du jour », et ce sens n'existait pas tant
            que tout le monde en portait un (D40).
          -->
          <span class="disc"><Illustration name={match.illustration} /></span>
          <span class="vedette-body">
            <span class="role on-fam">{slotLabel(slot)}</span>
            <span class="vedette-nom" class:unknown={nom.kind === 'undisclosed'}>{nom.text}</span>
            <!-- Une qualité promue au rang de nom ne se redit pas en capsule. -->
            {#if course.flags.length > 0 && nom.kind !== 'quality'}
              <span class="tags">
                {#each course.flags as flag (flag)}<em>{qualityLabel(flag)}</em>{/each}
              </span>
            {/if}
            {#if flagged(course).codes.length > 0}
              <AllergenChip {...flagged(course)} />
            {/if}
          </span>
        {:else}
          <span class="role on-fam">{slotLabel(slot)}</span>
          <span class="absent">{slotAbsence(slot)}</span>
        {/if}
      </div>
    {:else}
      <!--
        Le pain vient en dernier et plus discret : il n'est pas servi à un moment
        du repas, et il s'appelle « Pain » trente-trois jours sur trente-cinq.
      -->
      <div class="ligne" class:pied={slot === 'pain'} class:empty={course === null}>
        <span class="role">{slotLabel(slot)}</span>
        {#if course}
          {@const nom = courseName(course)}
          <span class="corps">
            <span class="nom" class:unknown={nom.kind === 'undisclosed'}>{nom.text}</span>
            {#if course.flags.length > 0 && nom.kind !== 'quality'}
              <span class="tags muted-tags">
                {#each course.flags as flag (flag)}<em>{qualityLabel(flag)}</em>{/each}
              </span>
            {/if}
            {#if flagged(course).codes.length > 0}
              <AllergenChip {...flagged(course)} />
            {/if}
          </span>
        {:else}
          <span class="corps"><span class="absent">{slotAbsence(slot)}</span></span>
        {/if}
      </div>
    {/if}
  {/each}
</div>

<style>
  /*
    Les deux colonnes de l'ardoise.

    C'est une grille et non une suite de lignes, parce que la colonne des rôles
    doit avoir la même largeur partout : c'est cet alignement qui fait qu'on lit
    l'objet d'un coup d'œil, et non une suite de fragments. `auto` la dimensionne
    sur le plus long des libellés — « Accompagnement » — sans qu'aucune valeur
    n'ait à être devinée ni tenue à jour quand un mot change. Une largeur en `ch`
    a d'abord été essayée : elle laissait « ACCOMPAGNEMENT » déborder sur le nom
    du plat, ce qu'aucune valeur choisie à la main n'aurait durablement évité.
  */
  .tray {
    background: var(--tray);
    border-radius: var(--radius-tray);
    padding: var(--space-3);
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: baseline;
    column-gap: var(--space-3);
    row-gap: var(--space-2);
    color: var(--ink);
  }

  /*
    La ligne n'est plus une boîte : ses deux moitiés doivent participer à la
    grille du plateau pour s'y aligner. Elle reste un élément dans le document,
    parce que c'est lui qui porte la nature de la ligne — le pain, une absence —
    et que les sélecteurs descendants continuent d'en dépendre.
  */
  .ligne {
    display: contents;
  }

  .role {
    grid-column: 1;
    font-size: var(--text-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--ink-muted);
  }

  .corps {
    grid-column: 2;
    min-width: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-1) var(--space-2);
  }

  .nom {
    font-size: var(--text-base);
    font-weight: 600;
    line-height: 1.3;
  }

  /* Le pain ferme l'ardoise sans en être un rôle servi : la nuance se dit par
     la taille, pas par un trait. */
  .pied .nom {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--ink-muted);
  }

  .absent {
    font-size: var(--text-sm);
    font-style: italic;
    color: var(--ink-muted);
  }

  /* Un détail non publié n'est pas un nom de plat : il s'écrit comme une
     mention, pas comme un titre. Il se distingue aussi d'une absence, qui
     n'annonce aucun plat du tout. */
  .unknown {
    font-style: italic;
    font-weight: 600;
    opacity: 0.75;
  }

  /*
    Le plat du jour est la seule chose colorée, la seule illustrée, la seule en
    gros corps. Il garde sa place dans l'ordre du service : il n'a pas besoin
    d'être premier pour être vu, il a besoin d'être le seul de son espèce (D39).
  */
  .vedette {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    margin-block: var(--space-1);
    background: var(--fam);
    border: 1px solid rgba(0, 0, 0, 0.22);
    border-radius: var(--radius-cell);
    color: var(--on);
  }

  .vedette.empty {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }

  /* Les tailles viennent des jetons, pour qu'un seul palier les fasse toutes
     grandir sur écran large (D23). Une propriété CSS l'emporte sur l'attribut
     du SVG, ce qui évite de dupliquer le seuil dans chaque composant. */
  .vedette :global(.illustration) {
    width: var(--ill-plat);
    height: var(--ill-plat);
  }

  /*
    L'illustration repose sur un disque clair et jamais sur l'aplat saturé :
    un poisson bleu sur fond bleu ne se voit pas.
  */
  .disc {
    width: var(--ill-disque);
    height: var(--ill-disque);
    border-radius: 50%;
    background: var(--tray);
    display: grid;
    place-items: center;
    flex: none;
  }

  .vedette-body {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }

  .on-fam {
    color: currentColor;
    opacity: 0.82;
  }

  .vedette-nom {
    font-size: var(--text-xl);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.12;
    text-wrap: balance;
  }

  .vedette .absent {
    color: currentColor;
    opacity: 0.82;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
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
</style>
