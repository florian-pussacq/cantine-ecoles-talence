import { browser } from '$app/environment';
import { base } from '$app/paths';

/**
 * Détection et application des mises à jour de l'application.
 *
 * Le service worker n'écrase jamais la version en cours de son propre chef : il
 * attend, et l'utilisateur décide. Remplacer l'application pendant qu'on la
 * consulte est désagréable et peut faire perdre le jour qu'on regardait.
 */
class AppUpdate {
  #waiting = $state<ServiceWorker | null>(null);
  #registered = false;

  get available(): boolean {
    return this.#waiting !== null;
  }

  register() {
    if (!browser || this.#registered) return;
    if (!('serviceWorker' in navigator)) return;
    this.#registered = true;

    void (async () => {
      const registration = await navigator.serviceWorker.register(`${base}/service-worker.js`, {
        type: 'module'
      });

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
