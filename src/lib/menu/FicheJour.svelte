<script lang="ts">
  import type { ResolvedDay } from '../data/dataset.js';
  import type { Course } from '../data/schema.js';
  import {
    allergenNames,
    courseName,
    formatDay,
    LUNCH_SLOTS,
    qualityLabel,
    slotLabel,
    allergensUndeclared,
    noAllergenLabel,
    undeclaredWatched,
    watchedFirst,
    watchedSummary
  } from './labels.js';
  import LienExterne from '../ui/LienExterne.svelte';
  import Bandeau from '../ui/Bandeau.svelte';
  import { allergenFilter } from '../filter/allergens.svelte.js';
  import { allergenIcon } from '../illustrations/allergens.js';

  let { day, onClose }: { day: ResolvedDay; onClose: () => void } = $props();

  /**
   * La journée entière, dans l'ordre de l'écran (design.md, D38).
   *
   * La fiche portait auparavant un plat unique, et il fallait l'ouvrir six fois
   * pour savoir ce que contenait la journée. Or la question posée à cet écran
   * est « la journée contient-elle un allergène que je surveille », pas « quelle
   * case le contient » : la réponse utile est la liste complète.
   *
   * L'ordre est celui de `LUNCH_SLOTS`, lu ici et par l'ardoise, pour que la
   * lecture de l'écran et celle du détail se correspondent. Un rôle non servi
   * n'y figure pas : son absence est déjà énoncée sur l'écran du jour, et la
   * répéter ici allongerait la liste sans rien apprendre.
   */
  const plats = $derived(
    [
      ...LUNCH_SLOTS.map((slot) => day.courses.find((course) => course.slot === slot) ?? null),
      day.courses.find((course) => course.slot === 'gouter') ?? null
    ].filter((course): course is Course => course !== null)
  );

  /**
   * Ce que le parent surveille, en tête de la fiche (alerte-et-fiche-cochee, D4).
   *
   * Le résumé ne se montre qu'avec une sélection : sans elle, il n'y a rien à
   * mettre en avant, et la fiche reste ce qu'elle était. Un jour dont le
   * document ne précise pas les allergènes, il cède la place à un avertissement
   * — un résumé fait de listes vides dirait « aucun plat ne le déclare » là où
   * l'on ne sait rien.
   */
  const surveilles = $derived(watchedSummary(plats, day.legend, allergenFilter.codes));
  const nonPrecise = $derived(allergensUndeclared(day.source));

  /**
   * La couche est un `<dialog>` natif (design.md, D16).
   *
   * Le navigateur fournit alors ce que l'annotation ARIA promettait sans que
   * rien ne le tienne : couche supérieure, `::backdrop`, échappement, piège de
   * focus, et restitution du focus sur l'élément qui a ouvert la feuille — quel
   * qu'il soit. C'est ce dernier point qui compte depuis qu'il y a deux chemins
   * d'ouverture, le déjeuner et le goûter : un retour câblé sur l'un des deux
   * serait faux pour l'autre, et il n'y a rien à câbler.
   */
  let dialog = $state<HTMLDialogElement | null>(null);

  $effect(() => {
    if (dialog !== null && !dialog.open) dialog.showModal();
  });

  /**
   * Un clic sur `::backdrop` a pour cible le `<dialog>` lui-même : c'est ce qui
   * distingue le dehors du dedans, le contenu étant dans un élément enfant.
   */
  function onClick(event: MouseEvent) {
    if (event.target === dialog) dialog?.close();
  }
</script>

<!--
  `onclose` couvre les trois chemins de fermeture d'un seul tenant : la commande
  visible, la touche d'échappement, et l'action hors du contenu.
