// 3. Latar canvas hero (angin, hujan, petir)
document.addEventListener('DOMContentLoaded', () => {
  /* -------------------------------------------------------------------
   * 3. HERO ATMOSPHERIC BACKGROUND CANVAS (WIND, RAIN & LIGHTNING)
   * ------------------------------------------------------------------- */
  const heroCanvas = document.getElementById('hero-storm-canvas');
  const heroCtx = heroCanvas.getContext('2d');
  let heroW = 0, heroH = 0;
  const heroRain = [];
  const heroWind = [];
  let lightningAlpha = 0;
  let lightningBolts = [];

  function resizeHeroCanvas() {
    const rect = heroCanvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    heroW = rect.width;
    heroH = rect.height;
    heroCanvas.width = heroW * dpr;
    heroCanvas.height = heroH * dpr;
    heroCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initHeroParticles() {
    heroRain.length = 0;
    heroWind.length = 0;
    const rainCount = Math.min(130, Math.floor(heroW / 10));
    for (let i = 0; i < rainCount; i++) {
      heroRain.push({
        x: Math.random() * heroW,
        y: Math.random() * heroH,
        len: 12 + Math.random() * 18,
        speedY: 11 + Math.random() * 8,
        speedX: -4.5 - Math.random() * 3,
        alpha: 0.12 + Math.random() * 0.25
      });
    }
    for (let i = 0; i < 36; i++) {
      heroWind.push({
        x: Math.random() * heroW,
        y: Math.random() * heroH,
        r: 40 + Math.random() * 110,
        speed: 1.5 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function triggerHeroLightning() {
    lightningAlpha = 0.22;
    const startX = heroW * (0.25 + Math.random() * 0.55);
    let cx = startX;
    let cy = 0;
    const pts = [{ x: cx, y: cy }];
    while (cy < heroH * 0.65) {
      cy += 24 + Math.random() * 32;
      cx += (Math.random() - 0.5) * 46;
      pts.push({ x: cx, y: cy });
    }
    lightningBolts = pts;
  }

  function animateHero() {
    heroCtx.clearRect(0, 0, heroW, heroH);

    // Subtle atmospheric vortex glow
    const grad = heroCtx.createRadialGradient(heroW * 0.72, heroH * 0.38, 20, heroW * 0.72, heroH * 0.38, heroW * 0.55);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.10)');
    grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.04)');
    grad.addColorStop(1, 'rgba(5, 10, 18, 0)');
    heroCtx.fillStyle = grad;
    heroCtx.fillRect(0, 0, heroW, heroH);

    // Wind stream arcs
    heroCtx.lineWidth = 1;
    heroWind.forEach(w => {
      w.x -= w.speed;
      w.phase += 0.02;
      if (w.x < -150) w.x = heroW + 150;
      heroCtx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
      heroCtx.beginPath();
      heroCtx.moveTo(w.x, w.y);
      heroCtx.quadraticCurveTo(w.x + w.r * 0.5, w.y + Math.sin(w.phase) * 16, w.x + w.r, w.y);
      heroCtx.stroke();
    });

    // Slanted rain streaks
    heroCtx.lineWidth = 1.1;
    heroRain.forEach(r => {
      r.x += r.speedX;
      r.y += r.speedY;
      if (r.y > heroH) {
        r.y = -20;
        r.x = Math.random() * (heroW + 200);
      }
      if (r.x < -50) r.x = heroW + 20;

      heroCtx.strokeStyle = `rgba(125, 211, 252, ${r.alpha})`;
      heroCtx.beginPath();
      heroCtx.moveTo(r.x, r.y);
      heroCtx.lineTo(r.x + r.speedX * 1.4, r.y + r.len);
      heroCtx.stroke();
    });

    // Occasional distant lightning flash
    if (Math.random() < 0.004 && lightningAlpha <= 0.01) {
      triggerHeroLightning();
    }
    if (lightningAlpha > 0.005) {
      heroCtx.fillStyle = `rgba(186, 230, 253, ${lightningAlpha})`;
      heroCtx.fillRect(0, 0, heroW, heroH);

      if (lightningBolts.length > 1) {
        heroCtx.strokeStyle = `rgba(224, 242, 254, ${Math.min(1, lightningAlpha * 4)})`;
        heroCtx.lineWidth = 2;
        heroCtx.beginPath();
        heroCtx.moveTo(lightningBolts[0].x, lightningBolts[0].y);
        for (let i = 1; i < lightningBolts.length; i++) {
          heroCtx.lineTo(lightningBolts[i].x, lightningBolts[i].y);
        }
        heroCtx.stroke();
      }
      lightningAlpha *= 0.86;
    }

    requestAnimationFrame(animateHero);
  }
  resizeHeroCanvas();
  initHeroParticles();
  animateHero();

  window.addEventListener('resize', resizeHeroCanvas);
});
