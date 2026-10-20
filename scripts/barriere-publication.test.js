import { describe, expect, it } from 'vitest';
import { decision } from './barriere-publication.js';

/**
 * La barrière de la publication, sans réseau (deploiement-manuel, D2 et D3).
 */

const TETE = 'a4acf4ab42ff125990251487a0eefcad02c614d7';
const finie = { id: 1, status: 'completed', conclusion: 'success' };

/** @param {Record<string, string>} conclusions */
const jobs = (conclusions) =>
  Object.entries(conclusions).map(([name, conclusion]) => ({
    name,
    status: 'completed',
    conclusion
  }));

const VERTS = jobs({ verifier: 'success', e2e: 'success', extraction: 'success' });

describe('decision', () => {
  it('publie une tête de main vérifiée', () => {
    const d = decision({ branche: 'main', tete: TETE, execution: finie, jobs: VERTS });
    expect(d.publier).toBe(true);
    expect(d.raison).toContain('a4acf4a');
  });

  it('refuse un e2e rouge, et le nomme', () => {
    const d = decision({
      branche: 'main',
      tete: TETE,
      execution: { ...finie, conclusion: 'failure' },
      jobs: jobs({ verifier: 'success', e2e: 'failure', extraction: 'success' })
    });
    expect(d.publier).toBe(false);
    expect(d.raison).toContain('`e2e`');
    expect(d.raison).toContain('failure');
  });

  it('publie malgré une extraction rouge, qui ne garde pas la production', () => {
    const d = decision({
      branche: 'main',
      tete: TETE,
      execution: { ...finie, conclusion: 'failure' },
      jobs: jobs({ verifier: 'success', e2e: 'success', extraction: 'failure' })
    });
    expect(d.publier).toBe(true);
  });

  it('refuse pendant que la vérification tourne', () => {
    const d = decision({
      branche: 'main',
      tete: TETE,
      execution: { id: 1, status: 'in_progress', conclusion: null },
      jobs: []
    });
    expect(d.publier).toBe(false);
    expect(d.raison).toContain('en cours');
  });

  it('refuse un commit que rien n’a vérifié', () => {
    const d = decision({ branche: 'main', tete: TETE, execution: null, jobs: [] });
    expect(d.publier).toBe(false);
    expect(d.raison).toContain('Aucune vérification');
  });

  it('refuse un job gardien absent', () => {
    const d = decision({
      branche: 'main',
      tete: TETE,
      execution: finie,
      jobs: jobs({ verifier: 'success' })
    });
    expect(d.publier).toBe(false);
    expect(d.raison).toContain('`e2e` manque');
  });

  it('refuse un job annulé ou sauté', () => {
    for (const conclusion of ['cancelled', 'skipped']) {
      const d = decision({
        branche: 'main',
        tete: TETE,
        execution: finie,
        jobs: jobs({ verifier: 'success', e2e: conclusion })
      });
      expect(d.publier).toBe(false);
    }
  });

  it('refuse un lancement depuis une autre branche', () => {
    const d = decision({ branche: 'essai', tete: TETE, execution: finie, jobs: VERTS });
    expect(d.publier).toBe(false);
    expect(d.raison).toContain('« essai »');
  });
});
