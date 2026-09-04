import { expect, test } from '@playwright/test';

/**
 * Le menu de grève : consultable, jamais au premier plan.
 *
 * La contrainte centrale n'est pas qu'il s'affiche — c'est qu'il ne s'affiche
 * pas tout seul. L'application ne dispose d'aucune source lui disant qu'une
 * grève a lieu ; un menu de repli poussé sur l'écran du jour affirmerait un fait
 * que personne n'a vérifié. Le premier test de ce fichier est donc un test
 * d'absence, et c'est le plus important.
 */

test('aucun chemin ne mène au menu de grève depuis les écrans du quotidien', async ({ page }) => {
  for (const ecran of ['/', '/semaine']) {
    await page.goto(ecran);
    await expect(page.getByRole('link', { name: /grève/i })).toHaveCount(0);
    await expect(page.getByText(/grève/i)).toHaveCount(0);
  }
});

test('les réglages y mènent, en une action', async ({ page }) => {
  await page.goto('/reglages');
  await page.getByRole('link', { name: /Menu de grève/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Menu de grève' })).toBeVisible();
});

test("la sortie de l'écran ramène aux réglages, d'où l'on vient", async ({ page }) => {
  /*
    Elle ne saute pas par-dessus l'écran d'origine (D62). Le menu de grève ne
    s'atteint que par les réglages : une sortie qui mènerait au menu ferait
    perdre la place à qui parcourt les réglages, et contredirait la lecture
    « remonter d'un cran » que sa position dans l'en-tête impose.
  */
  await page.goto('/reglages');
  await page.getByRole('link', { name: /Menu de grève/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Menu de grève' })).toBeVisible();

  await page.getByRole('link', { name: 'Retour aux réglages' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Réglages' })).toBeVisible();
});

test("l'écran énonce que l'application ne sait pas s'il y a grève", async ({ page }) => {
  // Sans cette phrase, l'écran se lirait comme une annonce. C'est une garantie
  // de véracité, pas une formule de politesse.
  await page.goto('/greve');
  await expect(page.getByText(/ne sait pas s'il y a grève/)).toBeVisible();
});

test('les cinq jours de la semaine sont portés', async ({ page }) => {
  await page.goto('/greve');
  for (const jour of ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']) {
    await expect(page.getByRole('heading', { level: 2, name: jour })).toBeVisible();
  }
});

test('la variante change les plats affichés', async ({ page }) => {
  await page.goto('/greve');

  const chauds = page.getByRole('button', { name: 'Repas chauds' });
  const froids = page.getByRole('button', { name: 'Repas froids' });

  await expect(chauds).toHaveAttribute('aria-pressed', 'true');
  // Les chips n'existent que du côté froid : c'est le témoin le plus net que la
  // bascule change réellement de tableau, et non seulement d'étiquette.
  await expect(page.getByText('Chips')).toHaveCount(0);

  await froids.click();
  await expect(froids).toHaveAttribute('aria-pressed', 'true');
  await expect(chauds).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByText('Chips').first()).toBeVisible();
});

test('le menu de grève reste consultable après la perte du réseau', async ({ page, context }) => {
  await page.goto('/greve');
  await expect(page.getByRole('heading', { level: 2, name: 'Lundi' })).toBeVisible();

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

  await expect(page.getByRole('heading', { level: 2, name: 'Lundi' })).toBeVisible();
  await expect(page.getByText("n'a pas pu être chargé")).toHaveCount(0);
});
