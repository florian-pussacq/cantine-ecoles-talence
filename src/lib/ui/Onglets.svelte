<script lang="ts">
  import { page } from '$app/state';
  import { resolve } from '$app/paths';

  /**
   * Le choix entre les deux écrans de menu (design.md, D52).
   *
   * Il ne porte que ce qui se consulte chaque matin (D31). Les allergènes en
   * sont sortis : c'est un réglage, coché une fois à l'installation, et lui
   * donner un tiers de la place revenait à le mettre sur le même plan que les
   * deux vues du menu. Ils s'atteignent par la commande de l'enseigne.
   *
   * **Il est en haut, et c'est un retour en arrière assumé.** `navigation-basse`
   * l'avait descendu à portée du pouce, pour une raison qui n'a pas cessé d'être
   * vraie ; elle cède à la fidélité d'une direction visuelle arrêtée sur
   * maquette. Sur les écrans qui n'y figurent pas et qui n'en portent aucun
   * substitut — la grève, les mentions — aucun segment n'est courant et le
   * choix sert de sortie : on le quitte en désignant où l'on va, plutôt que par
   * une flèche dont la destination dépend de l'historique.
   *
   * Les réglages font exception (`+layout.svelte`) : rien de ce que cette
   * pilule propose ne s'y consulte, et l'écran porte sa propre commande de
   * retour, nommée, dans son propre flux.
   *
   * Un onglet ne réinitialise pas le jour consulté, et ce n'est pas un oubli
   * (D48) : le partage du jour entre les deux écrans est ce qui fait qu'ouvrir
   * un jour depuis la semaine ouvre *ce* jour. La gêne qu'il cause a sa
   * commande, visible et nommée, sous les cartes.
   */
  const tabs = [
    { path: '/', label: 'Jour' },
    { path: '/semaine', label: 'Semaine' }
  ] as const;
</script>

<nav class="onglets" aria-label="Écrans">
  <span class="tabs">
    {#each tabs as tab (tab.path)}
      {@const current = page.url.pathname.replace(/\/$/, '') === tab.path.replace(/\/$/, '')}
      <a href={resolve(tab.path)} aria-current={current ? 'page' : undefined}>{tab.label}</a>
    {/each}
  </span>
</nav>

<style>
  .onglets {
    display: flex;
  }

  /* La pilule ne s'étire pas sur toute la largeur et se centre : c'est la borne
     posée en 9.3 de `coque-lisible`, conservée telle quelle. */
  .tabs {
    display: flex;
    flex: 1;
    margin-inline: auto;
    max-width: 360px;
    gap: var(--space-1);
    padding: 4px;
    border-radius: var(--radius-pilule);
    background: color-mix(in srgb, var(--ink) 12%, transparent);
  }

  .tabs a {
    flex: 1;
    min-height: var(--touch);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-pilule);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--ink);
    text-decoration: none;
  }

  /* L'onglet courant est signalé par un fond plein autant que par aria-current :
     ni la couleur ni l'opacité ne portent seules l'information. */
  .tabs a[aria-current='page'] {
    background: var(--accent);
    color: var(--on-accent);
    font-weight: 700;
  }
</style>
