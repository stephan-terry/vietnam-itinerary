// build.mjs — Compile all sections/ into index.html and deploy to Unraid
// Run with: node build.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sectionsDir = join(__dirname, 'sections');
const UNRAID_PATH = 'U:\\web-vietnam\\index.html';

const files = readdirSync(sectionsDir)
  .filter(f => f.endsWith('.html'))
  .sort(); // relies on 01-, 02-, ... prefix ordering

const html = files
  .map(f => readFileSync(join(sectionsDir, f), 'utf8'))
  .join('\n');

const outPath = join(__dirname, 'index.html');
writeFileSync(outPath, html, 'utf8');
console.log(`✓ Built index.html from ${files.length} sections:`);
files.forEach(f => console.log(`  - ${f}`));

// Deploy to Unraid share if mounted
if (existsSync('U:\\web-vietnam')) {
  copyFileSync(outPath, UNRAID_PATH);
  console.log(`✓ Deployed to ${UNRAID_PATH}`);
} else {
  console.log(`⚠ Unraid share not mounted (U:\\web-vietnam not found) — skipping deploy`);
}
