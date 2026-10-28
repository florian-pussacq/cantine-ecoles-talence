<script lang="ts">
  import '#lib/design/tokens.css';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import Enseigne from '#lib/ui/Enseigne.svelte';
  import EnTete from '#lib/ui/EnTete.svelte';
  import Onglets from '#lib/ui/Onglets.svelte';
  import Bandeau from '#lib/ui/Bandeau.svelte';
  import { allergenFilter } from '#lib/filter/allergens.svelte.js';
  import { horloge } from '#lib/data/horloge.svelte.js';
  import { appUpdate } from '#lib/pwa/update.svelte.js';

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
    Hydratée : les écouteurs sont branchés. Le montage de la coque suit celui de
    l'écran, donc ceux de l'écran le sont aussi. Rien ne lit ce marqueur dans
    l'application ; les tests de bout en bout s'en servent pour ne pas presser une
    touche que personne n'écoute encore (ci-github, D7).
  */
  onMount(() => {
    document.documentElement.dataset.hydrate = '';
  });

  /*
    Le titre de chaque écran vit ici, et non dans l'écran qu'il nomme.

    C'est un couplage assumé — la coque connaît le nom de ses écrans — et il
    achète deux choses qu'aucun autre découpage ne donnait. D'abord la place : le
    titre est toujours entre l'enseigne et le contenu, alors qu'un titre rendu
    par la page passait sous les onglets sur deux écrans et au-dessus sur les
    deux autres. Ensuite l'unicité du titre de premier niveau, qui cesse d'être
    une consigne à respecter dans plusieurs fichiers pour devenir une propriété
    de la structure.

    Les deux écrans de menu n'y figurent plus (D61). « Menu de la cantine »
    nommait l'application à l'intérieur de l'application, et « Bon appétit ! »
    occupait d'une politesse la ligne où il fallait de l'information. Leur titre
    de premier niveau est désormais ce que le rang de navigation désigne — la
    date, la période —, qui est la seule chose que ces écrans doivent dire avant
    tout le reste. L'unicité est conservée : un écran est ici ou il est là,
    jamais dans les deux.
  */
  const TITRES: Record<string, { titre: string }> = {
    '/reglages': { titre: 'Réglages' },
    '/greve': { titre: 'Menu de grève' },
    '/a-propos': { titre: "D'où viennent ces menus" }
  };

  const chemin = $derived(page.url.pathname.replace(/(.)\/$/, '$1'));
  const entete = $derived(TITRES[chemin]);

  /*
    Où mène la sortie de chaque écran secondaire (design.md, D62).

    Elle remonte d'un cran, et non toujours à l'accueil. Le menu de grève ne
    s'atteint que par les réglages : une commande d'en-tête qui sauterait
    par-dessus l'écran d'où l'on vient contredirait la place qu'elle occupe.

    Elle n'est pas calculée sur l'historique du navigateur. Il rendrait la
    destination indevinable depuis le libellé, et un écran ouvert directement —
    depuis un signet, depuis un lien partagé — n'a pas d'historique à remonter.
  */
  const MENU = { vers: '/', nom: 'Menu', libelle: 'Retour au menu' } as const;

  const SORTIES: Record<string, typeof MENU | { vers: '/reglages'; nom: string; libelle: string }> =
    {
      '/reglages': MENU,
      '/a-propos': MENU,
      '/greve': { vers: '/reglages', nom: 'Réglages', libelle: 'Retour aux réglages' }
    };

  /*
    Le choix Jour/Semaine n'appartient qu'aux deux écrans de menu (D31). Sur
    tout le reste — réglages, grève, mentions —, rien de ce qu'il propose ne
    s'y consulte, et chaque écran porte sa propre commande de retour nommée,
    dans son propre flux : voir `Onglets.svelte` pour ce que ce choix remplace.
  */
  const montrerOnglets = $derived(chemin === '/' || chemin === '/semaine');

  /*
    L'emplacement de commande de l'enseigne porte l'un ou l'autre, jamais rien.

    Sur les écrans de menu, la roue crantée ; partout ailleurs, la sortie. Le
    repli sur « Menu » couvre un écran qu'aucune table ne nomme — une page
    d'erreur, une route à venir : il vaut mieux une sortie de trop qu'un écran
    dont on ne repart pas.
  */
  const sortie = $derived(montrerOnglets ? null : (SORTIES[chemin] ?? MENU));
</script>

<div class="shell" class:avec-barre={montrerOnglets}>
  <!--
    L'enseigne est la première ligne de tous les écrans, et elle est hors de
    tout bloc animé : le nom du lieu ne change pas avec le jour (D35).
  -->
  <Enseigne {sortie} />

  {#if entete}
    <EnTete titre={entete.titre} />
  {/if}

  {#if appUpdate.available}
    <!--
      La nouvelle version attend : elle ne remplace pas l'application pendant
      qu'on la consulte, ce qui ferait perdre le jour qu'on regardait.
    -->
    <Bandeau ton="info">
      Une nouvelle version est disponible.
      {#snippet action()}
        <button type="button" onclick={() => appUpdate.apply()}>Appliquer</button>
      {/snippet}
    </Bandeau>
  {/if}

  <!--
    Les deux écrans de menu dépendent du jour : sur une page rendue un autre
    jour, leur contenu reste masqué jusqu'à l'hydratation (tokens.css,
    jour-au-premier-rendu). Le conteneur ne participe pas à la mise en page.
  -->
  <div class:selon-le-jour={montrerOnglets} style="display: contents">
    {@render children()}
  </div>
</div>

<!--
  Le choix entre le jour et la semaine est ancré au bas de la fenêtre, sous le
  pouce (refonte-signaletique, D11, qui rétablit D31).

  Il est hors de la coque, et après elle dans le document : il n'appartient pas
  au flux du contenu, qui lui réserve sa hauteur sans la lui prendre, et l'ordre
  de lecture suit l'ordre de l'écran — le menu, puis le choix d'un autre écran.

  Il a pris la place du pied fixe des mentions (D52, annulé). Une page qu'on
  consulte une fois n'a pas à occuper la zone la plus accessible de l'écran : le
  lien vers les mentions suit désormais la provenance des données, à la fin de
  chaque écran de menu, et l'écran des réglages en porte un aussi.
-->
{#if montrerOnglets}
  <Onglets />
{/if}

<style>
  .shell {
    max-width: var(--colonne);
    margin-inline: auto;
    min-height: 100dvh;
    padding: var(--espace-3) var(--espace-3) calc(var(--espace-5) + var(--encart-bas));
    display: flex;
    flex-direction: column;
    gap: var(--espace-3);
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
    Sur les deux écrans de menu, le contenu réserve la barre *et* l'encart
    système sous elle : réserver la seule hauteur de la barre ferait passer la
    fin du contenu dessous sur les appareils à indicateur d'accueil, et nulle
    part ailleurs (D34). L'intervalle ajouté est celui de la coque, et non un
    cran au-dessus (D63) : la barre est séparée du contenu comme deux enfants de
    la coque le sont entre eux.
  */
  .shell.avec-barre {
    padding-bottom: calc(var(--espace-3) + var(--barre-reserve));
  }
</style>
