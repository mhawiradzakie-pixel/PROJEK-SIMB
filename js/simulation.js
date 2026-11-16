// 4. Bab 02: mesin simulasi pembentukan badai
document.addEventListener('DOMContentLoaded', () => {
  /* -------------------------------------------------------------------
   * 4. CHAPTER 02: INTERACTIVE STORM FORMATION SIMULATION ENGINE
   * ------------------------------------------------------------------- */
  const simCanvas = document.getElementById('storm-sim-canvas');
  const simCtx = simCanvas.getContext('2d');
  let simW = 0, simH = 0;

  const simState = {
    sst: 31.2,
    humidity: 96,
    coriolisKm: 1250,
    viewMode: 'cross', // 'cross' | 'radar'
    isTornadoMode: false,
    wavePhase: 0,
    radarAngle: 0,
    spiralAngle: 0,
    simLightningAlpha: 0,
    simBolt: []
  };

  // Particles for Cross-Section & Radar modes
  const updraftArrows = Array.from({ length: 18 }, (_, i) => ({
    offset: (i / 18) * 2 - 1,
    progress: Math.random(),
    speed: 0.006 + Math.random() * 0.006
  }));
  const simRainDrops = Array.from({ length: 140 }, () => ({
    x: Math.random(),
    y: Math.random(),
    speed: 0.012 + Math.random() * 0.015
  }));
  const radarParticles = Array.from({ length: 220 }, () => ({
    angle: Math.random() * Math.PI * 2,
    radius: 0.08 + Math.random() * 0.88,
    size: 1.5 + Math.random() * 2.5,
    speed: 0.01 + Math.random() * 0.02
  }));
  const tornadoDebris = Array.from({ length: 65 }, () => ({
    angle: Math.random() * Math.PI * 2,
    yNorm: Math.random(),
    radiusOffset: 0.6 + Math.random() * 0.9
  }));

  // Optional Web Audio Synthesizer for Wind Telemetry
  let audioCtx = null;
  let windGain = null;
  let audioEnabled = false;
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioDot = document.getElementById('audio-dot');
  const audioLabel = document.getElementById('audio-label');

  function toggleWindAudio() {
    try {
      if (!audioEnabled) {
        if (!audioCtx) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          audioCtx = new AudioContextClass();
          const bufferSize = 2 * audioCtx.sampleRate;
          const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          let lastOut = 0.0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.04 * white)) / 1.04;
            lastOut = output[i];
            output[i] *= 2.5;
          }
          const whiteNoise = audioCtx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          whiteNoise.loop = true;

          const filter = audioCtx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 340;
          filter.Q.value = 1.4;

          windGain = audioCtx.createGain();
          windGain.gain.value = 0.04;

          whiteNoise.connect(filter);
          filter.connect(windGain);
          windGain.connect(audioCtx.destination);
          whiteNoise.start(0);
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
        audioEnabled = true;
        audioDot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-ping';
        audioLabel.textContent = 'Audio Angin: ON';
        updateTelemetryCalculations();
      } else {
        audioEnabled = false;
        if (windGain && audioCtx) {
          windGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.1);
        }
        audioDot.className = 'w-2 h-2 rounded-full bg-slate-500';
        audioLabel.textContent = 'Audio Angin: OFF';
      }
    } catch (err) {
      audioLabel.textContent = 'Audio Tidak Didukung';
    }
  }
  audioToggleBtn.addEventListener('click', toggleWindAudio);

  // Sliders & Presets DOM References
  const sliderSst = document.getElementById('slider-sst');
  const sliderHumidity = document.getElementById('slider-humidity');
  const sliderCoriolis = document.getElementById('slider-coriolis');

  function updateTelemetryCalculations() {
    const sst = simState.sst;
    const hum = simState.humidity;
    const cor = simState.coriolisKm;

    document.getElementById('val-sst').textContent = `${sst.toFixed(1)} °C`;
    document.getElementById('val-humidity').textContent = `${hum} %`;
    document.getElementById('val-coriolis').textContent = `${cor} km`;

    // Calculate realistic meteorological pressure & wind speed
    let pressure = 1013;
    let windKmh = 22;
    let statusLabel = 'CUACA CERAH / KONVEKSI RINGAN';
    let badgeStyle = 'bg-slate-700/50 text-slate-300 border-slate-600';
    let explanation = '';
    const hasWarmOcean = sst >= 26.5;
    const hasSpin = cor >= 500;
    const hasEye = !simState.isTornadoMode && hasWarmOcean && hum >= 82 && cor >= 850;

    if (simState.isTornadoMode) {
      pressure = 994;
      windKmh = 135;
      statusLabel = 'TORNADO LOKAL (MESOSIKLON)';
      badgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-400/40';
      explanation = 'Kasus Tornado Rancaekek (6.96° S): Meskipun berada dekat garis khatulistiwa (gaya Coriolis sinoptik lemah), ketidakstabilan konvektif lokal dan geser angin vertikal ekstrem membentuk kolom pusaran corong (funnel cloud) berkecepatan tinggi di daratan.';
    } else {
      const heatEnergy = Math.max(0, (sst - 25.0) * 14.5);
      const latentBoost = (hum / 100) * (sst >= 26.5 ? 55 : 18);
      const spinAmplifier = hasSpin ? Math.min(1.45, 0.75 + (cor - 500) / 1400) : 0.45;

      windKmh = Math.round(18 + (heatEnergy + latentBoost) * spinAmplifier);
      windKmh = Math.min(305, Math.max(15, windKmh));
      pressure = Math.round(1013 - (windKmh - 15) * 0.42);
      pressure = Math.max(870, pressure);

      if (!hasWarmOcean) {
        statusLabel = 'LAUT DINGIN (< 26.5°C)';
        badgeStyle = 'bg-slate-700/50 text-slate-300 border-slate-600';
        explanation = `Suhu permukaan laut (${sst.toFixed(1)}°C) masih di bawah ambang batas 26.5°C. Penguapan tidak cukup kuat untuk menumbuhkan awan badai Cumulonimbus raksasa.`;
      } else if (!hasSpin && hum < 70) {
        statusLabel = 'TAHAP 1: AIR LAUT HANGAT';
        badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-400/40';
        explanation = `Matahari memanaskan laut hingga ${sst.toFixed(1)}°C (> 26.5°C). Udara lembab mulai naik secara konvektif, namun kelembapan troposfer (${hum}%) belum jenuh untuk membentuk badai petir matang.`;
      } else if (!hasSpin && hum >= 70) {
        statusLabel = 'TAHAP 2: BADAI PETIR KONVEKTIF';
        badgeStyle = 'bg-sky-500/20 text-sky-300 border-sky-400/40';
        explanation = `Udara hangat naik hingga ketinggian 5 km dengan kelembapan ${hum}%, membentuk awan Cumulonimbus tebal, pelepasan panas laten, hujan lebat, dan petir. Karena jarak dari ekuator (${cor} km < 500 km), gaya Coriolis terlalu lemah untuk memutar sistem menjadi siklon.`;
      } else if (hasSpin && windKmh < 165) {
        statusLabel = 'TAHAP 3: SIKLON TROPIS BERPUTAR';
        badgeStyle = 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40';
        explanation = `Pada jarak ${cor} km dari khatulistiwa, gaya Coriolis membelokkan angin menuju pusat tekanan rendah (${pressure} hPa). Sistem mulai berputar spiral dengan hujan lebat dan angin kencang ${windKmh} km/jam.`;
      } else {
        statusLabel = 'TAHAP 4: HURIKAN / SUPER TOPAN';
        badgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-400/40';
        explanation = `Energi panas laut ${sst.toFixed(1)}°C, kelembapan ${hum}%, dan rotasi Coriolis (${cor} km) menciptakan siklon intens (${windKmh} km/jam, ${pressure} hPa). Di bagian tengah terbentuk MATA BADAI yang tenang dikelilingi dinding awan paling destruktif.`;
      }
    }

    document.getElementById('hud-pressure').textContent = `${pressure} hPa`;
    document.getElementById('hud-wind').textContent = `${windKmh} km/jam`;
    document.getElementById('out-pressure').textContent = `${pressure} hPa`;
    document.getElementById('out-wind').textContent = `${windKmh} km/jam`;
    document.getElementById('out-explanation').textContent = explanation;

    const statusBadge = document.getElementById('sim-status-badge');
    statusBadge.textContent = statusLabel;
    statusBadge.className = `px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${badgeStyle}`;

    document.getElementById('sim-coriolis-badge').textContent = simState.isTornadoMode
      ? 'MESOSIKLON LOKAL: RANCAEKEK (6.96° S)'
      : (hasSpin ? `CORIOLIS: AKTIF (${cor} KM DARI EKUATOR)` : `CORIOLIS: LEMAH (${cor} KM < 500 KM)`);

    const eyePill = document.getElementById('eye-wall-pill');
    if (hasEye) {
      eyePill.classList.remove('hidden');
    } else {
      eyePill.classList.add('hidden');
    }

    if (audioEnabled && windGain && audioCtx) {
      const targetGain = Math.min(0.22, 0.015 + (windKmh / 305) * 0.18);
      windGain.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.15);
    }
  }

  sliderSst.addEventListener('input', e => {
    simState.isTornadoMode = false;
    simState.sst = parseFloat(e.target.value);
    clearPresetHighlights();
    updateTelemetryCalculations();
  });
  sliderHumidity.addEventListener('input', e => {
    simState.isTornadoMode = false;
    simState.humidity = parseInt(e.target.value, 10);
    clearPresetHighlights();
    updateTelemetryCalculations();
  });
  sliderCoriolis.addEventListener('input', e => {
    simState.isTornadoMode = false;
    simState.coriolisKm = parseInt(e.target.value, 10);
    clearPresetHighlights();
    updateTelemetryCalculations();
  });

  // View Mode Toggle
  const viewCrossBtn = document.getElementById('view-cross-btn');
  const viewRadarBtn = document.getElementById('view-radar-btn');
  viewCrossBtn.addEventListener('click', () => {
    simState.viewMode = 'cross';
    viewCrossBtn.className = 'px-3.5 py-2 rounded-lg text-xs font-semibold bg-sky-500 text-abyss-950 shadow transition';
    viewRadarBtn.className = 'px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition';
    document.getElementById('sim-canvas-mode-title').textContent = 'MODE: PENAMPANG VERTIKAL ATMOSFER (CROSS-SECTION)';
  });
  viewRadarBtn.addEventListener('click', () => {
    simState.viewMode = 'radar';
    viewRadarBtn.className = 'px-3.5 py-2 rounded-lg text-xs font-semibold bg-sky-500 text-abyss-950 shadow transition';
    viewCrossBtn.className = 'px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition';
    document.getElementById('sim-canvas-mode-title').textContent = 'MODE: RADAR SATELIT DOPPLER (TOP-DOWN)';
  });

  // Stage Presets
  const presets = {
    stage1: { sst: 27.8, humidity: 54, coriolisKm: 200, tornado: false },
    stage2: { sst: 28.6, humidity: 86, coriolisKm: 300, tornado: false },
    stage3: { sst: 29.4, humidity: 88, coriolisKm: 750, tornado: false },
    stage4: { sst: 31.2, humidity: 96, coriolisKm: 1250, tornado: false },
    rancaekek: { sst: 28.2, humidity: 92, coriolisKm: 150, tornado: true }
  };

  const presetBtns = document.querySelectorAll('.preset-btn');
  function clearPresetHighlights() {
    presetBtns.forEach(b => {
      b.classList.remove('bg-sky-500/15', 'border-sky-400/60');
      b.classList.add('bg-abyss-900/90', 'border-slate-800');
    });
  }

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const p = presets[btn.dataset.preset];
      simState.sst = p.sst;
      simState.humidity = p.humidity;
      simState.coriolisKm = p.coriolisKm;
      simState.isTornadoMode = p.tornado;

      sliderSst.value = p.sst;
      sliderHumidity.value = p.humidity;
      sliderCoriolis.value = p.coriolisKm;

      clearPresetHighlights();
      btn.classList.remove('bg-abyss-900/90', 'border-slate-800');
      btn.classList.add('bg-sky-500/15', 'border-sky-400/60');

      updateTelemetryCalculations();
    });
  });

  function resizeSimCanvas() {
    const rect = simCanvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    simW = rect.width;
    simH = rect.height;
    simCanvas.width = simW * dpr;
    simCanvas.height = simH * dpr;
    simCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawCrossSectionSimulation() {
    const sst = simState.sst;
    const hum = simState.humidity;
    const cor = simState.coriolisKm;
    const warmFactor = Math.max(0, Math.min(1, (sst - 22) / 10));
    const isWarm = sst >= 26.5;
    const hasSpin = cor >= 500;
    const hasEye = !simState.isTornadoMode && isWarm && hum >= 82 && cor >= 850;

    // Sky gradient
    const skyGrad = simCtx.createLinearGradient(0, 0, 0, simH);
    skyGrad.addColorStop(0, '#040812');
    skyGrad.addColorStop(0.55, '#0b182e');
    skyGrad.addColorStop(1, '#102542');
    simCtx.fillStyle = skyGrad;
    simCtx.fillRect(0, 0, simW, simH);

    // Altitude markers (Troposphere 5 km)
    const tropoY = simH * 0.34;
    simCtx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
    simCtx.setLineDash([5, 5]);
    simCtx.beginPath();
    simCtx.moveTo(0, tropoY);
    simCtx.lineTo(simW, tropoY);
    simCtx.stroke();
    simCtx.setLineDash([]);
    simCtx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    simCtx.font = '10px "JetBrains Mono", monospace';
    simCtx.fillText('KETINGGIAN ~5 KM (TROPOSFER MENENGAH)', 14, tropoY - 6);

    const surfaceY = simH * 0.80;
    const cx = simW * 0.5;

    if (simState.isTornadoMode) {
      // LOCAL TORNADO (RANCAEKEK) CROSS SECTION
      // Ground terrain
      simCtx.fillStyle = '#0d1b2a';
      simCtx.fillRect(0, surfaceY, simW, simH - surfaceY);
      simCtx.strokeStyle = '#334155';
      simCtx.beginPath();
      simCtx.moveTo(0, surfaceY);
      simCtx.lineTo(simW, surfaceY);
      simCtx.stroke();

      // Dark Supercell Cloud Base
      const cloudY = simH * 0.25;
      for (let i = -4; i <= 4; i++) {
        const bx = cx + i * (simW * 0.09);
        const br = 55 + Math.abs(i % 2) * 22;
        const cGrad = simCtx.createRadialGradient(bx, cloudY, 10, bx, cloudY, br);
        cGrad.addColorStop(0, '#334155');
        cGrad.addColorStop(1, '#0f172a');
        simCtx.fillStyle = cGrad;
        simCtx.beginPath();
        simCtx.arc(bx, cloudY, br, 0, Math.PI * 2);
        simCtx.fill();
      }

      // Twisting Funnel Cloud from cloudY to surfaceY
      simState.spiralAngle += 0.12;
      const segments = 28;
      for (let s = 0; s < segments; s++) {
        const t = s / segments;
        const y = cloudY + t * (surfaceY - cloudY);
        const sway = Math.sin(t * 4 + simState.spiralAngle * 0.6) * (18 * t);
        const width = (1 - t * 0.84) * (simW * 0.16) + 10;
        simCtx.fillStyle = `rgba(148, 163, 184, ${0.22 + (1 - t) * 0.28})`;
        simCtx.beginPath();
        simCtx.ellipse(cx + sway, y, width, 12, 0, 0, Math.PI * 2);
        simCtx.fill();
      }

      // Swirling Debris Particles
      tornadoDebris.forEach(d => {
        d.angle += 0.14;
        const y = cloudY + d.yNorm * (surfaceY - cloudY);
        const funnelR = ((1 - d.yNorm * 0.84) * (simW * 0.16) + 14) * d.radiusOffset;
        const px = cx + Math.cos(d.angle) * funnelR;
        const py = y + Math.sin(d.angle) * 5;
        simCtx.fillStyle = d.yNorm > 0.75 ? '#fb923c' : '#cbd5e1';
        simCtx.fillRect(px, py, 3, 2);
      });

      simCtx.fillStyle = '#fda4af';
      simCtx.font = 'bold 11px "JetBrains Mono", monospace';
      simCtx.fillText('PUSARAN CORONG TORNADO (RANCAEKEK)', cx - 125, surfaceY + 24);
      return;
    }

    // OCEAN SURFACE & WAVES
    simState.wavePhase += 0.04 + warmFactor * 0.05;
    const waveAmp = 3 + warmFactor * 9 + (hasSpin ? 5 : 0);
    const oceanGrad = simCtx.createLinearGradient(0, surfaceY - 10, 0, simH);
    if (isWarm) {
      oceanGrad.addColorStop(0, 'rgba(245, 158, 11, 0.42)');
      oceanGrad.addColorStop(0.35, 'rgba(14, 116, 144, 0.72)');
      oceanGrad.addColorStop(1, '#041224');
    } else {
      oceanGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      oceanGrad.addColorStop(1, '#041224');
    }

    simCtx.fillStyle = oceanGrad;
    simCtx.beginPath();
    simCtx.moveTo(0, simH);
    for (let x = 0; x <= simW; x += 12) {
      const distFromCenter = Math.abs(x - cx) / (simW * 0.5);
      const surge = hasEye ? Math.exp(-Math.pow((distFromCenter - 0.18) * 5, 2)) * 14 : 0;
      const y = surfaceY + Math.sin(x * 0.025 + simState.wavePhase) * waveAmp - surge;
      simCtx.lineTo(x, y);
    }
    simCtx.lineTo(simW, simH);
    simCtx.closePath();
    simCtx.fill();

    // Ocean SST Label
    simCtx.fillStyle = isWarm ? '#fbbf24' : '#7dd3fc';
    simCtx.font = 'bold 11px "JetBrains Mono", monospace';
    simCtx.fillText(`SUHU PERMUKAAN LAUT: ${sst.toFixed(1)}°C ${isWarm ? '(> 26.5°C AKTIF)' : '(< 26.5°C)'}`, 16, simH - 14);

    // WARM HUMID AIR UPDRAFT ARROWS
    if (sst >= 24.5) {
      const arrowIntensity = Math.min(1, (sst - 24.5) / 5.5);
      updraftArrows.forEach(a => {
        a.progress += a.speed * (0.6 + arrowIntensity);
        if (a.progress > 1) a.progress = 0;

        // Leave center gap if Eye of Storm formed
        if (hasEye && Math.abs(a.offset) < 0.14) return;

        const spreadX = a.offset * (simW * 0.34);
        const y = surfaceY - a.progress * (surfaceY - tropoY + 25);
        const curveX = cx + spreadX * (1 - a.progress * 0.25) + Math.sin(a.progress * 6) * 8;
        const alpha = Math.sin(a.progress * Math.PI) * (0.35 + arrowIntensity * 0.55);

        simCtx.strokeStyle = isWarm ? `rgba(251, 146, 60, ${alpha})` : `rgba(56, 189, 248, ${alpha * 0.6})`;
        simCtx.lineWidth = 2;
        simCtx.beginPath();
        simCtx.moveTo(curveX, y + 14);
        simCtx.lineTo(curveX, y);
        simCtx.lineTo(curveX - 4, y + 5);
        simCtx.moveTo(curveX, y);
        simCtx.lineTo(curveX + 4, y + 5);
        simCtx.stroke();
      });
    }

    // RAIN STREAKS FROM CLOUDS
    if (hum >= 60 && isWarm) {
      const rainDensity = Math.floor(((hum - 55) / 45) * simRainDrops.length);
      simCtx.strokeStyle = 'rgba(125, 211, 252, 0.35)';
      simCtx.lineWidth = 1.1;
      for (let i = 0; i < rainDensity; i++) {
        const r = simRainDrops[i];
        r.y += r.speed;
        if (r.y > 1) r.y = 0;
        const rx = cx + (r.x - 0.5) * (simW * 0.72);
        if (hasEye && Math.abs(rx - cx) < 34) continue;
        const ry = tropoY + r.y * (surfaceY - tropoY);
        simCtx.beginPath();
        simCtx.moveTo(rx, ry);
        simCtx.lineTo(rx - 3, ry + 11);
        simCtx.stroke();
      }
    }

    // CUMULONIMBUS CLOUDS & EYE WALL
    const cloudCoverage = Math.max(0.25, (hum - 25) / 75);
    const numPuffs = Math.floor(6 + cloudCoverage * 12);
    const cloudSpan = simW * (0.28 + cloudCoverage * 0.44);

    for (let i = 0; i < numPuffs; i++) {
      const norm = (i / (numPuffs - 1)) * 2 - 1; // -1 to 1
      if (hasEye && Math.abs(norm) < 0.16) continue; // Clear Eye of the Storm!

      const px = cx + norm * (cloudSpan * 0.5);
      const py = tropoY - 12 - (1 - Math.abs(norm)) * (32 * cloudCoverage);
      const radius = 34 + cloudCoverage * 26;

      const cGrad = simCtx.createRadialGradient(px, py - 8, 6, px, py, radius);
      cGrad.addColorStop(0, 'rgba(226, 232, 240, 0.88)');
      cGrad.addColorStop(0.55, 'rgba(100, 116, 139, 0.75)');
      cGrad.addColorStop(1, 'rgba(30, 41, 59, 0.05)');
      simCtx.fillStyle = cGrad;
      simCtx.beginPath();
      simCtx.arc(px, py, radius, 0, Math.PI * 2);
      simCtx.fill();
    }

    // CORIOLIS ROTATION ELLIPSE AT MID-TROPOSPHERE
    if (hasSpin && isWarm) {
      simState.spiralAngle += 0.03 + (cor / 1500) * 0.04;
      const ringRx = cloudSpan * 0.48;
      const ringRy = 22;
      simCtx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
      simCtx.lineWidth = 2;
      simCtx.beginPath();
      simCtx.ellipse(cx, tropoY + 8, ringRx, ringRy, 0, 0.15 * Math.PI, 0.85 * Math.PI);
      simCtx.stroke();

      simCtx.beginPath();
      simCtx.ellipse(cx, tropoY + 8, ringRx, ringRy, 0, 1.15 * Math.PI, 1.85 * Math.PI);
      simCtx.stroke();

      simCtx.fillStyle = '#38bdf8';
      simCtx.font = 'bold 10px "JetBrains Mono", monospace';
      simCtx.fillText('ROTASI CORIOLIS', cx + ringRx - 65, tropoY - 4);
    }

    // EYE OF THE STORM CALLOUT
    if (hasEye) {
      simCtx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      simCtx.setLineDash([4, 4]);
      simCtx.beginPath();
      simCtx.moveTo(cx - 28, tropoY - 35);
      simCtx.lineTo(cx - 28, surfaceY);
      simCtx.moveTo(cx + 28, tropoY - 35);
      simCtx.lineTo(cx + 28, surfaceY);
      simCtx.stroke();
      simCtx.setLineDash([]);

      simCtx.fillStyle = '#e0f2fe';
      simCtx.font = 'bold 11px "JetBrains Mono", monospace';
      simCtx.textAlign = 'center';
      simCtx.fillText('MATA BADAI', cx, tropoY + 42);
      simCtx.font = '9px "JetBrains Mono", monospace';
      simCtx.fillStyle = '#7dd3fc';
      simCtx.fillText('(Tenang & Tekanan Rendah)', cx, tropoY + 55);
      simCtx.textAlign = 'left';
    }

    // LIGHTNING BOLTS WHEN HUMIDITY & SST HIGH
    if (isWarm && hum >= 78 && Math.random() < 0.035 && simState.simLightningAlpha <= 0.02) {
      simState.simLightningAlpha = 0.85;
      const side = Math.random() > 0.5 ? 1 : -1;
      let bx = cx + side * (45 + Math.random() * 85);
      let by = tropoY + 10;
      const pts = [{ x: bx, y: by }];
      while (by < surfaceY - 12) {
        by += 18;
        bx += (Math.random() - 0.5) * 26;
        pts.push({ x: bx, y: by });
      }
      simState.simBolt = pts;
    }
    if (simState.simLightningAlpha > 0.02 && simState.simBolt.length > 1) {
      simCtx.strokeStyle = `rgba(253, 224, 71, ${simState.simLightningAlpha})`;
      simCtx.lineWidth = 2.2;
      simCtx.beginPath();
      simCtx.moveTo(simState.simBolt[0].x, simState.simBolt[0].y);
      for (let i = 1; i < simState.simBolt.length; i++) {
        simCtx.lineTo(simState.simBolt[i].x, simState.simBolt[i].y);
      }
      simCtx.stroke();
      simState.simLightningAlpha *= 0.82;
    }
  }

  function drawRadarTopDownSimulation() {
    const sst = simState.sst;
    const hum = simState.humidity;
    const cor = simState.coriolisKm;
    const isWarm = sst >= 26.5;
    const hasSpin = cor >= 500 || simState.isTornadoMode;
    const hasEye = !simState.isTornadoMode && isWarm && hum >= 82 && cor >= 850;
    const cx = simW * 0.5;
    const cy = simH * 0.5;
    const maxR = Math.min(simW, simH) * 0.43;

    // Radar Dark Background
    simCtx.fillStyle = '#030811';
    simCtx.fillRect(0, 0, simW, simH);

    // Concentric Radar Range Rings
    for (let r = 1; r <= 4; r++) {
      simCtx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
      simCtx.lineWidth = 1;
      simCtx.beginPath();
      simCtx.arc(cx, cy, (maxR / 4) * r, 0, Math.PI * 2);
      simCtx.stroke();
    }
    // Crosshairs
    simCtx.beginPath();
    simCtx.moveTo(cx - maxR, cy);
    simCtx.lineTo(cx + maxR, cy);
    simCtx.moveTo(cx, cy - maxR);
    simCtx.lineTo(cx, cy + maxR);
    simCtx.stroke();

    // Sweeping Radar Beam
    simState.radarAngle += 0.03;
    simCtx.save();
    simCtx.translate(cx, cy);
    simCtx.rotate(simState.radarAngle);
    const sweepGrad = simCtx.createLinearGradient(0, 0, maxR, 0);
    sweepGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
    sweepGrad.addColorStop(1, 'rgba(56, 189, 248, 0.02)');
    simCtx.fillStyle = sweepGrad;
    simCtx.beginPath();
    simCtx.moveTo(0, 0);
    simCtx.arc(0, 0, maxR, -0.35, 0);
    simCtx.closePath();
    simCtx.fill();
    simCtx.restore();

    // Spiral Rainbands / Convective Cells
    const spinRate = simState.isTornadoMode ? 0.09 : (hasSpin ? 0.015 + (cor / 1500) * 0.035 : 0.002);
    simState.spiralAngle += spinRate;
    const activeCount = Math.floor(((hum - 20) / 80) * radarParticles.length);

    for (let i = 0; i < activeCount; i++) {
      const p = radarParticles[i];
      if (hasSpin) {
        p.angle += spinRate * (1.3 - p.radius * 0.6);
      } else {
        p.angle += (Math.random() - 0.5) * 0.02;
      }

      const minR = hasEye ? 0.14 : (simState.isTornadoMode ? 0.03 : 0.02);
      const normR = Math.max(minR, p.radius * (simState.isTornadoMode ? 0.45 : 0.95));
      const spiralTwist = hasSpin ? normR * 3.8 : 0;
      const theta = p.angle + spiralTwist;
      const dist = normR * maxR;
      const px = cx + Math.cos(theta) * dist;
      const py = cy + Math.sin(theta) * dist;

      // Color intensity based on SST & proximity to eyewall
      if (isWarm && normR < 0.35 && hum > 75) {
        simCtx.fillStyle = 'rgba(245, 158, 11, 0.72)'; // Intense eyewall convection
      } else if (isWarm && hum > 65) {
        simCtx.fillStyle = 'rgba(56, 189, 248, 0.65)';
      } else {
        simCtx.fillStyle = 'rgba(100, 116, 139, 0.45)';
      }

      simCtx.beginPath();
      simCtx.arc(px, py, p.size * (isWarm ? 1.35 : 0.9), 0, Math.PI * 2);
      simCtx.fill();
    }

    // Clear Calm Eye of the Storm in Radar Center
    if (hasEye) {
      simCtx.fillStyle = '#030811';
      simCtx.beginPath();
      simCtx.arc(cx, cy, maxR * 0.13, 0, Math.PI * 2);
      simCtx.fill();
      simCtx.strokeStyle = '#38bdf8';
      simCtx.lineWidth = 2;
      simCtx.stroke();

      simCtx.fillStyle = '#e0f2fe';
      simCtx.font = 'bold 10px "JetBrains Mono", monospace';
      simCtx.textAlign = 'center';
      simCtx.fillText('MATA BADAI', cx, cy + 3);
      simCtx.textAlign = 'left';
    }
  }

  function animateSimulation() {
    if (simState.viewMode === 'cross') {
      drawCrossSectionSimulation();
    } else {
      drawRadarTopDownSimulation();
    }
    requestAnimationFrame(animateSimulation);
  }
  resizeSimCanvas();
  updateTelemetryCalculations();
  animateSimulation();

  window.addEventListener('resize', resizeSimCanvas);
});
