// 7. Bab 06: tab fase mitigasi & checklist tas siaga
document.addEventListener('DOMContentLoaded', () => {
  /* -------------------------------------------------------------------
   * 7. CHAPTER 05: 3-PHASE MITIGATION TABS & EMERGENCY BAG SIMULATOR
   * ------------------------------------------------------------------- */
  const phasesData = {
    pra: {
      subtitle: 'FASE PERSIAPAN & PENCEGAHAN',
      title: '1. Pra-Bencana (Sebelum Badai Terjadi)',
      code: 'SIAGA 01',
      codeClass: 'bg-sky-500/15 border-sky-400/30 text-sky-300',
      steps: [
        {
          title: 'Amankan Struktur Rumah',
          detail: 'Periksa dan perkuat atap rumah yang longgar serta pangkas dahan pohon yang tua atau terlalu dekat dengan bangunan agar tidak tumbang menimpa atap maupun kabel listrik.'
        },
        {
          title: 'Simpan Barang Luar Ruangan',
          detail: 'Pindahkan pot tanaman, jemuran, papan reklame ringan, atau furnitur teras ke dalam ruangan tertutup agar tidak terbang terbawa angin kencang.'
        },
        {
          title: 'Siapkan Tas Siaga Bencana',
          detail: 'Isi tas darurat dengan air bersih, makanan siap saji, kotak P3K, senter, baterai cadangan, radio portabel, pakaian ganti, dokumen penting, dan uang tunai.'
        },
        {
          title: 'Pantau Informasi Weather Alert',
          detail: 'Ikuti perkembangan peringatan dini cuaca ekstrem secara berkala melalui kanal resmi BMKG atau otoritas pemerintah setempat.'
        }
      ]
    },
    saat: {
      subtitle: 'FASE PENYELAMATAN DARURAT',
      title: '2. Saat Bencana (Ketika Badai Berlangsung)',
      code: 'AWAS 02',
      codeClass: 'bg-rose-500/20 border-rose-400/40 text-rose-300',
      steps: [
        {
          title: 'Tetap di Dalam Ruangan',
          detail: 'Tutup dan kunci rapat semua pintu serta jendela. Menjauhlah dari kaca atau area tembus pandang yang berisiko pecah terkena terpaan angin maupun puing.'
        },
        {
          title: 'Cari Tempat Berlindung Teraman',
          detail: 'Berlindunglah di ruangan paling dalam atau bagian tengah rumah/bangunan di lantai bawah yang tidak memiliki jendela kaca.'
        },
        {
          title: 'Matikan Listrik dan Gas',
          detail: 'Putus aliran listrik utama (MCB) dan tutup katup/sakelar gas untuk mencegah risiko kebakaran atau korsleting arus pendek.'
        },
        {
          title: 'Jika Terjebak di Luar Ruangan',
          detail: 'Segera cari bangunan permanen yang kokoh. Jika tidak memungkinkan, merunduklah di area rendah atau cekungan tanah sambil melindungi kepala dengan kedua tangan; hindari pohon tinggi dan tiang listrik.'
        }
      ]
    },
    pasca: {
      subtitle: 'FASE PEMULIHAN & KEWASPADAAN',
      title: '3. Pasca-Bencana (Setelah Badai Mereda)',
      code: 'PULIH 03',
      codeClass: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300',
      steps: [
        {
          title: 'Waspadai Bahaya Lanjutan',
          detail: 'Periksa area sekitar dari tiang listrik roboh, kabel terputus, atau puing-puing tajam. Jangan pernah menyentuh atau melintasi kabel listrik yang tergenang air.'
        },
        {
          title: 'Periksa Kerusakan Bangunan',
          detail: 'Pastikan struktur atap dan dinding rumah masih kokoh sebelum masuk kembali. Waspadai potensi kebocoran tabung/pipa gas sebelum menyalakan api atau sakelar listrik.'
        },
        {
          title: 'Gunakan Air Bersih & Higienis',
          detail: 'Pastikan sumber air minum tidak terkontaminasi material banjir, lumpur, atau kotoran akibat badai untuk mencegah penyakit pasca-bencana.'
        }
      ]
    }
  };

  function renderPhaseContent(key) {
    const p = phasesData[key];
    document.getElementById('phase-subtitle').textContent = p.subtitle;
    document.getElementById('phase-title').textContent = p.title;
    const codeEl = document.getElementById('phase-code');
    codeEl.textContent = p.code;
    codeEl.className = `px-3 py-1 rounded-lg border font-mono text-xs ${p.codeClass}`;

    const listEl = document.getElementById('phase-steps-list');
    listEl.innerHTML = p.steps.map((s, idx) => `
      <div class="rounded-xl bg-abyss-950/85 border border-slate-800/90 p-4 flex items-start gap-3.5">
        <span class="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-400/30 text-sky-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">0${idx + 1}</span>
        <div>
          <h4 class="text-sm font-bold text-white">${s.title}</h4>
          <p class="text-xs text-slate-300 leading-relaxed mt-1">${s.detail}</p>
        </div>
      </div>
    `).join('');
  }

  const phaseTabBtns = document.querySelectorAll('.phase-tab-btn');
  phaseTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      phaseTabBtns.forEach(b => {
        b.className = b === btn
          ? 'phase-tab-btn py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold bg-sky-500 text-abyss-950 transition'
          : 'phase-tab-btn py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition';
      });
      renderPhaseContent(btn.dataset.phase);
    });
  });
  renderPhaseContent('pra');

  // Emergency Bag Checklist Simulator
  const bagChecklistData = [
    { id: 'water', name: 'Air Bersih Minum (Stok min. 3 hari)', tag: 'LOGISTIK' },
    { id: 'food', name: 'Makanan Siap Saji / Tahan Lama', tag: 'LOGISTIK' },
    { id: 'firstaid', name: 'Kotak P3K & Obat-obatan Pribadi', tag: 'MEDIS' },
    { id: 'flashlight', name: 'Senter LED & Baterai Cadangan', tag: 'PENERANGAN' },
    { id: 'radio', name: 'Radio Portabel Pemantau Cuaca', tag: 'INFORMASI' },
    { id: 'docs', name: 'Dokumen Penting (Tahan Air) & Uang Tunai', tag: 'IDENTITAS' },
    { id: 'clothes', name: 'Pakaian Ganti & Selimut Darurat', tag: 'PERLINDUNGAN' }
  ];
  const packedSet = new Set(['water', 'flashlight', 'docs']); // Pre-check 3 essential items as helpful starter

  function renderEmergencyBag() {
    const container = document.getElementById('emergency-bag-items');
    container.innerHTML = bagChecklistData.map(item => {
      const isChecked = packedSet.has(item.id);
      return `
        <button data-bag-id="${item.id}" class="bag-item-btn w-full text-left px-3.5 py-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
          isChecked
            ? 'bg-emerald-500/15 border-emerald-400/45 text-white'
            : 'bg-abyss-950/75 border-slate-800 text-slate-300 hover:border-slate-700'
        }">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
              isChecked ? 'bg-emerald-400 text-abyss-950' : 'border border-slate-600 text-transparent'
            }">✓</span>
            <span class="text-xs font-medium truncate">${item.name}</span>
          </div>
          <span class="font-mono text-[9px] px-2 py-0.5 rounded bg-abyss-900 text-slate-400 shrink-0">${item.tag}</span>
        </button>
      `;
    }).join('');

    const pct = Math.round((packedSet.size / bagChecklistData.length) * 100);
    document.getElementById('bag-percent-badge').textContent = `${pct}%`;
    document.getElementById('bag-progress-bar').style.width = `${pct}%`;
    document.getElementById('bag-count-text').textContent = `${packedSet.size} / ${bagChecklistData.length} Item`;
    document.getElementById('bag-status-text').textContent = pct === 100
      ? 'Tas Siaga Bencana 100% Siap Evakuasi!'
      : (pct >= 50 ? 'Kesiapan baik, lengkapi sisa item darurat' : 'Klik item untuk memasukkan ke Tas Siaga');

    document.querySelectorAll('.bag-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.bagId;
        if (packedSet.has(id)) packedSet.delete(id);
        else packedSet.add(id);
        renderEmergencyBag();
      });
    });
  }

  document.getElementById('bag-reset-btn').addEventListener('click', () => {
    packedSet.clear();
    renderEmergencyBag();
  });
  document.getElementById('bag-pack-all-btn').addEventListener('click', () => {
    bagChecklistData.forEach(i => packedSet.add(i.id));
    renderEmergencyBag();
  });
  renderEmergencyBag();
});
