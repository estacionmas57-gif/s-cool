/* ==========================================================================
   MAINFRAME • CREATIVE AGENCY HERO & MOUSE-SCRUB VIDEO / CANVAS CONTROLLER
   Universal 60FPS Eye-Scrubbing Engine + Native Video Spec Integration
   ========================================================================== */

(function() {
  const TOTAL_FRAMES = 97;
  const VIDEO_DURATION = 4.04;
  const SENSITIVITY = 0.8;
  const FULL_TEXT = "Glad you stopped in. Good taste tends to find us. Now, what are we building?";
  const TYPE_SPEED = 38; // ms per char
  const START_DELAY = 600; // ms

  // DOM Elements
  let videoEl = null;
  let canvasEl = null;
  let ctx = null;

  // Frame Cache
  const frameImages = [];
  let currentRenderedFrame = 48; // Start looking forward
  let targetFrameIndex = 48;
  let animFrameId = null;

  // Mouse State
  let prevX = null;
  let targetTime = 2.0; // Seconds (midway)
  let isSeeking = false;
  let isMainframeTabActive = false;

  // Typewriter & Pills Timers
  let typewriterTimeout = null;
  let typewriterInterval = null;
  let pillsTimeout = null;

  // Poster Image Fallback
  const posterImg = new Image();
  posterImg.src = 'assets/mainframe_poster.jpg';

  let hasPreloaded = false;
  // Preload all 97 stop-motion character frames on demand
  function preloadFrames() {
    if (hasPreloaded) return;
    hasPreloaded = true;
    posterImg.onload = () => drawCurrentFrame();
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const numStr = String(i).padStart(4, '0');
      img.src = `assets/frames_mainframe/frame_${numStr}.webp`;
      img.onload = () => {
        if (Math.abs(i - Math.round(currentRenderedFrame)) <= 2) {
          drawCurrentFrame();
        }
      };
      frameImages[i] = img;
    }
  }

  // Setup Canvas Dimensions (DPR-aware)
  function resizeCanvas() {
    if (!canvasEl) return;
    const dpr = window.devicePixelRatio || 1;
    canvasEl.width = window.innerWidth * dpr;
    canvasEl.height = window.innerHeight * dpr;
    drawCurrentFrame();
  }

  // Draw Frame with Object-Fit: Cover & 70% Horizontal Alignment
  function drawCurrentFrame() {
    if (!canvasEl || !ctx) return;
    const frameIndex = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(currentRenderedFrame)));
    let img = frameImages[frameIndex];

    if (!img || !img.complete || img.naturalWidth === 0) {
      // Find nearest loaded frame
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const lower = frameImages[frameIndex - offset];
        if (lower && lower.complete && lower.naturalWidth > 0) { img = lower; break; }
        const higher = frameImages[frameIndex + offset];
        if (higher && higher.complete && higher.naturalWidth > 0) { img = higher; break; }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) {
      img = posterImg;
    }
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cW = canvasEl.width;
    const cH = canvasEl.height;
    const iW = img.naturalWidth || 1920;
    const iH = img.naturalHeight || 1080;

    // object-fit: cover
    const scale = Math.max(cW / iW, cH / iH);
    const dW = iW * scale;
    const dH = iH * scale;

    // object-position: 70% center
    const dX = (cW - dW) * 0.70;
    const dY = (cH - dH) * 0.50;

    ctx.drawImage(img, dX, dY, dW, dH);
  }

  let lastDrawnFrame = -1;

  // Smooth 60FPS Eye Tracking Animation Loop
  function tickAnimation() {
    if (isMainframeTabActive) {
      // Smooth lerp towards target frame
      const diff = targetFrameIndex - currentRenderedFrame;
      if (Math.abs(diff) > 0.05) {
        currentRenderedFrame += diff * 0.35;
      }
      const rounded = Math.round(currentRenderedFrame);
      if (rounded !== lastDrawnFrame) {
        lastDrawnFrame = rounded;
        drawCurrentFrame();
      }
    }
    animFrameId = requestAnimationFrame(tickAnimation);
  }

  // Initialize Elements & Events
  function initMainframe() {
    canvasEl = document.getElementById('mainframe-canvas');
    if (canvasEl) {
      ctx = canvasEl.getContext('2d', { alpha: false });
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas, { passive: true });
    }

    videoEl = document.getElementById('mainframe-video');
    if (videoEl) {
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.preload = "auto";

      videoEl.addEventListener('seeked', () => {
        isSeeking = false;
        if (videoEl && videoEl.duration && !isNaN(videoEl.duration)) {
          if (Math.abs(videoEl.currentTime - targetTime) > 0.04) {
            performSeek();
          }
        }
      });
    }

    animFrameId = requestAnimationFrame(tickAnimation);

    // Mouse & Touch listeners for horizontal eye scrubbing
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // Setup Copy Pill
    const copyPill = document.getElementById('mainframe-copy-pill');
    if (copyPill) {
      copyPill.addEventListener('click', handleCopyEmail);
    }

    // Setup Mobile Hamburger
    const hamburger = document.getElementById('mainframe-hamburger');
    const mobileOverlay = document.getElementById('mainframe-mobile-overlay');
    if (hamburger && mobileOverlay) {
      hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('is-open');
        mobileOverlay.classList.toggle('is-visible', isOpen);
      });

      mobileOverlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('is-open');
          mobileOverlay.classList.remove('is-visible');
        });
      });
    }

    // Check if initial hash is prueba
    if (window.location.hash.toLowerCase() === '#prueba') {
      window.activateMainframe();
    }
  }

  function performSeek() {
    if (!videoEl || !videoEl.duration || isNaN(videoEl.duration)) return;
    isSeeking = true;
    try {
      videoEl.currentTime = targetTime;
    } catch (e) {
      isSeeking = false;
    }
  }

  // Core Mouse Scrub Handler (Prompt Specification)
  function onMouseMove(e) {
    if (!isMainframeTabActive) return;

    const currentX = e.clientX;
    const winW = window.innerWidth || 1;
    const dur = (videoEl && videoEl.duration && !isNaN(videoEl.duration)) ? videoEl.duration : VIDEO_DURATION;

    if (prevX === null) {
      prevX = currentX;
      // Direct orientation based on cursor entry
      targetTime = (currentX / winW) * dur;
    } else {
      const delta = currentX - prevX;
      prevX = currentX;

      // Delta time offset formula from prompt
      const timeOffset = (delta / winW) * SENSITIVITY * dur;
      targetTime = Math.max(0, Math.min(dur, targetTime + timeOffset));
    }

    // Calculate corresponding frame (1..97)
    const norm = Math.max(0, Math.min(1, targetTime / dur));
    targetFrameIndex = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(1 + norm * (TOTAL_FRAMES - 1))));

    // Also drive video currentTime if video is available
    if (!isSeeking && videoEl && videoEl.duration) {
      performSeek();
    }
  }

  // Touch Scrub Handler for Mobile
  function onTouchMove(e) {
    if (!isMainframeTabActive || !e.touches || !e.touches[0]) return;
    const touchX = e.touches[0].clientX;
    const winW = window.innerWidth || 1;
    const dur = VIDEO_DURATION;

    const norm = Math.max(0, Math.min(1, touchX / winW));
    targetTime = norm * dur;
    targetFrameIndex = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(1 + norm * (TOTAL_FRAMES - 1))));
  }

  // Typewriter Engine
  function startTypewriter() {
    const textEl = document.getElementById('mainframe-typewriter-text');
    const cursorEl = document.getElementById('mainframe-cursor');
    if (!textEl) return;

    clearTimeout(typewriterTimeout);
    clearInterval(typewriterInterval);
    textEl.textContent = "";
    if (cursorEl) cursorEl.style.display = "inline-block";

    typewriterTimeout = setTimeout(() => {
      let charIndex = 0;
      typewriterInterval = setInterval(() => {
        if (charIndex < FULL_TEXT.length) {
          textEl.textContent += FULL_TEXT.charAt(charIndex);
          charIndex++;
        } else {
          clearInterval(typewriterInterval);
          if (cursorEl) cursorEl.style.display = "none";
        }
      }, TYPE_SPEED);
    }, START_DELAY);
  }

  // Action Pills Entrance (400ms delay)
  function showActionPills() {
    const pillsContainer = document.getElementById('mainframe-pills-container');
    if (!pillsContainer) return;

    pillsContainer.classList.remove('is-visible');
    clearTimeout(pillsTimeout);

    pillsTimeout = setTimeout(() => {
      pillsContainer.classList.add('is-visible');
    }, 400);
  }

  // Copy Email Handler
  async function handleCopyEmail(e) {
    e.preventDefault();
    const email = "hello@mainframe.co";
    const toast = document.getElementById('mainframe-copy-toast');

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = email;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
      }
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  }

  // Public Router API
  window.activateMainframe = function() {
    isMainframeTabActive = true;
    prevX = null;
    preloadFrames();
    resizeCanvas();
    drawCurrentFrame();
    startTypewriter();
    showActionPills();
  };

  window.deactivateMainframe = function() {
    isMainframeTabActive = false;
    prevX = null;
    clearTimeout(typewriterTimeout);
    clearInterval(typewriterInterval);
    clearTimeout(pillsTimeout);
  };

  // Direct scrub API for programmatic control & testing
  window.scrubMainframeTime = function(timeSeconds) {
    const dur = VIDEO_DURATION;
    targetTime = Math.max(0, Math.min(dur, timeSeconds));
    const norm = targetTime / dur;
    targetFrameIndex = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(1 + norm * (TOTAL_FRAMES - 1))));
    currentRenderedFrame = targetFrameIndex;
    drawCurrentFrame();
    performSeek();
  };

  window.scrubMainframeX = function(clientX) {
    onMouseMove({ clientX });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMainframe);
  } else {
    initMainframe();
  }
})();
