import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/**
 * Le site est entièrement statique : aucun serveur, aucune route dynamique.
 *
 * `paths.base` vient de l'environnement pour supporter GitHub Pages, qui sert le
 * site sous `/<repo>/` sauf domaine personnalisé. `paths.relative` (activé par
 * défaut) émet des chemins relatifs, ce qui rend l'application déplaçable ; le
 * code applicatif ne doit jamais écrire de chemin absolu à la main mais passer
 * par `$app/paths` (voir design.md, D2).
 *
 * @type {import('@sveltejs/kit').Config}
 */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: undefined,
      precompress: false,
      strict: true
    }),
    paths: {
      base: process.env.BASE_PATH ?? '',
      relative: true
    },
    serviceWorker: {
      // Enregistré à la main pour pouvoir détecter une version en attente et
      // laisser l'utilisateur décider quand l'appliquer (src/lib/pwa/update).
      register: false
    },
    typescript: {
      config: (cfg) => {
        cfg.include = [...(cfg.include ?? []), '../scripts/**/*.js'];
        return cfg;
      }
    }
  }
};

export default config;
