import { beforeEach, describe, expect, it } from 'vitest';
import { selection } from './selection.svelte.js';

/**
 * Un choix ne vaut que pour la journée où il a été fait (design.md, D47).
 *
 * La règle se teste sans navigateur et sans toucher au temps système, parce que
 * le jour est un paramètre et non une lecture d'horloge — même discipline que
 * `resolveDisplayDay` (D7). C'est précisément ce qui permet d'écrire ici le
 * scénario qui a échappé à tout le monde : celui d'une application installée,
 * mise en veille un jour et reprise un autre.
 */
beforeEach(() => selection.reset());

describe('le jour consulté', () => {
  it('vaut le jour où il a été choisi', () => {
    selection.set('2026-09-04', '2026-09-01');
    expect(selection.dateLe('2026-09-01')).toBe('2026-09-04');
  });

  it('cesse de valoir dès que le jour civil change', () => {
    // Le scénario réel : on navigue lundi jusqu'à vendredi, on ferme
    // l'application, on la rouvre mercredi. Sans cette règle, l'écran affichait
    // le menu du vendredi sous la mention « Menu du jour ».
    selection.set('2026-09-04', '2026-09-01');
    expect(selection.dateLe('2026-09-02')).toBeNull();
  });

  it('ne vaut rien tant que rien n’a été choisi', () => {
    expect(selection.dateLe('2026-09-01')).toBeNull();
  });

  it('repart de zéro après un retour au repère', () => {
    selection.set('2026-09-04', '2026-09-01');
    selection.reset();
    expect(selection.dateLe('2026-09-01')).toBeNull();
  });

  it('se laisse rechoisir le jour suivant', () => {
    // L'expiration ne bloque rien : elle rend seulement caduc le choix ancien.
    selection.set('2026-09-04', '2026-09-01');
    selection.set('2026-09-07', '2026-09-02');
    expect(selection.dateLe('2026-09-02')).toBe('2026-09-07');
  });
});
