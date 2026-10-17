import { STORAGE_KEY } from '../src/lib/filter/storage.js';
import { expect, hydratee, test, type Page } from './test';

/**
 * La fiche du jour met en avant ce que le parent surveille
 * (alerte-et-fiche-cochee, D4).
 *
 * Le filtre est posé dans le stockage local avant le rechargement, comme le
 * laisserait une visite précédente aux réglages.
 */

async function ouvrirFiche(page: Page, codes: number[], instant?: string) {
  if (instant !== undefined) await page.clock.install({ time: new Date(instant) });
  await page.goto('/');
  await page.evaluate(
    ([cle, valeur]) => localStorage.setItem(cle as string, valeur as string),
    [STORAGE_KEY, JSON.stringify(codes)]
  );
  await page.reload();
  await hydratee(page);
  await page.locator('.cible').click();

  const fiche = page.locator('dialog');
  await expect(fiche).toBeVisible();
  return fiche;
}

test('avec gluten et lait surveillés, la fiche s’ouvre sur leur résumé', async ({ page }) => {
  const fiche = await ouvrirFiche(page, [1, 7]);

  const resume = fiche.locator('.resume');
  await expect(resume.getByRole('heading', { name: 'Allergènes surveillés' })).toBeVisible();
  await expect(resume.locator('li')).toHaveCount(2);
  await expect(resume.locator('li').first()).toContainText('Gluten');
  await expect(resume.locator('li').last()).toContainText('Lait');

  // Dans chaque plat, un allergène surveillé ouvre la liste et le dit en toutes lettres.
  const premiers = fiche.locator('.allergens li:first-child.surveille');
  await expect(premiers.first()).toContainText('surveillé');
});

test('sans allergène surveillé, la fiche n’a pas de résumé', async ({ page }) => {
  const fiche = await ouvrirFiche(page, []);
  await expect(fiche.locator('.resume')).toHaveCount(0);
  await expect(fiche.getByText('surveillé')).toHaveCount(0);
});

test('un jour de Toussaint, la fiche dit ce qu’elle ne peut pas vérifier', async ({ page }) => {
  const fiche = await ouvrirFiche(page, [7], '2026-10-21T12:00:00+02:00');

  await expect(fiche.locator('.resume')).toHaveCount(0);
  const alerte = fiche.locator('.non-precise');
  await expect(alerte).toContainText('impossible de vérifier Lait');
  await expect(alerte.getByRole('link', { name: /PDF officiel/ })).toBeVisible();
});
