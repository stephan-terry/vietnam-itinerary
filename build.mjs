// build.mjs — Compile all sections/ into index.html
// Run with: node build.mjs
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sectionsDir = join(__dirname, 'sections');

const files = readdirSync(sectionsDir)
  .filter(f => f.endsWith('.html'))
  .sort(); // relies on 01-, 02-, ... prefix ordering

const html = files
  .map(f => readFileSync(join(sectionsDir, f), 'utf8'))
  .join('\n');

writeFileSync(join(__dirname, 'index.html'), html, 'utf8');
console.log(`✓ Built index.html from ${files.length} sections:`);
files.forEach(f => console.log(`  - ${f}`));
