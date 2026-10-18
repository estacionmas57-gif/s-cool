/* ==========================================================================
   SYNAPSE • MULTIVERSE SHIFT & 3D LOGO CHROMATIC ENGINE
   - Smooth Hero Character Canvas Fading on Scroll
   - Instantaneous World Shift ("Cambio de mundo por un instante")
   - Chromatic Light Flash + Atmospheric Warp + Real-time 3D Logo Color Lerp
   ========================================================================== */

(function () {
  let currentUniverse = 'default';
  let isShifting = false;
  let flashTimeout = null;

  const UNIVERSE_CONFIGS = {
    default: {
      name: 'Mainframe Base',
      title: 'MAINFRAME A.R.I.A HERO',
      badge: 'Agencia Creativa 3D',
      icon: '✳︎',
      themeKey: 'default',
      flashColor: 'rgba(255, 255, 255, 0.45)',
      ambientBg: 'radial-gradient(circle at 50% 25%, #162E3B 0%, #0E1A24 45%, #070B10 100%)',
      glowColor: '#00F0FF',
      freq: 440
    },
    tef: {
      name: 'ÉLAN TEF Canada',
      title: 'DIMENSIÓN 01: ÉLAN TEF • MONTRÉAL & OTTAWA',
      badge: 'FRANCÉS MIGRATORIO • NCLC 7+',
      icon: '🍁',
      themeKey: 'tef',
      flashColor: 'radial-gradient(circle, rgba(225, 29, 72, 0.92) 0%, rgba(245, 158, 11, 0.65) 50%, rgba(0, 0, 0, 0) 100%)',
      ambientBg: 'radial-gradient(ellipse at 50% 30%, rgba(225, 29, 72, 0.35) 0%, rgba(245, 158, 11, 0.15) 35%, #0D0A14 75%, #07060A 100%)',
      glowColor: '#E11D48',
      freq: 580
    },
    ielts: {
      name: 'APEX IELTS Academic',
      title: 'DIMENSIÓN 02: APEX IELTS • LONDON & CAMBRIDGE',
      badge: 'INGLÉS INTERNACIONAL • BAND 8.5',
      icon: '🇬🇧',
      themeKey: 'ielts',
      flashColor: 'radial-gradient(circle, rgba(37, 99, 235, 0.92) 0%, rgba(6, 182, 212, 0.70) 50%, rgba(0, 0, 0, 0) 100%)',
      ambientBg: 'radial-gradient(ellipse at 50% 30%, rgba(37, 99, 235, 0.38) 0%, rgba(6, 182, 212, 0.18) 35%, #080F1D 75%, #040810 100%)',
      glowColor: '#2563EB',
      freq: 640
    },
    vector: {
      name: 'VECTOR 11 Saber Pro',
      title: 'DIMENSIÓN 03: VECTOR 11 • SALÓN 3D & PREICFES',
      badge: 'ALTO RENDIMIENTO • PUNTAJE 400+',
      icon: '⚡',
      themeKey: 'vector',
      flashColor: 'radial-gradient(circle, rgba(16, 185, 129, 0.92) 0%, rgba(132, 204, 22, 0.70) 50%, rgba(0, 0, 0, 0) 100%)',
      ambientBg: 'radial-gradient(ellipse at 50% 30%, rgba(16, 185, 129, 0.35) 0%, rgba(132, 204, 22, 0.16) 35%, #061510 75%, #030A08 100%)',
      glowColor: '#10B981',
      freq: 520
    },
    morpho: {
      name: 'MORPHO Digital Guides',
      title: 'DIMENSIÓN 04: MORPHO • EDITORIAL DIGITAL VIVA',
      badge: 'GUÍAS ESCOLARES WEB • CERO PAPEL',
      icon: '📖',
      themeKey: 'morpho',
      flashColor: 'radial-gradient(circle, rgba(124, 58, 237, 0.92) 0%, rgba(192, 132, 252, 0.70) 50%, rgba(0, 0, 0, 0) 100%)',
      ambientBg: 'radial-gradient(ellipse at 50% 30%, rgba(124, 58, 237, 0.38) 0%, rgba(192, 132, 252, 0.18) 35%, #100A20 75%, #07040E 100%)',
      glowColor: '#7C3AED',
      freq: 720
    },
    pulse: {
      name: 'PULSE Agenda Virtual 360',
      title: 'DIMENSIÓN 05: PULSE • GESTIÓN & EMISORA EN VIVO',
      badge: 'CONEXIÓN FAMILIAR • RADIO COMUNITARIA',
      icon: '📻',
      themeKey: 'pulse',
      flashColor: 'radial-gradient(circle, rgba(217, 119, 6, 0.92) 0%, rgba(251, 191, 36, 0.70) 50%, rgba(0, 0, 0, 0) 100%)',
      ambientBg: 'radial-gradient(ellipse at 50% 30%, rgba(217, 119, 6, 0.38) 0%, rgba(251, 191, 36, 0.18) 35%, #1C1205 75%, #0E0802 100%)',
      glowColor: '#D97706',
      freq: 490
    }
  };

  /**
   * Triggers the instantaneous world shift
   */
  window.triggerUniverseShift = function (universeKey, isManual = false) {
    if (!UNIVERSE_CONFIGS[universeKey]) return;
    if (currentUniverse === universeKey && !isManual) return;

    currentUniverse = universeKey;
    const config = UNIVERSE_CONFIGS[universeKey];

    // 1. Dynamic 3D Logo Color Shift (smooth Three.js material & light lerp)
    if (typeof window.set3DLogoTheme === 'function') {
      window.set3DLogoTheme(config.themeKey);
    }

    // 2. Instantaneous Chromatic Flash ("Cambio de mundo por un instante")
    const flashEl = document.getElementById('multiverse-chromatic-flash');
    if (flashEl) {
      clearTimeout(flashTimeout);
      flashEl.style.background = config.flashColor;
      flashEl.style.opacity = '0.88';
      flashEl.style.transform = 'scale(1.04)';
      flashEl.classList.add('is-flashing');

      flashTimeout = setTimeout(() => {
        flashEl.style.opacity = '0';
        flashEl.style.transform = 'scale(1.0)';
        flashEl.classList.remove('is-flashing');
      }, 550);
    }

    // 3. Ambient Atmospheric Warp Background
    const warpEl = document.getElementById('multiverse-ambient-warp');
    if (warpEl) {
      warpEl.style.background = config.ambientBg;
      warpEl.setAttribute('data-active-theme', universeKey);
    }

    // 4. Update Multiverse Floating HUD Capsule
    const hudCapsule = document.getElementById('multiverse-hud-capsule');
    if (hudCapsule) {
      if (universeKey === 'default') {
        hudCapsule.classList.remove('is-visible');
      } else {
        hudCapsule.classList.add('is-visible');
        const iconEl = hudCapsule.querySelector('.hud-capsule-icon');
        const titleEl = hudCapsule.querySelector('.hud-capsule-title');
        const badgeEl = hudCapsule.querySelector('.hud-capsule-badge');
        const dotEl = hudCapsule.querySelector('.hud-capsule-dot');

        if (iconEl) iconEl.textContent = config.icon;
        if (titleEl) titleEl.textContent = config.title;
        if (badgeEl) badgeEl.textContent = config.badge;
        if (dotEl) dotEl.style.backgroundColor = config.glowColor;
        hudCapsule.style.borderColor = config.glowColor;
        hudCapsule.style.boxShadow = `0 8px 32px -4px ${config.glowColor}40`;
      }
    }

    // 5. Update Active Universe Selector Pills
    const pills = document.querySelectorAll('.multiverse-nav-pill');
    pills.forEach(p => {
      if (p.getAttribute('data-universe') === universeKey) {
        p.classList.add('is-active');
      } else {
        p.classList.remove('is-active');
      }
    });

    // 6. Highlight Active Stacking Card
    const cards = document.querySelectorAll('#prueba-stacking-deck .stacking-card');
    cards.forEach(card => {
      if (card.getAttribute('data-universe') === universeKey) {
        card.classList.add('is-universe-active');
        card.style.borderColor = `${config.glowColor}66`;
        card.style.boxShadow = `0 20px 50px -10px ${config.glowColor}30, 0 0 25px ${config.glowColor}20`;
      } else {
        card.classList.remove('is-universe-active');
        card.style.borderColor = '';
        card.style.boxShadow = '';
      }
    });

    // 7. High-tech Audio Cue
    if (window.soundFx) {
      if (typeof window.soundFx.playSnap === 'function') {
        window.soundFx.playSnap();
      }
    }
  };

  /**
   * Monitor Scroll in #view-prueba:
   * - Fade hero canvas smoothly as user scrolls down into the cards
   * - Detect which card is currently at the top of the stack and shift world!
   */
  function handlePruebaScroll() {
    if (window.currentWorld !== 'prueba') return;

    const scrollY = window.scrollY || window.pageYOffset || 0;
    const heroCanvas = document.getElementById('mainframe-canvas');
    const heroOverlay = document.querySelector('.mainframe-video-overlay');
    const heroContent = document.querySelector('.mainframe-content-container');
    const heroHint = document.querySelector('.mainframe-scrub-hint');
    const scrollDownCue = document.querySelector('.mainframe-scroll-down-cue');

    // 1. Smooth Hero Character Canvas Fading
    // From 50px to 380px, character canvas fades out so it won't block the cards!
    const fadeRange = 360;
    const fadeProgress = Math.min(1.0, Math.max(0.0, scrollY / fadeRange));

    if (heroCanvas) {
      heroCanvas.style.opacity = (1.0 - fadeProgress * 0.94).toFixed(3);
      heroCanvas.style.pointerEvents = (fadeProgress > 0.8) ? 'none' : 'auto';
    }
    if (heroOverlay) {
      heroOverlay.style.opacity = (1.0 - fadeProgress).toFixed(3);
    }
    if (heroContent) {
      heroContent.style.opacity = (1.0 - fadeProgress * 1.3).toFixed(3);
      heroContent.style.transform = `translateY(-${(fadeProgress * 50).toFixed(1)}px)`;
    }
    if (heroHint) {
      heroHint.style.opacity = (1.0 - fadeProgress * 2.0).toFixed(3);
    }
    if (scrollDownCue) {
      scrollDownCue.style.opacity = (1.0 - fadeProgress * 2.0).toFixed(3);
    }

    // 2. If scrolled back to Hero top, restore base universe
    if (scrollY < 180) {
      if (currentUniverse !== 'default') {
        window.triggerUniverseShift('default');
      }
      return;
    }

    // 3. Stacking Card Focus Detection
    const cards = document.querySelectorAll('#prueba-stacking-deck .stacking-card');
    if (!cards || cards.length === 0) return;

    const triggerLine = window.innerHeight * 0.45;
    let activeCard = null;

    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      // If card top has entered above the trigger line
      if (rect.top <= triggerLine && rect.bottom > 120) {
        activeCard = card;
      }
    });

    if (activeCard) {
      const targetUni = activeCard.getAttribute('data-universe');
      if (targetUni && targetUni !== currentUniverse) {
        window.triggerUniverseShift(targetUni);
      }
    }
  }

  // Smooth Scroll to Card when clicking Universe Pill or Card
  window.navigateToUniverseCard = function (universeKey) {
    window.triggerUniverseShift(universeKey, true);
    const targetCard = document.querySelector(`#prueba-stacking-deck .stacking-card[data-universe="${universeKey}"]`);
    if (targetCard) {
      const offsetTop = targetCard.getBoundingClientRect().top + window.pageYOffset - 120;
      if (window.lenisInstance && typeof window.lenisInstance.scrollTo === 'function') {
        window.lenisInstance.scrollTo(offsetTop, { duration: 1.2 });
      } else {
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    }
  };

  // Attach Listeners
  window.addEventListener('scroll', handlePruebaScroll, { passive: true });

  document.addEventListener('DOMContentLoaded', () => {
    handlePruebaScroll();
  });
})();
