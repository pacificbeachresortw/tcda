/**
 * 吵交集團 TCDA — 新聞載入器 v2
 * 修正：escHtml、coverImage 相容、卡片點擊跳轉
 */

const TCDA_NEWS = (() => {

  const STORAGE_KEY = 'tcda_jsonbin_config';

  function getConfig() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }

  // 取得新聞封面圖（相容新舊資料結構）
  function getCover(item) {
    return item.coverImage
      || (item.images && item.images.length && item.images[0].url)
      || item.imageUrl
      || '';
  }

  // 正確的 HTML 轉義（用 Unicode escape 防止格式化工具還原）
  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '\u0026amp;')
      .replace(/</g, '\u0026lt;')
      .replace(/>/g, '\u0026gt;')
      .replace(/"/g, '\u0026quot;')
      .replace(/'/g, '\u002639;');
  }

  // 格式化時間
  function fmtTime(iso) {
    if (!iso) return '--:--';
    const d = new Date(iso);
    return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  }
  function fmtDate(iso) {
    if (!iso) return '— —';
    return new Date(iso).toLocaleDateString('zh-TW', {year:'numeric',month:'long',day:'numeric'});
  }

  const CAT = {breaking:'即時',entertainment:'娛樂',internet:'網路',roblox:'ROBLOX',life:'生活'};
  function catLabel(c) { return CAT[c] || c || '新聞'; }

  // ===== HTML 渲染 =====

  function cardHTML(item, delay) {
    delay = delay || 0;
    const cover = getCover(item);
    const imgPart = cover
      ? '<img src="'+esc(cover)+'" alt="'+esc(item.title)+'" class="card-real-img" loading="lazy">'
      : '<div class="card-img-placeholder"></div>';
    const views = item.views || 0;
    const id = esc(item.id);
    return '<div class="news-card anim-card" style="animation-delay:'+delay+'s;cursor:pointer"'
      + ' onclick="window.location.href=\'news/'+id+'.html\'">'
      + imgPart
      + '<div class="card-body">'
      + '<span class="cat-tag">'+esc(catLabel(item.category))+'</span>'
      + '<p class="card-title-real">'+esc(item.title)+'</p>'
      + '<p class="card-desc">'+esc(item.excerpt||'')+'</p>'
      + '<div class="card-footer-row">'
      + '<span class="card-time-tag">'+fmtDate(item.publishedAt)+'</span>'
      + '<span class="card-views">&#128065; '+views.toLocaleString()+'</span>'
      + '</div></div></div>';
  }

  function breakingItemHTML(item, delay) {
    delay = delay || 0;
    return '<li class="breaking-item anim-card" style="animation-delay:'+delay+'s;cursor:pointer"'
      + ' onclick="window.location.href=\'news/'+esc(item.id)+'.html\'">'
      + '<span class="breaking-dot active-dot"></span>'
      + '<div class="breaking-body">'
      + '<span class="breaking-time">'+fmtTime(item.publishedAt)+'</span>'
      + '<span class="breaking-tag-badge">'+esc(catLabel(item.category))+'</span>'
      + '<span class="breaking-text">'+esc(item.title)+'</span>'
      + '</div></li>';
  }

  function headlineMainHTML(item) {
    const cover = getCover(item);
    const imgPart = cover
      ? '<img src="'+esc(cover)+'" alt="'+esc(item.title)+'" class="big-img-real" loading="lazy">'
      : '<div class="big-img"><span class="img-placeholder-text">暫無圖片</span></div>';
    return '<div class="headline-main anim-card" style="cursor:pointer" onclick="window.location.href=\'news/'+esc(item.id)+'.html\'">'
      + imgPart
      + '<div class="empty-content">'
      + '<span class="tag-badge">'+esc(catLabel(item.category))+'</span>'
      + '<p class="no-news-title" style="color:#111;font-size:1.3rem;">'+esc(item.title)+'</p>'
      + '<p class="no-news-desc" style="color:#555;">'+esc(item.excerpt||'')+'</p>'
      + '<span class="time-tag">'+fmtDate(item.publishedAt)+'</span>'
      + '</div></div>';
  }

  function headlineSmallHTML(item) {
    const cover = getCover(item);
    const imgPart = cover
      ? '<img src="'+esc(cover)+'" alt="" class="small-img-real" loading="lazy">'
      : '<div class="empty-img-sm"></div>';
    return '<div class="small-card anim-card" style="cursor:pointer" onclick="window.location.href=\'news/'+esc(item.id)+'.html\'">'
      + imgPart
      + '<div class="small-card-body">'
      + '<span class="tag-badge sm-badge">'+esc(catLabel(item.category))+'</span>'
      + '<p class="no-news-sm" style="color:#333;">'+esc(item.title)+'</p>'
      + '</div></div>';
  }

  function hotItemHTML(item, rank) {
    const cls = rank <= 3 ? 'rank rank'+rank : 'rank';
    const r = String(rank).padStart(2,'0');
    return '<li style="cursor:pointer" onclick="window.location.href=\'news/'+esc(item.id)+'.html\'">'
      + '<span class="'+cls+'">'+r+'</span>'
      + '<span class="hot-title">'+esc(item.title)+'</span></li>';
  }

  function newsListItemHTML(item) {
    return '<li class="news-item" style="cursor:pointer" onclick="window.location.href=\'news/'+esc(item.id)+'.html\'">'
      + '<span class="dot active-dot"></span>'
      + '<span class="time-sm">'+fmtTime(item.publishedAt)+'</span>'
      + '<span class="news-title-sm">'+esc(item.title)+'</span>'
      + '</li>';
  }

  function emptyCards(cat, count) {
    let h = '';
    for (let i = 0; i < count; i++) {
      h += '<div class="news-card anim-card" style="animation-delay:'+(i*0.05)+'s">'
        + '<div class="card-img-placeholder"></div>'
        + '<div class="card-body"><span class="cat-tag">'+catLabel(cat)+'</span>'
        + '<p class="no-news">暫無新聞</p>'
        + '<p class="card-desc">目前此分類暫無相關報導。</p>'
        + '</div></div>';
    }
    return h;
  }

  function emptyBreakingItems(count) {
    let h = '';
    for (let i = 0; i < count; i++) {
      h += '<li class="breaking-item anim-card" style="animation-delay:'+(i*0.05)+'s">'
        + '<span class="breaking-dot"></span>'
        + '<div class="breaking-body">'
        + '<span class="breaking-time">--:--</span>'
        + '<span class="breaking-tag-badge">即時</span>'
        + '<span class="breaking-text">暫無新聞</span>'
        + '</div></li>';
    }
    return h;
  }

  // ===== 快取與載入 =====

  async function fetchNews() {
    const cfg = getConfig();
    // 優先用 tcda-config.js 的公開 Bin ID，fallback 至 localStorage
    const binId = (window.TCDA_BIN_ID && window.TCDA_BIN_ID !== 'YOUR_BIN_ID_HERE')
      ? window.TCDA_BIN_ID
      : cfg.binId;
    if (!binId) return [];
    const CK = 'tcda_news_cache', CT = 'tcda_news_cache_time';
    const now = Date.now();
    const cached = sessionStorage.getItem(CK);
    const cachedAt = parseInt(sessionStorage.getItem(CT) || '0');
    if (cached && (now - cachedAt) < 60000) {
      try { return JSON.parse(cached); } catch {}
    }
    try {
      const headers = {};
      if (cfg.masterKey) headers['X-Master-Key'] = cfg.masterKey;
      const res = await fetch('https://api.jsonbin.io/v3/b/'+binId+'/latest', {headers});
      if (!res.ok) return [];
      const json = await res.json();
      const news = json.record && json.record.news ? json.record.news : [];
      sessionStorage.setItem(CK, JSON.stringify(news));
      sessionStorage.setItem(CT, String(now));
      return news;
    } catch { return []; }
  }

  function filterByCategory(news, cat) {
    if (!cat || cat === 'all') return news;
    return news.filter(n => n.category === cat);
  }

  function reObserve(container) {
    if (!window._tcdaObserver) return;
    container.querySelectorAll('.anim-card,.fade-in').forEach(el => window._tcdaObserver.observe(el));
  }

  // ===== 首頁 =====

  async function renderIndex() {
    const all = await fetchNews();
    if (!all.length) return;

    // 頭條
    const headlines = all.filter(n => n.isHeadline);
    const hg = document.querySelector('.headline-grid');
    if (hg && headlines.length) {
      const sides = headlines.slice(1, 4);
      let sideHTML = sides.map(headlineSmallHTML).join('');
      for (let i = sides.length; i < 3; i++) {
        sideHTML += '<div class="small-card empty-card anim-card"><div class="empty-img-sm"></div>'
          + '<div class="small-card-body"><span class="tag-badge sm-badge">頭條</span>'
          + '<p class="no-news-sm">暫無新聞</p></div></div>';
      }
      hg.innerHTML = headlineMainHTML(headlines[0]) + '<div class="headline-side">'+sideHTML+'</div>';
      reObserve(hg);
    }

    // 即時新聞列表
    const bSec = document.querySelector('[data-section="breaking"]');
    if (bSec) {
      const list = bSec.querySelector('.news-list');
      if (list) {
        const items = all.slice(0, 5);
        list.innerHTML = items.length ? items.map(newsListItemHTML).join('')
          : '<li class="news-item"><span class="dot"></span><span class="time-sm">--:--</span><span class="no-news-inline">暫無新聞</span></li>'.repeat(5);
        reObserve(list);
      }
      const ml = bSec.querySelector('.more-link');
      if (ml) ml.href = 'breaking.html';
    }

    // 分類卡片：依最新文章時間排序，有新聞的分類排前面
    const cats = ['internet','roblox','entertainment','life'];
    const catOrder = cats.map(cat => {
      const items = filterByCategory(all, cat);
      const latest = items.length ? new Date(items[0].publishedAt).getTime() : 0;
      return {cat, items, latest};
    }).sort((a, b) => b.latest - a.latest);

    // 找到第一個有 data-section 的父容器，重新排列
    const mainContent = document.querySelector('.main-content');
    catOrder.forEach(({cat, items}) => {
      const sec = document.querySelector('[data-section="'+cat+'"]');
      if (!sec) return;
      const grid = sec.querySelector('.card-grid');
      if (!grid) return;
      grid.innerHTML = items.length ? items.slice(0,3).map((n,i) => cardHTML(n, i*0.05)).join('') : emptyCards(cat, 3);
      reObserve(grid);
      const ml = sec.querySelector('.more-link');
      if (ml) ml.href = cat+'.html';
      // 把有新聞的分類移到 main-content 最後（保持位置但視覺上排序）
      if (mainContent && items.length) mainContent.appendChild(sec);
    });

    // 熱門
    const hl = document.querySelector('.hot-list');
    if (hl) {
      const top5 = all.slice(0, 5);
      hl.innerHTML = top5.length ? top5.map((n,i) => hotItemHTML(n,i+1)).join('')
        : [1,2,3,4,5].map(i => '<li><span class="'+(i<=3?'rank rank'+i:'rank')+'">'+String(i).padStart(2,'0')+'</span><span class="no-news-inline">暫無新聞</span></li>').join('');
      reObserve(hl);
    }
  }

  // ===== 分類頁 =====

  async function renderCategory(category) {
    const all = await fetchNews();
    const catNews = filterByCategory(all, category);

    document.querySelectorAll('.card-grid').forEach(grid => {
      const sec = grid.closest('[data-section]');
      const secCat = sec ? sec.dataset.section : category;
      const items = filterByCategory(all, secCat).slice(0, 3);
      grid.innerHTML = items.length ? items.map((n,i) => cardHTML(n, i*0.05)).join('') : emptyCards(secCat, 3);
      reObserve(grid);
    });

    const bl = document.querySelector('.breaking-list');
    if (bl) {
      const items = catNews.slice(0, 8);
      bl.innerHTML = items.length ? items.map((n,i) => breakingItemHTML(n, i*0.05)).join('') : emptyBreakingItems(8);
      reObserve(bl);
    }

    const hl = document.querySelector('.hot-list');
    if (hl && all.length) {
      hl.innerHTML = all.slice(0,5).map((n,i) => hotItemHTML(n,i+1)).join('');
      reObserve(hl);
    }
  }

  // ===== 自動判斷頁面 =====

  function autoRender() {
    const raw = location.pathname.split('/').pop() || '';
    // 相容有無 .html 副檔名（Cloudflare Pages Pretty URLs）
    const path = raw.replace(/\.html$/, '') || 'index';
    if (path === 'index' || path === '') renderIndex();
    else if (path === 'breaking') renderCategory('breaking');
    else if (path === 'entertainment') renderCategory('entertainment');
    else if (path === 'internet') renderCategory('internet');
    else if (path === 'roblox') renderCategory('roblox');
    else if (path === 'life') renderCategory('life');
  }

  // ===== 查看計數（用於 article.html 直接呼叫） =====

  async function trackView(id) {
    const sk = 'tcda_viewed_'+id;
    if (sessionStorage.getItem(sk)) return;
    sessionStorage.setItem(sk, '1');
    const cfg = getConfig();
    if (!cfg.binId || !cfg.masterKey) return;
    try {
      const h = {'X-Master-Key': cfg.masterKey};
      const res = await fetch('https://api.jsonbin.io/v3/b/'+cfg.binId+'/latest', {headers:h});
      if (!res.ok) return;
      const json = await res.json();
      const news = json.record && json.record.news ? json.record.news : [];
      const idx = news.findIndex(n => n.id === id);
      if (idx === -1) return;
      news[idx].views = (news[idx].views || 0) + 1;
      await fetch('https://api.jsonbin.io/v3/b/'+cfg.binId, {
        method: 'PUT',
        headers: {'Content-Type':'application/json','X-Master-Key':cfg.masterKey,'X-Bin-Versioning':'false'},
        body: JSON.stringify({news})
      });
      sessionStorage.removeItem('tcda_news_cache');
      sessionStorage.removeItem('tcda_news_cache_time');
    } catch {}
  }

  return { fetchNews, filterByCategory, autoRender, getConfig, getCover, trackView };
})();

// 確保無論何時載入都會執行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => TCDA_NEWS.autoRender());
} else {
  TCDA_NEWS.autoRender();
}
