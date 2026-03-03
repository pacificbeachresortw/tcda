const fs = require('fs');
const p = 'c:/Users/admin/Desktop/tcda/admin.html';
let c = fs.readFileSync(p, 'utf8');

// 替換實際的中文字
const pairs = [
  ['吵交集團TCDA', '台灣網路觀察新聞網 TNC'],
  ['吵交集團 TCDA', '台灣網路觀察新聞網 TNC'],
  ['吵交集團', '台灣網路觀察新聞網'],
  ['吵交新聞媒體網', '台灣網路觀察新聞網'],
  ['台灣反屁孩協會', '台灣網路觀察新聞網'],
  // Unicode escape 版本（在 JS 字串裡用 \u 寫的）
  ['\\u5435\\u4ea4\\u96c6\\u5718', '\\u53f0\\u7063\\u7db2\\u8def\\u89c0\\u5bdf\\u65b0\\u805e\\u7db2'],
  ['\\u53f0\\u7063\\u53cd\\u5c41\\u5b69\\u5354\\u6703', '\\u53f0\\u7063\\u7db2\\u8def\\u89c0\\u5bdf\\u65b0\\u805e\\u7db2'],
  // OG meta content
  ['TCDA NEWS\uff5c\u5435\u4ea4\u96c6\u5718', 'TNC NEWS\uff5c\u53f0\u7063\u7db2\u8def\u89c0\u5bdf\u65b0\u805e\u7db2'],
  ['TCDA NEWS', 'TNC NEWS'],
];

for (const [from, to] of pairs) {
  if (c.includes(from)) {
    c = c.split(from).join(to);
    console.log(`  Replaced: "${from}" -> "${to}"`);
  }
}

fs.writeFileSync(p, c, 'utf8');
console.log('Done: admin.html updated.');
