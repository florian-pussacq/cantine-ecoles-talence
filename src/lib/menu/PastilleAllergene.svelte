<script lang="ts">
  import { allergenIcon } from '../illustrations/allergens.js';

  /**
   * Le signalement d'un allergène de la sélection.
   *
   * Le signalement ne repose jamais sur la seule couleur : pictogramme, contour
   * appuyé et libellé en toutes lettres. Il reste perceptible en niveaux de gris
   * et se lit correctement à voix haute.
   *
   * Il prend la surface de l'alerte, le jaune de la signalisation sous une encre
   * noire (refonte-signaletique, D9) : un allergène surveillé dans un plat
   * compromet ce repas pour cet enfant, ce qui est le sens même de l'alerte. Le
   * jaune se détache mal d'un fond clair ; le contour d'encre, lui, se détache
   * de tout, l'aplat d'une famille compris.
   */
  let {
    names,
    codes = [],
    compact = false,
    count = null
  }: { names: string[]; codes?: number[]; compact?: boolean; count?: number | null } = $props();

  /*
    Un pictogramme par allergène signalé, dans l'ordre où le texte les nomme, et
    trois au plus (pictogrammes-allergenes, D1, D2). Au-delà, le dessin
    deviendrait une frise ; le texte, lui, continue de tout nommer, et c'est lui
    qui fait foi. Sans code, la pastille garde le pictogramme de repli : elle
    reste marquée.
  */
  const PICTOGRAMMES_MAX = 3;
  const icones = $derived(
    (codes.length > 0 ? codes.slice(0, PICTOGRAMMES_MAX) : [0]).map(
      (code) => `#${allergenIcon(code)}`
    )
  );
  /*
    Sur la semaine, le nombre de plats concernés compte plus que la liste des
    allergènes : à Talence, presque chaque jour contient du lait, si bien qu'une
    étiquette identique cinq jours de suite ne dirait rien. « 2 plats » et
    « 5 plats » se distinguent d'un coup d'œil.
  */
  const text = $derived(
    count !== null
      ? `${count} plat${count > 1 ? 's' : ''} · ${names.join(', ')}`
      : compact
        ? names.join(', ')
        : `Contient${names.length > 1 ? ' :' : ''} ${names.join(', ').toLowerCase()}`
  );
</script>

<span class="chip" class:compact>
  <span class="pictos">
    {#each icones as icone, i (i)}
      <svg
        width={compact ? 13 : 15}
        height={compact ? 13 : 15}
        aria-hidden="true"
        focusable="false"
      >
        <use href={icone} />
      </svg>
    {/each}
  </span>
  <span>{text}</span>
</span>

<style>
  /*
    Le texte coule après les pictogrammes, au lieu de tenir dans une colonne à
    côté d'eux : quand il passe à la ligne, la suite reprend toute la largeur de
    la pastille (pictogrammes-allergenes, D2). En colonne, trois pictogrammes
    faisaient d'un signalement de deux lignes un signalement de trois.

    D'où le rayon de pastille et non de pilule, et un retrait égal des deux
    côtés : la seconde ligne commence au bord gauche, qu'un arrondi de pilule
    mordrait.
  */
  .chip {
    display: inline-block;
    align-self: flex-start;
    background: var(--alerte);
    border: 2px solid var(--sur-alerte);
    border-radius: var(--rayon-pastille);
    padding: 0.12rem 0.4rem;
    font-size: var(--texte-xs);
    font-weight: var(--poids-fort);
    color: var(--sur-alerte);
    line-height: 1.3;
  }

  .chip.compact {
    border-width: 2px;
    font-size: var(--texte-2xs);
    padding: 0.06rem 0.32rem;
  }

  /* Les pictogrammes restent groupés : ils se lisent ensemble, avant le texte. */
  .pictos {
    display: inline-flex;
    gap: 1px;
    vertical-align: middle;
    margin-right: 0.28rem;
  }

  svg {
    display: block;
    flex: none;
  }
</style>
