<script lang="ts">
  import { isStale } from '$lib/data/load.js';
  import { horloge } from '$lib/data/horloge.svelte.js';
  import { parisDate, resolveDisplayDay, servedNeighbour } from '$lib/data/resolve.js';
  import DaySheet from '$lib/menu/DaySheet.svelte';
  import Tray from '$lib/menu/Tray.svelte';
  import PlatCarte from '$lib/menu/PlatCarte.svelte';
  import {
    allergensUndeclared,
    browsedEyebrow,
    formatDay,
    targetEyebrow,
    targetReturnLabel,
    undeclaredNotice
  } from '$lib/menu/labels.js';
  import { allergenFilter } from '$lib/filter/allergens.svelte.js';
  import ExternalLink from '$lib/ui/ExternalLink.svelte';
  import { selection } from '$lib/menu/selection.svelte.js';
  import { createBalayage } from '$lib/ui/balayage.js';
  import RangNavigation from '$lib/ui/RangNavigation.svelte';
  import PiedSource from '$lib/ui/PiedSource.svelte';
  import CommandeRetour from '$lib/ui/CommandeRetour.svelte';
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
   * Qui a choisi le jour affiché — c'est ce qui décide de la mention et du
   * retour (D44, D60).
   *
   * Si c'est le système, la mention dit pourquoi ce jour-là, et il n'y a nulle
   * part où revenir. Si c'est l'utilisateur, la mention dit la distance, et le
   * retour est offert. La constante « Menu du jour », qui occupait ce cas,
   * disait la même chose tous les jours, dans les deux directions et à toutes
   * les distances.
   */
  const ecarte = $derived(chosen !== null && chosen !== repere);

  /**
   * Ce que la mention dit, et qui le lui fait dire (design.md, D60).
   *
   * Tant que l'écran montre ce que le système a choisi, elle en donne la raison.
   * Dès qu'on a navigué, cette raison ne décrit plus rien de ce qui est là, et
   * la seule chose qui reste utile est la distance au jour courant.
   *
   * Aucune garde à ajouter pour le cas sans date : `date` ne vaut `null` que si
   * `repere` et `chosen` sont tous deux nuls, ce qui rend `ecarte` faux. Le
   * second membre est donc le seul atteignable, et il annonce « Menu non
   * publié ».
   */
  const mention = $derived(
    ecarte && date !== null ? browsedEyebrow(date, today) : targetEyebrow(target)
  );

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
  Le rang de navigation porte la date, entre les deux commandes qui la changent
  (design.md, D55, D56).

  Elle vivait dans l'en-tête, qui a d'abord porté un titre fixe, puis disparu de
  cet écran : la date est devenue son titre de premier niveau, portée par ce rang
  (D61). C'est ici qu'elle est le plus utile : contre le geste qui la fait
  changer, et non trois blocs plus
  haut. La maquette la place au même endroit, et dessine par-dessus un second
  rang de flèches en bas de la liste — redondance de maquette, pas intention :
  deux jeux de commandes pour une seule action, dont l'un sort du champ dès
  qu'on défile.

  Les commandes sont hors de la clé, et leur contenu dedans (D30). Recréer les
  boutons à chaque changement de jour perdrait le focus du clavier au milieu
  d'une navigation au clavier — ce que `retour.spec.ts` vérifie. Ce qui se
  renouvelle sous la même horloge que le contenu, c'est ce qu'ils encadrent.
-->
<RangNavigation
  libelle="Navigation entre les jours"
  precedent={{
    nom: previous === null ? 'Début des menus' : `Jour précédent : ${formatDay(previous)}`,
    action: previous === null ? null : () => selection.set(previous, today)
  }}
  suivant={{
    nom: next === null ? 'Fin des menus' : `Jour suivant : ${formatDay(next)}`,
    action: next === null ? null : () => selection.set(next, today)
  }}
  cle={date}
  {sens}
  {mention}
  principal={date === null ? 'Menus des écoles' : formatDay(date)}
