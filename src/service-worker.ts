/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { version } from '$app/env';
import { assets, immutable, prerendered } from '$app/manifest';

/**
 * Le service worker.
 *
 * Deux caches, deux politiques. La coque applicative — code, styles, pages
 * pré-rendues — ne change qu'au déploiement : elle est mise en cache à
 * l'installation et servie depuis le cache sans jamais interroger le réseau.
 * Les données de menu, elles, changent sans que l'application change : elles sont
 * servies depuis le cache puis rafraîchies en arrière-plan.
 *
 * Les deux noms de cache portent la version du build. Un déploiement crée donc
 * des caches neufs, et l'activation supprime les anciens. Un service worker mal
 * purgé est le mode de panne le plus pénible d'une application web, parce qu'il
 * survit au rechargement.
 */

const worker = self as unknown as ServiceWorkerGlobalScope;

const SHELL_CACHE = `coque-${version}`;
const DATA_CACHE = `donnees-${version}`;
const OURS = new Set([SHELL_CACHE, DATA_CACHE]);

/**
 * Le manifeste donne ses chemins relatifs au préfixe de déploiement. Le service
 * worker est servi à ce préfixe : y résoudre un chemin donne le chemin absolu
 * que portent les requêtes.
 */
const absolute = (path: string) => new URL(`./${path}`, location.href).pathname;

const DATA_PREFIX = absolute('data/');

const isData = (pathname: string) => pathname.startsWith(DATA_PREFIX);

const files = assets.map(({ path }) => absolute(path));

/** La coque : tout ce que le build produit, moins les fichiers de données. */
const SHELL_ASSETS = [
  ...immutable.map(({ path }) => absolute(path)),
  ...files,
  // Le pré-rendu compte aussi les données qu'il a chargées.
  ...prerendered.map(({ path }) => absolute(path))
].filter((path) => !isData(path));
const DATA_ASSETS = files.filter((path) => isData(path));

worker.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const shell = await caches.open(SHELL_CACHE);
      await shell.addAll(SHELL_ASSETS);

      // Les données sont préchargées elles aussi : sans elles, une première
      // ouverture hors ligne afficherait une coque vide.
      const data = await caches.open(DATA_CACHE);
      await data.addAll(DATA_ASSETS);

      // Pas de skipWaiting ici : la nouvelle version attend que l'utilisateur
      // l'accepte, pour ne pas remplacer l'application sous ses yeux.
    })()
  );
});

worker.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) {
        if (!OURS.has(name)) await caches.delete(name);
      }
      await worker.clients.claim();
    })()
  );
});

/** L'application demande l'application immédiate de la version en attente. */
worker.addEventListener('message', (event) => {
  if (event.data === 'appliquer-la-mise-a-jour') void worker.skipWaiting();
});

/**
 * Cache d'abord : la coque ne change qu'au déploiement.
 *
 * `ignoreVary`, parce que la coque se met en cache par des requêtes sans
 * `Origin`, alors que le routeur charge ses modules en CORS, avec. Un serveur
 * qui répond `Vary: Origin` ferait alors manquer chaque module hors ligne. Ces
 * fichiers portent leur empreinte dans leur nom : un même chemin, un même contenu.
 */
async function fromShell(request: Request): Promise<Response> {
  const cached = await caches.match(request, { cacheName: SHELL_CACHE, ignoreVary: true });
  if (cached) return cached;
  return await fetch(request);
}

/**
 * Cache d'abord, rafraîchissement en arrière-plan.
 *
 * L'écran s'affiche donc immédiatement avec ce qu'on avait, et la version
 * fraîche sera là au prochain lancement. C'est ce qui permet de tenir la règle
 * « zéro squelette » : il n'y a jamais d'attente à masquer.
 */
async function fromData(request: Request): Promise<Response> {
  const cache = await caches.open(DATA_CACHE);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then(async (response) => {
      if (response.ok) await cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  if (cached) {
    void network;
    return cached;
  }

  const fresh = await network;
  if (fresh) return fresh;

  // Ni cache ni réseau : première ouverture hors ligne. L'application le dit.
  return new Response(null, { status: 503, statusText: 'Hors ligne, aucune donnée en cache' });
}

worker.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  if (isData(url.pathname)) {
    event.respondWith(fromData(request));
    return;
  }

  if (SHELL_ASSETS.includes(url.pathname)) {
    event.respondWith(fromShell(request));
    return;
  }

  if (request.mode === 'navigate') {
    // Une navigation vers une page pré-rendue absente du cache retombe sur la
    // racine, elle-même pré-rendue : mieux vaut le bon écran d'accueil qu'une
    // page d'erreur du navigateur.
    event.respondWith(
      (async () =>
        (await caches.match(request, { cacheName: SHELL_CACHE })) ??
        (await fetch(request).catch(
          async () =>
            (await caches.match(absolute(''), { cacheName: SHELL_CACHE })) ??
            new Response(null, { status: 503 })
        )))()
    );
  }
});
