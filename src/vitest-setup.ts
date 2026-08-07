import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/svelte';
import { afterEach } from 'vitest';

// Le nettoyage automatique de Testing Library ne s'enregistre que si les
// globales de Vitest sont activées. Elles ne le sont pas ici — les imports
// explicites valent mieux — donc le démontage est déclaré à la main. Sans lui,
// les rendus s'empilent dans le même document et les requêtes trouvent deux
// fois le même texte.
afterEach(cleanup);
