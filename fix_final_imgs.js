const fs = require('fs');
const path = require('path');
const newsDir = 'c:/Users/admin/Desktop/tcda/news';

const OLD = '.article-img-block img{width:100%;max-height:420px;object-fit:cover;display:block}';
const NEW = '.article-img-block img{width:100%;height:auto;max-height:90vh;object-fit:contain;display:block;background:#111;}';

const OLD_COVER = '.article-cover{width:100%;max-height:480px;object-fit:cover;border-radius:14px;margin-bottom:8px;display:block}';
const NEW_COVER = '.article-cover{width:100%;height:auto;max-height:90vh;object-fit:contain;border-radius:14px;margin-bottom:8px;display:block;background:#f5f5f5;}';

let fixed = 0;
fs.readdirSync(newsDir).forEach(f => {
  if (!f.endsWith('.html')) return;
  const p = path.join(newsDir, f);
  let c = fs.readFileSync(p, 'utf8');
  let changed = false;

  if (c.includes(OLD)) {
    c = c.split(OLD).join(NEW);
    changed = true;
    console.log(`[${f}] Fixed article-img-block img`);
  }
  if (c.includes(OLD_COVER)) {
    c = c.split(OLD_COVER).join(NEW_COVER);
    changed = true;
    console.log(`[${f}] Fixed article-cover`);
  }
  // Also fix any remaining object-fit:cover with max-height in these files
  if (c.includes('max-height:420px') || c.includes('max-height:480px')) {
    c = c.replace(/max-height:420px;object-fit:cover/g, 'height:auto;max-height:90vh;object-fit:contain');
    c = c.replace(/max-height:480px;object-fit:cover/g, 'height:auto;max-height:90vh;object-fit:contain');
    changed = true;
    console.log(`[${f}] Fixed remaining max-height patterns`);
  }

  if (changed) {
    fs.writeFileSync(p, c, 'utf8');
    fixed++;
  } else {
    console.log(`[${f}] OK (no match)`);
  }
});
console.log('\nFixed:', fixed, 'files');
