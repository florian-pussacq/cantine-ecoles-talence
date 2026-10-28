import { browser } from '$app/env';
import { asset } from '$app/paths';
import type { AssetPath } from '$app/types';
import { browserStore } from '../filter/storage.js';

/** L'instant du dernier contact réussi avec le serveur (fraicheur-par-appareil, D1). */
const CONTACT_KEY = 'cantine.contact';

/**
 * Détection et application des mises à jour de l'application.
 *
 * Le service worker n'écrase jamais la version en cours de son propre chef : il
 * attend, et l'utilisateur décide. Remplacer l'application pendant qu'on la
 * consulte est désagréable et peut faire perdre le jour qu'on regardait.
 */
class AppUpdate {
  #waiting = $state<ServiceWorker | null>(null);
  #contact = $state<string | null>(null);
  #registered = false;

  get available(): boolean {
    return this.#waiting !== null;
  }

  /**
   * Le dernier contact réussi de cet appareil avec le serveur, ou `null` s'il
   * n'est pas connu — stockage indisponible, ou aucune vérification encore
   * aboutie. C'est la mesure de fraîcheur des menus affichés (D1, D3).
   */
  get contact(): string | null {
    return this.#contact;
  }

  #consigner() {
    const maintenant = new Date().toISOString();
    this.#contact = maintenant;
    try {
      browserStore()?.setItem(CONTACT_KEY, maintenant);
    } catch {
      // Sans stockage, le contact vaut pour cette session seulement.
    }
  }

  register() {
    if (!browser || this.#registered) return;
    if (!('serviceWorker' in navigator)) return;
    this.#registered = true;

    try {
      this.#contact = browserStore()?.getItem(CONTACT_KEY) ?? null;
    } catch {
      this.#contact = null;
    }

    void (async () => {
      // SvelteKit situe son service worker comme un fichier statique ; le typage
      // d'`asset` ne le connaît pas, parce qu'il est produit au build.
      const registration = await navigator.serviceWorker.register(
        asset('service-worker.js' as AssetPath),
        { type: 'module' }
      );

      const track = (worker: ServiceWorker | null) => {
        if (worker === null) return;
        const check = () => {
          // Une version n'est « en attente » que s'il y en avait déjà une :
          // à la toute première installation, il n'y a rien à proposer.
          if (worker.state === 'installed' && navigator.serviceWorker.controller !== null) {
            this.#waiting = worker;
          }
        };
        check();
        worker.addEventListener('statechange', check);
      };

      /*
        Le script du service worker est redemandé au serveur, sans cache HTTP :
        la promesse ne se résout que s'il a répondu, nouveauté ou pas. C'est le
        contact que mesure l'avertissement de fraîcheur (D1). Au retour au
        premier plan aussi : une application installée reste en mémoire des
        jours sans être rechargée.
      */
      const verifier = () => {
        registration.update().then(
          () => this.#consigner(),
          () => {
            // Hors ligne : le dernier contact reste celui d'avant.
          }
        );
      };
      verifier();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') verifier();
      });

      track(registration.waiting);
      registration.addEventListener('updatefound', () => track(registration.installing));
    })();
  }

  /** Applique la version en attente et recharge. */
  apply() {
    const waiting = this.#waiting;
    if (waiting === null) return;
    navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), {
      once: true
    });
    waiting.postMessage('appliquer-la-mise-a-jour');
  }
}

export const appUpdate = new AppUpdate();
