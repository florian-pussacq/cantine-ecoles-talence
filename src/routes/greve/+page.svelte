<script lang="ts">
  import PlatCarte from '#lib/menu/PlatCarte.svelte';
  import PiedSource from '#lib/ui/PiedSource.svelte';
  import Bandeau from '#lib/ui/Bandeau.svelte';
  import type { PageData } from './$types.js';

  let { data }: { data: PageData } = $props();

  const menu = $derived(data.menu);

  /*
    La variante est un choix, pas une déduction.

    Le document dit « selon la possibilité, des repas chauds ou froids peuvent
    être proposés » : la Ville elle-même ne s'engage pas. Présenter l'une des
    deux comme celle du jour affirmerait ce que personne ne sait.
  */
  let temperature = $state<'chaud' | 'froid'>('chaud');

  const service = $derived(menu?.services.find((s) => s.temperature === temperature) ?? null);

  const VARIANTES = [
    { valeur: 'chaud', libelle: 'Repas chauds' },
    { valeur: 'froid', libelle: 'Repas froids' }
  ] as const;

  const JOURS: Record<string, string> = {
    lundi: 'Lundi',
    mardi: 'Mardi',
    mercredi: 'Mercredi',
    jeudi: 'Jeudi',
    vendredi: 'Vendredi'
  };
</script>

<svelte:head>
  <title>Menu de grève — menus des écoles de Talence</title>
</svelte:head>

{#if menu && service}
  <div class="panel intro">
    <!--
      Ce que l'écran doit dire avant tout : l'application ne sait pas s'il y a
      grève. Aucune source ne le publie. Ce menu se consulte, il ne s'annonce
      pas — et le confondre avec le menu du jour serait le pire des services.
    -->
    <p>
      La Ville sert ce menu de repli les jours de grève, <strong
        >selon la possibilité, chaud ou froid</strong
      >. Il ne dépend pas de la date : il se répète chaque semaine, du lundi au vendredi.
    </p>
    <!-- Une limite de l'application : info. L'orange reste à ce qui menace un repas (D1). -->
    <Bandeau ton="info">
      Cette application ne sait pas s'il y a grève aujourd'hui. Aucune source ne le lui dit, et elle
      n'affiche donc jamais ce menu d'elle-même.
    </Bandeau>
  </div>

  <div class="variantes" role="group" aria-label="Variante de service">
    {#each VARIANTES as variante (variante.valeur)}
      <button
        type="button"
        aria-pressed={temperature === variante.valeur}
        onclick={() => (temperature = variante.valeur)}
      >
        {variante.libelle}
      </button>
    {/each}
  </div>

  {#each service.days as jour (jour.weekday)}
    <section class="panel">
      <h2>{JOURS[jour.weekday] ?? jour.weekday}</h2>
      <!--
        Une carte par plat servi, et pas une de plus.

        `ListeDuJour` rend les six rôles quoi qu'il arrive, parce que sur l'écran du
        jour un creux doit rester distinguable d'une donnée manquante (D12). Un
        menu de repli en sert trois : la même règle produirait ici quinze cartes
        d'absence qui n'apprendraient rien.
      -->
      <div class="plats">
        {#each jour.courses as plat (plat.slot)}
          <PlatCarte
            slot={plat.slot}
            course={plat}
            legend={menu.allergenLegend}
            principal={plat.slot === 'plat'}
          />
        {/each}
      </div>
    </section>
  {/each}

  <PiedSource
    updatedLabel={menu.source.updatedLabel}
    updatedAt={menu.source.updatedAt}
    pdfUrl={menu.source.pdfUrl}
  />
{:else}
  <div class="panel">
    <Bandeau ton="alerte">Le menu de grève n'a pas pu être chargé.</Bandeau>
    <p>Il reste consultable sur le site de la Ville, à la page des menus des écoles.</p>
  </div>
{/if}

<style>
  /*
    Une section, et non une carte : un filet d'encre l'ouvre, comme les
    tableaux des écrans de menu (refonte-signaletique). L'aplat du plat
    principal y est ainsi posé sur le fond, et non dans une carte — une carte
    dans une carte n'ajoute qu'un cadre autour d'un cadre.
  */
  .panel {
    border-top: 2px solid var(--encre);
    padding-top: var(--espace-3);
    display: flex;
    flex-direction: column;
    gap: var(--espace-3);
  }

  .panel + .panel,
  .variantes + .panel {
    margin-top: var(--espace-3);
  }

  .intro p {
    margin: 0;
    font-size: var(--texte-sm);
    line-height: 1.5;
    color: var(--encre-douce);
  }

  .intro strong {
    color: var(--encre);
  }

  /* Un titre de section en casse de phrase, et non en petites capitales
     espacées : c'est un titre, il se lit comme tel (refonte-signaletique). */
  h2 {
    margin: 0;
    font-size: var(--texte-base);
    font-weight: var(--poids-fort);
    color: var(--encre);
  }

  /*
    Le sélecteur reprend la forme de la barre des écrans plutôt que d'inventer
    une troisième forme de bascule : c'est le même geste, il doit se
    reconnaître. Le choix courant est souligné d'un trait d'encre, sans pilule
    (refonte-signaletique, D11).
  */
  .variantes {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: var(--espace-3);
    border-bottom: 1px solid var(--bord);
  }

  .variantes button {
    min-height: var(--cible);
    border: 0;
    background: transparent;
    color: var(--encre-douce);
    font: inherit;
    font-size: var(--texte-sm);
    font-weight: var(--poids-moyen);
    cursor: pointer;
  }

  .variantes button[aria-pressed='true'] {
    color: var(--encre);
    font-weight: var(--poids-fort);
    box-shadow: inset 0 -3px 0 var(--encre);
  }

  .plats {
    display: flex;
    flex-direction: column;
  }

  .plats :global(.plat:last-child) {
    border-bottom: 0;
  }
</style>
