<script lang="ts">
  import Illustration from '../illustrations/Illustration.svelte';
  import { classify } from '../illustrations/families.js';
  import type { Course } from '../data/schema.js';
  import { allergenNames, qualityLabel, slotLabel } from './labels.js';
  import ExternalLink from '../ui/ExternalLink.svelte';
  import { allergenIcon } from '../illustrations/allergens.js';

  let {
    course,
    legend,
    pdfUrl,
    onClose
  }: {
    course: Course;
    legend: Record<string, string>;
    pdfUrl: string;
    onClose: () => void;
  } = $props();

  const match = $derived(classify(course.label));
  const allergens = $derived(allergenNames(course, legend));

  /**
   * La couche est un `<dialog>` natif (design.md, D16).
   *
   * Le navigateur fournit alors ce que l'annotation ARIA promettait sans que
   * rien ne le tienne : couche supérieure, `::backdrop`, échappement, piège de
   * focus, et restitution du focus sur la cellule qui a ouvert la feuille.
   * Il n'y a donc ici ni écoute du clavier, ni gestion du focus.
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
      <span
        class="disc"
        style:--pale={`var(--fam-${match.family}-pale)`}
        style:--ring={`var(--fam-${match.family})`}
      >
        <Illustration name={match.illustration} size={34} />
      </span>
      <span class="head-body">
        <span class="role">{slotLabel(course.slot)}</span>
        <h2 id="sheet-title">{course.label}</h2>
      </span>
      <button type="button" class="close" onclick={() => dialog?.close()}>Fermer</button>
    </div>

    <section>
      <h3>Allergènes déclarés</h3>
      {#if allergens.length > 0}
        <ul class="allergens">
          {#each allergens as allergen (allergen.code)}
            <li>
              <svg width="21" height="21" aria-hidden="true" focusable="false" class="alg-icon">
                <use href={`#${allergenIcon(allergen.code)}`} />
              </svg>
              <span>{allergen.name}</span>
            </li>
          {/each}
        </ul>
      {:else}
        <!--
        La formulation est volontairement lourde : « aucun allergène déclaré »
        n'est pas « sans allergène », et l'écrire autrement serait une promesse
        qu'aucune donnée ne permet de tenir.
      -->
        <p class="none">
          <strong>Aucun allergène déclaré</strong>
          <span>
            Le document source n'en mentionne aucun pour ce plat. Cela ne garantit pas l'absence de
            traces.
          </span>
        </p>
      {/if}
    </section>

    {#if course.flags.length > 0}
      <section>
        <h3>Labels</h3>
        <ul class="flags">
          {#each course.flags as flag (flag)}
            <li>{qualityLabel(flag)}</li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if course.porkFree}
      <section>
        <h3>Régime sans porc</h3>
        <p class="pork">{course.porkFree}</p>
      </section>
    {/if}

    <footer>
      <span>Susceptible de modification selon les arrivages.</span>
      <span>
        <strong>Seul le document officiel de la Ville fait foi.</strong> Cette application n'est pas un
        service municipal et ne remplace pas un PAI.
      </span>
      <ExternalLink href={pdfUrl}>Voir le PDF officiel</ExternalLink>
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
    background: var(--sheet);
    color: var(--ink);
    border-radius: 20px 20px 0 0;

    opacity: 0;
    translate: 0 12px;
    transition:
      opacity 180ms ease-out,
      translate 180ms ease-out,
      display 180ms allow-discrete,
      overlay 180ms allow-discrete;
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
    background: rgb(0 0 0 / 0.45);
  }

  @media (min-width: 640px) {
    dialog {
      max-width: 520px;
      margin: auto;
      border-radius: 16px;
    }
  }

  .corps {
    padding: var(--space-4) var(--space-4) var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .head {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .disc {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    flex: none;
    display: grid;
    place-items: center;
    background: var(--pale);
    border: 4px solid var(--ring);
  }

  .head-body {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }

  .role {
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--ink-muted);
  }

  h2 {
    margin: 0;
    font-size: var(--text-lg);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.15;
  }

  .close {
    margin-left: auto;
    align-self: flex-start;
    min-height: var(--touch);
    padding-inline: var(--space-3);
    font: inherit;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--ink);
    background: none;
    border: 1px solid var(--edge);
    border-radius: 999px;
    cursor: pointer;
  }

  section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  h3 {
    margin: 0;
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--ink-muted);
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .allergens li {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background: var(--chip);
    border: 1px solid var(--edge);
    border-radius: var(--radius-cell);
    padding: 0.42rem 0.55rem;
    font-size: var(--text-base);
    font-weight: 600;
  }

  .alg-icon {
    display: block;
    flex: none;
  }

  .none {
    margin: 0;
    background: var(--chip);
    border: 1px solid var(--edge);
    border-radius: var(--radius-cell);
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    font-size: var(--text-sm);
    color: var(--ink-muted);
  }

  .none strong {
    font-size: var(--text-base);
    color: var(--ink);
  }

  .flags li,
  .pork {
    margin: 0;
    font-size: var(--text-sm);
  }

  footer {
    border-top: 1px solid var(--edge);
    padding-top: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    font-size: 0.75rem;
    color: var(--ink-muted);
    line-height: 1.45;
  }

  footer strong {
    color: var(--ink);
  }

  footer :global(a) {
    color: var(--table);
    font-weight: 700;
    min-height: var(--touch);
    display: inline-flex;
    align-items: center;
  }

  @media (prefers-color-scheme: dark) {
    footer :global(a) {
      color: var(--on-table);
    }
  }
</style>
