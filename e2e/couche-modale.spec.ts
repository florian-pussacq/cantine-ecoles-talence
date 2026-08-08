import { expect, test, type Page } from '@playwright/test';

/**
 * Ce que `<dialog>` promet, et que jsdom ne peut pas vérifier.
 *
 * La simulation de `vitest-setup.ts` ne reproduit que la machine à états
 * ouvert/fermé : le piège de focus, sa restitution, l'inertie de l'arrière-plan
 * et l'échappement sont exactement les garanties pour lesquelles l'élément natif
 * a été choisi (design.md, D16). Elles ne se constatent que dans un navigateur.
 */

/** Ouvre le détail du plat principal et rend le bouton qui l'a ouvert. */
async function ouvrirLeDetail(page: Page) {
  const cellule = page.locator('.tray .main button');
  await cellule.click();
  await expect(page.locator('dialog')).toBeVisible();
  return cellule;
}

test('le focus ne quitte pas la couche ouverte', async ({ page }) => {
  await page.goto('/');
  await ouvrirLeDetail(page);

  // Assez de tabulations pour faire plusieurs fois le tour du contenu : si le
  // parcours s'échappait, il atteindrait le plateau resté derrière.
  //
  // `document.body` est toléré, et ce n'est pas un relâchement : au point de
  // bouclage d'un dialogue modal, Chromium repasse par le point de départ de la
  // navigation séquentielle avant de revenir au premier élément de la couche.
  // Le corps du document n'est pas interactif — ce que ce test interdit, c'est
  // qu'une commande située derrière devienne atteignable.
  for (let pas = 0; pas < 12; pas++) {
    await page.keyboard.press('Tab');
    const dehors = await page.evaluate(() => {
      const actif = document.activeElement;
      if (actif === null || actif === document.body) return null;
      return actif.closest('dialog') === null ? actif.outerHTML.slice(0, 80) : null;
    });
    expect(dehors, `le focus a atteint un élément situé derrière la couche`).toBeNull();
  }
});

test('le focus revient sur la cellule qui a ouvert la couche', async ({ page }) => {
  await page.goto('/');
  const cellule = await ouvrirLeDetail(page);

  await page.getByRole('button', { name: 'Fermer' }).click();
  await expect(page.locator('dialog')).toHaveCount(0);

  // Et non au début du document : reprendre sa lecture ne doit pas coûter une
  // traversée complète de l'écran au clavier.
  await expect(cellule).toBeFocused();
});

test('le contenu situé derrière ne défile pas', async ({ page }) => {
  await page.goto('/');

  // Le geste, et non `window.scrollTo` : `overflow: hidden` empêche l'utilisateur
  // de défiler, pas un script de le faire — seul `overflow: clip` interdirait les
  // deux. Mesurer avec l'API mesurerait ce que le verrou n'a jamais promis.
  const defilerALaMolette = () => page.mouse.wheel(0, 300);

  // Le test ne vaut que si la page défile réellement : on l'établit avant
  // d'ouvrir, sinon l'assertion suivante serait vraie pour la mauvaise raison.
  await defilerALaMolette();
  await expect
    .poll(() => page.evaluate(() => window.scrollY), {
      message: 'la page ne défile pas : ce test ne prouverait rien'
    })
    .toBeGreaterThan(0);

  await ouvrirLeDetail(page);
  const fige = await page.evaluate(() => window.scrollY);

  await defilerALaMolette();
  expect(await page.evaluate(() => window.scrollY)).toBe(fige);
});

test("l'ouverture de la couche ne fait pas remonter la page", async ({ page }) => {
  // Poser le verrou de défilement ne doit pas ramener au début du document :
  // on rouvrirait sur un écran qui a bougé pendant qu'on ne regardait pas.
  await page.goto('/');
  await page.mouse.wheel(0, 300);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  const avant = await page.evaluate(() => window.scrollY);

  // `click()` ferait défiler la cellule dans la vue avant de cliquer, ce qui
  // déplacerait la page pour une raison étrangère au verrou et rendrait la
  // mesure ininterprétable — d'autant que cet écran n'offre qu'une quarantaine
  // de pixels de course. L'événement est donc envoyé sans repositionnement.
  await page.locator('.tray .main button').dispatchEvent('click');
  await expect(page.locator('dialog')).toBeVisible();

  expect(await page.evaluate(() => window.scrollY)).toBe(avant);
});

test('les commandes de navigation entre jours sont sans effet couche ouverte', async ({ page }) => {
  await page.goto('/');
  const titre = page.getByRole('heading', { level: 1 });
  const initial = await titre.textContent();

  await ouvrirLeDetail(page);

  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowLeft');
  await expect(titre).toHaveText(initial ?? '');
});

test("la touche d'échappement referme la couche", async ({ page }) => {
  await page.goto('/');
  await ouvrirLeDetail(page);

  await page.keyboard.press('Escape');
  await expect(page.locator('dialog')).toHaveCount(0);
});

test('une action hors du contenu referme la couche', async ({ page }) => {
  await page.goto('/');
  await ouvrirLeDetail(page);

  // Le coin supérieur gauche : la feuille est ancrée en bas sur ce profil, donc
  // ce point appartient forcément à `::backdrop`.
  await page.mouse.click(5, 5);
  await expect(page.locator('dialog')).toHaveCount(0);
});
