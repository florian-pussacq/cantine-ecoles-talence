<script lang="ts">
  import type { ResolvedDay } from '../data/dataset.js';
  import { LUNCH_SLOTS } from './labels.js';
  import PlatCarte from './PlatCarte.svelte';

  let { day }: { day: ResolvedDay } = $props();

  /**
   * Le déjeuner, dans l'ordre où l'écran le montre (design.md, D39).
   *
   * Un élément par rôle, et jamais moins : la liste ne se referme pas sur un
   * rôle absent, faute de quoi un creux cesserait d'être distinguable d'une
   * donnée manquante (D12). Mais l'absence n'a pas le poids d'un plat : elle
   * tient sur une ligne compacte (lignes-compactes, D1).
   *
   * L'accompagnement fait exception : il va avec le plat, et c'est le plat
   * principal qui le porte dans son intitulé (accompagnement-dans-le-plat, D2).
   * Il n'a pas de ligne, et son absence ne s'énonce pas : un plat complet n'en a
   * pas par nature (D3).
   *
   * Un jour qui servirait un accompagnement sans plat principal n'est pas
   * attendu. Il garde alors sa ligne, plutôt que de disparaître sans un mot : un
   * plat qu'on ne peut plus lire serait pire qu'une règle prise à la lettre.
   */
  const parRole = (slot: (typeof LUNCH_SLOTS)[number]) =>
    day.courses.find((course) => course.slot === slot) ?? null;

  const plat = $derived(parRole('plat'));
  const accompagnement = $derived(parRole('accompagnement'));

  const lignes = $derived(
    LUNCH_SLOTS.filter(
      (slot) =>
        slot !== 'plat' && (slot !== 'accompagnement' || (plat === null && accompagnement !== null))
    ).map((slot) => ({ slot, course: parRole(slot) }))
  );
</script>

<!--
  Le déjeuner : un aplat, puis un tableau (refonte-signaletique, D7).

  Le plat principal ouvre la suite sur l'aplat de sa famille, et porte son
  accompagnement dans son intitulé ; les autres rôles le suivent en lignes, le
  rôle dans une colonne, séparées par un filet. Plus de
  cartes de même poids : c'est la hiérarchie qui dit ce qui compte, et non la
  répétition d'un même cadre.

  Aucun rôle n'est actionnable : la cible est la journée entière, et elle est
  portée par l'élément qui contient cette suite (D38).
-->
<div class="tray">
  <PlatCarte
    slot="plat"
    course={plat}
    {accompagnement}
    legend={day.legend}
    principal
    compacte={plat === null}
  />
  {#each lignes as { slot, course } (slot)}
    <PlatCarte {slot} {course} legend={day.legend} compacte={course === null} />
  {/each}
</div>

<style>
  .tray {
    display: flex;
    flex-direction: column;
  }

  /* L'aplat se détache du tableau qui le suit par un intervalle, et non par un
     filet : il en est séparé, pas rangé dedans. */
  .tray :global(.principal) {
    margin-bottom: var(--espace-1);
  }

  /* Le dernier filet fermerait un tableau qui n'a plus rien à séparer. */
  .tray :global(.plat:last-child) {
    border-bottom: 0;
  }
</style>
