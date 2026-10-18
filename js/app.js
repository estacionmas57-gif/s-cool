/* ==========================================================================
   AURA • APP COORDINATOR & SOUND SYNTHESIZER
   ========================================================================== */

class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.enabled = true; // Subtle audio on interaction
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSnap() {
    if (!this.enabled) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  }
}

window.soundFx = new SoundSynthesizer();

/* ==========================================================================
   SUITE APPS FROSTED DOCK DATA & CONTROLLER
   ========================================================================== */
const SUITE_APPS_DATA = [
  {
    id: 'elan',
    kicker: 'Francés Migratorio',
    title: 'ÉLAN TEF Canada',
    badge: 'NCLC 7+',
    ecosystem: 'idiomas',
    ecosystemTitle: 'Idiomas',
    desc: 'Preparación integral con simulador cronometrado oficial y rúbricas NCLC 7+.',
    photos: [
      { src: 'assets/images/elan_tef_wide.jpg', alt: 'Plataforma interactiva ÉLAN TEF' },
      { src: 'assets/images/elan_tef_thumb1.jpg', alt: 'Estudiante en biblioteca' },
      { src: 'assets/images/elan_tef_thumb2.jpg', alt: 'Campus universitario Canadá' }
    ]
  },
  {
    id: 'apex',
    kicker: 'Inglés Internacional',
    title: 'APEX IELTS',
    badge: 'Band 8.5+',
    ecosystem: 'idiomas',
    ecosystemTitle: 'Idiomas',
    desc: 'Dominio comunicativo global evaluado bajo las 4 rúbricas oficiales de Cambridge.',
    photos: [
      { src: 'screenshot_video_card_preview.png', alt: 'Laboratorio de Idiomas' },
      { src: 'saber_frames/frame_0066.webp', alt: 'Práctica auditiva y fonética' },
      { src: 'saber_frames/frame_0082.webp', alt: 'Certificación internacional' }
    ]
  },
  {
    id: 'vector',
    kicker: 'Saber 11 Preicfes',
    title: 'VECTOR 11',
    badge: '400+ Pts',
    ecosystem: 'colegios',
    ecosystemTitle: 'Colegios',
    desc: 'Simulacros adaptativos de alta fidelidad y razonamiento cuantitativo de élite.',
    photos: [
      { src: 'saber_frames/frame_0045.webp', alt: 'Aula Interactiva 3D' },
      { src: 'saber_frames/frame_0060.webp', alt: 'Banco de preguntas analíticas' },
      { src: 'saber_frames/frame_0136.webp', alt: 'Simulacro cronometrado' }
    ]
  },
  {
    id: 'morpho',
    kicker: 'Editorial Inteligente',
    title: 'MORPHO GUIDES',
    badge: 'Guías Vivas',
    ecosystem: 'colegios',
    ecosystemTitle: 'Colegios',
    desc: 'Transformación del libro físico en guías digitales vivas con autocalificación al instante.',
    photos: [
      { src: 'screenshot_video_card_preview.png', alt: 'Guía viva interactiva' },
      { src: 'saber_frames/frame_0140.webp', alt: 'Evaluación formativa' },
      { src: 'saber_frames/frame_0163.webp', alt: 'Métricas pedagógicas' }
    ]
  },
  {
    id: 'pulse',
    kicker: 'Gestión Institucional',
    title: 'PULSE ACADÉMICO',
    badge: 'Agenda 360',
    ecosystem: 'colegios',
    ecosystemTitle: 'Colegios',
    desc: 'Gestión escolar integral, alertas tempranas de deserción y analítica directiva.',
    photos: [
      { src: 'saber_frames/frame_0252.webp', alt: 'Tablero directivo 360' },
      { src: 'saber_frames/frame_0210.webp', alt: 'Alertas tempranas' },
      { src: 'saber_frames/frame_0260.webp', alt: 'Seguimiento curricular' }
    ]
  }
];

let currentSuiteAppIndex = 0;
window._manualClickLock = false;
let _manualLockTimer = null;

// Synchronize 3 Ecosystem Bubbles with active Dock App
window.syncEcosystemBubbles = function(index) {
  const app = SUITE_APPS_DATA[index];
  if (!app) return;

  const bColegios = document.getElementById('bubble-colegios');
  const bIdiomas = document.getElementById('bubble-idiomas');
  const bEmisora = document.getElementById('bubble-emisora');

  if (app.ecosystem === 'idiomas') {
    if (bIdiomas) {
      bIdiomas.classList.add('is-active-pillar');
      bIdiomas.classList.remove('is-dormant-pillar');
    }
    if (bColegios) {
      bColegios.classList.remove('is-active-pillar');
      bColegios.classList.add('is-dormant-pillar');
    }
    if (bEmisora) {
      bEmisora.classList.remove('is-active-pillar');
      bEmisora.classList.add('is-dormant-pillar');
    }
  } else if (app.ecosystem === 'colegios') {
    if (bColegios) {
      bColegios.classList.add('is-active-pillar');
      bColegios.classList.remove('is-dormant-pillar');
    }
    if (bIdiomas) {
      bIdiomas.classList.remove('is-active-pillar');
      bIdiomas.classList.add('is-dormant-pillar');
    }
    if (bEmisora) {
      bEmisora.classList.remove('is-active-pillar');
      bEmisora.classList.add('is-dormant-pillar');
    }
  }
};

