const fs = require('fs');
const path = require('path');
const base = 'c:/Users/admin/Desktop/tcda';

// 所有需要修正的 CSS 替換（加 !important 確保覆蓋所有情況）
const fixes = [
  [
    '.article-img-block img{width:100%;max-height:420px;object-fit:cover;display:block}',
    '.article-img-block img{width:100%!important;height:auto!important;max-height:90vh!important;object-fit:contain!important;display:block!important;background:#111!important;}'
  ],
  [
    '.article-img-block img{width:100%;height:auto;max-height:90vh;object-fit:contain;display:block;background:#111;}',
    '.article-img-block img{width:100%!important;height:auto!important;max-height:90vh!important;object-fit:contain!important;display:block!important;background:#111!important;}'
  ],
  [
    'max-height:420px;object-fit:cover;display:block',
    'height:auto!important;max-height:90vh!important;object-fit:contain!important;display:block'
  ],
  [
    'max-height:420px;object-fit:cover',
    'height:auto!important;max-height:90vh!important;object-fit:contain!important'
  ],
];

// 修正所有 news/*.html
const newsDir = path.join(base, 'news');
fs.readdirSync(newsDir).forEach(f => {
  if (!f.endsWith('.html')) return;
  const p = path.join(newsDir, f);
  let c = fs.readFileSync(p, 'utf8');
  let changed = false;
  for (const [from, to] of fixes) {
    if (c.includes(from)) { c = c.split(from).join(to); changed = true; console.log(`[news/${f}] Fixed: ${from.substring(0,50)}`); }
  }
  if (changed) fs.writeFileSync(p, c, 'utf8');
});

// 修正 style.css
const cssFile = path.join(base, 'style.css');
let css = fs.readFileSync(cssFile, 'utf8');
let cssChanged = false;
for (const [from, to] of fixes) {
  if (css.includes(from)) { css = css.split(from).join(to); cssChanged = true; console.log(`[style.css] Fixed: ${from.substring(0,50)}`); }
}
if (cssChanged) { fs.writeFileSync(cssFile, css, 'utf8'); console.log('style.css updated'); }

// 修正 admin.html template
const adminFile = path.join(base, 'admin.html');
let adm = fs.readFileSync(adminFile, 'utf8');
let admChanged = false;
for (const [from, to] of fixes) {
  if (adm.includes(from)) { adm = adm.split(from).join(to); admChanged = true; console.log(`[admin.html] Fixed: ${from.substring(0,50)}`); }
}
if (admChanged) { fs.writeFileSync(adminFile, adm, 'utf8'); console.log('admin.html updated'); }

console.log('\nDone.');
