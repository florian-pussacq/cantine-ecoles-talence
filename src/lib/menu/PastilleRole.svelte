<script lang="ts">
  import type { Course } from '../data/schema.js';

  /**
   * Le glyphe d'un rôle, dans sa pastille.
   *
   * Décoratif, et pour une raison qu'il vaut la peine d'écrire : le libellé du
   * rôle est rendu juste à côté, en toutes lettres. Le glyphe ne dit rien que le
   * texte ne dise déjà — il donne un rythme à une liste devenue longue (D50),
   * et c'est tout ce qu'on lui demande.
   *
   * Il est peint en `currentColor` : c'est la pastille qui porte la couleur du
   * rôle, et le glyphe la reçoit. Un seul jeton par rôle suffit ainsi à peindre
   * l'aplat, le glyphe qui s'y pose et le libellé qui l'accompagne.
   */
  let { slot, size = 20 }: { slot: Course['slot']; size?: number } = $props();
</script>

<svg width={size} height={size} aria-hidden="true" focusable="false" class="glyphe">
  <use href={`#role-${slot}`} />
</svg>

<style>
  .glyphe {
    display: block;
    flex: none;
  }
</style>
