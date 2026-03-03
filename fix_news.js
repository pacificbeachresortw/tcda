const fs = require('fs');
const path = require('path');
const newsDir = 'c:/Users/admin/Desktop/tcda/news';

fs.readdirSync(newsDir).forEach(f => {
  if (!f.endsWith('.html')) return;
  const p = path.join(newsDir, f);
  let c = fs.readFileSync(p, 'utf8');
  let changed = false;

  const pairs = [
    ['TCDA NEWS', 'TNC NEWS'],
    ['TCDA｜', 'TNC｜'],
    ['TCDA新聞網', 'TNC新聞網'],
    ['TCDA 新聞網', 'TNC 新聞網'],
    ['吵交集團TCDA', '台灣網路觀察新聞網 TNC'],
    ['吵交集團 TCDA', '台灣網路觀察新聞網 TNC'],
    ['吵交集團', '台灣網路觀察新聞網'],
    ['吵交新聞媒體網', '台灣網路觀察新聞網'],
    ['"TCDA', '"TNC'],
    ['| TCDA', '| TNC'],
  ];

  for (const [from, to] of pairs) {
    if (c.includes(from)) {
      c = c.split(from).join(to);
      changed = true;
      console.log(`  [${f}] "${from}" -> "${to}"`);
    }
  }

  if (changed) {
    fs.writeFileSync(p, c, 'utf8');
    console.log('Updated:', f);
  } else {
    console.log('OK:', f);
  }
});

console.log('Done.');
