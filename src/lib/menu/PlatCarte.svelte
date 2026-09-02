<script lang="ts">
  import Illustration from '../illustrations/Illustration.svelte';
  import { classify } from '../illustrations/families.js';
  import type { ResolvedDay } from '../data/dataset.js';
  import type { Course } from '../data/schema.js';
  import {
    courseName,
    flaggedAllergenNames,
    qualityLabel,
    slotAbsence,
    slotLabel
  } from './labels.js';
  import { allergenFilter } from '../filter/allergens.svelte.js';
  import AllergenChip from './AllergenChip.svelte';
  import PastilleRole from './PastilleRole.svelte';

  /**
   * La carte d'un rôle du service (design.md, D50, D51).
   *
   * Elle a la même forme pour les sept rôles, y compris lorsqu'aucun plat n'est
   * publié : un creux doit rester distinguable d'une donnée manquante (D12), et
   * une carte qui disparaîtrait ferait douter de ce que l'écran n'affiche pas.
   *
   * Elle est un `div` et non un `li` : la journée entière est une cible unique
   * (D38), donc cette carte vit dans un `<button>`. Une liste y serait du HTML
   * invalide, et annoncerait aux lecteurs d'écran une structure de liste que le
   * bouton aplatit de toute façon.
   *
   * **Rien ici n'est actionnable** (D38). La cible est la journée entière, et
   * elle est portée par l'élément qui contient la liste. Un bouton par carte
   * ferait sept cibles là où il n'y a qu'une seule chose à ouvrir.
   *
   * Le rang du plat principal ne tient qu'au corps de son nom. Il n'a ni aplat
   * ni cadre : la vedette a disparu avec l'ardoise, parce que la couleur sert
   * désormais à se repérer dans la liste et qu'un second code la brouillerait.
   */
  let {
    slot,
    course,
    day,
    principal = false
  }: {
    slot: Course['slot'];
    course: Course | null;
    day: ResolvedDay;
    principal?: boolean;
  } = $props();

  /** Les allergènes cochés que porte ce plat : leurs codes et leurs noms courts. */
  const signale = $derived.by(() => {
    if (course === null) return null;
    const codes = allergenFilter.matching(course);
    if (codes.length === 0) return null;
    return { codes, names: flaggedAllergenNames(course, day.legend, codes) };
  });

  const nom = $derived(course === null ? null : courseName(course));

  /*
    L'illustration se déduit du libellé, et un rôle sans plat n'en a pas.
    Poser le repli `inconnu` sur une absence signalerait une donnée là où il n'y
    en a pas — c'est l'inverse de ce que la carte vide est là pour dire.
  */
  const match = $derived(course === null ? null : classify(course.label));
</script>

<div class="carte" class:vide={course === null} class:principal style:--role="var(--role-{slot})">
  <span class="pastille"><PastilleRole {slot} /></span>

  <span class="corps">
    <span class="role">{slotLabel(slot)}</span>
    {#if course && nom}
      <span class="nom" class:unknown={nom.kind === 'undisclosed'}>{nom.text}</span>
      <!-- Une qualité promue au rang de nom ne se redit pas en capsule. -->
      {#if course.flags.length > 0 && nom.kind !== 'quality'}
        <span class="tags">
          {#each course.flags as flag (flag)}<em>{qualityLabel(flag)}</em>{/each}
        </span>
      {/if}
      {#if signale}
        <AllergenChip {...signale} />
      {/if}
      <!--
      Un rôle du déjeuner absent s'énonce ; un goûter absent ne produit pas de
      carte du tout, et n'a donc pas de formulation (D29). Le test de `slot`
      n'est pas une précaution de typage : c'est cette règle, écrite.
    -->
    {:else if slot !== 'gouter'}
      <span class="absent">{slotAbsence(slot)}</span>
    {/if}
  </span>

  {#if match}
    <span class="vignette"><Illustration name={match.illustration} /></span>
  {/if}
</div>

<style>
  .carte {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    background: var(--carte);
    border: 1px solid var(--bord);
    border-radius: var(--radius-carte);
    color: var(--ink);
  }

  /* Un creux se lit comme un creux : la carte d'un rôle absent s'enfonce sous le
     fond au lieu d'en dépasser, et perd la blancheur qui annonce un contenu. */
  .carte.vide {
    background: var(--creux);
  }

  /*
    La pastille porte la couleur du rôle en aplat, et le glyphe la reçoit en
    `currentColor`. Les deux tiennent 4,5:1 l'un sur l'autre parce que le jeton
    a été calculé pour, et non choisi à l'œil (D50).
  */
  .pastille {
    width: 34px;
    height: 34px;
    border-radius: var(--radius-pastille);
    background: var(--role);
    color: var(--on-role);
    display: grid;
    place-items: center;
    flex: none;
  }

  /*
    Une absence n'a pas de couleur à annoncer : la pastille s'éteint plutôt que
    de promettre un contenu par sa vivacité.

    Elle ne s'éteint pas en délavant la couleur du rôle, ce qui donnerait un
    aplat clair sous un glyphe blanc — soit exactement le défaut que la palette
    a été calculée pour éviter. Elle prend la surface du creux et l'encre
    atténuée, une paire déjà mesurée par `contrast.test.ts`.
  */
  .carte.vide .pastille {
    background: var(--creux);
    color: var(--ink-muted);
    box-shadow: inset 0 0 0 1px var(--bord);
  }

  .corps {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.15rem;
    min-width: 0;
    flex: 1;
  }

  /* Le libellé du rôle porte la couleur du rôle : c'est le même jeton que
     l'aplat de la pastille, et il tient le seuil du texte courant sur la carte
     comme sur le fond. */
  .role {
    font-size: var(--text-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-weight: 800;
    color: var(--role);
  }

  .carte.vide .role {
    color: var(--ink-muted);
  }

  .nom {
    font-size: var(--text-base);
    font-weight: 700;
    line-height: 1.25;
    text-wrap: balance;
  }

  /* Le seul rang qui reste au plat du jour, et le seul dont il ait besoin. */
  .principal .nom {
    font-size: var(--text-lg);
    letter-spacing: -0.02em;
    line-height: 1.15;
  }

  /* Un détail non publié n'est pas un nom de plat : il s'écrit comme une
     mention, pas comme un titre. Il se distingue aussi d'une absence, qui
     n'annonce aucun plat du tout. */
  .unknown {
    font-style: italic;
    font-weight: 600;
    opacity: 0.75;
  }

  .absent {
    font-size: var(--text-sm);
    font-style: italic;
    color: var(--ink-muted);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    color: var(--ink-muted);
  }

  .tags em {
    font-style: normal;
    font-size: 0.5625rem;
    font-weight: 800;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    border: 1.5px solid currentColor;
    border-radius: var(--radius-pilule);
    padding: 0.08rem 0.4rem;
  }

  /*
    L'illustration repose sur un disque clair et jamais sur l'aplat du rôle : un
    poisson bleu sur fond bleu ne se voit pas. C'est la même règle que sur
    l'écran de la semaine, pour la même raison.
  */
  .vignette {
    width: var(--ill-disque);
    height: var(--ill-disque);
    border-radius: 50%;
    background: color-mix(in srgb, var(--role) 12%, var(--carte));
    display: grid;
    place-items: center;
    flex: none;
  }

  .vignette :global(.illustration) {
    width: var(--ill-plat);
    height: var(--ill-plat);
  }
</style>
