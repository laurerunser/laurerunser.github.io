/* =========================================================
   cv.js — career & education columns typing + bg
   ========================================================= */
(function () {
  'use strict';

  const WORK_LINES = [
    '> career.log ........ retrieving',
    '> ',
    '> [oct 2024 — current]     software engineer @ datadog',
    '> // building the cloud workload security product',
    '> ',
    '> [apr 2024 — sept 2024]   intern @ datadog',
    '> ',
    '> [june 2023 — sept 2023]  intern @ nomadic labs',
    '> // improving the performance of parsers',
    '> // for the tezos blockchain protocols',
  ];

  const REST_LINES = [
    '> education.log ..... retrieving',
    '> ',
    '> [2023 — 2024]   master\u2019s degree @ université paris cité',
    '> // compilation, formal verification and algorithms',
    '> ',
    '> [2019 — 2022]   undergraduate @ université paris cité',
    '> ',
    '## STATUS',
    '> open to opportunities',
    '> open to freelance work',
    '> ',
  ];

  let timers = [];
  function clearTimers() {
    timers.forEach((t) => clearTimeout(t));
    timers = [];
  }

  function styleClass(line, isLast) {
    if (line.startsWith('## ')) return 'boot__line boot__line--header';
    if (isLast) return 'boot__line boot__line--accent';
    if (line.includes('open to')) return 'boot__line boot__line--accent';
    if (line.includes('//')) return 'boot__line boot__line--dim';
    return 'boot__line';
  }

  function visibleText(raw) {
    return raw.startsWith('## ') ? raw.slice(3) : raw;
  }

  function fillColInstant(elId, lines, finalCursor) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = '';
    lines.forEach((line, i) => {
      const isLast = finalCursor && i === lines.length - 1;
      const div = document.createElement('div');
      div.className = styleClass(line, isLast);
      div.textContent = visibleText(line);
      if (isLast) {
        const c = document.createElement('span');
        c.className = 'boot__cursor';
        c.textContent = '\u2588';
        div.appendChild(c);
      }
      el.appendChild(div);
    });
  }

  function typeCol(elId, lines, finalCursor, startDelay) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = '';
    let i = 0;
    const addLine = () => {
      if (i >= lines.length) return;
      const raw = lines[i];
      const isLast = finalCursor && i === lines.length - 1;
      const full = visibleText(raw);
      const div = document.createElement('div');
      div.className = styleClass(raw, isLast);
      el.appendChild(div);
      let j = 0;
      const type = () => {
        div.textContent = full.slice(0, j);
        if (j === full.length && isLast) {
          const c = document.createElement('span');
          c.className = 'boot__cursor';
          c.textContent = '\u2588';
          div.appendChild(c);
        }
        j++;
        if (j <= full.length) {
          timers.push(setTimeout(type, 5 + Math.random() * 10));
        } else {
          i++;
          timers.push(setTimeout(addLine, 60));
        }
      };
      type();
    };
    timers.push(setTimeout(addLine, startDelay));
  }

  // ---------- background ----------
  let rafId = null;
  let resizeDispose = null;

  function initBg() {
    const cvs = document.getElementById('bg-canvas');
    if (!cvs) return;
    const { ctx, w, h } = window.Laure.setupCanvas(cvs);
    const AMBER = '#ffb000';

    const drawGrid = () => {
      ctx.fillStyle = '#080603';
      ctx.fillRect(0, 0, w, h);
      const stepX = w / 22;
      const stepY = h / 12;
      ctx.strokeStyle = 'rgba(255,176,0,0.06)';
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
    };

    if (!window.Laure.isAnim()) {
      drawGrid();
      ctx.shadowColor = AMBER;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = 'rgba(255,176,0,0.5)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const y = h * 0.92 + Math.sin((x / w) * Math.PI * 6) * h * 0.022;
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
      ctx.fillStyle = 'rgba(8,6,3,0.35)';
      ctx.fillRect(0, 0, w, h);
      const stepX = w / 22;
      const stepY = h / 12;
      ctx.strokeStyle = 'rgba(255,176,0,0.06)';
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
      ctx.shadowColor = AMBER;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const y = h * 0.92 + Math.sin((x / w) * Math.PI * 6 + t * 1.0) * h * 0.025;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 7;
      ctx.strokeStyle = 'rgba(255,138,0,0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const y = h * 0.08 + Math.sin((x / w) * Math.PI * 9 - t * 1.6) * h * 0.018;
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
    initBg();
    if (window.Laure.isAnim()) {
      typeCol('boot-work', WORK_LINES, false, 200);
      typeCol('boot-rest', REST_LINES, true, 200);
    } else {
      fillColInstant('boot-work', WORK_LINES, false);
      fillColInstant('boot-rest', REST_LINES, true);
    }
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
