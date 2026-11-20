import { expect, hydratee, test, type Page } from './test';
import { STORAGE_KEY } from '../src/lib/filter/storage.js';

/**
 * Le sommaire des réglages et l'écran des allergènes (sommaire-des-reglages).
 *
 * Les réglages tiennent dans le premier écran, l'apparence en tête ; les
 * allergènes y sont résumés en une ligne qui redit l'état vu sur la roue, et
 * mène à leur propre écran.
 */

async function surveiller(page: Page, codes: number[]) {
  await page.goto('/reglages');
  await page.evaluate(([cle, valeur]) => localStorage.setItem(cle, valeur), [
    STORAGE_KEY,
    JSON.stringify(codes)
  ] as const);
  await page.reload();
  await hydratee(page);
}

function entreeAllergenes(page: Page) {
  return page.getByRole('link', { name: /^Allergènes/ });
}

test('le sommaire présente l’apparence, puis les allergènes, les menus et l’application', async ({
  page
}) => {
  await page.goto('/reglages');
  await expect(page.locator('.shell h2')).toHaveText([
    'Apparence',
    'Allergènes',
    'Menus',
    'Application'
  ]);
});

test('le sommaire tient dans le premier écran d’un téléphone', async ({ page }, infos) => {
  test.skip(infos.project.name !== 'mobile', 'l’exigence porte sur la fenêtre d’un téléphone');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/reglages');
  await hydratee(page);
  await page.evaluate(() => document.fonts.ready);

  const lien = page.getByRole('link', { name: /Source, mentions et vie privée/ });
  const boite = await lien.boundingBox();
  expect(boite!.y + boite!.height, 'la dernière entrée passe sous le pli').toBeLessThanOrEqual(844);
});

test('l’apparence se règle sur place, sans quitter le sommaire', async ({ page }) => {
  await page.goto('/reglages');
  await hydratee(page);

  const groupe = page.getByRole('radiogroup', { name: 'Apparence' });
  await expect(groupe.getByRole('radio')).toHaveCount(3);
  await groupe.getByRole('radio', { name: 'Sombre', exact: true }).check();
  await expect(page.locator('html')).toHaveAttribute('data-apparence', 'sombre');
  await expect(page).toHaveURL(/\/reglages\/?$/);
});

test('sans sélection, l’entrée des allergènes le dit, sans compte', async ({ page }) => {
  await page.goto('/reglages');
  await hydratee(page);

  const entree = entreeAllergenes(page);
  await expect(entree).toContainText('Aucun allergène surveillé');
  await expect(entree.locator('.compte')).toHaveCount(0);
});

test('l’entrée des allergènes nomme la sélection et redit le compte de la roue', async ({
  page
}) => {
  await surveiller(page, [7, 5]);

  const entree = entreeAllergenes(page);
  await expect(entree).toContainText('Arachides et Lait');
  await expect(entree.locator('.compte')).toHaveText('2');
  await expect(entree).toHaveAccessibleName(/2 allergènes surveillés/);
});

test('de la roue aux cases : les réglages, puis l’écran des allergènes', async ({ page }) => {
  await surveiller(page, [1, 7, 9]);
  await page.goto('/');
  await hydratee(page);

  await page.getByRole('link', { name: 'Réglages — 3 allergènes surveillés' }).click();
  await expect(page).toHaveURL(/\/reglages\/?$/);

  await entreeAllergenes(page).click();
  await expect(page).toHaveURL(/\/reglages\/allergenes\/?$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Allergènes' })).toBeVisible();
});

test('l’écran des allergènes porte les quatorze cases, puis l’avertissement', async ({ page }) => {
  await page.goto('/reglages/allergenes');
  await hydratee(page);

  const cases = page.getByRole('checkbox');
  await expect(cases).toHaveCount(14);

  const avertissement = page.getByText('Seul le document officiel de la Ville fait foi.');
  const derniere = await cases.last().boundingBox();
  const texte = await avertissement.boundingBox();
  expect(texte!.y, 'l’avertissement doit suivre les cases').toBeGreaterThan(derniere!.y);
});

test('cocher sur l’écran des allergènes se retrouve dans le sommaire', async ({ page }) => {
  await page.goto('/reglages/allergenes');
  await hydratee(page);
  await page.getByRole('checkbox', { name: 'Lait' }).check();

  await page.getByRole('link', { name: 'Retour aux réglages' }).click();
  await expect(entreeAllergenes(page)).toContainText('Lait');
  await expect(entreeAllergenes(page).locator('.compte')).toHaveText('1');
});
