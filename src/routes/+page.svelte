<script lang="ts">
  import { contactAncien } from '#lib/data/load.js';
  import { appUpdate } from '#lib/pwa/update.svelte.js';
  import { horloge } from '#lib/data/horloge.svelte.js';
  import { parisDate, resolveDisplayDay, servedNeighbour } from '#lib/data/resolve.js';
  import FicheJour from '#lib/menu/FicheJour.svelte';
  import ListeDuJour from '#lib/menu/ListeDuJour.svelte';
  import PlatCarte from '#lib/menu/PlatCarte.svelte';
  import {
    allergensUndeclared,
    browsedEyebrow,
    formatDay,
    targetEyebrow,
    targetReturnLabel,
    undeclaredNotice,
    PAGE_DES_MENUS
  } from '#lib/menu/labels.js';
  import { allergenFilter } from '#lib/filter/allergens.svelte.js';
  import LienExterne from '#lib/ui/LienExterne.svelte';
  import { selection } from '#lib/menu/selection.svelte.js';
  import Carrousel from '#lib/ui/Carrousel.svelte';
  import RangNavigation from '#lib/ui/RangNavigation.svelte';
  import PiedSource from '#lib/ui/PiedSource.svelte';
  import CommandeRetour from '#lib/ui/CommandeRetour.svelte';
  import Bandeau from '#lib/ui/Bandeau.svelte';
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

  /* Le dernier contact de l'appareil avec le serveur, et non l'âge du manifeste
     (fraicheur-par-appareil, D1). */
  const joursSansContact = $derived(contactAncien(appUpdate.contact, now));

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
  mention={mention.texte}
  aujourdhui={mention.aujourdhui}
  principal={date === null ? 'Menus des écoles' : formatDay(date)}
/>

<!--
  Les messages de l'écran, dans l'ordre où ils se lisent (bandeau-et-aujourdhui,
  D2) : ce qu'est le jour, puis ce qui en menace la lecture, puis ce qui la
  relativise.
-->
{#if data.status.kind === 'schema-too-new'}
  <Bandeau ton="info">
    Ces menus ont été publiés dans un format plus récent que celui que cette version sait lire.
    Rechargez la page pour mettre l'application à jour.
  </Bandeau>
{:else if data.status.kind === 'unavailable'}
  <Bandeau ton="info">
    Aucun menu n'est disponible. Une première connexion est nécessaire pour les télécharger.
  </Bandeau>
{:else if day === null}
  <Bandeau ton="info">
    Le menu de cette période n'est pas encore publié par la Ville.
    <LienExterne href={PAGE_DES_MENUS}>Consulter la page officielle</LienExterne>
  </Bandeau>
{:else}
  {#if day.title}
    <!-- Un jour de vacances n'est pas un jour d'école : il se nomme (menus-vacances, D4). -->
    <Bandeau ton="evenement">{day.title}</Bandeau>
  {/if}

  {#if day.confidence === 'low'}
    <Bandeau ton="alerte">
      Données incertaines pour ce jour.
      <LienExterne href={day.source.pdfUrl}>Vérifier sur le PDF officiel</LienExterne>
    </Bandeau>
  {/if}

  {#if allergensUndeclared(day.source)}
    <!--
      Le filtre se tairait sur chaque plat : rien n'est signalé parce que rien
      n'est connu. Le dire est le seul cas où il parle sans correspondance
      (allergenes-non-communiques, D3).
    -->
    <Bandeau ton="alerte">
      {undeclaredNotice(allergenFilter.codes.size > 0)}
      <LienExterne href={day.source.pdfUrl}>Vérifier sur le PDF officiel</LienExterne>
    </Bandeau>
  {/if}

  {#if joursSansContact !== null}
    <Bandeau ton="info" discret>
      Cet appareil n'a pas pu vérifier les menus depuis {joursSansContact} jours. Ils ont pu changer :
      <LienExterne href={PAGE_DES_MENUS}>voir la page de la Ville</LienExterne>.
    </Bandeau>
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

    Le contenu suit le doigt, et le jour voisin arrive avec lui
    (carrousel-des-jours) : le carrousel rend ses voisins pendant le mouvement
    seulement, par le même dessin que le jour présenté.
  -->
  <Carrousel
    cle={day.date}
    precedent={previous}
    suivant={next}
    aller={(jourVise) => selection.set(jourVise, today)}
  >
    {#snippet panneau(cle)}
      {@const jour = data.dataset.byDate.get(cle)}
      {@const gouter = jour?.courses.find((course) => course.slot === 'gouter') ?? null}
      {#if jour}
        <div class="jour">
          {#if jour.theme}
            <!-- Un contenu du jour, qui glisse avec lui ; pas une carte de plat (D2). -->
            {#if jour.note}
              <Bandeau ton="evenement" titre={jour.theme}>{jour.note}</Bandeau>
            {:else}
              <Bandeau ton="evenement" titre={jour.theme} />
            {/if}
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
            <ListeDuJour day={jour} />
          </button>

          {#if gouter}
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

              Il prend la forme compacte de la carte : une ligne, sans vignette.
              Il reste une cible distincte, et c'est la ligne entière qu'on touche
              (lignes-compactes, D2).
            -->
            <button type="button" class="snack" onclick={() => (ouverte = true)}>
              <PlatCarte slot="gouter" course={gouter} legend={jour.legend} compacte />
            </button>
          {/if}
        </div>
      {/if}
    {/snippet}
  </Carrousel>

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
  <FicheJour {day} onClose={() => (ouverte = false)} />
{/if}

<style>
  /* Le contenu du jour reproduit l'intervalle de la coque : il est devenu un
     seul enfant de celle-ci, pour n'avoir qu'une horloge (D30). */
  .jour {
    display: flex;
    flex-direction: column;
    gap: var(--espace-3);
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
    outline: 3px solid var(--encre);
    outline-offset: 3px;
    border-radius: var(--rayon-carte);
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
    margin-top: var(--espace-3);
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
    outline: 3px solid var(--encre);
    outline-offset: 3px;
    border-radius: var(--rayon-carte);
  }
</style>
