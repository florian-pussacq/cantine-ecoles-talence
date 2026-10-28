import { auRepos, expect, test, type Page } from './test';

/**
 * La garantie affaiblie, et pourquoi elle l'est (design.md, D53).
 *
 * Ce fichier exigeait que la journée entière tienne dans la fenêtre d'un
 * téléphone, au-dessus de la barre : 1 016 pixels de page pour 839 de fenêtre,
 * c'était le défaut que `hierarchie-du-jour` avait été écrit pour corriger.
 *
 * Sept rôles rendus en cartes ne tiennent pas. Le défilement est désormais
 * l'usage normal de l'écran, et l'exigence est tombée avec la mise en page
 * qu'elle décrivait.
 *
 * **Elle est remplacée, non supprimée.** Un test effacé ne laisse aucune trace
 * de ce qu'il garantissait ; un test affaibli le dit. Ce qui survit est le
 * noyau utile : on ouvre l'application pour savoir ce qui est servi, et cette
 * réponse ne doit pas demander un geste. La première carte est entièrement
 * visible d'emblée, et le rang qui porte la date aussi.
 *
 * Il ne porte que sur le profil mobile. L'exigence parle de la fenêtre d'un
 * téléphone, et un écran de bureau n'en est pas un.
 */

/**
 * La ligne de flottaison n'est pas le bas de la fenêtre.
 *
 * La barre des écrans est ancrée au bas et opaque : le contenu défile derrière
 * elle (refonte-signaletique, D11). Ce qui passe dessous n'est pas visible, même
 * s'il est techniquement dans la fenêtre. Le haut de la barre est donc la limite
 * réelle, et c'est un défaut que la seule hauteur de page ne montrait pas.
 */
async function flottaison(page: Page): Promise<number> {
  const barre = await page.getByRole('navigation', { name: 'Écrans' }).boundingBox();
  if (barre === null) throw new Error('barre des écrans introuvable');
  return barre.y;
}

/** Le bas d'un élément, ou `null` s'il n'est pas rendu. */
async function bas(page: Page, selecteur: string): Promise<number | null> {
  const boite = await page.locator(selecteur).boundingBox();
  return boite === null ? null : boite.y + boite.height;
}

const ROLES = ['Entrée', 'Plat', 'Accompagnement', 'Laitage', 'Dessert', 'Pain'] as const;

test('la première carte est entièrement visible sans défiler', async ({ page }) => {
  await page.goto('/');

  const suivant = page.locator('nav[aria-label="Navigation entre les jours"] button').nth(1);
  await suivant.click();
  await auRepos(page);

  // Le jour atteint doit porter tous ses rôles, sans quoi la mesure ne dit rien
  // du cas le plus chargé. Un jeu de données renouvelé fait ainsi échouer le
  // test sur une cause lisible plutôt que sur une hauteur flatteuse.
  const menu = page.locator('.tray');
  await expect(menu).toBeVisible();
  for (const role of ROLES) {
    await expect(menu.locator('.role', { hasText: new RegExp(`^${role}$`) })).toHaveCount(1);
  }

  const limite = await flottaison(page);

  const premiere = await bas(page, '.tray .carte >> nth=0');
  expect(premiere, 'première carte non rendue').not.toBeNull();
  expect(
    premiere as number,
    'la première carte doit être entièrement lisible sans le moindre geste'
  ).toBeLessThanOrEqual(limite);
});

test('le rang qui porte la date est visible sans défiler', async ({ page }) => {
  await page.goto('/');

  // La date a quitté l'en-tête pour ce rang (D55). Si elle passait sous la
  // ligne de flottaison, l'écran n'annoncerait plus de quel jour il parle —
  // exactement le risque que D15 nomme, un parent lisant lundi pour vendredi.
  const limite = await flottaison(page);
  const rang = await bas(page, 'nav[aria-label="Navigation entre les jours"]');
  expect(rang, 'rang de navigation non rendu').not.toBeNull();
  expect(rang as number).toBeLessThanOrEqual(limite);
});

test('la barre ne recouvre jamais la dernière carte', async ({ page }) => {
  await page.goto('/');

  // Le défilement étant devenu la règle, la dernière carte finit sous la barre
  // si la coque ne lui réserve pas sa hauteur *et* l'encart système (D34, D11).
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);

  const limite = await flottaison(page);
  const derniere = await bas(page, '.tray .carte >> nth=-1');
  expect(derniere, 'dernière carte non rendue').not.toBeNull();
  expect(
    derniere as number,
    'défilement fait, la dernière carte doit être entièrement dégagée de la barre'
  ).toBeLessThanOrEqual(limite);
});
