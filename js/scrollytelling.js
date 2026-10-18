/* ==========================================================================
   AURA / SYNAPSE EDU • SCROLLYTELLING ENGINE (5-APP ISOLATED LATERAL STAGE)
   - 5 Applications: ÉLAN TEF, APEX IELTS, VECTOR 11, MORPHO GUIDES, PULSE ACADÉMICO
   - Authentic Frosted Glass with strict autoAlpha & lateral translation
   - Zero Overlapping / Zero Ghosting
   - Synchronized 5 Top Tabs, Left Step Indicators, and Prev/Next Buttons
   ========================================================================== */

window.currentAppIndex = 0;
window.scrollyTriggerInstance = null;
window.heroTriggerInstance = null;

// ==========================================================================
// HERO SECTION: PRISTINE 3D SPHERES LANDING & SEQUENTIAL SCROLL REVEAL
// 1. Initial State (scroll = 0):
//    ONLY the 3D matte spheres canvas and top navigation bar (.app-header) are visible.
// 2. Scroll Phase 1: Left-side brand lead (typography & CTAs) fades and glides in.
// 3. Scroll Phase 2: Right-side suite of 5 frosted app cards dock in ONE BY ONE in sequence.
// 4. Scroll Phase 3: Full composition hold before seamless unpinning into Section 2.
// 5. Reverse Scroll: Cards and typography retract in reverse order back to spheres + navbar.
// ==========================================================================
function initHeroScrollSequence() {
  // Obsolete 4200px pin spacer removed. Hero 3D animation and right accordion
  // are smoothly handled by digital_scool_3d.js and app.js without freezing the page.
  return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const heroSection = document.getElementById('hero');
  const leadEl = document.querySelector('.hero-brand-lead');
  const dockHeader = document.querySelector('.dock-meta-header');
  const cards = [
    document.querySelector('.dock-card-elan'),
    document.querySelector('.dock-card-apex'),
    document.querySelector('.dock-card-vector'),
    document.querySelector('.dock-card-morpho'),
    document.querySelector('.dock-card-pulse')
  ];

  // Floating Kickers Above All Boxes (Style matching left typography)
  const kickerElan = document.querySelector('.kicker-elan');
  const kickerApex = document.querySelector('.kicker-apex');
  const kickerVector = document.querySelector('.kicker-vector');
  const kickerMorpho = document.querySelector('.kicker-morpho');
  const kickerPulse = document.querySelector('.kicker-pulse');

  // Morph elements & Inner Boxes for Card 1 (Élan: France 🇫🇷 FR -> Canada 🇨🇦 CA -> Reveal Élan Box)
  const overlayCanada = document.querySelector('.flag-overlay-canada');
  const flagElanFR = document.querySelector('.flag-elan-fr');
  const flagElanCA = document.querySelector('.flag-elan-ca');
  const contentBoxElan = document.querySelector('.content-box-elan');
  const actionElan = document.querySelector('.action-elan');
  const tagElan = document.querySelector('.tag-elan');

  // Morph elements & Inner Boxes for Card 2 (Apex: USA 🇺🇸 US -> UK 🇬🇧 UK -> Reveal Apex Box)
  const overlayUK = document.querySelector('.flag-overlay-uk');
  const flagApexUS = document.querySelector('.flag-apex-us');
  const flagApexUK = document.querySelector('.flag-apex-uk');
  const contentBoxApex = document.querySelector('.content-box-apex');
  const actionApex = document.querySelector('.action-apex');
  const tagApex = document.querySelector('.tag-apex');

  if (!heroSection || !leadEl) return;

  // Kill prior hero instance if reinitializing
  if (window.heroTriggerInstance) {
    window.heroTriggerInstance.kill();
  }

  // 1. Pristine Initial State (scroll = 0):
  // Frosted glass cards dock visible on the right side matching reference greenoasis composition
  gsap.set(leadEl, { y: 55, opacity: 0, pointerEvents: 'none' });
  if (dockHeader) {
    gsap.set(dockHeader, { y: 0, opacity: 1 });
  }
  cards.forEach(card => {
    if (card) {
      gsap.set(card, { x: 0, opacity: 1, scale: 1, pointerEvents: 'auto' });
    }
  });

  // Floating Kickers: hidden
  if (kickerElan) gsap.set(kickerElan, { opacity: 0, y: -30 });
  if (kickerApex) gsap.set(kickerApex, { opacity: 0, y: -30 });
  if (kickerVector) gsap.set(kickerVector, { opacity: 0, y: -30 });
  if (kickerMorpho) gsap.set(kickerMorpho, { opacity: 0, y: -30 });
  if (kickerPulse) gsap.set(kickerPulse, { opacity: 0, y: -30 });

  // Cards content and actions visible with authentic frosted glass styling
  if (contentBoxElan) gsap.set(contentBoxElan, { opacity: 1, scale: 1, x: 0 });
  if (actionElan) gsap.set(actionElan, { opacity: 1, scale: 1, x: 0 });
  if (contentBoxApex) gsap.set(contentBoxApex, { opacity: 1, scale: 1, x: 0 });
  if (actionApex) gsap.set(actionApex, { opacity: 1, scale: 1, x: 0 });

  // 2. Scrubbed Timeline with Pinned Hero Section
  const heroTL = gsap.timeline({
    scrollTrigger: {
      id: 'heroPinTimeline',
      trigger: heroSection,
      start: 'top top',
      end: '+=4200',
      pin: true,
      scrub: 0.85,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        if (typeof window.setMonolithScrollProgress === 'function') {
          window.setMonolithScrollProgress(p);
        }
        leadEl.style.pointerEvents = p >= 0.08 ? 'auto' : 'none';
        if (cards[0]) cards[0].style.pointerEvents = p >= 0.28 ? 'auto' : 'none';
        if (cards[1]) cards[1].style.pointerEvents = p >= 0.50 ? 'auto' : 'none';
        if (cards[2]) cards[2].style.pointerEvents = p >= 0.60 ? 'auto' : 'none';
        if (cards[3]) cards[3].style.pointerEvents = p >= 0.70 ? 'auto' : 'none';
        if (cards[4]) cards[4].style.pointerEvents = p >= 0.80 ? 'auto' : 'none';
      }
    }
  });

  // Attach hover highlight listeners to dock cards for monolith interaction
  cards.forEach((card, idx) => {
    if (card) {
      card.addEventListener('mouseenter', () => {
        if (typeof window.highlightMonolithBlock === 'function') {
          window.highlightMonolithBlock(idx);
        }
      });
      card.addEventListener('mouseleave', () => {
        if (typeof window.highlightMonolithBlock === 'function') {
          window.highlightMonolithBlock(-1);
        }
      });
    }
  });

  window.heroTriggerInstance = heroTL.scrollTrigger;

  // Phase 1: Left-side brand lead fades and glides in (starts almost immediately on scroll)
  heroTL.to(leadEl, {
    y: 0,
    opacity: 1,
    duration: 0.45,
    ease: 'power2.out'
  }, 0.05);

  // Phase 2: Dock meta header drops and fades in
  if (dockHeader) {
    heroTL.to(dockHeader, {
      y: 0,
      opacity: 1,
      duration: 0.16,
      ease: 'power2.out'
    }, 0.52);
  }

  // ==========================================================================
  // CARD 1: ÉLAN TEF CANADA
  // 1A: Entra con Bandera de Francia 🇫🇷 + rectángulo "FR"
  //     + Flotan letras desde arriba sobre todas las cajas: "DE B1 A B2+ EN 160 DÍAS"
  // 1B: Transiciona a la bandera de Canadá 🇨🇦 (con la auténtica hoja de maple) + "CA"
  //     [IMPORTANTE: Las letras "DE B1 A B2+ EN 160 DÍAS" NO DESAPARECEN AQUÍ, SE MANTIENEN]
  // 1C: Emerge la cajita blanca con el letrero "ÉLAN TEF Canada Francés migratorio..." + flecha
  // 1D: ÚNICAMENTE cuando termine de salir el letrero de Élan, las letras se quitan hacia arriba
  // ==========================================================================

  // 1A: Entra Tarjeta 1 (Francia + FR)
  if (cards[0]) {
    heroTL.to(cards[0], {
      x: 0,
      opacity: 1,
      scale: 1,
      duration: 0.24,
      ease: 'power2.out'
    }, 0.70);
  }

  // 1A: Letras flotantes caen arriba de todas las cajas: "DE B1 A B2+ EN 160 DÍAS"
  if (kickerElan) {
    heroTL.to(kickerElan, {
      y: 0,
      opacity: 1,
      duration: 0.22,
      ease: 'power2.out'
    }, 0.70);
  }

  // 1B: Transforma a Canadá 🇨🇦 (con hoja de maple oficial) + badge "CA"
  // (Durante toda esta transición de banderas, kickerElan PERMANECE 100% VISIBLE)
  if (overlayCanada) {
    heroTL.to(overlayCanada, {
      opacity: 1,
      duration: 0.28,
      ease: 'power2.inOut'
    }, 1.04);
  }
  if (flagElanFR) {
    heroTL.to(flagElanFR, {
      opacity: 0,
      scale: 0.6,
      rotation: -20,
      duration: 0.24,
      ease: 'power2.inOut'
    }, 1.04);
  }
  if (flagElanCA) {
    heroTL.to(flagElanCA, {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 0.24,
      ease: 'power2.inOut'
    }, 1.08);
  }
  if (tagElan) {
    heroTL.to(tagElan, {
      color: '#C8102E',
      backgroundColor: 'rgba(200, 16, 46, 0.14)',
      borderColor: 'rgba(200, 16, 46, 0.32)',
      duration: 0.28,
      ease: 'power2.out'
    }, 1.04);
  }

  // 1C: Emerge la cajita blanca con el nombre "ÉLAN TEF Canada" + flecha
  if (contentBoxElan) {
    heroTL.to(contentBoxElan, {
      opacity: 1,
      scale: 1,
      x: 0,
      duration: 0.24,
      ease: 'back.out(1.2)'
    }, 1.34);
  }
  if (actionElan) {
    heroTL.to(actionElan, {
      opacity: 1,
      scale: 1,
      x: 0,
      duration: 0.22,
      ease: 'back.out(1.2)'
    }, 1.36);
  }

  // 1D: Cuando termine de salir el letrero de Élan TEF Canada (termina a 1.58),
  // se quitan las letras flotantes "DE B1 A B2+ EN 160 DÍAS"
  if (kickerElan) {
    heroTL.to(kickerElan, {
      y: -24,
      opacity: 0,
      duration: 0.20,
      ease: 'power2.in'
    }, 1.62);
  }

  // Pausa antes de la Tarjeta 2
  heroTL.to({}, { duration: 0.08 }, 1.84);

  // ==========================================================================
  // CARD 2: APEX IELTS
  // 2A: Entra con Bandera de Estados Unidos 🇺🇸 + rectángulo "US"
  //     + Flotan letras arriba de todas las cajas: "DE B1 A B2+ EN 166 DÍAS"
  // 2B: Transiciona a la bandera de Reino Unido 🇬🇧 (Union Jack) + "UK"
  //     [IMPORTANTE: Las letras "DE B1 A B2+ EN 166 DÍAS" NO DESAPARECEN AQUÍ, SE MANTIENEN]
  // 2C: Emerge la cajita blanca con el letrero "APEX IELTS" + flecha
  // 2D: ÚNICAMENTE cuando termine de salir el letrero de Apex, las letras se quitan hacia arriba
  // ==========================================================================

  // 2A: Entra Tarjeta 2 (USA + US)
  if (cards[1]) {
    heroTL.to(cards[1], {
      x: 0,
      opacity: 1,
      scale: 1,
      duration: 0.24,
      ease: 'power2.out'
    }, 1.92);
  }

  // 2A: Letras flotantes caen arriba de todas las cajas: "DE B1 A B2+ EN 166 DÍAS"
  if (kickerApex) {
    heroTL.to(kickerApex, {
      y: 0,
      opacity: 1,
      duration: 0.22,
      ease: 'power2.out'
    }, 1.92);
  }

  // 2B: Transforma a Reino Unido 🇬🇧 + badge "UK"
  // (Durante toda esta transición de banderas, kickerApex PERMANECE 100% VISIBLE)
  if (overlayUK) {
    heroTL.to(overlayUK, {
      opacity: 1,
      duration: 0.28,
      ease: 'power2.inOut'
    }, 2.24);
  }
  if (flagApexUS) {
    heroTL.to(flagApexUS, {
      opacity: 0,
      scale: 0.6,
      rotation: -20,
      duration: 0.24,
      ease: 'power2.inOut'
    }, 2.24);
  }
  if (flagApexUK) {
    heroTL.to(flagApexUK, {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 0.24,
      ease: 'power2.inOut'
    }, 2.28);
  }
  if (tagApex) {
    heroTL.to(tagApex, {
      color: '#1E40AF',
      backgroundColor: 'rgba(30, 64, 175, 0.14)',
      borderColor: 'rgba(30, 64, 175, 0.32)',
      duration: 0.28,
      ease: 'power2.out'
    }, 2.24);
  }

  // 2C: Emerge la cajita blanca con el nombre "APEX IELTS" + flecha
  if (contentBoxApex) {
    heroTL.to(contentBoxApex, {
      opacity: 1,
      scale: 1,
      x: 0,
      duration: 0.24,
      ease: 'back.out(1.2)'
    }, 2.54);
  }
  if (actionApex) {
    heroTL.to(actionApex, {
      opacity: 1,
      scale: 1,
      x: 0,
      duration: 0.22,
      ease: 'back.out(1.2)'
    }, 2.56);
  }

  // 2D: Cuando termine de salir el letrero de APEX IELTS (termina a 2.78),
  // se quitan las letras flotantes "DE B1 A B2+ EN 166 DÍAS"
  if (kickerApex) {
    heroTL.to(kickerApex, {
      y: -24,
      opacity: 0,
      duration: 0.20,
      ease: 'power2.in'
    }, 2.82);
  }

  // Pausa antes de Cards 3, 4, 5
  heroTL.to({}, { duration: 0.08 }, 3.04);

  // ==========================================================================
  // CARDS 3, 4, 5: ENTRADA CON COLOR PURO Y LETRAS FLOTANTES ARRIBA DE TODAS LAS CAJAS
  // ==========================================================================

  // Card 3: VECTOR 11 🇨🇴 (ICFES Saber 11 - Verde Esmeralda)
  if (cards[2]) {
    heroTL.to(cards[2], {
      x: 0,
      opacity: 1,
      scale: 1,
      duration: 0.22,
      ease: 'power2.out'
    }, 3.14);
  }
  // Letras flotantes arriba de todas las cajas: "PREPARACIÓN COMPLETA ALTO PUNTAJE"
  if (kickerVector) {
    heroTL.to(kickerVector, {
      y: 0,
      opacity: 1,
      duration: 0.20,
      ease: 'power2.out'
    }, 3.14);
    heroTL.to(kickerVector, {
      y: -20,
      opacity: 0,
      duration: 0.18,
      ease: 'power2.in'
    }, 3.42);
  }

  // Card 4: MORPHO GUIDES 📘 (Azul Índigo)
  if (cards[3]) {
    heroTL.to(cards[3], {
      x: 0,
      opacity: 1,
      scale: 1,
      duration: 0.22,
      ease: 'power2.out'
    }, 3.66);
  }
  // Letras flotantes arriba de todas las cajas: "GUÍAS VIVAS CON AUTOCALIFICACIÓN"
  if (kickerMorpho) {
    heroTL.to(kickerMorpho, {
      y: 0,
      opacity: 1,
      duration: 0.20,
      ease: 'power2.out'
    }, 3.66);
    heroTL.to(kickerMorpho, {
      y: -20,
      opacity: 0,
      duration: 0.18,
      ease: 'power2.in'
    }, 3.94);
  }

  // Card 5: PULSE ACADÉMICO ⚡ (Ámbar Solar - La última)
  if (cards[4]) {
    heroTL.to(cards[4], {
      x: 0,
      opacity: 1,
      scale: 1,
      duration: 0.22,
      ease: 'power2.out'
    }, 4.18);
  }
  // Letras flotantes arriba de todas las cajas: "CONTROL 360° ALERTAS TEMPRANAS"
  if (kickerPulse) {
    heroTL.to(kickerPulse, {
      y: 0,
      opacity: 1,
      duration: 0.20,
      ease: 'power2.out'
    }, 4.18);
    heroTL.to(kickerPulse, {
      y: -20,
      opacity: 0,
      duration: 0.18,
      ease: 'power2.in'
    }, 4.46);
  }

  // Phase 3: Full composition hold before smooth unpinning
  heroTL.to({}, { duration: 0.70 }, 4.68);
}

