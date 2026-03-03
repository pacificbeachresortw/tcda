/**
 * 在 article.html 直接加入全域圖片智慧樣式
 * 不依賴 news-loader.js 的渲染模式
 */
const fs = require('fs');
const p = 'c:/Users/admin/Desktop/tcda/article.html';
let c = fs.readFileSync(p, 'utf8');

// ── 插入強制覆蓋的 CSS ─────────────────────────────────────
const forceCss = `
    /* ════ 智慧圖片全域覆蓋 (強制) ════ */
    .article-cover,
    .article-wrap img,
    .article-body img,
    .article-loading img,
    [id="article-wrap"] img {
      max-width: 100% !important;
      height: auto !important;
      object-fit: initial !important;
      max-height: none !important;
      border-radius: 12px;
      display: block;
      margin: 0 auto 8px;
    }
    /* 橫式：限制最大高度避免太高 */
    .article-wrap img.img-landscape { max-height: 520px !important; object-fit: cover !important; }
    /* 直式：顯示完整圖片 */
    .article-wrap img.img-portrait  { max-height: 800px !important; object-fit: contain !important; background: #111; }
    /* 容器 */
    .article-cover-wrap, .cover-img-wrap {
      width: 100%; border-radius: 14px; overflow: hidden;
      background: #f5f5f5; margin-bottom: 8px;
    }`;

if (!c.includes('智慧圖片全域覆蓋')) {
  c = c.replace('</style>', forceCss + '\n    </style>');
  console.log('+ Added force CSS');
}

// ── 插入強制 JS（MutationObserver，在文章渲染後自動套用）───────
const forceJs = `
<script>
// ════ 智慧圖片自動套用（在 news-loader 渲染後執行）════
(function() {
  function fitImg(img) {
    if (img.complete && img.naturalWidth) {
      applyFit(img);
    } else {
      img.addEventListener('load', function() { applyFit(this); }, { once: true });
    }
  }
  function applyFit(img) {
    if (!img.naturalWidth) return;
    img.classList.remove('img-landscape', 'img-portrait');
    if (img.naturalHeight > img.naturalWidth * 1.05) {
      img.classList.add('img-portrait');
      img.style.maxHeight = '800px';
      img.style.objectFit = 'contain';
    } else {
      img.classList.add('img-landscape');
      img.style.maxHeight = '520px';
      img.style.objectFit = 'cover';
      img.style.width = '100%';
    }
  }
  function scanImgs() {
    var wrap = document.getElementById('article-wrap') || document.querySelector('.article-wrap');
    if (!wrap) return;
    wrap.querySelectorAll('img').forEach(fitImg);
  }
  // 初始掃描
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanImgs);
  } else {
    scanImgs();
  }
  // MutationObserver 監聽動態插入的圖片
  var ob = new MutationObserver(function(muts) {
    muts.forEach(function(m) {
      m.addedNodes.forEach(function(n) {
        if (n.nodeType === 1) {
          if (n.tagName === 'IMG') { fitImg(n); }
          else { n.querySelectorAll && n.querySelectorAll('img').forEach(fitImg); }
        }
      });
    });
  });
  var root = document.getElementById('article-wrap') || document.body;
  ob.observe(root, { childList: true, subtree: true });
  // 延遲補掃（防止載入時序問題）
  setTimeout(scanImgs, 500);
  setTimeout(scanImgs, 1500);
  setTimeout(scanImgs, 3000);
})();
</script>`;

if (!c.includes('智慧圖片自動套用')) {
  c = c.replace('</body>', forceJs + '\n</body>');
  console.log('+ Added force JS MutationObserver');
}

fs.writeFileSync(p, c, 'utf8');
console.log('article.html updated.');
