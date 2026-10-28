import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    /**
     * Le site est entièrement statique : aucun serveur, aucune route dynamique.
     *
     * Le site est servi à la racine du domaine par Netlify : aucun `paths.base`.
     * `paths.relative` (activé par défaut) émet des chemins relatifs, ce qui rend
     * l'application déplaçable ; le code applicatif ne doit jamais écrire de chemin
     * absolu à la main mais passer par `$app/paths` (voir design.md, D2).
     */
    sveltekit({
      preprocess: vitePreprocess(),
      adapter: adapter({
        pages: 'build',
        assets: 'build',
        fallback: undefined,
        precompress: false,
        strict: true
      }),
      paths: {
        relative: true
      },
      serviceWorker: {
        // Enregistré à la main pour pouvoir détecter une version en attente et
        // laisser l'utilisateur décider quand l'appliquer (src/lib/pwa/update).
        register: false
      }
    })
  ],
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
