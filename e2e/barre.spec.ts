import { expect, test, type Page } from '@playwright/test';
import { STORAGE_KEY } from '../src/lib/filter/storage.js';

/**
 * La barre d'écrans et la commande de réglages.
 *
 * L'accès aux écrans n'avait jusqu'ici aucune exigence, et c'est pour cela qu'il
 * a dérivé : une vue et un réglage se partageaient une barre à trois segments,
 * placée là où le pouce ne va pas (design.md, D31).
 *
 * Ce fichier tourne sur les deux profils. La position basse ne se vérifie pas au
 * doigt ici — aucun test ne dira si le pouce l'atteint — mais l'ancrage, la
 * borne de largeur et la place réservée sous le contenu, si.
 */

function barre(page: Page) {
  return page.getByRole('navigation', { name: 'Écrans' });
}

test('la barre est ancrée au bas de la fenêtre', async ({ page }) => {
  await page.goto('/');
  const boite = await barre(page).boundingBox();
  const fenetre = page.viewportSize();

  expect(boite).not.toBeNull();
  expect(fenetre).not.toBeNull();
  expect(
    Math.abs(boite!.y + boite!.height - fenetre!.height),
    'la barre ne touche pas le bas de la fenêtre'
  ).toBeLessThanOrEqual(1);
});

test('la barre reste bornée à la colonne de contenu', async ({ page }, infos) => {
  await page.goto('/');
  const boite = await barre(page).boundingBox();
  const fenetre = infos.project.use.viewport?.width ?? 0;

  // La même borne que la colonne : une barre étirée sur toute la largeur serait
  // une seconde mise en page, ce que D23 n'admet pas.
  expect(boite!.width).toBeLessThanOrEqual(720);
  if (fenetre > 720) {
    expect(boite!.width, 'la barre s’étire sur toute la fenêtre').toBeLessThan(fenetre);
  }
});

test('la barre ne porte que des destinations de consultation', async ({ page }) => {
  await page.goto('/');
  const liens = barre(page).getByRole('link');
  await expect(liens).toHaveCount(2);
  await expect(liens).toHaveText(['Jour', 'Semaine']);
});

test('sur un écran hors de la barre, aucun segment n’est courant', async ({ page }) => {
  // On sort d'un réglage en désignant où l'on va, et non par une flèche de
  // retour dont la destination dépendrait de l'historique.
  await page.goto('/reglages');
  await expect(barre(page)).toBeVisible();
  await expect(barre(page).locator('a[aria-current="page"]')).toHaveCount(0);

  await barre(page).getByRole('link', { name: 'Jour' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('le contenu réserve la hauteur de la barre', async ({ page }) => {
  // Le défaut que ce test attrape ne se voit pas sur une machine de
  // développement : `viewport-fit=cover` est déclaré depuis l'origine, et rien
  // n'était ancré au bas de l'écran pour le révéler (D34). Ici l'encart système
  // vaut zéro ; ce qui est vérifié, c'est que la réservation existe.
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

  const mentions = page.getByRole('link', { name: 'Source, mentions et vie privée' });
  const bas = await mentions.boundingBox();
  const haut = await barre(page).boundingBox();

  expect(bas!.y + bas!.height, 'le pied de page passe sous la barre').toBeLessThanOrEqual(haut!.y);
});

test('la commande de réglages reste muette quand rien n’est coché', async ({ page }) => {
  await page.goto('/');
  const commande = page.getByRole('link', { name: /^Allergènes à signaler$/ });
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
    page.getByRole('link', { name: 'Allergènes à signaler — 3 surveillés' })
  ).toBeVisible();
});

test('la commande de réglages ne mène pas là où l’on est déjà', async ({ page }) => {
  await page.goto('/reglages');
  await expect(page.getByRole('link', { name: /Allergènes à signaler/ })).toHaveCount(0);
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
  */
  /*
    Ce qui est mesuré : les dimensions, et la place de la commande dans son
    en-tête. Pas les abscisses absolues.

    La hauteur de la page tombe près du seuil où le navigateur affiche une barre
    de défilement, et celle-ci recentre la colonne de huit pixels — le même
    décalage sur tous les éléments à la fois, largeurs inchangées. C'est un
    artefact du centrage, pas un effet de la pastille : l'y inclure ferait
    échouer ce test sur un événement sans rapport avec ce qu'il vérifie.

    Une pastille qui prendrait de la place, elle, rétrécirait le titre ou
    déplacerait la commande dans son en-tête. C'est exactement ce qui est relevé.
  */
  const mesurer = async () =>
    page.evaluate(() => {
      const entete = document.querySelector('header')?.getBoundingClientRect();
      const taille = (s: string) => {
        const b = document.querySelector(s)?.getBoundingClientRect();
        return b ? [Math.round(b.width), Math.round(b.height)] : null;
      };
      const commande = document.querySelector('header a')?.getBoundingClientRect();
      return {
        titre: taille('h1'),
        entete: taille('header'),
        plateau: taille('.tray'),
        commande: taille('header a'),
        /* La commande, comptée depuis le bord droit de l'en-tête qui la porte. */
        commandeDepuisLaDroite:
          entete && commande ? Math.round(entete.right - commande.right) : null
      };
    });

  await page.goto('/');
  const vide = await mesurer();

  /*
    Crustacés, arachides et lupin : trois codes qui font une pastille sans
    signaler aucun plat du jour affiché. L'isolement est délibéré — cocher des
    allergènes réellement présents allongerait la page, ferait apparaître une
    barre de défilement sur un écran de bureau, et décalerait tout le contenu de
    sa largeur. Ce déplacement-là est le comportement attendu du filtre ; ce
    qu'on mesure ici est la pastille, et rien d'autre.
  */
  await page.evaluate(
    ([cle]) => localStorage.setItem(cle as string, JSON.stringify([2, 5, 13])),
    [STORAGE_KEY]
  );
  await page.reload();
  await expect(page.getByRole('link', { name: /3 surveillés/ })).toBeVisible();
  const pleine = await mesurer();

  expect(pleine, 'la lecture du stockage a déplacé la mise en page').toEqual(vide);
});

test('la couche modale recouvre la barre et reste refermable', async ({ page }) => {
  // La commande de fermeture et la barre occupent désormais la même zone du
  // pouce. Playwright refuse de cliquer un élément recouvert : si la fermeture
  // passait sous la barre, ce test échouerait au clic plutôt qu'à l'assertion.
  await page.goto('/');
  await page.locator('.tray .main button').click();

  const couche = page.locator('dialog');
  await expect(couche).toBeVisible();

  const fermeture = couche.getByRole('button', { name: /fermer/i });
  await fermeture.click();
  await expect(couche).toBeHidden();
});