// Handle clicks directly on the 3 Bubbles to command the Dock Accordion
window.handleBubbleClick = function(e, pillar) {
  if (e) e.preventDefault();
  if (window.soundFx && window.soundFx.playSnap) window.soundFx.playSnap();

  // Ensure hero is in visible range
  const scrollY = window.scrollY || window.pageYOffset || 0;
  if (scrollY > 1500) {
    const hero = document.getElementById('hero');
    if (hero) hero.scrollIntoView({ behavior: 'smooth' });
  }

  if (pillar === 'idiomas') {
    // If not currently on Idiomas, select ÉLAN TEF (0); if already on it, toggle to APEX IELTS (1)
    if (currentSuiteAppIndex !== 0 && currentSuiteAppIndex !== 1) {
      window.selectSuiteApp(0);
    } else {
      window.selectSuiteApp(currentSuiteAppIndex === 0 ? 1 : 0);
    }
  } else if (pillar === 'colegios') {
    // If not on Colegios (0 or 1), switch to VECTOR 11 (2); else cycle through 2, 3, 4
    if (currentSuiteAppIndex < 2) {
      window.selectSuiteApp(2);
    } else {
      const nextIndex = currentSuiteAppIndex === 2 ? 3 : (currentSuiteAppIndex === 3 ? 4 : 2);
      window.selectSuiteApp(nextIndex);
    }
  } else if (pillar === 'emisora') {
    // Emisora activation pulse and smooth scroll to section
    const bEmisora = document.getElementById('bubble-emisora');
    if (bEmisora) {
      bEmisora.classList.add('is-onair-pulse');
      setTimeout(() => bEmisora.classList.remove('is-onair-pulse'), 3500);
    }
    const emisoraHub = document.getElementById('emisora-hub');
    if (emisoraHub) {
      emisoraHub.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

// Handle clicking on the ecosystem badge inside the dock card
window.handleEcosystemPillClick = function(pillar) {
  if (pillar === 'idiomas') {
    const b = document.getElementById('bubble-idiomas');
    if (b) {
      b.classList.add('is-active-pillar');
      b.style.transform = 'scale(1.22) translateY(-4px)';
      setTimeout(() => b.style.transform = '', 380);
    }
  } else if (pillar === 'colegios') {
    const b = document.getElementById('bubble-colegios');
    if (b) {
      b.classList.add('is-active-pillar');
      b.style.transform = 'scale(1.22) translateY(-4px)';
      setTimeout(() => b.style.transform = '', 380);
    }
  }
};

window.selectSuiteApp = function(index, isScrollDriven = false) {
  if (index < 0 || index >= SUITE_APPS_DATA.length) return;
  if (!isScrollDriven) {
    window._manualClickLock = true;
    if (_manualLockTimer) clearTimeout(_manualLockTimer);
    _manualLockTimer = setTimeout(() => {
      window._manualClickLock = false;
    }, 1800);
  }

  if (currentSuiteAppIndex === index && isScrollDriven) return;
  currentSuiteAppIndex = index;

  window.renderSuiteAccordion(index);
  window.syncEcosystemBubbles(index);

  if (!isScrollDriven && window.soundFx) window.soundFx.playSnap();
};

window.renderSuiteAccordion = function(activeIndex = currentSuiteAppIndex) {
  const container = document.getElementById('dock-accordion-list');
  if (!container) return;

  const sparkleSvg = `
    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
      <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z"/>
    </svg>`;

  let html = '';

  SUITE_APPS_DATA.forEach((app, i) => {
    if (i === activeIndex) {
      // Expanded active card in place
      html += `
        <div class="dock-accordion-slot dock-slot-expanded" data-index="${i}">
          <div class="dock-hero-card" id="dock-hero-card">
            <div class="dock-card-top-row">
              <div class="dock-card-titles">
                <div class="dock-ecosystem-tag-row">
                  <span class="dock-card-kicker" id="dock-active-kicker">${app.kicker}</span>
                  <button class="dock-ecosystem-pill" onclick="handleEcosystemPillClick('${app.ecosystem}')" title="Pilar ${app.ecosystemTitle} (Ver burbuja interactiva)">
                    <span class="eco-pill-dot"></span>
                    <span>${app.ecosystemTitle}</span>
                    <span class="eco-pill-sparkle">✦</span>
                  </button>
                </div>
                <h3 class="dock-card-title" id="dock-active-title">${app.title}</h3>
              </div>
              <button class="dock-action-circle" id="dock-action-btn" title="Explorar esta aplicación" aria-label="Explorar aplicación" onclick="handleActiveCardClick()">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            <p class="dock-card-description" id="dock-active-desc">
              ${app.desc}
            </p>

            <div class="dock-photos-strip" id="dock-photos-strip">
              <div class="dock-photo-box dock-photo-wide">
                <img id="dock-img-wide" src="${app.photos[0].src}" alt="${app.photos[0].alt}">
              </div>
              <div class="dock-photo-box dock-photo-thumb">
                <img id="dock-img-thumb1" src="${app.photos[1].src}" alt="${app.photos[1].alt}">
              </div>
              <div class="dock-photo-box dock-photo-thumb">
                <img id="dock-img-thumb2" src="${app.photos[2].src}" alt="${app.photos[2].alt}">
              </div>
            </div>

            <div class="dock-pagination-capsule" id="dock-pagination-capsule">
              ${SUITE_APPS_DATA.map((dotApp, dotIdx) => `
                <span class="dock-pag-indicator ${dotIdx === i ? 'active' : ''}" onclick="selectSuiteApp(${dotIdx})" data-index="${dotIdx}" title="${dotApp.title}"></span>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    } else {
      // Collapsed minimal row
      html += `
        <div class="dock-accordion-slot dock-slot-collapsed" data-index="${i}" onclick="selectSuiteApp(${i})" role="button" tabindex="0" title="Ver detalles de ${app.title}">
          <div class="dock-sub-row">
            <div class="dock-sub-sparkle">${sparkleSvg}</div>
            <div class="dock-sub-text">
              <span class="dock-sub-kicker">${app.kicker}</span>
              <span class="dock-sub-title">${app.title}</span>
            </div>
          </div>
        </div>
      `;
    }
  });

  container.innerHTML = html;
};

window.handleActiveCardClick = function() {
  window.jumpToAppHero(currentSuiteAppIndex);
};

window.jumpToAppHero = function(index) {
  if (typeof window.jumpToApp === 'function') {
    window.jumpToApp(index);
  } else {
    const cardMap = ['card-elan', 'card-apex', 'card-vector', 'card-morpho', 'card-pulse'];
    const el = document.getElementById(cardMap[index]) || document.getElementById('scrolly-showcase');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
};

window.updateSuiteAppOnScroll = function(scrollY, heroScrollRange) {
  if (window._manualClickLock) return;

  if (scrollY < 20) {
    if (currentSuiteAppIndex !== 0) {
      window.selectSuiteApp(0, true);
    }
    return;
  }

  const effectiveRange = Math.max(1200, (heroScrollRange || 1800));
  const step = effectiveRange / 5;
  const targetIndex = Math.min(4, Math.max(0, Math.floor(scrollY / step)));

  if (targetIndex !== currentSuiteAppIndex) {
    window.selectSuiteApp(targetIndex, true);
  }
};

// Global scroll listener for dock and bubbles appearance
function updateHeroAppsDockScroll() {
  const scrollY = window.scrollY || window.pageYOffset || 0;
  const heroStage = document.getElementById('hero');
  const heroScrollRange = heroStage ? Math.max(600, heroStage.offsetHeight - window.innerHeight) : 1600;

  const dock = document.getElementById('hero-apps-dock');
  if (dock) {
    if (scrollY > 20 && scrollY < heroScrollRange + 80) {
      dock.classList.add('scrolled-in');
    } else {
      dock.classList.remove('scrolled-in');
    }
  }

  const bubbles = document.getElementById('ecosystem-bubbles-dock');
  if (bubbles) {
    if (window.currentWorld === 'inicio' || window.currentWorld === 'prueba') {
      bubbles.classList.add('scrolled-out');
      bubbles.style.display = 'none';
    } else if (scrollY > heroScrollRange + 80) {
      bubbles.classList.add('scrolled-out');
    } else {
      bubbles.classList.remove('scrolled-out');
    }
  }

  window.updateSuiteAppOnScroll(scrollY, heroScrollRange);
}

window.addEventListener('scroll', updateHeroAppsDockScroll, { passive: true });

document.addEventListener('DOMContentLoaded', () => {
  initLenis();

  // Initialize Modules Safely
  try {
    if (window.initClassroom3D) window.initClassroom3D();
    else if (window.initMonolith3D) window.initMonolith3D();
    else if (window.initSpheres3D) window.initSpheres3D();
  } catch (e) {
    console.error('Classroom 3D error:', e);
  }
  try { if (window.initScrollytelling) window.initScrollytelling(); } catch (e) { console.error('Scrolly error:', e); }
  try { if (window.initMicrointeractions) window.initMicrointeractions(); } catch (e) { console.error('Micro error:', e); }
  try { 
    if (window.renderSuiteAccordion) window.renderSuiteAccordion(0); 
    if (window.syncEcosystemBubbles) window.syncEcosystemBubbles(0);
  } catch (e) { console.error('Accordion error:', e); }

  if (window.ScrollTrigger) {
    ScrollTrigger.refresh();
  }
});

window.addEventListener('load', () => {
  if (window.ScrollTrigger) {
    ScrollTrigger.refresh();
  }
});

function initLenis() {
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    window.lenisInstance = lenis;

    if (window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }
}
