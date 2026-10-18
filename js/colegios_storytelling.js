/* ==========================================================================
   COLEGIOS • SEGUNDA ESCENA DE STORYTELLING SCROLL-DRIVEN CONTROLLER
   "Tres necesidades. Una nueva forma de avanzar."
   Sincronización suave con Lenis / Native Scroll & navegación bidireccional
   ========================================================================== */

(function() {
  'use strict';

  let sectionEl = null;
  let scenarios = [];
  let navBtns = [];
  let meterFill = null;
  let meterLabel = null;
  let meterPct = null;
  let scenarioNumberBadge = null;
  let scenarioActiveName = null;
  
  // Central Core Elements
  let coreEmblemNode = null;
  let coreStageEyebrow = null;
  let coreStageTitle = null;
  let coreStatusText = null;

  let isTicking = false;
  let currentActiveIndex = -1;

  const SCENARIO_DATA = [
    {
      number: '01',
      name: 'Gestión académica.',
      emblem: '🏛',
      eyebrow: 'EJE I / III',
      title: 'Gestión Académica',
      status: '1,280 Estudiantes Sincronizados'
    },
    {
      number: '02',
      name: 'Preparación Saber 11.',
      emblem: '🎯',
      eyebrow: 'EJE II / III',
      title: 'Preparación Saber 11',
      status: '98% Percentil ICFES Proyectado'
    },
    {
      number: '03',
      name: 'Guías interactivas.',
      emblem: '✨',
      eyebrow: 'EJE III / III',
      title: 'Guías Interactivas',
      status: '100% Contenidos Digitales Vivos'
    }
  ];

  function init() {
    sectionEl = document.getElementById('colegios-storytelling');
    if (!sectionEl) return;

    scenarios = Array.from(sectionEl.querySelectorAll('.story-scenario-stage'));
    navBtns = Array.from(sectionEl.querySelectorAll('.story-step-pill'));
    meterFill = document.getElementById('story-meter-fill');
    meterLabel = document.getElementById('meter-label');
    meterPct = document.getElementById('meter-pct');
    scenarioNumberBadge = document.getElementById('scenario-number-badge');
    scenarioActiveName = document.getElementById('scenario-active-name');

    coreEmblemNode = document.getElementById('core-emblem-node');
    coreStageEyebrow = document.getElementById('core-stage-eyebrow');
    coreStageTitle = document.getElementById('core-stage-title');
    coreStatusText = document.getElementById('core-status-text');

    // Attach scroll listeners (Lenis + Native fallback)
    if (window.lenisInstance && typeof window.lenisInstance.on === 'function') {
      window.lenisInstance.on('scroll', onScroll);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Initial check
    updateState();
  }

  function onScroll() {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        updateState();
        isTicking = false;
      });
      isTicking = true;
    }
  }

  function updateState() {
    if (!sectionEl) return;

    const viewColegios = document.getElementById('view-colegios');
    if (viewColegios && viewColegios.classList.contains('is-hidden')) {
      return;
    }

    const rect = sectionEl.getBoundingClientRect();
    const windowH = window.innerHeight || 800;
    const scrollableDistance = sectionEl.offsetHeight - windowH;

    if (scrollableDistance <= 0) return;

    const scrolledInside = -rect.top;
    let progress = scrolledInside / scrollableDistance;
    progress = Math.max(0, Math.min(1, progress));

    // Determine active scenario index
    let activeIndex = 0;
    if (progress < 0.33) {
      activeIndex = 0;
    } else if (progress < 0.68) {
      activeIndex = 1;
    } else {
      activeIndex = 2;
    }

    // Only update DOM details when changed
    if (activeIndex !== currentActiveIndex) {
      currentActiveIndex = activeIndex;
      const data = SCENARIO_DATA[activeIndex];

      // Update Section Active Data Attribute
      sectionEl.setAttribute('data-active-scenario', String(activeIndex));

      // Header Scenario Name & Badge
      if (scenarioNumberBadge) scenarioNumberBadge.textContent = data.number;
      if (scenarioActiveName) scenarioActiveName.textContent = data.name;

      // Central Core Elements
      if (coreEmblemNode) coreEmblemNode.textContent = data.emblem;
      if (coreStageEyebrow) coreStageEyebrow.textContent = data.eyebrow;
      if (coreStageTitle) coreStageTitle.textContent = data.title;
      if (coreStatusText) coreStatusText.textContent = data.status;

      // Scenarios transitions (Aparecen y desaparecen con transiciones suaves)
      scenarios.forEach((sc, idx) => {
        if (idx === activeIndex) {
          sc.classList.add('is-active');
          sc.classList.remove('is-passed');
        } else if (idx < activeIndex) {
          sc.classList.remove('is-active');
          sc.classList.add('is-passed');
        } else {
          sc.classList.remove('is-active');
          sc.classList.remove('is-passed');
        }
      });

      // Bottom Dock Buttons
      navBtns.forEach((btn, idx) => {
        if (idx === activeIndex) {
          btn.classList.add('is-active');
          btn.setAttribute('aria-current', 'step');
        } else {
          btn.classList.remove('is-active');
          btn.removeAttribute('aria-current');
        }
      });
    }

    // Smooth Meter Fill & Percentage on Scroll
    const progressPercent = Math.round(progress * 100);
    if (meterFill) {
      meterFill.style.width = `${Math.max(12, progressPercent)}%`;
    }
    if (meterLabel) {
      meterLabel.textContent = `Escenario ${activeIndex + 1} de 3`;
    }
    if (meterPct) {
      meterPct.textContent = `${progressPercent}%`;
    }
  }

  // Global navigation handler called from step buttons
  window.goToColegiosStoryStep = function(stepIndex) {
    if (!sectionEl) sectionEl = document.getElementById('colegios-storytelling');
    if (!sectionEl) return;

    const windowH = window.innerHeight || 800;
    const scrollableDistance = sectionEl.offsetHeight - windowH;
    const sectionTop = sectionEl.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop);

    let targetScroll = sectionTop;
    if (stepIndex === 1) {
      targetScroll = sectionTop + scrollableDistance * 0.48;
    } else if (stepIndex === 2) {
      targetScroll = sectionTop + scrollableDistance * 0.88;
    } else {
      targetScroll = sectionTop + 10;
    }

    if (window.lenisInstance && typeof window.lenisInstance.scrollTo === 'function') {
      window.lenisInstance.scrollTo(targetScroll, { duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    } else {
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  // Auto-init on DOMContentLoaded or immediate if ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-check when world tabs change
  window.addEventListener('worldChanged', (e) => {
    if (e.detail && e.detail.world === 'colegios') {
      setTimeout(() => {
        updateState();
      }, 100);
    }
  });

})();
