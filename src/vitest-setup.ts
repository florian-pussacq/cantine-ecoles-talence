import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/svelte';
import { afterEach } from 'vitest';

// Le nettoyage automatique de Testing Library ne s'enregistre que si les
// globales de Vitest sont activées. Elles ne le sont pas ici — les imports
// explicites valent mieux — donc le démontage est déclaré à la main. Sans lui,
// les rendus s'empilent dans le même document et les requêtes trouvent deux
// fois le même texte.
afterEach(cleanup);

/**
 * Simulation minimale de `<dialog>`, absent de jsdom 30.
 *
 * jsdom n'implémente ni `show`, ni `showModal`, ni `close`, ni `requestClose` :
 * sans cela, tout test montant la feuille de détail échoue sur « n'est pas une
 * fonction », et non sur ce qu'il prétend vérifier.
 *
 * Ce qui est simulé : la machine à états ouvert/fermé, la valeur de retour, et
 * les événements `close` et `cancel`.
 *
 * Ce qui NE l'est PAS, et qu'aucun test unitaire de ce dépôt ne doit prétendre
 * couvrir : la couche supérieure, le piège de focus, sa restitution, l'inertie
 * de l'arrière-plan, `::backdrop`, et la fermeture par la touche d'échappement.
 * Ce sont précisément les garanties pour lesquelles `<dialog>` a été choisi
 * (design.md, D16) — les vérifier ici reviendrait à tester cette simulation.
 * Elles relèvent des tests de bout en bout, dans un vrai navigateur.
 */
const dialog = globalThis.HTMLDialogElement?.prototype;

if (dialog !== undefined && typeof dialog.showModal !== 'function') {
  const ouvrir = function (this: HTMLDialogElement) {
    if (this.open) return;
    this.setAttribute('open', '');
  };

  dialog.show = ouvrir;
  dialog.showModal = ouvrir;

  dialog.close = function (this: HTMLDialogElement, returnValue?: string) {
    if (!this.open) return;
    if (returnValue !== undefined) this.returnValue = returnValue;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };

  dialog.requestClose = function (this: HTMLDialogElement, returnValue?: string) {
    if (!this.open) return;
    const annulable = this.dispatchEvent(new Event('cancel', { cancelable: true }));
    if (annulable) this.close(returnValue);
  };
}
