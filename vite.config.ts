import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  // Sous Vitest, Svelte doit être résolu vers sa version navigateur : sans cette
  // condition, `mount()` tombe sur la variante serveur et les tests de rendu
  // échouent. La condition est portée uniquement là pour ne pas perturber le
  // pré-rendu, qui a lui besoin de la variante serveur.
  resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}', 'scripts/**/*.test.js'],
    // jsdom pour tout : les tests purs s'en accommodent, et cela évite d'avoir
    // deux configurations à tenir pour une poignée de tests de rendu.
    environment: 'jsdom',
    setupFiles: ['src/vitest-setup.ts']
  }
});
