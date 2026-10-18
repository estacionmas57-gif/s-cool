/* ==========================================================================
   SYNAPSE / DIGITAL S-COOL • WORLD TABS ROUTER & STATE MANAGER
   Navigation between: S-cool Hub • Colegios • Idiomas • Emisora
   ========================================================================== */

window.currentWorld = 'inicio';

window.switchWorld = function(worldId, pushHash = true) {
  if (!worldId) worldId = 'inicio';
  window.currentWorld = worldId;
  document.body.setAttribute('data-current-world', worldId);

  // 1. Update Tab Bar Buttons & Close Dropdown if Open
  const bar = document.getElementById('world-tab-bar');
  if (bar) bar.classList.remove('is-menu-open');
  const toggle = document.getElementById('world-tab-toggle');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');

  const tabBtns = document.querySelectorAll('.world-tab-btn');
  tabBtns.forEach(btn => {
    if (btn.getAttribute('data-world') === worldId) {
      btn.classList.add('is-active');
    } else {
      btn.classList.remove('is-active');
    }
  });

  // 2. Update World Views Visibility
  const views = document.querySelectorAll('.world-view');
  views.forEach(view => {
    if (view.id === `view-${worldId}`) {
      view.classList.add('is-active');
    } else {
      view.classList.remove('is-active');
    }
  });

  // 3. Handle Hub 3D Elements Visibility
  const spheresCanvas = document.getElementById('spheres-canvas-container');
  const ecosystemBubbles = document.getElementById('ecosystem-bubbles-dock');
  const replayBtn = document.getElementById('hero-replay-btn');

  if (worldId === 'hub') {
    if (typeof window.set3DLogoTheme === 'function') {
      window.set3DLogoTheme('default');
    }
    if (spheresCanvas) {
      spheresCanvas.style.display = 'block';
      spheresCanvas.style.opacity = '1';
    }
    if (ecosystemBubbles) {
      ecosystemBubbles.style.display = 'block';
      ecosystemBubbles.style.opacity = '1';
      ecosystemBubbles.style.pointerEvents = 'auto';
    }
    if (replayBtn) replayBtn.style.display = 'inline-flex';
  } else if (worldId === 'prueba') {
    // Activate integrated velvet crimson & amber gold 3D logo beside the character's face!
    if (typeof window.set3DLogoTheme === 'function') {
      window.set3DLogoTheme('prueba');
    }
    if (spheresCanvas) {
      spheresCanvas.style.display = 'block';
      spheresCanvas.style.opacity = '1';
    }
    if (ecosystemBubbles) {
      ecosystemBubbles.style.display = 'none';
      ecosystemBubbles.style.pointerEvents = 'none';
    }
  } else if (worldId === 'inicio') {
    if (spheresCanvas) {
      spheresCanvas.style.display = 'none';
      spheresCanvas.style.opacity = '0';
    }
    if (ecosystemBubbles) {
      ecosystemBubbles.style.display = 'none';
      ecosystemBubbles.style.pointerEvents = 'none';
    }
    if (replayBtn) replayBtn.style.display = 'none';
  } else {
    // Dim background spheres slightly and hide bubbles to focus on world content
    if (spheresCanvas) {
      spheresCanvas.style.display = 'block';
      spheresCanvas.style.opacity = '0.35';
    }
    if (ecosystemBubbles) {
      ecosystemBubbles.style.display = 'none';
      ecosystemBubbles.style.pointerEvents = 'none';
    }
    if (replayBtn) replayBtn.style.display = 'none';
  }

  // 4. Scroll to top of the newly activated world (both native and Lenis)
  if (window.lenisInstance && typeof window.lenisInstance.scrollTo === 'function') {
    window.lenisInstance.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Refresh ScrollTrigger and scrollytelling triggers for the newly active view
  if (typeof ScrollTrigger !== 'undefined') {
    setTimeout(() => {
      ScrollTrigger.refresh();
      if (worldId === 'colegios' && typeof window.initScrollytelling === 'function') {
        window.initScrollytelling();
      }
    }, 60);
  }

  // 5. Trigger Scrubber Resize / Draw for this world
  if (window.initWorldScrubbers) {
    window.initWorldScrubbers();
  }

  if (window.worldScrubbers && window.worldScrubbers[worldId]) {
    window.worldScrubbers[worldId].setupResize();
    window.worldScrubbers[worldId].drawFrame(0);
    setTimeout(() => {
      window.worldScrubbers[worldId].setupResize();
      window.worldScrubbers[worldId].drawFrame(0);
    }, 60);
  }

  // 5b. Mainframe (Prueba Tab) Lifecycle Management
  if (worldId === 'prueba') {
    if (typeof window.activateMainframe === 'function') {
      window.activateMainframe();
    }
  } else {
    if (typeof window.deactivateMainframe === 'function') {
      window.deactivateMainframe();
    }
  }

  // 5c. July Experiences Lifecycle Management (Idiomas Mouse Track & Hub Scroll Scrub)
  if (worldId === 'idiomas') {
    if (typeof window.onJulyIdiomasActivated === 'function') {
      window.onJulyIdiomasActivated();
    }
  } else {
    if (typeof window.onJulyIdiomasDeactivated === 'function') {
      window.onJulyIdiomasDeactivated();
    }
  }

  if (worldId === 'hub') {
    if (typeof window.onJulyHubActivated === 'function') {
      window.onJulyHubActivated();
    }
  } else {
    if (typeof window.onJulyHubDeactivated === 'function') {
      window.onJulyHubDeactivated();
    }
  }

  // 5d. Inicio Lifecycle Management
  if (worldId === 'inicio') {
    if (typeof window.onInicioActivated === 'function') {
      window.onInicioActivated();
    }
  } else {
    if (typeof window.onInicioDeactivated === 'function') {
      window.onInicioDeactivated();
    }
  }

  // 5e. Colegios Lifecycle Management
  if (worldId === 'colegios') {
    if (typeof window.reinitColegiosHeroScroll === 'function') {
      window.reinitColegiosHeroScroll();
    }
  }

  // 6. Update URL Hash
  if (pushHash && history.pushState) {
    history.pushState(null, null, `#${worldId}`);
  }

  // 7. Refresh ScrollTrigger / Lenis
  if (window.ScrollTrigger) {
    setTimeout(() => ScrollTrigger.refresh(), 200);
  }

  // 8. Dispatch worldChanged Custom Event
  window.dispatchEvent(new CustomEvent('worldChanged', { detail: { world: worldId } }));
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

