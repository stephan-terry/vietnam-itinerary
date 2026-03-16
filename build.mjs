// build.mjs — Compile all sections/ into index.html and deploy to Unraid
// Run with: node build.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync, copyFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sectionsDir = join(__dirname, 'sections');
const UNRAID_BASE = 'U:\\web-vietnam';
const UNRAID_INDEX = join(UNRAID_BASE, 'index.html');
const UNRAID_SECTIONS = join(UNRAID_BASE, 'sections');

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
if (existsSync(UNRAID_BASE)) {
  // Copy compiled index.html
  copyFileSync(outPath, UNRAID_INDEX);
  console.log(`✓ Deployed index.html → ${UNRAID_INDEX}`);

  // Sync all section files so they're editable from the share
  mkdirSync(UNRAID_SECTIONS, { recursive: true });
  for (const f of files) {
    copyFileSync(join(sectionsDir, f), join(UNRAID_SECTIONS, f));
  }
  console.log(`✓ Synced ${files.length} section files → ${UNRAID_SECTIONS}\\`);
} else {
  console.log(`⚠ Unraid share not mounted (${UNRAID_BASE} not found) — skipping deploy`);
}
