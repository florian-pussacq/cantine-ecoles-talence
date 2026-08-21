<script lang="ts">
  import { isStale } from '$lib/data/load.js';
  import { horloge } from '$lib/data/horloge.svelte.js';
  import { parisDate, resolveDisplayDay, servedNeighbour } from '$lib/data/resolve.js';
  import DaySheet from '$lib/menu/DaySheet.svelte';
  import Tray from '$lib/menu/Tray.svelte';
  import {
    courseName,
    flaggedAllergenNames,
    formatDay,
    slotLabel,
    targetEyebrow,
    targetReturnLabel
  } from '$lib/menu/labels.js';
  import Illustration from '$lib/illustrations/Illustration.svelte';
  import AllergenChip from '$lib/menu/AllergenChip.svelte';
  import ExternalLink from '$lib/ui/ExternalLink.svelte';
  import { allergenFilter } from '$lib/filter/allergens.svelte.js';
  import { classify } from '$lib/illustrations/families.js';
  import { selection } from '$lib/menu/selection.svelte.js';
  import { createBalayage } from '$lib/ui/balayage.js';
  import EnTete from '$lib/ui/EnTete.svelte';
  import type { PageProps } from './$types.js';

  let { data }: PageProps = $props();

  /*
    L'instant vient de l'horloge et non du montage (design.md, D47).

    `const now = new Date()` vivait ici, évalué une fois. Une application
    installée n'étant pas rechargée mais reprise, un écran repris après deux
    jours de veille calculait sa cible, sa mention et son avis de fraîcheur avec
    l'horloge d'avant-hier.
  */
  const now = $derived(horloge.instant);
  const today = $derived(parisDate(now));
  const target = $derived(resolveDisplayDay(data.dataset, now));

  /** Le jour du repère : celui que le système montre à l'ouverture. */
  const repere = $derived(target.status === 'not-published' ? null : target.date);

  /**
   * La date consultée : celle choisie, ou le jour résolu.
   *
   * Le choix est lu à travers le jour courant : il cesse de valoir quand le jour
   * civil change, sans qu'aucun écouteur ait à l'effacer (D47).
   */
  const chosen = $derived(selection.dateLe(today));
  const date = $derived(chosen ?? repere);
  const day = $derived(date === null ? null : (data.dataset.byDate.get(date) ?? null));

  /**
   * Qui a choisi le jour affiché — c'est ce qui décide de tout l'en-tête (D44).
   *
   * Si c'est le système, l'en-tête situe. Si c'est l'utilisateur, il offre le
   * retour. La constante « Menu du jour », qui occupait ce cas, disait la même
   * chose tous les jours, dans les deux directions et à toutes les distances.
   */
  const ecarte = $derived(chosen !== null && chosen !== repere);

  const retourLibelle = $derived(targetReturnLabel(target));
  const retour = $derived(
    ecarte && retourLibelle !== null
      ? { libelle: retourLibelle, action: () => selection.reset() }
      : null
  );

  const previous = $derived(date === null ? null : servedNeighbour(data.dataset, date, 'previous'));
  const next = $derived(date === null ? null : servedNeighbour(data.dataset, date, 'next'));

  const snack = $derived(day?.courses.find((course) => course.slot === 'gouter') ?? null);
  const stale = $derived(isStale(data.dataset, now));

  /**
   * La journée est ouverte, ou elle ne l'est pas (design.md, D38).
   *
   * L'état portait auparavant le plat choisi. Il n'y a plus de plat choisi : la
   * cible est la journée, et la fiche la montre entière. Un booléen suffit, et
   * c'est le signe que la cible était de trop.
   */
  let ouverte = $state(false);

  /** Le sens de la dernière navigation, pour que la transition suive le geste. */
  let sens = $state(1);
  let precedente: string | null = null;

  $effect(() => {
    if (date !== null && precedente !== null && date !== precedente) {
      sens = date > precedente ? 1 : -1;
    }
    precedente = date;
  });

  /** Le balayage vit dans `$lib/ui/balayage` (design.md, D17). */
  const balayage = createBalayage({
    onPrevious: () => previous !== null && selection.set(previous, today),
    onNext: () => next !== null && selection.set(next, today)
  });

  function onKeydown(event: KeyboardEvent) {
    if (ouverte) return;
    if (event.key === 'ArrowLeft' && previous !== null) selection.set(previous, today);
    if (event.key === 'ArrowRight' && next !== null) selection.set(next, today);
  }
</script>

<svelte:head>
  <title>Menus des écoles de Talence</title>
  <meta
    name="description"
    content="Le menu du jour des écoles de Talence, lisible en un coup d'œil et consultable hors ligne."
  />
