const fs = require('fs');
const p = 'c:/Users/admin/Desktop/tcda/article.html';
let c = fs.readFileSync(p, 'utf8');
let changed = false;

// 修正所有會裁切圖片的 CSS 規則
const fixes = [
  // article-img-block 裡的圖片 - 主要問題所在
  ['.article-img-block img{width:100%;max-height:420px;object-fit:cover;display:block}',
   '.article-img-block img{width:100%;height:auto;max-height:90vh;object-fit:contain;display:block;background:#111;}'],

  // article-cover（封面圖）
  ['.article-cover{width:100%;max-height:480px;object-fit:cover;border-radius:14px;margin-bottom:8px;display:block}',
   '.article-cover{width:100%;height:auto;max-height:90vh;object-fit:contain;border-radius:14px;margin-bottom:8px;display:block;background:#111;}'],

  // 以防有不同寫法（有分號空格變體）
  ['max-height:420px;object-fit:cover', 'height:auto;max-height:90vh;object-fit:contain'],
  ['max-height:480px;object-fit:cover;border-radius:14px', 'height:auto;max-height:90vh;object-fit:contain;border-radius:14px'],
];

for (const [from, to] of fixes) {
  if (c.includes(from)) {
    c = c.split(from).join(to);
    changed = true;
    console.log('Fixed:', from.substring(0, 60));
  }
}

// 也把 JS 裡的 maxHeight 520px → 90vh（for landscape images）
if (c.includes("img.style.maxHeight = '520px'")) {
  c = c.split("img.style.maxHeight = '520px'").join("img.style.maxHeight = '90vh'");
  changed = true;
  console.log('Fixed JS maxHeight 520px -> 90vh');
}
// Portrait 800px → 90vh
if (c.includes("img.style.maxHeight = '800px'")) {
  c = c.split("img.style.maxHeight = '800px'").join("img.style.maxHeight = '90vh'");
  changed = true;
  console.log('Fixed JS maxHeight 800px -> 90vh');
}

if (changed) {
  fs.writeFileSync(p, c, 'utf8');
  console.log('article.html updated.');
} else {
  console.log('No matching patterns found.');
}
