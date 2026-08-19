<script lang="ts">
  import '$lib/design/tokens.css';
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import Sprite from '$lib/illustrations/Sprite.svelte';
  import { allergenFilter } from '$lib/filter/allergens.svelte.js';
  import { appUpdate } from '$lib/pwa/update.svelte.js';

  let { children } = $props();

  allergenFilter.hydrate();
  appUpdate.register();

  /*
    La barre ne porte que ce qui se consulte chaque matin (design.md, D31).

    Les allergènes en sont sortis : c'est un réglage, coché une fois à
    l'installation, et lui donner un tiers de la barre revenait à le mettre sur
    le même plan que les deux vues du menu. L'argument avait déjà servi contre
    le thème (D22) et contre « À propos » ; il n'avait simplement jamais été
    retourné contre eux. Ils s'atteignent désormais par la commande d'en-tête.
  */
  const tabs = [
    { path: '/', label: 'Jour' },
    { path: '/semaine', label: 'Semaine' }
  ] as const;
</script>

<Sprite />

<div class="shell">
  {#if appUpdate.available}
    <!--
      La nouvelle version attend : elle ne remplace pas l'application pendant
      qu'on la consulte, ce qui ferait perdre le jour qu'on regardait.
    -->
    <p class="update">
      <span>Une nouvelle version est disponible.</span>
      <button type="button" onclick={() => appUpdate.apply()}>Appliquer</button>
    </p>
  {/if}

  {@render children()}

  <!--
    « À propos » n'est pas un onglet : on le consulte une fois, pas tous les
    matins. Un quatrième onglet volerait de la place à ce qu'on ouvre chaque jour.
  -->
  <footer class="about">
    <a href={resolve('/a-propos')}>Source, mentions et vie privée</a>
  </footer>
</div>

<!--
  La barre est ancrée au bas de la fenêtre, à portée du pouce (D31).

  Elle est hors de la coque parce qu'elle n'appartient pas au flux du contenu :
  celui-ci lui réserve sa hauteur, elle ne la lui prend pas. Sur les écrans qui
  n'y figurent pas — les réglages, les mentions — aucun segment n'est courant et
  la barre sert de sortie : on la quitte en désignant où l'on va, plutôt que par
  une flèche de retour dont la destination dépend de l'historique.
-->
<nav class="barre" aria-label="Écrans">
  <span class="tabs">
    {#each tabs as tab (tab.path)}
      {@const current = page.url.pathname.replace(/\/$/, '') === tab.path.replace(/\/$/, '')}
      <a href={resolve(tab.path)} aria-current={current ? 'page' : undefined}>{tab.label}</a>
    {/each}
  </span>
</nav>

<style>
  .shell {
    max-width: var(--shell);
    margin-inline: auto;
    min-height: 100dvh;
    /* Le contenu réserve la barre *et* l'encart système sous elle : réserver la
       seule hauteur de la barre ferait passer le pied de page dessous sur les
       appareils à indicateur d'accueil, et nulle part ailleurs (D34). */
    padding: var(--space-3) var(--space-3) calc(var(--space-5) + var(--barre-reservee));
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    /*
      La colonne ne défile jamais de côté, et c'est ici que ça se dit.

      Une transition d'entrée décale son élément de 24 pixels : ce débordement
      s'ajoute brièvement à la largeur défilable et laisse la page glisser
      pendant l'animation. La découpe doit être portée par un ancêtre — un
      élément translaté ne se découpe pas lui-même — et la porter une fois ici
      couvre toutes les animations de la colonne plutôt qu'une par une.

      `clip` et non `hidden` : il découpe sans créer de conteneur de défilement,
      et c'est la seule valeur qui laisse l'axe vertical intact.
    */
    overflow-x: clip;
  }

  /*
    La barre reste bornée à la colonne de contenu, et ne s'étire pas sur toute
    la fenêtre : une barre de 1 400 pixels serait une seconde mise en page qui
    ne dit pas son nom, alors que D23 n'en admet qu'une. Le pouce n'est de toute
    façon pas le sujet sur un écran de bureau.

    Son fond est opaque : le contenu défile derrière elle, et un fond translucide
    laisserait passer le texte qui glisse dessous.
  */
  .barre {
    position: fixed;
    inset-inline: 0;
    bottom: 0;
    z-index: 1;
    margin-inline: auto;
    max-width: var(--shell);
    min-height: var(--barre-reservee);
    display: flex;
    align-items: flex-start;
    /* Le rembourrage bas porte l'encart système en plus du sien : c'est ce qui
       empêche la moitié basse de la barre de passer sous l'indicateur d'accueil
       (D34). */
    padding: 3px var(--space-3) calc(3px + var(--encart-bas));
    background: var(--table);
  }

  /* La pilule garde la borne posée en 9.3 de `coque-lisible` — elle ne s'étire
     pas sur toute la largeur — mais se centre désormais dans la barre : calée à
     gauche en haut de l'écran, elle s'alignait sur le contenu ; posée en bas et
     bornée, elle laissait un vide asymétrique à sa droite. */
  .tabs {
    display: flex;
    flex: 1;
    margin-inline: auto;
    max-width: 360px;
    gap: var(--space-1);
    padding: 3px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--on-table) 12%, transparent);
  }

  .tabs a {
    flex: 1;
    min-height: var(--touch);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--on-table);
    text-decoration: none;
    opacity: 0.75;
  }

  .about {
    margin-top: auto;
    padding-top: var(--space-4);
    text-align: center;
  }

  .about a {
    color: var(--on-table);
    opacity: 0.7;
    font-size: var(--text-xs);
    min-height: var(--touch);
    display: inline-flex;
    align-items: center;
    padding-inline: var(--space-3);
  }

  .update {
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    background: var(--warn);
    color: var(--warn-on);
    border-radius: var(--radius-cell);
    padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    font-weight: 600;
  }

  .update button {
    font: inherit;
    font-weight: 700;
    color: var(--warn-on);
    background: none;
    border: 2px solid currentcolor;
    border-radius: 999px;
    min-height: var(--touch);
    padding-inline: var(--space-3);
    cursor: pointer;
  }

  /* L'onglet courant est signalé par un fond plein autant que par aria-current :
     ni la couleur ni l'opacité ne portent seules l'information. */
  .tabs a[aria-current='page'] {
    background: var(--tray);
    color: var(--ink);
    opacity: 1;
    font-weight: 700;
  }
</style>
