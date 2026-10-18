import { expect, hydratee, test, type Page } from './test';

/**
 * Le week-end se nomme, comme le férié (finition-week-end-et-404).
 *
 * Les mensuels ne listent pas le samedi ni le dimanche : c'est le calendrier qui
 * le dit. Le pré-rendu est daté du 2 septembre, d'où l'attente de l'hydratation.
 */

const designation = (page: Page) => page.locator('nav .designation');
const mention = (page: Page) => page.locator('nav .mention');

async function ouvrir(page: Page, instant: string) {
  await page.clock.install({ time: new Date(instant) });
  await page.goto('/');
  await hydratee(page);
}

test('un samedi présente lundi, en disant le week-end', async ({ page }) => {
  await ouvrir(page, '2026-09-05T12:00:00+02:00');

  await expect(designation(page)).toHaveText('Lundi 7 septembre');
  await expect(mention(page)).toHaveText('Week-end · service dans 2 jours');
});

test('un dimanche présente lundi, servi demain', async ({ page }) => {
  await ouvrir(page, '2026-09-06T12:00:00+02:00');

  await expect(designation(page)).toHaveText('Lundi 7 septembre');
  await expect(mention(page)).toHaveText('Week-end · service demain');
});
