/**
 * 修正 news-loader.js 的圖片渲染
 * 讓動態文章頁面（article.html?id=xxx）也能智慧偵測直/橫式圖片
 */
const fs = require('fs');
const p = 'c:/Users/admin/Desktop/tcda/news-loader.js';
let c = fs.readFileSync(p, 'utf8');

// ── 1. 找出封面圖的渲染 HTML，加入 smart-img-wrap ──────────────
// 舊版常見模式：article-cover img tag
// 直接把所有包含 article-cover 的 img 包起來
const patterns = [
  // pattern 1: `<img class="article-cover"...>`
  [
    /<img\s([^>]*class="article-cover"[^>]*)>/g,
    '<div class="smart-img-wrap"><img $1 onload="window._fitImg&&window._fitImg(this)"></div>'
  ],
  // pattern 2: coverImage img tag variants
  [
    /<img\s([^>]*article-cover[^>]*)\/>/g,
    '<div class="smart-img-wrap"><img $1 onload="window._fitImg&&window._fitImg(this)"/></div>'
  ],
];

let changed = false;
for (const [re, rep] of patterns) {
  const before = c;
  c = c.replace(re, rep);
  if (c !== before) { changed = true; console.log('Replaced img pattern'); }
}

// ── 2. 注入全域 _fitImg 函數（若還沒有）──────────────────────
const fitFn = `
// 智慧直/橫式圖片偵測
window._fitImg = function(img) {
  function go() {
    if (!img.naturalWidth) return;
    var w = img.parentElement;
    if (!w || !w.classList.contains('smart-img-wrap')) return;
    if (img.naturalHeight > img.naturalWidth * 1.05) {
      w.className = 'smart-img-wrap is-portrait';
    } else {
      w.className = 'smart-img-wrap is-landscape';
    }
  }
  if (img.complete && img.naturalWidth) { go(); } else { img.onload = go; }
};
`;

if (!c.includes('_fitImg') && !c.includes('smart-img-wrap')) {
  // 沒有找到圖片 pattern，在頂部插入輔助函數，並後面尋找其他封面模式
  c = fitFn + c;
  changed = true;
  console.log('Injected _fitImg at top');
} else if (c.includes('_fitImg') && !c.includes('window._fitImg = function')) {
  // 已有引用但沒有定義，加入定義
  c = fitFn + c;
  changed = true;
  console.log('Injected _fitImg definition');
}

// ── 3. 同時注入 CSS（若文章容器有內聯樣式影響的話）──────────
// 找到 renderArticle / renderContent / 相關函數，加入動態 style 注入
const cssInjection = `
  // 注入智慧圖片 CSS（若頁面還沒有）
  if (!document.getElementById('_smart-img-css')) {
    var s = document.createElement('style');
    s.id = '_smart-img-css';
    s.textContent = [
      '.smart-img-wrap{width:100%;border-radius:14px;overflow:hidden;background:#f5f5f5;margin-bottom:8px;display:flex;align-items:center;justify-content:center;}',
      '.smart-img-wrap.is-landscape{max-height:520px;}',
      '.smart-img-wrap.is-portrait{max-height:700px;background:#111;}',
      '.smart-img-wrap img{width:100%;display:block;}',
      '.smart-img-wrap.is-landscape img{object-fit:cover;max-height:520px;}',
      '.smart-img-wrap.is-portrait img{object-fit:contain;max-height:700px;}',
    ].join('');
    document.head.appendChild(s);
  }
`;

// 找到 autoRender 或 DOMContentLoaded 事件，在其中注入 CSS
if (!c.includes('_smart-img-css')) {
  // 插入到 TCDA_NEWS.autoRender 函數開頭或 DOMContentLoaded 內
  if (c.includes('DOMContentLoaded')) {
    c = c.replace(
      "document.addEventListener('DOMContentLoaded'",
      cssInjection + "\ndocument.addEventListener('DOMContentLoaded'"
    );
  } else {
    c = cssInjection + c;
  }
  changed = true;
  console.log('Injected CSS injection code');
}

if (changed) {
  fs.writeFileSync(p, c, 'utf8');
  console.log('news-loader.js updated.');
} else {
  console.log('No changes needed or pattern not found in news-loader.js');
  console.log('Manual inspection may be needed.');
}