/>

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

  {#if day.title}
    <!-- Un jour de vacances n'est pas un jour d'école : il se nomme (menus-vacances, D4). -->
    <p class="notice subtle">{day.title}</p>
  {/if}

  {#if day.confidence === 'low'}
    <p class="warn">
      Données incertaines pour ce jour.
      <ExternalLink href={day.source.pdfUrl}>Vérifier sur le PDF officiel</ExternalLink>
    </p>
  {/if}

  {#if allergensUndeclared(day.source)}
    <!--
      Le filtre se tairait sur chaque plat : rien n'est signalé parce que rien
      n'est connu. Le dire est le seul cas où il parle sans correspondance
      (allergenes-non-communiques, D3).
    -->
    <p class="warn">
      {undeclaredNotice(allergenFilter.codes.size > 0)}
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
        -->
        <button type="button" class="cible" onclick={() => (ouverte = true)}>
          <Tray {day} />
        </button>

        {#if snack}
          <!--
            Le goûter n'est pas dans la liste du déjeuner : il n'est pas servi au
            même moment, et l'y ranger dirait le contraire. Il n'est pas non plus
            une note de bas de page — vingt libellés distincts sur trente-cinq
            jours, c'est la deuxième quantité d'information de l'écran (D29).

            Il prend la même carte que les rôles du déjeuner, et non plus un
            vocabulaire à lui. Ce vocabulaire propre existait parce que la vedette
            était le seul modèle disponible depuis la disparition des
            compartiments (D41) ; la carte l'a remplacé, et le recopier ferait
            vivre deux dessins de la même chose.

            Il mène à la même fiche que le déjeuner : deux chemins d'ouverture,
            une seule journée à décrire. La séparation est portée par sa forme et
            son éloignement, et non par un filet : un trait sépare deux choses de
            même nature.
          -->
          <button type="button" class="snack" onclick={() => (ouverte = true)}>
            <PlatCarte slot="gouter" course={snack} legend={day.legend} />
          </button>
        {/if}
      </div>
    {/key}
  </div>

  <!--
    La commande de retour a son rang propre, sous les cartes (D55).

    D44 la logeait dans l'en-tête, à la place de la mention, avec une hauteur
    réservée pour qu'un balayage ne déplace rien. La réservation n'a plus
    d'objet : la commande apparaît en fin de flux, où son arrivée ne pousse
    aucun contenu déjà lu.
  -->
  {#if retour}
    <CommandeRetour libelle={retour.libelle} action={retour.action} />
  {/if}

  <PiedSource
    updatedLabel={day.source.updatedLabel}
    updatedAt={day.source.updatedAt}
    pdfUrl={day.source.pdfUrl}
  />
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
    background: var(--carte);
    color: var(--ink);
    border-radius: var(--radius-pastille);
    padding: var(--space-3);
    font-size: var(--text-sm);
    line-height: 1.5;
  }

  .notice.subtle {
    background: none;
    color: var(--ink);
    opacity: 0.8;
    padding-inline: var(--space-2);
  }

  .warn {
    margin: 0;
    background: var(--warn);
    color: var(--warn-on);
    border-radius: var(--radius-pastille);
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

  .cible:focus-visible {
    outline: 3px solid var(--ink);
    outline-offset: 3px;
    border-radius: var(--radius-carte);
  }

  .theme {
    background: var(--carte);
    color: var(--ink);
    border-radius: var(--radius-pastille);
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
    Le goûter est un second objet, posé plus loin sur la table.

    Il ne porte plus de dessin propre : c'est une carte, comme les rôles du
    déjeuner, et le bouton n'ajoute autour d'elle qu'une cible (D29, D50). Ce
    qui le sépare du déjeuner est la distance : la coque espace déjà ses
    enfants, cette marge double l'intervalle, et la rupture se lit sans qu'aucun
    trait ne soit ajouté.
  */
  .snack {
    margin-top: var(--space-3);
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

  .snack:focus-visible {
    outline: 3px solid var(--ink);
    outline-offset: 3px;
    border-radius: var(--radius-carte);
  }
</style>
