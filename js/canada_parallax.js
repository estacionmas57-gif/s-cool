/* ==========================================================================
   SYNAPSE • DESTINO CANADÁ 2.5D MULTI-PLANE PARALLAX ENGINE
   Multi-Velocity Layers:
   - Personaje (Primer Plano):  ≈ 5%
   - Iconos (Capa Intermedia):  ≈ 10%
   - Ciudad (Skyline Toronto):  ≈ 15%
   - Fondo (Cielo, Nubes, Avión): ≈ 3%
   ========================================================================== */

(function () {
  'use strict';

  let stageContainer = null;
  let canvas = null;
  let overlay = null;
  let scene, camera, renderer, material, mesh;
  let targetMouseX = 0, targetMouseY = 0;
  let curMouseX = 0, curMouseY = 0;
  let isHovered = false;
  let isVisible = false;
  let animId = null;

  function initCanadaParallax() {
    console.log('[CanadaParallax] Starting initCanadaParallax...');
    stageContainer = document.getElementById('canada-stage-container');
    canvas = document.getElementById('canada-gl-canvas');
    overlay = document.getElementById('canada-hotspots-overlay');

    if (!stageContainer || !canvas) {
      console.warn('[CanadaParallax] Missing stageContainer or canvas:', { stageContainer: !!stageContainer, canvas: !!canvas });
      return;
    }

    if (typeof THREE === 'undefined') {
      console.warn('[CanadaParallax] Three.js not loaded. Retrying in 200ms...');
      setTimeout(initCanadaParallax, 200);
      return;
    }
    console.log('[CanadaParallax] Initializing Three.js scene...');

    const rect = stageContainer.getBoundingClientRect();
    const width = rect.width || stageContainer.clientWidth || 1024;
    const height = rect.height || stageContainer.clientHeight || 546;

    // 1. Scene & Camera Setup
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if (renderer.outputEncoding !== undefined) {
      renderer.outputEncoding = THREE.sRGBEncoding;
    }

    // 2. Texture Loader with sRGB encoding and error handling
    const textureLoader = new THREE.TextureLoader();
    
    const imageTex = textureLoader.load(
      'assets/images/canada_hub_hero.jpg',
      (tex) => {
        console.log('[CanadaParallax] Image texture loaded successfully:', tex.image.width, 'x', tex.image.height);
        tex.needsUpdate = true;
        if (material) material.needsUpdate = true;
        if (renderer && scene && camera) renderer.render(scene, camera);
      },
      undefined,
      (err) => {
        console.error('[CanadaParallax] Failed to load image texture:', err);
      }
    );
    if (imageTex.encoding !== undefined) {
      imageTex.encoding = THREE.sRGBEncoding;
    }
    imageTex.minFilter = THREE.LinearFilter;
    imageTex.magFilter = THREE.LinearFilter;
    imageTex.generateMipmaps = false;

    const depthTex = textureLoader.load(
      'assets/images/canada_depth_map.png',
      (tex) => {
        console.log('[CanadaParallax] Depth texture loaded successfully:', tex.image.width, 'x', tex.image.height);
        tex.needsUpdate = true;
        if (material) material.needsUpdate = true;
        if (renderer && scene && camera) renderer.render(scene, camera);
      },
      undefined,
      (err) => {
        console.error('[CanadaParallax] Failed to load depth texture:', err);
      }
    );
    depthTex.minFilter = THREE.LinearFilter;
    depthTex.magFilter = THREE.LinearFilter;
    depthTex.generateMipmaps = false;

    // 3. 2.5D Depth Displacement Shader
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D uImage;
      uniform sampler2D uDepth;
      uniform vec2 uMouse;
      uniform vec2 uResolution;
      varying vec2 vUv;

      void main() {
        // Sample 8-bit depth map [0.0 to 1.0]
        float depth = texture2D(uDepth, vUv).r;

        // User specific layer speeds:
        // Fondo (sky/clouds, depth <= 0.28):       ≈ 3%  (0.03)
        // Ciudad (Toronto skyline, depth 0.28..0.58): ≈ 15% (0.15)
        // Iconos (floating badges, depth 0.58..0.82): ≈ 10% (0.10)
        // Personaje (girl/flag, depth >= 0.82):     ≈ 5%  (0.05)
        float factor = 0.03;
        if (depth < 0.28) {
          factor = 0.03;
        } else if (depth < 0.58) {
          float t = smoothstep(0.28, 0.44, depth);
          factor = mix(0.03, 0.15, t);
        } else if (depth < 0.82) {
          float t = smoothstep(0.58, 0.70, depth);
          factor = mix(0.15, 0.10, t);
        } else {
          float t = smoothstep(0.82, 0.92, depth);
          factor = mix(0.10, 0.05, t);
        }

        // Parallax displacement vector (accentuating horizontal travel as requested)
        vec2 displacement = vec2(uMouse.x * 0.20, uMouse.y * 0.10) * factor;

        // Inset scale (1.06) to ensure 0 edge bleed or clamping artefacts
        vec2 centeredUv = (vUv - 0.5) / 1.06 + 0.5;
        vec2 sampleUv = clamp(centeredUv + displacement, 0.001, 0.999);

        vec4 color = texture2D(uImage, sampleUv);
        gl_FragColor = color;
      }
    `;

    material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uImage: { value: imageTex },
        uDepth: { value: depthTex },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uResolution: { value: new THREE.Vector2(width, height) }
      },
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    // 4. Mouse / Pointer Tracking
    stageContainer.addEventListener('mousemove', onMouseMove, { passive: true });
    stageContainer.addEventListener('mouseenter', () => { isHovered = true; });
    stageContainer.addEventListener('mouseleave', () => {
      isHovered = false;
      targetMouseX = 0;
      targetMouseY = 0;
    });

    // Touch support (tablets & mobile)
    stageContainer.addEventListener('touchmove', onTouchMove, { passive: true });
    stageContainer.addEventListener('touchend', () => {
      targetMouseX = 0;
      targetMouseY = 0;
    });

    // Window Resize Handler
    window.addEventListener('resize', onResize, { passive: true });

    // 5. Intersection Observer to save GPU cycles when offscreen
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
        });
      }, { threshold: 0.05 });
      observer.observe(stageContainer);
    } else {
      isVisible = true;
    }

    // 6. Setup Hotspot Click Handlers
    setupHotspots();

    // 7. Initial Render & Loop
    onResize();
    animate();
  }

  function onMouseMove(e) {
    if (!stageContainer) return;
    const rect = stageContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    targetMouseX = ((x / rect.width) * 2 - 1);
    targetMouseY = -((y / rect.height) * 2 - 1);
  }

  function onTouchMove(e) {
    if (!stageContainer || !e.touches || e.touches.length === 0) return;
    const rect = stageContainer.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    targetMouseX = ((x / rect.width) * 2 - 1);
    targetMouseY = -((y / rect.height) * 2 - 1);
  }

  function onResize() {
    if (!stageContainer || !renderer || !material) return;
    const rect = stageContainer.getBoundingClientRect();
    const width = rect.width || stageContainer.clientWidth || 1024;
    const height = rect.height || stageContainer.clientHeight || 546;
    renderer.setSize(width, height);
    material.uniforms.uResolution.value.set(width, height);
  }

  function setupHotspots() {
    const hotspots = document.querySelectorAll('.canada-hotspot');
    hotspots.forEach(hs => {
      hs.addEventListener('click', function () {
        const appIdx = parseInt(this.getAttribute('data-app') || '0', 10);
        
        // Select app in the stacking cards deck
        if (typeof window.selectSuiteApp === 'function') {
          window.selectSuiteApp(appIdx);
        }
        if (window.soundFx && window.soundFx.playSnap) {
          window.soundFx.playSnap();
        }

        // Smooth scroll to the corresponding section or card
        const deck = document.getElementById('stacking-apps-deck');
        if (deck) {
          deck.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  function animate() {
    animId = requestAnimationFrame(animate);

    // Smooth inertia lerp (elastic ease out)
    curMouseX += (targetMouseX - curMouseX) * 0.08;
    curMouseY += (targetMouseY - curMouseY) * 0.08;

    if (material && material.uniforms) {
      material.uniforms.uMouse.value.set(curMouseX, curMouseY);
    }

    // 3D subtle card tilt
    if (stageContainer && isHovered) {
      const tiltX = -curMouseY * 3.5;
      const tiltY = curMouseX * 4.5;
      stageContainer.style.transform = `perspective(1200px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
    } else if (stageContainer) {
      stageContainer.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg)`;
    }

    // Translate HTML hotspots overlay (10% speed) so tooltips stay anchored to 3D badges
    if (overlay) {
      const offsetX = curMouseX * 20;
      const offsetY = -curMouseY * 10;
      overlay.style.transform = `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0)`;
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  // Auto-init on DOMContentLoaded or load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCanadaParallax);
  } else {
    setTimeout(initCanadaParallax, 150);
  }

  // Also expose global init in case tabs switch
  window.initCanadaParallax = initCanadaParallax;
})();
