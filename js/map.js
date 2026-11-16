// 5. Bab 03: peta interaktif badai (Leaflet / OpenStreetMap)
document.addEventListener('DOMContentLoaded', () => {
  /* -------------------------------------------------------------------
   * 5. CHAPTER 03: DRAGGABLE & ZOOMABLE INTERACTIVE STORM MAP
   * ------------------------------------------------------------------- */
  // Equirectangular projection helper: 1600x800
  const lonToX = lon => ((lon + 180) / 360) * 1600;
  const latToY = lat => ((90 - lat) / 180) * 800;

  const stormLocations = [
    {
      id: 'rancaekek',
      category: 'indonesia',
      categoryLabel: 'FENOMENA INDONESIA',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
      color: '#f43f5e',
      title: 'Tornado Rancaekek, Jawa Barat',
      coordsText: '6.96° S, 107.76° E • 21 Februari 2024',
      lat: -6.96,
      lon: 107.76,
      hemisphere: 'sh',
      radiusPx: 18,
      pressure: '~996 hPa',
      wind: '110–140 km/j',
      scale: 'EF1–EF2 Lokal',
      narrative: 'Detik-detik badai tornado pertama di Indonesia yang terekam jelas membentuk pusaran corong awan (funnel cloud) di kawasan Rancaekek, Bandung–Sumedang. Dipicu pertemuan massa udara lembab dan geser angin vertikal ekstrem.',
      impact: 'Merusak ratusan atap pabrik dan rumah warga, menumbangkan pepohonan besar, serta memutus jaringan kelistrikan dan akses jalan setempat.',
      track: [
        { lat: -7.02, lon: 107.68 },
        { lat: -6.96, lon: 107.76 },
        { lat: -6.91, lon: 107.83 }
      ]
    },
    {
      id: 'philippine-sea',
      category: 'active',
      categoryLabel: 'MONITORING TERKINI (AKTIF)',
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
      color: '#38bdf8',
      title: 'Siklon Tropis Aktif Laut Filipina / Pasifik Barat',
      coordsText: '15.2° N, 127.4° E • Status: Waspada Aktif',
      lat: 15.2,
      lon: 127.4,
      hemisphere: 'nh',
      radiusPx: 34,
      pressure: '964 hPa',
      wind: '175 km/jam',
      scale: 'Kategori 3 Aktif',
      narrative: 'Sistem siklon tropis aktif di perairan hangat Laut Filipina (SST 29.4°C). Gaya Coriolis pada lintang 15.2° N memutar dinding awan Cumulonimbus secara intens saat bergerak ke arah Barat Laut.',
      impact: 'Memicu gelombang laut tinggi 4–6 meter, hujan lebat berkelanjutan, serta peringatan dini angin kencang di wilayah pesisir Asia Timur & Filipina.',
      track: [
        { lat: 12.0, lon: 134.5 },
        { lat: 13.6, lon: 131.0 },
        { lat: 15.2, lon: 127.4 },
        { lat: 17.5, lon: 123.5 }
      ]
    },
    {
      id: 'south-java',
      category: 'active',
      categoryLabel: 'MONITORING TERKINI (BMKG)',
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
      color: '#06b6d4',
      title: 'Bibit Siklon Samudra Hindia Selatan Jawa',
      coordsText: '11.5° S, 110.8° E • Status: Pemantauan BMKG',
      lat: -11.5,
      lon: 110.8,
      hemisphere: 'sh',
      radiusPx: 28,
      pressure: '998 hPa',
      wind: '75 km/jam',
      scale: 'Bibit Siklon (91S)',
      narrative: 'Berada pada jarak > 1.250 km selatan khatulistiwa (> 500 km ambang batas), sehingga gaya Coriolis efektif memicu pusaran konvektif bertekanan rendah di Samudra Hindia selatan Yogyakarta–Jawa Timur.',
      impact: 'Meningkatkan potensi hujan lebat disertai petir, angin kencang, serta gelombang tinggi di perairan pesisir selatan Jawa hingga Bali.',
      track: [
        { lat: -10.2, lon: 114.2 },
        { lat: -11.5, lon: 110.8 },
        { lat: -13.0, lon: 107.5 }
      ]
    },
    {
      id: 'typhoon-tip',
      category: 'historic',
      categoryLabel: 'REKOR HISTORIS — BADAI TERBESAR',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
      color: '#f59e0b',
      title: 'Topan Tip (1979) — Pasifik Barat ke Jepang',
      coordsText: '16.7° N, 137.5° E • 12 Oktober 1979',
      lat: 16.7,
      lon: 137.5,
      hemisphere: 'nh',
      radiusPx: 54,
      pressure: '870 hPa (Rekor)',
      wind: '305 km/jam',
      scale: 'Diameter 2.220 km',
      narrative: 'Badai siklon tropis terbesar dan terdalam yang pernah tercatat dalam sejarah meteorologi modern. Memiliki diameter sirkulasi raksasa 2.220 km—hampir separuh luas daratan Amerika Serikat.',
      impact: 'Tekanan permukaan terendah 870 hPa dan angin berkelanjutan 305 km/jam memicu gelombang badai dahsyat dan banjir luas dari Samudra Pasifik Barat hingga daratan Jepang.',
      track: [
        { lat: 11.5, lon: 146.0 },
        { lat: 16.7, lon: 137.5 },
        { lat: 24.5, lon: 132.0 },
        { lat: 34.0, lon: 137.0 }
      ]
    },
    {
      id: 'bhola-cyclone',
      category: 'historic',
      categoryLabel: 'REKOR HISTORIS — PALING MEMATIKAN',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
      color: '#fb923c',
      title: 'Siklon Bhola (1970) — Teluk Benggala',
      coordsText: '22.3° N, 91.8° E • 12 November 1970',
      lat: 22.3,
      lon: 91.8,
      hemisphere: 'nh',
      radiusPx: 38,
      pressure: '966 hPa',
      wind: '185–240 km/j',
      scale: 'Kategori 3 / 4',
      narrative: 'Badai paling mematikan dalam sejarah tercatat yang menghantam Pakistan Timur (sekarang Bangladesh) dan Benggala Barat, India, pada 12 November 1970.',
      impact: 'Gelombang pasang badai (storm surge) setinggi hingga 10 meter menyapu dataran rendah delta Gangga, menewaskan diperkirakan 300.000 hingga 500.000 jiwa.',
      track: [
        { lat: 14.5, lon: 88.5 },
        { lat: 18.5, lon: 90.0 },
        { lat: 22.3, lon: 91.8 }
      ]
    },
    {
      id: 'atlantic-hurricane',
      category: 'active',
      categoryLabel: 'MONITORING TERKINI (AKTIF)',
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
      color: '#38bdf8',
      title: 'Badai Hurikan Atlantik Utara',
      coordsText: '24.8° N, 86.5° W • Status: Kategori 4 Aktif',
      lat: 24.8,
      lon: -86.5,
      hemisphere: 'nh',
      radiusPx: 36,
      pressure: '942 hPa',
      wind: '215 km/jam',
      scale: 'Hurikan Kat. 4',
      narrative: 'Sistem siklon tropis kuat di perairan hangat Teluk Meksiko / Atlantik Utara dengan struktur dinding mata badai (eyewall) simetris dan konveksi awan Cumulonimbus menjulang.',
      impact: 'Ancaman gelombang badai pesisir (coastal storm surge), kerusakan infrastruktur kelistrikan, serta curah hujan ekstrem di kawasan pesisir Teluk.',
      track: [
        { lat: 19.5, lon: -79.0 },
        { lat: 22.2, lon: -83.2 },
        { lat: 24.8, lon: -86.5 },
        { lat: 28.0, lon: -88.2 }
      ]
    }
  ];

  let activeFilter = 'all';
  let selectedStormId = 'rancaekek';

  // ---- OpenStreetMap (Leaflet) ----
  const mapZoomReadout = document.getElementById('map-zoom-readout');
  const radiusKmById = { 'rancaekek': 4, 'philippine-sea': 350, 'south-java': 250, 'typhoon-tip': 1110, 'bhola-cyclone': 300, 'atlantic-hurricane': 300 };
  const flyZoomById = { 'rancaekek': 9, 'typhoon-tip': 4 };
  window.__newsQueryById = {
    'rancaekek': { feed: 'id', q: 'Rancaekek puting beliung' },
    'south-java': { feed: 'id', q: 'bibit siklon Samudra Hindia' },
    'philippine-sea': { feed: 'world', q: 'typhoon Philippines' },
    'typhoon-tip': { feed: 'world', q: 'Typhoon Tip 1979' },
    'bhola-cyclone': { feed: 'world', q: 'Bhola cyclone 1970' },
    'atlantic-hurricane': { feed: 'world', q: 'hurricane Gulf of Mexico' }
  };

  const osmMap = L.map('osm-map', {
    zoomControl: false,
    worldCopyJump: true,
    minZoom: 2,
    maxZoom: 18,
    zoomSnap: 0.5
  }).setView([-6.96, 107.76], 6);
  window.osmMap = osmMap;

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
  }).addTo(osmMap);
  L.control.scale({ imperial: false, position: 'bottomright' }).addTo(osmMap);

  // Zona bebas Coriolis ±500 km (~4.5° LU–LS) + garis khatulistiwa
  L.rectangle([[-4.5, -540], [4.5, 540]], {
    color: '#f59e0b', weight: 1, dashArray: '5 5', fillColor: '#f59e0b', fillOpacity: 0.10, interactive: false
  }).addTo(osmMap);
  L.polyline([[0, -540], [0, 540]], { color: '#f59e0b', weight: 1.5, dashArray: '8 6', opacity: 0.8 })
    .bindTooltip('0° Khatulistiwa — gaya Coriolis ≈ 0 (zona ±500 km)', { sticky: true, className: 'equator-label' })
    .addTo(osmMap);

  const stormLayer = L.layerGroup().addTo(osmMap);
  let searchMarker = null;

  function updateZoomReadout() {
    mapZoomReadout.textContent = `ZOOM: ${osmMap.getZoom().toFixed(1)}`;
  }
  osmMap.on('zoom', updateZoomReadout);
  updateZoomReadout();

  function focusMapOnCoords(lat, lon, zoom = 5) {
    osmMap.flyTo([lat, lon], zoom, { duration: 1.1 });
  }

  document.getElementById('map-zoom-in').addEventListener('click', () => osmMap.zoomIn());
  document.getElementById('map-zoom-out').addEventListener('click', () => osmMap.zoomOut());
  document.getElementById('focus-indo-btn').addEventListener('click', () => focusMapOnCoords(-2.5, 118.0, 5));
  document.getElementById('map-reset-btn').addEventListener('click', () => focusMapOnCoords(10.0, 110.0, 3));

  // Tema tile gelap / terang
  const osmEl = document.getElementById('osm-map');
  const themeBtn = document.getElementById('map-theme-btn');
  themeBtn.addEventListener('click', () => {
    const dark = osmEl.classList.toggle('osm-dark');
    themeBtn.textContent = dark ? 'Peta: Gelap' : 'Peta: Terang';
  });

  // Pencarian lokasi via Nominatim (OpenStreetMap)
  const searchForm = document.getElementById('map-search-form');
  const searchInput = document.getElementById('map-search-input');
  const searchStatus = document.getElementById('map-search-status');
  searchForm.addEventListener('submit', async e => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (!q) return;
    searchStatus.textContent = 'Mencari…';
    try {
      const res = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=id&q=' + encodeURIComponent(q));
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!data.length) { searchStatus.textContent = 'Tidak ditemukan'; return; }
      const r = data[0];
      const lat = parseFloat(r.lat), lon = parseFloat(r.lon);
      if (searchMarker) osmMap.removeLayer(searchMarker);
      searchMarker = L.circleMarker([lat, lon], { radius: 8, color: '#ffffff', weight: 2, fillColor: '#38bdf8', fillOpacity: 0.9 }).addTo(osmMap);
      const pop = document.createElement('div');
      pop.textContent = r.display_name;
      searchMarker.bindPopup(pop).openPopup();
      if (r.boundingbox) {
        const [s, n, w, ea] = r.boundingbox.map(parseFloat);
        osmMap.flyToBounds([[s, w], [n, ea]], { maxZoom: 11, duration: 1.1 });
      } else {
        focusMapOnCoords(lat, lon, 10);
      }
      searchStatus.textContent = 'Ditemukan';
    } catch (err) {
      searchStatus.textContent = 'Gagal mencari (cek koneksi)';
    }
  });

  function stormIcon(storm, isSelected) {
    const s = isSelected ? 54 : 44;
    const spin = storm.hemisphere === 'nh' ? 'storm-spin-nh' : 'storm-spin-sh';
    const html = `<svg width="${s}" height="${s}" viewBox="-22 -22 44 44" style="overflow:visible">
      <circle class="storm-pulse" r="10" fill="none" stroke="${storm.color}" stroke-width="1.8"/>
      <g class="${spin}"><path d="M -10,0 A 10,10 0 0,1 10,0 M 0,-10 A 10,10 0 0,1 0,10" fill="none" stroke="${storm.color}" stroke-width="2" stroke-linecap="round"/></g>
      <circle r="${isSelected ? 5.5 : 4}" fill="#ffffff" stroke="${storm.color}" stroke-width="2.5"/>
    </svg>`;
    return L.divIcon({ className: 'storm-icon', html, iconSize: [s, s], iconAnchor: [s / 2, s / 2] });
  }

  const listContainer = document.getElementById('storm-list-container');

  function selectStorm(id, shouldFlyTo = true) {
    selectedStormId = id;
    const storm = stormLocations.find(s => s.id === id) || stormLocations[0];
    window.__selectedStorm = storm;

    const badge = document.getElementById('insp-category-badge');
    badge.textContent = storm.categoryLabel;
    badge.className = `inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border mb-1.5 ${storm.badgeClass}`;

    document.getElementById('insp-title').textContent = storm.title;
    document.getElementById('insp-coords').textContent = storm.coordsText;
    document.getElementById('insp-pressure').textContent = storm.pressure;
    document.getElementById('insp-wind').textContent = storm.wind;
    document.getElementById('insp-scale').textContent = storm.scale;
    document.getElementById('insp-narrative').textContent = storm.narrative;
    document.getElementById('insp-impact').textContent = storm.impact;

    renderMapElements();

    if (shouldFlyTo) {
      focusMapOnCoords(storm.lat, storm.lon, flyZoomById[storm.id] || 5);
    }
  }

  function renderMapElements() {
    const filtered = activeFilter === 'all'
      ? stormLocations
      : stormLocations.filter(s => s.category === activeFilter);

    stormLayer.clearLayers();
    listContainer.innerHTML = '';

    filtered.forEach(storm => {
      const isSelected = storm.id === selectedStormId;
      const pos = [storm.lat, storm.lon];

      // 1. Jalur lintasan
      if (storm.track && storm.track.length > 1) {
        L.polyline(storm.track.map(p => [p.lat, p.lon]), {
          color: storm.color, weight: isSelected ? 2.8 : 1.6, dashArray: '5 4', opacity: isSelected ? 0.95 : 0.5
        }).addTo(stormLayer);
      }

      // 2. Cincin medan angin (radius sebenarnya dalam meter)
      L.circle(pos, {
        radius: (radiusKmById[storm.id] || 100) * 1000,
        color: storm.color, weight: isSelected ? 1.8 : 1, dashArray: '3 3',
        fillColor: storm.color, fillOpacity: isSelected ? 0.18 : 0.09, interactive: false
      }).addTo(stormLayer);

      // 3. Marker animasi
      const marker = L.marker(pos, {
        icon: stormIcon(storm, isSelected),
        title: storm.title,
        zIndexOffset: isSelected ? 1000 : 0
      });
      marker.bindTooltip(storm.title.split('—')[0].trim(), {
        permanent: true, direction: 'right', offset: [12, -4],
        className: 'storm-label' + (isSelected ? ' is-selected' : '')
      });
      marker.on('click', () => selectStorm(storm.id, true));
      marker.addTo(stormLayer);

      // 4. Daftar di panel kanan
      const itemBtn = document.createElement('button');
      itemBtn.className = `w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
        isSelected
          ? 'bg-sky-500/15 border-sky-400/50 text-white'
          : 'bg-abyss-950/75 border-slate-800/90 text-slate-300 hover:border-slate-700'
      }`;
      itemBtn.innerHTML = `
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full shrink-0" style="background:${storm.color}"></span>
            <span class="text-xs font-bold truncate">${storm.title}</span>
          </div>
          <div class="font-mono text-[10px] text-slate-400 mt-0.5 pl-3.5">${storm.pressure} • ${storm.wind}</div>
        </div>
        <span class="font-mono text-[10px] text-sky-400 shrink-0">Fokus →</span>
      `;
      itemBtn.addEventListener('click', () => selectStorm(storm.id, true));
      listContainer.appendChild(itemBtn);
    });
  }

  // Filter Pills Listeners
  const mapFilterBtns = document.querySelectorAll('.map-filter-btn');
  mapFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      mapFilterBtns.forEach(b => {
        if (b === btn) {
          b.className = 'map-filter-btn px-3.5 py-2 rounded-full text-xs font-semibold bg-sky-500 text-abyss-950 transition';
        } else {
          b.className = 'map-filter-btn px-3.5 py-2 rounded-full text-xs font-semibold bg-abyss-900 border border-slate-800 text-slate-300 hover:border-sky-400/40 transition';
        }
      });
      const firstMatch = activeFilter === 'all'
        ? stormLocations[0]
        : stormLocations.find(s => s.category === activeFilter);
      if (firstMatch) {
        selectStorm(firstMatch.id, true);
      } else {
        renderMapElements();
      }
    });
  });
  selectStorm('rancaekek', true);

  window.addEventListener('resize', () => {
    if (window.osmMap) window.osmMap.invalidateSize();
  });
});
