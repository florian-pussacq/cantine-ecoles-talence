import { expect, hydratee, test } from './test';

/**
 * Un seul « Aujourd'hui » dans l'application (bandeau-et-aujourdhui, D3 et D4).
 *
 * L'instant par défaut est un mercredi servi : le jour même est à l'écran.
 */

test('l’écran du jour porte la pastille le jour même, et la perd ailleurs', async ({ page }) => {
  await page.goto('/');
  await hydratee(page);

  const pastille = page.locator('nav .mention .aujourdhui');
  await expect(pastille).toHaveText("Aujourd'hui");

  await page.getByRole('button', { name: /Jour suivant/ }).click();
  await expect(page.locator('nav .mention')).toHaveText('Demain');
  await expect(pastille).toHaveCount(0);
});

test('la semaine porte la même pastille, sans contour qui ressemble au focus', async ({ page }) => {
  await page.goto('/semaine');
  await hydratee(page);

  const ligne = page.locator('li.today');
  await expect(ligne.locator('.now').first()).toHaveText("Aujourd'hui");

  // Même aplat que la pastille de l'écran du jour.
  const [semaine, jour] = await Promise.all([
    ligne
      .locator('.now')
      .first()
      .evaluate((e) => getComputedStyle(e).backgroundColor),
    page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    )
  ]);
  expect(semaine).toBe(
    `rgb(${[1, 3, 5].map((i) => parseInt(jour.slice(i, i + 2), 16)).join(', ')})`
  );

  const contour = await ligne
    .locator('button, .quiet')
    .first()
    .evaluate((e) => getComputedStyle(e).boxShadow);
  expect(contour).toBe('none');
});
