/* ==========================================================================
   SYNAPSE • JULY IDIOMAS HERO: REAL-TIME MOUSE HEAD & EYE TRACKING ENGINE
   Mimics Mainframe A.R.I.A Architecture using 90 Stop-Motion Frames
   ========================================================================== */

(function () {
  'use strict';

  const TOTAL_FRAMES = 90;
  const FRAMES_DIR = 'assets/frames_july_head';
  const LERP_FACTOR = 0.32;

  let canvas = null;
  let ctx = null;
  let heroContainer = null;
  const frameImages = [];

  let currentRenderedFrame = 1;
  let targetFrameIndex = 1;
  let animId = null;
  let isTabActive = false;

  function initJulyIdiomas() {
    canvas = document.getElementById('july-idiomas-canvas');
    heroContainer = document.getElementById('july-idiomas-hero');
    if (!canvas || !heroContainer) return;

    ctx = canvas.getContext('2d', { alpha: false });
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    preloadFrames();
    bindEvents();
    checkTabActive();
    startLoop();
  }

  function resizeCanvas() {
    if (!canvas || !heroContainer) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = heroContainer.getBoundingClientRect();
    const w = (rect.width && rect.width > 50) ? rect.width : (window.innerWidth || 1280);
    const h = (rect.height && rect.height > 50) ? rect.height : (window.innerHeight || 900);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    drawCurrentFrame();
  }

  function preloadFrames() {
    // 1. Immediately load frame 1 (looking at camera/left)
    const firstImg = new Image();
    firstImg.src = `${FRAMES_DIR}/frame_0001.webp`;
    firstImg.onload = () => {
      frameImages[1] = firstImg;
      drawCurrentFrame();
    };
    frameImages[1] = firstImg;

    // 2. Load center frame (looking forward)
    const midImg = new Image();
    midImg.src = `${FRAMES_DIR}/frame_0045.webp`;
    midImg.onload = () => {
      frameImages[45] = midImg;
    };
    frameImages[45] = midImg;

    // 3. Preload all 90 frames in background
    for (let i = 2; i <= TOTAL_FRAMES; i++) {
      if (i === 45) continue;
      const img = new Image();
      const numStr = String(i).padStart(4, '0');
      img.src = `${FRAMES_DIR}/frame_${numStr}.webp`;
      img.onload = () => {
        if (Math.abs(i - Math.round(currentRenderedFrame)) <= 2) {
          drawCurrentFrame();
        }
      };
      frameImages[i] = img;
    }
  }

  function drawCurrentFrame() {
    if (!canvas || !ctx) return;
    const frameIndex = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(currentRenderedFrame)));
    let img = frameImages[frameIndex];

    // Nearest fallback if frame not yet loaded
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const lower = frameImages[frameIndex - offset];
        if (lower && lower.complete && lower.naturalWidth > 0) { img = lower; break; }
        const higher = frameImages[frameIndex + offset];
        if (higher && higher.complete && higher.naturalWidth > 0) { img = higher; break; }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cW = canvas.width;
    const cH = canvas.height;
    const iW = img.naturalWidth || 1280;
    const iH = img.naturalHeight || 720;

    // object-fit: cover, positioned to showcase July (centered slightly towards right on desktop)
    const scale = Math.max(cW / iW, cH / iH);
    const dW = iW * scale;
    const dH = iH * scale;

    // Center focal point on July (approx 55% horizontal)
    const dX = (cW - dW) * 0.55;
    const dY = (cH - dH) * 0.50;

    ctx.drawImage(img, dX, dY, dW, dH);
  }

  let lastDrawn = -1;

  function tick() {
    checkTabActive();

    if (isTabActive) {
      const diff = targetFrameIndex - currentRenderedFrame;
      if (Math.abs(diff) > 0.05) {
        currentRenderedFrame += diff * LERP_FACTOR;
      }
      const rounded = Math.round(currentRenderedFrame);
      if (rounded !== lastDrawn) {
        lastDrawn = rounded;
        drawCurrentFrame();
      }
    }

    animId = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (!animId) {
      animId = requestAnimationFrame(tick);
    }
  }

  function checkTabActive() {
    const idiomasView = document.getElementById('view-idiomas');
    isTabActive = idiomasView ? idiomasView.classList.contains('is-active') : false;
  }

  function bindEvents() {
    function onPointerMove(clientX) {
      if (!isTabActive) return;
      const width = window.innerWidth || 1280;
      // Normalized X from 0.0 (left) to 1.0 (right)
      const normX = Math.max(0, Math.min(1, clientX / width));
      // Map to frame 1..90
      targetFrameIndex = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(normX * (TOTAL_FRAMES - 1)) + 1));
    }

    window.addEventListener('mousemove', (e) => {
      onPointerMove(e.clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX);
      }
    }, { passive: true });
  }

  window.onJulyIdiomasActivated = function() {
    isTabActive = true;
    requestAnimationFrame(() => {
      resizeCanvas();
      drawCurrentFrame();
    });
    setTimeout(() => {
      resizeCanvas();
      drawCurrentFrame();
    }, 60);
  };

  window.onJulyIdiomasDeactivated = function() {
    isTabActive = false;
  };

  window.initJulyIdiomas = initJulyIdiomas;

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initJulyIdiomas);
  } else {
    setTimeout(initJulyIdiomas, 100);
  }
})();
