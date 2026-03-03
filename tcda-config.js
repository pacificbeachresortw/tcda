/**
 * 台灣網路觀察學院 新聞網 TNC
 * 網站全域設定檔
 */

const TNC_CONFIG = {
  // 品牌資訊
  brand: {
    name:     '台灣網路觀察學院',
    subName:  '新聞網 TNC',
    fullName: '台灣網路觀察學院新聞網 TNC',
    abbr:     'TNC',
    // 舊名稱（保留供參考）
    legacyName: 'TCDA',
    description: '深度觀察台灣網路生態、科技趨勢與社會時事，提供獨立、客觀的報導視角。',
    copyright: '© 2025 台灣網路觀察學院新聞網 TNC. All rights reserved.',
    poweredBy: 'Powered by TNC',
  },

  // 網站基本資訊
  site: {
    url:      'https://tcda.pages.dev',
    ogImage:  'https://tcda.pages.dev/logo/TCDA (3).png',
    language: 'zh-Hant',
    locale:   'zh_TW',
  },

  // 新聞分類
  categories: [
    { id: 'breaking',      label: '即時新聞', emoji: '⚡', url: 'breaking.html'      },
    { id: 'internet',      label: '網路觀察', emoji: '🌐', url: 'internet.html'      },
    { id: 'entertainment', label: '娛樂',     emoji: '🎬', url: 'entertainment.html' },
    { id: 'life',          label: '生活',     emoji: '☀️', url: 'life.html'          },
    { id: 'roblox',        label: 'Roblox',   emoji: '🎮', url: 'roblox.html'        },
  ],

  // 文章 ID 清單（news/ 目錄下的 HTML 檔案名稱）
  newsIds: [
    'mm8mbhxvp8mr',
    'mm8meys0c83i',
    'mm8pxo88x0bq',
    'mm8tx9ps1px5',
  ],

  // 導航連結
  navLinks: [
    { label: '首頁',   url: 'index.html'         },
    { label: '即時',   url: 'breaking.html'       },
    { label: '網路',   url: 'internet.html'       },
    { label: '娛樂',   url: 'entertainment.html'  },
    { label: '生活',   url: 'life.html'           },
    { label: 'Roblox', url: 'roblox.html'         },
    { label: '關於',   url: 'about.html'          },
  ],

  // 設計 Token（與 style.css 保持一致）
  design: {
    fontFamily: "'M PLUS Rounded 1c', 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif",
    colorBlack: '#0a0a0a',
    colorWhite: '#ffffff',
    borderRadius: {
      sm:   '10px',
      md:   '16px',
      lg:   '24px',
      xl:   '36px',
      pill: '9999px',
    },
  },
};

// 讓舊版程式碼也能透過 window.TCDA_CONFIG 存取（向下相容）
if (typeof window !== 'undefined') {
  window.TNC_CONFIG   = TNC_CONFIG;
  window.TCDA_CONFIG  = TNC_CONFIG; // backward compat
}

// ES Module export（若有使用模組系統）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TNC_CONFIG;
}
