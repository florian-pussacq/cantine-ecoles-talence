import { expect, test, type Page } from '@playwright/test';
import { STORAGE_KEY } from '../src/lib/filter/storage.js';

/**
 * La coque : les onglets d'écran, le pied fixe et la commande de réglages.
 *
 * Ce fichier s'appelait `barre.spec.ts` et vérifiait une barre ancrée au bas de
 * la fenêtre, à portée du pouce (D31). Les onglets sont remontés (D52), et le
 * bas de la fenêtre appartient désormais au pied des mentions.
 *
 * Ce qui a changé, c'est la position ; les garanties ne changent pas. Le pied
 * est ancré et borné comme la barre l'était, il réserve toujours sa place sous
 * le contenu, et les onglets ne portent toujours que deux destinations. Le
 * contrôle de non-décalage à l'hydratation est conservé mot pour mot : il ne
 * dépend d'aucune mise en page, seulement de la géométrie de la pastille.
 */

function onglets(page: Page) {
  return page.getByRole('navigation', { name: 'Écrans' });
}

function pied(page: Page) {
  return page.locator('.pied');
}

test('l’enseigne mène au menu depuis n’importe quel écran', async ({ page }) => {
  for (const ecran of ['/semaine', '/reglages', '/greve', '/a-propos']) {
    await page.goto(ecran);
    await page.getByRole('link', { name: 'Cantine des écoles de Talence' }).click();
    await expect(page).toHaveURL(/\/$/);
  }
});

test('le pied est ancré au bas de la fenêtre', async ({ page }) => {
  await page.goto('/');
  const boite = await pied(page).boundingBox();
  const fenetre = page.viewportSize();

  expect(boite).not.toBeNull();
  expect(fenetre).not.toBeNull();
  expect(
    Math.abs(boite!.y + boite!.height - fenetre!.height),
    'le pied ne touche pas le bas de la fenêtre'
  ).toBeLessThanOrEqual(1);
});

test('le pied reste borné à la colonne de contenu', async ({ page }, infos) => {
  await page.goto('/');
  const boite = await pied(page).boundingBox();
  const fenetre = infos.project.use.viewport?.width ?? 0;

  // La même borne que la colonne : un pied étiré sur toute la largeur serait
  // une seconde mise en page, ce que D23 n'admet pas.
  expect(boite!.width).toBeLessThanOrEqual(720);
  if (fenetre > 720) {
    expect(boite!.width, 'le pied s’étire sur toute la fenêtre').toBeLessThan(fenetre);
  }
});

test('le pied offre une cible atteignable au pouce', async ({ page }) => {
  // `qualite.spec.ts` l'exige de toute cible visible ; c'est rappelé ici parce
  // que la hauteur du pied est dimensionnée autour d'elle, et non l'inverse.
  await page.goto('/');
  const lien = pied(page).getByRole('link');
  const boite = await lien.boundingBox();
  expect(boite!.height).toBeGreaterThanOrEqual(44);
});

test('les onglets sont au-dessus du contenu, et non ancrés au bas', async ({ page }) => {
  await page.goto('/');
  const barre = await onglets(page).boundingBox();
  const cartes = await page.locator('.tray').boundingBox();
  const bas = await pied(page).boundingBox();

  expect(barre!.y, 'les onglets devraient précéder les cartes').toBeLessThan(cartes!.y);
  expect(barre!.y, 'les onglets ne doivent pas être ancrés au bas').toBeLessThan(bas!.y);
});

test('les onglets ne portent que des destinations de consultation', async ({ page }) => {
  await page.goto('/');
  const liens = onglets(page).getByRole('link');
  await expect(liens).toHaveCount(2);
  await expect(liens).toHaveText(['Jour', 'Semaine']);
});

test('les onglets ne figurent que sur les deux écrans qu’ils choisissent entre', async ({
  page
}) => {
  for (const ecran of ['/reglages', '/greve', '/a-propos']) {
    await page.goto(ecran);
    await expect(onglets(page)).toHaveCount(0);
  }
});

test('un écran hors des onglets porte sa propre sortie, nommée', async ({ page }) => {
  for (const ecran of ['/reglages', '/greve', '/a-propos']) {
    await page.goto(ecran);
    await page.getByRole('button', { name: 'Retour au menu' }).click();
    await expect(page).toHaveURL(/\/$/);
  }
});

test('le contenu réserve la hauteur du pied', async ({ page }) => {
  // Le défaut que ce test attrape ne se voit pas sur une machine de
  // développement : `viewport-fit=cover` est déclaré depuis l'origine (D34).
  // Ici l'encart système vaut zéro ; ce qui est vérifié, c'est que la
  // réservation existe.
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

  const derniere = await page.locator('.tray .carte >> nth=-1').boundingBox();
  const haut = await pied(page).boundingBox();

  expect(
    derniere!.y + derniere!.height,
    'la dernière carte passe sous le pied'
  ).toBeLessThanOrEqual(haut!.y);
});

