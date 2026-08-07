import { describe, expect, it } from 'vitest';
import { readSelection, STORAGE_KEY, writeSelection, type KeyValueStore } from './storage.js';

function memoryStore(initial: Record<string, string> = {}): KeyValueStore {
  const data = { ...initial };
  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    }
  };
}

const refusing: KeyValueStore = {
  getItem: () => {
    throw new DOMException('refusé');
  },
  setItem: () => {
    throw new DOMException('quota dépassé');
  }
};

describe('readSelection', () => {
  it('relit une sélection enregistrée', () => {
    const store = memoryStore({ [STORAGE_KEY]: '[3,7]' });
    expect([...readSelection(store)].sort()).toEqual([3, 7]);
  });

  it('rend une sélection vide en l’absence de stockage', () => {
    expect(readSelection(null).size).toBe(0);
  });

  it('rend une sélection vide quand rien n’a été enregistré', () => {
    expect(readSelection(memoryStore()).size).toBe(0);
  });

  it('survit à un stockage qui lève', () => {
    expect(readSelection(refusing).size).toBe(0);
  });

  it('survit à un contenu illisible plutôt que d’échouer', () => {
    expect(readSelection(memoryStore({ [STORAGE_KEY]: 'pas du json' })).size).toBe(0);
    expect(readSelection(memoryStore({ [STORAGE_KEY]: '{"a":1}' })).size).toBe(0);
  });

  it('écarte les codes hors des quatorze allergènes', () => {
    const store = memoryStore({ [STORAGE_KEY]: '[0,7,15,"3",null]' });
    expect([...readSelection(store)]).toEqual([7]);
  });
});

describe('writeSelection', () => {
  it('enregistre les codes triés', () => {
    const store = memoryStore();
    expect(writeSelection(store, [7, 1, 3])).toBe(true);
    expect(store.getItem(STORAGE_KEY)).toBe('[1,3,7]');
  });

  it('fait l’aller-retour', () => {
    const store = memoryStore();
    writeSelection(store, [3, 7]);
    expect([...readSelection(store)]).toEqual([3, 7]);
  });

  it('signale le refus sans lever', () => {
    expect(writeSelection(refusing, [7])).toBe(false);
    expect(writeSelection(null, [7])).toBe(false);
  });
});
