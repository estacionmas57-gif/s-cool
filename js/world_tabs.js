/* ==========================================================================
   SYNAPSE / DIGITAL S-COOL • WORLD TABS ROUTER & STATE MANAGER
   Navigation between: S-cool Hub • Colegios • Idiomas • Emisora
   ========================================================================== */

window.currentWorld = 'inicio';

window.switchWorld = function(targetWorldId, pushHash = true) {
  // Restricción: Solo queda activo el Home (Inicio).
  // Clics en Colegios, S-cool Hub, Idiomas, Emisora o Prueba siempre llevan al inicio.
  const worldId = 'inicio';
  window.currentWorld = 'inicio';
  document.body.setAttribute('data-current-world', 'inicio');

  // 1. Cerrar menú desplegable de Ecosistemas si está abierto
  const bar = document.getElementById('world-tab-bar');
  if (bar) bar.classList.remove('is-menu-open');
  const toggle = document.getElementById('world-tab-toggle');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');

  // 2. Mantener Inicio como activo en la lista
  const tabBtns = document.querySelectorAll('.world-tab-btn');
  tabBtns.forEach(btn => {
    if (btn.getAttribute('data-world') === 'inicio') {
      btn.classList.add('is-active');
    } else {
      btn.classList.remove('is-active');
    }
  });

  // 3. Solo la vista de inicio permanece activa, todas las demás se ocultan
  const views = document.querySelectorAll('.world-view');
  views.forEach(view => {
    if (view.id === 'view-inicio') {
      view.classList.add('is-active');
    } else {
      view.classList.remove('is-active');
    }
  });

  // 4. Ocultar elementos de fondos ajenos al Home
  const spheresCanvas = document.getElementById('spheres-canvas-container');
  const ecosystemBubbles = document.getElementById('ecosystem-bubbles-dock');
  const replayBtn = document.getElementById('hero-replay-btn');

  if (spheresCanvas) {
    spheresCanvas.style.display = 'none';
    spheresCanvas.style.opacity = '0';
  }
  if (ecosystemBubbles) {
    ecosystemBubbles.style.display = 'none';
    ecosystemBubbles.style.opacity = '0';
    ecosystemBubbles.style.pointerEvents = 'none';
  }
  if (replayBtn) replayBtn.style.display = 'none';

  // 5. Desactivar otros ciclos de vida
  if (typeof window.deactivateMainframe === 'function') window.deactivateMainframe();
  if (typeof window.onJulyIdiomasDeactivated === 'function') window.onJulyIdiomasDeactivated();
  if (typeof window.onJulyHubDeactivated === 'function') window.onJulyHubDeactivated();

  // 6. Activar Home (Inicio)
  if (typeof window.onInicioActivated === 'function') {
    window.onInicioActivated();
  }

  // 7. Scroll suave y fluido hacia arriba del Home
  if (window.lenisInstance && typeof window.lenisInstance.scrollTo === 'function') {
    window.lenisInstance.scrollTo(0, { immediate: false, duration: 1.2 });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 8. Hash limpio en URL
  if (pushHash && history.pushState) {
    history.pushState(null, null, '#inicio');
  }

  // 9. Dispatch worldChanged Custom Event
  window.dispatchEvent(new CustomEvent('worldChanged', { detail: { world: 'inicio' } }));
};

// Wire up Bubble clicks to switch world
window.handleBubbleClick = function(e, pillar) {
  if (e) e.preventDefault();
  if (window.soundFx && window.soundFx.playSnap) window.soundFx.playSnap();

  if (pillar === 'colegios') {
    window.switchWorld('colegios');
  } else if (pillar === 'idiomas') {
    window.switchWorld('idiomas');
  } else if (pillar === 'emisora') {
    window.switchWorld('emisora');
  } else if (pillar === 'prueba') {
    window.switchWorld('prueba');
  }
};

window.scrollToColegiosStage = function() {
  if (typeof window.advanceColegiosHeroScroll === 'function') {
    window.advanceColegiosHeroScroll();
  } else {
    const target = document.getElementById('colegios-hero-track');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

// Handle Browser Back / Forward and Initial Hash
function handleHashChange() {
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (['inicio', 'hub', 'colegios', 'idiomas', 'emisora', 'prueba'].includes(hash)) {
    window.switchWorld(hash, false);
  } else {
    window.switchWorld('inicio', false);
  }
}

window.addEventListener('popstate', handleHashChange);

document.addEventListener('DOMContentLoaded', () => {
  // Check pathname or hash on load
  const initialHash = window.location.hash.replace('#', '').toLowerCase();
  const pathPart = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase();
  const validWorlds = ['inicio', 'hub', 'colegios', 'idiomas', 'emisora', 'prueba'];
  
  if (validWorlds.includes(pathPart)) {
    window.switchWorld(pathPart, false);
  } else if (validWorlds.includes(initialHash)) {
    window.switchWorld(initialHash, false);
  } else {
    window.switchWorld('inicio', false);
  }

  // Initialize Scrubbers
  setTimeout(() => {
    if (window.initWorldScrubbers) window.initWorldScrubbers();
  }, 300);
});

// Dropdown Navigation Toggle for Inicio Hero Corner Badge
window.toggleWorldNavMenu = function (e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const bar = document.getElementById('world-tab-bar');
  if (bar) {
    const isOpen = bar.classList.toggle('is-menu-open');
    const toggle = document.getElementById('world-tab-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
};

document.addEventListener('click', (e) => {
  const bar = document.getElementById('world-tab-bar');
  if (bar && bar.classList.contains('is-menu-open')) {
    if (!bar.contains(e.target)) {
      bar.classList.remove('is-menu-open');
      const toggle = document.getElementById('world-tab-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  }
});

// Interceptor global: Cualquier interacción hacia Colegios, S-cool Hub, Idiomas, Emisora o Prueba redirige a Inicio
document.addEventListener('click', (e) => {
  const target = e.target.closest('a, button, [data-world], [data-section]');
  if (!target) return;

  const href = (target.getAttribute('href') || '').toLowerCase();
  const dataWorld = (target.getAttribute('data-world') || '').toLowerCase();
  const dataSection = (target.getAttribute('data-section') || '').toLowerCase();
  const text = (target.textContent || '').trim().toLowerCase();

  const isEcosystemTrigger = 
    ['colegios', 'hub', 'idiomas', 'emisora', 'prueba'].includes(dataWorld) ||
    ['colegios', 'canadá', 'canada', 'emisora', 'idiomas', 'hub', 'prueba'].includes(dataSection) ||
    ['#colegios', '#hub', '#idiomas', '#emisora', '#prueba'].includes(href) ||
    href.startsWith('#view-colegios') || href.startsWith('#view-hub') || href.startsWith('#view-idiomas') || href.startsWith('#view-emisora') || href.startsWith('#view-prueba') ||
    text === 'colegios' || text === 's-cool hub' || text === 'idiomas' || text === 'emisora' || text === 'prueba';

  if (isEcosystemTrigger) {
    e.preventDefault();
    e.stopPropagation();
    window.switchWorld('inicio');
  }
}, true);

