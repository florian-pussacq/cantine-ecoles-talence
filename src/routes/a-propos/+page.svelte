<script lang="ts">
  import ExternalLink from '$lib/ui/ExternalLink.svelte';
  import { formatDay } from '$lib/menu/labels.js';
  import type { PageProps } from './$types.js';

  let { data }: PageProps = $props();

  const source = $derived([...data.dataset.byDate.values()][0]?.source ?? null);
  const generated = $derived(
    data.dataset.generatedAt === null
      ? null
      : new Intl.DateTimeFormat('fr-FR', {
          dateStyle: 'long',
          timeStyle: 'short',
          timeZone: 'Europe/Paris'
        }).format(new Date(data.dataset.generatedAt))
  );

  const PAGE_OFFICIELLE = 'https://www.talence.fr/quotidien/enfance-scolarite/menu-ecoles/';
</script>

<svelte:head>
  <title>À propos — menus des écoles de Talence</title>
</svelte:head>

<!--
  L'avertissement vient en premier et n'est pas repliable. Une donnée allergène
  fausse a des conséquences médicales ; ce bloc est la seule chose de cet écran
  qui doive être lue.
-->
<p class="disclaimer">
  <strong>Seul le document officiel de la Ville de Talence fait foi.</strong>
  Les menus sont susceptibles d'être modifiés selon les arrivages. Cette application ne remplace ni le
  document officiel ni un projet d'accueil individualisé (PAI), et l'absence d'allergène déclaré ne garantit
  pas l'absence de traces.
</p>

<section class="panel">
  <h2>La source</h2>
  <p>
    Les menus sont produits et publiés par la Ville de Talence. Cette application les recopie sans
    les modifier, comme le permet la réutilisation des informations publiques.
  </p>
  <dl>
    <div>
      <dt>Document</dt>
      <dd>
        {#if source}
          <ExternalLink href={source.pdfUrl}>Le PDF du mois</ExternalLink>
        {:else}
          <ExternalLink href={PAGE_OFFICIELLE}>La page des menus</ExternalLink>
        {/if}
      </dd>
    </div>
    <div>
      <dt>Page officielle</dt>
      <dd><ExternalLink href={PAGE_OFFICIELLE}>talence.fr</ExternalLink></dd>
    </div>
    {#if source?.updatedLabel}
      <div>
        <dt>Mise à jour</dt>
        <dd>{source.updatedLabel}</dd>
      </div>
    {:else if source?.updatedAt}
      <div>
        <dt>Mise à jour</dt>
        <dd>Le {formatDay(source.updatedAt)}</dd>
      </div>
    {/if}
    {#if generated}
      <div>
        <dt>Relevé le</dt>
        <dd>{generated}</dd>
      </div>
    {/if}
  </dl>
</section>

<section class="panel">
  <h2>Ce que cette application n'est pas</h2>
  <p>
    Ce n'est <strong>pas un service de la Ville de Talence</strong>, ni un service officiel d'aucune
    sorte. Elle est développée à titre personnel et n'a aucun lien avec la municipalité, dont elle
    ne reprend ni le logo ni la charte graphique.
  </p>
  <p>
    La Ville propose sa propre application, <strong>Qui Dit Miam</strong>, à télécharger depuis les
    magasins d'applications ; les liens figurent sur
    <ExternalLink href={PAGE_OFFICIELLE}>la page des menus</ExternalLink>. C'est elle qui fait
    autorité.
  </p>
</section>

<section class="panel">
  <h2>Vos données</h2>
  <p>
    Il n'y en a pas. Aucun compte, aucun serveur, aucun cookie, aucune mesure d'audience, aucune
    police ni image chargée depuis un autre site. Les allergènes que vous cochez restent dans ce
    navigateur et ne sont envoyés nulle part.
  </p>
  <p>Effacer les données de navigation efface ce réglage : c'est le prix de l'absence de compte.</p>
</section>

<section class="panel">
  <h2>Installer l'application</h2>
  <p>
    Sur Android, le navigateur propose l'installation. <strong>Sur iPhone et iPad</strong>, il faut
    passer par « Partager », puis « Sur l'écran d'accueil » : Safari n'offre pas d'invitation
    automatique.
  </p>
  <p>Une fois installée, elle fonctionne sans réseau après une première ouverture connectée.</p>
</section>

<style>
  .disclaimer {
    margin: 0;
    background: var(--warn);
    color: var(--warn-on);
    border-radius: var(--radius-pastille);
    padding: var(--space-3);
    font-size: var(--text-sm);
    line-height: 1.5;
  }

  .panel {
    background: var(--carte);
    color: var(--ink);
    border-radius: var(--radius-carte);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  h2 {
    margin: 0 0 var(--space-1);
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--ink-muted);
  }

  p {
    margin: 0;
    font-size: var(--text-sm);
    line-height: 1.55;
  }

  dl {
    margin: var(--space-1) 0 0;
    display: flex;
    flex-direction: column;
  }

  dl div {
    display: flex;
    gap: var(--space-3);
    padding-block: var(--space-2);
    font-size: var(--text-sm);
  }

  dl div + div {
    border-top: 1px solid var(--bord);
  }

  dt {
    flex: 0 0 7.5rem;
    color: var(--ink-muted);
  }

  dd {
    margin: 0;
    font-weight: 600;
  }

  .panel :global(a) {
    color: var(--fond);
    font-weight: 700;
  }

  /* Les liens d'un tableau de définitions sont isolés, pas au fil d'une phrase :
     ils doivent atteindre la cible tactile minimale. */
  dd :global(a) {
    min-height: var(--touch);
    display: inline-flex;
    align-items: center;
  }

  /*
    Une requête média sur le thème du système vivait ici, survivante de
    l'apparence sombre supprimée par D25. Elle repeignait ces liens en clair
    lorsque le système de l'utilisateur était en sombre — ce que l'exigence
    d'apparence unique interdit depuis, et qui les rendait de toute façon
    illisibles sur le panneau clair où ils vivent.

    Elle est retirée plutôt que laissée. Le contrôle qui vérifiait cette
    interdiction ne lisait que `tokens.css` ; deux composants la violaient encore
    sans que rien ne le voie. Il lit désormais tous les composants, et c'est lui
    qui a trouvé celui-ci.
  */
</style>
