import { expect, hydratee, test } from './test';

/**
 * Un seul code couleur : la famille du plat principal (couleur-par-famille).
 *
 * L'instant par défaut, le 2 septembre 2026, sert un tajine de veau.
 */

test('le plat principal nomme sa famille, et lui seul', async ({ page }) => {
  await page.goto('/');
  await hydratee(page);

  const principale = page.locator('.plat.principal');
  await expect(principale.locator('.famille-nom')).toHaveText('Viande');
  // Les autres cartes n'en portent aucune : la couleur ne dit plus le rôle.
  await expect(page.locator('.plat:not(.principal) .famille-nom')).toHaveCount(0);
  await expect(page.locator('.plat.famille')).toHaveCount(1);
});