-->
<dialog bind:this={dialog} aria-labelledby="sheet-title" onclose={onClose} onclick={onClick}>
  <div class="corps">
    <div class="head">
      <span class="head-body">
        <h2 id="sheet-title">{formatDay(day.date)}</h2>
        <!--
          Sous le titre et non au-dessus : posée en surtitre, la mention se
          lisait comme un libellé de la date — « allergènes déclarés : mardi 1er
          septembre » — au lieu d'annoncer ce que la feuille contient.
        -->
        <span class="role">Allergènes déclarés, plat par plat</span>
      </span>
      <button type="button" class="close" onclick={() => dialog?.close()}>Fermer</button>
    </div>

    {#if surveilles.length > 0}
      {#if nonPrecise}
        <div class="non-precise">
          <Bandeau ton="alerte">
            {undeclaredWatched(surveilles.map(({ name }) => name))}
            <LienExterne href={day.source.pdfUrl}>Vérifier sur le PDF officiel</LienExterne>
          </Bandeau>
        </div>
      {:else}
        <section class="resume" aria-labelledby="resume-titre">
          <h3 id="resume-titre">Allergènes surveillés</h3>
          <ul>
            {#each surveilles as { code, name, courses } (code)}
              <li>
                <strong>{name}</strong>
                <span class:aucun={courses.length === 0}>
                  {courses.length > 0 ? courses.join(', ') : 'Aucun plat ne le déclare'}
                </span>
              </li>
            {/each}
          </ul>
        </section>
      {/if}
    {/if}

    <ul class="plats" class:filtre={surveilles.length > 0}>
      {#each plats as course (course.slot)}
        {@const nom = courseName(course)}
        {@const allergens = watchedFirst(allergenNames(course, day.legend), allergenFilter.codes)}
        <li>
          <span class="plat-role">{slotLabel(course.slot)}</span>
          <span class="plat-ligne">
            <span class="plat-nom" class:unknown={nom.kind === 'undisclosed'}>{nom.text}</span>
            <!--
              Les labels précèdent les allergènes et reprennent la capsule de
              l'ardoise. Rendus en dessous et en gris, ils se lisaient comme un
              allergène de plus — la dernière confusion qu'on veuille sur cette
              feuille. Une qualité promue au rang de nom ne se redit pas.
            -->
            {#if course.flags.length > 0 && nom.kind !== 'quality'}
              <span class="tags">
                {#each course.flags as flag (flag)}<em>{qualityLabel(flag)}</em>{/each}
              </span>
            {/if}
          </span>

          {#if allergens.length > 0}
            <ul class="allergens">
              {#each allergens as allergen (allergen.code)}
                <!--
                  Trois signaux, dont aucun n'est une couleur : la graisse, le
                  contour appuyé, et le mot écrit — que le lecteur d'écran lit.
                -->
                <li class:surveille={allergen.watched}>
                  <svg width="21" height="21" aria-hidden="true" focusable="false" class="alg-icon">
                    <use href={`#${allergenIcon(allergen.code)}`} />
                  </svg>
                  <span class="nom">{allergen.name}</span>
                  {#if allergen.watched}<span class="marque">surveillé</span>{/if}
                </li>
              {/each}
            </ul>
          {:else}
            <!--
              La formulation est volontairement lourde : « aucun allergène
              déclaré » n'est pas « sans allergène », et l'écrire autrement
              serait une promesse qu'aucune donnée ne permet de tenir.
            -->
            <p class="none">{noAllergenLabel(day.source)}</p>
          {/if}

          {#if course.porkFree}
            <p class="pork"><span>Sans porc :</span> {course.porkFree}</p>
          {/if}
        </li>
      {/each}
    </ul>

    <footer>
      <span>Susceptible de modification selon les arrivages.</span>
      <span>
        <strong>Seul le document officiel de la Ville fait foi.</strong> Cette application n'est pas un
        service municipal et ne remplace pas un PAI.
      </span>
      {#if allergensUndeclared(day.source)}
        <span>
          « Allergènes non communiqués » : le document de ce jour ne précise pas les allergènes de
          ses plats.
        </span>
      {:else}
        <span>
          « Aucun allergène déclaré » signifie que le document source n'en mentionne aucun pour ce
          plat. Cela ne garantit pas l'absence de traces.
        </span>
      {/if}
      <LienExterne href={day.source.pdfUrl}>Voir le PDF officiel</LienExterne>
    </footer>
  </div>
</dialog>

<style>
  /*
    Sous le seuil, la feuille monte du bas et occupe toute la largeur : sa
    commande de fermeture reste à portée du pouce. Au-dessus, elle se centre et
    sa largeur est bornée — une boîte de dialogue étirée sur un écran de bureau
    ne se lit pas.

    Le `<dialog>` est la surface visible et ne porte aucun remplissage : c'est
    ce qui garantit qu'un clic ayant pour cible le dialogue lui-même vient
    forcément de `::backdrop`, et jamais d'une marge intérieure.
  */
  dialog {
    padding: 0;
    border: 0;
    width: 100%;
    max-width: none;
    max-height: 88dvh;
    overflow-y: auto;
    margin: auto auto 0;
    background: var(--carte);
    color: var(--encre);
    border-radius: var(--rayon-feuille) var(--rayon-feuille) 0 0;

    opacity: 0;
    translate: 0 12px;
    transition:
      opacity var(--apparition) var(--courbe),
      translate var(--apparition) var(--courbe),
      display var(--apparition) allow-discrete,
      overlay var(--apparition) allow-discrete;
  }

  /*
    L'entrée est animée sans JavaScript : `allow-discrete` rend `display` et
    `overlay` transitionnables, et `@starting-style` fournit l'état de départ
    d'un élément qui vient d'apparaître.

    Il n'y a pas d'animation de sortie : le parent démonte la feuille dès la
    fermeture, l'élément n'existe donc plus pour la jouer. Un agrément perdu
    contre un état de moins à tenir.

    Là où `@starting-style` n'est pas compris, la feuille apparaît sans
    transition — c'est déjà ce que `prefers-reduced-motion` impose par ailleurs
    (tokens.css), donc il n'y a aucun repli à écrire.
  */
  dialog[open] {
    opacity: 1;
    translate: none;
  }

  @starting-style {
    dialog[open] {
      opacity: 0;
      translate: 0 12px;
    }
  }

  dialog::backdrop {
    background: var(--voile-modale);
  }

  @media (min-width: 640px) {
    dialog {
      max-width: 520px;
      margin: auto;
      border-radius: var(--rayon-carte);
    }
  }

  .corps {
    padding: var(--espace-4) var(--espace-4) var(--espace-5);
    display: flex;
    flex-direction: column;
    gap: var(--espace-4);
  }

  .head {
    display: flex;
    align-items: flex-start;
    gap: var(--espace-3);
  }

  .head-body {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }

  .role {
    font-size: var(--texte-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: var(--poids-moyen);
    color: var(--encre-douce);
  }

  h2 {
    margin: 0;
    font-size: var(--texte-lg);
    font-weight: var(--poids-titre);
    letter-spacing: -0.03em;
    line-height: 1.15;
  }

  .close {
    margin-left: auto;
    align-self: flex-start;
    min-height: var(--cible);
    padding-inline: var(--espace-3);
    font: inherit;
    font-size: var(--texte-sm);
    font-weight: var(--poids-moyen);
    color: var(--encre);
    background: none;
    border: 1px solid var(--bord);
    border-radius: var(--rayon-pilule);
    cursor: pointer;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  /* Un plat par bloc, séparés par un filet : ici le trait sépare bien deux
     choses de même nature, ce qui est précisément le cas où il se justifie. */
  .plats {
    display: flex;
    flex-direction: column;
    gap: var(--espace-3);
  }

  .plats > li {
    display: flex;
    flex-direction: column;
    gap: var(--espace-1);
    padding-bottom: var(--espace-3);
    border-bottom: 1px solid var(--bord);
  }

  .plats > li:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  .plat-role {
    font-size: var(--texte-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: var(--poids-moyen);
    color: var(--encre-douce);
  }

  .plat-nom {
    font-size: var(--texte-base);
    font-weight: var(--poids-fort);
    line-height: 1.25;
  }

  /* Voir ListeDuJour.svelte : un détail non publié s'écrit comme une mention, pas
     comme un titre — et ne se confond pas avec une absence. */
  .plat-nom.unknown {
    font-style: italic;
    font-weight: var(--poids-moyen);
    color: var(--encre-douce);
  }

  .allergens {
    display: flex;
    flex-wrap: wrap;
    gap: var(--espace-1);
    margin-top: var(--espace-1);
  }

  .allergens li {
    display: flex;
    align-items: center;
    gap: var(--espace-1);
    background: var(--etiquette);
    border: 1px solid var(--bord);
    border-radius: var(--rayon-pastille);
    padding: 0.3rem 0.5rem 0.3rem 0.35rem;
    font-size: var(--texte-sm);
    font-weight: var(--poids-moyen);
  }

  .alg-icon {
    display: block;
    flex: none;
  }

  /*
    Un filtre actif : ce qu'on surveille se lit en premier, le reste s'efface
    sans disparaître. `--encre-douce` garde 4,5:1 sur la pastille — un allergène
    atténué reste un allergène lisible.
  */
  .plats.filtre .allergens li:not(.surveille) {
    color: var(--encre-douce);
    font-weight: normal;
  }

  .allergens li.surveille {
    border: 2px solid var(--encre);
    font-weight: var(--poids-titre);
  }

  .marque {
    font-size: var(--texte-2xs);
    font-weight: var(--poids-titre);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .resume {
    background: var(--creux);
    border-radius: var(--rayon-pastille);
    padding: var(--espace-3);
  }

  .resume h3 {
    margin: 0 0 var(--espace-2);
    font-size: var(--texte-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: var(--poids-titre);
    color: var(--encre-douce);
  }

  .resume ul {
    display: flex;
    flex-direction: column;
    gap: var(--espace-1);
  }

  .resume li {
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--espace-2);
    font-size: var(--texte-sm);
  }

  .resume .aucun {
    color: var(--encre-douce);
  }

  .none {
    margin: var(--espace-1) 0 0;
    font-size: var(--texte-sm);
    color: var(--encre-douce);
  }

  .plat-ligne {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--espace-1) var(--espace-2);
  }

  /* La même capsule que sur l'ardoise : un label de qualité s'écrit d'une seule
     façon dans toute l'application. */
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--espace-1);
    color: var(--encre-douce);
  }

  .tags em {
    font-style: normal;
    font-size: var(--texte-2xs);
    font-weight: var(--poids-titre);
    letter-spacing: 0.09em;
    text-transform: uppercase;
    border: 1.5px solid currentColor;
    border-radius: var(--rayon-pilule);
    padding: 0.08rem 0.4rem;
  }

  .pork {
    margin: 0;
    font-size: var(--texte-sm);
    color: var(--encre-douce);
  }

  .pork span {
    font-weight: var(--poids-fort);
  }

  footer {
    border-top: 1px solid var(--bord);
    padding-top: var(--espace-3);
    display: flex;
    flex-direction: column;
    gap: var(--espace-2);
    font-size: var(--texte-sm);
    color: var(--encre-douce);
    line-height: 1.45;
  }

  footer strong {
    color: var(--encre);
  }

  /* L'accent, et non le fond : ce lien était peint en `--fond` sur la couche
     blanche, à 1,17:1 — même survivance de l'apparence sombre que sur l'écran
     des mentions, trouvée par le même contrôle (D64). */
  footer :global(a) {
    color: var(--accent);
    font-weight: var(--poids-fort);
    min-height: var(--cible);
    display: inline-flex;
    align-items: center;
  }
</style>
