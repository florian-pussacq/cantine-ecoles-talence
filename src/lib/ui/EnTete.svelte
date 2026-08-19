<script lang="ts">
  /**
   * L'en-tête de tous les écrans : une ligne, une phrase.
   *
   * Il portait auparavant deux lignes — une mention en surtitre, puis un titre —
   * et le même bloc de style était recopié dans les quatre écrans. Sur un
   * téléphone, cette hauteur est prise sur le plateau, qui est la raison d'être
   * de l'application.
   *
   * Le titre de premier niveau reste unique par écran : c'est une exigence
   * vérifiée de bout en bout, et le repère principal d'un lecteur d'écran.
   */
  import CommandeReglages from './CommandeReglages.svelte';

  let { quand, quoi }: { quand: string; quoi: string } = $props();
</script>

<header>
  <h1>
    <span class="quand">{quand}</span>
    <!-- Le séparateur est décoratif : le lire à voix haute n'apprend rien. -->
    <span aria-hidden="true" class="point">·</span>
    <span class="quoi">{quoi}</span>
  </h1>
  <!--
    Le réglage des allergènes s'atteint d'ici depuis que la barre ne porte plus
    que les vues consultées chaque matin (design.md, D31). Il vit dans l'en-tête
    parce que c'est le seul élément commun à tous les écrans, et qu'un réglage
    n'a pas à voyager avec le contenu.
  -->
  <CommandeReglages />
</header>

<style>
  header {
    color: var(--on-table);
    padding-inline: var(--space-2);
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  h1 {
    flex: 1;
    min-width: 0;
  }

  h1 {
    margin: 0;
    font-size: var(--text-xl);
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.2;
    text-wrap: balance;
  }

  /*
    La mention est en petites capitales et non en gras : elle situe, elle
    n'annonce pas. C'est l'objet de l'écran qui doit se lire en premier.
  */
  .quand {
    font-size: var(--text-sm);
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    opacity: 0.72;
  }

  .point {
    opacity: 0.4;
    margin-inline: 0.1em;
  }
</style>
