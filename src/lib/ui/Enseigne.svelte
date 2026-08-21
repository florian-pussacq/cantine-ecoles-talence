<script lang="ts">
  /**
   * Le nom du lieu, affiché comme une plaque à la porte (design.md, D35).
   *
   * Il est constant par construction, et D28 lui applique donc la règle qu'il
   * avait posée pour le compartiment du pain : ce qui ne varie jamais ne prend
   * pas la surface de ce qui varie tous les jours. Petit corps, teinte atténuée,
   * la ligne la plus haute de l'écran — une mention, pas un titre.
   *
   * Ce n'est délibérément pas un titre de premier niveau. Le `h1` reste la date,
   * qui est ce que l'écran montre et le repère principal d'un lecteur d'écran.
   *
   * Elle vit dans la coque et non dans `EnTete` pour deux raisons qui vont dans
   * le même sens : elle est commune aux quatre écrans, et elle ne doit pas
   * glisser avec le jour. `EnTete` vit à l'intérieur du bloc animé depuis D30 ;
   * une enseigne qui rentrerait par la droite à chaque changement de jour
   * affirmerait que l'identité du lieu change avec la date.
   */
  import CommandeReglages from './CommandeReglages.svelte';
</script>

<div class="enseigne">
  <span class="nom">Cantine des écoles de Talence</span>
  <!--
    Un réglage d'application appartient à la ligne qui porte l'application, pas
    à l'en-tête d'un contenu daté (D36). La commande garde sa règle inchangée :
    elle ne s'affiche pas sur sa propre destination.
  -->
  <CommandeReglages />
</div>

<style>
  /*
    La hauteur est réservée qu'il y ait une commande ou non : sur l'écran des
    réglages, la roue disparaît, et sans cette réserve l'enseigne changerait de
    hauteur d'un écran à l'autre — un saut que rien ne justifierait.
  */
  .enseigne {
    min-height: var(--touch);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding-inline: var(--space-2);
  }

  /*
    La teinte est peinte par mélange plutôt que par `opacity` : le contrôle de
    couverture de `contrast.test.ts` ne sait lire que cette forme-là, et une
    opacité posée sur l'élément entier lui échapperait sans bruit (D27).
  */
  .nom {
    flex: 1;
    min-width: 0;
    font-size: var(--text-sm);
    font-weight: 600;
    letter-spacing: 0.01em;
    color: color-mix(in srgb, var(--on-table) 72%, transparent);
  }
</style>
