import { expect, hydratee, test, type Page } from './test';

/**
 * L'apparence suit le système (mode-sombre).
 *
 * La bascule tient dans une requête de média, sans script : la palette sombre
 * doit donc s'appliquer avant l'application, et même sans elle (D1).
 */

const FOND_CLAIR = 'rgb(244, 236, 221)';
const FOND_SOMBRE = 'rgb(27, 23, 18)';

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
