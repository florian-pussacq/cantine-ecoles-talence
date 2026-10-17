<script lang="ts">
  import { allergenIcon } from '../illustrations/allergens.js';

  /**
   * Le signalement d'un allergène de la sélection.
   *
   * Le signalement ne repose jamais sur la seule couleur : pictogramme, contour
   * appuyé et libellé en toutes lettres. Il reste perceptible en niveaux de gris
   * et se lit correctement à voix haute.
   */
  let {
    names,
    codes = [],
    compact = false,
    count = null
  }: { names: string[]; codes?: number[]; compact?: boolean; count?: number | null } = $props();

  // Le pictogramme est celui du premier allergène cité, choisi par son code.
  const icon = $derived(`#${allergenIcon(codes[0] ?? 0)}`);
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
  <svg width={compact ? 13 : 15} height={compact ? 13 : 15} aria-hidden="true" focusable="false">
    <use href={icon} />
  </svg>
  <span>{text}</span>
</span>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.28rem;
    align-self: flex-start;
    background: var(--chip);
    border: 2px solid var(--ink);
    border-radius: var(--radius-pilule);
    padding: 0.12rem 0.5rem 0.12rem 0.2rem;
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--ink);
    line-height: 1.3;
  }

  .chip.compact {
    border-width: 2px;
    font-size: var(--text-2xs);
    padding: 0.06rem 0.4rem 0.06rem 0.16rem;
  }

  svg {
    display: block;
    flex: none;
  }
</style>
