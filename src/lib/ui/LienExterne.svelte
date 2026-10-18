<script lang="ts">
  /**
   * Un lien qui quitte l'application, vers le site de la Ville.
   *
   * Centralisé pour deux raisons. Les attributs de sécurité et d'ouverture sont
   * posés une fois pour toutes, et la règle de lint qui exige `resolve()` sur les
   * liens de navigation est neutralisée à un seul endroit : elle vise les routes
   * internes, et ne peut pas prouver qu'une URL calculée est absolue.
   */
  let { href, children }: { href: string; children: import('svelte').Snippet } = $props();
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
<a {href} rel="noopener noreferrer" target="_blank">{@render children()}</a>

<style>
  a {
    color: inherit;
  }
</style>
