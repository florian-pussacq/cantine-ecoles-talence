<script lang="ts">
  import { resolve } from '$app/paths';
  import { allergenFilter } from '#lib/filter/allergens.svelte.js';
  import { apparence } from '#lib/design/apparence.svelte.js';
  import type { Apparence } from '#lib/design/apparence.js';
  import Bandeau from '#lib/ui/Bandeau.svelte';
  import Icone from '#lib/ui/Icone.svelte';
  import type { PageProps } from './$types.js';

  /**
   * Le sommaire des réglages (sommaire-des-reglages).
   *
   * Il tient dans le premier écran d'un téléphone, et chaque sujet y prend une
   * section courte : l'apparence en tête, parce qu'elle se règle sur place
   * (D1) ; les allergènes ensuite, résumés en une ligne qui mène à leur écran
   * (D3) ; puis le menu de grève et les mentions.
   */
  let { data }: PageProps = $props();

  /*
    La ligne des allergènes redit l'état que la roue annonce (D3) : les noms,
    puis le même compte. Les noms viennent de la légende des données, comme sur
    l'écran des cases ; la précision entre parenthèses (« blé, seigle… ») est
    laissée à cet écran-là, où elle tient sa ligne.
  */
  const legend = $derived(
    [...data.dataset.byDate.values()][0]?.legend ?? ({} as Record<string, string>)
  );

  const count = $derived(allergenFilter.codes.size);

  const surveilles = $derived(
    [...allergenFilter.codes]
      .sort((a, b) => a - b)
      .map((code) => (legend[String(code)] ?? `Allergène ${code}`).replace(/\s*\(.*\)$/, ''))
  );

  const resume = $derived(
    surveilles.length < 2
      ? (surveilles[0] ?? 'Aucun allergène surveillé')
      : `${surveilles.slice(0, -1).join(', ')} et ${surveilles.at(-1)}`
  );

  /* Le nom accessible porte le compte, comme celui de la roue (D32). */
  const nomEntree = $derived(
    count === 0
      ? 'Allergènes — aucun surveillé'
      : `Allergènes — ${count} allergène${count > 1 ? 's' : ''} surveillé${count > 1 ? 's' : ''} : ${resume}`
  );

  apparence.hydrate();

  /*
    Trois choix, et non un interrupteur (choix-d-apparence, D1) : un interrupteur
    clair/sombre ne sait pas rendre la main à l'appareil, qui est le défaut.
    Ils sont rangés en une rangée de trois segments (sommaire-des-reglages, D2),
    qui restent des boutons radio natifs ; « Appareil » est dit en entier sous
    la rangée.
  */
  const APPARENCES: { valeur: Apparence; nom: string }[] = [
    { valeur: 'appareil', nom: 'Appareil' },
    { valeur: 'clair', nom: 'Clair' },
    { valeur: 'sombre', nom: 'Sombre' }
  ];
</script>

<svelte:head>
  <title>Réglages — menus des écoles de Talence</title>
</svelte:head>

