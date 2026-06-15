/* =========================================================
   websites.js — TV + remote + info panel for Channels 1-3
   Channel 1 (Rose Bertrand) is drawn on canvas as a stylized
   parchment layout. Channels 2 (In-Motion Art) and 3 (Sandolore)
   render <video>/<img> elements behind the canvas; canvas only
   draws CRT scanlines + vignette on top.
   ========================================================= */
(function () {
  'use strict';

  const CHANNELS = [
    {
      n: '01',
      name: 'ROSE BERTRAND',
      tag: 'Works · visual portfolio',
      url: 'www.rosebertrand.com',
      href: 'https://www.rosebertrand.com',
      mediaKey: 'rose',
    },
    {
      n: '02',
      name: 'IN-MOTION ART',
      tag: 'Animated art experiment',
      url: 'laurerunser.github.io/in-motion-art',
      href: 'https://laurerunser.github.io/in-motion-art/',
      mediaKey: 'motion',
    },
    {
      n: '03',
      name: 'SANDOLORE',
      tag: 'Author site · Sandolore Sykes',
      url: 'laurerunser.github.io/author-website-sandolore',
      href: 'https://laurerunser.github.io/author-website-sandolore/',
      mediaKey: 'sandolore',
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
    const motionWrap = document.getElementById('tv-media-motion');
    const sandWrap = document.getElementById('tv-media-sandolore');
    const showMotion = state.channel === 1 && state.power && state.tvStatic <= 0;
    const showSandolore = state.channel === 2 && state.power && state.tvStatic <= 0;
    if (motionWrap) motionWrap.style.display = showMotion ? 'block' : 'none';
    if (sandWrap) sandWrap.style.display = showSandolore ? 'block' : 'none';

    // toggle media items by slide
    setSlideVisibility('motion', state.slide);
    setSlideVisibility('sandolore', state.slide);
  }

  function setText(id, txt) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  function setSlideVisibility(prefix, slide) {
    for (let i = 0; i < 3; i++) {
      const el = document.getElementById('tv-' + prefix + '-' + i);
      if (el) el.style.display = i === slide ? 'block' : 'none';
    }
  }

  // ----- TV canvas (CRT overlay always; Rose channel drawn here) -----
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

  function drawCRT(ctx, w, h, anim, t) {
    ctx.fillStyle = 'rgba(0,0,0,0.14)';
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    if (anim) {
      const ry = ((t * 0.13) % 1) * h;
      const g = ctx.createLinearGradient(0, ry - 26, 0, ry + 26);
      g.addColorStop(0, 'transparent');
      g.addColorStop(0.5, 'rgba(255,206,92,0.06)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, ry - 26, w, 52);
    }
    const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.78);
    v.addColorStop(0, 'transparent');
    v.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  }

  function drawRose(ctx, w, h, sl, t) {
    // parchment background
    ctx.fillStyle = '#ebe6c8';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(120,90,50,0.05)';
    for (let i = 0; i < 240; i++) ctx.fillRect((i * 73.1) % w, (i * 131.7) % h, 1, 1);

    // green decorative side bands
    const bandW = w * 0.045;
    ctx.fillStyle = '#3f5a3a';
    ctx.fillRect(0, 0, bandW, h);
    ctx.fillRect(w - bandW, 0, bandW, h);
    ctx.strokeStyle = '#ebe6c8';
    ctx.lineWidth = 0.8;
    if (ctx.setLineDash) ctx.setLineDash([3, 2.5]);
    ctx.beginPath();
    ctx.moveTo(bandW * 0.45, h * 0.04);
    ctx.lineTo(bandW * 0.45, h * 0.96);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w - bandW * 0.45, h * 0.04);
    ctx.lineTo(w - bandW * 0.45, h * 0.96);
    ctx.stroke();
    if (ctx.setLineDash) ctx.setLineDash([]);
    ctx.fillStyle = '#ebe6c8';
    ctx.beginPath();
    ctx.moveTo(bandW * 0.25, h * 0.20);
    ctx.lineTo(bandW * 0.50, h * 0.23);
    ctx.lineTo(bandW * 0.75, h * 0.20);
    ctx.lineTo(bandW * 0.75, h * 0.22);
    ctx.lineTo(bandW * 0.50, h * 0.25);
    ctx.lineTo(bandW * 0.25, h * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath(); ctx.arc(bandW * 0.5, h * 0.45, 2, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(bandW * 0.5, h * 0.70, 2, 0, 7); ctx.fill();
    [0.18, 0.32, 0.55, 0.72, 0.86].forEach((p, i) => {
      const r = 1.4 + (i % 2);
      ctx.beginPath(); ctx.arc(w - bandW * 0.5, h * p, r, 0, 7); ctx.fill();
    });

    const padL = bandW + w * 0.04;
    const padR = bandW + w * 0.04;
    const contentW = w - padL - padR;
    ctx.textBaseline = 'alphabetic';

    // green stamp
    const stampW = w * 0.095;
    const stampH = h * 0.13;
    const stampX = padL - 4;
    const stampY = h * 0.04;
    ctx.strokeStyle = '#3f5a3a';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(stampX, stampY, stampW, stampH);
    ctx.fillStyle = '#3f5a3a';
    ctx.font = '700 ' + w * 0.011 + "px 'IBM Plex Mono', monospace";
    ctx.fillText('NO. 2001', stampX + 4, stampY + h * 0.035);
    ctx.fillText('PARIS · FR', stampX + 4, stampY + h * 0.063);
    ctx.fillText('\u2605 AUTHOR', stampX + 4, stampY + h * 0.091);

    // title block
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '700 ' + w * 0.063 + "px Georgia, 'Times New Roman', serif";
    ctx.fillText('Rose Bertrand', stampX + stampW + 10, h * 0.13);
    ctx.fillStyle = '#2c2218';
    ctx.font = w * 0.020 + "px 'Courier New', monospace";
    ctx.fillText('Speculative fiction writer', stampX + stampW + 12, h * 0.20);
    ctx.fillStyle = '#5a4a32';
    ctx.font = w * 0.017 + "px 'Courier New', monospace";
    ctx.fillText('A few notes on me \u2014 and the work.', stampX + stampW + 12, h * 0.255);

    // small portrait silhouette
    const avX = w - bandW - w * 0.07;
    const avY = h * 0.14;
    const avR = h * 0.10;
    ctx.fillStyle = '#fffaeb';
    ctx.beginPath(); ctx.arc(avX, avY, avR, 0, 7); ctx.fill();
    ctx.strokeStyle = '#3a2e1f';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(avX, avY, avR, 0, 7); ctx.stroke();
    ctx.fillStyle = '#3f5a3a';
    ctx.beginPath(); ctx.arc(avX, avY - avR * 0.25, avR * 0.32, 0, 7); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(avX - avR * 0.55, avY + avR * 0.6);
    ctx.lineTo(avX + avR * 0.55, avY + avR * 0.6);
    ctx.lineTo(avX + avR * 0.40, avY - avR * 0.05);
    ctx.lineTo(avX - avR * 0.40, avY - avR * 0.05);
    ctx.closePath(); ctx.fill();

    const drawCard = (cx, cy, cw, ch, header, body) => {
      ctx.fillStyle = 'rgba(60,40,20,0.18)';
      ctx.fillRect(cx + 2, cy + 3, cw, ch);
      ctx.fillStyle = '#fdf6df';
      ctx.fillRect(cx, cy, cw, ch);
      ctx.strokeStyle = '#6a6052';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      const clipX = cx + 14;
      const clipY = cy - 2;
      ctx.moveTo(clipX, clipY + 8);
      ctx.lineTo(clipX, clipY - 6);
      ctx.arc(clipX + 4, clipY - 6, 4, Math.PI, 0, false);
      ctx.lineTo(clipX + 8, clipY + 4);
      ctx.stroke();
      ctx.fillStyle = '#2c5e3a';
      ctx.font = 'italic 700 ' + w * 0.022 + "px 'Courier New', monospace";
      ctx.fillText(header, cx + 12, cy + h * 0.055);
      ctx.fillStyle = '#3a2e1f';
      ctx.font = w * 0.014 + "px 'Courier New', monospace";
      body.forEach((ln, i) => {
        ctx.fillText(ln, cx + 12, cy + h * 0.10 + i * w * 0.020);
      });
    };

    if (sl === 0) {
      const cx = padL;
      const cy = h * 0.36;
      const cw = contentW * 0.66;
      const ch = h * 0.56;
      drawCard(cx, cy, cw, ch, 'Dear reader,', [
        'Welcome to my little corner of',
        'the internet! I\u2019m thrilled to',
        'have you here. This is my space',
        'where I share my thoughts and',
        'stories.',
        '',
        'Feel free to explore and enjoy!',
        'Try to touch all the little things,',
        'most of them move.',
        '',
        '                          \u2014 Rose',
      ]);
      ctx.fillStyle = '#1a1a1a';
      ctx.font = w * 0.018 + "px 'Courier New', monospace";
      ctx.fillText('[ about me ]', padL + cw + w * 0.04, cy + h * 0.06);
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const lblY = cy + h * 0.08;
      ctx.moveTo(padL + cw + w * 0.04, lblY);
      ctx.lineTo(padL + cw + w * 0.16, lblY);
      ctx.stroke();
      ctx.fillStyle = '#7ea05c';
      ctx.beginPath(); ctx.arc(padL + cw + w * 0.10, cy + h * 0.18, 5, 0, 7); ctx.fill();
    } else if (sl === 1) {
      const gp = w * 0.018;
      const cw = (contentW - 2 * gp) / 3;
      const cy = h * 0.36;
      const ch = h * 0.58;
      drawCard(padL, cy, cw, ch, 'Dear reader,', [
        'Welcome to my', 'little corner of', 'the internet!', '', 'Feel free to', 'explore and enjoy.', '', '          \u2014 Rose',
      ]);
      drawCard(padL + 1 * (cw + gp), cy, cw, ch, 'On writing \u2014', [
        'I love fiction and', 'I\u2019ve been an avid', 'reader since I was', 'a little girl.', '', 'I write speculative', 'fiction \u2014 identity,', 'technology, and the', 'human condition.',
      ]);
      drawCard(padL + 2 * (cw + gp), cy, cw, ch, 'On AI usage \u2014', [
        'I do not use AI in', 'my creative practice,', 'at all.', '', 'No research, plot,', 'writing, or editing', 'with AI.', '', 'Made with my little', 'hands and no AI.',
      ]);
    } else {
      const fY = h * 0.42;
      ctx.fillStyle = '#5a4a32';
      ctx.font = w * 0.018 + "px 'Courier New', monospace";
      ctx.fillText('FIND ME \u2014', padL, fY);
      ctx.strokeStyle = '#8a7a52';
      ctx.lineWidth = 1;
      if (ctx.setLineDash) ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(padL, fY + h * 0.05);
      ctx.lineTo(w - padR, fY + h * 0.05);
      ctx.stroke();
      if (ctx.setLineDash) ctx.setLineDash([]);
      const rows = [
        { name: 'Substack', handle: 'technofables' },
        { name: 'Instagram', handle: '@rose.technofables' },
        { name: 'Threads', handle: '@rose.technofables' },
      ];
      rows.forEach((r, i) => {
        const ry = fY + h * 0.13 + i * h * 0.10;
        ctx.fillStyle = '#b54a3a';
        ctx.font = w * 0.020 + "px 'Courier New', monospace";
        ctx.fillText('\u2731', padL, ry);
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '700 ' + w * 0.020 + "px 'Courier New', monospace";
        ctx.fillText(r.name, padL + w * 0.04, ry);
        ctx.fillStyle = '#3a2e1f';
        ctx.font = w * 0.018 + "px 'Courier New', monospace";
        ctx.fillText(r.handle, padL + w * 0.17, ry);
      });
      ctx.fillStyle = '#7a6850';
      ctx.font = w * 0.016 + "px 'Courier New', monospace";
      ctx.fillText('last updated June 2026 \u00b7 made with my little hands and no AI', padL, h * 0.93);
    }
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

      const ch = state.channel;
      const showMedia = (ch === 1 || ch === 2) && state.power && state.tvStatic <= 0;
      if (showMedia) {
        ctx.clearRect(0, 0, w, h);
      } else {
        ctx.fillStyle = '#0a0805';
        ctx.fillRect(0, 0, w, h);
      }

      if (!state.power) {
        ctx.fillStyle = '#050402';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(255,90,60,0.8)';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 2.5, 0, 7);
        ctx.fill();
        drawCRT(ctx, w, h, anim, state.t);
        if (anim) tvRaf = requestAnimationFrame(drawFrame);
        return;
      }

      if (state.tvStatic > 0) {
        state.tvStatic = Math.max(0, state.tvStatic - dt);
        drawStatic(ctx, w, h, state.t);
        if (state.tvStatic <= 0) render(); // hide static, reveal media
      } else if (ch === 0) {
        drawRose(ctx, w, h, state.slide, state.t);
      }

      drawCRT(ctx, w, h, anim, state.t);

      if (anim || state.tvStatic > 0) {
        tvRaf = requestAnimationFrame(drawFrame);
      }
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
    slideTimer = setInterval(() => {
      setSlide((state.slide + 1) % 3);
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
        setSlide((state.slide + step + 3) % 3);
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
