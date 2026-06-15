/* =========================================================
   common.js — animation toggle + shared utilities
   loaded on every page
   ========================================================= */
(function () {
  'use strict';

  const STORAGE_KEY = 'laure.anim';

  /** Read animation pref. Defaults: respect prefers-reduced-motion when unset. */
  function readAnim() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === '0') return false;
      if (v === '1') return true;
    } catch (_) {}
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return true;
  }

  function writeAnim(on) {
    try { localStorage.setItem(STORAGE_KEY, on ? '1' : '0'); } catch (_) {}
  }

  function applyAnim(on) {
    document.documentElement.setAttribute('data-anim', on ? '1' : '0');
    const toggles = document.querySelectorAll('.anim-toggle');
    toggles.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(on));
      const state = btn.querySelector('.anim-toggle__state');
      if (state) state.textContent = on ? 'ON' : 'OFF';
    });
    window.dispatchEvent(new CustomEvent('laure:anim', { detail: { anim: on } }));
  }

  function init() {
    const initial = readAnim();
    applyAnim(initial);
    document.querySelectorAll('.anim-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-anim') !== '1';
        writeAnim(next);
        applyAnim(next);
      });
    });
  }

  // expose to page scripts
  window.Laure = window.Laure || {};
  window.Laure.isAnim = function () {
    return document.documentElement.getAttribute('data-anim') === '1';
  };
  window.Laure.onAnimChange = function (cb) {
    window.addEventListener('laure:anim', (e) => cb(e.detail.anim));
  };

  /** Pixel-ratio aware canvas setup. Returns { ctx, w, h }. */
  window.Laure.setupCanvas = function (cvs) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = cvs.getBoundingClientRect();
    const w = rect.width || 100;
    const h = rect.height || 100;
    cvs.width = Math.round(w * dpr);
    cvs.height = Math.round(h * dpr);
    const ctx = cvs.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  };

  /** Convenience: run cb on a debounced resize. Returns disposer. */
  window.Laure.onResize = function (cb, delay) {
    let t;
    const handler = () => {
      clearTimeout(t);
      t = setTimeout(cb, delay || 160);
    };
    window.addEventListener('resize', handler);
    return () => { clearTimeout(t); window.removeEventListener('resize', handler); };
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
