<script lang="ts">
  import MarqueQualite from './MarqueQualite.svelte';
  import { accrocher, estMarque } from './labels.js';

  /**
   * Un nom de plat, suivi des pictogrammes de ses mentions (D4).
   *
   * Le dernier mot et les pictogrammes tiennent dans un même `span` insécable : le
   * pictogramme peut emmener son mot à la ligne, mais ne s'y retrouve jamais seul.
   * Le jour, la semaine et la fiche rendent tous leurs noms par ce composant,
   * pour que le pictogramme suive partout le nom qu'il qualifie.
   *
   * Les mentions qui ne sont pas des marques n'en font pas partie : elles
   * s'écrivent en texte, sous le nom (`mentionsEcrites`).
   */
  let {
    texte,
    flags = [],
    taille = 0.8,
    filet = false,
    mot = false
  }: {
    texte: string;
    flags?: readonly string[];
    taille?: number;
    filet?: boolean;
    mot?: boolean;
  } = $props();

  const accroche = $derived(accrocher(texte));
  /* Le blanc qui sépare le début du dernier mot reste dans le texte, que le début soit vide ou non. */
  const debut = $derived(accroche.debut === '' ? '' : `${accroche.debut} `);
  const marques = $derived(flags.filter(estMarque));
</script>

{debut}<span class="accroche"
  >{accroche.dernierMot}{#each marques as marque (marque)}<MarqueQualite
      {marque}
      {taille}
      {filet}
      {mot}
    />{/each}</span
>

<style>
  .accroche {
    white-space: nowrap;
  }
</style>
