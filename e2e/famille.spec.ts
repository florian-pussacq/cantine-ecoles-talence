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
 * inclassable n'a ni couleur ni nom (finitions-et-plat-inconnu, D1).
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
    const tuile = jour.locator('.tuile');
    const style = (await tuile.getAttribute('style')) ?? '';
    const famille = style.match(/--fam-([a-z]+)/)?.[1];
    if (await tuile.evaluate((el) => el.classList.contains('inconnue'))) {
      expect(famille, `jour ${i} : un inclassable ne porte aucune famille`).toBeUndefined();
      await expect(jour).not.toContainText(/Viande|Volaille|Poisson|Végétarien/);
      continue;
    }
    const nom = NOMS[famille as string];
    expect(nom, `jour ${i} : tuile sans famille`).toBeDefined();
    await expect(jour.locator('.rest').first()).toHaveText(new RegExp(`^${nom}( · |$)`));
  }
});

/**
 * Le plat inclassable : une carte claire cerclée d'encre sur l'écran du jour, et
 * une tuile de même facture sur la semaine, distincte d'un jour sans service
 * (finitions-et-plat-inconnu, D1). Le 3 novembre 2026 sert une croustade
 * limousine, sucrée ou salée selon la cuisine.
 */
test('un plat inclassable ne porte aucune couleur de famille', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-03T10:00:00+01:00') });
  await page.goto('/');
  await hydratee(page);

  const principale = page.locator('.courant .plat.principal');
  await expect(principale).toContainText('Croustade limousine');
  await expect(principale).toHaveClass(/\binconnue\b/);
  await expect(principale.locator('.famille-nom')).toHaveCount(0);
  const [fond, carte, filet] = await principale.evaluate((el) => {
    const s = getComputedStyle(el);
    const sonde = document.createElement('div');
    sonde.style.background = 'var(--carte)';
    document.body.append(sonde);
    const c = getComputedStyle(sonde).backgroundColor;
    sonde.remove();
    return [s.backgroundColor, c, `${s.borderTopWidth} ${s.borderTopStyle}`];
  });
  expect(fond).toBe(carte);
  expect(filet).toBe('2px solid');

  await page.goto('/semaine');
  await hydratee(page);
  const mardi = page.locator('.courant .sheet li').filter({ hasText: 'Croustade limousine' });
  const tuile = mardi.locator('.tuile');
  await expect(tuile).toHaveClass(/\binconnue\b/);
  expect((await tuile.getAttribute('style')) ?? '').not.toContain('--fam-');
  expect(await tuile.evaluate((el) => getComputedStyle(el).borderTopStyle)).toBe('solid');
  await expect(mardi).not.toContainText(/Viande|Volaille|Poisson|Végétarien/);
});
