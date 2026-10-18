/* ==========================================================================
   SYNAPSE / DIGITAL S-COOL • WORLD VIDEO SCRUBBER ENGINE (HTML5 CANVAS)
   Smooth 60FPS Video Scrubbing on Scroll for Colegios, Idiomas, and Emisora
   ========================================================================== */

class WorldVideoScrubber {
  constructor(config) {
    this.worldId = config.worldId;
    this.canvasId = config.canvasId;
    this.stageId = config.stageId;
    this.framesDir = config.framesDir;
    this.totalFrames = config.totalFrames || 192;
    this.counterId = config.counterId;
    this.progressId = config.progressId;
    this.playBtnId = config.playBtnId;

    this.canvas = null;
    this.ctx = null;
    this.stage = null;
    this.images = [];
    this.currentFrame = 0;
    this.isLoaded = false;
    this.isPlaying = false;
    this.playRaf = null;

    this.init();
  }

  init() {
    this.canvas = document.getElementById(this.canvasId);
    this.stage = document.getElementById(this.stageId);
    if (!this.canvas || !this.stage) return;

    this.ctx = this.canvas.getContext('2d');
    this.setupResize();
    this.preloadFrames();
    this.bindEvents();
  }

  setupResize() {
    const resize = () => {
      if (!this.canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = this.canvas.getBoundingClientRect();
      const w = rect.width > 0 ? rect.width : (window.innerWidth || 1440);
      const h = rect.height > 0 ? rect.height : (window.innerHeight || 900);
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
      this.drawFrame(this.currentFrame);
    };

    window.addEventListener('resize', resize, { passive: true });
    resize();
  }

  preloadFrames() {
    // 1. Immediately load frame 1 to display crisp poster image
    const firstImg = new Image();
    firstImg.src = `${this.framesDir}/frame_0001.webp`;
    firstImg.onload = () => {
      this.images[0] = firstImg;
      if (this.currentFrame === 0) {
        this.drawFrame(0);
      }
    };
    this.images[0] = firstImg;
  }

  loadRemainingFrames() {
    if (this._hasLoadedRemaining) return;
    this._hasLoadedRemaining = true;

    // Load remaining frames when this world is actually viewed or scrubbed
    for (let i = 1; i < this.totalFrames; i++) {
      const img = new Image();
      const frameNum = (i + 1).toString().padStart(4, '0');
      img.src = `${this.framesDir}/frame_${frameNum}.webp`;
      img.onload = () => {
        if (this.currentFrame === i) {
          this.drawFrame(i);
        }
      };
      this.images[i] = img;
    }
  }

  drawFrame(frameIndex) {
    if (!this.ctx || !this.canvas) return;
    if (frameIndex > 0 && !this._hasLoadedRemaining) {
      this.loadRemainingFrames();
    }
    frameIndex = Math.max(0, Math.min(this.totalFrames - 1, Math.round(frameIndex)));
    this.currentFrame = frameIndex;

    let img = this.images[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) {
      // Look back for latest loaded frame
      for (let offset = 1; offset <= frameIndex; offset++) {
        const fallback = this.images[frameIndex - offset];
        if (fallback && fallback.complete && fallback.naturalWidth > 0) {
          img = fallback;
          break;
        }
      }
    }

    if (img && img.complete && img.naturalWidth > 0) {
      const cw = this.canvas.width || 1440;
      const ch = this.canvas.height || 900;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;

      // Fit contain inside canvas
      const scale = Math.min(cw / iw, ch / ih);
      const nw = iw * scale;
      const nh = ih * scale;
      const x = (cw - nw) / 2;
      const y = (ch - nh) / 2;

      this.ctx.clearRect(0, 0, cw, ch);
      this.ctx.drawImage(img, x, y, nw, nh);
    }

    // Update HUD Counter & Progress Bar
    this.updateHUD(frameIndex);
  }

  updateHUD(frameIndex) {
    const percent = ((frameIndex / (this.totalFrames - 1)) * 100).toFixed(1);

    if (this.counterId) {
      const counterEl = document.getElementById(this.counterId);
      if (counterEl) {
        counterEl.textContent = `${(frameIndex + 1).toString().padStart(3, '0')} / ${this.totalFrames}`;
      }
    }

    if (this.progressId) {
      const progressEl = document.getElementById(this.progressId);
      if (progressEl) {
        progressEl.style.width = `${percent}%`;
      }
    }
  }

  bindEvents() {
    // Scroll driven scrubber
    const handleScroll = () => {
      if (this.isPlaying || !this.stage) return;
      const rect = this.stage.getBoundingClientRect();
      const stageHeight = this.stage.offsetHeight;
      const windowHeight = window.innerHeight;

      // When stage is in view
      if (rect.top <= 0 && rect.bottom >= windowHeight) {
        const scrolled = -rect.top;
        const scrollable = stageHeight - windowHeight;
        const progress = Math.max(0, Math.min(1, scrolled / scrollable));
        const targetFrame = Math.floor(progress * (this.totalFrames - 1));
        this.drawFrame(targetFrame);
      } else if (rect.top > 0) {
        this.drawFrame(0);
      } else if (rect.bottom < windowHeight) {
        this.drawFrame(this.totalFrames - 1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Click/Drag on Scrubber Progress Bar Wrap
    if (this.progressId) {
      const barWrap = document.getElementById(this.progressId)?.parentElement;
      if (barWrap) {
        barWrap.addEventListener('click', (e) => {
          const rect = barWrap.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          const targetFrame = Math.floor(ratio * (this.totalFrames - 1));
          this.drawFrame(targetFrame);
        });
      }
    }
  }

  toggleAutoPlay() {
    this.isPlaying = !this.isPlaying;
    const btn = this.playBtnId ? document.getElementById(this.playBtnId) : null;

    if (btn) {
      if (this.isPlaying) {
        btn.classList.add('is-playing');
        btn.innerHTML = `<span class="play-icon">⏸</span> Pausar`;
      } else {
        btn.classList.remove('is-playing');
        btn.innerHTML = `<span class="play-icon">▶</span> Auto-Play`;
      }
    }

    if (this.isPlaying) {
      let lastTime = performance.now();
      const fpsInterval = 1000 / 24; // 24 FPS playback

      const loop = (currentTime) => {
        if (!this.isPlaying) return;
        const elapsed = currentTime - lastTime;

        if (elapsed > fpsInterval) {
          lastTime = currentTime - (elapsed % fpsInterval);
          let nextFrame = this.currentFrame + 1;
          if (nextFrame >= this.totalFrames) nextFrame = 0;
          this.drawFrame(nextFrame);
        }
        this.playRaf = requestAnimationFrame(loop);
      };
      this.playRaf = requestAnimationFrame(loop);
    } else {
      if (this.playRaf) cancelAnimationFrame(this.playRaf);
    }
  }
}

// Global registry of world scrubbers
window.worldScrubbers = {};

window.initWorldScrubbers = function() {
  // 1. Colegios (Virtual Agenda 3D)
  if (!window.worldScrubbers.colegios && document.getElementById('canvas-scrub-colegios')) {
    window.worldScrubbers.colegios = new WorldVideoScrubber({
      worldId: 'colegios',
      canvasId: 'canvas-scrub-colegios',
      stageId: 'stage-scrub-colegios',
      framesDir: 'assets/frames_colegios',
      totalFrames: 192,
      counterId: 'counter-colegios',
      progressId: 'progress-colegios',
      playBtnId: 'playbtn-colegios'
    });
  }

  // 2. Idiomas (TEF Canadá & IELTS)
  if (!window.worldScrubbers.idiomas && document.getElementById('canvas-scrub-idiomas')) {
    window.worldScrubbers.idiomas = new WorldVideoScrubber({
      worldId: 'idiomas',
      canvasId: 'canvas-scrub-idiomas',
      stageId: 'stage-scrub-idiomas',
      framesDir: 'assets/frames_idiomas',
      totalFrames: 192,
      counterId: 'counter-idiomas',
      progressId: 'progress-idiomas',
      playBtnId: 'playbtn-idiomas'
    });
  }

  // 3. Emisora (Intro 3D Orbital)
  if (!window.worldScrubbers.emisora && document.getElementById('canvas-scrub-emisora')) {
    window.worldScrubbers.emisora = new WorldVideoScrubber({
      worldId: 'emisora',
      canvasId: 'canvas-scrub-emisora',
      stageId: 'stage-scrub-emisora',
      framesDir: 'assets/frames_emisora',
      totalFrames: 192,
      counterId: 'counter-emisora',
      progressId: 'progress-emisora',
      playBtnId: 'playbtn-emisora'
    });
  }
};

window.toggleWorldAutoPlay = function(worldId) {
  if (window.worldScrubbers && window.worldScrubbers[worldId]) {
    window.worldScrubbers[worldId].toggleAutoPlay();
  }
};
