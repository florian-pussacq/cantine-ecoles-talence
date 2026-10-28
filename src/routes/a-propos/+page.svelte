<script lang="ts">
  import LienExterne from '#lib/ui/LienExterne.svelte';
  import Bandeau from '#lib/ui/Bandeau.svelte';
  import { formatDay, PAGE_DES_MENUS } from '#lib/menu/labels.js';
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
</script>

<svelte:head>
  <title>À propos — menus des écoles de Talence</title>
</svelte:head>

<!--
  L'avertissement vient en premier et n'est pas repliable. Une donnée allergène
  fausse a des conséquences médicales ; ce bloc est la seule chose de cet écran
  qui doive être lue.

  Il porte le ton info et non l'alerte : il dit une limite de l'application, pas
  un danger pour le repas qu'on regarde. C'est sa place, en tête et non
  repliable, qui le fait lire (bandeau-et-aujourdhui, D1).
-->
<Bandeau ton="info">
  <strong>Seul le document officiel de la Ville de Talence fait foi.</strong>
  Les menus sont susceptibles d'être modifiés selon les arrivages. Cette application ne remplace ni le
  document officiel ni un projet d'accueil individualisé (PAI), et l'absence d'allergène déclaré ne garantit
  pas l'absence de traces.
</Bandeau>

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
          <LienExterne href={source.pdfUrl}>Le PDF du mois</LienExterne>
        {:else}
          <LienExterne href={PAGE_DES_MENUS}>La page des menus</LienExterne>
        {/if}
      </dd>
    </div>
    <div>
      <dt>Page officielle</dt>
      <dd><LienExterne href={PAGE_DES_MENUS}>talence.fr</LienExterne></dd>
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
    <LienExterne href={PAGE_DES_MENUS}>la page des menus</LienExterne>. C'est elle qui fait
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
  .panel {
    background: var(--carte);
    color: var(--encre);
    border-radius: var(--rayon-carte);
    padding: var(--espace-4);
    display: flex;
    flex-direction: column;
    gap: var(--espace-2);
  }

  h2 {
    margin: 0 0 var(--espace-1);
    font-size: var(--texte-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: var(--poids-moyen);
    color: var(--encre-douce);
  }

  p {
    margin: 0;
    font-size: var(--texte-sm);
    line-height: 1.55;
  }

  dl {
    margin: var(--espace-1) 0 0;
    display: flex;
    flex-direction: column;
  }

  dl div {
    display: flex;
    gap: var(--espace-3);
    padding-block: var(--espace-2);
    font-size: var(--texte-sm);
  }

  dl div + div {
    border-top: 1px solid var(--bord);
  }

  dt {
    flex: 0 0 7.5rem;
    color: var(--encre-douce);
  }

  dd {
    margin: 0;
    font-weight: var(--poids-moyen);
  }

  /*
    L'accent, et non l'encre (design.md, D64).

    Ces liens étaient peints en `--fond` sur un panneau blanc : 1,17:1, quand le
    seuil est 4,5. Survivance de l'apparence sombre supprimée par D25, où
    `--fond` était la couleur claire et un lien clair sur un panneau sombre était
    juste ; D49 a retourné la palette sans retourner ces deux déclarations.

    `--encre` passerait le seuil de très loin, mais rendrait le lien indistinct du
    texte qui l'entoure et laisserait le soulignement porter seul sa nature de
    commande. L'accent tient 5,77:1 sur la carte, et son jeton est défini pour
    cet emploi.
  */
  .panel :global(a) {
    color: var(--accent);
    font-weight: var(--poids-fort);
  }

  /* Les liens d'un tableau de définitions sont isolés, pas au fil d'une phrase :
     ils doivent atteindre la cible tactile minimale. */
  dd :global(a) {
    min-height: var(--cible);
    display: inline-flex;
    align-items: center;
  }

  /*
    Une requête média sur le thème du système vivait ici, survivante de
    l'apparence sombre supprimée par D25. Elle repeignait ces liens en clair
    lorsque le système de l'utilisateur était en sombre — ce que l'exigence
    d'apparence unique interdit depuis.

    Elle est retirée plutôt que laissée. Le contrôle qui vérifiait cette
    interdiction ne lisait que `tokens.css` ; deux composants la violaient encore
    sans que rien ne le voie. Il lit désormais tous les composants, et c'est lui
    qui a trouvé celui-ci.

    Ce qu'il n'a pas trouvé, c'est que la couleur restée en place était de toute
    façon illisible sur le panneau clair où elle vit : la correction était juste
    à moitié, et il a fallu D64 pour voir l'autre moitié. Une exigence peut être
    vérifiée et manquer sa voisine.
  */
</style>
