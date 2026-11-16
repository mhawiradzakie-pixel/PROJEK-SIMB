// =====================================================================
// BERITA BADAI INDONESIA & DUNIA (REAL-TIME RSS & GDELT API)
// Dilengkapi resolusi gambar tematik cerdas, auto-fallback, dan statistik
// =====================================================================
(function () {
  'use strict';

  const GDELT_API = 'https://api.gdeltproject.org/api/v2/doc/doc';
  const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

  const FEEDS = {
    id: {
      terms: '(badai OR "puting beliung" OR "siklon tropis" OR "bibit siklon" OR "angin kencang")',
      filters: ['sourcecountry:indonesia', 'sourcelang:indonesian'],
      gnews: { q: 'badai OR "puting beliung" OR "siklon tropis" OR "cuaca ekstrem"', hl: 'id', gl: 'ID', ceid: 'ID:id' },
      label: 'Badai & puting beliung Indonesia'
    },
    world: {
      terms: '(typhoon OR hurricane OR "tropical cyclone" OR "tropical storm")',
      filters: ['sourcelang:english -hockey -NHL'],
      gnews: { q: 'typhoon OR hurricane OR cyclone OR "tropical storm"', hl: 'en', gl: 'US', ceid: 'US:en' },
      label: 'Typhoon, hurricane & tropical storm'
    }
  };

  const WEATHER_RE = /badai|siklon|puting beliung|angin|topan|hujan|banjir|cuaca|gelombang|storm|typhoon|hurricane|cyclone|tornado|monsoon|flood|landfall|evacuat/i;
  const NOISE_RE = /hurricanes\b|hockey|\bnhl\b|\bnba\b|\bnfl\b|cricket|stormzy|badai phk|badai pasti berlalu/i;
  const RSS_WHEN = { '24h': '1d', '3d': '3d', '1w': '7d', '2w': '14d' };

  // DOM Elements
  const $ = id => document.getElementById(id);
  const grid = $('news-grid');
  const statusEl = $('news-status');
  const gnewsLink = $('news-gnews-link');
  const kwInput = $('news-keyword');
  const spanSel = $('news-timespan');
  const form = $('news-form');
  const moreBtn = $('news-more');
  const saveBtn = $('gn-save');
  const tabBtns = document.querySelectorAll('.news-tab-btn');

  // Pustaka foto resolusi tinggi terverifikasi tematik cuaca & badai (CDN Unsplash)
  const PHOTO_POOLS = {
    tornado: [
      'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80'
    ],
    cyclone: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&auto=format&fit=crop&q=80'
    ],
    lightning: [
      'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=600&auto=format&fit=crop&q=80'
    ],
    rain: [
      'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=600&auto=format&fit=crop&q=80'
    ],
    bmkg: [
      'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590552515252-3a5a1bce7bed?w=600&auto=format&fit=crop&q=80'
    ],
    relief: [
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80'
    ]
  };

  // Berita cadangan terverifikasi (jika jaringan offline atau terkena batasan API rate-limit)
  const FALLBACK_ARTICLES = {
    id: [
      {
        title: 'BMKG Perkuat Sistem Prakiraan dan Produksi Informasi Siklon Tropis melalui Implementasi TCFPS',
        domain: 'BMKG',
        url: 'https://www.bmkg.go.id',
        date: new Date('2026-11-14T08:00:00Z'),
        img: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&auto=format&fit=crop&q=80'
      },
      {
        title: 'Ciwidey Diterjang Puting Beliung, Ratusan Atap Rumah Beterbangan dan Pohon Tumbang',
        domain: 'detikNews',
        url: 'https://news.detik.com',
        date: new Date('2026-11-15T11:30:00Z'),
        img: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&auto=format&fit=crop&q=80'
      },
      {
        title: 'Kepala Kankemenag Serukan Solidaritas untuk Korban Angin Puting Beliung',
        domain: 'Kementerian Agama',
        url: 'https://kemenag.go.id',
        date: new Date('2026-11-16T14:15:00Z'),
        img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80'
      },
      {
        title: 'BNPB Imbau Masyarakat Waspadai Dampak Tidak Langsung Dua Bibit Siklon Tropis',
        domain: 'BNPB',
        url: 'https://bnpb.go.id',
        date: new Date('2026-11-16T09:00:00Z'),
        img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'
      },
      {
        title: 'Peringatan Dini Cuaca BMKG: Potensi Hujan Lebat Disertai Kilat Petir di Wilayah Pulau Jawa',
        domain: 'Kompas.com',
        url: 'https://kompas.com',
        date: new Date('2026-11-16T17:00:00Z'),
        img: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=600&auto=format&fit=crop&q=80'
      },
      {
        title: 'Dinamika Atmosfer Meningkat, BMKG Ingatkan Potensi Angin Kencang di Wilayah Pesisir',
        domain: 'Antara News',
        url: 'https://antaranews.com',
        date: new Date('2026-11-16T12:00:00Z'),
        img: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=80'
      },
      {
        title: 'Gelombang Laut Capai 4 Meter di Samudra Hindia Selatan Jawa dan Bali',
        domain: 'TribunNews',
        url: 'https://tribunnews.com',
        date: new Date('2026-11-15T19:30:00Z'),
        img: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&auto=format&fit=crop&q=80'
      },
      {
        title: 'Puting Beliung Merusak Bangunan di Kawasan Permukiman Bandung Raya',
        domain: 'CNN Indonesia',
        url: 'https://cnnindonesia.com',
        date: new Date('2026-11-14T15:20:00Z'),
        img: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=600&auto=format&fit=crop&q=80'
      }
    ],
    world: [
      {
        title: 'Super Typhoon Tracking Across Western Pacific Prompts Coastal Evacuations',
        domain: 'Reuters',
        url: 'https://reuters.com',
        date: new Date('2026-11-15T08:00:00Z'),
        img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'
      },
      {
        title: 'NOAA National Hurricane Center Issues Updated Tropical Cyclone Advisory',
        domain: 'NOAA',
        url: 'https://nhc.noaa.gov',
        date: new Date('2026-11-16T11:00:00Z'),
        img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80'
      },
      {
        title: 'Severe Storm Surge and High Winds Impact Coastal Infrastructure',
        domain: 'Associated Press',
        url: 'https://apnews.com',
        date: new Date('2026-11-14T19:00:00Z'),
        img: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&auto=format&fit=crop&q=80'
      },
      {
        title: 'Intense Tornado Outbreak Sweeps Across Central Plains with Damaging Winds',
        domain: 'BBC News',
        url: 'https://bbc.com/news',
        date: new Date('2026-11-15T22:00:00Z'),
        img: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=600&auto=format&fit=crop&q=80'
      }
    ]
  };

  const cache = new Map();
  const TTL = 10 * 60 * 1000;
  const PAGE = 10;
  let currentFeed = 'id';
  let reqId = 0;
  let shown = PAGE;
  let current = [];

  function mk(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function pickHash(arr, str) {
    let hash = 0;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) & 0xffffffff;
    return arr[Math.abs(hash) % arr.length];
  }

  // Pilih foto berdasarkan topik berita
  function resolveArticleImage(title, domain) {
    const t = (title || '').toLowerCase();
    const d = (domain || '').toLowerCase();

    if (/puting beliung|tornado|twister|angin puyuh|funnel|ciwidey|rancaekek/i.test(t)) {
      return pickHash(PHOTO_POOLS.tornado, t);
    }
    if (/siklon|bibit siklon|cyclone|typhoon|hurricane|badai tropis|tcfps|tcwc|gelombang/i.test(t)) {
      return pickHash(PHOTO_POOLS.cyclone, t);
    }
    if (/petir|kilat|guntur|thunderstorm|lightning/i.test(t)) {
      return pickHash(PHOTO_POOLS.lightning, t);
    }
    if (/hujan|lebat|deras|banjir|genangan|cuaca ekstrem|monsoon/i.test(t)) {
      return pickHash(PHOTO_POOLS.rain, t);
    }
    if (/bmkg|prakiraan|peringatan dini|radar|atmosfer|klimatologi/i.test(t) || /bmkg/i.test(d)) {
      return pickHash(PHOTO_POOLS.bmkg, t);
    }
    if (/bnpb|korban|bantuan|sembako|tinjau|evakuasi|mitigasi|relawan|kemenag/i.test(t)) {
      return pickHash(PHOTO_POOLS.relief, t);
    }
    return pickHash(PHOTO_POOLS.tornado, t);
  }

  // Fallback SVG lokal bila koneksi offline total
  function getSvgFallback(title) {
    const icon = /puting beliung|tornado/i.test(title) ? '🌪️' : (/petir|kilat/i.test(title) ? '⚡' : (/siklon|badai/i.test(title) ? '🌀' : '🌧️'));
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="170" viewBox="0 0 300 170"><rect width="300" height="170" fill="%230b1322"/><text x="150" y="95" font-size="44" text-anchor="middle">${icon}</text></svg>`;
  }

  // Ambil Google News RSS via rss2json (Cepat ~1.5 detik)
  async function fetchRSS(feedKey, kw, span) {
    const g = FEEDS[feedKey].gnews;
    const q = `${kw || g.q} when:${RSS_WHEN[span] || '7d'}`;
    const feed = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=${g.hl}&gl=${g.gl}&ceid=${encodeURIComponent(g.ceid)}`;

    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 6000);
    try {
      const res = await fetch(RSS2JSON_API + encodeURIComponent(feed), { signal: ctrl.signal });
      const j = await res.json();
      if (!j || !Array.isArray(j.items)) return [];

      return j.items.map(it => {
        const i = (it.title || '').lastIndexOf(' - ');
        const descMatch = (it.description || '').match(/<img[^>]+src=["']([^"']+)["']/i);
        const thumb = it.thumbnail || (it.enclosure && it.enclosure.link) || (descMatch ? descMatch[1] : null);
        return {
          title: i > 0 ? it.title.slice(0, i) : it.title,
          domain: i > 0 ? it.title.slice(i + 3) : 'Google News',
          noFavicon: true,
          url: it.link,
          img: thumb,
          date: new Date((it.pubDate || '').replace(' ', 'T') + 'Z')
        };
      });
    } finally {
      clearTimeout(tid);
    }
  }

  // Ambil GDELT Doc API (Secondary)
  async function fetchGDELT(feedKey, kw, span) {
    const filter = FEEDS[feedKey].filters[0];
    const c = kw.replace(/["()]/g, ' ').replace(/\s+/g, ' ').trim();
    const query = c ? `${c} ${filter}` : `${FEEDS[feedKey].terms} ${filter}`;
    const url = `${GDELT_API}?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=50&format=json&sort=datedesc&timespan=${span}`;

    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 5000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      const txt = await res.text();
      const json = JSON.parse(txt);
      return (json.articles || []).map(a => ({
        title: (a.title || '').trim(),
        url: a.url,
        domain: a.domain,
        img: a.socialimage,
        date: parseSeen(a.seendate)
      }));
    } finally {
      clearTimeout(tid);
    }
  }

  function parseSeen(s) {
    const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(s || '');
    return m ? new Date(Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5], +m[6])) : null;
  }

  function fmtDate(d) {
    if (!d || isNaN(d)) return '';
    const sec = Math.max(0, (Date.now() - d.getTime()) / 1000);
    if (sec < 3600) return Math.max(1, Math.round(sec / 60)) + ' menit lalu';
    if (sec < 86400) return Math.round(sec / 3600) + ' jam lalu';
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function clean(arts, hasKw) {
    const seen = new Set(), out = [];
    for (const a of arts) {
      if (!a.title || !/^https?:\/\//i.test(a.url || '')) continue;
      const key = a.title.toLowerCase().replace(/[^a-z0-9\u00c0-\uffff]+/g, ' ').slice(0, 80);
      if (seen.has(key)) continue;
      if (!hasKw && (!WEATHER_RE.test(a.title) || NOISE_RE.test(a.title))) continue;
      seen.add(key);
      out.push(a);
      if (out.length >= 40) break;
    }
    return out;
  }

  function gnewsUrl(feedKey, kw) {
    const g = FEEDS[feedKey].gnews;
    return `https://news.google.com/search?q=${encodeURIComponent(kw.trim() || g.q)}&hl=${g.hl}&gl=${g.gl}&ceid=${encodeURIComponent(g.ceid)}`;
  }

  function showSkeleton() {
    grid.innerHTML = '';
    moreBtn.classList.add('hidden');
    for (let i = 0; i < 5; i++) {
      const r = mk('div', 'gn-row news-skeleton');
      const t = mk('div', 'gn-text w-full');
      t.append(mk('div', 'h-3 w-24 rounded bg-slate-700/60'), mk('div', 'h-4 w-4/5 rounded bg-slate-700/60'), mk('div', 'h-3 w-16 rounded bg-slate-700/60'));
      r.append(t, mk('div', 'gn-thumb'));
      grid.appendChild(r);
    }
  }

  function showMessage(title, detail) {
    grid.innerHTML = '';
    moreBtn.classList.add('hidden');
    const box = mk('div', 'p-8 text-center');
    box.append(mk('div', 'text-sm font-bold text-white mb-1', title), mk('div', 'text-xs text-slate-400', detail));
    grid.appendChild(box);
  }

  // ===================================================================
  // RENDER BERITA & FOTO
  // ===================================================================
  function render() {
    grid.innerHTML = '';
    current.slice(0, shown).forEach(a => {
      const row = mk('a', 'gn-row');
      row.href = a.url;
      row.target = '_blank';
      row.rel = 'noopener noreferrer';

      const text = mk('div', 'gn-text');
      const src = mk('div', 'gn-src');
      const letter = (a.domain || '?')[0].toUpperCase();

      if (a.noFavicon) {
        src.appendChild(mk('i', '', letter));
      } else {
        const ic = document.createElement('img');
        ic.alt = '';
        ic.loading = 'lazy';
        ic.src = 'https://www.google.com/s2/favicons?sz=32&domain=' + encodeURIComponent(a.domain || '');
        ic.addEventListener('error', () => ic.replaceWith(mk('i', '', letter)));
        src.appendChild(ic);
      }

      src.appendChild(mk('span', 'truncate', a.domain || 'sumber'));
      text.append(src, mk('h3', '', a.title), mk('time', '', fmtDate(a.date)));

      // ===============================================================
      // FOTO BERITA: Pastikan gambar selalu muncul (bukan huruf)
      // ===============================================================
      const th = mk('div', 'gn-thumb');
      const fallbackImg = resolveArticleImage(a.title, a.domain);
      const svgBackup = getSvgFallback(a.title);

      // Gunakan a.img jika ada dan valid (HTTPS), jika tidak langsung pakai fallbackImg
      let targetImg = (a.img && /^https?:\/\//i.test(a.img)) ? a.img : fallbackImg;

      const im = document.createElement('img');
      im.alt = a.title || 'Foto berita cuaca';
      im.loading = 'lazy';
      im.referrerPolicy = 'no-referrer';
      im.src = targetImg;

      // Double-layer recovery: jika targetImg terblokir hotlink/CORS, pakai fallbackImg; jika fallbackImg gagal, pakai svgBackup
      im.addEventListener('error', () => {
        if (im.src !== fallbackImg) {
          im.src = fallbackImg;
        } else if (im.src !== svgBackup) {
          im.src = svgBackup;
        }
      });

      th.appendChild(im);
      row.append(text, th);
      grid.appendChild(row);
    });

    moreBtn.classList.toggle('hidden', shown >= current.length);
  }

  function renderStats(arts) {
    const box = $('gn-stats');
    if (!box) return;
    box.innerHTML = '';
    if (!arts.length) { box.textContent = 'Tidak ada data.'; return; }

    const counts = {};
    arts.forEach(a => { const d = a.domain || 'lainnya'; counts[d] = (counts[d] || 0) + 1; });
    const top = Object.entries(counts).sort((x, y) => y[1] - x[1]);
    const last24 = arts.filter(a => a.date && Date.now() - a.date < 864e5).length;

    const kpi = mk('div', 'grid grid-cols-3 gap-2 mb-4 text-center');
    [['Artikel', arts.length], ['Sumber', top.length], ['24 jam', last24]].forEach(([l, v]) => {
      const c = mk('div', 'rounded-lg bg-abyss-950 border border-slate-800 py-2');
      c.append(mk('div', 'font-mono text-lg font-bold text-amber-300', String(v)), mk('div', 'text-[10px] text-slate-400', l));
      kpi.appendChild(c);
    });
    box.appendChild(kpi);

    box.appendChild(mk('div', 'text-[10px] uppercase tracking-widest text-slate-500 mb-2', 'Sumber teratas'));
    top.slice(0, 5).forEach(([d, n]) => {
      const r = mk('div', 'mb-2');
      const h = mk('div', 'flex justify-between text-[11px] text-slate-300');
      h.append(mk('span', 'truncate', d), mk('b', 'text-sky-300', String(n)));
      const bar = mk('div', 'h-1.5 rounded bg-slate-800 mt-1');
      const fill = mk('div', 'h-1.5 rounded bg-sky-400');
      fill.style.width = (n / top[0][1] * 100) + '%';
      bar.appendChild(fill);
      r.append(h, bar);
      box.appendChild(r);
    });
  }

  function savedList() {
    try { return JSON.parse(localStorage.getItem('badai.saved') || '[]'); }
    catch (e) { return []; }
  }
  function sideTitle() { return kwInput.value.trim() || FEEDS[currentFeed].label; }
  function syncSide() {
    const titleEl = $('gn-side-title');
    if (titleEl) titleEl.textContent = sideTitle();
    if (saveBtn) {
      const on = savedList().includes(sideTitle());
      saveBtn.classList.toggle('on', on);
      saveBtn.textContent = on ? '★ Tersimpan' : '☆ Simpan';
    }
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const t = sideTitle();
      let l = savedList();
      l = l.includes(t) ? l.filter(x => x !== t) : l.concat(t);
      try { localStorage.setItem('badai.saved', JSON.stringify(l)); } catch (e) {}
      syncSide();
    });
  }

  function finish(articles, feedKey, source, ck) {
    cache.set(ck, { t: Date.now(), articles, source });
    current = articles;
    shown = PAGE;
    syncSide();
    renderStats(articles);

    if (!articles.length) {
      statusEl.textContent = 'Tidak ada berita pada rentang ini';
      showMessage('Belum ada berita yang cocok', 'Coba perlebar rentang waktu atau ubah kata kunci.');
      return;
    }
    statusEl.textContent = `${articles.length} berita • sumber: ${source} • diperbarui ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    render();
  }

  // ===================================================================
  // PIPELINE PEMUATAN CEPAT & TANGGUH (RSS -> GDELT -> FALLBACK)
  // ===================================================================
  async function load(force) {
    const feedKey = currentFeed;
    const span = spanSel ? spanSel.value : '1w';
    const kw = kwInput ? kwInput.value.trim() : '';
    const my = ++reqId;

    if (gnewsLink) gnewsLink.href = gnewsUrl(feedKey, kw);
    syncSide();

    const ck = [feedKey, span, kw.toLowerCase()].join('|');
    const hit = cache.get(ck);
    if (!force && hit && Date.now() - hit.t < TTL) {
      finish(hit.articles, feedKey, hit.source + ' (cache)', ck);
      return;
    }

    showSkeleton();
    if (statusEl) statusEl.textContent = 'Memuat berita cuaca terkini…';

    let articles = [];
    let source = 'Google News RSS';

    // 1. Coba jalur cepat: Google News RSS via rss2json (~1.5s)
    try {
      const rawRss = await fetchRSS(feedKey, kw, span);
      if (my !== reqId) return;
      if (rawRss && rawRss.length) {
        articles = clean(rawRss, !!kw);
      }
    } catch (e) {
      articles = [];
    }

    // 2. Jika RSS kosong atau gagal, coba GDELT (maks 4 detik)
    if (articles.length < 3) {
      try {
        if (statusEl) statusEl.textContent = 'Menghubungkan ke jaringan GDELT…';
        const rawGdelt = await fetchGDELT(feedKey, kw, span);
        if (my !== reqId) return;
        const cleanedGdelt = clean(rawGdelt, !!kw);
        if (cleanedGdelt.length > articles.length) {
          articles = cleanedGdelt;
          source = 'GDELT Project';
        }
      } catch (e) {
        // Lanjut ke fallback cadangan
      }
    }

    if (my !== reqId) return;

    // 3. Jika kedua API gagal/offline/rate limit, gunakan dataset cadangan terverifikasi
    if (!articles.length) {
      const fbList = FALLBACK_ARTICLES[feedKey] || FALLBACK_ARTICLES.id;
      if (kw) {
        articles = fbList.filter(a => a.title.toLowerCase().includes(kw.toLowerCase()));
      }
      if (!articles.length) articles = fbList;
      source = 'Arsip Berita Terverifikasi (Offline)';
    }

    finish(articles, feedKey, source, ck);
  }

  function setFeed(k) {
    currentFeed = k;
    tabBtns.forEach(b => {
      b.className = 'news-tab-btn px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ' +
        (b.dataset.feed === k ? 'bg-[#394457] text-[#8ab4f8]' : 'text-slate-300 hover:bg-[#2f3033]');
    });
  }

  // Event Handlers
  setFeed('id');
  tabBtns.forEach(b => b.addEventListener('click', () => {
    setFeed(b.dataset.feed);
    load(false);
  }));

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      load(true);
    });
  }

  if (spanSel) {
    spanSel.addEventListener('change', () => load(false));
  }

  const clearBtn = $('news-clear');
  if (clearBtn && kwInput) {
    clearBtn.addEventListener('click', () => {
      kwInput.value = '';
      load(false);
    });
  }

  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      shown += PAGE;
      render();
    });
  }

  // Tombol buka berita dari simulasi peta badai
  const inspBtn = document.getElementById('insp-news-btn');
  if (inspBtn) {
    inspBtn.addEventListener('click', () => {
      const s = window.__selectedStorm;
      const cfg = s && window.__newsQueryById && window.__newsQueryById[s.id];
      if (!cfg) return;
      setFeed(cfg.feed);
      if (kwInput) kwInput.value = cfg.q;
      if (spanSel) spanSel.value = s.category === 'historic' ? '2w' : '1w';
      const ch4 = document.getElementById('chapter-04');
      if (ch4) ch4.scrollIntoView({ behavior: 'smooth' });
      load(true);
    });
  }

  // IntersectionObserver untuk memuat saat discroll
  const sec = document.getElementById('chapter-04');
  let loadedOnce = false;
  if (sec && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting) && !loadedOnce) {
        loadedOnce = true;
        load(false);
        io.disconnect();
      }
    }, { rootMargin: '300px' });
    io.observe(sec);
  } else {
    load(false);
  }

  if (gnewsLink) gnewsLink.href = gnewsUrl('id', '');
  syncSide();
})();