window.initScrollytelling = function() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Initialize Metrics Telemetry & Conversion animations immediately for Hub
  if (typeof initMetricsTelemetryAnimation === 'function') initMetricsTelemetryAnimation();
  if (typeof initConversionDockAnimation === 'function') initConversionDockAnimation();

  // Only initialize scrolly-showcase pin when Colegios view is visible
  const colegiosView = document.getElementById('view-colegios');
  if (!colegiosView || getComputedStyle(colegiosView).display === 'none') {
    return;
  }

  const section = document.getElementById('scrolly-showcase');
  const cards = [
    document.getElementById('card-vector'),
    document.getElementById('card-pulse'),
    document.getElementById('card-morpho')
  ];

  if (cards.some(c => !c)) return;

  const stepIndicators = document.querySelectorAll('.step-indicator-item');
  const appTabs = document.querySelectorAll('.scrolly-tab-btn');
  const cameraStatusText = document.getElementById('classroom-status-text');

  // Kill prior ScrollTrigger instance if any
  if (window.scrollyTriggerInstance) {
    window.scrollyTriggerInstance.kill();
  }
  gsap.killTweensOf(cards);

  // Helper to get modular pieces of a card
  function getCardPieces(card) {
    if (!card) return null;
    return {
      badge: card.querySelector('.app-badge-tag'),
      title: card.querySelector('h2'),
      phrase: card.querySelector('.app-intent-phrase'),
      desc: card.querySelector('.app-description-body'),
      items: card.querySelectorAll('.app-feature-item'),
      mockup: card.querySelector('.app-card-mockup-wrapper'),
      headerBar: card.querySelector('.mockup-header-bar'),
      metric: card.querySelector('.mockup-metric-highlight'),
      snippet: card.querySelector('.mockup-preview-snippet')
    };
  }

  // Set initial coordinates and absolute visibility isolation
  gsap.set(cards[0], { x: 0, y: 0, scale: 1, autoAlpha: 1, pointerEvents: 'auto', zIndex: 20 });
  for (let i = 1; i < cards.length; i++) {
    gsap.set(cards[i], { x: '100vw', y: 0, scale: 0.98, autoAlpha: 0, pointerEvents: 'none', zIndex: 10 + i });
  }

  // Initial state for Card 0 (Vector Saber 11)
  const p0 = getCardPieces(cards[0]);
  if (p0) {
    gsap.set(p0.badge, { x: -50, y: -30, opacity: 0.2 });
    gsap.set(p0.title, { x: -60, y: -15, opacity: 0.2 });
    gsap.set(p0.phrase, { x: -50, y: 20, opacity: 0.2 });
    gsap.set(p0.desc, { x: -40, y: 25, opacity: 0.2 });
    gsap.set(p0.items, { x: -40, y: 30, opacity: 0.2 });
    gsap.set(p0.mockup, { x: 80, y: 35, scale: 0.92, opacity: 0.25 });
  }

  // Card 0 (Vector Saber 11) Entrance Assembly
  const card0AssembleTL = gsap.timeline({
    scrollTrigger: {
      id: 'card0Assemble',
      trigger: '#scrolly-showcase',
      start: 'top 65%',
      end: 'top top',
      scrub: 0.85,
      invalidateOnRefresh: true
    }
  });

  if (p0) {
    card0AssembleTL.to(p0.badge, { x: 0, y: 0, opacity: 1, duration: 0.75, ease: 'power2.out' }, 0);
    card0AssembleTL.to(p0.title, { x: 0, y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.05);
    card0AssembleTL.to(p0.phrase, { x: 0, y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.1);
    card0AssembleTL.to(p0.desc, { x: 0, y: 0, opacity: 1, duration: 0.85, ease: 'power2.out' }, 0.15);
    card0AssembleTL.to(p0.items, { x: 0, y: 0, opacity: 1, duration: 0.75, stagger: 0.06, ease: 'power2.out' }, 0.18);
    card0AssembleTL.to(p0.mockup, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.85, ease: 'power2.out' }, 0.08);
  }

  function addCardAssemblyStep(timeline, card, label, offset = 0.25) {
    const p = getCardPieces(card);
    if (!p) return;
    if (p.badge) timeline.fromTo(p.badge, { x: -50, y: -30, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, `${label}+=${offset}`);
    if (p.title) timeline.fromTo(p.title, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, `${label}+=${offset + 0.05}`);
    if (p.phrase) timeline.fromTo(p.phrase, { x: -50, y: 20, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, `${label}+=${offset + 0.1}`);
    if (p.desc) timeline.fromTo(p.desc, { x: -40, y: 25, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, `${label}+=${offset + 0.15}`);
    if (p.items && p.items.length) timeline.fromTo(p.items, { x: -45, y: 30, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.75, stagger: 0.06, ease: 'power2.out' }, `${label}+=${offset + 0.2}`);
    if (p.mockup) timeline.fromTo(p.mockup, { y: 40, scale: 0.94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.9, ease: 'power2.out' }, `${label}+=${offset + 0.08}`);
    if (p.metric) timeline.fromTo(p.metric, { y: -30, z: 60, opacity: 0 }, { y: 0, z: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, `${label}+=${offset + 0.2}`);
    if (p.snippet) timeline.fromTo(p.snippet, { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, `${label}+=${offset + 0.25}`);
  }

  // Master Scrollytelling Scrub Timeline for 3D Classroom (Colegios Track)
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#scrolly-showcase',
      start: 'top top',
      end: '+=4500',
      pin: '#scrolly-pin-container',
      scrub: 1.0,
      anticipatePin: 1,
      onUpdate: (self) => {
        if (typeof window.setClassroomProgress === 'function') {
          window.setClassroomProgress(self.progress);
        }
        updateAppStatus(self.progress);
      }
    }
  });

  window.scrollyTriggerInstance = tl.scrollTrigger;

  // Station 1: Tablero // Saber 11 Vector Hold
  tl.to({}, { duration: 0.7 });

  // Transition 1 -> 2: Cam moves to Pupitre & Tablet -> Card 0 Exits, Card 1 (Pulse) Enters
  tl.to(cards[0], { x: '-100vw', scale: 0.95, autoAlpha: 0, ease: 'power2.inOut', duration: 1.2 }, 'step_pulse');
  tl.to(cards[1], { x: 0, scale: 1, autoAlpha: 1, ease: 'power2.inOut', duration: 1.2 }, 'step_pulse');
  addCardAssemblyStep(tl, cards[1], 'step_pulse', 0.2);
  tl.to({}, { duration: 0.8 });

  // Transition 2 -> 3: Cam turns to Estación de Guías -> Card 1 Exits, Card 2 (Morpho) Enters
  tl.to(cards[1], { x: '-100vw', scale: 0.95, autoAlpha: 0, ease: 'power2.inOut', duration: 1.2 }, 'step_morpho');
  tl.to(cards[2], { x: 0, scale: 1, autoAlpha: 1, ease: 'power2.inOut', duration: 1.2 }, 'step_morpho');
  addCardAssemblyStep(tl, cards[2], 'step_morpho', 0.2);
  tl.to({}, { duration: 0.8 });

  // Snap points for the 3 Classroom Stations
  const snapProgressList = [0.08, 0.50, 0.88];

  function updateAppStatus(p) {
    let tabIndex = 0;

    if (p < 0.38) {
      tabIndex = 0; // 📐 Estación 1: Tablero // Saber 11
      if (cameraStatusText) cameraStatusText.textContent = 'CÁMARA 3D: ENFOCANDO EL TABLERO INSTITUCIONAL (SABER 11)';
    } else if (p >= 0.38 && p < 0.74) {
      tabIndex = 1; // 📱 Estación 2: Pupitre // Pulse Agenda Virtual
      if (cameraStatusText) cameraStatusText.textContent = 'CÁMARA 3D: DESCENDIENDO AL PUPITRE Y TABLET ESCOLAR (PULSE)';
    } else {
      tabIndex = 2; // 📘 Estación 3: Estación de Guías // Morpho Web
      if (cameraStatusText) cameraStatusText.textContent = 'CÁMARA 3D: GIRANDO A LA ESTACIÓN CURRICULAR DE GUÍAS WEB (MORPHO)';
    }

    window.currentAppIndex = tabIndex;
    window.currentAppCardIndex = tabIndex;
    const currentCardIndex = tabIndex;

    // Update Top Station Tabs
    appTabs.forEach((tab, idx) => {
      if (idx === tabIndex) tab.classList.add('active');
      else tab.classList.remove('active');
    });

    // Update Left Step Dots
    stepIndicators.forEach((dot, idx) => {
      if (idx === tabIndex) dot.classList.add('active');
      else dot.classList.remove('active');
    });

    // Update pointer events
    cards.forEach((card, idx) => {
      card.style.pointerEvents = (idx === currentCardIndex) ? 'auto' : 'none';
    });
  }

  // Click handler for jumping to a school station
  function jumpToApp(index) {
    if (index < 0) index = 0;
    if (index > 2) index = 2;

    if (window.soundFx) window.soundFx.playSnap();

    const st = window.scrollyTriggerInstance;
    let targetY = 0;
    if (st) {
      const scrollDist = st.end - st.start;
      targetY = st.start + (snapProgressList[index] * scrollDist);
    } else {
      const scrollDist = 4500;
      const showcaseTop = window.pageYOffset + section.getBoundingClientRect().top;
      targetY = showcaseTop + (snapProgressList[index] * scrollDist);
    }
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }

  window.jumpToApp = jumpToApp;

  window.jumpToAppHero = function(heroIndex) {
    if (heroIndex === 0 || heroIndex === 1) {
      // 0 = Élan, 1 = Apex -> Go to Idiomas Hub!
      const el = document.getElementById('idiomas-hub');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (heroIndex === 2) {
      // Vector -> Station 0 (Tablero)
      jumpToApp(0);
    } else if (heroIndex === 3) {
      // Morpho -> Station 2 (Guías)
      jumpToApp(2);
    } else if (heroIndex === 4) {
      // Pulse -> Station 1 (Pupitre)
      jumpToApp(1);
    }
  };

  // Attach tab click listeners
  appTabs.forEach((tab, idx) => {
    tab.onclick = () => jumpToApp(idx);
  });

  // Attach left dot click listeners
  stepIndicators.forEach((dot, idx) => {
    dot.onclick = () => jumpToApp(idx);
  });

  // URL Deep Link / Testing scroll jump support
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has('scroll')) {
    const scrollY = parseInt(searchParams.get('scroll'), 10);
    if (!isNaN(scrollY)) {
      setTimeout(() => {
        window.scrollTo({ top: scrollY, behavior: 'instant' });
      }, 400);
    }
  }

  // Initialize Section 2 Friction Cards Assembly Effect
  initFrictionCardsAssembly();
  // Initialize Section 4 Interactive Console Assembly Effect
  initConsoleAssembly();
  // Initialize Section 5 Audience Impact Matrix Assembly Effect
  initAudienceAssembly();
  // Initialize Section 6 Metrics Telemetry Odometer Effect
  initMetricsTelemetryAnimation();
  // Initialize Section 7 Conversion Dual Portal Dock Effect
  initConversionDockAnimation();
};

// ==========================================================================
// FRICTION CARDS SCROLL ASSEMBLY ("SE FORMAN Y SE SEPARAN")
// - As user scrolls down into view: cards start dispersed in 3D and assemble together.
// - As user scrolls backward: cards smoothly separate and fan back outwards.
// ==========================================================================
// ==========================================================================
// 4-CARD DRAMATIC 3D SCROLL ASSEMBLY & Z-AXIS DESPEGUE
// - Elevación en el eje Z hacia el usuario (translateZ / z)
// - Gran distancia de separación horizontal (X) y vertical (Y)
// - Rotación en abanico tridimensional
// - Sombra flotante hiper-táctil que aterriza en el cristal
// ==========================================================================
function initFrictionCardsAssembly() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const section = document.getElementById('el-problema');
  const topCard = document.getElementById('friction-title-card');
  const cardLeft = document.getElementById('friction-wrapper-1');
  const cardCenter = document.getElementById('friction-wrapper-2');
  const cardRight = document.getElementById('friction-wrapper-3');

  if (!section || !topCard || !cardLeft || !cardCenter || !cardRight) return;

  const isDesktop = window.innerWidth >= 992;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 992;

  // Separation parameters (Dramatic 3D Despegue)
  const xOffset = isDesktop ? 280 : (isTablet ? 140 : 45);
  const yOffset = isDesktop ? 150 : (isTablet ? 85 : 45);
  const topYOffset = isDesktop ? -140 : (isTablet ? -80 : -50);

  // 3D Z-Axis Elevation ("Despegue hacia el frente en el eje Z")
  const zOffset = isDesktop ? 180 : (isTablet ? 120 : 70);
  const centerZOffset = isDesktop ? 240 : (isTablet ? 160 : 90);
  const topZOffset = isDesktop ? 150 : (isTablet ? 100 : 60);

  const rotZ = isDesktop ? 12 : 6;
  const rotY = isDesktop ? 24 : 12;
  const rotX = isDesktop ? 20 : 12;
  const scaleVal = isDesktop ? 0.84 : (isTablet ? 0.88 : 0.90);

  const innerCards = section.querySelectorAll('.friction-card');
  const floatingShadow = '0 45px 95px rgba(35, 28, 22, 0.28), 0 16px 35px rgba(35, 28, 22, 0.16)';
  const restingShadow = '0 20px 50px rgba(60, 50, 42, 0.08), 0 4px 16px rgba(0, 0, 0, 0.03), inset 0 1px 2px rgba(255, 255, 255, 0.9)';
  const titleRestingShadow = '0 16px 42px rgba(50, 42, 34, 0.07), inset 0 1px 2px rgba(255, 255, 255, 0.95)';

  // 1. Initial Dispersed State (Separadas y despegadas en el eje Z hacia el frente):
  // Comienzan flotando en el espacio 3D con apariencia de cristal esmerilado translúcido
  gsap.set(topCard, {
    y: topYOffset,
    z: topZOffset,
    rotationX: -rotX,
    scale: scaleVal,
    opacity: 0.35,
    backgroundColor: 'rgba(255, 255, 255, 0.48)',
    borderColor: 'rgba(255, 255, 255, 0.65)',
    boxShadow: floatingShadow,
    transformOrigin: 'center bottom'
  });

  // Left Card: expulsada a la izquierda, despegada en Z hacia el frente
  gsap.set(cardLeft, {
    x: -xOffset,
    y: yOffset,
    z: zOffset,
    rotationZ: -rotZ,
    rotationY: rotY,
    scale: scaleVal,
    opacity: 0.35,
    transformOrigin: 'bottom right'
  });

  // Center Card: hundida en Y, despegada con máxima altura en Z
  gsap.set(cardCenter, {
    x: 0,
    y: yOffset * 1.35,
    z: centerZOffset,
    rotationX: rotX,
    scale: scaleVal * 0.96,
    opacity: 0.35,
    transformOrigin: 'center bottom'
  });

  // Right Card: expulsada a la derecha, despegada en Z hacia el frente
  gsap.set(cardRight, {
    x: xOffset,
    y: yOffset,
    z: zOffset,
    rotationZ: rotZ,
    rotationY: -rotY,
    scale: scaleVal,
    opacity: 0.35,
    transformOrigin: 'bottom left'
  });

  gsap.set(innerCards, {
    backgroundColor: 'rgba(255, 255, 255, 0.44)',
    borderColor: 'rgba(255, 255, 255, 0.65)',
    boxShadow: floatingShadow
  });

  // 2. ScrollTrigger Scrub:
  // Starts when top of #el-problema reaches 70% of viewport
  // Ends when bottom of #el-problema reaches 65% of viewport
  const tl = gsap.timeline({
    scrollTrigger: {
      id: 'frictionAssembly',
      trigger: '#el-problema',
      start: 'top 70%',
      end: 'bottom 65%',
      scrub: 0.85,
      invalidateOnRefresh: true
    }
  });

  // Top Card descends, lands on Z:0, settles flat y se vuelve BLANCA pura
  tl.to(topCard, {
    y: 0,
    z: 0,
    rotationX: 0,
    scale: 1,
    opacity: 1,
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(255, 255, 255, 1)',
    boxShadow: titleRestingShadow,
    ease: 'power2.out'
  }, 0);

  // Left Card converges, lands on Z:0, straightens
  tl.to(cardLeft, {
    x: 0,
    y: 0,
    z: 0,
    rotationZ: 0,
    rotationY: 0,
    scale: 1,
    opacity: 1,
    ease: 'power2.out'
  }, 0);

  // Center Card rises, lands on Z:0, straightens
  tl.to(cardCenter, {
    x: 0,
    y: 0,
    z: 0,
    rotationX: 0,
    scale: 1,
    opacity: 1,
    ease: 'power2.out'
  }, 0);

  // Right Card converges, lands on Z:0, straightens
  tl.to(cardRight, {
    x: 0,
    y: 0,
    z: 0,
    rotationZ: 0,
    rotationY: 0,
    scale: 1,
    opacity: 1,
    ease: 'power2.out'
  }, 0);

  // En el momento de ensamble y aterrizaje, las tarjetas se vuelven BLANCAS puras para legibilidad total del texto
  tl.to(innerCards, {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(255, 255, 255, 1)',
    boxShadow: restingShadow,
    ease: 'power2.out'
  }, 0);
}

// ==========================================================================
// SECTION 4: SIMULADOR EN VIVO (CONSOLE DECK 3D ASSEMBLY)
// - Title Card (#console-title-card): Elevated in Y, despegada in Z, tilted in X, floating shadow
// - Console Deck Card (#console-deck-card): Despegada in Z (+220px), pushed down in Y (+140px),
//   tilted in 3D X, floating deep shadow
// - On Scroll: Lands smoothly on Z:0, flattens, aligns and settles resting glass shadow
// - On Scroll Reverse: Detaches, elevates in Z towards user, tilts back into 3D
// ==========================================================================
function initConsoleAssembly() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const section = document.getElementById('interactive-console');
  const topCard = document.getElementById('console-title-card');
  const deckCard = document.getElementById('console-deck-card');

  if (!section || !topCard || !deckCard) return;

  const isDesktop = window.innerWidth >= 992;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 992;

  const yOffset = isDesktop ? 140 : (isTablet ? 80 : 45);
  const topYOffset = isDesktop ? -120 : (isTablet ? -70 : -40);
  const zOffset = isDesktop ? 220 : (isTablet ? 150 : 80);
  const topZOffset = isDesktop ? 150 : (isTablet ? 100 : 60);
  const rotX = isDesktop ? 18 : 10;
  const scaleVal = isDesktop ? 0.88 : (isTablet ? 0.90 : 0.92);

  const floatingShadow = '0 45px 95px rgba(35, 28, 22, 0.28), 0 16px 35px rgba(35, 28, 22, 0.16)';
  const restingShadow = '0 24px 64px rgba(50, 42, 34, 0.09), inset 0 1px 2px #fff';
  const titleRestingShadow = '0 16px 42px rgba(50, 42, 34, 0.07), inset 0 1px 2px rgba(255, 255, 255, 0.95)';

  // Initial Dispersed 3D State:
  gsap.set(topCard, {
    y: topYOffset,
    z: topZOffset,
    rotationX: -rotX,
    scale: scaleVal,
    opacity: 0.35,
    backgroundColor: 'rgba(255, 255, 255, 0.48)',
    borderColor: 'rgba(255, 255, 255, 0.65)',
    boxShadow: floatingShadow,
    transformOrigin: 'center bottom'
  });

  gsap.set(deckCard, {
    y: yOffset,
    z: zOffset,
    rotationX: rotX,
    scale: scaleVal,
    opacity: 0.35,
    backgroundColor: 'rgba(255, 255, 255, 0.46)',
    borderColor: 'rgba(255, 255, 255, 0.65)',
    boxShadow: floatingShadow,
    transformOrigin: 'center top'
  });

  // ScrollTrigger Scrub:
  const tl = gsap.timeline({
    scrollTrigger: {
      id: 'consoleAssembly',
      trigger: '#interactive-console',
      start: 'top 72%',
      end: 'center 46%',
      scrub: 0.85,
      invalidateOnRefresh: true
    }
  });

  tl.to(topCard, {
    y: 0,
    z: 0,
    rotationX: 0,
    scale: 1,
    opacity: 1,
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(255, 255, 255, 1)',
    boxShadow: titleRestingShadow,
    ease: 'power2.out'
  }, 0);

  tl.to(deckCard, {
    y: 0,
    z: 0,
    rotationX: 0,
    scale: 1,
    opacity: 1,
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(255, 255, 255, 1)',
    boxShadow: restingShadow,
    ease: 'power2.out'
  }, 0);
}

