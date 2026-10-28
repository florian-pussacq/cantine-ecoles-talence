import { expect, hydratee, test, type Page } from './test';

/**
 * L'apparence suit le système (mode-sombre).
 *
 * La bascule tient dans une requête de média, sans script : la palette sombre
 * doit donc s'appliquer avant l'application, et même sans elle (D1).
 */

const FOND_CLAIR = 'rgb(242, 243, 240)';
const FOND_SOMBRE = 'rgb(17, 20, 18)';
const ENCRE_SOMBRE = 'rgb(237, 239, 234)';

const fondDePage = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test('un système en sombre reçoit la palette sombre', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await hydratee(page);

  expect(await fondDePage(page)).toBe(FOND_SOMBRE);
});

test('un système en clair reçoit la palette claire', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await hydratee(page);

  expect(await fondDePage(page)).toBe(FOND_CLAIR);
});

test('la palette sombre ne dépend pas du JavaScript de l’application', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.route('**/_app/**/*.js', (route) => route.abort());
  await page.goto('/');

  expect(await fondDePage(page)).toBe(FOND_SOMBRE);
});

/**
 * La sélection de texte appartient à la palette, et non au navigateur
 * (refonte-signaletique, D12) : dans le sombre, elle est l'encre claire sous le
 * fond sombre, et non le bleu par défaut.
 */
test('la sélection prend les couleurs de la palette sombre', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await hydratee(page);

  const selection = await page.evaluate(() => {
    const style = getComputedStyle(document.body, '::selection');
    return { fond: style.backgroundColor, texte: style.color };
  });
  expect(selection).toEqual({ fond: ENCRE_SOMBRE, texte: FOND_SOMBRE });
});
