import { expect, test } from './test';

// Le parcours complet « ouvrir → voir aujourd'hui → hors ligne → toujours visible »
// est écrit au groupe de tâches 11. Ce test garde la chaîne de bout en bout vivante
// dès maintenant, pour qu'elle ne casse pas en silence.
test("l'application se charge et déclare sa langue", async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
