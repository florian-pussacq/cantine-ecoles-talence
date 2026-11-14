import { expect, hydratee, test } from './test';

/**
 * Un seul « Aujourd'hui » dans l'application (bandeau-et-aujourdhui, D3 et D4).
 *
 * L'instant par défaut est un mercredi servi : le jour même est à l'écran.
 */

test('l’écran du jour porte la pastille le jour même, et la perd ailleurs', async ({ page }) => {
  await page.goto('/');
  await hydratee(page);

  const pastille = page.locator('nav .mention .aujourdhui');
  await expect(pastille).toHaveText("Aujourd'hui");

  await page.getByRole('button', { name: /Jour suivant/ }).click();
  await expect(page.locator('nav .mention')).toHaveText('Demain');
  await expect(pastille).toHaveCount(0);
});

test('la semaine porte la même pastille, sans contour qui ressemble au focus', async ({ page }) => {
  await page.goto('/semaine');
  await hydratee(page);

  const ligne = page.locator('li.today');
  await expect(ligne.locator('.now').first()).toHaveText("Aujourd'hui");

  // Même aplat que la pastille de l'écran du jour.
  const [semaine, jour] = await Promise.all([
    ligne
      .locator('.now')
      .first()
      .evaluate((e) => getComputedStyle(e).backgroundColor),
    page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    )
  ]);
  expect(semaine).toBe(
    `rgb(${[1, 3, 5].map((i) => parseInt(jour.slice(i, i + 2), 16)).join(', ')})`
  );

  const contour = await ligne
    .locator('button, .quiet')
    .first()
    .evaluate((e) => getComputedStyle(e).boxShadow);
  expect(contour).toBe('none');
});

/**
 * L'accompagnement rejoint le plat (accompagnement-dans-le-plat).
 *
 * Le 6 novembre 2026 sert un filet de colin avec une purée de panais à la vanille ;
 * le 5, des ravioli bolognaise, sans accompagnement.
 */
test('l’écran du jour réunit le plat et son accompagnement en un seul intitulé', async ({
  page
}) => {
  await page.clock.install({ time: new Date('2026-11-06T10:00:00+01:00') });
  await page.goto('/');
  await hydratee(page);

  /*
    Le texte brut contient le « avec » que seules les technologies d'assistance
    lisent : l'esperluette se voit, le mot se lit (accompagnement-dans-le-plat, D1).
  */
  const principal = page.locator('.courant .tray .plat.principal');
  await expect(principal.locator('.nom')).toContainText(
    /Filet de colin\s*&\s+avec\s+purée de panais à la vanille/
  );

  // L'accompagnement n'a plus de ligne : il n'est ni dans la colonne des rôles…
  await expect(page.locator('.courant .tray .role', { hasText: 'Accompagnement' })).toHaveCount(0);
  // … ni nommé une seconde fois dans le tableau.
  await expect(
    page.locator('.courant .tray .plat:not(.principal)', { hasText: /purée/i })
  ).toHaveCount(0);
});

test('un plat complet s’affiche seul, sans énoncer d’absence d’accompagnement', async ({
  page
}) => {
  await page.clock.install({ time: new Date('2026-11-05T10:00:00+01:00') });
  await page.goto('/');
  await hydratee(page);

  const principal = page.locator('.courant .tray .plat.principal');
  await expect(principal.locator('.nom')).toHaveText('Ravioli Bolognaise');
  await expect(page.locator('.courant .tray')).not.toContainText(/accompagnement/i);
  // Les autres rôles gardent, eux, leur ligne d'absence.
  await expect(page.locator('.courant .tray .role')).toHaveText([
    'Entrée',
    'Laitage',
    'Dessert',
    'Pain'
  ]);
});

test('la semaine reprend l’intitulé composé, et son résumé ne redit pas l’accompagnement', async ({
  page
}) => {
  await page.clock.install({ time: new Date('2026-11-06T10:00:00+01:00') });
  await page.goto('/semaine');
  await hydratee(page);

  const jour = page.locator('.courant .sheet li', { hasText: 'Filet de colin' });
  await expect(jour.locator('.main')).toContainText(
    /Filet de colin\s*&\s+avec\s+purée de panais à la vanille/
  );
  await expect(jour.locator('.rest').first()).not.toContainText(/purée/i);
});
