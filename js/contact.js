/* =========================================================
   contact.js — perspective grid that follows the cursor
   ========================================================= */
(function () {
  'use strict';

  let rafId = null;
  let resizeDispose = null;
  let gx = 0;
  let gy = 0;
  let onMouse = null;

  function init() {
    const cvs = document.getElementById('bg-canvas');
    if (!cvs) return;
    const { ctx, w, h } = window.Laure.setupCanvas(cvs);

    let vpx = w / 2;
    let vpy = h * 0.46;

    const drawFrame = (off) => {
      const horizon = vpy;
      const g = ctx.createLinearGradient(0, 0, 0, horizon);
      g.addColorStop(0, '#0a0712');
      g.addColorStop(1, '#1a0d05');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, horizon);
      ctx.fillStyle = '#05040a';
      ctx.fillRect(0, horizon, w, h - horizon);

      // stars
      for (let i = 0; i < 70; i++) {
        const x = (i * 113.7) % w;
        const y = (i * 71.3) % (h * 0.45);
        ctx.fillStyle = 'rgba(255,206,92,' + (0.25 + (i % 5) * 0.08) + ')';
        ctx.fillRect(x, y, 1.4, 1.4);
      }

      // sun glow on horizon at vanishing point
      const sun = ctx.createRadialGradient(vpx, horizon, 4, vpx, horizon, w * 0.4);
      sun.addColorStop(0, 'rgba(255,176,0,0.32)');
      sun.addColorStop(1, 'transparent');
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, w, h);

      // horizontal grid lines, denser near horizon
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 22; i++) {
        const p = (i + off) / 22;
        const y = horizon + Math.pow(p, 2.4) * (h - horizon);
        if (y > h) continue;
        ctx.strokeStyle = 'rgba(255,176,0,' + (0.10 + p * 0.5) + ')';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // verticals converging to vanishing point
      for (let i = -10; i <= 10; i++) {
        const fx = vpx + i * (w / 12);
        ctx.strokeStyle = 'rgba(255,138,0,' + (0.12 + (Math.abs(i) / 10) * 0.18) + ')';
        ctx.beginPath();
        ctx.moveTo(vpx + i * 6, horizon);
        ctx.lineTo(fx, h);
        ctx.stroke();
      }
    };

    if (!window.Laure.isAnim()) {
      vpx = w / 2;
      vpy = h * 0.46;
      drawFrame(0);
      return;
    }

    onMouse = (e) => {
      const rect = cvs.getBoundingClientRect();
      gx = (e.clientX - rect.left) / rect.width - 0.5;
      gy = (e.clientY - rect.top) / rect.height - 0.5;
    };
    window.addEventListener('mousemove', onMouse);

    let last = performance.now();
    let off = 0;
    const draw = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      off = (off + dt * 0.6) % 1;
      const tx = w / 2 + gx * w * 0.45;
      const ty = h * 0.46 + gy * h * 0.18;
      vpx += (tx - vpx) * 0.18;
      vpy += (ty - vpy) * 0.18;
      drawFrame(off);
      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);
  }

  function restart() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    if (onMouse) {
      window.removeEventListener('mousemove', onMouse);
      onMouse = null;
    }
    init();
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
