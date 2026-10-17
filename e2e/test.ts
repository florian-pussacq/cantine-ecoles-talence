import { test as base } from '@playwright/test';

import { INSTANT_PAR_DEFAUT } from './instant';

import type { Page } from '@playwright/test';

export { expect, type Page } from '@playwright/test';

/**
 * Chaque test commence à `INSTANT_PAR_DEFAUT`.
 *
 * Sans cela, un test qui ouvre `/` teste « le jour où il tourne ». Le
 * 16 octobre 2026, le corpus s'est épuisé, l'écran a dit « menu non publié », et
 * quatorze tests sont tombés sans qu'aucun code ait changé. L'instant est une
 * entrée du test, au même titre que l'URL (ci-github, D5).
 *
 * Un test qui a besoin d'un autre jour réinstalle l'horloge : la seconde
 * installation remplace la première.
 */
export const test = base.extend<{ horloge: void }>({
  horloge: [
    async ({ page }, use) => {
      await page.clock.install({ time: INSTANT_PAR_DEFAUT });
      await use();
    },
    { auto: true }
  ]
});

/**
 * Attend que l'application soit hydratée.
 *
 * Le HTML pré-rendu est complet et visible avant que les écouteurs soient
 * branchés. Un clic ou une touche envoyés dans cet intervalle sont perdus sans
 * erreur, ce qui ne se voit que sous charge (ci-github, D7).
 */
export async function hydratee(page: Page): Promise<void> {
  await page.locator('html[data-hydrate]').waitFor({ state: 'attached' });
}
