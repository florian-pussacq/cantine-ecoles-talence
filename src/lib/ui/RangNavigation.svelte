<script lang="ts">
  import type { Titre } from '#lib/menu/labels.js';
  import Icone from './Icone.svelte';

  /**
   * Le rang qui porte ce qu'on regarde, entre les deux commandes qui le changent
   * (design.md, D55, D56 ; refonte-signaletique, D6).
   *
   * Il est partagé par l'écran du jour et celui de la semaine parce que les deux
   * posent la même question — « lequel ? », avec un précédent et un suivant — et
   * que la version précédente les écrivait deux fois.
   *
   * **Les commandes sont hors de la clé de transition, leur contenu dedans**
   * (D30). Recréer les boutons à chaque changement perdrait le focus au milieu
   * d'une navigation au clavier — ce que `retour.spec.ts` vérifie. Ce qui se
   * renouvelle sous la même horloge que le contenu, c'est ce qu'ils encadrent.
   *
   * Une commande dont l'action est `null` est une borne du jeu de données : elle
   * reste présente, désactivée, et son nom accessible dit pourquoi.
   *
   * **Ce que le rang désigne est le titre de premier niveau de l'écran** (D61),
   * et il se compose comme un panneau : un grand chiffre, et à côté de lui ce qui
   * le situe (D6). Les flèches l'encadrent toujours, comme l'exige la
   * spécification, et la mention le suit au lieu de le surmonter : un surtitre
   * est une ligne de plus à lire avant ce qui compte.
   *
   * Le titre est dans la clé, et se remonte donc à chaque changement. C'est sans
   * conséquence sur son unicité : `{#key}` remplace de façon synchrone, et
   * l'animation qui suit est une animation CSS d'entrée, non une transition de
   * sortie. Il n'existe à aucun instant zéro ni deux titres de premier niveau —
   * ce que `qualite.spec.ts` mesure.
   */
  type Commande = { nom: string; action: (() => void) | null };

  let {
    libelle,
    precedent,
    suivant,
    cle,
    sens,
    mention,
    aujourdhui = false,
    principal,
    grand = 'jour'
  }: {
    libelle: string;
    precedent: Commande;
    suivant: Commande;
    /** Ce dont le changement déclenche la transition du bloc central. */
    cle: string | null;
    sens: number;
    mention: string;
    /** Le jour désigné est le jour courant : l'étiquette le dit (bandeau-et-aujourdhui, D3). */
    aujourdhui?: boolean;
    /** Le titre en trois parts ; une simple phrase quand aucune période n'est désignée. */
    principal: Titre | string;
    /** Le corps du chiffre : celui du jour, ou celui, plus petit, d'un intervalle. */
    grand?: 'jour' | 'semaine';
  } = $props();

  const titre = $derived(typeof principal === 'string' ? null : principal);
</script>

