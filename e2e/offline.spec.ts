import { expect, test } from '@playwright/test';

/**
 * Le parcours qui décide de la valeur du projet : ouvrir, voir le menu, perdre
 * le réseau, le voir encore. Une application qui échoue ici n'a aucun intérêt
 * face au PDF officiel.
 */
test('le menu reste consultable après la perte du réseau', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const menu = await page.getByRole('heading', { level: 1 }).textContent();

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

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(menu ?? '');
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
