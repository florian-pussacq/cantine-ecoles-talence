import { expect, hydratee, test } from './test';

/**
 * Le texte courant se compose pour être lu (finitions-et-plat-inconnu, D4).
 *
 * Deux mesures, prises sur le rendu : le plus grand nombre de caractères d'une
 * ligne, compté caractère par caractère d'après leur position, et le dernier
 * mot d'un paragraphe, qui ne doit pas tenir seul sa ligne. Les écrans de texte
 * courant sont ceux que l'audit relevait, à 100 caractères sur bureau et avec
 * dix-sept mots seuls.
 */
const ECRANS = ['/a-propos', '/reglages', '/greve'];

type Mesure = { texte: string; plusLongue: number; motSeul: string | null };

for (const chemin of ECRANS) {
  test(`${chemin} : des lignes lisibles, sans mot seul`, async ({ page }) => {
    await page.goto(chemin);
    await hydratee(page);
    await page.evaluate(() => document.fonts.ready);

    const mesures = await page.locator('.shell p').evaluateAll((paragraphes): Mesure[] =>
      paragraphes
        .filter((p) => p.getClientRects().length > 0)
        .map((p) => {
          const lignes = new Map<number, number>();
          const mots: { mot: string; haut: number }[] = [];
          const parcours = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
          for (let n = parcours.nextNode(); n; n = parcours.nextNode()) {
            const texte = n.textContent ?? '';
            for (let i = 0; i < texte.length; i++) {
              if (/\s/.test(texte[i] as string)) continue;
              const r = document.createRange();
              r.setStart(n, i);
              r.setEnd(n, i + 1);
              const rect = r.getClientRects()[0];
              if (!rect) continue;
              const haut = Math.round(rect.top);
              lignes.set(haut, (lignes.get(haut) ?? 0) + 1);
              const debut = i === 0 || /\s/.test(texte[i - 1] as string);
              if (debut) mots.push({ mot: texte.slice(i).split(/\s/)[0] ?? '', haut });
            }
          }
          const dernier = mots.at(-1);
          const avant = mots.at(-2);
          const seul =
            lignes.size > 1 && dernier && avant && dernier.haut > avant.haut ? dernier.mot : null;
          return {
            texte: (p.textContent ?? '').trim().slice(0, 40),
            // Les espaces comptent dans une ligne : on les ajoute au nombre de mots.
            plusLongue: Math.max(
              ...[...lignes.entries()].map(
                ([haut, n]) => n + mots.filter((m) => m.haut === haut).length - 1
              )
            ),
            motSeul: seul
          };
        })
    );

    expect(mesures.length).toBeGreaterThan(0);
    for (const m of mesures) {
      expect(m.plusLongue, `« ${m.texte} »`).toBeLessThanOrEqual(75);
      expect(m.motSeul, `« ${m.texte} » finit sur un mot seul`).toBeNull();
    }
  });
}
