<script lang="ts">
  import { page } from '$app/state';
  import { resolve } from '$app/paths';

  /**
   * Le choix entre les deux écrans de menu, ancré au bas de la fenêtre
   * (refonte-signaletique, D11).
   *
   * Il ne porte que ce qui se consulte chaque matin (D31). Les allergènes en
   * sont sortis : c'est un réglage, coché une fois à l'installation, et lui
   * donner un tiers de la place revenait à le mettre sur le même plan que les
   * deux vues du menu. Ils s'atteignent par la commande de l'enseigne.
   *
   * **Il est en bas, pour la troisième fois.** `navigation-basse` l'y avait
   * descendu, à portée du pouce ; `menu-en-cartes` l'avait remonté pour laisser
   * le bas à un pied de mentions, par fidélité à une maquette (D52). La raison
   * de D31 n'avait jamais cessé d'être vraie, et l'exigence « Accès aux écrans »
   * dit maintenant où il est : le remonter demandera de la modifier, et non
   * seulement ce composant.
   *
   * Ce choix n'apparaît que sur les deux écrans qu'il choisit entre
   * (`+layout.svelte`). Chacun des autres porte sa propre sortie, nommée, dans
   * l'en-tête, à la place qu'y occupe la roue crantée sur les écrans de menu
   * (D62).
   *
   * Un onglet ne réinitialise pas le jour consulté, et ce n'est pas un oubli
   * (D48) : le partage du jour entre les deux écrans est ce qui fait qu'ouvrir
   * un jour depuis la semaine ouvre *ce* jour. La gêne qu'il cause a sa
   * commande, visible et nommée, sous le menu.
   */
  const tabs = [
    { path: '/', label: 'Jour' },
    { path: '/semaine', label: 'Semaine' }
  ] as const;
</script>

<nav class="onglets" aria-label="Écrans">
  {#each tabs as tab (tab.path)}
    {@const current = page.url.pathname.replace(/\/$/, '') === tab.path.replace(/\/$/, '')}
    <a href={resolve(tab.path)} aria-current={current ? 'page' : undefined}>{tab.label}</a>
  {/each}
</nav>

<style>
  /*
    Bornée à la colonne de contenu, et non étirée sur toute la fenêtre : une
    barre de 1 400 pixels serait une seconde mise en page qui ne dit pas son nom,
    alors que D23 n'en admet qu'une.

    Son fond est opaque : le contenu défile derrière elle, et un fond translucide
    laisserait passer le texte qui glisse dessous. Le rembourrage bas porte
    l'encart système, ce qui empêche la moitié basse des cibles de passer sous
    l'indicateur d'accueil (D34).
  */
  .onglets {
    position: fixed;
    inset-inline: 0;
    bottom: 0;
    z-index: 1;
    margin-inline: auto;
    max-width: var(--colonne);
    min-height: var(--barre-reserve);
    padding-bottom: var(--encart-bas);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    background: var(--fond);
    border-top: 1px solid var(--bord);
  }

  .onglets a {
    min-height: var(--barre);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--texte-sm);
    font-weight: var(--poids-moyen);
    color: var(--encre-douce);
    text-decoration: none;
  }

  /*
    L'onglet courant est signalé par un trait d'encre au haut de la barre, par
    son encre et sa graisse, et par `aria-current` : ni la couleur ni la
    position ne portent seules l'information. Pas de pilule (D11).
  */
  .onglets a[aria-current='page'] {
    color: var(--encre);
    font-weight: var(--poids-fort);
    box-shadow: inset 0 3px 0 var(--encre);
  }

  .onglets a:focus-visible {
    outline-offset: -3px;
  }
</style>
