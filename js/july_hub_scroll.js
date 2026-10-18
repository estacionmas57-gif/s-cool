/* ==========================================================================
   SYNAPSE • JULY S-COOL HUB: FULL-SCREEN PINNED SCROLL-SCRUBBING ENGINE
   Smooth 60FPS Video Frame Scrubbing Across 10 Seconds of Cinematic Footage
   Option 1: Step-by-Step Chapter Navigation + Instant Zero-Lag Frame Engine
   ========================================================================== */

(function () {
  'use strict';

  // Manual scroll restoration on page refresh to prevent halfway state
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const TOTAL_FRAMES = 93;
  const FRAMES_DIR = 'assets/frames_july_hub';
  const LERP_FACTOR = 0.45;
  const STEP_COOLDOWN_MS = 750;

  const CHAPTERS = [
    { id: 'hub-chapter-1', start: 0.00, end: 0.22, restingProgress: 0.00 },          // Exact frame 1 (index 0)
    { id: 'hub-chapter-2', start: 0.25, end: 0.51, restingProgress: 33 / (TOTAL_FRAMES - 1) }, // Exact frame 34 (index 33)
    { id: 'hub-chapter-3', start: 0.54, end: 0.77, restingProgress: 63 / (TOTAL_FRAMES - 1) }, // Exact frame 64 (index 63)
    { id: 'hub-chapter-4', start: 0.80, end: 1.00, restingProgress: 1.00 }           // Exact frame 93 (index 92)
  ];

  let stage = null;
  let canvas = null;
  let ctx = null;
  let progressBar = null;
  let frameVal = null;
  let stepVal = null;
  const frameImages = [];

  let currentRenderedFrame = 0;
  let targetFrameIndex = 0;
  let animId = null;
  let isTabActive = true;
  let hasPaintedFrame = false;
  let lastDrawnFrame = -1;

  // Step-by-Step state
  let currentChapterIndex = 0;
  let isStepAnimating = false;
  let lastStepTriggerTime = 0;
  let touchStartY = 0;

  function initJulyHubScroll() {
    stage = document.getElementById('hub-july-scroll-stage');
    canvas = document.getElementById('hub-july-canvas');
    progressBar = document.getElementById('hub-progress-bar');
    frameVal = document.getElementById('hub-frame-val');
    stepVal = document.getElementById('hub-step-val');

    if (!stage || !canvas) return;

    ctx = canvas.getContext('2d', { alpha: false });
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    preloadFrames();
    bindScroll();
    bindStepControls();
    checkTabActive();
    startLoop();
  }

  function resizeCanvas() {
    if (!canvas || !stage) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth || 1280;
    const h = window.innerHeight || 720;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    drawCurrentFrame();
  }

  function preloadFrames() {
    // 1. Critical Priority: Load frame 1 immediately
    const firstImg = new Image();
    firstImg.src = `${FRAMES_DIR}/frame_0001.webp`;
    firstImg.onload = () => {
      frameImages[0] = firstImg;
      drawCurrentFrame();
    };
    if (firstImg.complete && firstImg.naturalWidth > 0) {
      frameImages[0] = firstImg;
      drawCurrentFrame();
    }
    frameImages[0] = firstImg;

    // 2. High Priority: Milestone keyframes for the 4 chapters (ending on frame 93 / index 92)
    const milestoneIndices = [15, 33, 48, 63, 78, 92];
    milestoneIndices.forEach(idx => {
      const img = new Image();
      const numStr = String(idx + 1).padStart(4, '0');
      img.src = `${FRAMES_DIR}/frame_${numStr}.webp`;
      img.onload = () => {
        frameImages[idx] = img;
        if (!hasPaintedFrame) drawCurrentFrame();
      };
      frameImages[idx] = img;
    });

    // 3. Background Priority: Batch load remaining frames in fast concurrent chunks
    let nextBatchIdx = 1;
    function loadRemainingBatch() {
      const BATCH_SIZE = 8;
      let count = 0;
      while (nextBatchIdx < TOTAL_FRAMES && count < BATCH_SIZE) {
        const i = nextBatchIdx++;
        if (frameImages[i]) continue;
        count++;
        const img = new Image();
        const numStr = String(i + 1).padStart(4, '0');
        img.src = `${FRAMES_DIR}/frame_${numStr}.webp`;
        img.onload = () => {
          if (Math.abs(i - currentRenderedFrame) <= 1.5) {
            drawCurrentFrame();
          }
        };
        frameImages[i] = img;
      }

      if (nextBatchIdx < TOTAL_FRAMES) {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(loadRemainingBatch, { timeout: 80 });
        } else {
          setTimeout(loadRemainingBatch, 15);
        }
      }
    }

    window._triggerHubBatch = function() {
      if (hasTriggeredBatch) return;
      hasTriggeredBatch = true;
      loadRemainingBatch();
    };
  }

  let hasTriggeredBatch = false;

  function getLoadedImage(index) {
    const clamped = Math.min(TOTAL_FRAMES - 1, Math.max(0, index));
    let img = frameImages[clamped];
    if (img && img.complete && img.naturalWidth > 0) return img;

    // Nearest loaded neighbor search fallback
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const lower = frameImages[clamped - offset];
      if (lower && lower.complete && lower.naturalWidth > 0) return lower;
      const higher = frameImages[clamped + offset];
      if (higher && higher.complete && higher.naturalWidth > 0) return higher;
    }

    if (frameImages[0] && frameImages[0].complete && frameImages[0].naturalWidth > 0) {
      return frameImages[0];
    }
    return null;
  }

  function renderImageCover(img, alpha) {
    if (!canvas || !ctx || !img) return;
    const cW = canvas.width;
    const cH = canvas.height;
    const iW = img.naturalWidth || 1280;
    const iH = img.naturalHeight || 720;

    const scale = Math.max(cW / iW, cH / iH);
    const dW = iW * scale;
    const dH = iH * scale;
    const dX = (cW - dW) * 0.50;
    const dY = (cH - dH) * 0.50;

    ctx.globalAlpha = alpha;
    ctx.drawImage(img, dX, dY, dW, dH);
    ctx.globalAlpha = 1.0;
  }

  function drawCurrentFrame() {
    if (!canvas || !ctx) return false;

    // Pure 100% sharp single frame (zero blend, zero ghosting, authentic 1080p WebP quality)
    const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(currentRenderedFrame)));
    const img = getLoadedImage(frameIndex);
    if (!img) return false;

    renderImageCover(img, 1.0);
    hasPaintedFrame = true;
    return true;
  }

  function updateCards(progress, isStageArrived) {
    CHAPTERS.forEach(ch => {
      const el = document.getElementById(ch.id);
      if (!el) return;

      if (!isStageArrived) {
        // Stage has not reached top of screen yet: keep cards waiting silently
        el.classList.remove('is-active', 'is-outgoing');
        el.classList.add('is-incoming');
        return;
      }

      if (progress < ch.start) {
        // Ahead in scroll: Waiting in 3D distance
        el.classList.remove('is-active', 'is-outgoing');
        el.classList.add('is-incoming');
      } else if (progress >= ch.start && progress <= ch.end) {
        // Active: Landed and hovering in crystal focus
        el.classList.remove('is-incoming', 'is-outgoing');
        el.classList.add('is-active');
      } else {
        // Past: Sucked into the invisible black hole
        el.classList.remove('is-incoming', 'is-active');
        el.classList.add('is-outgoing');
      }
    });

    if (progressBar) {
      progressBar.style.width = `${(progress * 100).toFixed(1)}%`;
    }
    if (frameVal) {
      const fNum = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(progress * (TOTAL_FRAMES - 1)) + 1));
      frameVal.textContent = `${String(fNum).padStart(3, '0')} / ${TOTAL_FRAMES}`;
    }

    // Sync chapter index if user drags scrollbar manually
    if (!isStepAnimating && isStageArrived) {
      let activeIdx = 0;
      if (progress >= 0.78) activeIdx = 3;
      else if (progress >= 0.52) activeIdx = 2;
      else if (progress >= 0.23) activeIdx = 1;
      else activeIdx = 0;

      if (activeIdx !== currentChapterIndex) {
        currentChapterIndex = activeIdx;
        updateStepUI(activeIdx);
      }
    }
  }

  function updateStepUI(index) {
    if (stepVal) {
      stepVal.textContent = `${index + 1} / ${CHAPTERS.length}`;
    }
    const chips = document.querySelectorAll('.hub-step-chip');
    chips.forEach((chip, i) => {
      if (i === index) chip.classList.add('is-active');
      else chip.classList.remove('is-active');
    });
  }

  function goToChapter(index) {
    if (index < 0 || index >= CHAPTERS.length || !stage) return;

    isStepAnimating = true;
    lastStepTriggerTime = Date.now();
    currentChapterIndex = index;
    updateStepUI(index);

    const rect = stage.getBoundingClientRect();
    const stageH = stage.offsetHeight - window.innerHeight;
    const stageTopInDoc = window.scrollY + rect.top;
    const targetY = Math.round(stageTopInDoc + stageH * CHAPTERS[index].restingProgress);

    if (window.lenisInstance && typeof window.lenisInstance.scrollTo === 'function') {
      window.lenisInstance.scrollTo(targetY, {
        duration: 0.72,
        easing: (t) => 1 - Math.pow(1 - t, 2.2)
      });
    } else {
      smoothScrollTo(targetY, 720);
    }

    setTimeout(() => {
      isStepAnimating = false;
    }, 750);
  }

  function smoothScrollTo(targetY, duration) {
    const startY = window.scrollY;
    const diff = targetY - startY;
    if (Math.abs(diff) < 2) return;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 2.2);
      window.scrollTo(0, startY + diff * ease);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  function bindStepControls() {
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    window.addEventListener('keydown', handleKeydown);

    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    const chips = document.querySelectorAll('.hub-step-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const step = parseInt(chip.getAttribute('data-step'), 10);
        if (!isNaN(step)) goToChapter(step);
      });
    });
  }

  function handleWheel(e) {
    if (!isTabActive || !stage) return;

    const rect = stage.getBoundingClientRect();
    const isPinned = rect.top <= 8 && rect.bottom >= window.innerHeight - 8;

    if (!isPinned) return; // Allow natural scrolling outside stage

    const delta = e.deltaY;
    if (Math.abs(delta) < 14) return;

    // If at Chapter 1 and scrolling UP: allow page to scroll back up to hero
    if (currentChapterIndex === 0 && delta < -10) return;

    // If at Chapter 4 and scrolling DOWN: allow page to scroll down to App Deck
    if (currentChapterIndex === CHAPTERS.length - 1 && delta > 10) return;

    // Within stage: intercept and step chapter-by-chapter
    e.preventDefault();
    e.stopImmediatePropagation();

    const now = Date.now();
    if (now - lastStepTriggerTime < STEP_COOLDOWN_MS || isStepAnimating) {
      return; // Absorb momentum and fast spins
    }

    if (delta > 0) {
      goToChapter(currentChapterIndex + 1);
    } else if (delta < 0) {
      goToChapter(currentChapterIndex - 1);
    }
  }

  function handleKeydown(e) {
    if (!isTabActive || !stage) return;
    const rect = stage.getBoundingClientRect();
    const isPinned = rect.top <= 8 && rect.bottom >= window.innerHeight - 8;
    if (!isPinned) return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      if (currentChapterIndex < CHAPTERS.length - 1) {
        e.preventDefault();
        const now = Date.now();
        if (now - lastStepTriggerTime >= STEP_COOLDOWN_MS && !isStepAnimating) {
          goToChapter(currentChapterIndex + 1);
        }
      }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      if (currentChapterIndex > 0) {
        e.preventDefault();
        const now = Date.now();
        if (now - lastStepTriggerTime >= STEP_COOLDOWN_MS && !isStepAnimating) {
          goToChapter(currentChapterIndex - 1);
        }
      }
    }
  }

  function handleTouchEnd(e) {
    if (!isTabActive || !stage) return;
    const rect = stage.getBoundingClientRect();
    const isPinned = rect.top <= 8 && rect.bottom >= window.innerHeight - 8;
    if (!isPinned) return;

    if (e.changedTouches && e.changedTouches.length > 0) {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      if (Math.abs(diff) > 40) {
        const now = Date.now();
        if (now - lastStepTriggerTime >= STEP_COOLDOWN_MS && !isStepAnimating) {
          if (diff > 0 && currentChapterIndex < CHAPTERS.length - 1) {
            goToChapter(currentChapterIndex + 1);
          } else if (diff < 0 && currentChapterIndex > 0) {
            goToChapter(currentChapterIndex - 1);
          }
        }
      }
    }
  }

  function updateScrollProgress() {
    if (!isTabActive || !stage) return;
    const rect = stage.getBoundingClientRect();
    const stageH = rect.height - window.innerHeight;
    if (stageH <= 0) return;

    const isStageArrived = rect.top <= 20;
    const top = -rect.top;
    const progress = Math.max(0, Math.min(1, top / stageH));

    targetFrameIndex = progress * (TOTAL_FRAMES - 1);
    updateCards(progress, isStageArrived);
  }

  function tick() {
    checkTabActive();

    if (isTabActive && stage) {
      updateScrollProgress();

      const diff = targetFrameIndex - currentRenderedFrame;
      if (Math.abs(diff) > 0.05) {
        currentRenderedFrame += diff * LERP_FACTOR;
      } else {
        currentRenderedFrame = targetFrameIndex;
      }

      const rounded = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(currentRenderedFrame)));
      if (rounded !== lastDrawnFrame || !hasPaintedFrame) {
        const painted = drawCurrentFrame();
        if (painted) {
          lastDrawnFrame = rounded;
        }
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
    const hubView = document.getElementById('view-hub');
    isTabActive = hubView ? hubView.classList.contains('is-active') : false;
    if (isTabActive && window._triggerHubBatch) {
      window._triggerHubBatch();
    }
  }

  function bindScroll() {
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    if (window.lenisInstance) {
      window.lenisInstance.on('scroll', updateScrollProgress);
    }
    updateScrollProgress();
  }

  window.onJulyHubActivated = function() {
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

  window.onJulyHubDeactivated = function() {
    isTabActive = false;
  };

  // Expose step controller for external calls
  window.goToJulyHubChapter = goToChapter;

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initJulyHubScroll);
  } else {
    setTimeout(initJulyHubScroll, 150);
  }

  window.initJulyHubScroll = initJulyHubScroll;
})();