// ==========================================================================
// SECTION 5: DISEÑADO PARA CADA ACTOR (4-CARD 3D FAN-OUT ASSEMBLY)
// - Title Card (#audience-title-card): Elevated in Y, despegada in Z, tilted in X, floating shadow
// - 4 Audience Cards:
//   - Card 1 (Estudiante): Fanned wide left (-260px), elevated in Z (+180px), 3D Y rotation (+22deg), Z rotation (-12deg)
//   - Card 2 (Rectores): Center left (-80px), dropped in Y (+160px), elevated in Z (+220px), tilted in X (+16deg)
//   - Card 3 (Docentes): Center right (+80px), dropped in Y (+160px), elevated in Z (+220px), tilted in X (+16deg)
//   - Card 4 (Padres): Fanned wide right (+260px), elevated in Z (+180px), 3D Y rotation (-22deg), Z rotation (+12deg)
// - On Scroll: All 4 converge, land on Z:0, flatten and form the 4-pillar grid!
// - On Scroll Reverse: They lift off in Z toward the user and fan out in 3D!
// ==========================================================================
function initAudienceAssembly() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const section = document.getElementById('matriz-impacto');
  const topCard = document.getElementById('audience-title-card');
  const card1 = document.getElementById('audience-wrapper-1');
  const card2 = document.getElementById('audience-wrapper-2');
  const card3 = document.getElementById('audience-wrapper-3');
  const card4 = document.getElementById('audience-wrapper-4');

  if (!section || !topCard || !card1 || !card2 || !card3 || !card4) return;

  const isDesktop = window.innerWidth >= 992;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 992;

  // Separation parameters
  const xOffset = isDesktop ? 260 : (isTablet ? 130 : 40);
  const yOffset = isDesktop ? 140 : (isTablet ? 80 : 45);
  const topYOffset = isDesktop ? -130 : (isTablet ? -75 : -45);

  // 3D Z-Axis Elevation ("Despegue en el eje Z")
  const zOffset = isDesktop ? 180 : (isTablet ? 120 : 70);
  const centerZOffset = isDesktop ? 230 : (isTablet ? 150 : 85);
  const topZOffset = isDesktop ? 150 : (isTablet ? 100 : 60);

  const rotZ = isDesktop ? 12 : 6;
  const rotY = isDesktop ? 22 : 12;
  const rotX = isDesktop ? 18 : 10;
  const scaleVal = isDesktop ? 0.85 : (isTablet ? 0.88 : 0.90);

  const innerCards = section.querySelectorAll('.audience-card');
  const floatingShadow = '0 45px 95px rgba(35, 28, 22, 0.28), 0 16px 35px rgba(35, 28, 22, 0.16)';
  const restingShadow = '0 20px 50px rgba(60, 50, 42, 0.08), 0 4px 16px rgba(0, 0, 0, 0.03), inset 0 1px 2px rgba(255, 255, 255, 0.9)';
  const titleRestingShadow = '0 16px 42px rgba(50, 42, 34, 0.07), inset 0 1px 2px rgba(255, 255, 255, 0.95)';

  // Initial Dispersed State (Despegadas en Z y separadas en abanico 3D):
  gsap.set(topCard, {
    y: topYOffset,
    z: topZOffset,
    rotationX: -rotX,
    scale: scaleVal,
    opacity: 0.35,
    backgroundColor: 'rgba(255, 255, 255, 0.48)',
    borderColor: 'rgba(255, 255, 255, 0.65)',
    boxShadow: floatingShadow,
    transformOrigin: 'center bottom'
  });

  // Card 1: Expulsada a la izquierda, despegada en Z
  gsap.set(card1, {
    x: -xOffset,
    y: yOffset,
    z: zOffset,
    rotationZ: -rotZ,
    rotationY: rotY,
    scale: scaleVal,
    opacity: 0.35,
    transformOrigin: 'bottom right'
  });

  // Card 2: Centro-izquierda, hundida en Y, máxima elevación en Z
  gsap.set(card2, {
    x: -xOffset * 0.32,
    y: yOffset * 1.3,
    z: centerZOffset,
    rotationX: rotX,
    rotationZ: -rotZ * 0.4,
    scale: scaleVal * 0.97,
    opacity: 0.35,
    transformOrigin: 'center bottom'
  });

  // Card 3: Centro-derecha, hundida en Y, máxima elevación en Z
  gsap.set(card3, {
    x: xOffset * 0.32,
    y: yOffset * 1.3,
    z: centerZOffset,
    rotationX: rotX,
    rotationZ: rotZ * 0.4,
    scale: scaleVal * 0.97,
    opacity: 0.35,
    transformOrigin: 'center bottom'
  });

  // Card 4: Expulsada a la derecha, despegada en Z
  gsap.set(card4, {
    x: xOffset,
    y: yOffset,
    z: zOffset,
    rotationZ: rotZ,
    rotationY: -rotY,
    scale: scaleVal,
    opacity: 0.35,
    transformOrigin: 'bottom left'
  });

  gsap.set(innerCards, {
    backgroundColor: 'rgba(255, 255, 255, 0.44)',
    borderColor: 'rgba(255, 255, 255, 0.65)',
    boxShadow: floatingShadow
  });

  // ScrollTrigger Scrub:
  const tl = gsap.timeline({
    scrollTrigger: {
      id: 'audienceAssembly',
      trigger: '#matriz-impacto',
      start: 'top 70%',
      end: 'center 45%',
      scrub: 0.85,
      invalidateOnRefresh: true
    }
  });

  // Title Card lands y se vuelve BLANCA pura
  tl.to(topCard, {
    y: 0,
    z: 0,
    rotationX: 0,
    scale: 1,
    opacity: 1,
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(255, 255, 255, 1)',
    boxShadow: titleRestingShadow,
    ease: 'power2.out'
  }, 0);

  // 4 Cards converge and land flat
  tl.to(card1, {
    x: 0,
    y: 0,
    z: 0,
    rotationZ: 0,
    rotationY: 0,
    scale: 1,
    opacity: 1,
    ease: 'power2.out'
  }, 0);

  tl.to(card2, {
    x: 0,
    y: 0,
    z: 0,
    rotationX: 0,
    rotationZ: 0,
    scale: 1,
    opacity: 1,
    ease: 'power2.out'
  }, 0);

  tl.to(card3, {
    x: 0,
    y: 0,
    z: 0,
    rotationX: 0,
    rotationZ: 0,
    scale: 1,
    opacity: 1,
    ease: 'power2.out'
  }, 0);

  tl.to(card4, {
    x: 0,
    y: 0,
    z: 0,
    rotationZ: 0,
    rotationY: 0,
    scale: 1,
    opacity: 1,
    ease: 'power2.out'
  }, 0);

  // Smooth shadow landing y se vuelven BLANCAS puras para lectura impecable
  tl.to(innerCards, {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(255, 255, 255, 1)',
    boxShadow: restingShadow,
    ease: 'power2.out'
  }, 0);
}

