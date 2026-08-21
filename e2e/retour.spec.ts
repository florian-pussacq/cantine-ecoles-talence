import { expect, test, type Page } from '@playwright/test';

/**
 * Le retour au repère, et ce qui l'entoure (design.md, D44 à D47).
 *
 * Deux choses se vérifient ici et nulle part ailleurs. Que la commande
 * apparaisse et disparaisse au bon moment, ce qui dépend d'un état partagé entre
 * deux écrans. Et que l'en-tête ne grandisse pas en le faisant — la moitié du
 * travail de D44 est une réserve de place, et une réserve de place ne se teste
 * qu'en mesurant.
 *
 * L'expiration du choix, elle, n'est pas ici : c'est une fonction pure, et elle
 * s'éprouve à l'unité dans `selection.svelte.test.ts` en passant deux jours
 * civils différents. Ce qui ne se teste qu'ici est ce qui dépend du navigateur.
 */

const enTete = (page: Page) => page.locator('header').filter({ has: page.locator('h1') });
const retour = (page: Page) => enTete(page).getByRole('button');
const jourSuivant = (page: Page) =>
  page.locator('nav[aria-label="Navigation entre les jours"] button').nth(1);

test("aucune commande de retour tant que l'on n'a rien choisi", async ({ page }) => {
  // À l'ouverture, le jour affiché est celui que le système a résolu : il n'y a
  // nulle part où revenir, et la mention fait son travail.
  await page.goto('/');
  await expect(retour(page)).toHaveCount(0);
});

test('la commande apparaît dès que l’on s’écarte, et ramène en une action', async ({ page }) => {
  await page.goto('/');
  const titre = page.getByRole('heading', { level: 1 });
  const depart = await titre.textContent();

  await jourSuivant(page).click();
  await jourSuivant(page).click();
  await expect(titre).not.toHaveText(depart ?? '');

  const commande = retour(page);
  await expect(commande).toBeVisible();

  await commande.click();
  await expect(titre).toHaveText(depart ?? '');
  // Elle disparaît en même temps qu'elle devient inutile.
  await expect(retour(page)).toHaveCount(0);
});

test("la commande ne dit «·Aujourd'hui·» que si le repère est bien aujourd'hui", async ({
  page
}) => {
  // Le repère n'est aujourd'hui que si aujourd'hui est servi. Week-ends et
  // vacances scolaires réunis, ce n'est pas le cas environ quarante pour cent
  // des jours de l'année — d'où un libellé qui suit la cible (D45).
  await page.goto('/');
  const mention = await enTete(page).locator('.quand').textContent();

  await jourSuivant(page).click();
  const libelle = (await retour(page).textContent())?.trim() ?? '';

  if (mention?.includes("Aujourd'hui")) {
    expect(libelle).toContain("Aujourd'hui");
  } else {
    expect(libelle).not.toContain("Aujourd'hui");
  }
});

test("l'en-tête ne change pas de hauteur quand la commande prend la place", async ({ page }) => {
  // Sans réserve, l'en-tête grandirait au premier balayage — le temps qu'une
  // mention de treize pixels cède la place à une cible tactile — et rétrécirait
  // au retour, faisant sauter tout l'écran deux fois (D44).
  await page.goto('/');
  const avant = await enTete(page).boundingBox();

  await jourSuivant(page).click();
  await expect(retour(page)).toBeVisible();
  const pendant = await enTete(page).boundingBox();

  expect(avant).not.toBeNull();
  expect(pendant).not.toBeNull();
  expect(Math.round(pendant?.height ?? 0)).toBe(Math.round(avant?.height ?? 0));
});

test('la commande ne se replie pas, même sur la date la plus longue', async ({ page }) => {
  // Le cas qui a fait déplacer la commande sur sa propre ligne.
  //
  // À côté du titre, « Mercredi 30 septembre » et « ↩ Prochain service »
  // occupaient 383 pixels sur 388 : cinq pixels de marge, et un repli garanti
  // sur toute plateforme dont la police est un peu plus large. Un bouton qui se
  // replie fait passer l'en-tête de 47 à 78 pixels — précisément le saut que la
  // réserve existe pour empêcher.
  await page.goto('/');
  const titre = page.getByRole('heading', { level: 1 });

  for (let pas = 0; pas < 30; pas++) {
    if ((await titre.textContent())?.includes('Mercredi 30 septembre')) break;
    await jourSuivant(page).click();
  }
  await expect(titre).toContainText('Mercredi 30 septembre');

  const commande = retour(page);
  await expect(commande).toHaveText(/Prochain service/);

  // Le titre sur sa ligne, la commande sur la sienne, et rien qui déborde.
  const boiteTitre = await titre.boundingBox();
  const boiteCommande = await commande.boundingBox();
  expect(boiteCommande?.y ?? 0).toBeGreaterThanOrEqual(
    (boiteTitre?.y ?? 0) + (boiteTitre?.height ?? 0)
  );
  expect((boiteCommande?.x ?? 0) + (boiteCommande?.width ?? 0)).toBeLessThanOrEqual(
    page.viewportSize()?.width ?? 0
  );
});

test('la commande est atteignable au clavier', async ({ page }) => {
  await page.goto('/');
  await jourSuivant(page).click();
  const commande = retour(page);
  await expect(commande).toBeVisible();

  // La tabulation, et non `focus()` : le contour de `:focus-visible` dépend de
  // l'heuristique du navigateur, qui distingue un focus donné au clavier d'un
  // focus posé par script. Mesurer le second reviendrait à tester cette
  // heuristique plutôt que la commande.
  for (
    let pas = 0;
    pas < 12 && !(await commande.evaluate((el) => el === document.activeElement));
    pas++
  ) {
    await page.keyboard.press('Tab');
  }
  await expect(commande).toBeFocused();

  const contour = await commande.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(contour, 'la commande focalisée au clavier doit porter un contour visible').not.toBe(
    'none'
  );
});

test("l'écran de la semaine offre le même retour", async ({ page }) => {
  await page.goto('/semaine');
  await expect(retour(page)).toHaveCount(0);

  const titre = page.getByRole('heading', { level: 1 });
  const depart = await titre.textContent();

  await page.getByRole('button', { name: /Semaine suivante/ }).click();
  await expect(titre).not.toHaveText(depart ?? '');

  const commande = retour(page);
  await expect(commande).toBeVisible();
  // Une semaine ne se nomme pas comme un jour : « Demain » n'y voudrait rien dire.
  await expect(commande).not.toHaveText(/Demain/);

  await commande.click();
  await expect(titre).toHaveText(depart ?? '');
});

test('le jour consulté se partage entre les deux écrans, et la barre ne le remet pas à zéro', async ({
  page
}) => {
  // D48 : le partage est délibéré — c'est lui qui fait qu'ouvrir un jour depuis
  // la semaine ouvre *ce* jour. Un onglet qui réinitialiserait casserait la
  // moitié du contrat pour réparer une gêne qui a sa propre commande.
  await page.goto('/');
  await jourSuivant(page).click();
  const ecarte = await page.getByRole('heading', { level: 1 }).textContent();

  await page.getByRole('link', { name: 'Semaine' }).click();
  await page.getByRole('link', { name: 'Jour' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(ecarte ?? '');
});
