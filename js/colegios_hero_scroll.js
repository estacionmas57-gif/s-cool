/* ==========================================================================
   COLEGIOS • HERO SCROLL-DRIVEN SEQUENTIAL HUD CARDS CONTROLLER
   Transición cinematográfica interactiva en el Hero de Colegios:
   - Scroll 0%: Tarjeta principal de bienvenida "Tu colegio, más digital."
   - Scroll progresivo: La tarjeta principal se oculta y emergen sucesivamente
     las 4 tarjetas HUD + las 3 cápsulas holográficas con perspectiva 3D hacia adentro:
     1. Agenda Digital (Superior izquierdo, perspectiva hacia adentro)
     2. Progreso Estudiantil (Medio izquierdo junto a la protagonista)
        + Preparación Saber 11 (Cápsula púrpura conectada debajo)
     3. Recursos Interactivos (Superior derecho bajo la viga)
        + Guías Interactivas (Cápsula esmeralda conectada debajo)
     4. Comunidad Educativa (Inferior derecho sobre el área de descanso)
        + Gestión Académica (Cápsula cian conectada debajo)
   - Scroll 62% - 90%: Todas las 4 tarjetas y las 3 cápsulas se mantienen 100% visibles y nítidas.
   - Scroll > 90%: Transición suave hacia la siguiente sección (#el-problema).
   ========================================================================== */

