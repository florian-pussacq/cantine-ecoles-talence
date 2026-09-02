<script lang="ts">
  import '$lib/design/tokens.css';
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import Enseigne from '$lib/ui/Enseigne.svelte';
  import EnTete from '$lib/ui/EnTete.svelte';
  import Onglets from '$lib/ui/Onglets.svelte';
  import { allergenFilter } from '$lib/filter/allergens.svelte.js';
  import { horloge } from '$lib/data/horloge.svelte.js';
  import { appUpdate } from '$lib/pwa/update.svelte.js';

  let { children } = $props();

  allergenFilter.hydrate();
  appUpdate.register();
  /*
    L'horloge est suivie une seule fois, ici, pour toute l'application (D47).

    Les écrans lisaient l'instant de leur montage. Une application installée
    n'est pas rechargée mais reprise : sans cet abonnement, un écran repris après
    deux jours de veille affirmerait qu'un menu vieux de deux jours est celui du
    jour.
  */
  horloge.suivre();

  /*
    Le titre de chaque écran vit ici, et non dans l'écran qu'il nomme.

    C'est un couplage assumé — la coque connaît le nom des quatre écrans — et il
    achète deux choses qu'aucun autre découpage ne donnait. D'abord la place : le
    titre est toujours entre l'enseigne et les onglets, alors qu'un titre rendu
    par la page passait sous les onglets sur deux écrans et au-dessus sur les
    deux autres. Ensuite l'unicité du titre de premier niveau, qui cesse d'être
    une consigne à respecter dans quatre fichiers pour devenir une propriété de
    la structure : il n'existe qu'un seul endroit qui puisse en produire un.

    « Menu de la cantine » couvre les deux écrans de menu parce qu'il ne dépend
    ni du jour ni de la vue. Ce qui varie — la date, la période — est descendu
    dans le rang de navigation, entre les commandes qui le font varier (D55).
  */
  const TITRES: Record<string, { titre: string; baseline?: string }> = {
    '/': { titre: 'Menu de la cantine', baseline: 'Bon appétit !' },
    '/semaine': { titre: 'Menu de la cantine', baseline: 'Bon appétit !' },
    '/reglages': { titre: 'Réglages' },
    '/greve': { titre: 'Menu de grève' },
    '/a-propos': { titre: "D'où viennent ces menus" }
  };

  const chemin = $derived(page.url.pathname.replace(/(.)\/$/, '$1'));
  const entete = $derived(TITRES[chemin]);

  /*
    Les réglages ne sont pas un troisième onglet, et le choix Jour/Semaine n'a
    rien à y faire : rien de ce qu'il propose ne s'y consulte. L'écran porte sa
    propre commande de retour, dans son propre flux (`reglages/+page.svelte`) —
    le même principe que ce que `Onglets.svelte` documente pour les autres
    écrans hors onglets, mais nommé plutôt que délégué à une pilule qui n'a pas
    à connaître le chemin du retour.
  */
  const montrerOnglets = $derived(chemin !== '/reglages');
</script>

<div class="shell">
  <!--
    L'enseigne est la première ligne de tous les écrans, et elle est hors de
    tout bloc animé : le nom du lieu ne change pas avec le jour (D35).
  -->
  <Enseigne />

  {#if entete}
    <EnTete titre={entete.titre} baseline={entete.baseline} />
  {/if}

  {#if montrerOnglets}
    <Onglets />
  {/if}

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
</div>

<!--
  Le pied est ancré au bas de la fenêtre (design.md, D52).

  Il est hors de la coque parce qu'il n'appartient pas au flux du contenu :
  celui-ci lui réserve sa hauteur, il ne la lui prend pas.

  Il ne porte que ce qui ne varie pas d'un écran à l'autre. La date de mise à
  jour des données et le lien vers le document officiel sont restés dans le flux
  de l'écran qu'ils qualifient : un pied fixe qui les porterait deviendrait un
  second en-tête, et affirmerait sur l'écran des réglages une fraîcheur qui ne
  concerne que les menus.

  « À propos » n'est pas un onglet : on le consulte une fois, pas tous les
  matins. Il a ici la place qui lui revient — atteignable partout, jamais au
  premier plan.
-->
<footer class="pied">
  <a href={resolve('/a-propos')}>Source, mentions et vie privée</a>
</footer>

<style>
  .shell {
    max-width: var(--shell);
    margin-inline: auto;
    min-height: 100dvh;
    /* Le contenu réserve le pied *et* l'encart système sous lui : réserver la
       seule hauteur du pied ferait passer la dernière carte dessous sur les
       appareils à indicateur d'accueil, et nulle part ailleurs (D34, D52). */
    padding: var(--space-3) var(--space-3) calc(var(--space-5) + var(--pied-reserve));
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
    Le pied reste borné à la colonne de contenu et ne s'étire pas sur toute la
    fenêtre : un pied de 1 400 pixels serait une seconde mise en page qui ne dit
    pas son nom, alors que D23 n'en admet qu'une.

    Son fond est opaque : le contenu défile derrière lui, et un fond translucide
    laisserait passer le texte qui glisse dessous. Le filet dit où finit le
    contenu, maintenant que le défilement est la règle et non l'exception (D53).
  */
  .pied {
    position: fixed;
    inset-inline: 0;
    bottom: 0;
    z-index: 1;
    margin-inline: auto;
    max-width: var(--shell);
    min-height: var(--pied-reserve);
    display: flex;
    align-items: center;
    justify-content: center;
    /* Le rembourrage bas porte l'encart système en plus du sien : c'est ce qui
       empêche la moitié basse du pied de passer sous l'indicateur d'accueil
       (D34). */
    padding: 0 var(--space-3) var(--encart-bas);
    background: var(--fond);
    border-top: 1px solid var(--bord);
  }

  /* La cible tactile fait 44 pixels comme toutes les autres : le pied est
     dimensionné autour d'elle, et non l'inverse. */
  .pied a {
    color: var(--ink-muted);
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
    border-radius: var(--radius-pastille);
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
    border-radius: var(--radius-pilule);
    min-height: var(--touch);
    padding-inline: var(--space-3);
    cursor: pointer;
  }
</style>
