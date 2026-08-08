import { defineConfig, devices } from '@playwright/test';

/**
 * Deux profils, parce qu'une mise en page qu'aucun test ne visite n'est pas
 * vérifiée (design.md, D24).
 *
 * Les contrôles d'accessibilité et de cibles tactiles portent les mêmes
 * exigences sur les deux. Les fichiers qui éprouvent un geste tactile sont
 * réservés au profil mobile : un écran de bureau n'a pas de doigt, et les y
 * jouer produirait un échec qui n'apprendrait rien.
 */
const TACTILE_SEULEMENT = [/balayage\.spec\.ts/, /couche-modale\.spec\.ts/];

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
      testIgnore: TACTILE_SEULEMENT
    }
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173,
    reuseExistingServer: !process.env.CI
  }
});