(function() {
  'use strict';

  let trackEl = null;
  let stickyEl = null;
  let bgBaseEl = null;
  let heroCardEl = null;
  let hudLayerEl = null;
  let cardAgendaEl = null;
  let cardProgresoEl = null;
  let cardRecursosEl = null;
  let cardComunidadEl = null;
  let subpillSaber11El = null;
  let subpillGuiasEl = null;
  let subpillGestionEl = null;
  let scrollCueEl = null;
  let cueTextEl = null;
  let phaseDot1El = null;
  let phaseDot2El = null;

  let currentPhase = 0;
  let lastProgress = -1;

  function init() {
    trackEl = document.getElementById('colegios-hero-track');
    if (!trackEl) return;

    stickyEl = document.getElementById('colegios-hero-sticky');
    bgBaseEl = document.getElementById('colegios-hero-bg-base');
    heroCardEl = document.getElementById('colegios-hero-card');
    hudLayerEl = document.getElementById('colegios-hud-layer');
    scrollCueEl = document.getElementById('colegios-scroll-cue');
    cueTextEl = document.getElementById('colegios-cue-text');
    phaseDot1El = document.getElementById('phase-dot-1');
    phaseDot2El = document.getElementById('phase-dot-2');

    cardAgendaEl = document.querySelector('.hud-card-agenda');
    cardProgresoEl = document.querySelector('.hud-card-progreso');
    cardRecursosEl = document.querySelector('.hud-card-recursos');
    cardComunidadEl = document.querySelector('.hud-card-comunidad');
    subpillSaber11El = document.getElementById('subpill-saber11');
    subpillGuiasEl = document.getElementById('subpill-guias');
    subpillGestionEl = document.getElementById('subpill-gestion');

    // Attach scroll listeners: Native + Lenis + direct RAF/ticker
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    if (window.lenisInstance && typeof window.lenisInstance.on === 'function') {
      try { window.lenisInstance.off('scroll', onScroll); } catch(e) {}
      window.lenisInstance.on('scroll', onScroll);
    } else {
      const checkLenis = setInterval(() => {
        if (window.lenisInstance && typeof window.lenisInstance.on === 'function') {
          try { window.lenisInstance.off('scroll', onScroll); } catch(e) {}
          window.lenisInstance.on('scroll', onScroll);
          clearInterval(checkLenis);
        }
      }, 100);
      setTimeout(() => clearInterval(checkLenis), 5000);
    }

    if (window.gsap && window.gsap.ticker) {
      window.gsap.ticker.add(onScroll);
    }

    lastProgress = -1;
    calculateScrollProgress();
  }

  function onScroll() {
    calculateScrollProgress();
  }

  function calculateScrollProgress() {
    if (!trackEl) trackEl = document.getElementById('colegios-hero-track');
    if (!trackEl) return;

    // Check if view-colegios is currently displayed
    const viewColegios = document.getElementById('view-colegios');
    if (viewColegios && getComputedStyle(viewColegios).display === 'none') {
      return;
    }

    const rect = trackEl.getBoundingClientRect();
    const windowH = window.innerHeight || 800;
    const trackH = trackEl.offsetHeight || (windowH * 2.8);
    const scrollDist = trackH - windowH;

    if (scrollDist <= 0) {
      updateTransition(0);
      return;
    }

    // Progress from 0 (top of hero) to 1 (end of hero track)
    const scrolled = -rect.top;
    const progress = Math.min(Math.max(scrolled / scrollDist, 0), 1);

    if (Math.abs(progress - lastProgress) < 0.0003) return;
    lastProgress = progress;

    updateTransition(progress);
  }

  function updateTransition(progress) {
    if (!trackEl) trackEl = document.getElementById('colegios-hero-track');
    if (!bgBaseEl) bgBaseEl = document.getElementById('colegios-hero-bg-base');
    if (!heroCardEl) heroCardEl = document.getElementById('colegios-hero-card');
    if (!hudLayerEl) hudLayerEl = document.getElementById('colegios-hud-layer');
    if (!cardAgendaEl) cardAgendaEl = document.querySelector('.hud-card-agenda');
    if (!cardProgresoEl) cardProgresoEl = document.querySelector('.hud-card-progreso');
    if (!cardRecursosEl) cardRecursosEl = document.querySelector('.hud-card-recursos');
    if (!cardComunidadEl) cardComunidadEl = document.querySelector('.hud-card-comunidad');
    if (!subpillSaber11El) subpillSaber11El = document.getElementById('subpill-saber11');
    if (!subpillGuiasEl) subpillGuiasEl = document.getElementById('subpill-guias');
    if (!subpillGestionEl) subpillGestionEl = document.getElementById('subpill-gestion');

    // Base background: SIEMPRE 100% VISIBLE Y NÍTIDO
    if (bgBaseEl) {
      bgBaseEl.style.setProperty('opacity', '1', 'important');
    }

    // 0. Recuadro inicial ("Tu colegio, más digital" desaparece: 0.00 -> 0.10)
    const tExit = Math.min(1, Math.max(0, progress / 0.10));
    if (heroCardEl) {
      const cardOpacity = 1 - tExit;
      const cardTranslateX = -tExit * 70;

      if (cardOpacity <= 0.01) {
        heroCardEl.style.setProperty('display', 'none', 'important');
        heroCardEl.style.setProperty('opacity', '0', 'important');
        heroCardEl.style.setProperty('pointer-events', 'none', 'important');
      } else {
        heroCardEl.style.setProperty('display', 'block', 'important');
        heroCardEl.style.setProperty('opacity', cardOpacity.toFixed(3), 'important');
        heroCardEl.style.setProperty('transform', `translateX(${cardTranslateX.toFixed(1)}px) scale(${(1 - tExit * 0.05).toFixed(3)})`, 'important');
        heroCardEl.style.setProperty('pointer-events', cardOpacity < 0.1 ? 'none' : 'auto', 'important');
      }
    }

    // 1º ENTRADA: AGENDA DIGITAL (progress: 0.05 -> 0.18)
    const t1 = Math.min(1, Math.max(0, (progress - 0.05) / 0.13));
    if (cardAgendaEl) {
      if (t1 <= 0.005) {
        cardAgendaEl.style.setProperty('opacity', '0', 'important');
        cardAgendaEl.style.setProperty('pointer-events', 'none', 'important');
        cardAgendaEl.style.setProperty('transform', 'perspective(1200px) rotateY(16deg) rotateX(1deg) translateY(32px) scale(0.92)', 'important');
      } else {
        cardAgendaEl.style.setProperty('opacity', t1.toFixed(3), 'important');
        cardAgendaEl.style.setProperty('pointer-events', t1 > 0.4 ? 'auto' : 'none', 'important');
        const scale1 = (0.92 + 0.08 * t1).toFixed(3);
        const y1 = ((1 - t1) * 32).toFixed(1);
        cardAgendaEl.style.setProperty('transform', `perspective(1200px) rotateY(16deg) rotateX(1deg) translateY(${y1}px) scale(${scale1})`, 'important');
      }
    }

    // 2º ENTRADA: PROGRESO ESTUDIANTIL (progress: 0.18 -> 0.32)
    const t2 = Math.min(1, Math.max(0, (progress - 0.18) / 0.14));
    if (cardProgresoEl) {
      if (t2 <= 0.005) {
        cardProgresoEl.style.setProperty('opacity', '0', 'important');
        cardProgresoEl.style.setProperty('pointer-events', 'none', 'important');
        cardProgresoEl.style.setProperty('transform', 'perspective(1200px) rotateY(18deg) rotateX(1deg) translateY(32px) scale(0.92)', 'important');
      } else {
        cardProgresoEl.style.setProperty('opacity', t2.toFixed(3), 'important');
        cardProgresoEl.style.setProperty('pointer-events', t2 > 0.4 ? 'auto' : 'none', 'important');
        const scale2 = (0.92 + 0.08 * t2).toFixed(3);
        const y2 = ((1 - t2) * 32).toFixed(1);
        cardProgresoEl.style.setProperty('transform', `perspective(1200px) rotateY(18deg) rotateX(1deg) translateY(${y2}px) scale(${scale2})`, 'important');
      }
    }

    // 2b. ENTRADA: CÁPSULA PREPARACIÓN SABER 11 (debajo de Progreso Estudiantil, progress: 0.22 -> 0.36)
    const tPill1 = Math.min(1, Math.max(0, (progress - 0.22) / 0.14));
    if (subpillSaber11El) {
      if (tPill1 <= 0.005) {
        subpillSaber11El.style.setProperty('opacity', '0', 'important');
        subpillSaber11El.style.setProperty('pointer-events', 'none', 'important');
        subpillSaber11El.style.setProperty('transform', 'translateX(-50%) scale(0.95)', 'important');
      } else {
        subpillSaber11El.style.setProperty('opacity', tPill1.toFixed(3), 'important');
        subpillSaber11El.style.setProperty('pointer-events', tPill1 > 0.4 ? 'auto' : 'none', 'important');
        const scaleP1 = (0.95 + 0.05 * tPill1).toFixed(3);
        subpillSaber11El.style.setProperty('transform', `translateX(-50%) scale(${scaleP1})`, 'important');
      }
    }

    // 3º ENTRADA: RECURSOS INTERACTIVOS (progress: 0.32 -> 0.46)
    const t3 = Math.min(1, Math.max(0, (progress - 0.32) / 0.14));
    if (cardRecursosEl) {
      if (t3 <= 0.005) {
        cardRecursosEl.style.setProperty('opacity', '0', 'important');
        cardRecursosEl.style.setProperty('pointer-events', 'none', 'important');
        cardRecursosEl.style.setProperty('transform', 'perspective(1200px) rotateY(-16deg) rotateX(1deg) translateY(32px) scale(0.92)', 'important');
      } else {
        cardRecursosEl.style.setProperty('opacity', t3.toFixed(3), 'important');
        cardRecursosEl.style.setProperty('pointer-events', t3 > 0.4 ? 'auto' : 'none', 'important');
        const scale3 = (0.92 + 0.08 * t3).toFixed(3);
        const y3 = ((1 - t3) * 32).toFixed(1);
        cardRecursosEl.style.setProperty('transform', `perspective(1200px) rotateY(-16deg) rotateX(1deg) translateY(${y3}px) scale(${scale3})`, 'important');
      }
    }

    // 3b. ENTRADA: CÁPSULA GUÍAS INTERACTIVAS (debajo de Recursos, progress: 0.34 -> 0.48)
    const tPill2 = Math.min(1, Math.max(0, (progress - 0.34) / 0.14));
    if (subpillGuiasEl) {
      if (tPill2 <= 0.005) {
        subpillGuiasEl.style.setProperty('opacity', '0', 'important');
        subpillGuiasEl.style.setProperty('pointer-events', 'none', 'important');
        subpillGuiasEl.style.setProperty('transform', 'translateX(-50%) scale(0.95)', 'important');
      } else {
        subpillGuiasEl.style.setProperty('opacity', tPill2.toFixed(3), 'important');
        subpillGuiasEl.style.setProperty('pointer-events', tPill2 > 0.4 ? 'auto' : 'none', 'important');
        const scaleP2 = (0.95 + 0.05 * tPill2).toFixed(3);
        subpillGuiasEl.style.setProperty('transform', `translateX(-50%) scale(${scaleP2})`, 'important');
      }
    }

    // 4º ENTRADA: COMUNIDAD EDUCATIVA (progress: 0.46 -> 0.60)
    const t4 = Math.min(1, Math.max(0, (progress - 0.46) / 0.14));
    if (cardComunidadEl) {
      if (t4 <= 0.005) {
        cardComunidadEl.style.setProperty('opacity', '0', 'important');
        cardComunidadEl.style.setProperty('pointer-events', 'none', 'important');
        cardComunidadEl.style.setProperty('transform', 'perspective(1200px) rotateY(-15deg) rotateX(-1deg) translateY(32px) scale(0.92)', 'important');
      } else {
        cardComunidadEl.style.setProperty('opacity', t4.toFixed(3), 'important');
        cardComunidadEl.style.setProperty('pointer-events', t4 > 0.4 ? 'auto' : 'none', 'important');
        const scale4 = (0.92 + 0.08 * t4).toFixed(3);
        const y4 = ((1 - t4) * 32).toFixed(1);
        cardComunidadEl.style.setProperty('transform', `perspective(1200px) rotateY(-15deg) rotateX(-1deg) translateY(${y4}px) scale(${scale4})`, 'important');
      }
    }

    // 4b. ENTRADA: CÁPSULA GESTIÓN ACADÉMICA (debajo de Comunidad Educativa, progress: 0.48 -> 0.62)
    const tPill3 = Math.min(1, Math.max(0, (progress - 0.48) / 0.14));
    if (subpillGestionEl) {
      if (tPill3 <= 0.005) {
        subpillGestionEl.style.setProperty('opacity', '0', 'important');
        subpillGestionEl.style.setProperty('pointer-events', 'none', 'important');
        subpillGestionEl.style.setProperty('transform', 'translateX(-50%) scale(0.95)', 'important');
      } else {
        subpillGestionEl.style.setProperty('opacity', tPill3.toFixed(3), 'important');
        subpillGestionEl.style.setProperty('pointer-events', tPill3 > 0.4 ? 'auto' : 'none', 'important');
        const scaleP3 = (0.95 + 0.05 * tPill3).toFixed(3);
        subpillGestionEl.style.setProperty('transform', `translateX(-50%) scale(${scaleP3})`, 'important');
      }
    }

    // Indicador de Fase y Texto de Guía
    if (progress > 0.60) {
      currentPhase = 4;
      if (cueTextEl) cueTextEl.textContent = 'Ecosistema Educativo Completo';
      if (phaseDot1El) phaseDot1El.classList.remove('is-active');
      if (phaseDot2El) phaseDot2El.classList.add('is-active');
    } else if (progress > 0.46) {
      currentPhase = 3;
      if (cueTextEl) cueTextEl.textContent = 'Comunidad Educativa & Gestión';
      if (phaseDot1El) phaseDot1El.classList.remove('is-active');
      if (phaseDot2El) phaseDot2El.classList.add('is-active');
    } else if (progress > 0.32) {
      currentPhase = 2;
      if (cueTextEl) cueTextEl.textContent = 'Recursos & Guías Interactivas';
      if (phaseDot1El) phaseDot1El.classList.remove('is-active');
      if (phaseDot2El) phaseDot2El.classList.add('is-active');
    } else if (progress > 0.16) {
      currentPhase = 1;
      if (cueTextEl) cueTextEl.textContent = 'Progreso & Preparación Saber 11';
      if (phaseDot1El) phaseDot1El.classList.add('is-active');
      if (phaseDot2El) phaseDot2El.classList.remove('is-active');
    } else if (progress > 0.05) {
      currentPhase = 1;
      if (cueTextEl) cueTextEl.textContent = 'Agenda Digital';
      if (phaseDot1El) phaseDot1El.classList.add('is-active');
      if (phaseDot2El) phaseDot2El.classList.remove('is-active');
    } else {
      currentPhase = 0;
      if (cueTextEl) cueTextEl.textContent = 'Desliza para continuar';
      if (phaseDot1El) phaseDot1El.classList.add('is-active');
      if (phaseDot2El) phaseDot2El.classList.remove('is-active');
    }

    // Suavizado del indicador de scroll hacia el final de la pista
    if (scrollCueEl) {
      const cueAlpha = progress > 0.88 ? Math.max(0, (1 - progress) / 0.12) : 1;
      scrollCueEl.style.setProperty('opacity', cueAlpha.toFixed(3), 'important');
      scrollCueEl.style.pointerEvents = cueAlpha < 0.1 ? 'none' : 'auto';
    }
  }

  // Public Navigation Functions
  window.advanceColegiosHeroScroll = function() {
    if (!trackEl) return;
    const rect = trackEl.getBoundingClientRect();
    const trackTop = window.scrollY + rect.top;
    const windowH = window.innerHeight;
    const scrollDist = trackEl.offsetHeight - windowH;

    if (currentPhase < 4) {
      const targetProgress = Math.min(0.72, 0.20 + currentPhase * 0.18);
      const targetY = trackTop + scrollDist * targetProgress;
      smoothScrollTo(targetY);
    } else {
      const nextSec = document.getElementById('el-problema');
      if (nextSec) {
        smoothScrollTo(nextSec.offsetTop);
      } else {
        smoothScrollTo(trackTop + scrollDist + 10);
      }
    }
  };

  window.scrollHeroToPhase = function(phaseIdx) {
    if (!trackEl) return;
    const rect = trackEl.getBoundingClientRect();
    const trackTop = window.scrollY + rect.top;
    const scrollDist = trackEl.offsetHeight - window.innerHeight;

    if (phaseIdx === 0) {
      smoothScrollTo(trackTop);
    } else {
      smoothScrollTo(trackTop + scrollDist * 0.65);
    }
  };

  window.scrollToColegiosStage = function() {
    window.advanceColegiosHeroScroll();
  };

  window.setColegiosHeroProgress = function(p) {
    lastProgress = -1;
    updateTransition(p);
  };

  function smoothScrollTo(targetY) {
    if (window.lenisInstance && typeof window.lenisInstance.scrollTo === 'function') {
      window.lenisInstance.scrollTo(targetY, { duration: 1.1 });
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.reinitColegiosHeroScroll = function() {
    lastProgress = -1;
    init();
    calculateScrollProgress();
  };

})();