<section class="panel">
  <h2 id="titre-apparence">Apparence</h2>

  {#if !apparence.persiste}
    <Bandeau ton="info">
      Le stockage de ce navigateur est indisponible : votre choix ne sera pas conservé après la
      fermeture de l'onglet.
    </Bandeau>
  {/if}

  <div
    class="segments"
    role="radiogroup"
    aria-labelledby="titre-apparence"
    aria-describedby="apparence-detail"
  >
    {#each APPARENCES as option (option.valeur)}
      <label class="segment">
        <input
          type="radio"
          name="apparence"
          value={option.valeur}
          checked={apparence.choix === option.valeur}
          onchange={() => apparence.choisir(option.valeur)}
        />
        <span>{option.nom}</span>
      </label>
    {/each}
  </div>
  <p class="detail" id="apparence-detail">
    Appareil : clair ou sombre, selon le réglage du téléphone.
  </p>
</section>

<section class="panel">
  <h2>Allergènes</h2>

  <a class="lien" href={resolve('/reglages/allergenes')} aria-label={nomEntree}>
    <span class="texte">
      <span class="titre">{resume}</span>
      <span class="detail"
        >{count === 0
          ? 'Choisir ceux à signaler sur le menu'
          : `Signalé${count > 1 ? 's' : ''} sur les écrans du jour et de la semaine`}</span
      >
    </span>
    <!--
      Le compte de la roue, dans la même inversion, et rien quand la sélection
      est vide : pas de « 0 », qui serait une invitation insistante.
    -->
    {#if count > 0}
      <span class="compte" aria-hidden="true">{count}</span>
    {/if}
    <Icone name="suivant" size={20} />
  </a>
</section>

<!--
  Le menu de grève est ici et nulle part ailleurs.

  Il n'a pas de date : l'application ne peut pas savoir qu'il y a grève, donc
  elle ne doit jamais le servir d'elle-même. Un onglet en ferait une destination
  quotidienne ; il n'en est pas une. On vient le chercher les rares fois où il
  sert, et le reste du temps il ne coûte rien à personne.
-->
<section class="panel">
  <h2>Menus</h2>

  <a class="lien" href={resolve('/greve')}>
    <span class="texte">
      <span class="titre">Menu de grève</span>
      <span class="detail">Cinq jours de semaine, en repas chauds ou froids</span>
    </span>
    <Icone name="suivant" size={20} />
  </a>
</section>

<!--
  Les mentions s'atteignent d'ici aussi (refonte-signaletique, D11). Le pied
  fixe qui les portait sur tous les écrans a laissé le bas de la fenêtre au
  choix entre le jour et la semaine ; sur les écrans de menu, elles suivent la
  provenance des données, et ici, elles ont leur section.
-->
<section class="panel">
  <h2>Application</h2>

  <a class="lien" href={resolve('/a-propos')}>
    <span class="texte">
      <span class="titre">Source, mentions et vie privée</span>
      <span class="detail">D'où viennent ces menus, et ce que l'application garde</span>
    </span>
    <Icone name="suivant" size={20} />
  </a>
</section>

<style>
  .panel + .panel {
    margin-top: var(--espace-3);
  }

  /* Une section, et non une carte : un filet d'encre l'ouvre, comme les
     tableaux des écrans de menu (refonte-signaletique). */
  .panel {
    border-top: 2px solid var(--encre);
    padding-top: var(--espace-3);
    color: var(--encre);
    display: flex;
    flex-direction: column;
    gap: var(--espace-3);
  }

  /* Le patron de titre de section de l'application (a-propos) : en casse de
     phrase, et non en petites capitales espacées (refonte-signaletique). */
  h2 {
    margin: 0;
    font-size: var(--texte-base);
    font-weight: var(--poids-fort);
    color: var(--encre);
  }

  .detail {
    margin: 0;
    font-size: var(--texte-sm);
    color: var(--encre-douce);
  }

  /*
    Une entrée du sommaire : le titre souligné, comme tout lien de
    l'application, et un chevron qui dit qu'on change d'écran. Le chevron est
    celui du rang de navigation ; il ne porte rien que le lien ne dise déjà.
  */
  .lien {
    display: flex;
    align-items: center;
    gap: var(--espace-3);
    min-height: var(--cible);
    color: var(--encre);
    text-decoration: none;
  }

  .lien .texte {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .lien .titre {
    font-weight: var(--poids-moyen);
    text-decoration: underline;
  }

  .lien :global(svg) {
    flex: none;
    color: var(--encre-douce);
  }

  /* La pastille de la roue (CommandeReglages), sans son anneau : elle ne se
     pose ici sur aucune autre forme. */
  .compte {
    flex: none;
    min-width: 18px;
    height: 18px;
    padding-inline: var(--espace-1);
    border-radius: var(--rayon-pilule);
    background: var(--accent);
    color: var(--sur-accent);
    font-size: var(--texte-2xs);
    font-weight: var(--poids-titre);
    line-height: 18px;
    text-align: center;
  }

  /*
    La rangée de trois choix (D2). Le segment choisi est une inversion, la
    paire de l'accent déjà mesurée. Le bouton radio reste dans le document, et
    c'est lui qui reçoit le clavier : il est seulement soustrait à la vue, et
    son focus se reporte sur le segment.
  */
  .segments {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    border: 1px solid var(--voile-trait);
    border-radius: var(--rayon-carte);
    overflow: hidden;
  }

  .segment {
    position: relative;
    min-height: var(--cible);
    display: grid;
    place-items: center;
    padding-inline: var(--espace-1);
    background: var(--carte);
    font-size: var(--texte-sm);
    font-weight: var(--poids-moyen);
    color: var(--encre);
    cursor: pointer;
  }

  .segment + .segment {
    border-left: 1px solid var(--voile-trait);
  }

  .segment:has(input:checked) {
    background: var(--accent);
    color: var(--sur-accent);
    font-weight: var(--poids-fort);
  }

  .segment:has(input:focus-visible) {
    outline: 3px solid var(--encre);
    outline-offset: -5px;
  }

  .segment:has(input:checked:focus-visible) {
    outline-color: var(--sur-accent);
  }

  .segment input {
    position: absolute;
    inset: 0;
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }
</style>
