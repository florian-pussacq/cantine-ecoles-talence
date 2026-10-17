import { expect, hydratee, test, type Page } from './test';

/**
 * Aucun menu d'un autre jour à la première peinture (jour-au-premier-rendu).
 *
 * Le pré-rendu des tests est fait à `INSTANT_PAR_DEFAUT` (`CANTINE_INSTANT`). Un
 * navigateur réglé sur un autre jour reçoit donc une page périmée, exactement
 * comme un parent qui ouvre l'application installée des semaines après le
 * build — sans rien simuler.
 */

/** Le lendemain du pré-rendu : un jeudi servi. */
const LENDEMAIN = new Date('2026-09-03T10:00:00+02:00');

const designation = (page: Page) => page.locator('nav .designation');

/**
 * Sans le JavaScript de l'application, la page reste telle que le HTML la peint.
 * Seuls les scripts sont bloqués : la feuille de style vit aussi sous `_app/`, et
 * c'est elle qui porte la règle de masquage.
 */
const sansApplication = (page: Page) => page.route('**/_app/**/*.js', (route) => route.abort());

test('une page rendue le jour même se peint entière, application ou non', async ({ page }) => {
  await sansApplication(page);
  await page.goto('/');

  await expect(page.locator('html')).not.toHaveAttribute('data-perime');
  await expect(designation(page)).toBeVisible();
});

test('une page périmée masque le jour, et le rend si l’application ne démarre pas', async ({
  page
}) => {
  await page.clock.install({ time: LENDEMAIN });
  await sansApplication(page);
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('data-perime');
  // Ce qui ne dépend pas du jour reste peint.
  await expect(page.locator('.enseigne')).toBeVisible();
  // Le menu du jour du build est là, mais pas montré.
  await expect(designation(page)).toHaveText('Mercredi 2 septembre');
  await expect(designation(page)).toBeHidden();
  // Filet : au bout de trois secondes, un écran qui nomme son jour vaut mieux
  // qu'un écran vide.
  await expect(designation(page)).toBeVisible({ timeout: 5000 });
});

test('une page périmée montre le jour du navigateur une fois l’application prête', async ({
  page
}) => {
  await page.clock.install({ time: LENDEMAIN });
  await page.goto('/');
  await hydratee(page);

  await expect(designation(page)).toBeVisible();
  await expect(designation(page)).toHaveText('Jeudi 3 septembre');
});

test('la semaine suit la même règle', async ({ page }) => {
  await page.clock.install({ time: LENDEMAIN });
  await sansApplication(page);
  await page.goto('/semaine');

  await expect(designation(page)).toBeHidden();
});