// ==========================================================================
// SECTION 6: MÉTRICAS DE ALTO RENDIMIENTO (KINETIC TELEMETRY ODOMETER)
// - Cascade Elastic Scale Pop for the 4 Stat Cards
// - Real-Time Dynamic Counting Odometer (Interpolating 0 -> Target)
// - Telemetry Progress Fill Expansion
// ==========================================================================
function initMetricsTelemetryAnimation() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const section = document.getElementById('metricas');
  const titleCard = document.getElementById('metrics-title-card');
  const grid = document.getElementById('metrics-grid');
  const statCards = section ? section.querySelectorAll('.metric-stat-card') : null;
  const numElements = section ? section.querySelectorAll('.metric-big-num') : null;
  const fillElements = section ? section.querySelectorAll('.metric-telemetry-fill') : null;

  if (!section || !grid || !statCards.length) return;

  // Initial states
  if (titleCard) {
    gsap.set(titleCard, { y: -40, opacity: 0.35, scale: 0.94 });
  }
  gsap.set(statCards, { y: 65, scale: 0.85, opacity: 0 });
  if (fillElements) {
    gsap.set(fillElements, { scaleX: 0, transformOrigin: 'left center' });
  }

  // ScrollTrigger for Title & Cards Staggered Pop
  const tl = gsap.timeline({
    scrollTrigger: {
      id: 'metricsStagger',
      trigger: '#metricas',
      start: 'top 75%',
      toggleActions: 'play none none reverse'
    }
  });

  if (titleCard) {
    tl.to(titleCard, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out' }, 0);
  }

  tl.to(statCards, {
    y: 0,
    scale: 1,
    opacity: 1,
    duration: 0.85,
    stagger: 0.12,
    ease: 'back.out(1.4)'
  }, 0.1);

  if (fillElements) {
    tl.to(fillElements, {
      scaleX: 1,
      duration: 1.2,
      stagger: 0.12,
      ease: 'power2.out'
    }, 0.25);
  }

  // Real-Time Odometer Count-Up Animation
  numElements.forEach(el => {
    const target = parseFloat(el.getAttribute('data-target')) || 0;
    const decimals = parseInt(el.getAttribute('data-decimals')) || 0;
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const counterObj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(counterObj, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = prefix + (decimals > 0 ? counterObj.val.toFixed(decimals) : Math.round(counterObj.val)) + suffix;
          }
        });
      },
      onLeaveBack: () => {
        counterObj.val = 0;
        el.textContent = prefix + (decimals > 0 ? '0.0' : '0') + suffix;
      }
    });
  });
}

