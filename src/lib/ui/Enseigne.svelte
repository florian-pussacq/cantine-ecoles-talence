<script lang="ts">
  /**
   * Le nom du lieu, affiché comme une plaque à la porte (design.md, D35).
   *
   * Il est constant par construction, et D28 lui applique donc la règle qu'il
   * avait posée pour le compartiment du pain : ce qui ne varie jamais ne prend
   * pas la surface de ce qui varie tous les jours. Petit corps, teinte atténuée,
   * la ligne la plus haute de l'écran — une mention, pas un titre.
   *
   * Ce n'est délibérément pas un titre de premier niveau. Le `h1` est le titre
   * de l'écran, posé juste en dessous par `EnTete` — sur les écrans de menu,
   * « Menu de la cantine » (D55). Faire de l'enseigne le titre donnerait à un
   * lecteur d'écran le nom du lieu là où il attend le nom de la page.
   *
   * Elle vit dans la coque et non dans `EnTete` pour deux raisons qui vont dans
   * le même sens : elle est commune aux quatre écrans, et elle ne doit pas
   * glisser avec le jour. `EnTete` vit à l'intérieur du bloc animé depuis D30 ;
   * une enseigne qui rentrerait par la droite à chaque changement de jour
   * affirmerait que l'identité du lieu change avec la date.
   *
   * Le disque et le nom mènent au menu. C'est la convention du logo qui ramène
   * à l'accueil — une convention, pas une affordance : rien n'annonce que cette
   * ligne est un lien, et c'est pourquoi les écrans secondaires portent en plus
   * une sortie nommée (D62).
   *
   * **Elle réserve un emplacement de commande, occupé par exactement une
   * commande sur tout écran** (D62). La roue crantée sur les deux écrans de
   * menu, la sortie de l'écran partout ailleurs. C'est la coque qui tranche,
   * parce qu'elle est le seul endroit qui connaisse les écrans ; l'enseigne ne
   * fait que loger ce qu'on lui donne.
   */
  import { resolve } from '$app/paths';
  import CommandeReglages from './CommandeReglages.svelte';
  import CommandeSortie from './CommandeSortie.svelte';

  let {
    sortie
  }: {
    /** `null` sur les écrans de menu, où l'emplacement revient à la roue. */
    sortie: { vers: '/' | '/reglages'; nom: string; libelle: string } | null;
  } = $props();
</script>

<div class="enseigne">
  <a class="identite" href={resolve('/')}>
    <!--
      Le disque n'est pas annoncé pour lui-même : c'est le même choix que pour
      les illustrations de plat, où l'image ne redit pas ce que le texte dit
      déjà (D33). Le nom accessible du lien vient donc du seul texte visible.
    -->
    <span class="marque" aria-hidden="true">
      <svg width="18" height="18" focusable="false"><use href="#marque" /></svg>
    </span>
    <!--
      Le nom se lit en deux temps, comme une plaque : le lieu, puis ce qui le
      situe. Le nom accessible reste le nom entier, qui est le texte visible.
    -->
    <span class="nom"><span class="lieu">Cantine</span> des écoles de Talence</span>
  </a>
  <!--
    Un réglage d'application appartient à la ligne qui porte l'application, pas
    à l'en-tête d'un contenu daté (D36). Il n'y figure que là où il se consulte :
    ailleurs, la même place sert à repartir (D62).
  -->
  {#if sortie}
    <CommandeSortie vers={sortie.vers} nom={sortie.nom} libelle={sortie.libelle} />
  {:else}
    <CommandeReglages />
  {/if}
</div>

<style>
  /*
    La hauteur est réservée indépendamment de ce que porte l'emplacement.

    Il n'est plus jamais vide (D62), mais son contenu change de largeur d'un
    écran à l'autre — une roue de 44 pixels, une pilule nommée. La réserve rend
    l'enseigne insensible à cette variation : sans elle, sa hauteur suivrait
    celle de la commande du moment, et l'en-tête sauterait au changement d'écran.
  */
  .enseigne {
    min-height: var(--cible);
    display: flex;
    align-items: center;
    gap: var(--espace-2);
    padding-inline: var(--espace-2);
  }

  .identite {
    flex: 1;
    min-width: 0;
    min-height: var(--cible);
    display: flex;
    align-items: center;
    gap: var(--espace-2);
    color: inherit;
    text-decoration: none;
  }

  .marque {
    width: 28px;
    height: 28px;
    flex: none;
    border-radius: 50%;
    background: var(--accent);
    color: var(--sur-accent);
    display: grid;
    place-items: center;
  }

  /*
    La teinte est peinte par mélange plutôt que par `opacity` : le contrôle de
    couverture de `contrast.test.ts` ne sait lire que cette forme-là, et une
    opacité posée sur l'élément entier lui échapperait sans bruit (D27).

    Il tient sur une ligne et se tronque plutôt que de se replier (D62). La
    commande qui lui fait face n'a plus une largeur fixe : une pilule nommée
    prend le double d'une roue, et sur un téléphone étroit le nom du lieu
    passait alors à deux lignes — l'enseigne changeait de hauteur d'un écran à
    l'autre, ce que sa réserve existe justement pour empêcher.

    C'est la coupure la moins coûteuse de la ligne : le nom du lieu ne varie
    jamais, et D28 range précisément ce qui ne varie pas derrière ce qui varie.
  */
  .nom {
    flex: 1;
    min-width: 0;
    font-size: var(--texte-sm);
    color: var(--encre-douce);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .lieu {
    font-weight: var(--poids-fort);
    color: var(--encre);
  }
</style>
