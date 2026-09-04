<script lang="ts">
  import { resolve } from '$app/paths';
  import { allergenFilter } from '$lib/filter/allergens.svelte.js';
  import Icone from './Icone.svelte';

  /**
   * L'accès au réglage des allergènes, et l'état de ce réglage (design.md, D32).
   *
   * Le filtre n'est pas une préférence inerte : il modifie en permanence ce que
   * montrent les écrans de consultation. Une commande muette laisserait cet état
   * invisible les jours où aucun plat n'est concerné — c'est-à-dire les jours où
   * l'on ne peut pas distinguer « rien à signaler » de « rien de coché ».
   *
   * Voir l'état et aller le corriger sont donc le même geste : le compte est
   * porté par la commande qui mène au réglage, et non affiché à côté d'elle.
   *
   * Elle ne décide plus elle-même de son absence (D62). Elle se masquait sur sa
   * propre destination — « une commande qui mène là où l'on est déjà ne mène
   * nulle part » —, ce qui était juste et devenu insuffisant : elle ne mène pas
   * non plus là où l'on cherche à aller depuis le menu de grève ou les mentions.
   * La règle est désormais celle de l'emplacement, tenue par la coque, qui est
   * le seul endroit à connaître les écrans.
   */
  const DESTINATION = '/reglages';

  const compte = $derived(allergenFilter.codes.size);

  /*
    Le compte vit dans le nom accessible et non dans la seule pastille : ce qu'un
    œil voit, un lecteur d'écran doit l'entendre. La pastille est le même fait
    sous sa forme visible, et reste donc masquée à la restitution.
  */
  const nom = $derived(
    compte === 0
      ? 'Réglages'
      : `Réglages — ${compte} allergène${compte > 1 ? 's' : ''} surveillé${compte > 1 ? 's' : ''}`
  );
</script>

<a class="commande" href={resolve(DESTINATION)} aria-label={nom}>
  <Icone name="reglages" />
  <!--
    Rien lorsque la sélection est vide : un « 0 » serait exactement
    l'« invitation insistante à en configurer un » que la spécification du
    filtre interdit déjà.

    La pastille est posée en absolu dans une commande de taille fixe : elle ne
    participe pas à la mise en page, donc sa place est réservée qu'elle soit
    occupée ou non. C'est ce qui permet de la lire du stockage local après
    l'hydratation sans rien déplacer — et d'éviter le script bloquant que D21
    avait dû introduire pour le thème, et que D25 vient de supprimer.
  -->
  {#if compte > 0}
    <span class="compte" aria-hidden="true">{compte}</span>
  {/if}
</a>

<style>
  .commande {
    position: relative;
    flex: none;
    width: var(--touch);
    height: var(--touch);
    display: grid;
    place-items: center;
    color: var(--ink);
    border-radius: 999px;
  }

  .compte {
    position: absolute;
    top: 2px;
    right: 2px;
    min-width: 17px;
    height: 17px;
    padding-inline: 4px;
    border-radius: 999px;
    background: var(--carte);
    color: var(--ink);
    font-size: 0.625rem;
    font-weight: 800;
    line-height: 17px;
    text-align: center;
    /* Un anneau de fond, parce que la pastille se pose sur les dents de la roue
       et que les deux formes se confondaient à la taille réelle. Il sépare, il
       ne porte rien : c'est le fond de la page, pas une couleur de plus. */
    box-shadow: 0 0 0 2px var(--fond);
  }
</style>
