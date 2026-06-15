/* =========================================================
   home.js — oscilloscope background + boot log typing
   ========================================================= */
(function () {
  'use strict';

  const BOOT_LINES = [
    '> initializing laure.sys .......... ok',
    '> name .......... laure runser',
    '> role .......... software engineer',
    '> currently ..... building security products @ datadog',
    '> first_love .... ocaml   // french university, naturellement',
    '> fluent_in ..... go · java',
    '> off_the_clock . sci-fi novels · cinema · scottish country dance',
    '> status ........ online_',
  ];

  // line index 6 — replace text with a linked version of "scottish country dance"
  function linkifyScottish(div) {
    div.innerHTML =
      '&gt; off_the_clock . sci-fi novels · cinema · ' +
      '<a href="https://www.rscdsparis.fr/home/" target="_blank" rel="noopener">' +
      'scottish country dance \u2197</a>';
  }

  let timers = [];
  function clearTimers() {
    timers.forEach((t) => clearTimeout(t));
    timers = [];
  }

  function fillBootInstant() {
    const el = document.getElementById('boot-log');
    if (!el) return;
    el.innerHTML = '';
    BOOT_LINES.forEach((line, i) => {
      const div = document.createElement('div');
      const last = i === BOOT_LINES.length - 1;
      div.className = 'boot__line' + (last ? ' boot__line--accent' : '');
      div.textContent = line;
      if (line.includes('scottish country dance')) linkifyScottish(div);
      if (last) {
        const c = document.createElement('span');
        c.className = 'boot__cursor';
        c.textContent = '\u2588';
        div.appendChild(c);
      }
      el.appendChild(div);
    });
  }

  function typeBootLog() {
    const el = document.getElementById('boot-log');
    if (!el) return;
    el.innerHTML = '';
    let i = 0;
    const addLine = () => {
      if (i >= BOOT_LINES.length) return;
      const full = BOOT_LINES[i];
      const last = i === BOOT_LINES.length - 1;
      const div = document.createElement('div');
      div.className = 'boot__line' + (last ? ' boot__line--accent' : '');
      el.appendChild(div);
      let j = 0;
      const type = () => {
        div.textContent = full.slice(0, j);
        if (j === full.length) {
          if (last) {
            const c = document.createElement('span');
            c.className = 'boot__cursor';
            c.textContent = '\u2588';
            div.appendChild(c);
          } else if (full.includes('scottish country dance')) {
            linkifyScottish(div);
          }
        }
        j++;
        if (j <= full.length) {
          timers.push(setTimeout(type, 7 + Math.random() * 14));
        } else {
          i++;
          timers.push(setTimeout(addLine, 110));
        }
      };
      type();
    };
    timers.push(setTimeout(addLine, 280));
  }

  // ---------- oscilloscope canvas ----------
  let rafId = null;
  let resizeDispose = null;

  function initScope() {
    const cvs = document.getElementById('bg-canvas');
    if (!cvs) return;
    const { ctx, w, h } = window.Laure.setupCanvas(cvs);
    const AMBER = '#ffb000';
    const textEdge = 0.58;
    const k = (x) => {
      const u = Math.max(0, Math.min(1, x / w / 1 - textEdge / 1));
      const v = Math.max(0, Math.min(1, (x / w - textEdge) / (1 - textEdge)));
      return v * v * (3 - 2 * v);
    };
    const baselineAtX = (x) => h * (0.84 - 0.34 * k(x));
    const ampAtX = (x) => h * (0.04 + 0.22 * k(x));
    const topY = h * 0.13;

    const drawGrid = () => {
      ctx.fillStyle = '#080603';
      ctx.fillRect(0, 0, w, h);
      const stepX = w / 22;
      const stepY = h / 12;
      ctx.strokeStyle = 'rgba(255,176,0,0.07)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= w + 1; x += stepX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h + 1; y += stepY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255,176,0,0.10)';
      ctx.beginPath();
      ctx.moveTo(0, topY);
      ctx.lineTo(w, topY);
      ctx.stroke();
    };

    if (!window.Laure.isAnim()) {
      drawGrid();
      ctx.shadowColor = AMBER;
      ctx.shadowBlur = 16;
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = baselineAtX(x) + Math.sin((x / w) * Math.PI * 4) * ampAtX(x);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 8;
      ctx.strokeStyle = 'rgba(255,138,0,0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const j =
          Math.sin(x * 0.13) * 0.5 +
          Math.sin(x * 0.37) * 0.5;
        const y = topY + j * h * 0.04;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      return;
    }

    let t = 0;
    let last = performance.now();
    const draw = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;
      ctx.fillStyle = 'rgba(8,6,3,0.32)';
      ctx.fillRect(0, 0, w, h);
      const stepX = w / 22;
      const stepY = h / 12;
      ctx.strokeStyle = 'rgba(255,176,0,0.07)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= w + 1; x += stepX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h + 1; y += stepY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255,176,0,0.10)';
      ctx.beginPath();
      ctx.moveTo(0, topY);
      ctx.lineTo(w, topY);
      ctx.stroke();

      // top jagged trace
      ctx.shadowColor = AMBER;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = 'rgba(255,138,0,0.7)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 5) {
        const j =
          Math.sin(x * 0.07 + t * 3.1) * 0.45 +
          Math.sin(x * 0.19 + t * 5.7 + 1.3) * 0.32 +
          Math.sin(x * 0.41 + t * 8.9 + 2.7) * 0.20 +
          Math.sin(x * 0.83 + t * 11.4) * 0.10;
        const y = topY + j * h * 0.05;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // main wave (right side big, left side small)
      ctx.shadowBlur = 16;
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const ph = (x / w) * Math.PI * 4;
        const env = 0.85 + 0.25 * Math.sin(t * 0.7 + (x / w) * 2.0);
        const amp = ampAtX(x) * env;
        const y =
          baselineAtX(x) +
          Math.sin(ph + t * 2.8) * amp +
          Math.sin(ph * 2.7 + t * 1.9) * amp * 0.28;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // secondary dim trace
      ctx.shadowBlur = 9;
      ctx.strokeStyle = 'rgba(255,138,0,0.45)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const y =
          baselineAtX(x) +
          Math.sin((x / w) * Math.PI * 7 - t * 2.0) * ampAtX(x) * 0.35;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);
  }

  function restart() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    clearTimers();
    initScope();
    if (window.Laure.isAnim()) typeBootLog();
    else fillBootInstant();
  }

  function start() {
    restart();
    if (resizeDispose) resizeDispose();
    resizeDispose = window.Laure.onResize(restart);
    window.Laure.onAnimChange(restart);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
