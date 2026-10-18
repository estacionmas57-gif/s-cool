/* ==========================================================================
   SYNAPSE • STACKING CARDS DECK ANIMATION ENGINE (BARAJA EN SCROLL)
   Smooth GSAP ScrollTrigger Physical Depth & 3D Layering
   ========================================================================== */

(function() {
  function initStackingDeck() {
    const containers = document.querySelectorAll('.stacking-cards-container');
    if (!containers || containers.length === 0) return;

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not loaded, using pure CSS sticky stacking.');
      containers.forEach(container => {
        const cards = container.querySelectorAll('.stacking-card');
        cards.forEach((card, idx) => card.style.setProperty('--card-index', idx));
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    containers.forEach(container => {
      const cards = container.querySelectorAll('.stacking-card');
      cards.forEach((card, idx) => {
        card.style.setProperty('--card-index', idx);
      });

      cards.forEach((card, i) => {
        if (i === cards.length - 1) return; // Last card stays on top

        const nextCard = cards[i + 1];

        ScrollTrigger.create({
          trigger: nextCard,
          start: 'top 85%',
          end: 'top 15%',
          scrub: 0.6,
          onUpdate: (self) => {
            const progress = self.progress; // 0 to 1
            const targetScale = 1 - (progress * 0.055);
            const targetBrightness = 1 - (progress * 0.28);
            const targetBlur = progress * 1.2;

            gsap.set(card, {
              scale: targetScale,
              filter: `brightness(${targetBrightness}) blur(${targetBlur}px)`,
              transformOrigin: 'top center',
              boxShadow: `0 -${14 + progress * 8}px 40px -10px rgba(0, 0, 0, 0.85)`
            });
          }
        });
      });
    });

    // Refresh triggers on resize
    window.addEventListener('resize', () => {
      ScrollTrigger.refresh();
    }, { passive: true });
  }

  // Card CTA Click Handler (Quick Navigation)
  window.handleDeckCardCta = function(e, worldTarget) {
    if (e) e.preventDefault();
    if (window.soundFx && window.soundFx.playSnap) window.soundFx.playSnap();

    if (worldTarget && window.switchWorld) {
      window.switchWorld(worldTarget);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initStackingDeck, 300);
    });
  } else {
    setTimeout(initStackingDeck, 300);
  }
})();
