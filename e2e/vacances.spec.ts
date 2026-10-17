import { STORAGE_KEY } from '../src/lib/filter/storage.js';
import { expect, hydratee, test, type Page } from './test';

/**
 * Les menus de vacances, sur la Toussaint 2026 réelle (menus-vacances,
 * allergenes-non-communiques).
 *
 * La Toussaint ne précise pas ses allergènes : c'est le seul document du corpus
 * qui le fasse, et ces tests en dépendent. Le pré-rendu est daté du 2 septembre :
 * chaque page est périmée, d'où l'attente de l'hydratation.
 */

const designation = (page: Page) => page.locator('nav .designation');

async function ouvrir(page: Page, instant: string, chemin = '/') {
  await page.clock.install({ time: new Date(instant) });
  await page.goto(chemin);
  await hydratee(page);
}

test('un jour de vacances se nomme et dit qu’il ne précise pas ses allergènes', async ({
  page
}) => {
  await ouvrir(page, '2026-10-20T12:00:00+02:00');

  await expect(designation(page)).toHaveText('Mardi 20 octobre');
  await expect(page.getByText('Vacances de Toussaint')).toBeVisible();
  await expect(page.getByText('Ce menu ne précise pas les allergènes de ses plats.')).toBeVisible();
});

test('la veille des vacances, l’écran présente le premier jour servi des vacances', async ({
  page
}) => {
  await ouvrir(page, '2026-10-17T12:00:00+02:00');

  await expect(designation(page)).toHaveText('Lundi 19 octobre');
  await expect(page.getByText('Vacances de Toussaint')).toBeVisible();
});

test('avec un filtre actif, l’écran dit qu’il ne peut rien signaler', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-21T12:00:00+02:00') });
  await page.goto('/');
  await page.evaluate(
    ([cle]) => localStorage.setItem(cle as string, JSON.stringify([7])),
    [STORAGE_KEY]
  );
  await page.reload();
  await hydratee(page);

  // Le 21 octobre sert des lasagnes et un fromage blanc : sans codes, le filtre
  // se tairait.
  await expect(
    page.getByText(/ceux que vous surveillez ne peuvent pas être signalés/)
  ).toBeVisible();
});

test('la fiche du jour ne présente aucun plat comme sans allergène déclaré', async ({ page }) => {
  await ouvrir(page, '2026-10-21T12:00:00+02:00');
  await page.locator('.cible').click();

  const fiche = page.locator('dialog');
  await expect(fiche).toBeVisible();
  await expect(fiche.getByText('Allergènes non communiqués').first()).toBeVisible();
  await expect(fiche.getByText('Aucun allergène déclaré')).toHaveCount(0);
});

test('la semaine des vacances marque chaque jour', async ({ page }) => {
  await ouvrir(page, '2026-10-20T12:00:00+02:00', '/semaine');

  await expect(page.locator('li', { hasText: 'Vacances de Toussaint' })).toHaveCount(5);
  await expect(page.locator('li', { hasText: 'Allergènes non précisés' })).toHaveCount(5);
});
