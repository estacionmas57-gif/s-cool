/* ==========================================================================
   INICIO • HIGH-PERFORMANCE 60FPS STORYTELLING & INTERACTIVE ARM SCRUBBER
   Zero-Lag WebP Frame Scrubbing (120 intro frames) + Mouse-reactive Arm Pointing (96 frames)
   ========================================================================== */

(function () {
  'use strict';

  const TOTAL_SCROLL_FRAMES = 120;
  const SCROLL_FRAMES_DIR = 'assets/frames_inicio';
  const SCROLL_FRAMES_VERSION = '?v=v8_clean_no_cards_20261018';
  const SCROLL_MILESTONES = [1, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120];

  const TOTAL_POINTING_FRAMES = 240;
  const POINTING_FRAMES_DIR = 'assets/frames_woman_pointing';
  const POINTING_FRAMES_VERSION = '?v=v20261017_240';
  const POINTING_MILESTONES = [1, 35, 65, 100, 138, 170, 195, 220, 240];

  let canvas = null;
  let ctx = null;
  let scrollWrapper = null;
  let pointingMessage = null;
  let hotspotsLayer = null;
  let hotspotButtons = [];

  const STORY_PHRASES_CONFIG = [
    { id: 'story-phrase-1', stepIndex: 1, start: 0.01, peakStart: 0.05, peakEnd: 0.22, end: 0.27 },
    { id: 'story-phrase-2', stepIndex: 2, start: 0.23, peakStart: 0.28, peakEnd: 0.45, end: 0.50 },
    { id: 'story-phrase-3', stepIndex: 3, start: 0.46, peakStart: 0.51, peakEnd: 0.68, end: 0.73 },
    { id: 'story-phrase-4', stepIndex: 4, start: 0.69, peakStart: 0.74, peakEnd: 0.90, end: 0.95 }
  ];
  let storyPhraseElements = [];
  let storyDotElements = [];

  const scrollImages = new Array(TOTAL_SCROLL_FRAMES + 1);
  const pointingImages = new Array(TOTAL_POINTING_FRAMES + 1);

  let currentMode = 'scroll'; // 'scroll' | 'interactive'
  let targetScrollFrame = 1;
  let targetPointingProgress = 0.0;
  let currentPointingProgress = 0.0;
  let targetPointingFrame = 1;
  let currentPointingFrame = 1;
  let isPointingLoopRunning = false;
  let isHoveringCard = false;

  let lastDrawnType = '';
  let lastDrawnIndex = -1;
  let hasPaintedFrame = false;

  function initElements() {
    canvas = document.getElementById('inicio-story-canvas');
    scrollWrapper = document.getElementById('inicio-scroll-wrapper');
    pointingMessage = document.getElementById('inicio-pointing-message');
    hotspotsLayer = document.getElementById('inicio-hotspots-layer');
    hotspotButtons = Array.from(document.querySelectorAll('.inicio-hotspot'));
    storyDotElements = Array.from(document.querySelectorAll('.story-dot'));

    storyPhraseElements = STORY_PHRASES_CONFIG.map(cfg => ({
      el: document.getElementById(cfg.id),
      cfg: cfg
    }));

    // Initialize story style (Default: 'editorial' Blanco Radiante & Luminoso)
    let savedStyle = 'editorial';
    try {
      savedStyle = localStorage.getItem('scool_story_style') || 'editorial';
    } catch (e) {}
    window.setStoryStyle(savedStyle);

    if (!canvas) return;

    ctx = canvas.getContext('2d', { alpha: false });
    resizeCanvas();
    updateHotspotsLayout();
    bindHotspotEvents();
    initInteractiveLogo();
    preloadAllSequences();
    bindEvents();
    onScroll();
  }

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth || 1280;
    const h = window.innerHeight || 720;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    updateHotspotsLayout();
    if (currentMode === 'interactive') {
      drawPointingFrame(currentPointingFrame);
    } else {
      drawScrollFrame(lastDrawnIndex > 0 ? lastDrawnIndex : 1);
    }
  }

  function updateHotspotsLayout() {
    if (!hotspotsLayer || !canvas) return;
    const cW = canvas.clientWidth || window.innerWidth;
    const cH = canvas.clientHeight || window.innerHeight;
    const iW = 1280;
    const iH = 720;
    // Same cover math as renderImageToCanvas
    const scale = Math.max(cW / iW, cH / iH);
    const dW = iW * scale;
    const dH = iH * scale;
    const dX = (cW - dW) * 0.5;
    const dY = (cH - dH) * 0.5;

    // Position the hotspots layer to match the drawn image
    hotspotsLayer.style.position = 'absolute';
    hotspotsLayer.style.width = Math.round(dW) + 'px';
    hotspotsLayer.style.height = Math.round(dH) + 'px';
    hotspotsLayer.style.left = Math.round(dX) + 'px';
    hotspotsLayer.style.top = Math.round(dY) + 'px';

    // Sync the SVG overlay to the same cover-scaled dimensions
    const svg = document.getElementById('inicio-hotspots-svg');
    if (svg) {
      svg.style.width = Math.round(dW) + 'px';
      svg.style.height = Math.round(dH) + 'px';
      svg.style.left = '0';
      svg.style.top = '0';
      svg.style.transform = 'none';
      svg.setAttribute('preserveAspectRatio', 'none');
    }
  }

  let activeZone = null; // 'colegios' | 'canada' | 'emisora' | null

  function setActiveZone(zone) {
    activeZone = null;
    document.querySelectorAll('.blob-path').forEach(el => el.classList.remove('is-zone-active'));
    if (interactiveLogoEl) {
      interactiveLogoEl.classList.remove('focus-colegios', 'focus-canada', 'focus-emisora');
    }
  }

  function bindHotspotEvents() {
    hotspotButtons.forEach(btn => {
      const section = btn.getAttribute('data-section') || btn.id;

      // Magnetic hover snapping to card pointing landmarks
      btn.addEventListener('mouseenter', () => {
        isHoveringCard = true;
        if (currentMode === 'interactive') {
          if (section === 'Colegios') {
            targetPointingProgress = 65 / (TOTAL_POINTING_FRAMES - 1); // Frame 65: Señalando Colegio
          } else if (section === 'Canadá') {
            targetPointingProgress = 138 / (TOTAL_POINTING_FRAMES - 1); // Frame 138: Señalando Canadá
          } else if (section === 'Emisora') {
            targetPointingProgress = 195 / (TOTAL_POINTING_FRAMES - 1); // Frame 195: Señalando Emisora
          }
          startPointingLoop();
        }
      });

      btn.addEventListener('mouseleave', () => {
        isHoveringCard = false;
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log(`Lámina ${section} seleccionada: Redirigiendo al inicio`);
        if (typeof window.switchWorld === 'function') {
          window.switchWorld('inicio');
        } else if (window.lenisInstance && typeof window.lenisInstance.scrollTo === 'function') {
          window.lenisInstance.scrollTo(0, { immediate: false, duration: 1.2 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     STORY PHRASES SYNCHRONIZER (VIDEO 1)
     -------------------------------------------------------------------------- */
  function updateStoryPhrases(progress) {
    if (!storyPhraseElements || storyPhraseElements.length === 0) return;

    let activeStep = 0;

    storyPhraseElements.forEach(({ el, cfg }) => {
      if (!el) return;

      if (progress < cfg.start || progress > cfg.end) {
        if (el.style.visibility !== 'hidden') {
          el.style.opacity = '0';
          el.style.transform = 'translateY(6px) scale(0.98)';
          el.style.filter = 'none';
          el.style.visibility = 'hidden';
        }
        return;
      }

      let opacity = 0;
      let translateY = 0;
      let scale = 1;
      let blur = 0;

      if (progress < cfg.peakStart) {
        // Suave entrada sutil
        const t = (progress - cfg.start) / (cfg.peakStart - cfg.start);
        opacity = t * t * (3 - 2 * t);
        translateY = (1 - t) * 6;
        scale = 0.98 + t * 0.02;
        blur = (1 - t) * 2;
      } else if (progress <= cfg.peakEnd) {
        // Meseta de máxima presencia y permanencia
        opacity = 1;
        translateY = 0;
        scale = 1;
        blur = 0;
        activeStep = cfg.stepIndex;
      } else {
        // Suave salida con disolución
        const t = (progress - cfg.peakEnd) / (cfg.end - cfg.peakEnd);
        opacity = 1 - (t * t * (3 - 2 * t));
        translateY = -t * 6;
        scale = 1 - t * 0.02;
        blur = t * 2;
      }

      el.style.visibility = 'visible';
      el.style.opacity = opacity.toFixed(3);
      el.style.transform = `translateY(${translateY.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      el.style.filter = blur > 0.1 ? `blur(${blur.toFixed(1)}px)` : 'none';
    });

    // Actualizar barras de progreso (dots)
    if (storyDotElements && storyDotElements.length > 0) {
      storyDotElements.forEach((dot, idx) => {
        if (idx + 1 === activeStep) {
          dot.classList.add('is-active');
        } else {
          dot.classList.remove('is-active');
        }
      });
    }

    // Tono como de sombra ambiental activado dinámicamente cuando hay frase visible
    const ambientGlow = document.getElementById('story-ambient-glow');
    if (ambientGlow) {
      ambientGlow.style.opacity = activeStep > 0 ? '0.95' : '0';
    }
  }

  /* --------------------------------------------------------------------------
     FRAME LOADERS
     -------------------------------------------------------------------------- */
  function loadScrollFrame(i, onLoaded) {
    if (i < 1 || i > TOTAL_SCROLL_FRAMES) return null;
    if (scrollImages[i]) return scrollImages[i];

    const img = new Image();
    const numStr = String(i).padStart(4, '0');
    img.src = `${SCROLL_FRAMES_DIR}/frame_${numStr}.webp${SCROLL_FRAMES_VERSION}`;
    img.onload = () => {
      if (typeof onLoaded === 'function') onLoaded(i);
      if (targetScrollFrame === i || Math.abs(i - targetScrollFrame) <= 2) {
        if (currentMode === 'scroll') drawScrollFrame(targetScrollFrame);
      }
    };
    scrollImages[i] = img;
    return img;
  }

  function prioritizeNearbyScrollFrames(targetFrame) {
    for (let delta = -4; delta <= 4; delta++) {
      const f = targetFrame + delta;
      if (f >= 1 && f <= TOTAL_SCROLL_FRAMES && !scrollImages[f]) {
        loadScrollFrame(f);
      }
    }
  }

  function loadPointingFrame(i, onLoaded) {
    if (i < 1 || i > TOTAL_POINTING_FRAMES) return null;
    if (pointingImages[i]) return pointingImages[i];

    const img = new Image();
    const numStr = String(i).padStart(4, '0');
    img.src = `${POINTING_FRAMES_DIR}/frame_${numStr}.webp${POINTING_FRAMES_VERSION}`;
    img.onload = () => {
      if (typeof onLoaded === 'function') onLoaded(i);
      if (currentMode === 'interactive' && targetPointingFrame === i) {
        drawPointingFrame(i);
      }
    };
    pointingImages[i] = img;
    return img;
  }

  function getNearestLoadedPointingFrame(idx) {
    if (pointingImages[idx] && pointingImages[idx].complete && pointingImages[idx].naturalWidth > 0) {
      return pointingImages[idx];
    }
    for (let off = 1; off < TOTAL_POINTING_FRAMES; off++) {
      const lo = pointingImages[idx - off];
      if (lo && lo.complete && lo.naturalWidth > 0) return lo;
      const hi = pointingImages[idx + off];
      if (hi && hi.complete && hi.naturalWidth > 0) return hi;
    }
    if (pointingImages[1] && pointingImages[1].complete && pointingImages[1].naturalWidth > 0) {
      return pointingImages[1];
    }
    if (scrollImages[TOTAL_SCROLL_FRAMES] && scrollImages[TOTAL_SCROLL_FRAMES].complete && scrollImages[TOTAL_SCROLL_FRAMES].naturalWidth > 0) {
      return scrollImages[TOTAL_SCROLL_FRAMES];
    }
    return null;
  }

  function preloadAllSequences() {
    // 1. Immediately paint frame 1 of scroll
    const f1 = loadScrollFrame(1, () => {
      if (!hasPaintedFrame) drawScrollFrame(1);
    });
    if (f1 && f1.complete && f1.naturalWidth > 0) {
      drawScrollFrame(1);
    }

    // 2. Preload Milestone frames for scroll sequence
    SCROLL_MILESTONES.forEach(idx => loadScrollFrame(idx));

    // 3. Preload Milestone frames for pointing sequence
    POINTING_MILESTONES.forEach(idx => loadPointingFrame(idx));

    // 4. Fast stream remaining scroll frames
    let curScroll = 2;
    function streamScroll() {
      const CHUNK = 6;
      let count = 0;
      while (curScroll <= TOTAL_SCROLL_FRAMES && count < CHUNK) {
        if (!scrollImages[curScroll]) {
          loadScrollFrame(curScroll);
          count++;
        }
        curScroll++;
      }
      if (curScroll <= TOTAL_SCROLL_FRAMES) {
        setTimeout(streamScroll, 15);
      } else {
        // Once scroll is streamed, stream pointing frames in background
        setTimeout(streamPointing, 20);
      }
    }

    // 5. Fast stream remaining pointing frames
    let curPointing = 2;
    function streamPointing() {
      const CHUNK = 8;
      let count = 0;
      while (curPointing <= TOTAL_POINTING_FRAMES && count < CHUNK) {
        if (!pointingImages[curPointing]) {
          loadPointingFrame(curPointing);
          count++;
        }
        curPointing++;
      }
      if (curPointing <= TOTAL_POINTING_FRAMES) {
        setTimeout(streamPointing, 20);
      }
    }

    setTimeout(streamScroll, 30);
  }

  /* --------------------------------------------------------------------------
     CANVAS DRAWING ENGINE
     -------------------------------------------------------------------------- */
  function renderImageToCanvas(img) {
    if (!canvas || !ctx || !img) return false;

    const cW = canvas.width;
    const cH = canvas.height;
    const iW = img.naturalWidth || 1280;
    const iH = img.naturalHeight || 720;

    const scale = Math.max(cW / iW, cH / iH);
    const dW = iW * scale;
    const dH = iH * scale;
    const dX = (cW - dW) * 0.5;
    const dY = (cH - dH) * 0.5;

    ctx.drawImage(img, dX, dY, dW, dH);
    hasPaintedFrame = true;
    return true;
  }

  function drawScrollFrame(frameIndex) {
    const idx = Math.min(TOTAL_SCROLL_FRAMES, Math.max(1, frameIndex));
    loadScrollFrame(idx);

    let img = scrollImages[idx];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let off = 1; off < TOTAL_SCROLL_FRAMES; off++) {
        const lo = scrollImages[idx - off];
        if (lo && lo.complete && lo.naturalWidth > 0) { img = lo; break; }
        const hi = scrollImages[idx + off];
        if (hi && hi.complete && hi.naturalWidth > 0) { img = hi; break; }
      }
      if (!img && scrollImages[1] && scrollImages[1].complete) {
        img = scrollImages[1];
      }
    }

    if (img && img.complete && img.naturalWidth > 0) {
      renderImageToCanvas(img);
      lastDrawnType = 'scroll';
      lastDrawnIndex = idx;
      return true;
    }
    return false;
  }

  function drawPointingFrame(frameIndex) {
    const idx = Math.min(TOTAL_POINTING_FRAMES, Math.max(1, frameIndex));
    loadPointingFrame(idx);

    const img = getNearestLoadedPointingFrame(idx);
    if (img && img.complete && img.naturalWidth > 0) {
      renderImageToCanvas(img);
      lastDrawnType = 'pointing';
      lastDrawnIndex = idx;
      return true;
    }
    return false;
  }



  /* --------------------------------------------------------------------------
     3D INTERACTIVE LOGO ENGINE (SCROLL + 3D TILT + PORTAL RESONANCE)
     -------------------------------------------------------------------------- */
  let interactiveLogoEl = null;
  let logo3dWrapperEl = null;
  let isLogoInteractiveEnabled = true;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;
  let scrollLevitation = 0;
  let scrollRotateY = 0;
  let scrollScale = 1;
  let currentLogoShiftProgress = 0.0;
  let targetLogoShiftProgress = 0.0;
  let isTiltLoopRunning = false;

  function initInteractiveLogo() {
    interactiveLogoEl = document.getElementById('inicio-interactive-logo');
    logo3dWrapperEl = document.getElementById('logo-3d-wrapper');

    if (!interactiveLogoEl || !logo3dWrapperEl) return;

    // Click effect (Squash & stretch bounce)
    interactiveLogoEl.addEventListener('click', (e) => {
      e.stopPropagation();
      logo3dWrapperEl.classList.remove('is-clicked');
      void logo3dWrapperEl.offsetWidth; // trigger reflow
      logo3dWrapperEl.classList.add('is-clicked');
    });

    if (!isTiltLoopRunning) {
      isTiltLoopRunning = true;
      requestAnimationFrame(updateLogoPhysicsLoop);
    }
  }

  function updateLogoPhysicsLoop() {
    if (isLogoInteractiveEnabled && logo3dWrapperEl) {
      // Lerp mouse tilt
      currentTiltX += (targetTiltX - currentTiltX) * 0.1;
      currentTiltY += (targetTiltY - currentTiltY) * 0.1;

      // Lerp logo displacement to top-left corner (1s before 2nd video)
      const shiftDiff = targetLogoShiftProgress - currentLogoShiftProgress;
      currentLogoShiftProgress += shiftDiff * 0.15;
      if (Math.abs(shiftDiff) < 0.0005) {
        currentLogoShiftProgress = targetLogoShiftProgress;
      }

      // 1. Move & scale the outer container to top-left corner
      if (interactiveLogoEl && hotspotsLayer) {
        const dW = hotspotsLayer.clientWidth || 1280;
        const dH = hotspotsLayer.clientHeight || 720;
        // From center-sky to top-left with comfortable margins
        const tx = (-0.425 * dW * currentLogoShiftProgress).toFixed(2);
        const ty = (-0.035 * dH * currentLogoShiftProgress).toFixed(2);
        const s = (1.0 - 0.50 * currentLogoShiftProgress).toFixed(4);
        interactiveLogoEl.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`;
      }

      // 2. Combine Scroll Levitation + Mouse Tilt + 3D Perspective Rotation
      const tiltDamp = Math.max(0.45, 1 - currentLogoShiftProgress * 0.5);
      const totalRotY = (scrollRotateY + currentTiltX * 18 * tiltDamp).toFixed(2);
      const totalRotX = (-currentTiltY * 14 * tiltDamp).toFixed(2);
      const totalTransY = (scrollLevitation + currentTiltY * 6 * tiltDamp).toFixed(2);
      const totalTransZ = (Math.abs(currentTiltX) * 15 + Math.abs(currentTiltY) * 15).toFixed(2);

      logo3dWrapperEl.style.transform = `translateY(${totalTransY}px) translateZ(${totalTransZ}px) rotateY(${totalRotY}deg) rotateX(${totalRotX}deg) scale(${scrollScale.toFixed(3)})`;
    }
    requestAnimationFrame(updateLogoPhysicsLoop);
  }

  window.toggleInteractiveLogo = function () {
    isLogoInteractiveEnabled = !isLogoInteractiveEnabled;
    const btn = document.getElementById('btn-toggle-logo-test');
    const status = document.getElementById('logo-test-status');
    const beams = document.getElementById('logo-energy-beams');

    if (interactiveLogoEl) {
      if (isLogoInteractiveEnabled) {
        interactiveLogoEl.classList.remove('is-hidden');
        if (beams) beams.style.display = '';
        if (btn) btn.classList.remove('is-off');
        if (status) status.textContent = 'ON';
      } else {
        interactiveLogoEl.classList.add('is-hidden');
        if (beams) beams.style.display = 'none';
        if (btn) btn.classList.add('is-off');
        if (status) status.textContent = 'OFF';
      }
    }
  };

  /* --------------------------------------------------------------------------
     POINTING VIDEO & MOUSE SCRUBBING ENGINE (WOMAN_POINTING 240 FRAMES)
     -------------------------------------------------------------------------- */
  function startPointingLoop() {
    if (isPointingLoopRunning) return;
    isPointingLoopRunning = true;
    requestAnimationFrame(pointingRenderLoop);
  }

  function pointingRenderLoop() {
    if (currentMode !== 'interactive') {
      isPointingLoopRunning = false;
      return;
    }

    const diff = targetPointingProgress - currentPointingProgress;
    currentPointingProgress += diff * 0.12;

    const targetFrame = Math.min(TOTAL_POINTING_FRAMES, Math.max(1, Math.round(1 + currentPointingProgress * (TOTAL_POINTING_FRAMES - 1))));

    if (targetFrame !== lastDrawnIndex || lastDrawnType !== 'pointing') {
      currentPointingFrame = targetFrame;
      drawPointingFrame(targetFrame);
    }

    if (Math.abs(diff) > 0.001) {
      requestAnimationFrame(pointingRenderLoop);
    } else {
      isPointingLoopRunning = false;
    }
  }

  /* --------------------------------------------------------------------------
     SCROLL & MOUSE INTERACTION LOGIC
     -------------------------------------------------------------------------- */
  function onScroll() {
    if (window.currentWorld !== 'inicio' && window.currentWorld) return;
    if (!scrollWrapper) return;

    const rect = scrollWrapper.getBoundingClientRect();
    const maxScroll = scrollWrapper.offsetHeight - window.innerHeight;
    if (maxScroll <= 0) return;

    const progress = Math.max(0, Math.min(1, -rect.top / maxScroll));

    // Sync narrative phrases with scroll progress
    updateStoryPhrases(progress);

    // Transition logo to top-left 1 second before the 2nd video starts (progress 0.74 -> 0.94)
    const LOGO_SHIFT_START = 0.74;
    const LOGO_SHIFT_END = 0.94;
    if (progress <= LOGO_SHIFT_START) {
      targetLogoShiftProgress = 0.0;
    } else if (progress >= LOGO_SHIFT_END) {
      targetLogoShiftProgress = 1.0;
    } else {
      const t = (progress - LOGO_SHIFT_START) / (LOGO_SHIFT_END - LOGO_SHIFT_START);
      targetLogoShiftProgress = t * t * (3 - 2 * t);
    }

    // Dynamic 3D Scroll Reactivity for S-cool Logo (dampened when moving to top-left corner)
    const calmFactor = Math.max(0, 1 - targetLogoShiftProgress);
    scrollLevitation = Math.sin(progress * Math.PI) * -18 * calmFactor;
    scrollRotateY = (progress - 0.5) * 16 * calmFactor;
    scrollScale = 1 + Math.sin(progress * Math.PI * 4) * 0.035 * calmFactor;

    const SCROLL_END_THRESHOLD = 0.94;

    if (progress >= SCROLL_END_THRESHOLD) {
      targetScrollFrame = TOTAL_SCROLL_FRAMES;
      // ENTER INTERACTIVE MODE (Hotspots active on floating cards + pointing video active)
      if (currentMode !== 'interactive') {
        currentMode = 'interactive';
        if (pointingMessage) pointingMessage.classList.add('is-visible');
        if (hotspotsLayer) hotspotsLayer.classList.add('is-active');
        startPointingLoop();
      }
      if (!isPointingLoopRunning && lastDrawnType !== 'pointing') {
        drawPointingFrame(currentPointingFrame);
      }
    } else {
      // SCROLL STORYTELLING MODE (Video 1 clean narrative)
      if (currentMode !== 'scroll') {
        currentMode = 'scroll';
        isPointingLoopRunning = false;
        if (pointingMessage) pointingMessage.classList.remove('is-visible');
        if (hotspotsLayer) hotspotsLayer.classList.remove('is-active');
        setActiveZone(null);
      }

      const scrollRatio = Math.max(0, Math.min(1, progress / SCROLL_END_THRESHOLD));
      const targetFrame = Math.min(TOTAL_SCROLL_FRAMES, Math.max(1, Math.round(1 + scrollRatio * (TOTAL_SCROLL_FRAMES - 1))));
      targetScrollFrame = targetFrame;
      prioritizeNearbyScrollFrames(targetFrame);
      drawScrollFrame(targetFrame);
    }
  }

  function onMouseMove(e) {
    // 3D Magnetic Tilt tracking (continuous)
    const xRatio = (e.clientX / window.innerWidth - 0.5) * 2;
    const yRatio = (e.clientY / window.innerHeight - 0.5) * 2;
    targetTiltX = Math.max(-1, Math.min(1, xRatio));
    targetTiltY = Math.max(-1, Math.min(1, yRatio));

    // Pointing animation scrubbing via mouse horizontal position (Left to Right)
    if (currentMode === 'interactive' && !isHoveringCard) {
      const margin = window.innerWidth * 0.04;
      const effectiveW = Math.max(1, window.innerWidth - margin * 2);
      const clampedX = Math.max(0, Math.min(effectiveW, e.clientX - margin));
      targetPointingProgress = clampedX / effectiveW;
      startPointingLoop();
    }
  }

  function resetPointingToNeutral() {
    targetTiltX = 0;
    targetTiltY = 0;
    isHoveringCard = false;
    setActiveZone(null);
    if (currentMode === 'interactive') {
      targetPointingProgress = 0.0;
      startPointingLoop();
    }
  }

  function bindEvents() {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', resetPointingToNeutral, { passive: true });
    window.addEventListener('blur', resetPointingToNeutral, { passive: true });

    // Touch support for tablets/mobile
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        onMouseMove(e.touches[0]);
      }
    }, { passive: true });
    window.addEventListener('touchend', resetPointingToNeutral, { passive: true });

    if (window.lenisInstance) {
      window.lenisInstance.on('scroll', onScroll);
    } else {
      const checkLenis = setInterval(() => {
        if (window.lenisInstance) {
          window.lenisInstance.on('scroll', onScroll);
          clearInterval(checkLenis);
        }
      }, 100);
    }
  }

  // World Lifecycle Hooks
  window.onInicioActivated = function () {
    if (!canvas) initElements();
    resizeCanvas();
    onScroll();
  };

  window.onInicioDeactivated = function () {
    currentMode = 'scroll';
    isPointingLoopRunning = false;
    targetLogoShiftProgress = 0.0;
    currentLogoShiftProgress = 0.0;
    if (pointingMessage) pointingMessage.classList.remove('is-visible');
    if (hotspotsLayer) hotspotsLayer.classList.remove('is-active');
    updateStoryPhrases(0);
  };

  /* --------------------------------------------------------------------------
     STORY STYLE SWITCHER (LIVE PREVIEW OF STYLES)
     -------------------------------------------------------------------------- */
  window.setStoryStyle = function (style) {
    const validStyles = ['editorial', 'minimal', 'glass', 'trailer'];
    const chosen = validStyles.includes(style) ? style : 'editorial';

    const phrasesEl = document.getElementById('inicio-story-phrases');
    if (phrasesEl) {
      validStyles.forEach(s => phrasesEl.classList.remove(`style-${s}`));
      phrasesEl.classList.add(`style-${chosen}`);
      phrasesEl.setAttribute('data-story-style', chosen);
    }

    try {
      localStorage.setItem('scool_story_style', chosen);
    } catch (e) {}
  };

  window._inicioDebug = {
    getMode: () => currentMode,
    getLastDrawnFrame: () => lastDrawnIndex,
    getLastType: () => lastDrawnType,
    getLogoShiftProgress: () => currentLogoShiftProgress,
    drawScrollFrame,
    drawPointingFrame,
    setPointingProgress: (p) => {
      currentMode = 'interactive';
      targetPointingProgress = p;
      startPointingLoop();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initElements);
  } else {
    initElements();
  }
})();
