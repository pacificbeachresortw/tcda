/**
 * 修正所有既有 news/*.html 靜態檔案的圖片顯示
 * 將舊版固定 max-height/object-fit 換成智慧直/橫偵測
 */
const fs = require('fs');
const path = require('path');

const newsDir = 'c:/Users/admin/Desktop/tcda/news';

const smartCSS = `
    .smart-img-wrap{width:100%;border-radius:14px;overflow:hidden;background:#f5f5f5;margin-bottom:8px;display:flex;align-items:center;justify-content:center;}
    .smart-img-wrap.is-landscape{max-height:520px;}
    .smart-img-wrap.is-portrait{max-height:700px;background:#111;}
    .smart-img-wrap img{width:100%;display:block;transition:none;}
    .smart-img-wrap.is-landscape img{object-fit:cover;max-height:520px;}
    .smart-img-wrap.is-portrait img{object-fit:contain;max-height:700px;}
    .article-img-block .smart-img-wrap{border-radius:0;margin-bottom:0;}
    .article-cover-placeholder{width:100%;height:220px;background:#eee;border-radius:14px;margin-bottom:8px;}`;

const smartJS = `
<script>
(function(){
  function fit(img){
    function go(){
      if(!img.naturalWidth) return;
      var w=img.parentElement;
      if(!w||!w.classList.contains('smart-img-wrap')) return;
      if(img.naturalHeight > img.naturalWidth * 1.05){
        w.className='smart-img-wrap is-portrait';
      } else {
        w.className='smart-img-wrap is-landscape';
      }
    }
    if(img.complete && img.naturalWidth){ go(); } else { img.onload=go; }
  }
  document.querySelectorAll('.smart-img-wrap img').forEach(fit);
})();
</script>`;

let fixed = 0;

fs.readdirSync(newsDir).forEach(f => {
  if (!f.endsWith('.html')) return;
  const p = path.join(newsDir, f);
  let c = fs.readFileSync(p, 'utf8');
  let changed = false;

  // 1. 替換舊版 article-cover CSS
  const oldCSS1 = '.article-cover{width:100%;max-height:480px;object-fit:cover;border-radius:14px;margin-bottom:8px;display:block}';
  const oldCSS2 = '.article-cover-placeholder{width:100%;height:300px;background:linear-gradient(90deg,#ddd 25%,#eee 50%,#ddd 75%);background-size:600px 100%;border-radius:14px';
  
  if (c.includes(oldCSS1) && !c.includes('smart-img-wrap')) {
    // 在 </style> 前插入新 CSS，替換舊 article-cover
    c = c.replace(oldCSS1, '.article-cover{width:100%;display:block}');
    // 插入 smart CSS
    c = c.replace('</style>', smartCSS + '\n    </style>');
    changed = true;
  }

  // 2. 包裝封面圖 - 把 <img ... class="article-cover" ...> 包進 smart-img-wrap
  if (!c.includes('smart-img-wrap') && c.includes('article-cover')) {
    c = c.replace(
      /(<img\s[^>]*class="article-cover"[^>]*>)/g,
      '<div class="smart-img-wrap">$1</div>'
    );
    if (!c.includes('smart-img-wrap{')) {
      c = c.replace('</style>', smartCSS + '\n    </style>');
    }
    changed = true;
  }

  // 3. 如果已有 smart-img-wrap 但 CSS 是舊版本，也更新
  if (c.includes('smart-img-wrap') && c.includes('max-height:480px') && !c.includes('max-height:520px')) {
    c = c.replace(/max-height:480px/g, 'max-height:520px');
    changed = true;
  }

  // 4. 加入 JS（若還沒有）
  if (!c.includes('naturalHeight') && c.includes('smart-img-wrap')) {
    c = c.replace('</body>', smartJS + '\n</body>');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(p, c, 'utf8');
    fixed++;
    console.log('Fixed:', f);
  } else {
    console.log('OK:', f);
  }
});

console.log('\nTotal fixed:', fixed, '/', fs.readdirSync(newsDir).filter(f=>f.endsWith('.html')).length);
