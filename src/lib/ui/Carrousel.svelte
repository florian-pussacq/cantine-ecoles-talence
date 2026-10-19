<script lang="ts" generics="K extends string">
  import { untrack, type Snippet } from 'svelte';
  import { createBalayage, type Issue } from './balayage.js';

  /**
   * Le carrousel des jours et des semaines (carrousel-des-jours).
   *
   * Le contenu suit le doigt, le voisin arrive sur le bord, et le relâchement
   * pose le voisin ou ramène le contenu (D1). La décision vit dans
   * `createBalayage`, qui ne connaît pas le DOM ; ce composant ne fait
   * qu'appliquer un décalage.
   *
   * **Les voisins n'existent que pendant le mouvement** (D2). Au repos, le
   * document ne contient que le contenu présenté : le lecteur d'écran, le focus
   * et les tests ne voient qu'un jour.
   *
   * **Le jour se pose avant l'animation** (D3). L'issue appelle `aller`
   * aussitôt ; quand la clé change, la piste repart de là où le nouveau
   * contenu se trouvait sous le doigt — ou du bord, après une flèche (D4) — et
   * glisse jusqu'à sa place. Une seule logique pour toutes les causes.
   *
   * Les clés sont des dates AAAA-MM-JJ : leur ordre alphabétique est leur
   * ordre chronologique, et dit le sens du mouvement.
   */
  let {
    cle,
    precedent,
    suivant,
    aller,
    panneau
  }: {
    cle: K;
    precedent: K | null;
    suivant: K | null;
    aller: (cle: K) => void;
    panneau: Snippet<[K]>;
  } = $props();

  let surface: HTMLDivElement | undefined = $state();
  /** Le décalage de la piste, en pixels. */
  let decalage = $state(0);
  /** La piste glisse vers sa place, au lieu de suivre le doigt. */
  let anime = $state(false);
  /** Les voisins sont rendus : pendant un geste et la course qui le suit. */
  let voisinsRendus = $state(false);
  /** Le décalage de départ du prochain mouvement, quand un geste vient d'aboutir. */
  let depuisLeGeste: number | null = null;

  const largeur = () => surface?.clientWidth ?? 0;

  const mouvementReduit = () =>
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function poser() {
    anime = false;
    decalage = 0;
    voisinsRendus = false;
  }

  /** Lance la piste vers sa place, depuis la position déjà peinte. */
  function glisserEnPlace() {
    // Deux images : la première peint le départ, la seconde la cible, pour que
    // le navigateur ait une transition à jouer entre les deux.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        anime = true;
        decalage = 0;
      })
    );
  }

  const balayage = createBalayage({
    largeur,
    voisins: () => ({ precedent: precedent !== null, suivant: suivant !== null }),
    onSuivi(d) {
      // La main bouge le contenu, y compris en mouvement réduit (D6).
      voisinsRendus = true;
      anime = false;
      decalage = d;
    },
    onIssue(issue: Issue) {
      if (issue === 'suivant' && suivant !== null) {
        depuisLeGeste = decalage + largeur();
        aller(suivant);
      } else if (issue === 'precedent' && precedent !== null) {
        depuisLeGeste = decalage - largeur();
        aller(precedent);
      } else if (mouvementReduit()) {
        poser();
      } else {
        anime = true;
        decalage = 0;
      }
    }
  });

  /*
    Le changement de clé, quelle qu'en soit la cause : geste, flèche, clavier,
    commande de retour. Avant la mise à jour du DOM, pour que le nouveau
    contenu soit peint d'emblée à sa position de départ, sans éclair à sa place.
  */
  let derniere: K = untrack(() => cle);
  $effect.pre(() => {
    const nouvelle = cle;
    if (nouvelle === derniere) return;
    const sens = nouvelle > derniere ? 1 : -1;
    derniere = nouvelle;
    const depart = depuisLeGeste ?? sens * largeur();
    depuisLeGeste = null;

    // On change de repas : il se lit depuis le début (D5).
    if (surface !== undefined && surface.getBoundingClientRect().top < 0) {
      window.scrollTo({ top: 0 });
    }

    // Sans course à faire, aucune transition ne partirait, et rien ne
    // retirerait les voisins : on pose.
    if (mouvementReduit() || largeur() === 0 || depart === 0) {
      poser();
      return;
    }
    anime = false;
    voisinsRendus = true;
    decalage = depart;
    glisserEnPlace();
  });

  /** La course est finie, ou interrompue : dans les deux cas, on pose. */
  function finCourse(event: TransitionEvent) {
    if (event.target !== event.currentTarget || decalage !== 0) return;
    poser();
  }
</script>

<!--
  La surface reste la même d'un jour à l'autre : elle porte les gestionnaires et
  la capture du pointeur, et la recréer pendant qu'un doigt la touche tuerait le
  geste en cours.
-->
<div class="carrousel" bind:this={surface} {...balayage}>
  <div
    class="piste"
    class:anime
    style:transform={decalage === 0 ? undefined : `translate3d(${decalage}px, 0, 0)`}
    ontransitionend={finCourse}
    ontransitioncancel={finCourse}
  >
    {#if voisinsRendus && precedent !== null}
      <div class="voisin avant" inert aria-hidden="true">{@render panneau(precedent)}</div>
    {/if}
    <div class="courant">{@render panneau(cle)}</div>
    {#if voisinsRendus && suivant !== null}
      <div class="voisin apres" inert aria-hidden="true">{@render panneau(suivant)}</div>
    {/if}
  </div>
</div>

<style>
  .carrousel {
    /*
      `pan-y` rend le défilement vertical au navigateur et garde l'horizontal
      pour le carrousel. Sans cette ligne, le navigateur revendique le
      mouvement, émet `pointercancel`, et le geste meurt sans que rien ne le
      signale — c'est la panne constatée en D18.
    */
    touch-action: pan-y;
    /* Les voisins sont posés hors champ, et un voisin plus long que le jour
       courant ne déborde pas sous lui : le carrousel découpe à sa hauteur.
       `clip` découpe sans créer de conteneur de défilement. */
    overflow: clip;

    /*
      L'écart entre deux jours, logé dans les panneaux et non entre eux.

      La surface déborde d'un demi-écart de chaque côté dans la gouttière de la
      page, et chaque panneau le lui rend en marge intérieure : au repos, le
      contenu garde exactement sa place ; en mouvement, deux panneaux voisins
      sont séparés d'un écart entier. La course d'un panneau reste la largeur
      de la surface, et le script n'a rien à savoir de l'écart.

      Le même débord, en hauteur, laisse au contour de focus la place que
      la découpe lui prendrait.
    */
    margin: calc(-1 * var(--espace-2));
    padding-block: var(--espace-2);
  }

  .piste {
    position: relative;
  }

  .courant,
  .voisin {
    padding-inline: var(--espace-2);
  }

  .piste.anime {
    transition: transform var(--glisse) var(--courbe-glisse);
  }

  .voisin {
    position: absolute;
    inset: 0 auto auto 0;
    width: 100%;
  }

  .avant {
    transform: translateX(-100%);
  }

  .apres {
    transform: translateX(100%);
  }
</style>
