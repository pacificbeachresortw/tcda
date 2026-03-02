/**
 * 吵交集團 TCDA — Cloudflare Worker
 * Route 設定：*twcda.com/article.html*
 */

// ★★★ 必填：把下面這行的 YOUR_BIN_ID_HERE 換成你的 JSONBin Bin ID ★★★
const BIN_ID = '69a4f22943b1c97be9aa9f9a';
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const id  = url.searchParams.get('id');

  // 跳過條件：
  // 1. 沒有 id
  // 2. BIN_ID 未設定
  // 3. 帶有 noworker 參數（避免無限跳轉）
  if (!id || !BIN_ID || BIN_ID === 'YOUR_BIN_ID_HERE' || url.searchParams.get('noworker')) {
    return fetch(request);
  }

  // 從 JSONBin 抓取新聞
  let article = null;
  try {
    const nr = await fetch('https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest');
    if (nr.ok) {
      const j    = await nr.json();
      const news = j.record && j.record.news ? j.record.news : [];
      article    = news.find(n => n.id === id) || null;
    }
  } catch(_) {}

  if (!article) {
    return fetch(request);
  }

  const title = (article.title || '') + ' - TCDA NEWS';
  const desc  = (article.excerpt || article.content || '台灣反屁孩協會官方媒體').slice(0, 200);
  const img   = article.coverImage ||
                (article.images && article.images[0] ? article.images[0].url : '') || '';
  const real  = 'https://twcda.com/article.html?id=' + encodeURIComponent(id) + '&noworker=1';

  const html =
    '<!DOCTYPE html><html><head>' +
    '<meta charset="UTF-8"/>' +
    '<title>' + title + '</title>' +
    '<meta property="og:site_name" content="TCDA NEWS | 吵交集團"/>' +
    '<meta property="og:type" content="article"/>' +
    '<meta property="og:title" content="' + title + '"/>' +
    '<meta property="og:description" content="' + desc + '"/>' +
    '<meta property="og:image" content="' + img + '"/>' +
    '<meta property="og:url" content="' + request.url + '"/>' +
    '<meta name="twitter:card" content="summary_large_image"/>' +
    '<meta name="twitter:title" content="' + title + '"/>' +
    '<meta name="twitter:description" content="' + desc + '"/>' +
    '<meta name="twitter:image" content="' + img + '"/>' +
    '<meta http-equiv="refresh" content="0;url=' + real + '"/>' +
    '</head><body>' +
    '<script>window.location.replace("' + real + '");<\/script>' +
    '<noscript><a href="' + real + '">閱讀文章</a></noscript>' +
    '</body></html>';

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'no-store',
    }
  });
}
