<script lang="ts">
  import PlatCarte from '$lib/menu/PlatCarte.svelte';
  import PiedSource from '$lib/ui/PiedSource.svelte';
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
    <p class="warn">
      Cette application ne sait pas s'il y a grève aujourd'hui. Aucune source ne le lui dit, et elle
      n'affiche donc jamais ce menu d'elle-même.
    </p>
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

        `Tray` rend les six rôles quoi qu'il arrive, parce que sur l'écran du
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
    <p class="warn">Le menu de grève n'a pas pu être chargé.</p>
    <p>Il reste consultable sur le site de la Ville, à la page des menus des écoles.</p>
  </div>
{/if}

<style>
  .panel {
    background: var(--carte);
    border-radius: var(--radius-carte);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .panel + .panel,
  .variantes + .panel {
    margin-top: var(--space-3);
  }

  .intro p {
    margin: 0;
    font-size: var(--text-sm);
    line-height: 1.5;
    color: var(--ink-muted);
  }

  .intro strong {
    color: var(--ink);
  }

  .warn {
    background: var(--warn);
    color: var(--warn-on);
    border-radius: var(--radius-pastille);
    padding: var(--space-2) var(--space-3);
  }

  h2 {
    margin: 0;
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: var(--poids-moyen);
    color: var(--ink-muted);
  }

  /*
    Le sélecteur reprend la pilule des onglets plutôt que d'inventer une
    troisième forme de bascule : c'est le même geste, il doit se reconnaître.
  */
  .variantes {
    display: flex;
    gap: var(--space-1);
    margin-top: var(--space-3);
    padding: var(--space-1);
    background: var(--voile-fond);
    border-radius: var(--radius-pilule);
  }

  .variantes button {
    flex: 1;
    min-height: var(--touch);
    border: 0;
    border-radius: var(--radius-pilule);
    background: transparent;
    color: var(--ink);
    font: inherit;
    font-size: var(--text-sm);
    font-weight: var(--poids-moyen);
    cursor: pointer;
  }

  .variantes button[aria-pressed='true'] {
    background: var(--accent);
    color: var(--on-accent);
  }

  .plats {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
</style>
