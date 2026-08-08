import { expect, test, type Page } from '@playwright/test';

/**
 * Le choix de thème, éprouvé là où il se joue.
 *
 * Le clignotement au chargement d'un site prérendu ne se voit pas en jsdom :
 * il naît de l'ordre entre l'arrivée du HTML, l'exécution du script en ligne et
 * la première peinture (design.md, D21).
 */

/** La couleur de fond effectivement peinte par le document. */
function fond(page: Page) {
  return page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
}

async function choisir(page: Page, libelle: string) {
  await page.goto('/reglages');
  await page.getByRole('radio', { name: libelle }).check();
}

test('le thème choisi survit au rechargement', async ({ page }) => {
  await choisir(page, 'Sombre');
  const sombre = await fond(page);

  await page.reload();
  expect(await fond(page)).toBe(sombre);
  await expect(page.getByRole('radio', { name: 'Sombre' })).toBeChecked();
});

test('un thème forcé l’emporte sur la préférence du système', async ({ browser }) => {
  // Système en clair, application en sombre : c'est le cas où une bascule mal
  // écrite laisse gagner la requête de média.
  const contexte = await browser.newContext({ colorScheme: 'light' });
  const page = await contexte.newPage();

  await choisir(page, 'Sombre');
  const force = await fond(page);

  await choisir(page, 'Comme mon système');
  const systeme = await fond(page);

  expect(force).not.toBe(systeme);
  await contexte.close();
});

test('le suivi du système reprend la main quand il est rétabli', async ({ browser }) => {
  const contexte = await browser.newContext({ colorScheme: 'dark' });
  const page = await contexte.newPage();

  await choisir(page, 'Clair');
  const clairForce = await fond(page);

  await choisir(page, 'Comme mon système');
  await page.reload();
  const suitLeSysteme = await fond(page);

  expect(suitLeSysteme).not.toBe(clairForce);
  await contexte.close();
});

test('aucun clignotement : la première peinture est déjà dans le bon thème', async ({
  browser
}) => {
  // Système en clair, thème sombre choisi. Sans le script en ligne, le document
  // arriverait clair puis basculerait — c'est exactement ce qui est interdit.
  const contexte = await browser.newContext({ colorScheme: 'light' });
  const page = await contexte.newPage();
  await choisir(page, 'Sombre');
  const attendu = await fond(page);

  // L'application est empêchée de se charger : seul le script en ligne de
  // `app.html` s'exécute. Attendre l'hydratation, comme le faisait la première
  // version de ce test, aurait mesuré le store et non la première peinture —
  // le test restait vert avec le script neutralisé.
  // Le filtre ne vise que le JavaScript : `_app/immutable/**` emporterait aussi
  // la feuille de style, et le document n'aurait plus aucune couleur à peindre.
  await page.route('**/_app/immutable/**/*.js', (route) => route.abort());
  await page.goto('/');
  expect(await fond(page)).toBe(attendu);
  expect(await page.getAttribute('html', 'data-theme')).toBe('dark');

  await contexte.close();
});

test('la couleur annoncée au navigateur suit le thème forcé', async ({ browser }) => {
  const contexte = await browser.newContext({ colorScheme: 'light' });
  const page = await contexte.newPage();
  await choisir(page, 'Sombre');

  const actives = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"][data-teinte]')]
      .filter((meta) => meta.media === 'all')
      .map((meta) => meta.dataset.teinte)
  );
  expect(actives).toEqual(['dark']);

  await contexte.close();
});