<nav class="rang" aria-label={libelle}>
  <button
    type="button"
    class="fleche"
    onclick={precedent.action ?? undefined}
    disabled={precedent.action === null}
    aria-label={precedent.nom}
  >
    <Icone name="precedent" size={20} />
  </button>

  {#key cle}
    <!-- Un `div` et non un `span` : il contient un titre, qui est du contenu de
         flux et n'a rien à faire dans un élément de phrasé. -->
    <div class="quand glisse" style:--sens={sens}>
      {#if titre}
        <h1 class="designation titre" class:semaine={grand === 'semaine'}>
          <span class="parts" aria-hidden={titre.lu ? 'true' : undefined}>
            {#if titre.avant}<span class="avant">{titre.avant}</span>{/if}
            <span class="chiffre">{titre.chiffre}</span>
            <span class="apres">{titre.apres}</span>
          </span>
          {#if titre.lu}<span class="lu-seulement">{titre.lu}</span>{/if}
        </h1>
      {:else}
        <h1 class="designation phrase">{principal}</h1>
      {/if}
      {#if mention || aujourdhui}
        <p class="mention">
          {#if aujourdhui}<span class="aujourdhui">Aujourd'hui</span>{/if}
          {#if mention}<span>{mention}</span>{/if}
        </p>
      {/if}
    </div>
  {/key}

  <button
    type="button"
    class="fleche"
    onclick={suivant.action ?? undefined}
    disabled={suivant.action === null}
    aria-label={suivant.nom}
  >
    <Icone name="suivant" size={20} />
  </button>
</nav>

<style>
  .rang {
    display: grid;
    grid-template-columns: var(--cible) minmax(0, 1fr) var(--cible);
    align-items: center;
    gap: var(--espace-3);
  }

  /*
    Une flèche carrée aux coins nets, et non un bouton pleine largeur portant
    la date voisine. Le libellé qui y figurait — « ← Mardi 1 sept. » — disait la
    destination ; il est passé dans `aria-label`, qui la porte pour le lecteur
    d'écran, tandis que le titre suffit à l'œil.
  */
  .fleche {
    width: var(--cible);
    height: var(--cible);
    display: grid;
    place-items: center;
    padding: 0;
    color: var(--encre);
    background: var(--carte);
    /* Une bordure qui délimite une commande porte une information et tient donc
       3:1 (WCAG 1.4.11), mesurée par `contrast.test.ts` (D27). */
    border: 1px solid var(--voile-trait);
    border-radius: var(--rayon-carte);
    cursor: pointer;
  }

  .fleche:disabled {
    opacity: 0.45;
    cursor: default;
  }

  .quand {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--espace-2);
  }

  .designation {
    margin: 0;
    font-weight: inherit;
    color: var(--encre);
  }

  /* Faute de période, une phrase ; elle prend le corps d'un titre courant. */
  .phrase {
    font-size: var(--texte-xl);
    font-weight: var(--poids-fort);
    line-height: 1.15;
  }

  /*
    Le chiffre à gauche, sur deux lignes ; à sa droite, en haut ce qui le
    précède dans la phrase, en bas ce qui le suit. Le document garde l'ordre de
    la phrase, et la grille seule le recompose à l'œil.
  */
  .parts {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-areas:
      'chiffre avant'
      'chiffre apres';
    align-items: end;
    justify-content: start;
    column-gap: var(--espace-3);
  }

  .chiffre {
    grid-area: chiffre;
    font-family: var(--police-affichage);
    font-size: var(--titre-jour);
    font-weight: var(--poids-fort);
    line-height: 0.78;
    letter-spacing: var(--serrage-titre);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .semaine .chiffre {
    font-size: var(--titre-semaine);
  }

  /*
    Ce qui entoure le chiffre peut passer à la ligne ; le chiffre, jamais. Sur un
    téléphone de 320 pixels, une semaine à cheval sur deux mois — « 30–4 nov. –
    déc. » — déborderait sous la flèche plutôt que de se replier.
  */
  .avant,
  .apres {
    min-width: 0;
    font-size: var(--texte-lg);
    line-height: 1.15;
    overflow-wrap: anywhere;
  }

  .avant {
    grid-area: avant;
    font-weight: var(--poids-fort);
  }

  .apres {
    grid-area: apres;
    color: var(--encre-douce);
  }

  /* Sans rien avant, ce qui suit le chiffre se pose sur sa ligne de pied. */
  .parts:not(:has(.avant)) .apres {
    grid-row: 1 / span 2;
    font-weight: var(--poids-fort);
    color: var(--encre);
  }

  .mention {
    margin: 0;
    min-height: 1.6em;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--espace-2);
    font-size: var(--texte-sm);
    color: var(--encre-douce);
  }

  /* L'étiquette du jour courant : une inversion, la même sur les deux écrans
     (bandeau-et-aujourdhui, D3 ; refonte-signaletique, D2). */
  .aujourdhui {
    padding: 0.1rem 0.5rem;
    border-radius: var(--rayon-pastille);
    background: var(--accent);
    color: var(--sur-accent);
    font-weight: var(--poids-fort);
  }
</style>
