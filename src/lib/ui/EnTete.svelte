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
  let { quand, quoi }: { quand: string; quoi: string } = $props();
</script>

<header>
  <h1>
    <span class="quand">{quand}</span>
    <!-- Le séparateur est décoratif : le lire à voix haute n'apprend rien. -->
    <span aria-hidden="true" class="point">·</span>
    <span class="quoi">{quoi}</span>
  </h1>
</header>

<style>
  header {
    color: var(--on-table);
    padding-inline: var(--space-2);
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
