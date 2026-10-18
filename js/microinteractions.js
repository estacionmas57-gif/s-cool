/* ==========================================================================
   AURA • MICROINTERACTIONS & INTERACTIVE CONSOLE
   ========================================================================== */

window.initMicrointeractions = function() {
  initCustomCursor();
  initGlassTiltCards();
  initAppConsoleDeck();
  initHeroTextScrollTransition();
};

// 1. Custom Magnetic Cursor
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const follower = document.getElementById('custom-cursor-follower');
  if (!cursor || !follower) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  function updateFollower() {
    followerX += (mouseX - followerX) * 0.16;
    followerY += (mouseY - followerY) * 0.16;
    follower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;
    requestAnimationFrame(updateFollower);
  }
  requestAnimationFrame(updateFollower);

  const interactiveSelector = 'a, button, .product-pill, .console-tab-btn, .step-indicator-item, .method-card, .scrolly-tab-btn, .scrolly-nav-arrow, .friction-card, .audience-card';
  document.querySelectorAll(interactiveSelector).forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovered');
      follower.classList.add('hovered');
      if (window.soundFx) window.soundFx.playSnap();
    });

    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovered');
      follower.classList.remove('hovered');
    });
  });
}

// 2. 3D Glass Tilt Effect
function initGlassTiltCards() {
  const cards = document.querySelectorAll('.hero-glass-slab, .method-card, .friction-card, .audience-card, .section-title-wrap');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      card.style.transition = 'transform 0.4s var(--ease-smooth)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });
}

// 3. Interactive App Console Deck (Switching between the 5 Apps)
function initAppConsoleDeck() {
  const tabBtns = document.querySelectorAll('.console-tab-btn');
  const panes = document.querySelectorAll('.pane-view');
  const saberVideo = document.getElementById('saber-console-video');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-pane');
      if (!targetId) return;

      if (window.soundFx) window.soundFx.playSnap();

      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      panes.forEach(pane => {
        if (pane.id === targetId) {
          pane.classList.add('active-pane');
        } else {
          pane.classList.remove('active-pane');
        }
      });

      if (saberVideo) {
        if (targetId === 'pane-vector') {
          saberVideo.play().catch(() => {});
        } else {
          saberVideo.pause();
        }
      }
    });
  });
}

// 4. Dynamic Contrast Transition for "NTO" letters in Hero
function initHeroTextScrollTransition() {
  const ntoEl = document.getElementById('hero-nto-letters');
  if (!ntoEl) return;

  const startRGB = { r: 255, g: 255, b: 255 }; // Pure white when over dark sphere
  const endRGB = { r: 68, g: 86, b: 96 };       // Slate blue #445660 matching the rest of the text
  const startScroll = 800;                      // Pure white while left typography and first cards reveal over sphere
  const endScroll = 2800;                       // Smoothly transitions to slate-blue as app cards finish docking

  function update() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    let progress = 0;
    if (scrollY <= startScroll) {
      progress = 0;
    } else if (scrollY >= endScroll) {
      progress = 1;
    } else {
      progress = (scrollY - startScroll) / (endScroll - startScroll);
    }

    const r = Math.round(startRGB.r + (endRGB.r - startRGB.r) * progress);
    const g = Math.round(startRGB.g + (endRGB.g - startRGB.g) * progress);
    const b = Math.round(startRGB.b + (endRGB.b - startRGB.b) * progress);
    const shadowAlpha = (0.55 * (1 - progress)).toFixed(3);

    ntoEl.style.color = `rgb(${r}, ${g}, ${b})`;
    if (shadowAlpha > 0.02) {
      ntoEl.style.textShadow = `0 2px 14px rgba(47, 62, 70, ${shadowAlpha}), 0 1px 3px rgba(0, 0, 0, ${(shadowAlpha * 0.5).toFixed(3)})`;
    } else {
      ntoEl.style.textShadow = 'none';
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  if (window.gsap && window.gsap.ticker) {
    window.gsap.ticker.add(update);
  }
  update();
}
