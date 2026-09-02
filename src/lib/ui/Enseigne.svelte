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
   * à l'accueil, et elle vaut ici sur cinq écrans qui portent tous, depuis
   * cette évolution, leur propre commande de retour — l'enseigne est celle qui
   * ne dépend d'aucun contenu pour savoir où elle mène.
   */
  import { resolve } from '$app/paths';
  import CommandeReglages from './CommandeReglages.svelte';
</script>

<div class="enseigne">
  <a class="identite" href={resolve('/')}>
    <!--
      Le disque n'est pas annoncé pour lui-même : c'est le même choix que pour
      les illustrations de plat, où l'image ne redit pas ce que le texte dit
      déjà (D33). Le nom accessible du lien vient donc du seul texte visible.
    -->
    <span class="marque" aria-hidden="true">
      <svg width="22" height="22" focusable="false"><use href="#marque" /></svg>
    </span>
    <span class="nom">Cantine des écoles de Talence</span>
  </a>
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

  .identite {
    flex: 1;
    min-width: 0;
    min-height: var(--touch);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: inherit;
    text-decoration: none;
  }

  .marque {
    width: 36px;
    height: 36px;
    flex: none;
    border-radius: 50%;
    background: var(--accent);
    color: var(--on-accent);
    display: grid;
    place-items: center;
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
    color: color-mix(in srgb, var(--ink) 72%, transparent);
  }
</style>
