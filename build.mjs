// build.mjs — Build a dynamic index.html shell that loads sections/ at runtime.
// Run with: node build.mjs  (or: npm run build)
//
// HOW EDITING WORKS:
//   Edit any file in sections/ (on the share or locally) → refresh the browser → done.
//   No rebuild needed. index.html fetches every section fresh on each page load.
//   Run this script only when you add/remove section files or change the head/footer.

import { readFileSync, writeFileSync, readdirSync, existsSync, copyFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sectionsDir = join(__dirname, 'sections');
const UNRAID_BASE   = 'U:\\web-vietnam';
const UNRAID_INDEX  = join(UNRAID_BASE, 'index.html');
const UNRAID_SECTIONS = join(UNRAID_BASE, 'sections');

const allFiles = readdirSync(sectionsDir).filter(f => f.endsWith('.html')).sort();

// Sections fetched at runtime = everything except 01 (head/CSS) and 12 (footer/scripts)
const contentFiles = allFiles.filter(f => !f.startsWith('01-') && !f.startsWith('12-'));

// Read the static head (01) and extract the footer element from 12
const headContent = readFileSync(join(sectionsDir, allFiles.find(f => f.startsWith('01-'))), 'utf8');
const footerSrc   = readFileSync(join(sectionsDir, allFiles.find(f => f.startsWith('12-'))), 'utf8');
const footerHtml  = (footerSrc.match(/<footer[\s\S]*?<\/footer>/i) || [''])[0];

// List of section URLs for the runtime fetch
const sectionList = contentFiles.map(f => `    'sections/${f}'`).join(',\n');

// Generate the dynamic shell. Sections 02-11 are fetched by the browser on every page load,
// so editing any section file on the server takes effect on the next refresh — no rebuild needed.
const html = `${headContent}
<body>

<div id="__content__"><p style="text-align:center;padding:80px 20px;color:#666;font-size:1.1rem;">Loading itinerary\u2026</p></div>

${footerHtml}

<script>
// ── Section loader ────────────────────────────────────────────────────────────
// index.html is a thin shell. All day/flight/hotel/budget content lives in the
// sections/ folder and is fetched fresh on every page load.
// To update the site: edit the right file in sections/ → save → refresh browser.
(async () => {
  const _files = [
${sectionList}
  ];
  const container = document.getElementById('__content__');
  try {
    const parts = await Promise.all(
      _files.map(url => fetch(url).then(r => { if (!r.ok) throw new Error(url); return r.text(); }))
    );
    // Section 02 opens with <body> — strip it before injecting into the existing <body>
    const cleaned = parts.map(t => t.replace(/^<body[^>]*>\\s*/i, ''));
    container.outerHTML = cleaned.join('\\n');
  } catch (e) {
    container.innerHTML =
      '<p style="text-align:center;padding:60px;color:#c0392b">' +
      'Could not load sections \u2014 this page must be served from a web server, ' +
      'not opened as a local file.</p>';
    return;
  }
  _initObserver();
})();

// ── Collapsible day cards ─────────────────────────────────────────────────────
function toggleCard(header) {
  const body = header.nextElementSibling;
  header.classList.toggle('collapsed');
  if (header.classList.contains('collapsed')) {
    body.style.maxHeight = '0';
    body.style.opacity = '0';
    body.style.padding = '0 20px';
  } else {
    body.style.maxHeight = body.scrollHeight + 40 + 'px';
    body.style.opacity = '1';
    body.style.padding = '';
    setTimeout(() => { body.style.maxHeight = 'none'; }, 400);
  }
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function openLightbox(img) {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const lbImg    = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption');
  const src = img.src.replace(/w=\\d+/, 'w=1400').replace(/q=\\d+/, 'q=90');
  lbImg.src = src;
  lbImg.alt = img.alt;
  lbCaption.textContent = img.alt;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// ── Active nav highlight — runs after sections are injected ───────────────────
function _initObserver() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-inner a');
  const observer  = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const link = document.querySelector(\`.nav-inner a[href="#\${entry.target.id}"]\`);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  sections.forEach(s => observer.observe(s));
}
</script>

</body>
</html>`;

const outPath = join(__dirname, 'index.html');
writeFileSync(outPath, html, 'utf8');
console.log(`✓ Built dynamic index.html — ${contentFiles.length} sections loaded at runtime on each refresh`);
contentFiles.forEach(f => console.log(`  - ${f}`));

// Deploy to Unraid share if mounted
if (existsSync(UNRAID_BASE)) {
  copyFileSync(outPath, UNRAID_INDEX);
  console.log(`✓ Deployed index.html → ${UNRAID_INDEX}`);

  mkdirSync(UNRAID_SECTIONS, { recursive: true });
  for (const f of allFiles) {
    copyFileSync(join(sectionsDir, f), join(UNRAID_SECTIONS, f));
  }
  console.log(`✓ Synced ${allFiles.length} section files → ${UNRAID_SECTIONS}\\`);
} else {
  console.log(`⚠ Unraid share not mounted — skipping deploy`);
}
