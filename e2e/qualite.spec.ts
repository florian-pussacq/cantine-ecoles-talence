import { expect, test, type Page } from '@playwright/test';

const ECRANS = ['/', '/semaine', '/reglages', '/a-propos'] as const;

/**
 * Aucune requête ne doit sortir vers un autre domaine.
 *
 * C'est une promesse tenue à l'utilisateur sur l'écran À propos, donc une
 * promesse à vérifier plutôt qu'à répéter. Une police, une image ou un script
 * ajoutés distraitement la briseraient sans bruit.
 */
test('aucune requête vers un domaine tiers', async ({ page, baseURL }) => {
  const etrangeres: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin !== new URL(baseURL ?? '').origin && url.protocol !== 'data:') {
      etrangeres.push(request.url());
    }
  });

  for (const ecran of ECRANS) {
    await page.goto(ecran, { waitUntil: 'networkidle' });
  }

  expect(etrangeres).toEqual([]);
});

test('aucun cookie déposé', async ({ page, context }) => {
  for (const ecran of ECRANS) await page.goto(ecran);
  expect(await context.cookies()).toEqual([]);
});

async function verifierAccessibilite(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');

  // Un seul titre de niveau 1 par écran, qui dit de quoi l'écran parle.
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

  // Toute cible actionnable isolée doit être atteignable au pouce.
  //
  // Les liens au fil d'une phrase en sont exclus : WCAG les exempte
  // explicitement (« inline exception »), parce que les agrandir casserait
  // l'interlignage du paragraphe qui les porte.
  //
  // Une case à cocher enveloppée d'un `label` est mesurée sur le label : c'est
  // lui qui reçoit le tap, la case seule ne dit pas la taille réelle de la cible.
  const cibles = page.locator(
    'button:visible, label:visible, a:visible:not(p a):not(li a):not(span a), input:visible:not(label input)'
  );
  for (let i = 0; i < (await cibles.count()); i += 1) {
    const cible = cibles.nth(i);
    const boite = await cible.boundingBox();
    if (boite === null) continue;
    expect(boite.height, await cible.innerText()).toBeGreaterThanOrEqual(44);
  }
}

for (const ecran of ECRANS) {
  test(`l'écran ${ecran} respecte les bases d'accessibilité`, async ({ page }) => {
    await page.goto(ecran);
    await verifierAccessibilite(page);
  });
}

test('la navigation au clavier atteint et actionne les commandes de jour', async ({ page }) => {
  await page.goto('/');
  const titreInitial = await page.locator('nav .designation').textContent();

  // Les flèches déplacent d'un jour servi à l'autre.
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('nav .designation')).not.toHaveText(titreInitial ?? '');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('nav .designation')).toHaveText(titreInitial ?? '');

  // La tabulation atteint les commandes, et le focus est visible.
  const suivant = page.locator('nav[aria-label="Navigation entre les jours"] button').last();
  await suivant.focus();
  await expect(suivant).toBeFocused();
  const contour = await suivant.evaluate((node) => getComputedStyle(node).outlineStyle);
  expect(contour).not.toBe('none');

  await page.keyboard.press('Enter');
  await expect(page.locator('nav .designation')).not.toHaveText(titreInitial ?? '');
});

test("l'onglet courant est annoncé aux technologies d'assistance", async ({ page }) => {
  await page.goto('/semaine');
  const actif = page.locator('nav[aria-label="Écrans"] a[aria-current="page"]');
  await expect(actif).toHaveCount(1);
  await expect(actif).toHaveText('Semaine');
});

test('le menu du jour est peint rapidement', async ({ page }) => {
  // Une première visite réchauffe le serveur de prévisualisation : sans elle, la
  // mesure porte surtout sur son démarrage à froid.
  await page.goto('/', { waitUntil: 'load' });
  await page.goto('/', { waitUntil: 'load' });

  const lcp = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        new PerformanceObserver((liste) => {
          const entrees = liste.getEntries();
          resolve(entrees[entrees.length - 1]?.startTime ?? 0);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        setTimeout(() => resolve(0), 3000);
      })
  );

  // Le budget du PRD est de 1 s en 4G sur un mobile milieu de gamme. Ce test ne
  // le vérifie pas : il tourne sans bridage réseau ni processeur, et le chiffre
  // qu'il obtient n'est donc pas comparable. Le seuil retenu est celui du
  // « bon » LCP au sens des Web Vitals, ce qui en fait un détecteur de
  // régression grossière — un composant lourd introduit par mégarde — et non une
  // preuve que l'objectif est tenu. Celle-ci demande un appareil réel (12.4).
  expect(lcp).toBeLessThan(2500);
});
