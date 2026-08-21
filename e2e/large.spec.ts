import { expect, test, type Page } from '@playwright/test';

/**
 * La mise en page, sur les deux profils.
 *
 * Ce fichier tourne aussi bien sur téléphone que sur écran de bureau : les
 * exigences sont les mêmes, seules les valeurs attendues dépendent de la
 * largeur. C'est ce qui permet de vérifier qu'il n'y a bien qu'une structure et
 * non deux (design.md, D23).
 */

const PALIER = 760;

function largeurCoque(page: Page) {
  return page.evaluate(() => document.querySelector('.shell')?.getBoundingClientRect().width ?? 0);
}

test('la colonne de contenu reste bornée', async ({ page }, infos) => {
  await page.goto('/');
  const fenetre = infos.project.use.viewport?.width ?? 0;
  const coque = await largeurCoque(page);

  expect(coque).toBeGreaterThan(0);
  expect(coque, 'la colonne s’étire sur toute la largeur').toBeLessThanOrEqual(720);
  if (fenetre >= PALIER) {
    expect(coque, 'la colonne n’a pas grandi sur écran large').toBeGreaterThan(520);
  }
});

test('la page ne défile jamais horizontalement', async ({ page }) => {
  for (const ecran of ['/', '/semaine', '/reglages', '/a-propos']) {
    await page.goto(ecran);
    const debordement = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(debordement, `${ecran} déborde horizontalement`).toBeLessThanOrEqual(0);
  }
});

test('la structure est la même quelle que soit la largeur', async ({ page }) => {
  // Les mêmes éléments dans le même ordre : c'est la promesse de D23, et ce que
  // trahirait l'apparition d'une seconde mise en page.
  //
  // L'ordre est lu dans le document entier et non parmi les seuls enfants
  // directs de la coque. La profondeur d'imbrication n'est portée par aucune
  // exigence : envelopper un élément pour lui donner une animation ne change
  // pas la structure de l'écran, et un test qui échouerait là-dessus mesurerait
  // la façon d'écrire le balisage plutôt que ce que l'écran présente.
  //
  // La coque commence désormais par l'en-tête : la barre d'écrans n'y est plus,
  // elle est ancrée à la fenêtre et vérifiée par `barre.spec.ts`.
  await page.goto('/');
  const ordre = await page.evaluate(() =>
    [...document.querySelectorAll('.shell nav, .shell header, .shell footer')].map((n) =>
      n.tagName.toLowerCase()
    )
  );
  expect(ordre[0]).toBe('header');
  expect(ordre, 'la navigation entre jours a disparu de la colonne').toContain('nav');
  expect(ordre.at(-1)).toBe('footer');
});

test("l'ouverture de la couche modale ne décale pas le contenu", async ({ page }) => {
  // Sur un écran à barre de défilement classique, poser `overflow: hidden`
  // supprime la barre et déplace tout le contenu de sa largeur. Le saut est
  // invisible au développeur qui teste sur un téléphone.
  await page.goto('/');
  const avant = await page.evaluate(
    () => document.querySelector('.shell')?.getBoundingClientRect().left ?? 0
  );

  await page.locator('.cible').click();
  await expect(page.locator('dialog')).toBeVisible();

  const apres = await page.evaluate(
    () => document.querySelector('.shell')?.getBoundingClientRect().left ?? 0
  );
  expect(Math.abs(apres - avant), 'le contenu a sauté au verrouillage du défilement').toBeLessThan(
    1
  );
});
