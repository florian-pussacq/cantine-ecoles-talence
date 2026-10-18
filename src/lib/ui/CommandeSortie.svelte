<script lang="ts">
  import { resolve } from '$app/paths';

  /**
   * La sortie d'un écran secondaire, dans l'en-tête (design.md, D62).
   *
   * **Ce n'est pas `CommandeRetour`, et les deux ne fusionnent pas.** Elles ont
   * longtemps partagé un nom, un dessin et un emplacement, ce qui a masqué
   * qu'elles ne font pas le même travail :
   *
   * - `CommandeRetour` ramène au jour du repère, sur les écrans de menu. Elle
   *   dépend du contenu, apparaît et disparaît avec lui, et son libellé se
   *   calcule (D45). D55 l'a placée après les cartes, où son arrivée ne pousse
   *   rien de déjà lu — et elle y reste.
   * - celle-ci quitte un écran. Elle est permanente, son libellé est constant
   *   pour l'écran qui la porte, et elle ne dépend de rien d'autre que de lui.
   *
   * Elle occupe l'emplacement de la roue crantée, que les écrans secondaires
   * n'affichent pas : on y vient pour lire, on en repart, et la seule commande
   * utile est celle qui fait repartir.
   *
   * **Elle nomme sa destination plutôt que de porter une flèche nue.** Le coin
   * opposé est déjà un retour au menu — l'enseigne est un lien —, et deux
   * chemins muets vers la même destination sur la même ligne ne se
   * distingueraient pas. En nommant où elle va, elle dit ce que l'enseigne ne
   * dit pas, et sur le menu de grève elle va ailleurs qu'elle.
   *
   * C'est un lien et non un bouton : la destination est fixe et connue, donc
   * tout ce qu'un navigateur sait faire d'un lien reste vrai ici.
   *
   * `libelle` est le nom accessible, complet ; `nom` est le texte visible, qu'il
   * contient — ce qu'exige WCAG 2.5.3.
   */
  let {
    vers,
    nom,
    libelle
  }: {
    /** Littérale, et non `string` : `resolve` n'accepte que des routes connues. */
    vers: '/' | '/reglages';
    nom: string;
    libelle: string;
  } = $props();
</script>

<a class="sortie" href={resolve(vers)} aria-label={libelle}>
  <span aria-hidden="true">↩</span>
  {nom}
</a>

<style>
  /*
    Une pilule bordée, et non l'aplat d'accent de `CommandeRetour`.

    Elle vit sur la ligne de l'enseigne, au-dessus de tout le contenu : un aplat
    coloré y pèserait plus que ce qu'elle commande. La forme est celle des
    flèches du rang de navigation, pour la même raison qu'elles l'ont — une
    commande secondaire, délimitée, qui ne réclame pas le regard.
  */
  .sortie {
    flex: none;
    min-height: var(--cible);
    display: inline-flex;
    align-items: center;
    gap: var(--espace-1);
    padding-inline: var(--espace-3);
    font-size: var(--texte-sm);
    font-weight: var(--poids-fort);
    color: var(--encre);
    background: var(--carte);
    /* Une bordure qui délimite une commande porte une information et tient donc
       3:1 (WCAG 1.4.11). L'encre à 55 % mesure 3,46:1 sur le fond crème, taux
       déjà mesuré par `contrast.test.ts` pour les flèches (D27, D49). */
    border: 1px solid var(--voile-trait);
    border-radius: var(--rayon-pilule);
    text-decoration: none;
    white-space: nowrap;
  }
</style>
