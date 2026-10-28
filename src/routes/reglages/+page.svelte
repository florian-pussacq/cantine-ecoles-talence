<script lang="ts">
  import { resolve } from '$app/paths';
  import { allergenFilter } from '#lib/filter/allergens.svelte.js';
  import { ALLERGEN_CODES } from '#lib/filter/storage.js';
  import Bandeau from '#lib/ui/Bandeau.svelte';
  import type { PageProps } from './$types.js';

  let { data }: PageProps = $props();

  /**
   * Les libellés viennent des données, pas du code.
   *
   * La légende est imprimée sur le document source et peut y être formulée
   * autrement ; la recopier ici la ferait diverger en silence.
   */
  const legend = $derived(
    [...data.dataset.byDate.values()][0]?.legend ?? ({} as Record<string, string>)
  );

  const rows = $derived(
    ALLERGEN_CODES.map((code) => ({
      code,
      name: legend[String(code)] ?? `Allergène ${code}`
    }))
  );

  const count = $derived(allergenFilter.codes.size);
</script>

<svelte:head>
  <title>Réglages — menus des écoles de Talence</title>
</svelte:head>

<section class="panel">
  <h2>Allergènes</h2>

  <p class="intro">
    Les plats contenant l'un des allergènes cochés seront signalés sur les écrans du jour et de la
    semaine. Ce réglage reste sur cet appareil et n'est jamais envoyé nulle part.
  </p>

  {#if !allergenFilter.persists}
    <!-- Une limite de l'application, pas un danger pour un repas : info (D1). -->
    <Bandeau ton="info">
      Le stockage de ce navigateur est indisponible : votre choix ne sera pas conservé après la
      fermeture de l'onglet. Le reste de l'application fonctionne normalement.
    </Bandeau>
  {/if}

  <ul>
    {#each rows as row (row.code)}
      <li>
        <label>
          <input
            type="checkbox"
            checked={allergenFilter.has(row.code)}
            onchange={() => allergenFilter.toggle(row.code)}
          />
          <span>{row.name}</span>
        </label>
      </li>
    {/each}
  </ul>

  <div class="foot">
    <!--
      Aucune invitation insistante quand rien n'est coché : consulter un menu sans
      filtre est un usage complet, pas un état inachevé.
    -->
    <span
      >{count === 0
        ? 'Aucun allergène signalé'
        : `${count} allergène${count > 1 ? 's' : ''} signalé${count > 1 ? 's' : ''}`}</span
    >
    {#if count > 0}
      <button type="button" onclick={() => allergenFilter.clear()}>Tout décocher</button>
    {/if}
  </div>

  <p class="legal">
    <strong>Seul le document officiel de la Ville fait foi.</strong> Cette application n'est pas un service
    municipal, ne remplace pas un PAI, et l'absence d'allergène déclaré ne garantit pas l'absence de traces.
  </p>
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
    <span class="titre">Menu de grève</span>
    <span class="detail">Cinq jours de semaine, en repas chauds ou froids</span>
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
    <span class="titre">Source, mentions et vie privée</span>
    <span class="detail">D'où viennent ces menus, et ce que l'application garde</span>
  </a>
</section>

<style>
  .panel + .panel {
    margin-top: var(--espace-3);
  }

  /* Le patron de titre de section de l'application (a-propos) : en casse de
     phrase, et non en petites capitales espacées (refonte-signaletique). */
  h2 {
    margin: 0;
    font-size: var(--texte-base);
    font-weight: var(--poids-fort);
    color: var(--encre);
  }

  .lien {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-height: var(--cible);
    justify-content: center;
    color: var(--encre);
    text-decoration: none;
  }

  .lien .titre {
    font-weight: var(--poids-moyen);
    text-decoration: underline;
  }

  .lien .detail {
    font-size: var(--texte-sm);
    color: var(--encre-douce);
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

  .intro {
    margin: 0;
    font-size: var(--texte-sm);
    color: var(--encre-douce);
    line-height: 1.5;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  li + li {
    border-top: 1px solid var(--bord);
  }

  label {
    display: flex;
    align-items: center;
    gap: var(--espace-3);
    min-height: var(--cible);
    padding-block: var(--espace-1);
    font-size: var(--texte-base);
    cursor: pointer;
  }

  input {
    width: 24px;
    height: 24px;
    flex: none;
    /* La coche prend l'encre : sur le fond clair de la palette, une case
       cochée de la couleur du fond ne se verrait pas. */
    accent-color: var(--encre);
    cursor: pointer;
  }

  input:focus-visible {
    outline: 3px solid var(--encre);
    outline-offset: 2px;
  }

  .foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--espace-2);
    border-top: 1px solid var(--bord);
    padding-top: var(--espace-3);
    font-size: var(--texte-sm);
    color: var(--encre-douce);
  }

  .foot button {
    font: inherit;
    font-size: var(--texte-sm);
    font-weight: var(--poids-moyen);
    color: var(--encre);
    background: none;
    border: 1px solid var(--voile-trait);
    border-radius: var(--rayon-carte);
    min-height: var(--cible);
    padding-inline: var(--espace-3);
    cursor: pointer;
  }

  .legal {
    margin: 0;
    font-size: var(--texte-sm);
    color: var(--encre-douce);
    line-height: 1.45;
  }

  .legal strong {
    color: var(--encre);
  }
</style>
