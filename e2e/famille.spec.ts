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

/**
 * Sur la semaine, la famille se lit sans la couleur (refonte-signaletique,
 * D10) : la tuile la dit par sa teinte, le résumé la dit par son nom. Un plat
 * inclassable a la couleur de repli, et aucun nom.
 */
test('la semaine écrit la famille de chaque jour servi', async ({ page }) => {
  const NOMS: Record<string, string> = {
    viande: 'Viande',
    volaille: 'Volaille',
    poisson: 'Poisson',
    vegetarien: 'Végétarien'
  };

  await page.goto('/semaine');
  await hydratee(page);

  const jours = page.locator('.courant .sheet li button');
  await expect(jours.first()).toBeVisible();
  const total = await jours.count();
  expect(total).toBeGreaterThan(0);

  for (let i = 0; i < total; i++) {
    const jour = jours.nth(i);
    const style = (await jour.locator('.tuile').getAttribute('style')) ?? '';
    const famille = style.match(/--fam-([a-z]+)/)?.[1];
    expect(famille, `jour ${i} : tuile sans famille`).toBeDefined();
    const nom = NOMS[famille as string];
    const resume = jour.locator('.rest').first();
    if (nom) await expect(resume).toHaveText(new RegExp(`^${nom}( · |$)`));
    else await expect(jour).not.toContainText(/Viande|Volaille|Poisson|Végétarien/);
  }
});
