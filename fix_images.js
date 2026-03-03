/**
 * 修正圖片自動偵測直式/橫式
 * 修改 article.html 和 admin.html 的 buildArticleHTML
 */

const fs = require('fs');

/* ─────────────────────────────────────────────────────────
   1. 修改 article.html
   ───────────────────────────────────────────────────────── */
let art = fs.readFileSync('c:/Users/admin/Desktop/tcda/article.html', 'utf8');

// 在 </style> 前插入新的圖片樣式
const artCSS = `
    /* ── 智慧圖片顯示 ── */
    .smart-img-wrap {
      width: 100%;
      border-radius: 14px;
      overflow: hidden;
      background: #f0f0f0;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .smart-img-wrap.is-landscape { max-height: 480px; }
    .smart-img-wrap.is-portrait  { max-height: 640px; background: #111; }
    .smart-img-wrap img {
      width: 100%;
      height: 100%;
      display: block;
    }
    .smart-img-wrap.is-landscape img { object-fit: cover; max-height: 480px; }
    .smart-img-wrap.is-portrait  img { object-fit: contain; max-height: 640px; }
    .article-img-block .smart-img-wrap { border-radius: 0; margin-bottom: 0; }
`;

if (!art.includes('智慧圖片顯示')) {
  art = art.replace('</style>', artCSS + '    </style>');
  console.log('article.html: added smart-img CSS');
}

// 在 </body> 前插入 JS
const artJS = `
<script>
// 智慧偵測直式/橫式圖片
function applySmartImg(img) {
  function check() {
    if (!img.naturalWidth) return;
    const wrap = img.closest('.smart-img-wrap');
    if (!wrap) return;
    if (img.naturalHeight > img.naturalWidth * 1.1) {
      wrap.classList.add('is-portrait');
      wrap.classList.remove('is-landscape');
    } else {
      wrap.classList.add('is-landscape');
      wrap.classList.remove('is-portrait');
    }
  }
  if (img.complete && img.naturalWidth) { check(); }
  else { img.addEventListener('load', check); }
}
document.querySelectorAll('.smart-img-wrap img').forEach(applySmartImg);
// 動態載入的也處理
const imgObs = new MutationObserver(() => {
  document.querySelectorAll('.smart-img-wrap img:not([data-si])').forEach(img => {
    img.setAttribute('data-si','1');
    applySmartImg(img);
  });
});
imgObs.observe(document.body, {childList:true, subtree:true});
</script>
`;

if (!art.includes('applySmartImg')) {
  art = art.replace('</body>', artJS + '\n</body>');
  console.log('article.html: added applySmartImg JS');
}

fs.writeFileSync('c:/Users/admin/Desktop/tcda/article.html', art, 'utf8');

/* ─────────────────────────────────────────────────────────
   2. 修改 admin.html - buildArticleHTML 中的封面圖片
   ───────────────────────────────────────────────────────── */
let adm = fs.readFileSync('c:/Users/admin/Desktop/tcda/admin.html', 'utf8');

// 替換靜態 HTML 模板中的封面圖 HTML 生成
const oldCoverBuild = "coverHTML='<img src=\"'+img+'\" class=\"article-cover\" alt=\"'+a.title+'\">';";
const newCoverBuild = "coverHTML='<div class=\"smart-img-wrap\" id=\"cover-wrap\"><img src=\"'+img+'\" class=\"article-cover\" alt=\"'+a.title+'\" onload=\"(function(i){var w=i.closest(\\'#cover-wrap\\');if(w){if(i.naturalHeight>i.naturalWidth*1.1){w.className=\\'smart-img-wrap is-portrait\\';}else{w.className=\\'smart-img-wrap is-landscape\\';}}})(this)\"></div>';";

if (adm.includes(oldCoverBuild)) {
  adm = adm.replace(oldCoverBuild, newCoverBuild);
  console.log('admin.html: updated cover image HTML in buildArticleHTML');
} else {
  console.log('admin.html: cover pattern not found (may already be updated)');
}

// 替換靜態模板中的 CSS
const oldArticleCoverCSS = "'.article-cover{width:100%;max-height:480px;object-fit:cover;border-radius:14px;margin-bottom:8px;display:block}\\n'";
const newArticleCoverCSS = "'.smart-img-wrap{width:100%;border-radius:14px;overflow:hidden;background:#f0f0f0;margin-bottom:8px;display:flex;align-items:center;justify-content:center;}\\n'"
  + "+'.smart-img-wrap.is-landscape{max-height:480px;}\\n'"
  + "+'.smart-img-wrap.is-portrait{max-height:640px;background:#111;}\\n'"
  + "+'.smart-img-wrap img{width:100%;display:block;}\\n'"
  + "+'.smart-img-wrap.is-landscape img{object-fit:cover;max-height:480px;}\\n'"
  + "+'.smart-img-wrap.is-portrait img{object-fit:contain;max-height:640px;}\\n'"
  + "+'.article-cover{width:100%;display:block}\\n'";

if (adm.includes("'.article-cover{width:100%;max-height:480px;object-fit:cover;border-radius:14px;margin-bottom:8px;display:block}\\n'")) {
  adm = adm.replace(
    "'.article-cover{width:100%;max-height:480px;object-fit:cover;border-radius:14px;margin-bottom:8px;display:block}\\n'",
    newArticleCoverCSS
  );
  console.log('admin.html: updated article-cover CSS in template');
} else {
  console.log('admin.html: article-cover CSS pattern not found');
}

fs.writeFileSync('c:/Users/admin/Desktop/tcda/admin.html', adm, 'utf8');

console.log('\nDone. Run: git add -A && git commit -m "fix: smart portrait/landscape image detection" && git push');
