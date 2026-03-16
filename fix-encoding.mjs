// fix-encoding.mjs — Fix double-encoded UTF-8 mojibake in section files
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, 'sections');
const files = readdirSync(dir).filter(f => f.endsWith('.html'));

for (const f of files) {
  const fp = join(dir, f);
  const content = readFileSync(fp, 'utf8');

  let fixed = content;

  // The original HTML had proper UTF-8 chars (em dash, en dash, bullet, etc.).
  // PowerShell's Set-Content read them as UTF-8 but re-encoded through Windows-1252,
  // creating double-encoded mojibake. Fix by replacing with HTML entities.

  // Common mojibake patterns (UTF-8 → CP1252 → UTF-8 double-encode):
  fixed = fixed
    // Em dash — (U+2014): E2 80 94 → â€" in CP1252
    .replace(/â€"/g, '&mdash;')
    // En dash – (U+2013): E2 80 93 → â€" in CP1252 (NOTE: visually similar to em dash mojibake)
    .replace(/â€"/g, '&ndash;')
    // Bullet • (U+2022): E2 80 A2 → â€¢
    .replace(/â€¢/g, '&bull;')
    // Right single quote ' (U+2019): E2 80 99 → â€™
    .replace(/â€™/g, '&rsquo;')
    // Left single quote ' (U+2018): E2 80 98 → â€˜  
    .replace(/â€˜/g, '&lsquo;')
    // Left double quote " (U+201C): E2 80 9C → â€œ
    .replace(/â€œ/g, '&ldquo;')
    // Right double quote " (U+201D): E2 80 9D → â€
    .replace(/â€\u009D/g, '&rdquo;')
    // Ellipsis … (U+2026): E2 80 A6 → â€¦
    .replace(/â€¦/g, '&hellip;')
    // Right arrow → (U+2192): E2 86 92 → â†'
    .replace(/â†'/g, '&rarr;')
    // Degree ° (U+00B0): C2 B0 → Â°
    .replace(/Â°/g, '&deg;')
    // Middle dot · (U+00B7): C2 B7 → Â·
    .replace(/Â·/g, '&middot;')
    // Non-breaking space (U+00A0): C2 A0 → Â (+ invisible nbsp)
    .replace(/Â\u00A0/g, '&nbsp;')
    // é (U+00E9): C3 A9 → Ã©
    .replace(/Ã©/g, '&eacute;')
    // à (U+00E0): C3 A0 → Ã 
    .replace(/Ã\u00A0/g, '&agrave;')
    // è (U+00E8): C3 A8 → Ã¨
    .replace(/Ã¨/g, '&egrave;')
    // ô (U+00F4): C3 B4 → Ã´
    .replace(/Ã´/g, '&ocirc;')
    // Clean up any leftover &mdash; that should have been &ndash; in number ranges (8-17)
    ;

  if (fixed !== content) {
    writeFileSync(fp, fixed, 'utf8');
    console.log('Fixed:', f);
  } else {
    console.log('Clean:', f);
  }
}

// Verify
const check = readFileSync(join(dir, '01-DONT-EDIT-styles-and-head.html'), 'utf8');
const title = check.match(/<title>.*<\/title>/);
console.log('\nTitle:', title?.[0]);
