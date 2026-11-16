// Cuaca lokasi saya: Geolokasi + OpenStreetMap (Nominatim) + BMKG
// Alur: GPS -> Nominatim -> wilayah.id (kode adm4) -> BMKG (fallback Open-Meteo)
(function () {
  'use strict';
  const BMKG = 'https://api.bmkg.go.id/publik/prakiraan-cuaca';
  const NOMINATIM = 'https://nominatim.openstreetmap.org';
  const WILAYAH = 'https://wilayah.id/api';
  const DEFAULT_LOC = { lat: -6.1754, lon: 106.8272, label: 'Jakarta (lokasi bawaan)' };
  const REFRESH_MS = 15 * 60 * 1000;

  const $ = id => document.getElementById(id);
  const el = {
    loc: $('wx-loc'), icon: $('wx-icon'), temp: $('wx-temp'), desc: $('wx-desc'),
    hu: $('wx-hu'), ws: $('wx-ws'), wd: $('wx-wd'), src: $('wx-src'),
    toggle: $('wx-toggle'), refresh: $('wx-refresh'), panel: $('wx-panel'),
    fc: $('wx-forecast'), status: $('wx-status'),
    form: $('wx-search-form'), input: $('wx-search-input'), gps: $('wx-gps-btn')
  };

  let current = null;   // {lat, lon}
  let reqId = 0;

  /* ---------- util ---------- */
  async function getJSON(url) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    try {
      const r = await fetch(url, { signal: ctrl.signal });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  }
  const list = j => Array.isArray(j) ? j : (j && Array.isArray(j.data) ? j.data : []);
  function norm(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/daerah khusus ibukota|daerah istimewa|daerah khusus/g, '')
      .replace(/\b(provinsi|kabupaten|kab|kota administrasi|kota adm|kota|kecamatan|kec|kelurahan|kel|desa|dki)\b\.?/g, '')
      .replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function best(items, cands) {
    const c = cands.filter(Boolean).map(norm).filter(Boolean);
    if (!items.length || !c.length) return null;
    for (const q of c) { const m = items.find(i => norm(i.name) === q); if (m) return m; }
    for (const q of c) { const m = items.find(i => { const n = norm(i.name); return n.includes(q) || q.includes(n); }); if (m) return m; }
    return null;
  }
  function emoji(desc, isDay) {
    const d = String(desc || '').toLowerCase();
    if (/petir|badai/.test(d)) return '⛈️';
    if (/lebat|deras/.test(d)) return '🌧️';
    if (/hujan|gerimis/.test(d)) return '🌦️';
    if (/kabut|kabur|asap/.test(d)) return '🌫️';
    if (/tebal/.test(d)) return '☁️';
    if (/berawan/.test(d)) return isDay ? '⛅' : '☁️';
    if (/cerah/.test(d)) return isDay ? '☀️' : '🌙';
    return '🌤️';
  }
  const isDayHour = h => h >= 6 && h < 18;
  const hhmm = d => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');

  /* ---------- Geolokasi browser ---------- */
  function getPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolokasi tidak didukung'));
      navigator.geolocation.getCurrentPosition(
        p => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
        err => reject(err),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 }
      );
    });
  }

  /* ---------- OpenStreetMap: koordinat → alamat ---------- */
  async function reverseGeocode(lat, lon) {
    const j = await getJSON(`${NOMINATIM}/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=id`);
    return j.address || {};
  }
  async function forwardGeocode(q) {
    const j = await getJSON(`${NOMINATIM}/search?format=jsonv2&limit=1&addressdetails=1&accept-language=id&q=${encodeURIComponent(q)}`);
    if (!j.length) return null;
    return { lat: parseFloat(j[0].lat), lon: parseFloat(j[0].lon) };
  }
  function placeLabel(a) {
    const village = a.village || a.suburb || a.neighbourhood || a.quarter || a.hamlet;
    const district = a.municipality || a.city_district || a.county_district;
    const city = a.city || a.county || a.regency || a.state_district || a.town;
    const parts = [village, district, city].filter(Boolean);
    const uniq = parts.filter((p, i) => parts.indexOf(p) === i);
    return (uniq.slice(0, 3).join(', ') || a.state || a.country || 'Lokasi tidak dikenal');
  }

  /* ---------- Nama wilayah OSM → kode adm4 (wilayah.id) ---------- */
  async function resolveAdm4(a) {
    const key = 'wx_adm4_' + norm([a.state, a.county || a.city, a.municipality || a.city_district, a.village || a.suburb].join('|'));
    try { const c = localStorage.getItem(key); if (c) return c; } catch (e) {}

    const prov = best(list(await getJSON(`${WILAYAH}/provinces.json`)), [a.state]);
    if (!prov) return null;
    const reg = best(list(await getJSON(`${WILAYAH}/regencies/${prov.code}.json`)), [a.county, a.city, a.regency, a.state_district, a.town]);
    if (!reg) return null;
    const dist = best(list(await getJSON(`${WILAYAH}/districts/${reg.code}.json`)), [a.municipality, a.city_district, a.county_district, a.suburb, a.town]);
    if (!dist) return null;
    const vills = list(await getJSON(`${WILAYAH}/villages/${dist.code}.json`));
    const vill = best(vills, [a.village, a.suburb, a.neighbourhood, a.quarter, a.hamlet]) || vills[0];
    if (!vill) return null;
    try { localStorage.setItem(key, vill.code); } catch (e) {}
    return vill.code;
  }

  /* ---------- BMKG ---------- */
  async function fetchBMKG(adm4) {
    const j = await getJSON(`${BMKG}?adm4=${encodeURIComponent(adm4)}`);
    const block = j && j.data && j.data[0];
    if (!block || !block.cuaca) throw new Error('Data BMKG kosong');
    const slots = [].concat(...block.cuaca).map(s => ({
      time: new Date(s.datetime || s.utc_datetime || (s.local_datetime || '').replace(' ', 'T') + '+07:00'),
      t: s.t, hu: s.hu, ws: s.ws, wd: s.wd, desc: s.weather_desc
    })).filter(s => !isNaN(s.time)).sort((x, y) => x.time - y.time);
    if (!slots.length) throw new Error('Slot BMKG kosong');

    const now = Date.now();
    let idx = 0, bestDiff = Infinity;
    slots.forEach((s, i) => { const d = Math.abs(s.time - now); if (d < bestDiff) { bestDiff = d; idx = i; } });
    const cur = slots[idx];
    const area = block.lokasi || j.lokasi || {};
    return {
      source: 'BMKG', areaName: [area.desa, area.kecamatan].filter(Boolean).join(', '),
      now: { t: cur.t, hu: cur.hu, ws: cur.ws, wd: cur.wd, desc: cur.desc, time: cur.time },
      next: slots.slice(idx + 1, idx + 9)
    };
  }

  /* ---------- Fallback: Open-Meteo (di luar Indonesia / BMKG gagal) ---------- */
  const WMO = {
    0: 'Cerah', 1: 'Cerah Berawan', 2: 'Berawan', 3: 'Berawan Tebal', 45: 'Kabut', 48: 'Kabut',
    51: 'Gerimis Ringan', 53: 'Gerimis', 55: 'Gerimis Lebat', 61: 'Hujan Ringan', 63: 'Hujan Sedang', 65: 'Hujan Lebat',
    80: 'Hujan Lokal', 81: 'Hujan Lokal', 82: 'Hujan Lebat', 95: 'Hujan Petir', 96: 'Hujan Petir', 99: 'Hujan Petir'
  };
  async function fetchOpenMeteo(lat, lon) {
    const j = await getJSON(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&timezone=auto&forecast_days=2`);
    const c = j.current;
    const dirs = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'];
    const nowMs = new Date(c.time).getTime();
    const next = [];
    for (let i = 0; i < j.hourly.time.length && next.length < 8; i++) {
      const tm = new Date(j.hourly.time[i]);
      if (tm.getTime() > nowMs && (tm.getHours() % 3 === 0)) {
        next.push({ time: tm, t: Math.round(j.hourly.temperature_2m[i]), hu: j.hourly.relative_humidity_2m[i],
          ws: Math.round(j.hourly.wind_speed_10m[i]), desc: WMO[j.hourly.weather_code[i]] || 'Berawan' });
      }
    }
    return {
      source: 'Open-Meteo', areaName: '',
      now: { t: Math.round(c.temperature_2m), hu: c.relative_humidity_2m, ws: Math.round(c.wind_speed_10m),
             wd: dirs[Math.round(c.wind_direction_10m / 45) % 8], desc: WMO[c.weather_code] || 'Berawan', time: new Date(c.time) },
      next
    };
  }

  /* ---------- Render ---------- */
  function render(label, w) {
    const n = w.now;
    const hour = new Date().getHours();
    el.loc.classList.remove('wx-loading');
    el.loc.textContent = label;
    el.loc.title = label;
    el.icon.textContent = emoji(n.desc, isDayHour(hour));
    el.temp.textContent = `${Math.round(n.t)}°C`;
    el.desc.textContent = n.desc || '-';
    el.hu.textContent = n.hu != null ? n.hu : '--';
    el.ws.textContent = n.ws != null ? Math.round(n.ws) : '--';
    el.wd.textContent = n.wd ? `dari ${n.wd}` : '';
    el.src.textContent = `Sumber: ${w.source} • ${hhmm(new Date())}`;
    el.temp.className = /petir|lebat/i.test(n.desc || '') ? 'text-rose-300 text-sm' : 'text-amber-300 text-sm';

    el.fc.innerHTML = '';
    w.next.forEach(s => {
      const card = document.createElement('div');
      card.className = 'wx-fc shrink-0 rounded-xl bg-abyss-900 border border-slate-800 px-3 py-2 text-center';
      const mk = (cls, txt) => { const d = document.createElement('div'); d.className = cls; d.textContent = txt; return d; };
      card.appendChild(mk('font-mono text-[10px] text-slate-400', hhmm(s.time)));
      card.appendChild(mk('text-xl leading-tight my-0.5', emoji(s.desc, isDayHour(s.time.getHours()))));
      card.appendChild(mk('font-mono text-sm font-bold text-amber-300', `${Math.round(s.t)}°C`));
      card.appendChild(mk('text-[10px] text-slate-300 leading-tight', s.desc || ''));
      card.appendChild(mk('font-mono text-[10px] text-sky-400 mt-0.5', `💧${s.hu ?? '--'}% 💨${Math.round(s.ws ?? 0)}`));
      el.fc.appendChild(card);
    });
  }

  function setStatus(t) { el.status.textContent = t || ''; }

  /* ---------- Orkestrasi ---------- */
  async function loadFor(pos, note) {
    const my = ++reqId;
    current = pos;
    el.loc.classList.add('wx-loading');
    let label = note || '';
    let addr = {};
    try {
      addr = await reverseGeocode(pos.lat, pos.lon);
      if (my !== reqId) return;
      label = placeLabel(addr);
    } catch (e) { label = label || `${pos.lat.toFixed(2)}, ${pos.lon.toFixed(2)}`; }

    let weather = null;
    const isID = (addr.country_code || 'id').toLowerCase() === 'id';
    if (isID) {
      try {
        const adm4 = await resolveAdm4(addr);
        if (adm4) weather = await fetchBMKG(adm4);
      } catch (e) { /* lanjut ke fallback */ }
    }
    if (my !== reqId) return;
    if (!weather) {
      try { weather = await fetchOpenMeteo(pos.lat, pos.lon); }
      catch (e) {
        el.loc.classList.remove('wx-loading');
        el.loc.textContent = label || 'Lokasi';
        el.desc.textContent = 'Cuaca gagal dimuat';
        setStatus('Periksa koneksi lalu tekan ↻');
        return;
      }
      setStatus(isID ? 'BMKG tak tersedia untuk titik ini, memakai Open-Meteo' : '');
    } else {
      setStatus('');
    }
    if (my !== reqId) return;
    render(label, weather);
  }

  async function detectAndLoad() {
    el.loc.classList.add('wx-loading');
    el.loc.textContent = 'Mendeteksi lokasi…';
    try {
      const pos = await getPosition();
      await loadFor(pos);
    } catch (err) {
      setStatus('Izin lokasi ditolak / tidak tersedia — memakai lokasi bawaan. Cari lokasi manual di sini.');
      await loadFor(DEFAULT_LOC, DEFAULT_LOC.label);
    }
  }

  /* ---------- Event ---------- */
  el.toggle.addEventListener('click', () => {
    const open = el.panel.classList.toggle('hidden') === false;
    el.toggle.setAttribute('aria-expanded', String(open));
    el.toggle.textContent = open ? 'Prakiraan ▴' : 'Prakiraan ▾';
  });
  el.refresh.addEventListener('click', () => (current ? loadFor(current) : detectAndLoad()));
  el.gps.addEventListener('click', detectAndLoad);
  el.form.addEventListener('submit', async e => {
    e.preventDefault();
    const q = el.input.value.trim();
    if (!q) return;
    setStatus('Mencari lokasi…');
    try {
      const pos = await forwardGeocode(q);
      if (!pos) { setStatus('Lokasi tidak ditemukan'); return; }
      setStatus('');
      await loadFor(pos);
    } catch (err) { setStatus('Gagal mencari lokasi'); }
  });

  detectAndLoad();
  setInterval(() => { if (current) loadFor(current); }, REFRESH_MS);
})();
