/**
 * Dérive les types TypeScript des JSON Schemas.
 *
 * Les schémas sont la source de vérité — ils sont ce que le futur parser Python
 * devra respecter — et les types en sont une projection, jamais l'inverse.
 *
 *   node scripts/generate-types.js          réécrit src/lib/data/schema.d.ts
 *   node scripts/generate-types.js --check   échoue si le fichier a divergé
 *
 * Le mode --check tourne dans `npm run validate` : sans lui, un schéma modifié
 * sans régénération laisserait le code compiler contre un contrat périmé.
 */

import { compileFromFile } from 'json-schema-to-typescript';
import { readFileSync, writeFileSync } from 'node:fs';
import { argv, exit } from 'node:process';

const OUTPUT = 'src/lib/data/schema.d.ts';

const HEADER = `/**
 * FICHIER GÉNÉRÉ — ne pas modifier à la main.
 *
 * Source : schemas/month.schema.json, schemas/index.schema.json, schemas/greve.schema.json
 * Régénérer : npm run types
 */

`;

/** @type {Partial<import('json-schema-to-typescript').Options>} */
const options = {
  bannerComment: '',
  additionalProperties: false,
  style: { singleQuote: true, printWidth: 100, semi: true }
};

const parts = await Promise.all([
  compileFromFile('schemas/month.schema.json', options),
  compileFromFile('schemas/index.schema.json', options),
  compileFromFile('schemas/greve.schema.json', options)
]);

const generated = HEADER + parts.join('\n');

if (argv.includes('--check')) {
  let current = '';
  try {
    current = readFileSync(OUTPUT, 'utf8');
  } catch {
    console.error(`Types : ${OUTPUT} est absent. Lancer « npm run types ».`);
    exit(1);
  }
  if (current !== generated) {
    console.error(
      `Types : ${OUTPUT} a divergé des schémas JSON. Lancer « npm run types » et committer le résultat.`
    );
    exit(1);
  }
  console.log(`Types : ${OUTPUT} est à jour.`);
} else {
  writeFileSync(OUTPUT, generated);
  console.log(`Types : ${OUTPUT} régénéré.`);
}