test('l’écran porte un seul titre, et un seul rang de flèches', async ({ page }) => {
  // La maquette dessinait la navigation deux fois, en haut et en bas de la
  // liste. Deux jeux de commandes pour une seule action, dont l'un sort du champ
  // dès qu'on défile : c'est une redondance de maquette, pas une intention (D56).
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Navigation entre les jours' })).toHaveCount(1);
});

test('la commande de réglages reste muette quand rien n’est coché', async ({ page }) => {
  await page.goto('/');
  const commande = page.getByRole('link', { name: /^Réglages$/ });
  await expect(commande).toBeVisible();
  await expect(commande).toHaveText('');
});

test('la commande de réglages annonce le nombre d’allergènes surveillés', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(
    ([cle]) => localStorage.setItem(cle as string, JSON.stringify([1, 7, 9])),
    [STORAGE_KEY]
  );
  await page.reload();

  // Le compte est dans le nom accessible, et pas seulement dans la pastille :
  // ce qu'un œil voit, un lecteur d'écran doit l'entendre.
  await expect(
    page.getByRole('link', { name: 'Réglages — 3 allergènes surveillés' })
  ).toBeVisible();
});

test('la commande de réglages ne mène pas là où l’on est déjà', async ({ page }) => {
  await page.goto('/reglages');
  await expect(page.getByRole('link', { name: /^Réglages/ })).toHaveCount(0);
});

test('la pastille n’occupe aucune place, donc l’hydratation ne déplace rien', async ({ page }) => {
  /*
    L'état du filtre ne peut pas être prérendu : il vit dans le stockage local et
    n'est lu qu'à l'hydratation. Le site étant statique, le HTML livré porte
    toujours « aucune sélection », et la pastille ne peut apparaître qu'après.

    C'est la classe de problème que D21 avait résolue par un script bloquant pour
    le thème — script que D25 vient de supprimer et qu'on ne réintroduit pas. La
    réponse est géométrique : la pastille est posée en absolu dans une commande
    de taille fixe, donc la mise en page est la même sélection vide ou pleine.
    Ce test mesure cette égalité, qui est la réservation elle-même (D32).

    Ce qui est mesuré : les dimensions, et la place de la commande dans
    l'enseigne qui la porte. Pas les abscisses absolues — la barre de défilement
    recentre la colonne de huit pixels sans que la pastille y soit pour rien.
  */
  const mesurer = async () =>
    page.evaluate(() => {
      const enseigne = document.querySelector('.enseigne')?.getBoundingClientRect();
      const taille = (s: string) => {
        const b = document.querySelector(s)?.getBoundingClientRect();
        return b ? [Math.round(b.width), Math.round(b.height)] : null;
      };
      const commande = document.querySelector('.enseigne a.commande')?.getBoundingClientRect();
      return {
        titre: taille('h1'),
        enseigne: taille('.enseigne'),
        cartes: taille('.tray'),
        commande: taille('.enseigne a.commande'),
        /* La commande, comptée depuis le bord droit de l'enseigne. */
        commandeDepuisLaDroite:
          enseigne && commande ? Math.round(enseigne.right - commande.right) : null
      };
    });

  await page.goto('/');
  const vide = await mesurer();

  /*
    Crustacés, arachides et lupin : trois codes qui font une pastille sans
    signaler aucun plat du jour affiché. L'isolement est délibéré — cocher des
    allergènes réellement présents allongerait la page et décalerait le contenu.
    Ce déplacement-là est le comportement attendu du filtre ; ce qu'on mesure ici
    est la pastille, et rien d'autre.
  */
  await page.evaluate(
    ([cle]) => localStorage.setItem(cle as string, JSON.stringify([2, 5, 13])),
    [STORAGE_KEY]
  );
  await page.reload();
  await expect(page.getByRole('link', { name: /3 allergènes surveillés/ })).toBeVisible();
  const pleine = await mesurer();

  expect(pleine, 'la lecture du stockage a déplacé la mise en page').toEqual(vide);
});

test('la couche modale recouvre le pied et reste refermable', async ({ page }) => {
  // Playwright refuse de cliquer un élément recouvert : si la fermeture passait
  // sous le pied, ce test échouerait au clic plutôt qu'à l'assertion.
  await page.goto('/');
  await page.locator('.cible').click();

  const couche = page.locator('dialog');
  await expect(couche).toBeVisible();

  const fermeture = couche.getByRole('button', { name: /fermer/i });
  await fermeture.click();
  await expect(couche).toBeHidden();
});
