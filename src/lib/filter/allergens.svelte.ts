import { browser } from '$app/env';
import { SvelteSet } from 'svelte/reactivity';
import type { Course } from '../data/schema.js';
import { browserStore, readSelection, writeSelection, type KeyValueStore } from './storage.js';

/**
 * Le filtre allergènes, partagé par tous les écrans.
 *
 * L'état vit en mémoire et se recopie dans le stockage local. Si celui-ci refuse,
 * l'application continue de fonctionner : le filtre est un confort, pas un
 * prérequis à la lecture d'un menu (design.md, D6).
 */
class AllergenFilter {
  #codes = new SvelteSet<number>();
  #store: KeyValueStore | null = null;
  #persists = $state(true);
  #loaded = false;

  /** Relit le stockage. Sans effet côté serveur, où il n'y en a pas. */
  hydrate() {
    if (!browser || this.#loaded) return;
    this.#loaded = true;
    this.#store = browserStore();
    this.#persists = this.#store !== null;
    for (const code of readSelection(this.#store)) this.#codes.add(code);
  }

  get codes(): ReadonlySet<number> {
    return this.#codes;
  }

  /** Faux si les changements ne survivront pas à la fermeture de l'onglet. */
  get persists(): boolean {
    return this.#persists;
  }

  has(code: number): boolean {
    return this.#codes.has(code);
  }

  toggle(code: number) {
    if (!this.#codes.delete(code)) this.#codes.add(code);
    this.#persists = writeSelection(this.#store, this.#codes);
  }

  clear() {
    this.#codes.clear();
    this.#persists = writeSelection(this.#store, []);
  }

  /** Les codes d'un plat qui figurent dans la sélection, dans leur ordre d'origine. */
  matching(course: Course): number[] {
    if (this.#codes.size === 0) return [];
    return course.allergens.filter((code) => this.#codes.has(code));
  }
}

export const allergenFilter = new AllergenFilter();
