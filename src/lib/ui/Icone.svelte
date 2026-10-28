<script lang="ts">
  /**
   * Les icônes d'interface — à ne pas confondre avec les illustrations.
   *
   * `Sprite.svelte` est spécifié décoratif : ses formes ne sont pas annoncées aux
   * technologies d'assistance, et leur absence n'empêche pas de comprendre le
   * menu. C'est juste pour un poisson dessiné à côté du mot « poisson ».
   *
   * **Le contrat est ici l'inverse, et c'est pourquoi le mécanisme est séparé**
   * (design.md, D33) : une icône d'interface est la forme visible d'une commande
   * que rien d'autre ne nomme à l'écran. Elle ne porte jamais son sens seule —
   * c'est la commande qui la contient qui porte le nom accessible, et l'icône
   * reste `aria-hidden`. Les ranger ensemble ferait porter deux contrats opposés
   * au même mécanisme, et la première personne qui appliquerait à l'un la règle
   * de l'autre casserait un bouton.
   *
   * Contrainte de dessin héritée du sprite, et qui vaut ici aussi : formes
   * pleines, aucun trait fin. Une roue crantée est le contre-exemple typique —
   * dentelée et ajourée, elle se réduit mal. Celle-ci est dessinée pour sa taille
   * de destination : anneau de 5,5 unités d'épaisseur sur 24, dents de 2,8.
   *
   * Les chevrons du rang de navigation remplacent les caractères « ‹ » et « › »
   * (refonte-signaletique) : un glyphe de police n'est pas une icône, il prend la
   * graisse et la ligne de base du texte voisin, et change avec la police. Ils
   * sont pleins, épais de 3 unités, pour la même raison que la roue.
   */
  let { name, size = 22 }: { name: 'reglages' | 'precedent' | 'suivant'; size?: number } = $props();

  /** Les huit dents, posées par rotation plutôt que décrites une à une. */
  const DENTS = [0, 45, 90, 135, 180, 225, 270, 315];
</script>

<svg
  class="icone"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="currentColor"
  aria-hidden="true"
  focusable="false"
>
  {#if name === 'reglages'}
    {#each DENTS as angle (angle)}
      <rect x="10.6" y="0.9" width="2.8" height="5.4" rx="1.2" transform="rotate({angle} 12 12)" />
    {/each}
    <!-- L'anneau et son ajour en un seul tracé : deux sous-tracés et la règle
         pair-impair, faute de quoi il faudrait un masque pour percer le trou. -->
    <path
      fill-rule="evenodd"
      d="M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2Zm0 5.5a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Z"
    />
  {:else if name === 'precedent'}
    <path d="M14.6 4.2 16.7 6.3 11 12l5.7 5.7-2.1 2.1L6.8 12Z" />
  {:else if name === 'suivant'}
    <path d="M9.4 4.2 7.3 6.3 13 12l-5.7 5.7 2.1 2.1L17.2 12Z" />
  {/if}
</svg>

<style>
  .icone {
    display: block;
    flex: none;
  }
</style>
