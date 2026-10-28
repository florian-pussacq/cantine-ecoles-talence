import { expect, test } from './test';

/**
 * Le parcours qui décide de la valeur du projet : ouvrir, voir le menu, perdre
 * le réseau, le voir encore. Une application qui échoue ici n'a aucun intérêt
 * face au PDF officiel.
 */
test('le menu reste consultable après la perte du réseau', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const menu = await page.locator('nav .designation').textContent();

  // Attendre que le service worker contrôle la page, sans quoi le hors-ligne
  // testerait seulement le cache HTTP du navigateur.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller === null) {
      await new Promise((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })
      );
    }
  });

  await context.setOffline(true);
  await page.reload();

  await expect(page.locator('nav .designation')).toHaveText(menu ?? '');
  await expect(page.getByText('Une première connexion est nécessaire')).toHaveCount(0);
});

test('la semaine reste consultable hors ligne', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller === null) {
      await new Promise((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })
      );
    }
  });

  await context.setOffline(true);
  await page.getByRole('link', { name: 'Semaine' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.sheet li')).toHaveCount(5);
});

/**
 * Les polices sont servies par l'application et précachées avec elle
 * (refonte-signaletique, D4). Hors ligne, le texte doit encore être dessiné
 * dans la police de l'application, et non dans son repli : un repli ne serait
 * pas une panne, mais il dirait que le cache a oublié un fichier.
 */
test('les polices viennent de l’application, et restent là hors ligne', async ({
  page,
  context,
  baseURL
}) => {
  const origine = new URL(baseURL ?? 'http://localhost:4173').host;
  const tiers: string[] = [];
  page.on('request', (requete) => {
    const url = new URL(requete.url());
    if (url.protocol.startsWith('http') && url.host !== origine) tiers.push(requete.url());
  });

  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller === null) {
      await new Promise((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })
      );
    }
  });

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const chargees = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts]
      .filter((police) => police.status === 'loaded')
      .map((police) => police.family.replace(/["']/g, ''));
  });
  expect(chargees).toContain('Funnel Sans');
  expect(tiers).toEqual([]);
});