</svelte:head>

<svelte:window on:keydown={onKeydown} />

<!--
  L'en-tête change sous la même horloge que le contenu qu'il annonce (D30).

  Il était rendu hors du bloc animé : la date passait au jour suivant pendant
  que le plateau du jour précédent n'avait pas fini de sortir. Un seul
  changement, deux temps — c'est ce défaut-là que l'œil enregistre, avant même
  de pouvoir nommer une vitesse.

  Deux blocs distincts et non un seul englobant : le contenu du jour vit à
  l'intérieur de la surface de geste, qui doit rester stable pendant qu'un doigt
  la touche. Ils partagent la même clé, le même sens et la même durée, ce qui
  est précisément ce que « une seule horloge » veut dire.
-->
{#key date}
  <div class="glisse" style:--sens={sens}>
    <EnTete
      quand={targetEyebrow(target)}
      quoi={date === null ? 'Menus des écoles' : formatDay(date)}
      {retour}
    />
  </div>
{/key}

{#if data.status.kind === 'schema-too-new'}
  <p class="notice">
    Ces menus ont été publiés dans un format plus récent que celui que cette version sait lire.
    Rechargez la page pour mettre l'application à jour.
  </p>
{:else if data.status.kind === 'unavailable'}
  <p class="notice">
    Aucun menu n'est disponible. Une première connexion est nécessaire pour les télécharger.
  </p>
{:else if day === null}
  <p class="notice">
    Le menu de cette période n'est pas encore publié par la Ville.
    <ExternalLink href="https://www.talence.fr/quotidien/enfance-scolarite/menu-ecoles/">
      Consulter la page officielle
    </ExternalLink>
  </p>
{:else}
  {#if stale}
    <p class="notice subtle">
      Ces menus n'ont pas été rafraîchis depuis plus de deux jours. Ils peuvent être périmés.
    </p>
  {/if}

  {#if day.confidence === 'low'}
    <p class="warn">
      Données incertaines pour ce jour.
      <ExternalLink href={day.source.pdfUrl}>Vérifier sur le PDF officiel</ExternalLink>
    </p>
  {/if}

  <!--
    Le geste est strictement redondant avec les boutons de navigation et les
    flèches du clavier, tous deux atteignables et annoncés. Lui inventer un rôle
    ARIA ajouterait un élément interactif de plus à parcourir au lecteur d'écran
    pour la même fonction.

    Contrepartie du branchement par diffusion : Svelte ne voit plus les
    gestionnaires, donc son contrôle d'accessibilité ne s'exprime plus ici. Le
    raisonnement ci-dessus tient lieu de justification, sans directive à tenir
    à jour.

    La surface de geste reste hors de la clé : elle porte les gestionnaires et
    la capture du pointeur, et la détruire pendant qu'un doigt la touche tuerait
    le geste en cours. C'est son contenu qui se renouvelle, pas elle.
  -->
  <div class="balayage" {...balayage}>
    {#key date}
      <div class="jour glisse" style:--sens={sens}>
        {#if day.theme}
          <section class="theme">
            <h2>{day.theme}</h2>
            {#if day.note}<p>{day.note}</p>{/if}
          </section>
        {/if}

        <!--
          Le déjeuner est une cible unique (D38).

          Chaque plat était auparavant actionnable, ce qui lui imposait 44 pixels
          de hauteur et rendait le plateau incompressible. La question posée à
          cet écran n'est de toute façon pas « quelle case contient l'allergène »
          mais « la journée en contient-elle un » : une ouverture, la liste
          entière.

          L'indice en pied dit ce que l'appui fait, et il est à l'intérieur du
          bouton : il devient ainsi la fin du nom accessible, sans qu'aucune
          annotation ARIA n'ait à être inventée ni tenue à jour.
        -->
        <button type="button" class="cible" onclick={() => (ouverte = true)}>
          <Tray {day} />
          <span class="indice">Allergènes de la journée</span>
        </button>

        {#if snack}
          {@const match = classify(snack.label)}
          {@const nom = courseName(snack)}
          {@const codes = allergenFilter.matching(snack)}
          <!--
            Le goûter n'est pas sur l'ardoise du déjeuner : il n'est pas servi au
            même moment, et l'y ranger dirait le contraire. Il n'est pas non plus
            une note de bas de page — vingt libellés distincts sur trente-cinq
            jours, c'est la deuxième quantité d'information de l'écran (D29).

            Il emprunte le vocabulaire de la vedette — un disque, une
            illustration, un nom — parce que c'est le seul qui reste depuis que
            les compartiments ont disparu (D41). Il mène à la même fiche que le
            déjeuner : deux chemins d'ouverture, une seule journée à décrire.

            La séparation est portée par sa forme et son éloignement, et non par
            un filet : l'écran en porte déjà un en pied de page, où il signifie
            « fin du contenu », et un trait sépare deux choses de même nature.
          -->
          <button type="button" class="snack" onclick={() => (ouverte = true)}>
            <span class="snack-disc"><Illustration name={match.illustration} /></span>
            <span class="snack-body">
              <span class="snack-role">{slotLabel('gouter')}</span>
              <span class="snack-name" class:unknown={nom.kind === 'undisclosed'}>
                {nom.text}
              </span>
              {#if codes.length > 0}
                <AllergenChip {codes} names={flaggedAllergenNames(snack, day.legend, codes)} />
              {/if}
            </span>
          </button>
        {/if}
      </div>
    {/key}
  </div>

  <nav aria-label="Navigation entre les jours">
    <button
      type="button"
      onclick={() => previous && selection.set(previous, today)}
      disabled={previous === null}
    >
      <span aria-hidden="true">←</span>
      {previous === null ? 'Début des menus' : formatDay(previous, { month: 'short' })}
    </button>
    <button
      type="button"
      onclick={() => next && selection.set(next, today)}
      disabled={next === null}
    >
      {next === null ? 'Fin des menus' : formatDay(next, { month: 'short' })}
      <span aria-hidden="true">→</span>
    </button>
  </nav>

  <footer>
    <span>
      {day.source.updatedLabel ??
        (day.source.updatedAt
          ? `Mis à jour le ${formatDay(day.source.updatedAt)}`
          : 'Source : Ville de Talence')}
    </span>
    <ExternalLink href={day.source.pdfUrl}>PDF officiel</ExternalLink>
  </footer>
{/if}

{#if ouverte && day}
  <!--
    Le focus revient de lui-même sur l'élément qui a ouvert la couche, que ce
    soit le déjeuner ou le goûter : c'est le `<dialog>` natif qui s'en charge, et
    c'est précisément pourquoi il ne faut rien câbler ici (D38).
  -->
  <DaySheet {day} onClose={() => (ouverte = false)} />
{/if}

<style>
  .notice {
    margin: 0;
    background: var(--tray);
    color: var(--ink);
    border-radius: var(--radius-cell);
    padding: var(--space-3);
    font-size: var(--text-sm);
    line-height: 1.5;
  }

  .notice.subtle {
    background: none;
    color: var(--on-table);
    opacity: 0.8;
    padding-inline: var(--space-2);
  }

  .warn {
    margin: 0;
    background: var(--warn);
    color: var(--warn-on);
    border-radius: var(--radius-cell);
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    font-weight: 600;
    line-height: 1.35;
  }

  .warn :global(a),
  .notice :global(a) {
    color: currentcolor;
    font-weight: 700;
  }

  /*
    `pan-y` rend le défilement vertical au navigateur et garde l'horizontal pour
    l'application. Sans cette ligne, le navigateur revendique le mouvement, émet
    `pointercancel`, et le geste meurt sans que rien ne le signale — c'est la
    panne constatée en D18.
  */
  .balayage {
    touch-action: pan-y;
    /* La transition d'entrée décale son contenu de 24 pixels : sans découpe, ce
       débordement s'ajoute brièvement à la largeur défilable et laisse la page
       glisser de côté pendant l'animation. `clip` découpe sans créer de conteneur
       de défilement, et laisse donc l'axe vertical intact. */
    overflow-x: clip;
  }

  /* Le contenu du jour reproduit l'intervalle de la coque : il est devenu un
     seul enfant de celle-ci, pour n'avoir qu'une horloge (D30). */
  .jour {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  /*
    La cible de la journée : une commande qui ne ressemble pas à une commande.

    Elle n'a ni fond ni bordure propres — c'est l'ardoise qu'elle contient qui
    porte la surface. Le bouton n'existe que pour rendre le déjeuner atteignable
    d'un seul appui et d'une seule tabulation.
  */
  .cible {
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  /*
    L'affordance est écrite plutôt que suggérée.

    Une grande surface muette ne se donne pas pour actionnable, et un chevron
    seul ne dit pas ce qu'il ouvre. Le texte fait les deux — il montre que
    l'ardoise s'ouvre, et il termine le nom accessible du bouton par ce que
    l'appui produit.
  */
  .indice {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-1);
    padding: var(--space-2) var(--space-2) 0;
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--on-table) 72%, transparent);
  }

  .indice::after {
    content: '›';
    font-size: var(--text-base);
    line-height: 1;
  }

  .cible:focus-visible {
    outline: 3px solid var(--on-table);
    outline-offset: 3px;
    border-radius: var(--radius-tray);
  }

  .theme {
    background: var(--tray);
    color: var(--ink);
    border-radius: var(--radius-cell);
    padding: var(--space-3);
  }

  .theme h2 {
    margin: 0;
    font-size: var(--text-base);
    font-weight: 800;
    letter-spacing: -0.01em;
  }

  .theme p {
    margin: var(--space-1) 0 0;
    font-size: var(--text-sm);
    color: var(--ink-muted);
    line-height: 1.45;
  }

  /*
    Le goûter est un second objet, plus petit, posé plus loin sur la table.

    Il portait jusqu'ici deux cadres emboîtés — une surface claire, un
    compartiment posé dessus — parce qu'il empruntait la construction des
    compartiments du plateau. Ces compartiments n'existent plus, et le cadre
    intérieur ne renvoyait donc plus à rien : il ne restait qu'une bordure de
    plus à traverser du regard. Il emprunte désormais le vocabulaire de la
    vedette, seul vocabulaire restant pour dire « ce qui est servi » (D41).

    Ce qui le sépare du déjeuner est la distance : la coque espace déjà ses
    enfants, cette marge double l'intervalle, et la rupture se lit sans qu'aucun
    trait ne soit ajouté (D29).
  */
  .snack {
    margin-top: var(--space-3);
    display: flex;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
    padding: var(--space-3);
    background: var(--tray);
    border: 0;
    border-radius: var(--radius-tray);
    font: inherit;
    color: var(--ink);
    text-align: left;
    cursor: pointer;
  }

  /* Le disque suit l'échelle des illustrations plutôt qu'une valeur fixe : un
     seul palier de largeur les fait toutes grandir (D23). */
  /* Le disque prend la teinte des alvéoles, faute de quoi il disparaîtrait :
     il repose désormais directement sur la surface claire du goûter, et non
     plus sur un compartiment qui l'en séparait. */
  .snack-disc {
    width: calc(var(--ill-cellule) * 1.5);
    height: calc(var(--ill-cellule) * 1.5);
    border-radius: 50%;
    background: var(--cell);
    display: grid;
    place-items: center;
    flex: none;
  }

  .snack :global(.illustration) {
    width: var(--ill-cellule);
    height: var(--ill-cellule);
  }

  .snack-body {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    align-items: flex-start;
    min-width: 0;
  }

  .snack-role {
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--ink-muted);
  }

  .snack-name {
    font-size: var(--text-lg);
    font-weight: 700;
    line-height: 1.2;
    text-wrap: balance;
  }

  /* Voir Tray.svelte : un détail non publié s'écrit comme une mention, pas
     comme un titre — et ne se confond pas avec une absence. */
  .snack-name.unknown {
    font-style: italic;
    font-weight: 600;
    font-size: var(--text-base);
    color: var(--ink-muted);
  }

  /* Le liseré rentre dans la carte plutôt que d'en sortir : il vit désormais
     dans une surface découpée horizontalement, et un décalage vers l'extérieur
     serait rogné sur ses deux bords. Même choix que les compartiments. */
  .snack:focus-visible {
    outline: 3px solid var(--ink);
    outline-offset: -3px;
  }

  nav {
    display: flex;
    gap: var(--space-2);
  }

  nav button {
    flex: 1;
    min-height: var(--touch);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);
    font: inherit;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--on-table);
    background: none;
    /* 40 % et non 35 % : sur le fond de la table, le mélange à 35 % ne mesure
       que 2,81:1 alors qu'une bordure délimitant une commande en demande 3
       (WCAG 1.4.11). À 40 %, elle mesure 3,20:1 — vérifié par `contrast.test.ts`,
       qui mesure désormais aussi les surfaces obtenues par opacité (D27). */
    border: 1px solid color-mix(in srgb, var(--on-table) 40%, transparent);
    border-radius: 999px;
    cursor: pointer;
  }

  nav button:disabled {
    opacity: 0.45;
    cursor: default;
  }

  footer {
    display: flex;
    justify-content: space-between;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-2) 0;
    border-top: 1px solid color-mix(in srgb, var(--on-table) 22%, transparent);
    color: var(--on-table);
    opacity: 0.72;
    font-size: var(--text-xs);
  }

  footer :global(a) {
    color: var(--on-table);
    font-weight: 700;
    opacity: 1;
    /* Cible tactile : un lien isolé doit être atteignable au pouce. */
    min-height: var(--touch);
    display: inline-flex;
    align-items: center;
  }
</style>
