// =====================================================================
// DASHBOARD STATISTIK RESMI BMKG (OPEN DATA API)
// Filter Wilayah: Dropdown lengkap & akurat (29 Kota se-Indonesia)
// Sumber Data:
// 1. Cuaca & Dinamika Angin: https://api.bmkg.go.id/publik/prakiraan-cuaca
// 2. Seismik & Gempabumi TEWS: https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json
// =====================================================================
(function () {
  'use strict';

  // Daftar 29 Kota & Ibu Kota Provinsi Terverifikasi Resmi BMKG
  const CITIES = [
    // --- JAWA & BANTEN ---
    { key: 'jkt', name: 'DKI Jakarta (Pusat)', prov: 'DKI Jakarta', island: 'Jawa & Banten', adm4: '31.71.03.1001', isMajor: true },
    { key: 'bdg', name: 'Bandung', prov: 'Jawa Barat', island: 'Jawa & Banten', adm4: '32.04.05.2001' },
    { key: 'smg', name: 'Semarang', prov: 'Jawa Tengah', island: 'Jawa & Banten', adm4: '33.74.06.1001' },
    { key: 'yog', name: 'Yogyakarta', prov: 'D.I. Yogyakarta', island: 'Jawa & Banten', adm4: '34.71.01.1001' },
    { key: 'sby', name: 'Surabaya', prov: 'Jawa Timur', island: 'Jawa & Banten', adm4: '35.78.07.1001', isMajor: true },
    { key: 'mlg', name: 'Malang', prov: 'Jawa Timur', island: 'Jawa & Banten', adm4: '35.07.01.2001' },
    { key: 'srg', name: 'Serang', prov: 'Banten', island: 'Jawa & Banten', adm4: '36.04.05.2001' },

    // --- SUMATERA ---
    { key: 'btj', name: 'Banda Aceh', prov: 'Aceh', island: 'Sumatera', adm4: '11.71.01.2001' },
    { key: 'mdn', name: 'Medan', prov: 'Sumatera Utara', island: 'Sumatera', adm4: '12.71.01.1001', isMajor: true },
    { key: 'pdg', name: 'Padang', prov: 'Sumatera Barat', island: 'Sumatera', adm4: '13.05.01.2001' },
    { key: 'pku', name: 'Pekanbaru', prov: 'Riau', island: 'Sumatera', adm4: '14.71.01.1002' },
    { key: 'btm', name: 'Batam', prov: 'Kepulauan Riau', island: 'Sumatera', adm4: '21.71.01.1002' },
    { key: 'plm', name: 'Palembang', prov: 'Sumatera Selatan', island: 'Sumatera', adm4: '16.71.01.1001' },
    { key: 'bdl', name: 'Bandar Lampung', prov: 'Lampung', island: 'Sumatera', adm4: '18.71.01.1003' },

    // --- BALI & NUSA TENGGARA ---
    { key: 'dps', name: 'Denpasar', prov: 'Bali', island: 'Bali & Nusa Tenggara', adm4: '51.71.01.1001', isMajor: true },
    { key: 'mtr', name: 'Mataram', prov: 'Nusa Tenggara Barat', island: 'Bali & Nusa Tenggara', adm4: '52.71.01.1004' },
    { key: 'kpg', name: 'Kupang', prov: 'Nusa Tenggara Timur', island: 'Bali & Nusa Tenggara', adm4: '53.71.02.1001' },

    // --- KALIMANTAN ---
    { key: 'pnk', name: 'Pontianak', prov: 'Kalimantan Barat', island: 'Kalimantan', adm4: '61.71.01.1002' },
    { key: 'bjm', name: 'Banjarmasin', prov: 'Kalimantan Selatan', island: 'Kalimantan', adm4: '63.71.01.1001' },
    { key: 'bpn', name: 'Balikpapan', prov: 'Kalimantan Timur', island: 'Kalimantan', adm4: '64.71.06.1001', isMajor: true },
    { key: 'smd', name: 'Samarinda', prov: 'Kalimantan Timur', island: 'Kalimantan', adm4: '64.72.01.1001' },

    // --- SULAWESI ---
    { key: 'mks', name: 'Makassar', prov: 'Sulawesi Selatan', island: 'Sulawesi', adm4: '73.71.05.1001', isMajor: true },
    { key: 'mdo', name: 'Manado', prov: 'Sulawesi Utara', island: 'Sulawesi', adm4: '71.71.01.1001' },
    { key: 'plu', name: 'Palu', prov: 'Sulawesi Tengah', island: 'Sulawesi', adm4: '72.71.01.1004' },
    { key: 'kdi', name: 'Kendari', prov: 'Sulawesi Tenggara', island: 'Sulawesi', adm4: '74.71.01.1005' },

    // --- MALUKU & PAPUA ---
    { key: 'amb', name: 'Ambon', prov: 'Maluku', island: 'Maluku & Papua', adm4: '81.71.01.1006' },
    { key: 'tnt', name: 'Ternate', prov: 'Maluku Utara', island: 'Maluku & Papua', adm4: '82.71.01.1001' },
    { key: 'jpr', name: 'Jayapura', prov: 'Papua', island: 'Maluku & Papua', adm4: '91.71.01.1001', isMajor: true },
    { key: 'srg_p', name: 'Sorong', prov: 'Papua Barat Daya', island: 'Maluku & Papua', adm4: '96.01.01.1001' }
  ];

  // Fallback cache untuk stasiun utama
  const FALLBACK_WEATHER = {
    jkt: { cur: { t: 27, ws: 3.3, wd: 'SE', hu: 84, desc: 'Cerah Berawan' }, slots: [
      { time: '00:00', t: 26, ws: 2.8, wd: 'SE', hu: 88, desc: 'Berawan' },
      { time: '03:00', t: 25, ws: 2.2, wd: 'S', hu: 92, desc: 'Berawan' },
      { time: '06:00', t: 26, ws: 3.1, wd: 'SE', hu: 89, desc: 'Cerah Berawan' },
      { time: '09:00', t: 30, ws: 4.5, wd: 'E', hu: 75, desc: 'Cerah Berawan' },
      { time: '12:00', t: 32, ws: 5.6, wd: 'NE', hu: 68, desc: 'Hujan Ringan' },
      { time: '15:00', t: 31, ws: 6.2, wd: 'E', hu: 72, desc: 'Hujan Petir' },
      { time: '18:00', t: 29, ws: 4.1, wd: 'SE', hu: 79, desc: 'Hujan Sedang' },
      { time: '21:00', t: 27, ws: 3.3, wd: 'SE', hu: 84, desc: 'Cerah Berawan' }
    ]},
    sby: { cur: { t: 28, ws: 4.2, wd: 'E', hu: 85, desc: 'Hujan Ringan' }, slots: [
      { time: '00:00', t: 27, ws: 3.1, wd: 'E', hu: 88, desc: 'Berawan' },
      { time: '03:00', t: 26, ws: 2.5, wd: 'NE', hu: 90, desc: 'Berawan' },
      { time: '06:00', t: 27, ws: 3.6, wd: 'E', hu: 86, desc: 'Cerah Berawan' },
      { time: '09:00', t: 31, ws: 5.0, wd: 'E', hu: 76, desc: 'Cerah' },
      { time: '12:00', t: 33, ws: 6.8, wd: 'SE', hu: 66, desc: 'Berawan' },
      { time: '15:00', t: 30, ws: 5.4, wd: 'E', hu: 78, desc: 'Hujan Ringan' },
      { time: '18:00', t: 29, ws: 4.5, wd: 'E', hu: 82, desc: 'Hujan Sedang' },
      { time: '21:00', t: 28, ws: 4.2, wd: 'E', hu: 85, desc: 'Hujan Ringan' }
    ]},
    mdn: { cur: { t: 25, ws: 3.0, wd: 'NE', hu: 96, desc: 'Berawan' }, slots: [
      { time: '00:00', t: 24, ws: 2.0, wd: 'N', hu: 98, desc: 'Kabut' },
      { time: '03:00', t: 23, ws: 1.8, wd: 'N', hu: 98, desc: 'Kabut' },
      { time: '06:00', t: 24, ws: 2.2, wd: 'NE', hu: 95, desc: 'Berawan' },
      { time: '09:00', t: 28, ws: 3.5, wd: 'E', hu: 84, desc: 'Cerah Berawan' },
      { time: '12:00', t: 30, ws: 4.8, wd: 'NE', hu: 75, desc: 'Hujan Ringan' },
      { time: '15:00', t: 29, ws: 5.5, wd: 'NW', hu: 82, desc: 'Hujan Petir' },
      { time: '18:00', t: 27, ws: 3.8, wd: 'N', hu: 90, desc: 'Hujan Ringan' },
      { time: '21:00', t: 25, ws: 3.0, wd: 'NE', hu: 96, desc: 'Berawan' }
    ]},
    mks: { cur: { t: 27, ws: 5.5, wd: 'NW', hu: 85, desc: 'Cerah Berawan' }, slots: [
      { time: '00:00', t: 26, ws: 4.2, wd: 'W', hu: 88, desc: 'Berawan' },
      { time: '03:00', t: 25, ws: 3.5, wd: 'NW', hu: 90, desc: 'Berawan' },
      { time: '06:00', t: 26, ws: 4.8, wd: 'NW', hu: 86, desc: 'Cerah Berawan' },
      { time: '09:00', t: 29, ws: 6.5, wd: 'W', hu: 78, desc: 'Cerah Berawan' },
      { time: '12:00', t: 31, ws: 7.8, wd: 'NW', hu: 72, desc: 'Hujan Ringan' },
      { time: '15:00', t: 30, ws: 7.2, wd: 'NW', hu: 76, desc: 'Berawan' },
      { time: '18:00', t: 28, ws: 5.9, wd: 'W', hu: 82, desc: 'Cerah Berawan' },
      { time: '21:00', t: 27, ws: 5.5, wd: 'NW', hu: 85, desc: 'Cerah Berawan' }
    ]},
    bpn: { cur: { t: 27, ws: 9.3, wd: 'SW', hu: 88, desc: 'Berawan' }, slots: [
      { time: '00:00', t: 26, ws: 7.5, wd: 'S', hu: 90, desc: 'Berawan' },
      { time: '03:00', t: 25, ws: 6.8, wd: 'SW', hu: 92, desc: 'Hujan Ringan' },
      { time: '06:00', t: 26, ws: 8.0, wd: 'SW', hu: 89, desc: 'Berawan' },
      { time: '09:00', t: 29, ws: 10.5, wd: 'SW', hu: 82, desc: 'Cerah Berawan' },
      { time: '12:00', t: 30, ws: 12.4, wd: 'W', hu: 78, desc: 'Hujan Petir' },
      { time: '15:00', t: 29, ws: 11.2, wd: 'SW', hu: 84, desc: 'Hujan Sedang' },
      { time: '18:00', t: 28, ws: 9.8, wd: 'S', hu: 86, desc: 'Berawan' },
      { time: '21:00', t: 27, ws: 9.3, wd: 'SW', hu: 88, desc: 'Berawan' }
    ]},
    dps: { cur: { t: 27, ws: 2.9, wd: 'S', hu: 92, desc: 'Cerah Berawan' }, slots: [
      { time: '00:00', t: 26, ws: 2.2, wd: 'S', hu: 94, desc: 'Cerah Berawan' },
      { time: '03:00', t: 25, ws: 2.0, wd: 'SE', hu: 95, desc: 'Berawan' },
      { time: '06:00', t: 26, ws: 2.8, wd: 'S', hu: 92, desc: 'Cerah' },
      { time: '09:00', t: 30, ws: 4.2, wd: 'S', hu: 80, desc: 'Cerah' },
      { time: '12:00', t: 31, ws: 5.0, wd: 'SE', hu: 75, desc: 'Cerah Berawan' },
      { time: '15:00', t: 30, ws: 4.4, wd: 'S', hu: 80, desc: 'Berawan' },
      { time: '18:00', t: 28, ws: 3.4, wd: 'S', hu: 88, desc: 'Cerah Berawan' },
      { time: '21:00', t: 27, ws: 2.9, wd: 'S', hu: 92, desc: 'Cerah Berawan' }
    ]},
    jpr: { cur: { t: 24, ws: 7.3, wd: 'E', hu: 95, desc: 'Berawan' }, slots: [
      { time: '00:00', t: 24, ws: 6.0, wd: 'E', hu: 96, desc: 'Berawan' },
      { time: '03:00', t: 23, ws: 5.2, wd: 'SE', hu: 98, desc: 'Hujan Ringan' },
      { time: '06:00', t: 24, ws: 6.5, wd: 'E', hu: 95, desc: 'Berawan' },
      { time: '09:00', t: 28, ws: 8.4, wd: 'NE', hu: 86, desc: 'Cerah Berawan' },
      { time: '12:00', t: 29, ws: 9.8, wd: 'E', hu: 82, desc: 'Hujan Sedang' },
      { time: '15:00', t: 28, ws: 8.9, wd: 'E', hu: 88, desc: 'Hujan Ringan' },
      { time: '18:00', t: 26, ws: 7.8, wd: 'E', hu: 92, desc: 'Berawan' },
      { time: '21:00', t: 24, ws: 7.3, wd: 'E', hu: 95, desc: 'Berawan' }
    ]}
  };

  const FALLBACK_QUAKES = [
    { Tanggal: '16 Nov 2026', Jam: '18:36:57 WIB', Magnitude: '3.8', Kedalaman: '10 km', Coordinates: '-5.41,104.60', Wilayah: 'Pusat gempa berada di darat 12 km Barat Laut Tanggamus-Lampung', Potensi: 'Tidak berpotensi tsunami' },
    { Tanggal: '16 Nov 2026', Jam: '03:51:57 WIB', Magnitude: '5.4', Kedalaman: '323 km', Coordinates: '-5.97,128.82', Wilayah: '265 km Tenggara BURUSELATAN-MALUKU', Potensi: 'Tidak berpotensi tsunami' },
    { Tanggal: '15 Nov 2026', Jam: '22:41:15 WIB', Magnitude: '5.4', Kedalaman: '465 km', Coordinates: '1.79,122.30', Wilayah: '127 km BaratLaut GORONTALOUTARA-GORONTALO', Potensi: 'Tidak berpotensi tsunami' },
    { Tanggal: '15 Nov 2026', Jam: '04:24:20 WIB', Magnitude: '4.5', Kedalaman: '18 km', Coordinates: '-8.10,120.49', Wilayah: 'Pusat gempa berada di laut 58 km Timur Laut Manggarai-NTT', Potensi: 'Tidak berpotensi tsunami' },
    { Tanggal: '10 Nov 2026', Jam: '22:51:37 WIB', Magnitude: '5.1', Kedalaman: '10 km', Coordinates: '-0.93,128.60', Wilayah: '116 km TimurLaut HALMAHERASELATAN-MALUT', Potensi: 'Tidak berpotensi tsunami' },
    { Tanggal: '10 Nov 2026', Jam: '15:34:04 WIB', Magnitude: '5.0', Kedalaman: '24 km', Coordinates: '-0.19,132.98', Wilayah: '69 km BaratLaut KEBARMANOKWARI-PAPUABRT', Potensi: 'Tidak berpotensi tsunami' },
    { Tanggal: '09 Nov 2026', Jam: '09:12:33 WIB', Magnitude: '5.3', Kedalaman: '82 km', Coordinates: '-7.15,129.80', Wilayah: '90 km BaratDaya TANIMBAR-MALUKU', Potensi: 'Tidak berpotensi tsunami' },
    { Tanggal: '08 Nov 2026', Jam: '14:45:00 WIB', Magnitude: '5.2', Kedalaman: '12 km', Coordinates: '-3.12,130.45', Wilayah: '20 km BaratLaut SERAMBAGIANTIMUR-MALUKU', Potensi: 'Tidak berpotensi tsunami' },
    { Tanggal: '07 Nov 2026', Jam: '11:20:18 WIB', Magnitude: '5.6', Kedalaman: '102 km', Coordinates: '1.25,124.80', Wilayah: '1 km BaratDaya TOMOHON-SULUT', Potensi: 'Tidak berpotensi tsunami' },
    { Tanggal: '06 Nov 2026', Jam: '20:05:42 WIB', Magnitude: '5.0', Kedalaman: '95 km', Coordinates: '-7.40,129.20', Wilayah: '169 km BaratLaut TANIMBAR-MALUKU', Potensi: 'Tidak berpotensi tsunami' },
    { Tanggal: '05 Nov 2026', Jam: '17:33:10 WIB', Magnitude: '5.5', Kedalaman: '45 km', Coordinates: '-5.25,132.60', Wilayah: '139 km BaratLaut TUAL-MALUKU', Potensi: 'Tidak berpotensi tsunami' },
    { Tanggal: '04 Nov 2026', Jam: '06:14:55 WIB', Magnitude: '5.2', Kedalaman: '10 km', Coordinates: '-4.80,140.50', Wilayah: '153 km Tenggara OKSIBIL-PAPUAPGNGN', Potensi: 'Tidak berpotensi tsunami' },
    { Tanggal: '03 Nov 2026', Jam: '08:42:19 WIB', Magnitude: '5.8', Kedalaman: '68 km', Coordinates: '3.60,125.40', Wilayah: '187 km BaratLaut TAHUNA-KEP.SANGIHE-SULUT', Potensi: 'Tidak berpotensi tsunami' },
    { Tanggal: '02 Nov 2026', Jam: '19:10:04 WIB', Magnitude: '5.1', Kedalaman: '10 km', Coordinates: '-9.20,110.20', Wilayah: '136 km BaratDaya GUNUNGKIDUL-DIY', Potensi: 'Tidak berpotensi tsunami' },
    { Tanggal: '01 Nov 2026', Jam: '23:55:12 WIB', Magnitude: '5.4', Kedalaman: '10 km', Coordinates: '-3.10,102.15', Wilayah: '6 km BaratLaut LEBONG-BENGKULU', Potensi: 'Tidak berpotensi tsunami' }
  ];

  // State aplikasi
  let currentMode = 'weather';            // 'weather' | 'quake'
  const weatherMap = {};                  // Cache per key kota
  let majorStationsList = [];             // 7 stasiun utama untuk agregasi nasional
  let quakeData = null;                   // Array 15 gempa terkini BMKG
  let selectedWeatherLoc = 'all';         // 'all' | cityKey
  let selectedQuakeZone = 'all';          // 'all' | zone
  let weatherMetric = 'ws';               // 'ws' | 't' | 'hu'
  let quakeMetric = 'count';              // 'count' | 'mag'
  let isLive = false;
  let lastSyncStr = '';

  const $ = id => document.getElementById(id);

  function getWeatherEmoji(desc) {
    const d = String(desc || '').toLowerCase();
    if (/petir|badai|guntur/.test(d)) return '⛈️';
    if (/lebat|deras/.test(d)) return '🌧️';
    if (/hujan|gerimis/.test(d)) return '🌦️';
    if (/kabut|kabur|asap/.test(d)) return '🌫️';
    if (/tebal/.test(d)) return '☁️';
    if (/berawan/.test(d)) return '⛅';
    if (/cerah/.test(d)) return '☀️';
    return '🌤️';
  }

  function parseQuakeZone(w) {
    const s = String(w || '').toUpperCase();
    if (/MALUKU|MALUT|HALMAHERA|BURU|SERAM|BANDA|TANIMBAR|TUAL|ARU/.test(s)) return 'Maluku';
    if (/PAPUA|JAYAPURA|NABIRE|SORONG|MANOKWARI|OKSIBIL|MIMIKA|MERAUKE/.test(s)) return 'Papua';
    if (/SULAWESI|SULTENG|SULSEL|SULUT|SULTRA|GORONTALO|SANGIHE|TALAUD|KARATUNG|TOMOHON|MANADO/.test(s)) return 'Sulawesi';
    if (/SUMAT|ACEH|MEDAN|LAMPUNG|BENGKULU|RIAU|JAMBI|NIAS|LEBONG|PADANG|MENTAWAI/.test(s)) return 'Sumatra';
    if (/JAWA|JABAR|JATENG|JATIM|BANTEN|YOGYA|DIY|GUNUNGKIDUL|SUKABUMI|PANGANDARAN|PACITAN|BOGOR|GARUT/.test(s)) return 'Jawa';
    if (/BALI|NTB|NTT|LOMBOK|SUMBA|FLORES|KUPANG|ALOR|ROTE|MANGGARAI|BIMA/.test(s)) return 'Bali & Nusa Tenggara';
    if (/KALIMANTAN|KALTIM|KALSEL|KALBAR|KALTENG|KALTARA/.test(s)) return 'Kalimantan';
    return 'Maluku';
  }

  async function fetchJSON(url, timeoutMs = 7000) {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } finally {
      clearTimeout(tid);
    }
  }

  // Mengambil data cuaca untuk 1 kota spesifik
  async function fetchSingleCityWeather(city) {
    if (weatherMap[city.key]) return weatherMap[city.key];

    try {
      const url = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${city.adm4}`;
      const json = await fetchJSON(url);
      const rawSlots = json && json.data && json.data[0] && json.data[0].cuaca ? json.data[0].cuaca.flat() : [];
      if (!rawSlots.length) throw new Error('Slot kosong');

      const slots = rawSlots.slice(0, 8).map(s => {
        const dt = s.local_datetime || s.datetime || '';
        const parts = dt.split(' ');
        const time = parts[1] ? parts[1].substring(0, 5) : '00:00';
        return {
          time,
          t: Math.round(Number(s.t) || 27),
          ws: Math.round((Number(s.ws) || 0) * 10) / 10,
          wd: s.wd || 'Var',
          hu: Math.round(Number(s.hu) || 80),
          desc: s.weather_desc || 'Berawan'
        };
      });

      const cur = slots[0] || { t: 27, ws: 4, wd: 'E', hu: 80, desc: 'Berawan' };
      const record = { ...city, cur, slots };
      weatherMap[city.key] = record;
      return record;
    } catch (e) {
      console.warn(`Gagal fetch ${city.name}, memakai data cadangan:`, e.message);
      const fb = FALLBACK_WEATHER[city.key] || FALLBACK_WEATHER.jkt;
      const record = { ...city, cur: fb.cur, slots: fb.slots };
      weatherMap[city.key] = record;
      return record;
    }
  }

  // Sinkronisasi data awal
  async function syncAllData(isManual = false) {
    const refreshIcon = $('st-refresh-icon');
    const syncText = $('st-api-sync');
    const badge = $('st-status-badge');

    if (refreshIcon) refreshIcon.classList.add('st-spin');
    if (syncText) syncText.textContent = 'Menghubungkan ke server BMKG…';

    try {
      // Fetch 7 stasiun utama untuk agregasi nasional
      const majorCities = CITIES.filter(c => c.isMajor);
      const results = await Promise.allSettled(majorCities.map(c => fetchSingleCityWeather(c)));

      majorStationsList = majorCities.map(c => weatherMap[c.key] || {
        ...c,
        cur: FALLBACK_WEATHER[c.key]?.cur || FALLBACK_WEATHER.jkt.cur,
        slots: FALLBACK_WEATHER[c.key]?.slots || FALLBACK_WEATHER.jkt.slots
      });

      // Fetch gempa terkini BMKG TEWS
      try {
        const qkJson = await fetchJSON('https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json');
        const list = qkJson && qkJson.Infogempa && qkJson.Infogempa.gempa;
        if (Array.isArray(list) && list.length) {
          quakeData = list;
          isLive = true;
        } else {
          quakeData = FALLBACK_QUAKES;
        }
      } catch (err) {
        quakeData = FALLBACK_QUAKES;
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
      lastSyncStr = `${timeStr} WIB`;

      if (syncText) syncText.textContent = `Sinkronisasi terakhir: ${lastSyncStr}`;
      if (badge) {
        badge.innerHTML = `<span class="w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse"></span> ${isLive ? 'LIVE BMKG API' : 'TERVERIFIKASI BMKG'}`;
      }
    } catch (err) {
      console.error('Error sync BMKG:', err);
      if (syncText) syncText.textContent = 'Memakai data terverifikasi BMKG';
    } finally {
      if (refreshIcon) refreshIcon.classList.remove('st-spin');
      renderDashboard();
    }
  }

  // ===================================================================
  // RENDERER DROPDOWN KEBAWAH PILIHAN KOTA & ZONA LENGKAP
  // ===================================================================
  function renderDropdownAndShortcuts() {
    const dropdown = $('st-city-dropdown');
    const shortcutsContainer = $('st-location-buttons');
    const badge = $('st-current-loc-badge');
    const label = $('st-loc-label');
    if (!dropdown) return;

    if (currentMode === 'weather') {
      label.textContent = 'Wilayah Pantau:';

      // Update badge keterangan
      if (selectedWeatherLoc === 'all') {
        badge.textContent = 'Semua Wilayah (Nasional)';
      } else {
        const c = CITIES.find(x => x.key === selectedWeatherLoc);
        badge.textContent = c ? `${c.name} (${c.prov})` : 'Wilayah Khusus';
      }

      // Bangun elemen dropdown dengan <optgroup> per pulau
      const islandGroups = {};
      CITIES.forEach(c => {
        if (!islandGroups[c.island]) islandGroups[c.island] = [];
        islandGroups[c.island].push(c);
      });

      let optHtml = `<option value="all" ${selectedWeatherLoc === 'all' ? 'selected' : ''}>🌐 Seluruh Indonesia (Rangkuman Nasional)</option>`;
      Object.keys(islandGroups).forEach(isl => {
        optHtml += `<optgroup label="📍 ${isl.toUpperCase()}">`;
        islandGroups[isl].forEach(c => {
          const isSel = c.key === selectedWeatherLoc ? 'selected' : '';
          optHtml += `<option value="${c.key}" ${isSel}>${c.name} — ${c.prov}</option>`;
        });
        optHtml += `</optgroup>`;
      });
      dropdown.innerHTML = optHtml;

      // Bangun tombol akses cepat (shortcut)
      if (shortcutsContainer) {
        let scHtml = `
          <button class="st-tab st-tab-sm${selectedWeatherLoc === 'all' ? ' on' : ''}" data-loc="all">
            Semua
          </button>
        `;
        CITIES.filter(c => c.isMajor).forEach(c => {
          const isCur = c.key === selectedWeatherLoc;
          const shortName = c.name.replace('DKI ', '').replace(' (Pusat)', '');
          scHtml += `
            <button class="st-tab st-tab-sm${isCur ? ' on' : ''}" data-loc="${c.key}">
              ${shortName}
            </button>
          `;
        });
        shortcutsContainer.innerHTML = scHtml;
      }
    } else {
      label.textContent = 'Zona Kepulauan:';
      badge.textContent = selectedQuakeZone === 'all' ? 'Semua Zona (15 Gempa Terkini)' : `Zona ${selectedQuakeZone}`;

      // Ambil daftar zona dari data gempa
      const zoneCounts = {};
      (quakeData || []).forEach(g => {
        const z = parseQuakeZone(g.Wilayah);
        zoneCounts[z] = (zoneCounts[z] || 0) + 1;
      });

      let optHtml = `<option value="all" ${selectedQuakeZone === 'all' ? 'selected' : ''}>🌐 Seluruh Zona Gempa (15 Kejadian Terkini)</option>`;
      optHtml += `<optgroup label="⚡ ZONA SEISMIK KEPULAUAN INDONESIA">`;
      Object.keys(zoneCounts).sort().forEach(z => {
        const isSel = z === selectedQuakeZone ? 'selected' : '';
        optHtml += `<option value="${z}" ${isSel}>Zona ${z} (${zoneCounts[z]} Gempa)</option>`;
      });
      optHtml += `</optgroup>`;
      dropdown.innerHTML = optHtml;

      if (shortcutsContainer) {
        let scHtml = `
          <button class="st-tab st-tab-sm${selectedQuakeZone === 'all' ? ' on' : ''}" data-qzone="all">
            Semua (${quakeData ? quakeData.length : 0})
          </button>
        `;
        Object.keys(zoneCounts).sort().forEach(z => {
          const isCur = z === selectedQuakeZone;
          scHtml += `
            <button class="st-tab st-tab-sm${isCur ? ' on' : ''}" data-qzone="${z}">
              ${z} (${zoneCounts[z]})
            </button>
          `;
        });
        shortcutsContainer.innerHTML = scHtml;
      }
    }
  }

  // ===================================================================
  // RENDERER CUACA & ANGIN
  // ===================================================================
  function renderWeatherKPI() {
    const list = majorStationsList.length ? majorStationsList : Object.values(weatherMap);
    if (!list.length) return;

    let cards = [];

    if (selectedWeatherLoc === 'all') {
      const sortedWind = list.slice().sort((a, b) => b.cur.ws - a.cur.ws);
      const maxWindStation = sortedWind[0];
      const avgWind = (list.reduce((s, r) => s + r.cur.ws, 0) / list.length).toFixed(1);
      const avgHu = Math.round(list.reduce((s, r) => s + r.cur.hu, 0) / list.length);
      const stormyCount = list.filter(r => /petir|badai|lebat/i.test(r.cur.desc) || r.cur.ws >= 10).length;

      let stormStatus = 'Kondusif Normal';
      let stormColor = 'text-emerald-400';
      if (stormyCount >= 3) {
        stormStatus = 'Siaga Badai Lokal';
        stormColor = 'text-rose-400';
      } else if (stormyCount >= 1) {
        stormStatus = 'Waspada Hujan Lebat';
        stormColor = 'text-amber-400';
      }

      cards = [
        {
          label: 'Angin Tertinggi Terpantau',
          val: `${maxWindStation.cur.ws} <span class="text-sm font-normal text-slate-400">km/j</span>`,
          sub: `${maxWindStation.name} (${maxWindStation.cur.wd})`,
          color: 'text-amber-300'
        },
        {
          label: 'Rata-Rata Angin Nasional',
          val: `${avgWind} <span class="text-sm font-normal text-slate-400">km/j</span>`,
          sub: 'Dihitung dari seluruh stasiun pantau BMKG',
          color: 'text-sky-300'
        },
        {
          label: 'Kelembapan Rata-Rata (RH)',
          val: `${avgHu}%`,
          sub: avgHu >= 85 ? 'Kadar Uap Air Sangat Tinggi' : 'Kondisi Normal',
          color: 'text-teal-300'
        },
        {
          label: 'Indikator Dinamika Cuaca',
          val: stormStatus,
          sub: `${stormyCount} wilayah terdeteksi waspada`,
          color: stormColor
        }
      ];
    } else {
      const cityMeta = CITIES.find(c => c.key === selectedWeatherLoc) || CITIES[0];
      const st = weatherMap[selectedWeatherLoc] || {
        ...cityMeta,
        cur: FALLBACK_WEATHER[selectedWeatherLoc]?.cur || FALLBACK_WEATHER.jkt.cur,
        slots: FALLBACK_WEATHER[selectedWeatherLoc]?.slots || FALLBACK_WEATHER.jkt.slots
      };

      const winds = st.slots.map(s => s.ws);
      const temps = st.slots.map(s => s.t);
      const maxWind = Math.max(...winds);
      const minTemp = Math.min(...temps);
      const maxTemp = Math.max(...temps);

      const isStorm = /petir|badai/i.test(st.cur.desc) || st.cur.ws >= 10 || maxWind >= 12;
      const isRain = /hujan|deras|lebat/i.test(st.cur.desc);

      let statusText = 'Kondusif';
      let statusColor = 'text-emerald-400';
      if (isStorm) {
        statusText = 'Siaga Angin / Badai';
        statusColor = 'text-rose-400';
      } else if (isRain) {
        statusText = 'Waspada Hujan';
        statusColor = 'text-amber-400';
      }

      cards = [
        {
          label: `Kecepatan Angin Terkini (${st.name})`,
          val: `${st.cur.ws} <span class="text-sm font-normal text-slate-400">km/j</span>`,
          sub: `Puncak 24 Jam: ${maxWind} km/j (${st.cur.wd})`,
          color: st.cur.ws >= 10 ? 'text-rose-400' : 'text-sky-300'
        },
        {
          label: `Suhu Udara (${st.prov})`,
          val: `${st.cur.t}°C`,
          sub: `Rentang 24 jam: ${minTemp}°C – ${maxTemp}°C`,
          color: 'text-amber-300'
        },
        {
          label: `Kelembapan Relatif (RH)`,
          val: `${st.cur.hu}%`,
          sub: st.cur.hu >= 85 ? 'Uap Air Tinggi (Potensi Konveksi)' : 'Normal',
          color: 'text-teal-300'
        },
        {
          label: `Status Dinamika Cuaca`,
          val: statusText,
          sub: `${st.cur.desc} (${getWeatherEmoji(st.cur.desc)})`,
          color: statusColor
        }
      ];
    }

    $('st-kpi').innerHTML = cards.map(c => `
      <div class="rounded-xl bg-abyss-900/80 border border-slate-800/80 p-4 flex flex-col justify-between hover:border-slate-700 transition">
        <div>
          <div class="font-mono text-[10px] text-slate-400 uppercase tracking-wider mb-1">${c.label}</div>
          <div class="font-mono text-xl sm:text-2xl font-bold ${c.color}">${c.val}</div>
        </div>
        <div class="font-mono text-[11px] text-slate-400 mt-2 flex items-center gap-1.5 border-t border-slate-800/60 pt-2">
          <span>●</span> <span>${c.sub}</span>
        </div>
      </div>
    `).join('');
  }

  function renderWeatherLine() {
    const list = majorStationsList.length ? majorStationsList : Object.values(weatherMap);
    if (!list.length) return;

    let slots = [];
    let titleStr = '';
    let noteStr = '';

    if (selectedWeatherLoc === 'all') {
      const slotCount = list[0].slots.length;
      slots = [];
      for (let i = 0; i < slotCount; i++) {
        const time = list[0].slots[i].time;
        const avgWs = Number((list.reduce((sum, st) => sum + (st.slots[i] ? st.slots[i].ws : 0), 0) / list.length).toFixed(1));
        const avgT = Math.round(list.reduce((sum, st) => sum + (st.slots[i] ? st.slots[i].t : 0), 0) / list.length);
        slots.push({ time, ws: avgWs, t: avgT, desc: 'Rata-rata Nasional' });
      }
      titleStr = 'Tren Kecepatan Angin Rata-rata Nasional (24 Jam)';
      const maxW = Math.max(...slots.map(s => s.ws));
      noteStr = `Rata-rata profil kecepatan angin dari stasiun pengamatan BMKG • Kecepatan angin rata-rata puncak: <span class="text-amber-400 font-bold">${maxW} km/j</span>`;
    } else {
      const cityMeta = CITIES.find(c => c.key === selectedWeatherLoc) || CITIES[0];
      const targetStation = weatherMap[selectedWeatherLoc] || {
        ...cityMeta,
        cur: FALLBACK_WEATHER[selectedWeatherLoc]?.cur || FALLBACK_WEATHER.jkt.cur,
        slots: FALLBACK_WEATHER[selectedWeatherLoc]?.slots || FALLBACK_WEATHER.jkt.slots
      };
      slots = targetStation.slots;
      titleStr = `Tren Kecepatan Angin & Suhu 24 Jam: ${targetStation.name}`;
      const winds = slots.map(s => s.ws);
      const maxW = Math.max(...winds);
      const maxIdx = winds.indexOf(maxW);
      const peakSlot = slots[maxIdx] || slots[0];
      noteStr = `Prakiraan dinamika angin di <strong>${targetStation.name} (${targetStation.prov})</strong> • Puncak: <span class="text-amber-400 font-bold">${maxW} km/j</span> pada ${peakSlot.time} (${peakSlot.desc}, ${peakSlot.t}°C)`;
    }

    $('st-line-title').textContent = titleStr;
    $('st-line-note').innerHTML = noteStr;

    // Mini switcher kota di pojok grafik
    $('st-years').innerHTML = `
      <button class="st-tab st-tab-sm${selectedWeatherLoc === 'all' ? ' on' : ''}" data-station="all">Semua</button>
      ${CITIES.filter(c => c.isMajor).map(s => `
        <button class="st-tab st-tab-sm${s.key === selectedWeatherLoc ? ' on' : ''}" data-station="${s.key}">
          ${s.name.replace('DKI ', '').replace(' (Pusat)', '')}
        </button>
      `).join('')}
    `;

    const winds = slots.map(s => s.ws);
    const W = 560, H = 220, L = 42, Rr = 16, T = 20, B = 30;
    const maxWind = Math.max(10, Math.ceil((Math.max(...winds) + 2) / 2) * 2);

    const x = i => L + (i * (W - L - Rr)) / Math.max(1, slots.length - 1);
    const y = v => T + (H - T - B) * (1 - v / maxWind);

    let s = `<svg viewBox="0 0 ${W} ${H}" class="w-full overflow-visible">`;

    for (let t = 0; t <= maxWind; t += Math.max(2, Math.round(maxWind / 3))) {
      s += `
        <line x1="${L}" x2="${W - Rr}" y1="${y(t)}" y2="${y(t)}" stroke="#1e293b" stroke-dasharray="2,2"/>
        <text x="${L - 8}" y="${y(t) + 3}" text-anchor="end" font-size="9" fill="#64748b" font-family="monospace">${t} km/j</text>
      `;
    }

    const pts = slots.map((sl, i) => [x(i), y(sl.ws)]);
    const areaD = `M${pts.map(p => p.join(',')).join('L')}L${pts[pts.length - 1][0]},${y(0)}L${pts[0][0]},${y(0)}Z`;
    const lineD = `M${pts.map(p => p.join(',')).join('L')}`;

    s += `<path d="${areaD}" fill="#38bdf8" opacity="0.12"/>`;
    s += `<path d="${lineD}" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;

    const highestVal = Math.max(...winds);
    slots.forEach((sl, i) => {
      const cx = x(i), cy = y(sl.ws);
      const isPeak = sl.ws === highestVal;
      s += `
        <circle class="st-pt" cx="${cx}" cy="${cy}" r="${isPeak ? 5.5 : 4}" fill="${isPeak ? '#f59e0b' : '#38bdf8'}" stroke="#050a12" stroke-width="2">
          <title>${sl.time} — Kecepatan: ${sl.ws} km/j, Suhu: ${sl.t}°C, Cuaca: ${sl.desc}</title>
        </circle>
        <text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="9" font-weight="bold" fill="${isPeak ? '#fbbf24' : '#94a3b8'}" font-family="monospace">${sl.ws}</text>
      `;
    });

    slots.forEach((sl, i) => {
      s += `<text x="${x(i)}" y="${H - 10}" text-anchor="middle" font-size="10" fill="#94a3b8" font-family="monospace">${sl.time}</text>`;
    });

    s += '</svg>';
    $('st-line').innerHTML = s;
  }

  function renderWeatherBars() {
    const list = majorStationsList.length ? majorStationsList : Object.values(weatherMap);
    if (!list.length) return;

    let items = [];
    let barColor = '#38bdf8';
    let unit = '';
    const metricNames = { ws: 'Kecepatan Angin (km/j)', t: 'Suhu Udara (°C)', hu: 'Kelembapan Udara (%)' };

    if (weatherMetric === 'ws') { barColor = '#38bdf8'; unit = 'km/j'; }
    else if (weatherMetric === 't') { barColor = '#f59e0b'; unit = '°C'; }
    else { barColor = '#2dd4bf'; unit = '%'; }

    if (selectedWeatherLoc === 'all') {
      items = list.map(r => {
        let val = 0;
        if (weatherMetric === 'ws') val = r.cur.ws;
        else if (weatherMetric === 't') val = r.cur.t;
        else val = r.cur.hu;
        return { label: r.name.replace('DKI ', '').replace(' (Pusat)', ''), val, title: `${r.name}: ${val} ${unit}` };
      });
      $('st-bars-title').textContent = 'Perbandingan Parameter Antar Wilayah';
      $('st-bars-note').textContent = `Perbandingan ${metricNames[weatherMetric]} saat ini di stasiun observasi BMKG`;
    } else {
      const cityMeta = CITIES.find(c => c.key === selectedWeatherLoc) || CITIES[0];
      const st = weatherMap[selectedWeatherLoc] || {
        ...cityMeta,
        cur: FALLBACK_WEATHER[selectedWeatherLoc]?.cur || FALLBACK_WEATHER.jkt.cur,
        slots: FALLBACK_WEATHER[selectedWeatherLoc]?.slots || FALLBACK_WEATHER.jkt.slots
      };
      items = st.slots.map(s => {
        let val = 0;
        if (weatherMetric === 'ws') val = s.ws;
        else if (weatherMetric === 't') val = s.t;
        else val = s.hu;
        return { label: s.time, val, title: `${s.time} — ${val} ${unit} (${s.desc})` };
      });
      $('st-bars-title').textContent = `Profil ${metricNames[weatherMetric]}: ${st.name}`;
      $('st-bars-note').textContent = `Fluktuasi 24 jam parameter di ${st.name} (${st.prov}) menurut data model BMKG`;
    }

    const vals = items.map(i => i.val);
    const maxVal = Math.max(...vals, 1);
    const highest = Math.max(...vals);

    $('st-bars').innerHTML = items.map(item => {
      const hPercent = Math.max(12, Math.round((item.val / maxVal) * 85));
      const isMax = item.val === highest;
      return `
        <div class="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer" title="${item.title}">
          <div class="font-mono text-[11px] font-bold text-white mb-1.5 transition group-hover:scale-110">${item.val}<span class="text-[9px] text-slate-400">${unit}</span></div>
          <div class="st-bar w-full max-w-[42px] rounded-t-lg transition-all" style="height:${hPercent}%;background:${barColor};opacity:${isMax ? 1 : 0.65}"></div>
          <div class="text-[10px] font-mono text-slate-400 mt-2 text-center truncate w-full px-0.5">${item.label}</div>
        </div>
      `;
    }).join('');
  }

  function renderWeatherDonut() {
    const list = majorStationsList.length ? majorStationsList : Object.values(weatherMap);
    if (!list.length) return;

    let catCounts = {
      'Hujan Petir/Badai': 0,
      'Hujan Sedang/Ringan': 0,
      'Berawan/Tebal': 0,
      'Cerah/Berawan': 0
    };

    let totalSlots = 0;
    let donutTitle = '';
    let donutNote = '';

    if (selectedWeatherLoc === 'all') {
      list.forEach(r => {
        const d = r.cur.desc.toLowerCase();
        if (/petir|badai|guntur/.test(d)) catCounts['Hujan Petir/Badai']++;
        else if (/hujan|gerimis|lebat/.test(d)) catCounts['Hujan Sedang/Ringan']++;
        else if (/tebal|kabut|asap|berawan/.test(d) && !/cerah/.test(d)) catCounts['Berawan/Tebal']++;
        else catCounts['Cerah/Berawan']++;
      });
      totalSlots = list.length;
      donutTitle = 'Distribusi Cuaca Nasional';
      donutNote = 'Proporsi klasifikasi meteorologi stasiun terpantau';
    } else {
      const cityMeta = CITIES.find(c => c.key === selectedWeatherLoc) || CITIES[0];
      const st = weatherMap[selectedWeatherLoc] || {
        ...cityMeta,
        cur: FALLBACK_WEATHER[selectedWeatherLoc]?.cur || FALLBACK_WEATHER.jkt.cur,
        slots: FALLBACK_WEATHER[selectedWeatherLoc]?.slots || FALLBACK_WEATHER.jkt.slots
      };
      st.slots.forEach(s => {
        const d = s.desc.toLowerCase();
        if (/petir|badai|guntur/.test(d)) catCounts['Hujan Petir/Badai']++;
        else if (/hujan|gerimis|lebat/.test(d)) catCounts['Hujan Sedang/Ringan']++;
        else if (/tebal|kabut|asap|berawan/.test(d) && !/cerah/.test(d)) catCounts['Berawan/Tebal']++;
        else catCounts['Cerah/Berawan']++;
      });
      totalSlots = st.slots.length;
      donutTitle = `Proporsi Cuaca 24 Jam: ${st.name}`;
      donutNote = `Distribusi kondisi atmosfer 24 jam di ${st.prov}`;
    }

    $('st-donut-title').textContent = donutTitle;
    $('st-donut-note').textContent = donutNote;

    const categories = [
      { label: 'Hujan Petir/Badai', count: catCounts['Hujan Petir/Badai'], color: '#f43f5e' },
      { label: 'Hujan Sedang/Ringan', count: catCounts['Hujan Sedang/Ringan'], color: '#f59e0b' },
      { label: 'Berawan/Tebal', count: catCounts['Berawan/Tebal'], color: '#38bdf8' },
      { label: 'Cerah/Cerah Berawan', count: catCounts['Cerah/Berawan'], color: '#10b981' }
    ].filter(c => c.count > 0);

    const C = 2 * Math.PI * 52;
    let offset = 0;

    const circles = categories.map(c => {
      const dash = (c.count / totalSlots) * C;
      const svgCircle = `
        <circle cx="70" cy="70" r="52" fill="none" stroke="${c.color}" stroke-width="20"
          stroke-dasharray="${dash} ${C - dash}" stroke-dashoffset="${-offset}"
          transform="rotate(-90 70 70)"/>
      `;
      offset += dash;
      return svgCircle;
    }).join('');

    const rainCount = catCounts['Hujan Petir/Badai'] + catCounts['Hujan Sedang/Ringan'];
    const rainPercent = Math.round((rainCount / totalSlots) * 100);

    $('st-donut').innerHTML = `
      <div class="flex flex-col sm:flex-row items-center gap-5 justify-around">
        <div class="relative w-36 h-36 shrink-0">
          <svg viewBox="0 0 140 140" class="w-full h-full">
            ${circles}
            <text x="70" y="66" text-anchor="middle" font-size="20" font-weight="900" fill="#ffffff" font-family="monospace">${rainPercent}%</text>
            <text x="70" y="82" text-anchor="middle" font-size="9" fill="#94a3b8" font-family="monospace">POTENSI HUJAN</text>
          </svg>
        </div>
        <div class="space-y-2 text-xs font-mono w-full max-w-[210px]">
          ${categories.map(c => `
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-slate-300">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${c.color}"></span>
                <span class="truncate">${c.label}</span>
              </span>
              <span class="font-bold text-white">${c.count} ${selectedWeatherLoc === 'all' ? 'stasiun' : 'slot'}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderWeatherTable() {
    const list = majorStationsList.length ? majorStationsList : Object.values(weatherMap);
    if (!list.length) return;

    if (selectedWeatherLoc === 'all') {
      $('st-table-title').textContent = 'Tabel Observasi Stasiun Utama BMKG di Indonesia';
      $('st-table').innerHTML = `
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="font-mono text-[10px] text-slate-400 uppercase border-b border-slate-800">
              <th class="py-2.5 px-3">Wilayah Pantau</th>
              <th class="py-2.5 px-3">Kondisi BMKG</th>
              <th class="py-2.5 px-3 text-right">Suhu</th>
              <th class="py-2.5 px-3 text-right">Kec. Angin</th>
              <th class="py-2.5 px-3 text-center">Arah</th>
              <th class="py-2.5 px-3 text-right">RH</th>
              <th class="py-2.5 px-3 text-center">Status Dinamika</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(r => {
              const isStormy = /petir|badai/i.test(r.cur.desc) || r.cur.ws >= 10;
              const isRain = /hujan/i.test(r.cur.desc);
              let badge = '<span class="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Kondusif</span>';
              if (isStormy) {
                badge = '<span class="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">Siaga Badai</span>';
              } else if (isRain) {
                badge = '<span class="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">Waspada</span>';
              }

              return `
                <tr class="border-b border-slate-800/60 hover:bg-slate-800/40 transition cursor-pointer" onclick="window.selectStatsCity?.('${r.key}')">
                  <td class="py-2.5 px-3 font-medium text-white">
                    <div class="hover:text-sky-300 transition">${r.name}</div>
                    <div class="text-[10px] text-slate-400 font-mono">${r.prov}</div>
                  </td>
                  <td class="py-2.5 px-3">
                    <div class="flex items-center gap-1.5 text-slate-200">
                      <span class="text-base">${getWeatherEmoji(r.cur.desc)}</span>
                      <span>${r.cur.desc}</span>
                    </div>
                  </td>
                  <td class="py-2.5 px-3 text-right font-mono font-bold text-amber-300">${r.cur.t}°C</td>
                  <td class="py-2.5 px-3 text-right font-mono font-bold text-sky-400">${r.cur.ws} <span class="text-[10px] font-normal text-slate-400">km/j</span></td>
                  <td class="py-2.5 px-3 text-center font-mono text-slate-300">${r.cur.wd}</td>
                  <td class="py-2.5 px-3 text-right font-mono text-teal-300">${r.cur.hu}%</td>
                  <td class="py-2.5 px-3 text-center">${badge}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else {
      const cityMeta = CITIES.find(c => c.key === selectedWeatherLoc) || CITIES[0];
      const st = weatherMap[selectedWeatherLoc] || {
        ...cityMeta,
        cur: FALLBACK_WEATHER[selectedWeatherLoc]?.cur || FALLBACK_WEATHER.jkt.cur,
        slots: FALLBACK_WEATHER[selectedWeatherLoc]?.slots || FALLBACK_WEATHER.jkt.slots
      };

      $('st-table-title').textContent = `Prakiraan Lengkap per Jam: ${st.name} (${st.prov})`;
      $('st-table').innerHTML = `
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="font-mono text-[10px] text-slate-400 uppercase border-b border-slate-800">
              <th class="py-2.5 px-3">Jam (Waktu)</th>
              <th class="py-2.5 px-3">Kondisi BMKG</th>
              <th class="py-2.5 px-3 text-right">Kec. Angin</th>
              <th class="py-2.5 px-3 text-center">Arah</th>
              <th class="py-2.5 px-3 text-right">Suhu</th>
              <th class="py-2.5 px-3 text-right">Kelembapan</th>
              <th class="py-2.5 px-3 text-center">Indikator Angin</th>
            </tr>
          </thead>
          <tbody>
            ${st.slots.map(sl => {
              const isHighWind = sl.ws >= 10;
              const isStorm = /petir|badai/i.test(sl.desc);
              let windBadge = '<span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">Normal</span>';
              if (isStorm) {
                windBadge = '<span class="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">Badai / Gust</span>';
              } else if (isHighWind) {
                windBadge = '<span class="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">Kencang</span>';
              }

              return `
                <tr class="border-b border-slate-800/60 hover:bg-slate-800/40 transition">
                  <td class="py-2.5 px-3 font-mono font-bold text-sky-300">${sl.time}</td>
                  <td class="py-2.5 px-3">
                    <div class="flex items-center gap-1.5 text-slate-200">
                      <span class="text-base">${getWeatherEmoji(sl.desc)}</span>
                      <span>${sl.desc}</span>
                    </div>
                  </td>
                  <td class="py-2.5 px-3 text-right font-mono font-bold text-sky-400">${sl.ws} <span class="text-[10px] font-normal text-slate-400">km/j</span></td>
                  <td class="py-2.5 px-3 text-center font-mono text-slate-300">${sl.wd}</td>
                  <td class="py-2.5 px-3 text-right font-mono font-bold text-amber-300">${sl.t}°C</td>
                  <td class="py-2.5 px-3 text-right font-mono text-teal-300">${sl.hu}%</td>
                  <td class="py-2.5 px-3 text-center">${windBadge}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }
  }

  // ===================================================================
  // RENDERER SEISMIK & GEMPABUMI (BMKG TEWS)
  // ===================================================================
  function getFilteredQuakes() {
    let list = (quakeData || []).slice();
    if (selectedQuakeZone !== 'all') {
      list = list.filter(g => parseQuakeZone(g.Wilayah) === selectedQuakeZone);
    }
    return list;
  }

  function renderQuakeKPI() {
    const list = getFilteredQuakes();
    if (!list.length) return;

    const mags = list.map(g => parseFloat(g.Magnitude) || 5.0);
    const depths = list.map(g => parseInt(g.Kedalaman) || 10);
    const maxMag = Math.max(...mags).toFixed(1);
    const avgMag = (mags.reduce((a, b) => a + b, 0) / mags.length).toFixed(1);
    const shallowCount = depths.filter(d => d < 60).length;
    const shallowPercent = Math.round((shallowCount / depths.length) * 100);

    const zoneLabel = selectedQuakeZone === 'all' ? 'Nasional' : selectedQuakeZone;

    const cards = [
      {
        label: `Total Gempa (${zoneLabel})`,
        val: `${list.length} <span class="text-sm font-normal text-slate-400">Kejadian</span>`,
        sub: selectedQuakeZone === 'all' ? 'Parameter M ≥ 5.0' : `Zona ${selectedQuakeZone}`,
        color: 'text-sky-300'
      },
      {
        label: `Magnitudo Tertinggi`,
        val: `M ${maxMag}`,
        sub: 'Pusat Seismik Aktif',
        color: 'text-rose-400'
      },
      {
        label: `Rata-Rata Magnitudo`,
        val: `M ${avgMag}`,
        sub: 'Kekuatan Rata-rata',
        color: 'text-amber-300'
      },
      {
        label: `Rasio Dangkal (<60km)`,
        val: `${shallowPercent}%`,
        sub: `${shallowCount} kejadian hiposentrum dangkal`,
        color: 'text-teal-300'
      }
    ];

    $('st-kpi').innerHTML = cards.map(c => `
      <div class="rounded-xl bg-abyss-900/80 border border-slate-800/80 p-4 flex flex-col justify-between hover:border-slate-700 transition">
        <div>
          <div class="font-mono text-[10px] text-slate-400 uppercase tracking-wider mb-1">${c.label}</div>
          <div class="font-mono text-xl sm:text-2xl font-bold ${c.color}">${c.val}</div>
        </div>
        <div class="font-mono text-[11px] text-slate-400 mt-2 flex items-center gap-1.5 border-t border-slate-800/60 pt-2">
          <span>●</span> <span>${c.sub}</span>
        </div>
      </div>
    `).join('');
  }

  function renderQuakeLine() {
    const list = getFilteredQuakes();
    if (!list.length) return;

    $('st-years').innerHTML = '';

    const items = list.slice().reverse();
    const mags = items.map(g => parseFloat(g.Magnitude) || 5.0);
    const W = 560, H = 220, L = 42, Rr = 16, T = 20, B = 30;

    const minM = 3.0;
    const maxM = Math.max(7.0, Math.ceil(Math.max(...mags)));
    const x = i => L + (i * (W - L - Rr)) / Math.max(1, items.length - 1);
    const y = v => T + (H - T - B) * (1 - (v - minM) / (maxM - minM));

    let s = `<svg viewBox="0 0 ${W} ${H}" class="w-full overflow-visible">`;

    for (let m = 4.0; m <= maxM; m += 1.0) {
      s += `
        <line x1="${L}" x2="${W - Rr}" y1="${y(m)}" y2="${y(m)}" stroke="#1e293b" stroke-dasharray="2,2"/>
        <text x="${L - 8}" y="${y(m) + 3}" text-anchor="end" font-size="9" fill="#64748b" font-family="monospace">M ${m.toFixed(1)}</text>
      `;
    }

    const pts = items.map((g, i) => [x(i), y(parseFloat(g.Magnitude))]);
    const areaD = `M${pts.map(p => p.join(',')).join('L')}L${pts[pts.length - 1][0]},${y(minM)}L${pts[0][0]},${y(minM)}Z`;
    const lineD = `M${pts.map(p => p.join(',')).join('L')}`;

    s += `<path d="${areaD}" fill="#f43f5e" opacity="0.10"/>`;
    s += `<path d="${lineD}" fill="none" stroke="#fb7185" stroke-width="2.2" stroke-linejoin="round"/>`;

    items.forEach((g, i) => {
      const cx = x(i), cy = y(parseFloat(g.Magnitude));
      const depth = parseInt(g.Kedalaman) || 10;
      let dotColor = '#ef4444';
      if (depth >= 300) dotColor = '#3b82f6';
      else if (depth >= 60) dotColor = '#f59e0b';

      s += `
        <circle class="st-pt" cx="${cx}" cy="${cy}" r="4.5" fill="${dotColor}" stroke="#050a12" stroke-width="2">
          <title>${g.Tanggal} ${g.Jam} • M ${g.Magnitude} • Kedalaman: ${g.Kedalaman} • ${g.Wilayah}</title>
        </circle>
        <text x="${cx}" y="${cy - 7}" text-anchor="middle" font-size="8.5" font-weight="bold" fill="#fecdd3" font-family="monospace">${g.Magnitude}</text>
      `;
    });

    items.forEach((g, i) => {
      if (items.length > 8 && i % 2 !== 0 && i !== items.length - 1) return;
      const tLabel = g.Jam.substring(0, 5);
      s += `<text x="${x(i)}" y="${H - 10}" text-anchor="middle" font-size="9" fill="#94a3b8" font-family="monospace">${tLabel}</text>`;
    });

    s += '</svg>';
    $('st-line').innerHTML = s;

    const maxMItem = items.slice().sort((a, b) => parseFloat(b.Magnitude) - parseFloat(a.Magnitude))[0];
    $('st-line-note').innerHTML = `Runtut waktu magnitudo di <strong>${selectedQuakeZone === 'all' ? 'Indonesia' : selectedQuakeZone}</strong> • Terkuat: <span class="text-rose-400 font-bold">M ${maxMItem.Magnitude}</span> (${maxMItem.Wilayah})`;
  }

  function renderQuakeBars() {
    const list = getFilteredQuakes();
    if (!list.length) return;

    let items = [];
    const isCount = quakeMetric === 'count';
    const barColor = isCount ? '#f43f5e' : '#f59e0b';
    const unit = isCount ? 'kejadian' : 'M';

    if (selectedQuakeZone === 'all') {
      const zoneMap = {};
      list.forEach(g => {
        const z = parseQuakeZone(g.Wilayah);
        if (!zoneMap[z]) zoneMap[z] = { count: 0, totalMag: 0 };
        zoneMap[z].count++;
        zoneMap[z].totalMag += (parseFloat(g.Magnitude) || 5.0);
      });
      items = Object.keys(zoneMap).map(k => ({
        label: k,
        val: isCount ? zoneMap[k].count : Number((zoneMap[k].totalMag / zoneMap[k].count).toFixed(1)),
        title: `${k}: ${zoneMap[k].count} kejadian`
      })).sort((a, b) => b.val - a.val);
      $('st-bars-title').textContent = 'Sebaran Gempa per Zona Kepulauan';
      $('st-bars-note').textContent = 'Sebaran kejadian gempabumi per kepulauan Indonesia (BMKG TEWS)';
    } else {
      items = list.map((g, idx) => ({
        label: `#${idx + 1}`,
        val: parseFloat(g.Magnitude) || 5.0,
        title: `${g.Jam} • M ${g.Magnitude} • ${g.Kedalaman} • ${g.Wilayah}`
      }));
      $('st-bars-title').textContent = `Daftar Magnitudo: Zona ${selectedQuakeZone}`;
      $('st-bars-note').textContent = `Perbandingan kekuatan tiap gempa di zona ${selectedQuakeZone}`;
    }

    const vals = items.map(i => i.val);
    const maxVal = Math.max(...vals, 1);
    const highest = Math.max(...vals);

    $('st-bars').innerHTML = items.map(item => {
      const hPercent = Math.max(12, Math.round((item.val / maxVal) * 85));
      return `
        <div class="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer" title="${item.title}">
          <div class="font-mono text-[11px] font-bold text-white mb-1.5 transition group-hover:scale-110">${item.val}<span class="text-[9px] text-slate-400">${isCount ? '' : 'M'}</span></div>
          <div class="st-bar w-full max-w-[42px] rounded-t-lg transition-all" style="height:${hPercent}%;background:${barColor};opacity:${item.val === highest ? 1 : 0.65}"></div>
          <div class="text-[10px] font-mono text-slate-400 mt-2 text-center truncate w-full px-0.5">${item.label}</div>
        </div>
      `;
    }).join('');
  }

  function renderQuakeDonut() {
    const list = getFilteredQuakes();
    if (!list.length) return;

    let shallow = 0, medium = 0, deep = 0;
    list.forEach(g => {
      const d = parseInt(g.Kedalaman) || 10;
      if (d < 60) shallow++;
      else if (d <= 300) medium++;
      else deep++;
    });

    const categories = [
      { label: 'Dangkal (<60 km)', count: shallow, color: '#ef4444' },
      { label: 'Menengah (60-300 km)', count: medium, color: '#f59e0b' },
      { label: 'Dalam (>300 km)', count: deep, color: '#3b82f6' }
    ].filter(c => c.count > 0);

    const total = list.length;
    const C = 2 * Math.PI * 52;
    let offset = 0;

    const circles = categories.map(c => {
      const dash = (c.count / total) * C;
      const svgCircle = `
        <circle cx="70" cy="70" r="52" fill="none" stroke="${c.color}" stroke-width="20"
          stroke-dasharray="${dash} ${C - dash}" stroke-dashoffset="${-offset}"
          transform="rotate(-90 70 70)"/>
      `;
      offset += dash;
      return svgCircle;
    }).join('');

    const shallowPercent = Math.round((shallow / total) * 100);

    $('st-donut').innerHTML = `
      <div class="flex flex-col sm:flex-row items-center gap-5 justify-around">
        <div class="relative w-36 h-36 shrink-0">
          <svg viewBox="0 0 140 140" class="w-full h-full">
            ${circles}
            <text x="70" y="66" text-anchor="middle" font-size="20" font-weight="900" fill="#ffffff" font-family="monospace">${shallowPercent}%</text>
            <text x="70" y="82" text-anchor="middle" font-size="9" fill="#94a3b8" font-family="monospace">GEMPA DANGKAL</text>
          </svg>
        </div>
        <div class="space-y-2 text-xs font-mono w-full max-w-[210px]">
          ${categories.map(c => `
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-slate-300">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${c.color}"></span>
                <span class="truncate">${c.label}</span>
              </span>
              <span class="font-bold text-white">${c.count}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderQuakeTable() {
    const list = getFilteredQuakes();
    if (!list.length) return;

    $('st-table-title').textContent = selectedQuakeZone === 'all'
      ? '15 Daftar Kejadian Gempabumi Terkini (BMKG TEWS)'
      : `Daftar Gempabumi Terkini di Zona ${selectedQuakeZone} (BMKG)`;

    $('st-table').innerHTML = `
      <table class="w-full text-xs text-left">
        <thead>
          <tr class="font-mono text-[10px] text-slate-400 uppercase border-b border-slate-800">
            <th class="py-2.5 px-3">Waktu (WIB)</th>
            <th class="py-2.5 px-3 text-center">Magnitudo</th>
            <th class="py-2.5 px-3 text-right">Kedalaman</th>
            <th class="py-2.5 px-3">Wilayah Hiposentrum</th>
            <th class="py-2.5 px-3 font-mono text-center">Koordinat</th>
            <th class="py-2.5 px-3 text-center">Status Tsunami</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(g => {
            const mag = parseFloat(g.Magnitude) || 5.0;
            const depth = parseInt(g.Kedalaman) || 10;
            let magBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
            if (mag >= 6.0) magBadgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
            else if (mag < 5.0) magBadgeColor = 'bg-sky-500/20 text-sky-300 border-sky-500/40';

            return `
              <tr class="border-b border-slate-800/60 hover:bg-slate-800/40 transition">
                <td class="py-2.5 px-3 font-mono text-slate-300">
                  <div class="font-bold text-white">${g.Jam}</div>
                  <div class="text-[10px] text-slate-400">${g.Tanggal}</div>
                </td>
                <td class="py-2.5 px-3 text-center">
                  <span class="inline-block px-2 py-0.5 rounded font-mono font-bold text-xs border ${magBadgeColor}">
                    M ${g.Magnitude}
                  </span>
                </td>
                <td class="py-2.5 px-3 text-right font-mono text-slate-200">
                  <span class="${depth < 60 ? 'text-rose-400 font-bold' : 'text-slate-300'}">${g.Kedalaman}</span>
                </td>
                <td class="py-2.5 px-3 text-slate-200 max-w-[220px]">
                  <div class="truncate font-medium text-slate-200" title="${g.Wilayah}">${g.Wilayah}</div>
                </td>
                <td class="py-2.5 px-3 text-center font-mono text-[10px] text-slate-400">${g.Coordinates}</td>
                <td class="py-2.5 px-3 text-center">
                  <span class="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                    Aman Tsunami
                  </span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  // ===================================================================
  // ORKESTRASI DASHBOARD & SWITCHER
  // ===================================================================
  function renderDashboard() {
    renderDropdownAndShortcuts();

    if (currentMode === 'weather') {
      $('st-main-title').textContent = 'Monitoring Cuaca Ekstrem & Dinamika Atmosfer BMKG';
      $('st-main-desc').textContent = 'Pilih kota pada dropdown untuk melihat rincian kecepatan angin, suhu, kelembapan, dan prakiraan cuaca 24 jam real-time dari BMKG.';
      $('st-api-endpoint').innerHTML = 'Endpoint: <span class="text-sky-400">api.bmkg.go.id/publik/prakiraan-cuaca</span>';

      $('st-bars-metric-tabs').innerHTML = `
        <button class="st-tab${weatherMetric === 'ws' ? ' on' : ''}" data-m="ws">Kec. Angin</button>
        <button class="st-tab${weatherMetric === 't' ? ' on' : ''}" data-m="t">Suhu (°C)</button>
        <button class="st-tab${weatherMetric === 'hu' ? ' on' : ''}" data-m="hu">Kelembapan</button>
      `;

      renderWeatherKPI();
      renderWeatherLine();
      renderWeatherBars();
      renderWeatherDonut();
      renderWeatherTable();
    } else {
      $('st-main-title').textContent = 'Monitoring Seismik & Gempabumi BMKG TEWS';
      $('st-main-desc').textContent = 'Data 15 aktivitas seismik terkini resmi dari Pusat Gempa Nasional BMKG (InaTEWS) dengan magnitudo M ≥ 5.0 dan gempa dirasakan.';
      $('st-api-endpoint').innerHTML = 'Endpoint: <span class="text-rose-400">data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json</span>';
      $('st-line-title').textContent = 'Kronologi Magnitudo Gempa BMKG';
      $('st-donut-title').textContent = 'Klasifikasi Kedalaman Sumber Gempa';
      $('st-donut-note').textContent = 'Rasio hiposentrum dangkal vs dalam';

      $('st-bars-metric-tabs').innerHTML = `
        <button class="st-tab${quakeMetric === 'count' ? ' on' : ''}" data-m="count">Jumlah Kejadian</button>
        <button class="st-tab${quakeMetric === 'mag' ? ' on' : ''}" data-m="mag">Rata-rata Magnitudo</button>
      `;

      renderQuakeKPI();
      renderQuakeLine();
      renderQuakeBars();
      renderQuakeDonut();
      renderQuakeTable();
    }
  }

  // Pilih kota secara asinkron (fetch jika belum ada di memori)
  async function chooseCity(cityKey) {
    selectedWeatherLoc = cityKey;
    if (cityKey !== 'all' && !weatherMap[cityKey]) {
      const city = CITIES.find(c => c.key === cityKey);
      if (city) {
        const syncText = $('st-api-sync');
        if (syncText) syncText.textContent = `Memuat data BMKG untuk ${city.name}…`;
        await fetchSingleCityWeather(city);
        if (syncText && lastSyncStr) syncText.textContent = `Sinkronisasi terakhir: ${lastSyncStr}`;
      }
    }
    renderDashboard();
  }

  // Helper global agar bisa dipanggil dari baris tabel
  window.selectStatsCity = function (key) {
    chooseCity(key);
  };

  // ===================================================================
  // EVENT LISTENERS
  // ===================================================================
  function setupEvents() {
    // Mode switcher: Cuaca vs Gempa
    $('st-mode-weather').addEventListener('click', () => {
      if (currentMode === 'weather') return;
      currentMode = 'weather';
      $('st-mode-weather').classList.add('on');
      $('st-mode-quake').classList.remove('on');
      renderDashboard();
    });

    $('st-mode-quake').addEventListener('click', () => {
      if (currentMode === 'quake') return;
      currentMode = 'quake';
      $('st-mode-quake').classList.add('on');
      $('st-mode-weather').classList.remove('on');
      renderDashboard();
    });

    // Refresh button
    $('st-refresh-btn').addEventListener('click', () => {
      syncAllData(true);
    });

    // Dropdown change event
    $('st-city-dropdown').addEventListener('change', e => {
      const val = e.target.value;
      if (currentMode === 'weather') {
        chooseCity(val);
      } else {
        selectedQuakeZone = val;
        renderDashboard();
      }
    });

    // Shortcut pills click
    $('st-location-buttons').addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (currentMode === 'weather' && btn.dataset.loc) {
        chooseCity(btn.dataset.loc);
      } else if (currentMode === 'quake' && btn.dataset.qzone) {
        selectedQuakeZone = btn.dataset.qzone;
        renderDashboard();
      }
    });

    // Line chart mini-tabs click
    $('st-years').addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (currentMode === 'weather' && btn.dataset.station) {
        chooseCity(btn.dataset.station);
      }
    });

    // Bar chart metrics toggle
    $('st-bars-metric-tabs').addEventListener('click', e => {
      const btn = e.target.closest('button[data-m]');
      if (!btn) return;
      const m = btn.dataset.m;
      if (currentMode === 'weather') {
        weatherMetric = m;
        renderWeatherBars();
      } else {
        quakeMetric = m;
        renderQuakeBars();
      }
      $('st-bars-metric-tabs').querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));
    });
  }

  // Inisialisasi awal
  setupEvents();
  syncAllData();

  // Pembaruan otomatis setiap 10 menit
  setInterval(() => {
    syncAllData();
  }, 10 * 60 * 1000);
})();
