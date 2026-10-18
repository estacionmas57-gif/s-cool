/* ==========================================================================
   DIGITAL S-COOL • 3D HERO ENVIRONMENT (Three.js WebGL + Blender GLB)
   - Initial State (Scroll = 0):
     * Pure 2D Frontal Perspective View (camera at x: 0, looking straight on)
     * 3 Left Ecosystem Tabs peek out discretely (only handle slice visible)
   - On Scroll:
     * 3 Left Tabs smoothly slide out fully (COLEGIOS, IDIOMAS, EMISORA)
     * 3D Typography Animation:
       - Camera smoothly sweeps into 3/4 perspective revealing depth & casing
       - Letter 'S' does a gentle floating buoyant tilt
       - Green Squircle Hyphen playfully spins and bobs in 3D
       - 'cool' pillow front cushions with depth float
       - 'DIGITAL' ascends with airy lift
       - Real-time glossy floor reflections mirror all movement seamlessly
   ========================================================================== */

(function () {
  let scene, camera, renderer;
  let modelGroup, reflectionGroup;
  let isInitialized = false;

  // Tracked letter objects for animation
  let objS = null;
  let objDash = null;
  let objCoolTeal = null;
  let objCoolWhite = null;
  let objDigital = null;

  let refS = null;
  let refDash = null;
  let refCoolTeal = null;
  let refCoolWhite = null;

  // 3D Logo Materials & Scene Lighting for Dynamic World Shifts
  let matS = null, matSReflect = null;
  let matTeal = null, matWhite = null, matLime = null, matDark = null;
  let matTealReflect = null, matWhiteReflect = null, matLimeReflect = null;
  let keyLight = null, fillLight = null, frontLight = null, groundShadowLight = null;

  const THEME_PALETTES = {
    default: {
      s: new THREE.Color(0.004, 0.28, 0.28),
      teal: new THREE.Color(0.004, 0.28, 0.28), // Teal
      lime: new THREE.Color(0.18, 0.72, 0.02), // Lime
      white: new THREE.Color(0.98, 0.98, 0.98), // White
      dark: new THREE.Color(0.85, 0.90, 0.94),
      keyLight: new THREE.Color(1.0, 0.99, 0.96),
      fillLight: new THREE.Color(0.70, 0.85, 0.95)
    },
    prueba: {
      // Harmonized Velvet Carmine & Warm Amber Gold (blends seamlessly with #770014 background & character)
      s: new THREE.Color(0.88, 0.55, 0.08),    // Warm Amber Gold #E08C14 (echoes character's warm highlights)
      teal: new THREE.Color(0.38, 0.04, 0.09), // Velvet Bordeaux / Deep Crimson Wine #5C0A17 (melts into background)
      lime: new THREE.Color(0.96, 0.65, 0.08), // Warm Amber Honey #F5A614
      white: new THREE.Color(1.0, 0.99, 0.98), // Pure Porcelain Silk White
      dark: new THREE.Color(0.96, 0.90, 0.82), // Warm Champagne Titanium Ivory
      keyLight: new THREE.Color(1.0, 0.95, 0.90),
      fillLight: new THREE.Color(0.95, 0.45, 0.55)
    },
    tef: { // Francés: Canadian Crimson Ruby & Quebec Gold
      s: new THREE.Color(0.88, 0.11, 0.28),
      teal: new THREE.Color(0.88, 0.11, 0.28), // #E11D48
      lime: new THREE.Color(0.96, 0.62, 0.05), // #F59E0B
      white: new THREE.Color(1.0, 1.0, 1.0),
      dark: new THREE.Color(0.98, 0.25, 0.40),
      keyLight: new THREE.Color(1.0, 0.90, 0.92),
      fillLight: new THREE.Color(1.0, 0.45, 0.60)
    },
    ielts: { // Inglés: Oxford Royal Azure & Cambridge Cyan
      teal: new THREE.Color(0.14, 0.38, 0.92), // #2563EB
      lime: new THREE.Color(0.02, 0.71, 0.83), // #06B6D4
      white: new THREE.Color(1.0, 1.0, 1.0),
      dark: new THREE.Color(0.22, 0.55, 0.98),
      keyLight: new THREE.Color(0.90, 0.95, 1.0),
      fillLight: new THREE.Color(0.40, 0.75, 1.0)
    },
    vector: { // Preicfes: Cyber Emerald & Matrix Lime
      teal: new THREE.Color(0.06, 0.72, 0.50), // #10B981
      lime: new THREE.Color(0.52, 0.80, 0.09), // #84CC16
      white: new THREE.Color(0.95, 0.98, 0.96),
      dark: new THREE.Color(0.20, 0.82, 0.60),
      keyLight: new THREE.Color(0.92, 1.0, 0.95),
      fillLight: new THREE.Color(0.30, 0.95, 0.65)
    },
    morpho: { // Editorial Guides: Cosmic Ultraviolet & Lavender
      teal: new THREE.Color(0.48, 0.23, 0.93), // #7C3AED
      lime: new THREE.Color(0.75, 0.52, 0.98), // #C084FC
      white: new THREE.Color(1.0, 1.0, 1.0),
      dark: new THREE.Color(0.65, 0.40, 0.98),
      keyLight: new THREE.Color(0.95, 0.90, 1.0),
      fillLight: new THREE.Color(0.75, 0.50, 1.0)
    },
    pulse: { // Agenda Virtual: Solar Amber & Broadcast Gold
      teal: new THREE.Color(0.85, 0.47, 0.02), // #D97706
      lime: new THREE.Color(0.98, 0.75, 0.14), // #FBBF24
      white: new THREE.Color(1.0, 1.0, 1.0),
      dark: new THREE.Color(0.95, 0.65, 0.10),
      keyLight: new THREE.Color(1.0, 0.95, 0.85),
      fillLight: new THREE.Color(1.0, 0.70, 0.25)
    }
  };

  let targetThemeKey = 'default';

  window.set3DLogoTheme = function(themeName) {
    if (THEME_PALETTES[themeName]) {
      targetThemeKey = themeName;
    }
  };

  // Base Positions:
  // Initial View (scroll = 0): Exact 3D Perspective framed from Blender viewport, centered horizontally
  const CAM_START_POS = new THREE.Vector3(5.15, 1.80, 6.04);
  // Scrolled View (scroll > 0): Dynamic cinematic glide with scroll depth
  const CAM_SCROLL_POS = new THREE.Vector3(4.45, 2.15, 5.49);

  const BASE_LOOK_TARGET = new THREE.Vector3(0.09, 1.70, -0.98);
  const SCROLL_LOOK_TARGET = new THREE.Vector3(0.30, 1.65, -0.81);
  const BASE_FOV = 49.4;
  const BASE_ASPECT = 1920 / 1080;

  // Normalized scroll progress [0.0 to 1.0]
  let currentScrollProgress = 0.0;
  let targetScrollProgress = 0.0;

  // Parallax mouse variables
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  // Bouncing Entrance Animation from Depth
  let entranceStartTime = null;
  const ENTRANCE_DURATION = 2.4; // total seconds

  window.replayEntranceAnimation = function () {
    entranceStartTime = clock ? clock.getElapsedTime() : 0.001;
    console.log('[DigitalScool3D] Replaying bouncing entrance animation...');
  };

  /**
   * Computes bouncy trajectory from background into settled position
   */
  function computeEntranceState(t, delay, dur, startPos, targetPos, floorY, bounceApex, type) {
    const u = (t - delay) / dur;
    if (u <= 0) {
      return {
        active: true,
        pos: startPos.clone(),
        scale: new THREE.Vector3(0.0001, 0.0001, 0.0001),
        rotOffset: new THREE.Euler(0, 0, 0)
      };
    }
    if (u >= 1.0) {
      return {
        active: false,
        pos: targetPos.clone(),
        scale: new THREE.Vector3(1, 1, 1),
        rotOffset: new THREE.Euler(0, 0, 0)
      };
    }

    // Horizontal travel (X and Z) from depth to foreground (smooth deceleration)
    const easeH = 1 - Math.pow(1 - u, 2.8);
    const curX = THREE.MathUtils.lerp(startPos.x, targetPos.x, easeH);
    const curZ = THREE.MathUtils.lerp(startPos.z, targetPos.z, easeH);

    // Scale growth from distance
    const grow = Math.min(1.0, 0.20 + (u / 0.35) * 0.80);

    let curY = targetPos.y;
    let sx = grow, sy = grow, sz = grow;
    const rot = new THREE.Euler(0, 0, 0);

    if (u < 0.40) {
      // 1. Falling from deep background to 1st floor impact
      const p1 = u / 0.40;
      curY = THREE.MathUtils.lerp(startPos.y, floorY, p1 * p1);

      if (p1 > 0.80) {
        // Floor Impact squash
        const k = (p1 - 0.80) / 0.20;
        const sq = Math.sin(k * Math.PI * 0.5);
        sy = grow * (1.0 - sq * 0.28);
        sx = grow * (1.0 + sq * 0.18);
        sz = grow * (1.0 + sq * 0.18);
      } else {
        sy = grow * 1.12;
        sx = grow * 0.94;
        sz = grow * 0.94;
      }

      if (type === 'dash') {
        rot.x = (1 - p1) * Math.PI * 3.0;
        rot.y = (1 - p1) * Math.PI * 2.0;
      } else if (type === 's') {
        rot.x = (1 - p1) * 0.45;
        rot.y = (1 - p1) * 0.35;
      } else if (type === 'cool') {
        rot.z = -(1 - p1) * 0.25;
        rot.x = (1 - p1) * 0.30;
      }
    } else if (u < 0.72) {
      // 2. Bounce 1: Rebounds to apex, then drops to floor
      const p2 = (u - 0.40) / 0.32;
      const arc = Math.sin(p2 * Math.PI);
      curY = floorY + (bounceApex - floorY) * arc;

      if (p2 < 0.20) {
        // Un-squash spring up
        const unk = p2 / 0.20;
        sy = grow * (0.72 + unk * 0.38);
        sx = grow * (1.18 - unk * 0.18);
        sz = grow * (1.18 - unk * 0.18);
      } else if (p2 > 0.80) {
        // 2nd floor impact squash
        const k2 = (p2 - 0.80) / 0.20;
        sy = grow * (1.0 - k2 * 0.16);
        sx = grow * (1.0 + k2 * 0.10);
        sz = grow * (1.0 + k2 * 0.10);
      } else {
        sy = grow * (1.0 + arc * 0.08);
        sx = grow * (1.0 - arc * 0.04);
        sz = grow * (1.0 - arc * 0.04);
      }

      if (type === 'dash') {
        rot.x = (1 - p2) * Math.PI * 1.0;
      }
    } else if (u < 0.90) {
      // 3. Bounce 2: Smaller secondary hop
      const p3 = (u - 0.72) / 0.18;
      const arc3 = Math.sin(p3 * Math.PI);
      curY = THREE.MathUtils.lerp(floorY, targetPos.y, p3) + arc3 * 0.32;
      sy = grow * (1.0 + arc3 * 0.05);
      sx = grow * (1.0 - arc3 * 0.03);
      sz = grow * (1.0 - arc3 * 0.03);
    } else {
      // 4. Elastic settling jelly dampening into rest basePos
      const p4 = (u - 0.90) / 0.10;
      const jelly = Math.exp(-p4 * 4.5) * Math.sin(p4 * Math.PI * 3.5);
      curY = targetPos.y + jelly * 0.06;
      sy = grow * (1.0 + jelly * 0.05);
      sx = grow * (1.0 - jelly * 0.03);
      sz = grow * (1.0 - jelly * 0.03);
    }

    return {
      active: true,
      pos: new THREE.Vector3(curX, curY, curZ),
      scale: new THREE.Vector3(sx, sy, sz),
      rotOffset: rot
    };
  }

  window.digitalScoolLoaded = false;
  window.debugDigitalScool = {
    get scene() { return scene; },
    get camera() { return camera; },
    get modelGroup() { return modelGroup; }
  };

  window.initDigitalScool3D = function () {
    if (isInitialized) return;
    const canvas = document.getElementById('spheres-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // 1. Scene setup: Transparent background allowing the CSS botanical radial gradient to show through seamlessly
    scene = new THREE.Scene();
    scene.background = null;
    scene.fog = null;

    // 2. Camera: Starts at exact 3D Perspective framed from Blender viewport
    camera = new THREE.PerspectiveCamera(BASE_FOV, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.copy(CAM_START_POS);
    camera.lookAt(BASE_LOOK_TARGET);
    updateCameraFov();

    // 3. WebGL Renderer with Alpha transparency for exact CSS background match
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Studio Lighting matching obsidian studio setup
    const ambientLight = new THREE.AmbientLight(new THREE.Color(0.70, 0.82, 0.90), 0.58);
    scene.add(ambientLight);

    // Direct Downward Contact Shadow Caster for Levitating Sculpture
    groundShadowLight = new THREE.DirectionalLight(new THREE.Color(1.0, 0.99, 0.96), 0.88);
    groundShadowLight.position.set(0.5, 6.8, 3.2);
    groundShadowLight.target.position.set(0.5, 0.0, 0.0);
    scene.add(groundShadowLight.target);
    scene.add(groundShadowLight);
    groundShadowLight.castShadow = true;
    groundShadowLight.shadow.mapSize.set(2048, 2048);
    groundShadowLight.shadow.camera.near = 1.0;
    groundShadowLight.shadow.camera.far = 16.0;
    groundShadowLight.shadow.camera.left = -5.5;
    groundShadowLight.shadow.camera.right = 5.5;
    groundShadowLight.shadow.camera.top = 4.5;
    groundShadowLight.shadow.camera.bottom = -3.5;
    groundShadowLight.shadow.bias = -0.0004;
    groundShadowLight.shadow.normalBias = 0.035;
    groundShadowLight.shadow.radius = 5.5;

    // Angled Key Light for 3D Bevel Gloss and Form Definition
    keyLight = new THREE.DirectionalLight(new THREE.Color(1.0, 0.99, 0.96), 0.72);
    keyLight.position.set(-3.5, 4.8, 4.2);
    keyLight.target.position.copy(BASE_LOOK_TARGET);
    scene.add(keyLight.target);
    scene.add(keyLight);

    fillLight = new THREE.DirectionalLight(new THREE.Color(0.70, 0.85, 0.95), 0.52);
    fillLight.position.set(5.0, 2.5, 3.0);
    fillLight.target.position.copy(BASE_LOOK_TARGET);
    scene.add(fillLight.target);
    scene.add(fillLight);

    frontLight = new THREE.DirectionalLight(new THREE.Color(0.95, 1.0, 0.96), 0.32);
    frontLight.position.set(0.0, 3.5, 8.5);
    frontLight.target.position.copy(BASE_LOOK_TARGET);
    scene.add(frontLight.target);
    scene.add(frontLight);

    const backLight = new THREE.PointLight(new THREE.Color(0.85, 1.0, 0.90), 0.40, 25);
    backLight.position.set(0.0, 4.5, -5.0);
    scene.add(backLight);

    // 5. Container groups
    modelGroup = new THREE.Group();
    scene.add(modelGroup);

    reflectionGroup = new THREE.Group();
    reflectionGroup.scale.set(1, -0.85, 1);
    reflectionGroup.position.set(0, -0.01, 0);
    reflectionGroup.visible = false; // Reflection removed per user request: only pure contact shadow remains
    scene.add(reflectionGroup);

    // 6. Explicit PBR Materials matching Blender's exact shaders
    matS = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.004, 0.28, 0.28),
      roughness: 0.18,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    matTeal = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.004, 0.28, 0.28),
      roughness: 0.18,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    matWhite = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.98, 0.98, 0.98),
      roughness: 0.08,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    matLime = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.18, 0.72, 0.02),
      roughness: 0.16,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    const matCyc = new THREE.ShadowMaterial({
      opacity: 0.35
    });

    matSReflect = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.004, 0.28, 0.28),
      roughness: 0.55,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide
    });

    matTealReflect = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.004, 0.28, 0.28),
      roughness: 0.55,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide
    });

    matWhiteReflect = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.98, 0.98, 0.98),
      roughness: 0.45,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    });

    matLimeReflect = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.18, 0.72, 0.02),
      roughness: 0.50,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide
    });

    matDark = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.85, 0.90, 0.94), // Sleek polished titanium / chrome silver
      roughness: 0.22,
      metalness: 0.80,
      side: THREE.DoubleSide
    });

    // 6. Load GLB Model
    if (typeof THREE.GLTFLoader !== 'undefined') {
      const loader = new THREE.GLTFLoader();
      loader.load(
        './digital_scool.glb?v=' + Date.now(),
        function (gltf) {
          const root = gltf.scene;

          root.traverse((child) => {
            if (child.isMesh) {
              const name = child.name || '';
              const pName = child.parent ? (child.parent.name || '') : '';

              if (name.includes('Cyclorama') || pName.includes('Cyclorama') || name.includes('Cyc_Mesh')) {
                child.material = matCyc;
                child.receiveShadow = true;
                child.castShadow = false;
              } else {
                child.castShadow = true;
                child.receiveShadow = false;

                const targetObj = child.parent && child.parent !== root ? child.parent : child;
                if (!targetObj.userData.basePos) {
                  targetObj.userData.basePos = targetObj.position.clone();
                  targetObj.userData.baseRot = targetObj.rotation.clone();
                  targetObj.userData.baseScale = targetObj.scale.clone();
                }

                if (name.includes('Letter_S') || name.includes('S_Hero') || pName.includes('Letter_S')) {
                  child.material = matS;
                  objS = targetObj;
                } else if (name.includes('Dash') || name.includes('Squircle') || pName.includes('Dash')) {
                  child.material = matLime;
                  objDash = targetObj;
                } else if (name.includes('Cool_Teal') || pName.includes('Cool_Teal')) {
                  child.material = matTeal;
                  objCoolTeal = targetObj;
                } else if (name.includes('Cool_White') || pName.includes('Cool_White')) {
                  child.material = matWhite;
                  objCoolWhite = targetObj;
                } else if (name.includes('DIGITAL') || pName.includes('DIGITAL')) {
                  child.material = matDark; // Sleek dark charcoal / obsidian black
                  objDigital = targetObj;
                }
              }
            }
          });

          // Reflection clone
          const reflectionClone = root.clone();
          reflectionClone.traverse((child) => {
            if (child.isMesh) {
              const name = child.name || '';
              const pName = child.parent ? (child.parent.name || '') : '';

              if (name.includes('Cyclorama') || pName.includes('Cyclorama') || name.includes('Cyc_Mesh') || name.includes('DIGITAL') || pName.includes('DIGITAL')) {
                child.visible = false;
              } else {
                child.castShadow = false;
                child.receiveShadow = false;

                const targetRef = child.parent && child.parent !== reflectionClone ? child.parent : child;
                if (!targetRef.userData.basePos) {
                  targetRef.userData.basePos = targetRef.position.clone();
                  targetRef.userData.baseRot = targetRef.rotation.clone();
                  targetRef.userData.baseScale = targetRef.scale.clone();
                }

                if (name.includes('Letter_S') || name.includes('S_Hero') || pName.includes('Letter_S')) {
                  child.material = matSReflect;
                  refS = targetRef;
                } else if (name.includes('Cool_Teal') || pName.includes('Cool_Teal')) {
                  child.material = matTealReflect;
                  refCoolTeal = targetRef;
                } else if (name.includes('Dash') || name.includes('Squircle') || pName.includes('Dash')) {
                  child.material = matLimeReflect;
                  refDash = targetRef;
                } else {
                  child.material = matWhiteReflect;
                  refCoolWhite = targetRef;
                }
              }
            }
          });          modelGroup.add(root);
          reflectionGroup.add(reflectionClone);

          window.digitalScoolLoaded = true;
          window.__digitalScoolRoot = root;
          window.__objCoolWhite = objCoolWhite;
          window.__objCoolTeal = objCoolTeal;
          window.__objDash = objDash;
          window.__objS = objS;
          window.dispatchEvent(new CustomEvent('digitalScoolLoaded', { detail: { root } }));
          console.log('[DigitalScool3D] 3D Model loaded with Blender 3D Viewport framing.');
        },
        undefined,
        function (err) {
          window.digitalScoolError = String(err);
          console.error('[DigitalScool3D] Error loading GLB:', err);
        }
      );
    }

    // 8. Event Listeners
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', onWindowResize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    canvas.addEventListener('click', function () {
      window.replayEntranceAnimation();
    });
    canvas.title = 'Haz clic para revivir la animación de entrada';

    // Initial check
    onScroll();

    isInitialized = true;
    animate();
  };

  function updateCameraFov() {
    if (!camera) return;
    const w = window.innerWidth || 1440;
    const h = window.innerHeight || 900;
    const aspect = (h > 0) ? (w / h) : BASE_ASPECT;
    camera.aspect = aspect;

    if (aspect < BASE_ASPECT) {
      camera.fov = 2 * Math.atan(Math.tan((BASE_FOV * Math.PI) / 360) * (BASE_ASPECT / aspect)) * (180 / Math.PI);
    } else {
      camera.fov = BASE_FOV;
    }
    camera.updateProjectionMatrix();
  }

  function onMouseMove(e) {
    const halfW = window.innerWidth / 2;
    const halfH = window.innerHeight / 2;
    targetMouseX = (e.clientX - halfW) / halfW;
    targetMouseY = (e.clientY - halfH) / halfH;
  }

  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    let heroScrollRange = 1600;
    if (window.currentWorld === 'prueba') {
      const pruebaHero = document.querySelector('.mainframe-hero-section');
      heroScrollRange = pruebaHero ? Math.max(400, pruebaHero.offsetHeight) : 800;
    } else {
      const heroStage = document.getElementById('hero');
      heroScrollRange = heroStage ? Math.max(600, heroStage.offsetHeight - window.innerHeight) : 1600;
    }

    // Calculate normalized progress of the first scroll segment across hero runway
    targetScrollProgress = Math.min(1.0, Math.max(0.0, scrollY / heroScrollRange));

    // Update bubbles dock: smooth fade out when scrolling past hero
    const bubblesDock = document.getElementById('ecosystem-bubbles-dock');
    if (bubblesDock) {
      if (window.currentWorld === 'inicio' || window.currentWorld === 'prueba') {
        bubblesDock.classList.add('scrolled-out');
        bubblesDock.style.display = 'none';
      } else if (scrollY > heroScrollRange + 50) {
        bubblesDock.classList.add('scrolled-out');
      } else {
        bubblesDock.classList.remove('scrolled-out');
      }
    }

    // Update right hero apps dock: appears as user scrolls through hero!
    const heroDock = document.getElementById('hero-apps-dock');
    if (heroDock) {
      if (scrollY > 20 && scrollY < heroScrollRange + 80) {
        heroDock.classList.add('scrolled-in');
      } else {
        heroDock.classList.remove('scrolled-in');
      }
    }

    if (typeof window.updateSuiteAppOnScroll === 'function') {
      window.updateSuiteAppOnScroll(scrollY, heroScrollRange);
    }
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    updateCameraFov();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Smooth scroll interpolation
    currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.08;
    const p = currentScrollProgress;

    // Mouse parallax interpolation
    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;

    // 1. Dynamic Camera Interpolation: Blender 3D Viewport Framing (p=0) -> Dynamic Glide (p=1)
    if (camera) {
      let targetCamX = CAM_SCROLL_POS.x;
      let targetCamY = CAM_SCROLL_POS.y;
      let targetCamZ = CAM_SCROLL_POS.z;
      let targetLookX = SCROLL_LOOK_TARGET.x;
      let targetLookY = SCROLL_LOOK_TARGET.y;
      let targetLookZ = SCROLL_LOOK_TARGET.z;

      if (window.currentWorld === 'prueba') {
        // In prueba, maintain centered frontal perspective hovering right above the cards
        targetCamX = 5.08;
        targetCamY = 2.02;
        targetCamZ = 5.82;
        targetLookX = 0.12;
        targetLookY = 1.66;
        targetLookZ = -0.92;
      }

      const camBaseX = THREE.MathUtils.lerp(CAM_START_POS.x, targetCamX, p);
      const camBaseY = THREE.MathUtils.lerp(CAM_START_POS.y, targetCamY, p);
      const camBaseZ = THREE.MathUtils.lerp(CAM_START_POS.z, targetCamZ, p);

      const mouseInfluence = 0.18;
      camera.position.x = camBaseX + (mouseX * mouseInfluence);
      camera.position.y = camBaseY - (mouseY * mouseInfluence * 0.5);
      camera.position.z = camBaseZ;

      const lookTargetX = THREE.MathUtils.lerp(BASE_LOOK_TARGET.x, targetLookX, p);
      const lookTargetY = THREE.MathUtils.lerp(BASE_LOOK_TARGET.y, targetLookY, p);
      const lookTargetZ = THREE.MathUtils.lerp(BASE_LOOK_TARGET.z, targetLookZ, p);
      camera.lookAt(
        lookTargetX + (mouseX * mouseInfluence * 0.2),
        lookTargetY - (mouseY * mouseInfluence * 0.1),
        lookTargetZ
      );
    }

    // Dynamic 3D Logo Positioning & Elevation for Prueba vs Hub Worlds
    if (modelGroup) {
      const isPrueba = (window.currentWorld === 'prueba');
      const o = (isPrueba && window.__overridePrueba) ? window.__overridePrueba : {};
      // In Prueba: more frontal angle (rotY: 0.24), larger scale (0.90), and balanced vertical/horizontal framing
      const destX = isPrueba ? (o.x !== undefined ? o.x : -2.78) : 0;
      const destY = isPrueba ? (o.y !== undefined ? o.y : (0.58 + (p * 1.85))) : 0;
      const destZ = isPrueba ? (o.z !== undefined ? o.z : 1.98) : 0;
      const destScale = isPrueba ? (o.scale !== undefined ? o.scale : 0.90) : 1.0;
      const destRotY = isPrueba ? (o.rotY !== undefined ? o.rotY : 0.24) : 0;

      modelGroup.position.x += (destX - modelGroup.position.x) * 0.08;
      modelGroup.position.y += (destY - modelGroup.position.y) * 0.08;
      modelGroup.position.z += (destZ - modelGroup.position.z) * 0.08;
      modelGroup.rotation.y += (destRotY - modelGroup.rotation.y) * 0.08;

      const curScale = modelGroup.scale.x;
      const nextScale = curScale + (destScale - curScale) * 0.08;
      modelGroup.scale.set(nextScale, nextScale, nextScale);

      if (reflectionGroup) {
        reflectionGroup.visible = false;
        reflectionGroup.position.x = modelGroup.position.x;
        reflectionGroup.position.y = -modelGroup.position.y;
        reflectionGroup.position.z = modelGroup.position.z;
        reflectionGroup.rotation.y = modelGroup.rotation.y;
        reflectionGroup.scale.copy(modelGroup.scale);
      }

      if (groundShadowLight) {
        groundShadowLight.target.position.set(modelGroup.position.x, 0, modelGroup.position.z);
        groundShadowLight.position.set(modelGroup.position.x + 0.5, 6.8, modelGroup.position.z + 3.2);
      }
    }

    // Check entrance animation timing
    if (entranceStartTime === null && window.digitalScoolLoaded) {
      entranceStartTime = elapsedTime;
    }
    const tEnt = (entranceStartTime !== null) ? (elapsedTime - entranceStartTime) : 999;

    // 2. Dynamic 3D Letter Micro-Animations on Scroll & Ambient Breathing
    const breath = Math.sin(elapsedTime * 2.0);

    // Letter 'S' - Bouncing Entrance from Depth & Buoyant Float
    if (objS && objS.userData.basePos) {
      const baseRotS = objS.userData.baseRot || new THREE.Euler();
      const sStart = new THREE.Vector3(objS.userData.basePos.x - 3.2, 8.5, objS.userData.basePos.z - 22.0);
      const sEnt = computeEntranceState(tEnt, 0.08, 1.15, sStart, objS.userData.basePos, 0.16, 3.6, 's');

      if (sEnt.active) {
        objS.position.copy(sEnt.pos);
        objS.scale.copy(sEnt.scale);
        objS.rotation.set(
          baseRotS.x + sEnt.rotOffset.x,
          baseRotS.y + sEnt.rotOffset.y,
          baseRotS.z + sEnt.rotOffset.z
        );
      } else {
        const sFloatY = (p * 0.14) + (breath * 0.030 * (0.2 + 0.8 * p));
        objS.position.set(objS.userData.basePos.x, objS.userData.basePos.y + sFloatY, objS.userData.basePos.z);
        objS.scale.set(1, 1, 1);
        objS.rotation.set(baseRotS.x, baseRotS.y, baseRotS.z - (p * 0.06));
      }

      if (refS) {
        refS.position.copy(objS.position);
        refS.scale.copy(objS.scale);
        refS.rotation.copy(objS.rotation);
      }
    }

    // Hyphen '-' Squircle - Bouncing & Spinning Flip Entrance
    if (objDash && objDash.userData.basePos) {
      const baseRotDash = objDash.userData.baseRot || new THREE.Euler();
      const dashStart = new THREE.Vector3(objDash.userData.basePos.x - 0.6, 7.5, objDash.userData.basePos.z - 22.0);
      const dashEnt = computeEntranceState(tEnt, 0.38, 1.05, dashStart, objDash.userData.basePos, 0.28, 2.9, 'dash');

      if (dashEnt.active) {
        objDash.position.copy(dashEnt.pos);
        objDash.scale.copy(dashEnt.scale);
        objDash.rotation.set(
          baseRotDash.x + dashEnt.rotOffset.x,
          baseRotDash.y + dashEnt.rotOffset.y,
          baseRotDash.z + dashEnt.rotOffset.z
        );
      } else {
        const basePos = objDash.userData.basePos;
        const startFloatY = (p * 0.12) + (Math.sin(elapsedTime * 3.0) * 0.035);
        const startRotY = (Math.sin(elapsedTime * 2.0) * 0.08);
        objDash.position.set(basePos.x, basePos.y + startFloatY, basePos.z);
        objDash.scale.set(1, 1, 1);
        objDash.rotation.set(baseRotDash.x, baseRotDash.y + startRotY, baseRotDash.z);
      }

      if (refDash) {
        refDash.position.copy(objDash.position);
        refDash.scale.copy(objDash.scale);
        refDash.rotation.copy(objDash.rotation);
      }
    }

    // 'cool' Pillowy Word - Wave Bouncing Entrance & Gentle Float
    if (objCoolWhite && objCoolWhite.userData.basePos) {
      const baseRotCoolW = objCoolWhite.userData.baseRot || new THREE.Euler();
      const coolStart = new THREE.Vector3(objCoolWhite.userData.basePos.x + 3.8, 8.0, objCoolWhite.userData.basePos.z - 24.0);
      const coolEnt = computeEntranceState(tEnt, 0.65, 1.15, coolStart, objCoolWhite.userData.basePos, 0.16, 3.4, 'cool');

      if (coolEnt.active) {
        objCoolWhite.position.copy(coolEnt.pos);
        objCoolWhite.scale.copy(coolEnt.scale);
        objCoolWhite.rotation.set(
          baseRotCoolW.x + coolEnt.rotOffset.x,
          baseRotCoolW.y + coolEnt.rotOffset.y,
          baseRotCoolW.z + coolEnt.rotOffset.z
        );

        if (objCoolTeal) {
          const baseRotCoolT = objCoolTeal.userData.baseRot || new THREE.Euler();
          objCoolTeal.position.set(coolEnt.pos.x, coolEnt.pos.y, coolEnt.pos.z - 0.24);
          objCoolTeal.scale.copy(coolEnt.scale);
          objCoolTeal.rotation.set(
            baseRotCoolT.x + coolEnt.rotOffset.x,
            baseRotCoolT.y + coolEnt.rotOffset.y,
            baseRotCoolT.z + coolEnt.rotOffset.z
          );
        }
      } else {
        coolFloatY = (p * 0.10) + (Math.sin(elapsedTime * 1.8 + 1.0) * 0.03 * (0.3 + 0.7 * p));
        objCoolWhite.position.set(objCoolWhite.userData.basePos.x, objCoolWhite.userData.basePos.y + coolFloatY, objCoolWhite.userData.basePos.z);
        objCoolWhite.scale.set(1, 1, 1);
        objCoolWhite.rotation.copy(baseRotCoolW);

        if (objCoolTeal && objCoolTeal.userData.basePos) {
          const baseRotCoolT = objCoolTeal.userData.baseRot || new THREE.Euler();
          objCoolTeal.position.set(objCoolTeal.userData.basePos.x, objCoolTeal.userData.basePos.y + coolFloatY, objCoolTeal.userData.basePos.z);
          objCoolTeal.scale.set(1, 1, 1);
          objCoolTeal.rotation.copy(baseRotCoolT);
        }
      }

      if (refCoolWhite) {
        refCoolWhite.position.copy(objCoolWhite.position);
        refCoolWhite.scale.copy(objCoolWhite.scale);
        refCoolWhite.rotation.copy(objCoolWhite.rotation);
      }
      if (refCoolTeal && objCoolTeal) {
        refCoolTeal.position.copy(objCoolTeal.position);
        refCoolTeal.scale.copy(objCoolTeal.scale);
        refCoolTeal.rotation.copy(objCoolTeal.rotation);
      }
    }

    // 'DIGITAL' Header - Architectural Drop & Settle
    if (objDigital && objDigital.userData.basePos) {
      const baseRotDig = objDigital.userData.baseRot || new THREE.Euler();
      const digStart = new THREE.Vector3(objDigital.userData.basePos.x, objDigital.userData.basePos.y + 8.5, objDigital.userData.basePos.z - 8.0);
      const digEnt = computeEntranceState(tEnt, 1.02, 0.95, digStart, objDigital.userData.basePos, objDigital.userData.basePos.y, objDigital.userData.basePos.y + 0.8, 'digital');

      if (digEnt.active) {
        objDigital.position.copy(digEnt.pos);
        objDigital.scale.copy(digEnt.scale);
        objDigital.rotation.set(
          baseRotDig.x + digEnt.rotOffset.x,
          baseRotDig.y + digEnt.rotOffset.y,
          baseRotDig.z + digEnt.rotOffset.z
        );
      } else {
        const digitalFloatY = (p * 0.22) + (Math.sin(elapsedTime * 1.4) * 0.025);
        objDigital.position.set(objDigital.userData.basePos.x, objDigital.userData.basePos.y + digitalFloatY, objDigital.userData.basePos.z);
        objDigital.scale.set(1, 1, 1);
        objDigital.rotation.copy(baseRotDig);
      }
    }

    // Smooth Chromatic Lerp for 3D Logo & Scene Lights
    const targetColors = THEME_PALETTES[targetThemeKey] || THEME_PALETTES.default;
    const targetColS = targetColors.s || targetColors.teal;
    if (matS) matS.color.lerp(targetColS, 0.08);
    if (matSReflect) matSReflect.color.lerp(targetColS, 0.08);
    if (matTeal) matTeal.color.lerp(targetColors.teal, 0.08);
    if (matLime) matLime.color.lerp(targetColors.lime, 0.08);
    if (matWhite) matWhite.color.lerp(targetColors.white, 0.08);
    if (matDark) matDark.color.lerp(targetColors.dark, 0.08);
    if (matTealReflect) matTealReflect.color.lerp(targetColors.teal, 0.08);
    if (matLimeReflect) matLimeReflect.color.lerp(targetColors.lime, 0.08);
    if (keyLight) keyLight.color.lerp(targetColors.keyLight, 0.08);
    if (fillLight) fillLight.color.lerp(targetColors.fillLight, 0.08);

    renderer.render(scene, camera);
  }

  // Expose palette configurations for real-time fine tuning
  window.THEME_PALETTES = THEME_PALETTES;
  window.setPruebaPalette = function(paletteKey) {
    if (THEME_PALETTES[paletteKey]) {
      targetThemeKey = paletteKey;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initDigitalScool3D);
  } else {
    window.initDigitalScool3D();
  }
})();
