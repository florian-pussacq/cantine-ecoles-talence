import { defineConfig, devices } from '@playwright/test';
import { INSTANT_PAR_DEFAUT } from './e2e/instant';

/**
 * Deux profils, parce qu'une mise en page qu'aucun test ne visite n'est pas
 * vérifiée (design.md, D24).
 *
 * Les contrôles d'accessibilité et de cibles tactiles portent les mêmes
 * exigences sur les deux. Certains fichiers ne valent que pour le téléphone,
 * pour deux raisons distinctes : ceux qui éprouvent un geste tactile, parce
 * qu'un écran de bureau n'a pas de doigt ; et celui qui mesure la hauteur de la
 * journée, parce que l'exigence porte sur la fenêtre d'un téléphone — un écran
 * de bureau a une colonne plus large et une fenêtre plus basse, ce qui en fait
 * un cas différent et non un cas plus permissif (D39).
 */
const MOBILE_SEULEMENT = [/balayage\.spec\.ts/, /couche-modale\.spec\.ts/, /hauteur\.spec\.ts/];

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris'
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    {
      name: 'bureau',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: MOBILE_SEULEMENT
    }
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    // Le pré-rendu énonce le même jour que le navigateur des tests (ci-github,
    // D6). Un serveur réutilisé, construit sans cette variable, ne le garantit
    // pas : l'arrêter avant de lancer la suite.
    env: { CANTINE_INSTANT: INSTANT_PAR_DEFAUT.toISOString() },
    port: 4173,
    reuseExistingServer: !process.env.CI
  }
});
