<script lang="ts">
  import Illustration from '../illustrations/Illustration.svelte';
  import { classify } from '../illustrations/families.js';
  import type { AllergenLegend, Course } from '../data/schema.js';
  import {
    courseName,
    familyLabel,
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
   * La couleur ne dit plus le rôle : elle dit la famille du plat principal, la
   * même que son disque sur l'écran de la semaine (couleur-par-famille, D1, D3).
   * Seule la carte principale la porte ; les autres restent en encre, et se
   * reconnaissent à leur glyphe et à leur libellé (D4).
   */
  let {
    slot,
    course,
    legend,
    principal = false
  }: {
    slot: Course['slot'];
    course: Course | null;
    /*
      La carte ne reçoit que la légende, et non le jour entier : c'est tout ce
      dont elle se sert, et un menu sans date — celui de grève — peut alors la
      rendre sans qu'on ait à lui fabriquer une journée qui n'existe pas.
    */
    legend: AllergenLegend;
    principal?: boolean;
  } = $props();

  /** Les allergènes cochés que porte ce plat : leurs codes et leurs noms courts. */
  const signale = $derived.by(() => {
    if (course === null) return null;
    const codes = allergenFilter.matching(course);
    if (codes.length === 0) return null;
    return { codes, names: flaggedAllergenNames(course, legend, codes) };
  });

  const nom = $derived(course === null ? null : courseName(course));

  /*
    L'illustration se déduit du libellé, et un rôle sans plat n'en a pas.
    Poser le repli `inconnu` sur une absence signalerait une donnée là où il n'y
    en a pas — c'est l'inverse de ce que la carte vide est là pour dire.
  */
  const match = $derived(course === null ? null : classify(course.label));

  /* La famille ne vaut que pour le plat principal : `classify()` range aussi une
     salade grecque en « végétarien », ce qui ne dit rien d'une entrée (D3). */
  const famille = $derived(principal && match ? match.family : null);
</script>

<div
  class="carte"
  class:vide={course === null}
  class:principal
  class:famille={famille !== null}
  style:--ring={famille ? `var(--fam-${famille})` : undefined}
  style:--pale={famille ? `var(--fam-${famille}-pale)` : undefined}
>
  <span class="pastille"><PastilleRole {slot} /></span>

  <span class="corps">
    <span class="role">{slotLabel(slot)}</span>
    {#if course && nom}
      <span class="nom" class:unknown={nom.kind === 'undisclosed'}>{nom.text}</span>
      {#if famille && familyLabel(famille)}
        <span class="famille-nom">{familyLabel(famille)}</span>
      {/if}
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
    Par défaut, la pastille est neutre : surface du creux, glyphe en encre
    atténuée, une paire déjà mesurée. Seule la carte principale l'allume, de la
    couleur de sa famille, sous un glyphe blanc (D3, D4).
  */
  .pastille {
    width: 34px;
    height: 34px;
    border-radius: var(--radius-pastille);
    background: var(--creux);
    color: var(--ink-muted);
    box-shadow: inset 0 0 0 1px var(--bord);
    display: grid;
    place-items: center;
    flex: none;
  }

  /* Le filet et le bord disent la famille sur toute la hauteur de la carte. */
  .carte.famille {
    border-color: var(--ring);
    box-shadow: inset 4px 0 0 var(--ring);
  }

  .famille .pastille {
    background: var(--ring);
    color: var(--on-fam);
    box-shadow: none;
  }

  .corps {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.15rem;
    min-width: 0;
    flex: 1;
  }

  .role {
    font-size: var(--text-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-weight: var(--poids-titre);
    color: var(--ink-muted);
  }

  /* Sur la carte principale, le libellé prend la famille : chaque famille tient
     4,5:1 comme encre sur la carte blanche (contrast.test.ts). */
  .famille .role {
    color: var(--ring);
  }

  .famille-nom {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-xs);
    font-weight: var(--poids-fort);
    color: var(--ring);
  }

  .famille-nom::before {
    content: '';
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 50%;
    background: currentColor;
  }

  .nom {
    font-size: var(--text-base);
    font-weight: var(--poids-fort);
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
    font-weight: var(--poids-moyen);
    color: var(--ink-muted);
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
    font-size: var(--text-2xs);
    font-weight: var(--poids-titre);
    letter-spacing: 0.09em;
    text-transform: uppercase;
    border: 1.5px solid currentColor;
    border-radius: var(--radius-pilule);
    padding: 0.08rem 0.4rem;
  }

  /*
    L'illustration repose sur un disque clair et jamais sur un aplat saturé : un
    poisson bleu sur fond bleu ne se voit pas. Sur la carte principale, c'est le
    disque de la semaine en petit — teinte pâle de la famille, cerclée d'elle.
  */
  .vignette {
    width: var(--ill-disque);
    height: var(--ill-disque);
    border-radius: 50%;
    background: var(--creux);
    display: grid;
    place-items: center;
    flex: none;
  }

  .famille .vignette {
    background: var(--pale);
    box-shadow: inset 0 0 0 3px var(--ring);
  }

  .vignette :global(.illustration) {
    width: var(--ill-plat);
    height: var(--ill-plat);
  }
</style>