// ==========================================================================
// SECTION 7: CIERRE Y DOBLE CONVERSIÓN (DUAL MAGNETIC COMMAND PORTAL)
// - Left & Right Clamshell Slide & Dock Convergence
// - Smooth Lateral Magnetic Snap into Central Viewport
// ==========================================================================
function initConversionDockAnimation() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const section = document.getElementById('contacto-cierre');
  const titleCard = document.getElementById('conversion-title-card');
  const cardStudents = document.getElementById('conversion-card-students');
  const cardInstitutions = document.getElementById('conversion-card-institutions');

  if (!section || !cardStudents || !cardInstitutions) return;

  const isDesktop = window.innerWidth >= 992;
  const slideX = isDesktop ? 120 : 60;
  const rotY = isDesktop ? 14 : 8;

  // Initial separated flanking state
  if (titleCard) {
    gsap.set(titleCard, { y: -40, opacity: 0.35, scale: 0.94, backgroundColor: 'rgba(255, 255, 255, 0.48)' });
  }
  gsap.set(cardStudents, {
    x: -slideX,
    rotationY: rotY,
    scale: 0.93,
    opacity: 0.35,
    backgroundColor: 'rgba(255, 255, 255, 0.46)',
    transformOrigin: 'right center'
  });
  gsap.set(cardInstitutions, {
    x: slideX,
    rotationY: -rotY,
    scale: 0.93,
    opacity: 0.35,
    backgroundColor: 'rgba(255, 255, 255, 0.46)',
    transformOrigin: 'left center'
  });

  // Magnetic Docking Timeline driven by scroll scrub
  const tl = gsap.timeline({
    scrollTrigger: {
      id: 'conversionDock',
      trigger: '#contacto-cierre',
      start: 'top 75%',
      end: 'center 48%',
      scrub: 0.85,
      invalidateOnRefresh: true
    }
  });

  if (titleCard) {
    tl.to(titleCard, { y: 0, opacity: 1, scale: 1, backgroundColor: '#FFFFFF', ease: 'power2.out' }, 0);
  }

  tl.to(cardStudents, {
    x: 0,
    rotationY: 0,
    scale: 1,
    opacity: 1,
    backgroundColor: '#FFFFFF',
    ease: 'power2.out'
  }, 0);

  tl.to(cardInstitutions, {
    x: 0,
    rotationY: 0,
    scale: 1,
    opacity: 1,
    backgroundColor: '#FFFFFF',
    ease: 'power2.out'
  }, 0);
}

