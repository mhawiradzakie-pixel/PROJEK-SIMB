// 2. Bab 01: penjelajah 4 faktor penyebab badai
document.addEventListener('DOMContentLoaded', () => {
  /* -------------------------------------------------------------------
   * 2. CHAPTER 01: INTERACTIVE 4-FACTOR CAUSE EXPLORER
   * ------------------------------------------------------------------- */
  const factorsData = [
    {
      badge: 'TERMODINAMIKA LAUT',
      metric: 'SST > 26.5°C',
      title: '1. Tingginya Suhu Permukaan Air Laut',
      desc: 'Penyebab terjadinya badai yang paling umum adalah tingginya suhu pada permukaan air laut (> 26.5°C). Kontras suhu permukaan yang hangat dengan lapisan air laut di bawahnya memicu penguapan masif dan udara lembab naik secara vertikal sebagai bahan bakar utama siklon.',
      formula: 'Q_latent = L_v · Δq (Panas Laten Laut)'
    },
    {
      badge: 'DINAMIKA ATMOSFER',
      metric: 'ANGIN HINGGA 250 KM/J',
      title: '2. Perubahan Atmosfer Bumi',
      desc: 'Peristiwa perubahan atmosfer merupakan lanjutan dari tingginya suhu permukaan air laut. Lapisan atmosfer melepaskan energi besar yang memicu kemunculan petir serta angin kencang destruktif berkecepatan hingga 250 km/jam.',
      formula: 'ΔP / Δx → Gradien Tekanan Ekstrem'
    },
    {
      badge: 'KONVEKSI TROPOSFER',
      metric: 'KETINGGIAN ~5 KM',
      title: '3. Kelembapan Udara Tinggi pada Troposfer',
      desc: 'Pada ketinggian menengah sekitar 5 km, atmosfer harus memiliki kelembapan tinggi agar awan konvektif tebal (Cumulonimbus) dapat tumbuh aktif, melepaskan panas kondensasi, dan menghasilkan hujan lebat.',
      formula: 'RH (5 km) > 80% → Awan Cumulonimbus'
    },
    {
      badge: 'ROTASI PLANET',
      metric: 'JARAK MINIMAL ~500 KM',
      title: '4. Gaya Coriolis (Rotasi Bumi)',
      desc: 'Pembentukan badai berputar memerlukan gaya Coriolis akibat rotasi Bumi untuk membelokkan angin menuju pusat tekanan rendah. Karena gaya Coriolis hampir nol di garis khatulistiwa, badai tropis baru terbentuk pada jarak minimal ~500 km dari ekuator.',
      formula: 'f = 2Ω · sin(φ) | φ ≥ 4.5° (~500 km)'
    }
  ];

  const factorTabs = document.querySelectorAll('.factor-tab');
  factorTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.factor);
      const item = factorsData[idx];

      factorTabs.forEach((b, i) => {
        if (i === idx) {
          b.className = 'factor-tab text-left p-3 rounded-xl border border-sky-400/50 bg-sky-500/15 transition';
          b.querySelector('div:first-child').className = 'font-mono text-[10px] text-sky-300';
          b.querySelector('div:last-child').className = 'text-xs sm:text-sm font-bold text-white mt-0.5';
        } else {
          b.className = 'factor-tab text-left p-3 rounded-xl border border-slate-800 bg-abyss-950/60 hover:border-slate-700 transition';
          b.querySelector('div:first-child').className = 'font-mono text-[10px] text-slate-400';
          b.querySelector('div:last-child').className = 'text-xs sm:text-sm font-bold text-slate-200 mt-0.5';
        }
      });

      document.getElementById('factor-counter').textContent = `0${idx + 1} / 04`;
      document.getElementById('factor-badge').textContent = item.badge;
      document.getElementById('factor-metric').textContent = item.metric;
      document.getElementById('factor-title').textContent = item.title;
      document.getElementById('factor-desc').textContent = item.desc;
      document.getElementById('factor-formula').textContent = item.formula;
    });
  });
});
