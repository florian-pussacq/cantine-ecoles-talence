import { expect, test, type Page } from './test';

/**
 * Le jour férié, sur le 11 novembre 2026 réel (jours-feries).
 *
 * Les données sont cuites au pré-rendu : on ne peut pas leur substituer un jeu
 * d'essai depuis le navigateur. L'horloge est donc fixée sur le seul férié en
 * semaine du corpus publié. Le jour où novembre 2026 quitte le corpus, ce
 * fichier tombe avec lui, et c'est voulu : il doit alors suivre le férié
 * suivant, pas se taire.
 */

const designation = (page: Page) => page.locator('nav .designation');
const mention = (page: Page) => page.locator('nav .mention');
const jourSuivant = (page: Page) =>
  page.locator('nav[aria-label="Navigation entre les jours"] button').nth(1);

/** Midi le 11 novembre, à l'heure d'hiver. */
const FERIE = new Date('2026-11-11T12:00:00+01:00');

test("ouvert un jour férié, l'écran dit pourquoi il montre le lendemain", async ({ page }) => {
  await page.clock.install({ time: FERIE });
  await page.goto('/');

  await expect(mention(page)).toHaveText('Férié · service demain');
  await expect(designation(page)).toContainText('12');
});

test('la semaine nomme le férié, sans le rendre actionnable', async ({ page }) => {
  await page.clock.install({ time: FERIE });
  await page.goto('/semaine');

  const ferie = page.locator('li', { hasText: 'Jour férié' });
  await expect(ferie).toHaveCount(1);
  await expect(ferie.getByRole('button')).toHaveCount(0);
  // Les quatre autres jours de la semaine sont servis, donc actionnables.
  await expect(page.locator('li button')).toHaveCount(4);
});

test('la navigation enjambe le férié', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-10T12:00:00+01:00') });
  await page.goto('/');

  await expect(designation(page)).toContainText('10');
  await jourSuivant(page).click();
  await expect(designation(page)).toContainText('12');
});
