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
  import PastilleAllergene from './PastilleAllergene.svelte';

  /**
   * Un rôle du service : le plat principal sur l'aplat de sa famille, ou une
   * ligne du tableau qui le suit (refonte-signaletique, D7).
   *
   * Il existe pour les six rôles du déjeuner, y compris lorsqu'aucun plat n'est
   * publié : un creux doit rester distinguable d'une donnée manquante (D12), et
   * un rôle qui disparaîtrait ferait douter de ce que l'écran n'affiche pas.
   *
   * Il est un `div` et non un `li` : la journée entière est une cible unique
   * (D38), donc ce rôle vit dans un `<button>`. Une liste y serait du HTML
   * invalide, et annoncerait aux lecteurs d'écran une structure de liste que le
   * bouton aplatit de toute façon.
   *
   * **Rien ici n'est actionnable** (D38). La cible est la journée entière, et
   * elle est portée par l'élément qui contient la suite.
   *
   * Trois formes, et un seul composant, pour que les trois ne divergent pas sur
   * ce qu'elles disent :
   *
   * - **le plat principal** se pose sur l'aplat de sa famille : son nom en
   *   coupe d'affichage, sous lui le rôle et la famille, et son dessin sur un
   *   disque à la teinte pâle — jamais sur l'aplat, où un poisson bleu sur fond
   *   bleu disparaîtrait ;
   * - **une ligne** pour les autres rôles : le rôle dans une colonne qui précède
   *   le nom, jamais au-dessus de lui ; ses mentions sous le nom ; sa vignette à
   *   droite. Aucune couleur de rôle ni de famille ;
   * - **une ligne compacte** pour un rôle absent et pour le goûter, sans
   *   vignette (lignes-compactes, D1).
   */
  let {
    slot,
    course,
    legend,
    principal = false,
    compacte = false
  }: {
    slot: Course['slot'];
    course: Course | null;
    /*
      Le rôle ne reçoit que la légende, et non le jour entier : c'est tout ce
      dont il se sert, et un menu sans date — celui de grève — peut alors le
      rendre sans qu'on ait à lui fabriquer une journée qui n'existe pas.
    */
    legend: AllergenLegend;
    principal?: boolean;
    compacte?: boolean;
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
    en a pas — c'est l'inverse de ce que la ligne vide est là pour dire.
  */
  const match = $derived(course === null ? null : classify(course.label));

  /* La famille ne vaut que pour le plat principal : `classify()` range aussi une
     salade grecque en « végétarien », ce qui ne dit rien d'une entrée (D3). */
  const famille = $derived(principal && match ? match.family : null);

  /* Le plat principal ne prend l'aplat que s'il est servi : absent, il est une
     ligne d'absence comme une autre. */
  const aplat = $derived(famille !== null && course !== null);

  /* Une qualité promue au rang de nom ne se redit pas parmi les mentions. */
  const mentions = $derived(
    course === null || nom?.kind === 'quality' ? [] : course.flags.map(qualityLabel)
  );
</script>

<div
  class="plat"
  class:vide={course === null}
  class:principal={aplat}
  class:compacte={compacte || course === null}
  class:famille={aplat}
  style:--aplat={aplat ? `var(--fam-${famille})` : undefined}
  style:--pale={aplat ? `var(--fam-${famille}-pale)` : undefined}
>
  {#if aplat && course && nom}
    <span class="corps">
      <span class="nom" class:unknown={nom.kind === 'undisclosed'}>{nom.text}</span>
      <span class="meta">
        <span class="role">{slotLabel(slot)}</span>
        {#if famille && familyLabel(famille)}
          · <span class="famille-nom">{familyLabel(famille)}</span>
        {/if}
        {#each mentions as mention (mention)}
          · <em>{mention}</em>
        {/each}
      </span>
      {#if signale}
        <PastilleAllergene {...signale} />
      {/if}
    </span>
    {#if match}
      <span class="vignette"><Illustration name={match.illustration} /></span>
    {/if}
  {:else}
    <span class="role">{slotLabel(slot)}</span>
    <span class="corps">
      {#if course && nom}
        <span class="nom" class:unknown={nom.kind === 'undisclosed'}>{nom.text}</span>
        {#if mentions.length > 0}
          <span class="meta">
            {#each mentions as mention, i (mention)}{i > 0 ? ' · ' : ''}<em>{mention}</em>{/each}
          </span>
        {/if}
        {#if signale}
          <PastilleAllergene {...signale} />
        {/if}
        <!--
          Un rôle du déjeuner absent s'énonce ; un goûter absent ne produit pas de
          ligne du tout, et n'a donc pas de formulation (D29). Le test de `slot`
          n'est pas une précaution de typage : c'est cette règle, écrite.
        -->
      {:else if slot !== 'gouter'}
        <span class="absent">{slotAbsence(slot)}</span>
      {/if}
    </span>
    {#if match && !compacte}
      <span class="vignette"><Illustration name={match.illustration} /></span>
    {/if}
  {/if}
</div>

<style>
  /*
    Une ligne du tableau : le rôle, le plat, la vignette. Un filet la sépare de
    la suivante, sans carte ni ombre (D7). La colonne du rôle a la largeur de son
    plus long libellé, « Accompagnement », pour que tous les noms s'alignent.
  */
  .plat {
    display: grid;
    grid-template-columns: var(--colonne-role) minmax(0, 1fr) var(--ill-ligne);
    align-items: center;
    column-gap: var(--espace-3);
    padding-block: var(--espace-3);
    border-bottom: 1px solid var(--bord);
    color: var(--encre);
  }

  /*
    Une ligne compacte : sans vignette, et plus basse. Elle ne descend pas sous
    une cible tactile : le goûter en est une (lignes-compactes, D2).
  */
  .compacte {
    grid-template-columns: var(--colonne-role) minmax(0, 1fr);
    min-height: var(--cible);
    padding-block: var(--espace-2);
  }

  .role {
    font-size: var(--texte-xs);
    font-weight: var(--poids-moyen);
    color: var(--encre-douce);
  }

  .corps {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--espace-1);
    min-width: 0;
  }

  .nom {
    font-size: var(--texte-base);
    font-weight: var(--poids-moyen);
    line-height: 1.25;
    text-wrap: balance;
  }

  .meta {
    font-size: var(--texte-xs);
    color: var(--encre-douce);
  }

  .meta em {
    font-style: normal;
  }

  /* Un détail non publié n'est pas un nom de plat : il s'écrit comme une
     mention, pas comme un titre. Il se distingue aussi d'une absence, qui
     n'annonce aucun plat du tout. */
  .unknown {
    font-style: italic;
    color: var(--encre-douce);
  }

  .absent {
    font-size: var(--texte-sm);
    font-style: italic;
    color: var(--encre-douce);
  }

  .vignette {
    display: grid;
    place-items: center;
  }

  .vignette :global(.illustration) {
    width: var(--ill-ligne);
    height: var(--ill-ligne);
  }

  /*
    Le plat principal : l'aplat de sa famille, le texte en blanc — une paire
    mesurée dans chaque palette (`contrast.test.ts`) — et le dessin sur un
    disque à la teinte pâle. Ni filet ni liseré : c'est l'aplat qui dit la
    famille, sur toute sa surface (D7).
  */
  .principal {
    grid-template-columns: minmax(0, 1fr) var(--ill-disque);
    padding: var(--espace-4) var(--espace-3) var(--espace-4) var(--espace-4);
    border-bottom: 0;
    border-radius: var(--rayon-carte);
    background: var(--aplat);
    color: var(--sur-famille);
  }

  .principal .corps {
    gap: var(--espace-2);
  }

  .principal .nom {
    font-family: var(--police-affichage);
    font-size: var(--texte-2xl);
    font-weight: var(--poids-fort);
    line-height: 1.05;
    letter-spacing: -0.02em;
  }

  .principal .meta,
  .principal .role {
    font-size: var(--texte-sm);
    color: var(--sur-famille);
  }

  .principal .unknown {
    color: var(--sur-famille);
  }

  .principal .famille-nom {
    font-weight: var(--poids-fort);
  }

  .principal .vignette {
    width: var(--ill-disque);
    height: var(--ill-disque);
    border-radius: 50%;
    background: var(--pale);
  }

  .principal .vignette :global(.illustration) {
    width: var(--ill-plat);
    height: var(--ill-plat);
  }
</style>
