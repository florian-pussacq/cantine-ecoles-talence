<script lang="ts">
  import type { ResolvedDay } from '../data/dataset.js';
  import { LUNCH_SLOTS } from './labels.js';
  import PlatCarte from './PlatCarte.svelte';

  let { day }: { day: ResolvedDay } = $props();

  /**
   * Le déjeuner, dans l'ordre où l'écran le montre (design.md, D39).
   *
   * Une carte par rôle, et jamais moins : la liste ne se referme pas sur un rôle
   * absent, faute de quoi un creux cesserait d'être distinguable d'une donnée
   * manquante (D12).
   */
  const lignes = $derived(
    LUNCH_SLOTS.map((slot) => ({
      slot,
      course: day.courses.find((course) => course.slot === slot) ?? null
    }))
  );
</script>

<!--
  L'ardoise est devenue une liste de cartes (design.md, D50).

  La grille en deux colonnes alignait les rôles pour qu'on lise l'objet d'un coup
  d'œil. Ce n'est plus ce qu'on lui demande : sept cartes ne tiennent pas dans
  une fenêtre de téléphone, et l'écran se parcourt désormais au lieu de se
  saisir (D53). Ce qui remplace l'alignement, c'est la couleur — un repère qui ne
  bouge pas d'un jour à l'autre, ce que la famille ne pouvait pas être.

  Aucune carte n'est actionnable : la cible est la journée entière, et elle est
  portée par l'élément qui contient cette liste (D38).
-->
<div class="tray">
  {#each lignes as { slot, course } (slot)}
    <PlatCarte {slot} {course} {day} principal={slot === 'plat'} />
  {/each}
</div>

<style>
  .tray {
    /*
      La suite n'a plus de surface propre. Le plateau était une surface claire
      posée sur un fond sombre ; les cartes sont maintenant les surfaces, et un
      second plateau sous elles n'ajouterait qu'un cadre autour d'un cadre.
    */
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
</style>
