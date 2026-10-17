<script lang="ts">
  import '$lib/design/tokens.css';
  import { onMount } from 'svelte';
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

<div class="shell">
  <!--
    L'enseigne est la première ligne de tous les écrans, et elle est hors de
    tout bloc animé : le nom du lieu ne change pas avec le jour (D35).
  -->
  <Enseigne {sortie} />

  {#if entete}
    <EnTete titre={entete.titre} />
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
       appareils à indicateur d'accueil, et nulle part ailleurs (D34, D52).

       L'intervalle ajouté à cette réserve est celui de la coque, et non un cran
       au-dessus (D63). `--pied-reserve` dimensionne déjà la barre et sa zone
       sûre ; le `--space-5` qui s'y ajoutait n'avait pas de motif écrit, et
       c'est lui qu'on lisait comme un grand vide au-dessus des mentions. Le
       pied fixe est séparé du contenu comme deux enfants de la coque le sont
       entre eux. */
    padding: var(--space-3) var(--space-3) calc(var(--space-3) + var(--pied-reserve));
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
