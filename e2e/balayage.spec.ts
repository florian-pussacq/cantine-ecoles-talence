import { expect, test, type Page } from '@playwright/test';

/**
 * Le balayage, éprouvé par de vrais événements tactiles.
 *
 * Les tests précédents fabriquaient des événements DOM avec `dispatchEvent`.
 * Ils court-circuitaient l'arbitrage de geste du navigateur — la couche qui
 * décide si un mouvement du doigt appartient à la page ou au document — et
 * restaient donc verts pendant que le geste ne fonctionnait pas au doigt
 * (design.md, D19).
 *
 * Ici les événements sont injectés par le protocole de débogage, au même titre
 * qu'un doigt réel : le navigateur peut les revendiquer pour son propre
 * défilement, et émettre `pointercancel`. C'est précisément ce qu'on veut
 * pouvoir constater.
 */

/** Injecte un glissement du doigt, en plusieurs pas comme un vrai geste. */
async function glisser(
  page: Page,
  {
    de,
    vers,
    pas = 10
  }: { de: { x: number; y: number }; vers: { x: number; y: number }; pas?: number }
) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: de.x, y: de.y }]
  });

  for (let i = 1; i <= pas; i++) {
    const t = i / pas;
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: de.x + (vers.x - de.x) * t, y: de.y + (vers.y - de.y) * t }]
    });
  }

  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

/** Le rectangle de la surface de geste, et son axe médian. */
async function surface(page: Page, selecteur: string) {
  const boite = await page.locator(selecteur).boundingBox();
  if (boite === null) throw new Error(`surface de geste introuvable : ${selecteur}`);
  return { boite, y: boite.y + boite.height / 2 };
}

test.describe('écran du jour', () => {
  test('le balayage horizontal change de jour', async ({ page }) => {
    await page.goto('/');
    const titre = page.locator('nav .designation');
    const initial = await titre.textContent();

    const { boite, y } = await surface(page, '.balayage');

    // Vers la gauche : jour suivant.
    await glisser(page, {
      de: { x: boite.x + boite.width - 20, y },
      vers: { x: boite.x + 20, y }
    });
    await expect(titre).not.toHaveText(initial ?? '');

    // Vers la droite : retour au jour précédent.
    await glisser(page, {
      de: { x: boite.x + 20, y },
      vers: { x: boite.x + boite.width - 20, y }
    });
    await expect(titre).toHaveText(initial ?? '');
  });

  test("le balayage n'ouvre pas le détail de la journée qu'il a touchée", async ({ page }) => {
    // Le geste démarre sur le déjeuner, qui est un bouton : sans précaution, le
    // `click` de fin de course ouvre la feuille par-dessus le jour changé.
    //
    // La surface cliquable a grandi avec D38 — c'est le déjeuner entier, et non
    // plus un compartiment — ce qui rend cette protection plus nécessaire, pas
    // moins : un doigt qui balaie a désormais toutes les chances de partir de là.
    await page.goto('/');
    const { boite } = await surface(page, '.balayage');
    const cible = await page.locator('.cible').boundingBox();
    if (cible === null) throw new Error('cible de la journée introuvable');

    await glisser(page, {
      de: { x: cible.x + cible.width - 20, y: cible.y + cible.height / 2 },
      vers: { x: boite.x + 20, y: cible.y + cible.height / 2 }
    });

    await expect(page.locator('dialog')).toHaveCount(0);
  });

  test('un défilement vertical ne change pas de jour', async ({ page }) => {
    await page.goto('/');
    const titre = page.locator('nav .designation');
    const initial = await titre.textContent();
    const { boite } = await surface(page, '.balayage');

    // Un geste surtout vertical, même s'il dérive de côté, est un défilement.
    await glisser(page, {
      de: { x: boite.x + 60, y: boite.y + 20 },
      vers: { x: boite.x + 160, y: boite.y + 280 }
    });
    await expect(titre).toHaveText(initial ?? '');
  });
});

test.describe('écran de la semaine', () => {
  test('le balayage horizontal change de semaine', async ({ page }) => {
    await page.goto('/semaine');
    const titre = page.locator('nav .designation');
    const initial = await titre.textContent();

    const { boite, y } = await surface(page, '.balayage');

    await glisser(page, {
      de: { x: boite.x + boite.width - 20, y },
      vers: { x: boite.x + 20, y }
    });
    await expect(titre).not.toHaveText(initial ?? '');

    await glisser(page, {
      de: { x: boite.x + 20, y },
      vers: { x: boite.x + boite.width - 20, y }
    });
    await expect(titre).toHaveText(initial ?? '');
  });

  test("le balayage n'ouvre pas le jour qu'il a touché", async ({ page }) => {
    // Une ligne de jour est un bouton qui navigue vers l'écran du jour : sans
    // précaution, le balayage quitterait l'écran de la semaine.
    await page.goto('/semaine');
    const ligne = await page.locator('.sheet li button').first().boundingBox();
    if (ligne === null) throw new Error('ligne de jour introuvable');
    const { boite } = await surface(page, '.balayage');

    await glisser(page, {
      de: { x: ligne.x + ligne.width - 20, y: ligne.y + ligne.height / 2 },
      vers: { x: boite.x + 20, y: ligne.y + ligne.height / 2 }
    });

    await expect(page).toHaveURL(/\/semaine\/?$/);
  });

  test('les commandes de semaine restent le chemin principal', async ({ page }) => {
    await page.goto('/semaine');
    const titre = page.locator('nav .designation');
    const initial = await titre.textContent();

    await page.getByRole('button', { name: /Semaine suivante/ }).click();
    await expect(titre).not.toHaveText(initial ?? '');
    await page.getByRole('button', { name: /Semaine précédente/ }).click();
    await expect(titre).toHaveText(initial ?? '');
  });
});
