/**
 * Cloudflare Pages Function — article.html 動態 OG 標籤注入
 *
 * 設定步驟：
 * 1. 部署至 Cloudflare Pages 後，進入 Pages 專案 → Settings → Environment Variables
 * 2. 新增變數：TCDA_BIN_ID = 你的 JSONBin Bin ID
 * 3. 重新部署即可
 *
 * 此 Function 會在伺服器端抓取新聞資料，
 * 將正確的 og:title / og:image / og:description 注入 HTML，
 * 讓 Discord、LINE、Facebook 等平台分享時顯示正確預覽。
 */

function escAttr(s) {
  return String(s || '')
    .replace(/&/g, '&')
    .replace(/"/g, '"')
    .replace(/</g, '<')
    .replace(/>/g, '>');
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  // 取得靜態 article.html
  const assetRes = await env.ASSETS.fetch(new URL('/article.html', request.url));
  let html = await assetRes.text();

  // 沒有文章 ID 則直接回傳原始 HTML
  if (!id) {
    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });
  }

  // Bin ID：優先使用 CF 環境變數，fallback 至 HARDCODED（與 tcda-config.js 相同）
  const binId = env.TCDA_BIN_ID || '';
  if (!binId) {
    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });
  }

  try {
    const newsRes = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: env.TCDA_MASTER_KEY ? { 'X-Master-Key': env.TCDA_MASTER_KEY } : {}
    });

    if (newsRes.ok) {
      const json = await newsRes.json();
      const news = (json.record && json.record.news) ? json.record.news : [];
      const article = news.find(n => n.id === id);

      if (article) {
        const title = escAttr(article.title + ' — TNC NEWS｜台灣網路觀察新聞網');
        const desc = escAttr((article.excerpt || article.content || '台灣網路觀察新聞網 官方媒體').slice(0, 200));
        const image = escAttr(
          article.coverImage ||
          (article.images && article.images.length && article.images[0].url) ||
          ''
        );
        const pageUrl = escAttr(request.url);

        // 注入文章專屬 OG 標籤
        html = html
          .replace(/<title>[^<]*<\/title>/, `<title>${escAttr(article.title)} — 台灣網路觀察新聞網 TNC</title>`)
          .replace(/(<meta property="og:title" content=")[^"]*(")/,     `$1${title}$2`)
          .replace(/(<meta property="og:description" content=")[^"]*(")/,`$1${desc}$2`)
          .replace(/(<meta property="og:image" content=")[^"]*(")/,     `$1${image}$2`)
          .replace(/(<meta property="og:url" content=")[^"]*(")/,       `$1${pageUrl}$2`)
          .replace(/(<meta name="twitter:title" content=")[^"]*(")/,     `$1${title}$2`)
          .replace(/(<meta name="twitter:description" content=")[^"]*(")/,`$1${desc}$2`)
          .replace(/(<meta name="twitter:image" content=")[^"]*(")/,    `$1${image}$2`);
      }
    }
  } catch (_) {
    // 發生錯誤時回傳原始 HTML（不影響網頁功能）
  }

  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' }
  });
}
