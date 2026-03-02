/**
 * Cloudflare Pages Function — 瀏覽次數追蹤
 * POST /api/views?id=<articleId>
 *
 * 使用 Cloudflare 環境變數安全儲存 master key，
 * 讓所有訪客都能觸發瀏覽次數更新，而不暴露 API 金鑰。
 *
 * 需在 Cloudflare Pages → Settings → Environment Variables 設定：
 *   TCDA_BIN_ID    = 你的 JSONBin Bin ID
 *   TCDA_MASTER_KEY = 你的 JSONBin Master Key
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: corsHeaders });
  }

  const binId = env.TCDA_BIN_ID || '';
  const masterKey = env.TCDA_MASTER_KEY || '';

  if (!binId || !masterKey) {
    return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 503, headers: corsHeaders });
  }

  try {
    // 讀取最新資料
    const getRes = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: { 'X-Master-Key': masterKey }
    });
    if (!getRes.ok) throw new Error('Failed to fetch data');

    const json = await getRes.json();
    const all = (json.record && json.record.news) ? json.record.news : [];
    const idx = all.findIndex(n => n.id === id);

    if (idx === -1) {
      return new Response(JSON.stringify({ error: 'Article not found' }), { status: 404, headers: corsHeaders });
    }

    // 增加瀏覽次數
    all[idx].views = (all[idx].views || 0) + 1;
    const newViews = all[idx].views;

    // 寫回 JSONBin
    await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': masterKey,
        'X-Bin-Versioning': 'false'
      },
      body: JSON.stringify({ news: all })
    });

    return new Response(JSON.stringify({ views: newViews }), { headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
