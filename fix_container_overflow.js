const fs = require('fs');
const path = require('path');
const base = 'c:/Users/admin/Desktop/tcda';

// ── 問題1: .article-img-block 容器有 overflow:hidden，切掉圖片 ──
// ── 問題2: 快取讓刪除的新聞仍顯示 ──

const containerFixes = [
  // article-img-block 移除 overflow:hidden，避免裁切圖片
  [
    '.article-img-block{background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden}',
    '.article-img-block{background:#fff;border:1px solid #eee;border-radius:12px;overflow:visible}'
  ],
  // 有些版本用 overflow: hidden 在不同地方
  ['overflow:hidden}', 'overflow:visible}'],
];

// 修正所有 news/*.html
const newsDir = path.join(base, 'news');
fs.readdirSync(newsDir).forEach(f => {
  if (!f.endsWith('.html')) return;
  const p = path.join(newsDir, f);
  let c = fs.readFileSync(p, 'utf8');
  let changed = false;

  // Fix 1: article-img-block overflow
  if (c.includes('.article-img-block{background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden}')) {
    c = c.replace(
      '.article-img-block{background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden}',
      '.article-img-block{background:#fff;border:1px solid #eee;border-radius:12px;overflow:visible}'
    );
    changed = true;
    console.log(`[news/${f}] Fixed article-img-block overflow`);
  }

  // Fix 2: Make sure img CSS uses contain not cover (double-check)
  if (c.includes('object-fit:cover') && c.includes('article-img')) {
    c = c.replace(/\.article-img-block img\{[^}]+\}/g, 
      '.article-img-block img{width:100%!important;height:auto!important;max-height:none!important;object-fit:contain!important;display:block!important;}');
    changed = true;
    console.log(`[news/${f}] Re-fixed article-img-block img CSS`);
  }

  if (changed) fs.writeFileSync(p, c, 'utf8');
});

// 修正 style.css
const cssPath = path.join(base, 'style.css');
let css = fs.readFileSync(cssPath, 'utf8');
let cssChanged = false;

// Fix article-img-block in style.css
if (css.includes('.article-img-block') || css.includes('article-img')) {
  // Replace any article-img-block rules
  css = css.replace(/\.article-img-block\s*\{[^}]*overflow\s*:\s*hidden[^}]*\}/g, m =>
    m.replace('overflow:hidden', 'overflow:visible').replace('overflow: hidden', 'overflow: visible')
  );
  // Fix article-img-block img
  css = css.replace(/\.article-img-block\s+img\s*\{[^}]+\}/g,
    '.article-img-block img{width:100%!important;height:auto!important;max-height:none!important;object-fit:contain!important;display:block!important;}'
  );
  cssChanged = true;
  console.log('[style.css] Fixed article-img-block');
}
if (cssChanged) fs.writeFileSync(cssPath, css, 'utf8');

// ── 修正 news-loader.js：縮短 sessionStorage 快取時間（5分鐘→0），讓刪除立刻生效 ──
const loaderPath = path.join(base, 'news-loader.js');
let loader = fs.readFileSync(loaderPath, 'utf8');
let loaderChanged = false;

// 找到快取時間設定（通常是毫秒或秒）
// 常見模式: const CACHE_TTL = 5 * 60 * 1000 或類似
// 把快取時間設為 0 或 30 秒讓刪除後很快反映
if (loader.includes('CACHE') || loader.includes('cache') || loader.includes('CK') || loader.includes('sessionStorage')) {
  // 找 sessionStorage 的 time key 並強制過期
  const oldTtl1 = '5 * 60 * 1000';
  const oldTtl2 = '300000';
  const oldTtl3 = '60 * 1000';
  if (loader.includes(oldTtl1)) {
    loader = loader.split(oldTtl1).join('30 * 1000');
    loaderChanged = true;
    console.log('[news-loader.js] Reduced cache TTL from 5min to 30s');
  }
  if (loader.includes(oldTtl2)) {
    loader = loader.split(oldTtl2).join('30000');
    loaderChanged = true;
    console.log('[news-loader.js] Reduced cache TTL 300000 -> 30000');
  }
}
if (loaderChanged) fs.writeFileSync(loaderPath, loader, 'utf8');

// 修正 admin.html template 的 article-img-block
const adminPath = path.join(base, 'admin.html');
let adm = fs.readFileSync(adminPath, 'utf8');
if (adm.includes('overflow:hidden')) {
  adm = adm.replace(
    "'+'.article-img-block{background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden}\\n'",
    "'+'.article-img-block{background:#fff;border:1px solid #eee;border-radius:12px;overflow:visible}\\n'"
  );
  fs.writeFileSync(adminPath, adm, 'utf8');
  console.log('[admin.html] Fixed article-img-block overflow in template');
}

console.log('\nDone.');
