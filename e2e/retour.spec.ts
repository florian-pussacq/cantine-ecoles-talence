import { expect, test, type Page } from '@playwright/test';

/**
 * Le retour au repère, et ce qui l'entoure (design.md, D44 à D47, D55).
 *
 * Deux choses se vérifient ici et nulle part ailleurs : que la commande
 * apparaisse et disparaisse au bon moment, ce qui dépend d'un état partagé entre
 * deux écrans, et qu'elle reste atteignable au clavier.
 *
 * **Ce que ce fichier ne mesure plus.** D44 avait donné à la mention et à la
 * commande un emplacement unique dans l'en-tête, avec une hauteur réservée pour
 * qu'un balayage ne fasse pas sauter l'écran ; deux tests mesuraient cette
 * réserve. La commande a pris un rang propre sous le contenu (D55) : elle
 * apparaît en fin de flux, où son arrivée ne pousse aucun contenu déjà lu, et
 * il n'y a plus de réserve à mesurer. Le risque que ces tests couvraient a
 * disparu avec la construction qui le créait — ce n'est pas une garantie qu'on
 * abandonne, c'est un défaut qui ne peut plus se produire.
 *
 * L'expiration du choix n'est pas ici : c'est une fonction pure, éprouvée dans
 * `selection.svelte.test.ts`. Ce qui ne se teste qu'ici dépend du navigateur.
 */

/** La commande vit sous le contenu, et elle est la seule de sa classe. */
const retour = (page: Page) => page.locator('button.retour');

/** Le jour affiché se lit dans le rang de navigation, non plus dans le titre. */
const designation = (page: Page) => page.locator('nav .designation');

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
  const jour = designation(page);
  const depart = await jour.textContent();

  await jourSuivant(page).click();
  await jourSuivant(page).click();
  await expect(jour).not.toHaveText(depart ?? '');

  const commande = retour(page);
  await expect(commande).toBeVisible();

  await commande.click();
  await expect(jour).toHaveText(depart ?? '');
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
  const mention = await page.locator('nav .mention').textContent();

  await jourSuivant(page).click();
  const libelle = (await retour(page).textContent())?.trim() ?? '';

  if (mention?.includes("Aujourd'hui")) {
    expect(libelle).toContain("Aujourd'hui");
  } else {
    expect(libelle).not.toContain("Aujourd'hui");
  }
});

test('la commande suit le contenu, elle ne le précède pas', async ({ page }) => {
  // C'est ce qui remplace la réserve de hauteur de D44 : posée après les cartes,
  // son apparition ne peut pas déplacer ce qu'on est en train de lire.
  await page.goto('/');
  await jourSuivant(page).click();

  const commande = retour(page);
  await expect(commande).toBeVisible();

  const cartes = await page.locator('.tray').boundingBox();
  const boite = await commande.boundingBox();
  expect(boite!.y, 'la commande devrait suivre les cartes').toBeGreaterThanOrEqual(
    cartes!.y + cartes!.height
  );
});

test('la commande ne se replie pas, même sur le libellé le plus long', async ({ page }) => {
  /*
    Le libellé le plus long est « Prochain service », et il ne s'obtient pas en
    naviguant : il dépend du repère, donc de la date du jour. Un mercredi servi,
    la commande dit « Aujourd'hui » et le cas long ne se produit jamais — la
    version précédente de ce test l'attendait quand même, et ne le rencontrait
    que les jours où la machine qui l'exécutait tombait juste.

    L'horloge est donc fixée à un samedi : le prochain jour servi est le lundi,
    à deux jours de là, ce qui est exactement la condition sous laquelle
    `targetReturnLabel` renvoie « Prochain service » (D45).
  */
  await page.clock.install({ time: new Date('2026-09-05T10:00:00+02:00') });
  await page.goto('/');

  await jourSuivant(page).click();

  const commande = retour(page);
  await expect(commande).toHaveText(/Prochain service/);

  const boite = await commande.boundingBox();
  // Une seule ligne, et rien qui déborde de la fenêtre.
  expect(boite!.height, 'la commande s’est repliée sur deux lignes').toBeLessThan(72);
  expect(boite!.x + boite!.width).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
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
    pas < 20 && !(await commande.evaluate((el) => el === document.activeElement));
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

  const semaine = designation(page);
  const depart = await semaine.textContent();

  await page.getByRole('button', { name: /Semaine suivante/ }).click();
  await expect(semaine).not.toHaveText(depart ?? '');

  const commande = retour(page);
  await expect(commande).toBeVisible();
  // Une semaine ne se nomme pas comme un jour : « Demain » n'y voudrait rien dire.
  await expect(commande).not.toHaveText(/Demain/);

  await commande.click();
  await expect(semaine).toHaveText(depart ?? '');
});

test('le jour consulté se partage entre les deux écrans, et les onglets ne le remettent pas à zéro', async ({
  page
}) => {
  // D48 : le partage est délibéré — c'est lui qui fait qu'ouvrir un jour depuis
  // la semaine ouvre *ce* jour. Un onglet qui réinitialiserait casserait la
  // moitié du contrat pour réparer une gêne qui a sa propre commande.
  await page.goto('/');
  await jourSuivant(page).click();
  const ecarte = await designation(page).textContent();

  await page.getByRole('link', { name: 'Semaine' }).click();
  await page.getByRole('link', { name: 'Jour' }).click();

  await expect(designation(page)).toHaveText(ecarte ?? '');
});
