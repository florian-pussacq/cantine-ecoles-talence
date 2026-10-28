<script lang="ts">
  import { formatDay } from '#lib/menu/labels.js';
  import LienExterne from './LienExterne.svelte';

  /**
   * Ce qui qualifie les données affichées : leur fraîcheur et leur origine.
   *
   * Il reste dans le flux de l'écran qu'il qualifie, et non dans le pied fixe de
   * la coque : celui-ci ne porte que ce qui ne varie pas d'un écran à l'autre, et
   * y loger une date de mise à jour affirmerait sur l'écran des réglages une
   * fraîcheur qui ne concerne que les menus.
   *
   * **Il était recopié trois fois** — écran du jour, écran de la semaine, menu de
   * grève —, avec le même défaut d'alignement trois fois et deux formulations sur
   * trois du repli (design.md, D63). L'écran de la semaine ne repliait pas sur la
   * date, sans raison : c'est la version complète qui est retenue ici.
   */
  let {
    updatedLabel,
    updatedAt,
    pdfUrl
  }: {
    updatedLabel?: string | null;
    updatedAt?: string | null;
    pdfUrl: string;
  } = $props();

  /*
    Trois formulations, de la plus précise à la moins précise. La dernière ne
    ment pas faute de mieux : elle dit l'origine quand la date manque, plutôt que
    d'annoncer une fraîcheur qu'on ignore.
  */
  const mention = $derived(
    updatedLabel ??
      (updatedAt ? `Mis à jour le ${formatDay(updatedAt)}` : 'Source : Ville de Talence')
  );
</script>

<footer>
  <span>{mention}</span>
  <LienExterne href={pdfUrl}>PDF officiel</LienExterne>
</footer>

<style>
  /*
    `align-items: center`, et c'est le correctif (D63).

    Le lien impose 44 pixels à la ligne — sa cible tactile. Sans cette
    déclaration, le `span` s'étire par défaut à cette hauteur et pose son texte
    en haut, tandis que le lien pose le sien au centre : quatorze pixels
    séparaient les deux lignes de base, ce qui se lisait comme un chevauchement.
  */
  footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--espace-2);
    padding: var(--espace-3) var(--espace-2) 0;
    /* Filet décoratif : il ne délimite aucune commande et ne porte aucune
       information, donc WCAG 1.4.11 ne lui applique pas de seuil (D27). */
    border-top: 1px solid var(--bord);
    color: var(--encre-douce);
    font-size: var(--texte-xs);
  }

  footer :global(a) {
    color: var(--encre);
    font-weight: var(--poids-fort);
    /* Cible tactile : un lien isolé doit être atteignable au pouce. */
    min-height: var(--cible);
    display: inline-flex;
    align-items: center;
  }
</style>
