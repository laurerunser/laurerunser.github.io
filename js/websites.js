/* =========================================================
   websites.js — TV + remote + info panel for Channels 1-3
   Each channel renders a <video>/<img> screenshot of the site
   behind the canvas. The canvas only paints the power-off state
   and the channel/slide "static" flash on top.
   ========================================================= */
(function () {
  'use strict';

  const CHANNELS = [
    {
      n: '01',
      name: 'ROSE BERTRAND',
      tag: 'Speculative author · portfolio',
      url: 'www.rosebertrand.com',
      href: 'https://www.rosebertrand.com',
      mediaKey: 'rose',
      slides: 4,
    },
    {
      n: '02',
      name: 'IN-MOTION ART',
      tag: 'Animated art experiment',
      url: 'laurerunser.github.io/in-motion-art',
      href: 'https://laurerunser.github.io/in-motion-art/',
      mediaKey: 'motion',
      slides: 3,
    },
    {
      n: '03',
      name: 'SANDOLORE',
      tag: 'Author site · Sandolore Sykes',
      url: 'laurerunser.github.io/author-website-sandolore',
      href: 'https://laurerunser.github.io/author-website-sandolore/',
      mediaKey: 'sandolore',
      slides: 4,
    },
  ];

  const SLIDE_INTERVAL_MS = 3200;
  const FLASH_CHANNEL_S = 0.42;
  const FLASH_SLIDE_S = 0.22;

  // ----- state -----
  const state = {
    channel: 0,
    slide: 0,
    power: true,
    tvStatic: 0,
    t: 0,
  };
  let slideTimer = null;
  let bgRaf = null;
  let tvRaf = null;
  let resizeDispose = null;

  // ----- dom updaters -----
  function render() {
    const ch = CHANNELS[state.channel];
    document.documentElement.setAttribute('data-power', state.power ? '1' : '0');
    document.documentElement.setAttribute('data-channel', String(state.channel));
    document.documentElement.setAttribute('data-slide', String(state.slide));

    // TV chip + remote LCD
    const chip = document.getElementById('tv-chip');
    if (chip) chip.textContent = 'CH ' + ch.n;
    const lcd = document.getElementById('remote-lcd-value');
    if (lcd) lcd.textContent = ch.n;

    // info panel
    setText('info-ch', 'CHANNEL ' + ch.n);
    setText('info-name', ch.name);
    setText('info-tag', ch.tag);
    const link = document.getElementById('info-link');
    if (link) {
      link.href = ch.href;
      link.querySelector('.info-link-url').textContent = ch.url;
    }

    // media wrappers
    const roseWrap = document.getElementById('tv-media-rose');
    const motionWrap = document.getElementById('tv-media-motion');
    const sandWrap = document.getElementById('tv-media-sandolore');
    const live = state.power && state.tvStatic <= 0;
    if (roseWrap) roseWrap.style.display = state.channel === 0 && live ? 'block' : 'none';
    if (motionWrap) motionWrap.style.display = state.channel === 1 && live ? 'block' : 'none';
    if (sandWrap) sandWrap.style.display = state.channel === 2 && live ? 'block' : 'none';

    // toggle media items by slide (single-media channels stay on slide 0)
    setSlideVisibility('rose', state.slide);
    setSlideVisibility('motion', state.slide);
    setSlideVisibility('sandolore', state.slide);
  }

  function setText(id, txt) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  function setSlideVisibility(prefix, slide) {
    let i = 0;
    let el;
    while ((el = document.getElementById('tv-' + prefix + '-' + i))) {
      el.style.display = i === slide ? 'block' : 'none';
      i++;
    }
  }

  // ----- TV canvas (power-off state + channel/slide static flash) -----
  function setupTV() {
    const cvs = document.getElementById('tv-canvas');
    if (!cvs) return null;
    return window.Laure.setupCanvas(cvs);
  }

  function drawStatic(ctx, w, h, t) {
    for (let k = 0; k < 900; k++) {
      ctx.fillStyle = 'rgba(255,200,120,' + Math.random() * 0.45 + ')';
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    const by = (t * 280) % h;
    ctx.fillStyle = 'rgba(255,176,0,0.1)';
    ctx.fillRect(0, by, w, 14);
  }

  function startTV() {
    const setup = setupTV();
    if (!setup) return;
    const { ctx, w, h } = setup;
    const anim = window.Laure.isAnim();
    let last = performance.now();

    const drawFrame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      state.t += dt;

      if (!state.power) {
        ctx.fillStyle = '#050402';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(255,90,60,0.8)';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 2.5, 0, 7);
        ctx.fill();
        if (anim) tvRaf = requestAnimationFrame(drawFrame);
        else tvRaf = null;
        return;
      }

      if (state.tvStatic > 0) {
        // channel/slide change flash — keep looping until it clears
        state.tvStatic = Math.max(0, state.tvStatic - dt);
        ctx.fillStyle = '#0a0805';
        ctx.fillRect(0, 0, w, h);
        drawStatic(ctx, w, h, state.t);
        if (state.tvStatic <= 0) render(); // reveal media on next frame
        tvRaf = requestAnimationFrame(drawFrame);
        return;
      }

      // live: clear the canvas so the screenshot shows through, no filter
      ctx.clearRect(0, 0, w, h);
      if (anim) tvRaf = requestAnimationFrame(drawFrame);
      else tvRaf = null;
    };

    tvRaf = requestAnimationFrame(drawFrame);
  }

  // ----- ambient background canvas (behind TV) -----
  function startBg() {
    const cvs = document.getElementById('bg-canvas');
    if (!cvs) return;
    const { ctx, w, h } = window.Laure.setupCanvas(cvs);

    const drawStaticBg = () => {
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w / 2, h * 0.45, 40, w / 2, h * 0.45, Math.max(w, h) * 0.6);
      g.addColorStop(0, 'rgba(255,176,0,0.05)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(255,138,0,0.16)';
      ctx.lineWidth = 1.2;
      [0.16, 0.86].forEach((fy) => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          const y = h * fy + Math.sin(x * 0.012) * 16;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
    };

    if (!window.Laure.isAnim()) {
      drawStaticBg();
      return;
    }

    const stars = Array.from({ length: 70 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random(),
      s: 0.3 + Math.random(),
    }));
    let last = performance.now();
    let t = 0;
    const draw = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      t += dt;
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w / 2, h * 0.45, 40, w / 2, h * 0.45, Math.max(w, h) * 0.6);
      g.addColorStop(0, 'rgba(255,176,0,0.05)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (let r = 0; r < 3; r++) {
        const rad = ((t * 40 + r * 130) % 400) + 60;
        ctx.strokeStyle = 'rgba(255,176,0,' + 0.10 * (1 - rad / 460) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.45, rad, 0, 7);
        ctx.stroke();
      }
      stars.forEach((s) => {
        s.y -= s.s * 12 * dt;
        if (s.y < 0) { s.y = h; s.x = Math.random() * w; }
        ctx.fillStyle = 'rgba(255,206,92,' + (0.2 + s.z * 0.5) + ')';
        ctx.fillRect(s.x, s.y, s.z * 1.8 + 0.4, s.z * 1.8 + 0.4);
      });
      ctx.strokeStyle = 'rgba(255,138,0,0.18)';
      ctx.lineWidth = 1.2;
      [0.16, 0.86].forEach((fy, idx) => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          const y = h * fy + Math.sin(x * 0.012 + t * (idx ? -1.4 : 1.4)) * 16;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      bgRaf = requestAnimationFrame(draw);
    };
    bgRaf = requestAnimationFrame(draw);
  }

  // ----- controls -----
  function setChannel(n) {
    if (n === state.channel) return;
    state.channel = n;
    state.slide = 0;
    state.tvStatic = FLASH_CHANNEL_S;
    if (!tvRaf) startTV();
    render();
    restartSlideTimer();
  }
  function setSlide(n) {
    if (n === state.slide) return;
    state.slide = n;
    state.tvStatic = FLASH_SLIDE_S;
    if (!tvRaf) startTV();
    render();
  }
  function togglePower() {
    state.power = !state.power;
    if (state.power && !tvRaf) startTV();
    render();
    if (state.power) restartSlideTimer();
    else stopSlideTimer();
  }
  function restartSlideTimer() {
    stopSlideTimer();
    if (!window.Laure.isAnim() || !state.power) return;
    const count = CHANNELS[state.channel].slides;
    if (count <= 1) return; // single-media channels don't cycle
    slideTimer = setInterval(() => {
      setSlide((state.slide + 1) % count);
    }, SLIDE_INTERVAL_MS);
  }
  function stopSlideTimer() {
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = null;
  }

  function wireControls() {
    document.querySelectorAll('[data-ch]').forEach((btn) => {
      btn.addEventListener('click', () => setChannel(Number(btn.getAttribute('data-ch'))));
    });
    document.querySelectorAll('[data-slide-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const step = Number(btn.getAttribute('data-slide-step'));
        const count = CHANNELS[state.channel].slides;
        setSlide((state.slide + step + count) % count);
        restartSlideTimer(); // manual nav resets the auto-cycle so the choice sticks
      });
    });
    document.querySelectorAll('[data-power-btn]').forEach((btn) => {
      btn.addEventListener('click', togglePower);
    });
  }

  function fullRestart() {
    stopSlideTimer();
    if (tvRaf) cancelAnimationFrame(tvRaf);
    if (bgRaf) cancelAnimationFrame(bgRaf);
    tvRaf = null;
    bgRaf = null;
    startBg();
    startTV();
    render();
    restartSlideTimer();
  }

  function start() {
    wireControls();
    fullRestart();
    if (resizeDispose) resizeDispose();
    resizeDispose = window.Laure.onResize(fullRestart);
    window.Laure.onAnimChange(fullRestart);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
