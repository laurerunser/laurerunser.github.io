/* =========================================================
   work.js — personal projects placeholder
   draws TV-static noise behind the "NO SIGNAL" copy
   ========================================================= */
(function () {
  'use strict';

  let rafId = null;
  let resizeDispose = null;

  function init() {
    const cvs = document.getElementById('bg-canvas');
    if (!cvs) return;
    const { ctx, w, h } = window.Laure.setupCanvas(cvs);

    const oneFrame = (t) => {
      ctx.fillStyle = '#0a0805';
      ctx.fillRect(0, 0, w, h);
      for (let k = 0; k < 1400; k++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const a = Math.random() * 0.32;
        ctx.fillStyle = 'rgba(255,200,120,' + a + ')';
        ctx.fillRect(x, y, 2, 2);
      }
      if (t != null) {
        const by = (t * 220) % h;
        ctx.fillStyle = 'rgba(255,176,0,0.06)';
        ctx.fillRect(0, by, w, 26);
      }
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    };

    if (!window.Laure.isAnim()) {
      oneFrame(null);
      return;
    }
    let last = performance.now();
    let t = 0;
    const draw = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      t += dt;
      oneFrame(t);
      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);
  }

  function restart() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
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
