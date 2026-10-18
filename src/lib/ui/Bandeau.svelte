<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * Un message de l'application, sur l'un de trois tons (bandeau-et-aujourdhui, D1).
   *
   * Chaque écran avait ses propres messages — sept styles dans six fichiers —,
   * et un jour de vacances en empilait trois sans que rien dise lequel était
   * grave. Le ton le dit :
   *
   * - `alerte` : ce qui compromet la lecture d'un repas, et seulement cela.
   *   L'orange lui appartient : employé pour tout, il ne signalerait plus rien.
   * - `evenement` : ce qui caractérise le jour présenté.
   * - `info` : les limites de l'application et l'état de ses données.
   *
   * `discret` retire la surface sans changer le ton : l'avertissement de
   * fraîcheur se lit, sans prendre le pas sur le menu.
   */
  let {
    ton,
    discret = false,
    titre,
    children,
    action
  }: {
    ton: 'info' | 'evenement' | 'alerte';
    discret?: boolean;
    titre?: string;
    children?: Snippet;
    /** Une commande posée à la suite du message, comme « Appliquer ». */
    action?: Snippet;
  } = $props();
</script>

<div class="bandeau {ton}" class:discret class:avec-action={action !== undefined}>
  {#if titre}<h2>{titre}</h2>{/if}
  {#if children}<p>{@render children()}</p>{/if}
  {@render action?.()}
</div>

<style>
  .bandeau {
    border-radius: var(--rayon-pastille);
    padding: var(--espace-2) var(--espace-3);
    font-size: var(--texte-sm);
    line-height: 1.4;
  }

  .info {
    background: var(--info);
    color: var(--sur-info);
  }

  .evenement {
    background: var(--evenement);
    color: var(--sur-evenement);
  }

  /* L'alerte pèse plus que les deux autres : c'est la seule qui doive arrêter
     la lecture. */
  .alerte {
    background: var(--alerte);
    color: var(--sur-alerte);
    font-weight: var(--poids-moyen);
  }

  .discret {
    background: none;
    padding-inline: var(--espace-2);
  }

  .avec-action {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--espace-2);
    padding-right: var(--espace-2);
  }

  h2 {
    margin: 0;
    font-size: var(--texte-base);
    font-weight: var(--poids-titre);
    letter-spacing: -0.01em;
  }

  p {
    margin: 0;
  }

  h2 + p {
    margin-top: var(--espace-1);
  }

  /* Un lien ou une commande prend l'encre du ton : le contraste est celui du
     bandeau, déjà mesuré. */
  .bandeau :global(a) {
    color: currentcolor;
    font-weight: var(--poids-fort);
  }

  .bandeau :global(button) {
    flex: none;
    font: inherit;
    font-weight: var(--poids-fort);
    color: currentcolor;
    background: none;
    border: 2px solid currentcolor;
    border-radius: var(--rayon-pilule);
    min-height: var(--cible);
    padding-inline: var(--espace-3);
    cursor: pointer;
  }
</style>
