import { expect, hydratee, test, type Page } from './test';

/**
 * La fraîcheur se mesure sur l'appareil (fraicheur-par-appareil).
 *
 * Le manifeste publié date du 17 octobre 2026 ; l'horloge est fixée au 28, onze
 * jours plus tard. L'ancien avertissement, réglé sur l'âge du manifeste, se
 * serait allumé pour tous. Le nouveau ne dépend que du dernier contact de
 * l'appareil avec le serveur.
 */

const MAINTENANT = '2026-10-28T12:00:00+01:00';
// L'ancien texte aussi : un retour de l'avertissement réglé sur le manifeste
// doit faire échouer ces tests.
const avertissement = (page: Page) =>
  page.getByText(/n'a pas pu vérifier les menus|n'ont pas été rafraîchis/);

/**
 * Ouvre l'écran du jour avec un dernier contact donné. `horsLigne` fait échouer
 * la vérification, comme un appareil sans réseau : le contact enregistré reste
 * alors celui qu'on a posé.
 */
async function ouvrir(page: Page, contact: string | null, horsLigne: boolean) {
  await page.clock.install({ time: new Date(MAINTENANT) });
  if (horsLigne) await page.route('**/service-worker.js', (route) => route.abort());
  await page.goto('/');
  await page.evaluate((valeur) => {
    if (valeur === null) localStorage.removeItem('cantine.contact');
    else localStorage.setItem('cantine.contact', valeur);
  }, contact);
  await page.reload();
  await hydratee(page);
}

test('un appareil resté hors ligne plus de sept jours le dit', async ({ page }) => {
  await ouvrir(page, '2026-10-18T09:00:00Z', true);

  await expect(avertissement(page)).toHaveText(/depuis 10 jours/);
  await expect(page.getByRole('link', { name: /page de la Ville/ })).toBeVisible();
});

test('un manifeste ancien n’alerte plus un appareil en contact', async ({ page }) => {
  await ouvrir(page, '2026-10-27T09:00:00Z', true);

  await expect(avertissement(page)).toHaveCount(0);
});

test('sans contact connu, l’application ne prétend rien', async ({ page }) => {
  await ouvrir(page, null, true);

  await expect(avertissement(page)).toHaveCount(0);
});

test('un contact réussi efface l’avertissement', async ({ page }) => {
  // Le service worker répond : la vérification aboutit et date le contact de
  // maintenant, si ancien que soit celui qu'on avait posé (D1).
  await ouvrir(page, '2026-10-01T09:00:00Z', false);

  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('cantine.contact')))
    .toMatch(/^2026-10-28T/);
  await expect(avertissement(page)).toHaveCount(0);
});
