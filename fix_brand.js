const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/admin/Desktop/tcda';
const exts = ['.html', '.js', '.css'];

const replacements = [
  ['台灣網路觀察新聞網 TNC', '台灣網路觀察新聞網 TNC'],
  ['台灣網路觀察新聞網 TNC', '台灣網路觀察新聞網 TNC'],
  ['台灣網路觀察新聞網', '台灣網路觀察新聞網'],
  ['TNC新聞網', 'TNC新聞網'],
];

function walk(d) {
  fs.readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    const stat = fs.statSync(p);
    if (stat.isDirectory() && !f.startsWith('.') && f !== 'node_modules') {
      walk(p);
    } else if (stat.isFile() && exts.includes(path.extname(f))) {
      let c = fs.readFileSync(p, 'utf8');
      let changed = false;
      for (const [from, to] of replacements) {
        if (c.includes(from)) {
          c = c.split(from).join(to);
          changed = true;
          console.log(`  [${f}] "${from}" -> "${to}"`);
        }
      }
      if (changed) {
        fs.writeFileSync(p, c, 'utf8');
        console.log('Updated:', f);
      }
    }
  });
}

walk(dir);
console.log('Done.');
