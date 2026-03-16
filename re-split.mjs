// re-split.mjs — Re-extract all section files from git's clean original index.html
import { execSync } from 'child_process';
import { writeFileSync, readdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sectionsDir = join(__dirname, 'sections');

// Get the original clean index.html from the first commit using git as raw bytes
const original = execSync('git show e18ee53:index.html', { cwd: __dirname, encoding: 'utf8' });

console.log('Original length:', original.length);

// Verify it has clean UTF-8
const titleMatch = original.match(/<title>.*<\/title>/);
console.log('Title:', titleMatch?.[0]);

const lines = original.split('\n');
console.log('Lines:', lines.length);

// Section boundaries (0-indexed line numbers from the original 1525-line file)
const sections = [
  { name: '01-DONT-EDIT-styles-and-head.html',           start: 0,    end: 575 },
  { name: '02-hero-banner-and-nav.html',                 start: 576,  end: 620 },
  { name: '03-flights-and-arrival.html',                 start: 621,  end: 694 },
  { name: '04-day1-hanoi-arrival.html',                  start: 695,  end: 775 },
  { name: '05-day2-hanoi-temples-and-night-bus.html',    start: 776,  end: 876 },
  { name: '06-days3-4-sapa-fansipan-and-trek.html',      start: 877, end: 998 },
  { name: '07-days5-8-danang-beach-and-hoian.html',      start: 999, end: 1148 },
  { name: '08-day8-saigon-arrival.html',                 start: 1149, end: 1243 },
  { name: '09-days9-10-markets-spa-and-departure.html',  start: 1244, end: 1329 },
  { name: '10-budget-summary.html',                      start: 1330, end: 1410 },
  { name: '11-essential-travel-info.html',               start: 1411, end: 1464 },
  { name: '12-DONT-EDIT-footer-and-scripts.html',        start: 1465, end: lines.length - 1 },
];

// Write each section, replacing any raw Unicode chars with HTML entities for safety
for (const s of sections) {
  let content = lines.slice(s.start, s.end + 1).join('\n');
  
  // Convert special chars to HTML entities so they survive any encoding
  content = content
    .replace(/\u2014/g, '&mdash;')
    .replace(/\u2013/g, '&ndash;')
    .replace(/\u2022/g, '&bull;')
    .replace(/\u2019/g, '&rsquo;')
    .replace(/\u2018/g, '&lsquo;')
    .replace(/\u201C/g, '&ldquo;')
    .replace(/\u201D/g, '&rdquo;')
    .replace(/\u2026/g, '&hellip;')
    .replace(/\u00B0/g, '&deg;')
    .replace(/\u00E9/g, '&eacute;')
    .replace(/\u00E0/g, '&agrave;')
    .replace(/\u00E8/g, '&egrave;')
    .replace(/\u00F4/g, '&ocirc;');

  writeFileSync(join(sectionsDir, s.name), content, 'utf8');
  console.log(`  ${s.name}  (lines ${s.start + 1}-${s.end + 1})`);
}

console.log(`\n✓ Re-extracted ${sections.length} clean section files`);
