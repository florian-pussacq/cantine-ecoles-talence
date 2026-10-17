import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    }
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: { projectService: true, extraFileExtensions: ['.svelte'], parser: ts.parser }
    }
  },
  {
    // Les tests de bout en bout passent par `e2e/test.ts`, qui fixe l'horloge :
    // importer `test` de Playwright directement ferait dépendre le test du jour
    // où il tourne (ci-github, D5).
    files: ['e2e/**/*.spec.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@playwright/test',
              message: "Importer depuis './test', qui fixe l'horloge."
            }
          ]
        }
      ]
    }
  },
  {
    ignores: ['build/', '.svelte-kit/', 'node_modules/', 'sources/', 'openspec/']
  }
);
