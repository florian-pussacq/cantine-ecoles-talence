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

/**
 * Le choix d'apparence des réglages (choix-d-apparence).
 *
 * Par défaut, l'appareil décide ; un choix imposé l'emporte sur lui, survit au
 * rechargement, et s'applique avant l'application, comme le suivi du système.
 */
const choisir = async (page: Page, nom: string) => {
  await page.goto('/reglages');
  await hydratee(page);
  await page.getByRole('radio', { name: nom, exact: true }).check();
};

test('par défaut, les réglages suivent l’appareil', async ({ page }) => {
  await page.goto('/reglages');
  await hydratee(page);

  await expect(page.getByRole('radio', { name: /Comme l’appareil/ })).toBeChecked();
});

test('le sombre choisi l’emporte sur un système en clair, et survit au rechargement', async ({
  page
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await choisir(page, 'Sombre');
  expect(await fondDePage(page)).toBe(FOND_SOMBRE);

  // Le choix est peint avant l'application : même sans son JavaScript.
  await page.route('**/_app/**/*.js', (route) => route.abort());
  await page.goto('/');
  expect(await fondDePage(page)).toBe(FOND_SOMBRE);
  await expect(page.locator('meta[name="theme-color"][media="all"]')).toHaveAttribute(
    'content',
    '#111412'
  );
});

test('le clair choisi l’emporte sur un système en sombre', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await choisir(page, 'Clair');
  expect(await fondDePage(page)).toBe(FOND_CLAIR);

  await page.reload();
  expect(await fondDePage(page)).toBe(FOND_CLAIR);
});

test('rendre la main à l’appareil le fait suivre à nouveau', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await choisir(page, 'Clair');
  await page.getByRole('radio', { name: /Comme l’appareil/ }).check();
  expect(await fondDePage(page)).toBe(FOND_SOMBRE);

  await page.emulateMedia({ colorScheme: 'light' });
  expect(await fondDePage(page)).toBe(FOND_CLAIR);

  await page.reload();
  await hydratee(page);
  await expect(page.getByRole('radio', { name: /Comme l’appareil/ })).toBeChecked();
});
