/* ==========================================================================
   CHARACTER TRACKER • 2.5D INTERACTIVE PUPPET (HEAD & EYES TRACKING)
   Ultra-smooth LERP inertia, organic eye saccade, and subtle 3D head pivot
   ========================================================================== */

(function () {
  'use strict';

  // Configuration limits
  const CONFIG = {
    // Eye max displacement in scene pixels
    maxEyeX: 10.0,
    maxEyeY: 6.0,
    // Head rotation limits in degrees
    maxHeadRotZ: 4.5,   // subtle tilt sideways
    maxHeadRotY: 5.5,   // yaw (looking left/right with 3D perspective)
    maxHeadRotX: 3.5,   // pitch (looking up/down)
    // Head subtle parallax translation
    maxHeadTransX: 3.0,
    maxHeadTransY: 2.0,
    // LERP smoothing rates
    eyeLerp: 0.10,      // eyes move slightly quicker
    headLerp: 0.055,    // head has gentle physical inertia
    // Base scene aspect ratio (1672 x 941 ~ 16:9)
    sceneWidth: 1672,
    sceneHeight: 941,
    sceneAspect: 1672 / 941,
    // Neck pivot in scene percentage
    pivotX: '33.91%',
    pivotY: '62.91%'
  };

  // State
  let target = {
    nx: 0,
    ny: 0,
    eyeX: 0,
    eyeY: 0,
    headRotZ: 0,
    headRotY: 0,
    headRotX: 0,
    headTransX: 0,
    headTransY: 0
  };

  let current = {
    eyeX: 0,
    eyeY: 0,
    headRotZ: 0,
    headRotY: 0,
    headRotX: 0,
    headTransX: 0,
    headTransY: 0
  };

  let containers = [];
  let headElements = [];
  let eyesElements = [];
  let hudEyes = null;
  let hudHead = null;
  let isRunning = false;
  let isMouseActive = false;
  let returnTimeout = null;

  function initTracker() {
    findDOMElements();
    updateLayout();
    bindEvents();
    startRenderLoop();
  }

  function findDOMElements() {
    containers = Array.from(document.querySelectorAll('.puppet-container, #inicio-puppet-stage .puppet-container, .inicio-puppet-container'));
    headElements = Array.from(document.querySelectorAll('.puppet-head-group, #puppet-head'));
    eyesElements = Array.from(document.querySelectorAll('.puppet-eyes-mover, #puppet-eyes'));

    hudEyes = document.getElementById('val-eyes');
    hudHead = document.getElementById('val-head');

    // Ensure proper pivot on all head elements
    headElements.forEach(el => {
      el.style.transformOrigin = `${CONFIG.pivotX} ${CONFIG.pivotY}`;
      el.style.transformStyle = 'preserve-3d';
      el.style.willChange = 'transform';
    });

    eyesElements.forEach(el => {
      el.style.willChange = 'transform';
    });
  }

  // Ensures containers cover their parent exactly without aspect distortion
  function updateLayout() {
    containers.forEach(container => {
      const parent = container.parentElement;
      if (!parent) return;

      const pW = parent.clientWidth || window.innerWidth;
      const pH = parent.clientHeight || window.innerHeight;
      if (pW === 0 || pH === 0) return;

      let w, h, left, top;
      if (pW / pH > CONFIG.sceneAspect) {
        // Parent is wider than 16:9
        w = pW;
        h = pW / CONFIG.sceneAspect;
        left = 0;
        top = (pH - h) * 0.5;
      } else {
        // Parent is taller than 16:9
        h = pH;
        w = pH * CONFIG.sceneAspect;
        top = 0;
        left = (pW - w) * 0.5;
      }

      container.style.position = 'absolute';
      container.style.width = Math.round(w) + 'px';
      container.style.height = Math.round(h) + 'px';
      container.style.left = Math.round(left) + 'px';
      container.style.top = Math.round(top) + 'px';
      container.style.transformOrigin = 'center center';
    });
  }

  function onMouseMove(e) {
    isMouseActive = true;
    if (returnTimeout) clearTimeout(returnTimeout);

    // Normalize cursor from screen center: -1.0 (left/top) to +1.0 (right/bottom)
    const winW = window.innerWidth || 1;
    const winH = window.innerHeight || 1;
    const nx = Math.max(-1, Math.min(1, (e.clientX / winW - 0.5) * 2));
    const ny = Math.max(-1, Math.min(1, (e.clientY / winH - 0.5) * 2));

    target.nx = nx;
    target.ny = ny;

    // Calculate target movements
    target.eyeX = nx * CONFIG.maxEyeX;
    target.eyeY = ny * CONFIG.maxEyeY;

    target.headRotZ = nx * CONFIG.maxHeadRotZ;
    target.headRotY = nx * CONFIG.maxHeadRotY;
    target.headRotX = -ny * CONFIG.maxHeadRotX; // Looking up tilts head backward
    target.headTransX = nx * CONFIG.maxHeadTransX;
    target.headTransY = ny * CONFIG.maxHeadTransY;

    // Wake up render loop if stopped
    if (!isRunning) startRenderLoop();
  }

  function resetToNeutral() {
    target.nx = 0;
    target.ny = 0;
    target.eyeX = 0;
    target.eyeY = 0;
    target.headRotZ = 0;
    target.headRotY = 0;
    target.headRotX = 0;
    target.headTransX = 0;
    target.headTransY = 0;
    if (!isRunning) startRenderLoop();
  }

  function onMouseLeave() {
    isMouseActive = false;
    resetToNeutral();
  }

  function bindEvents() {
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave, { passive: true });
    window.addEventListener('blur', resetToNeutral, { passive: true });
    window.addEventListener('resize', () => {
      findDOMElements();
      updateLayout();
    }, { passive: true });

    // Touch support for tablets/mobile
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        onMouseMove(e.touches[0]);
      }
    }, { passive: true });
    window.addEventListener('touchend', resetToNeutral, { passive: true });
  }

  function renderFrame() {
    // LERP interpolate current towards target
    current.eyeX += (target.eyeX - current.eyeX) * CONFIG.eyeLerp;
    current.eyeY += (target.eyeY - current.eyeY) * CONFIG.eyeLerp;

    current.headRotZ += (target.headRotZ - current.headRotZ) * CONFIG.headLerp;
    current.headRotY += (target.headRotY - current.headRotY) * CONFIG.headLerp;
    current.headRotX += (target.headRotX - current.headRotX) * CONFIG.headLerp;

    current.headTransX += (target.headTransX - current.headTransX) * CONFIG.headLerp;
    current.headTransY += (target.headTransY - current.headTransY) * CONFIG.headLerp;

    // Apply head transform with 3D perspective
    const headTransform = `translate3d(${current.headTransX.toFixed(2)}px, ${current.headTransY.toFixed(2)}px, 0) perspective(900px) rotateX(${current.headRotX.toFixed(2)}deg) rotateY(${current.headRotY.toFixed(2)}deg) rotateZ(${current.headRotZ.toFixed(2)}deg)`;
    for (let i = 0; i < headElements.length; i++) {
      headElements[i].style.transform = headTransform;
    }

    // Apply eye transform (planar translation within the eye sockets)
    const eyeTransform = `translate3d(${current.eyeX.toFixed(2)}px, ${current.eyeY.toFixed(2)}px, 0)`;
    for (let i = 0; i < eyesElements.length; i++) {
      eyesElements[i].style.transform = eyeTransform;
    }

    // Update HUD if present
    if (hudEyes) {
      hudEyes.textContent = `${current.eyeX.toFixed(1)}px, ${current.eyeY.toFixed(1)}px`;
    }
    if (hudHead) {
      hudHead.textContent = `${current.headRotY.toFixed(1)}° (Z: ${current.headRotZ.toFixed(1)}°)`;
    }

    // Check if still moving or arrived at rest
    const delta = Math.abs(target.eyeX - current.eyeX) +
                  Math.abs(target.eyeY - current.eyeY) +
                  Math.abs(target.headRotZ - current.headRotZ) +
                  Math.abs(target.headRotY - current.headRotY);

    if (delta > 0.005 || isMouseActive) {
      requestAnimationFrame(renderFrame);
      isRunning = true;
    } else {
      isRunning = false;
    }
  }

  function startRenderLoop() {
    if (isRunning) return;
    isRunning = true;
    requestAnimationFrame(renderFrame);
  }

  // Public API
  window.CharacterTracker = {
    init: initTracker,
    refresh: () => {
      findDOMElements();
      updateLayout();
      startRenderLoop();
    },
    setTarget: (nx, ny) => {
      target.nx = nx;
      target.ny = ny;
      target.eyeX = nx * CONFIG.maxEyeX;
      target.eyeY = ny * CONFIG.maxEyeY;
      target.headRotZ = nx * CONFIG.maxHeadRotZ;
      target.headRotY = nx * CONFIG.maxHeadRotY;
      target.headRotX = -ny * CONFIG.maxHeadRotX;
      target.headTransX = nx * CONFIG.maxHeadTransX;
      target.headTransY = ny * CONFIG.maxHeadTransY;
      startRenderLoop();
    },
    reset: resetToNeutral,
    getState: () => ({ current, target })
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTracker);
  } else {
    initTracker();
  }
})();
