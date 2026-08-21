import { expect, test, type Page } from '@playwright/test';

/**
 * Ce que ce change existe pour obtenir, mesuré plutôt que jugé.
 *
 * L'écran du jour débordait de sa fenêtre : 1 016 pixels de page pour 839 de
 * fenêtre sur le profil mobile, dont 470 pour le seul plateau. Le plat principal
 * — la raison d'être de l'application — se lisait après avoir défilé.
 *
 * Le test est écrit **avant** la mise en page, et c'est délibéré : écrit après,
 * il aurait mesuré ce qu'on avait obtenu au lieu de viser ce qu'on voulait.
 *
 * Il ne porte que sur le profil mobile. L'exigence parle de la fenêtre d'un
 * téléphone, et un écran de bureau n'en est pas un — sa colonne est plus large,
 * ses libellés tiennent sur moins de lignes, et sa fenêtre est plus basse. Le
 * cas est différent, pas plus permissif ; il est consigné comme question
 * ouverte plutôt que traité ici par analogie.
 */

/**
 * La ligne de flottaison n'est pas le bas de la fenêtre.
 *
 * La barre de navigation est ancrée au bas et opaque : le contenu défile
 * derrière elle. Ce qui passe dessous n'est pas visible, même s'il est
 * techniquement dans la fenêtre. Le haut de la barre est donc la limite réelle,
 * et c'est un défaut que la seule hauteur de page ne montrait pas.
 */
async function flottaison(page: Page): Promise<number> {
  const barre = await page.locator('.barre').boundingBox();
  if (barre === null) throw new Error('barre de navigation introuvable');
  return barre.y;
}

/** Le bas d'un élément, ou `null` s'il n'est pas rendu. */
async function bas(page: Page, selecteur: string): Promise<number | null> {
  const boite = await page.locator(selecteur).boundingBox();
  return boite === null ? null : boite.y + boite.height;
}

/**
 * Le premier jour complet du jeu de données, atteint par la commande de jour
 * suivant depuis l'ouverture.
 *
 * Il est choisi dans les données réelles et non fabriqué : un jour construit
 * pour le test mesurerait une mise en page que personne ne voit. Sa complétude
 * est vérifiée avant la mesure, de sorte qu'un jeu de données renouvelé fasse
 * échouer le test sur une cause lisible plutôt que sur une hauteur flatteuse
 * obtenue sur un jour incomplet.
 */
const ROLES = ['Entrée', 'Plat', 'Accompagnement', 'Laitage', 'Dessert', 'Pain'] as const;

test('la journée complète tient dans la fenêtre du téléphone', async ({ page }) => {
  await page.goto('/');

  const suivant = page.locator('nav[aria-label="Navigation entre les jours"] button').nth(1);
  await suivant.click();

  // Le jour atteint doit porter tous ses rôles et un goûter, sans quoi la
  // mesure ne dit rien du cas le plus chargé.
  const menu = page.locator('.tray');
  for (const role of ROLES) {
    await expect(
      menu.getByText(role, { exact: true }),
      `le jour mesuré doit porter le rôle « ${role} »`
    ).toBeVisible();
  }
  await expect(page.locator('.snack'), 'le jour mesuré doit porter un goûter').toBeVisible();

  const limite = await flottaison(page);
  const fenetre = page.viewportSize();

  const ATTENDUS: { quoi: string; selecteur: string }[] = [
    { quoi: 'la date affichée', selecteur: 'header h1' },
    { quoi: 'le déjeuner entier', selecteur: '.tray' },
    { quoi: 'le goûter', selecteur: '.snack' },
    { quoi: 'les commandes de jour', selecteur: 'nav[aria-label="Navigation entre les jours"]' }
  ];

  const dépassements: string[] = [];
  for (const { quoi, selecteur } of ATTENDUS) {
    const fin = await bas(page, selecteur);
    if (fin === null) {
      dépassements.push(`${quoi} : absent de la page`);
      continue;
    }
    if (fin > limite) dépassements.push(`${quoi} : finit à ${Math.round(fin)} px`);
  }

  const page_ = await page.evaluate(() => document.documentElement.scrollHeight);

  expect(
    dépassements,
    [
      `fenêtre ${fenetre?.width} × ${fenetre?.height} px, ligne de flottaison à ${Math.round(limite)} px`,
      `hauteur de page : ${page_} px`,
      // Deux mesures de départ, parce qu'une seule induit en erreur. La page
      // débordait de 191 px, mais le pied de page en représentait l'essentiel
      // et l'exigence l'y autorise. Ce que ce test constatait vraiment est plus
      // modeste et plus précis : les commandes de jour finissaient à 809 px
      // pour une flottaison à 783, soit 26 px sous la barre.
      'mesure de départ : page 1 030 px, commandes de jour à 809 px pour une flottaison à 783 px',
      'ce qui dépasse :'
    ].join('\n')
  ).toEqual([]);
});

/**
 * Le pied de page a le droit d'être sous la ligne de flottaison.
 *
 * L'exigence l'y autorise explicitement — il porte une source et deux liens que
 * l'on consulte rarement — et ce test le dit, pour qu'une mise en page future ne
 * dépense pas de hauteur à le faire remonter.
 */
test('le pied de page peut rester sous la ligne de flottaison', async ({ page }) => {
  await page.goto('/');
  const pied = await bas(page, '.about');
  expect(pied).not.toBeNull();
});
