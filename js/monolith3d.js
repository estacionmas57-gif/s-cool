/* ==========================================================================
   SYNAPSE LEARNING SYSTEMS • KINETIC 3D MONOLITH SCULPTURE
   5 Interconnected Sculptural Blocks: Élan, Apex, Vector, Morpho, Pulse
   Three.js + Blender GLB (learning_monolith.glb) + Studio Lighting (Cycles Match)
   Integrated into Creative Web Lab
   ========================================================================== */

(function () {
  let scene, camera, renderer, monolithGroup;
  let blockModules = [];
  let terracottaEmitters = [];
  let corePointLight;
  let particleGeo, particleVel, particleCount = 70;
  let isLoaded = false;

  // Mouse Parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  // Scroll & Explosion State
  let currentScrollProgress = 0;
  let targetExplosionFactor = 0;
  let currentExplosionFactor = 0;
  let highlightedBlockIndex = -1;

  // Kinematic configuration for the 5 modular applications
  const blockConfig = [
    {
      name: 'Block_01_Elan',
      app: 'Élan TEF',
      explodedOffset: new THREE.Vector3(-0.45, -0.40, -0.35),
      explodedRot: new THREE.Euler(0.12, -0.18, 0.06),
      index: 0
    },
    {
      name: 'Block_02_Apex',
      app: 'Apex IELTS',
      explodedOffset: new THREE.Vector3(0.60, -0.50, 0.20),
      explodedRot: new THREE.Euler(-0.20, 0.28, -0.22),
      index: 1
    },
    {
      name: 'Block_03_Vector',
      app: 'Vector 11',
      explodedOffset: new THREE.Vector3(-0.55, 0.48, 0.25),
      explodedRot: new THREE.Euler(0.25, -0.22, 0.28),
      index: 2
    },
    {
      name: 'Block_04_Morpho',
      app: 'Morpho Guides',
      explodedOffset: new THREE.Vector3(0.52, 0.44, 0.35),
      explodedRot: new THREE.Euler(-0.18, -0.24, 0.30),
      index: 3
    },
    {
      name: 'Block_05_Pulse',
      app: 'Pulse Académico',
      explodedOffset: new THREE.Vector3(0.0, 0.70, 0.48),
      explodedRot: new THREE.Euler(0.14, 0.18, 0.32),
      index: 4
    }
  ];

  function initMonolith3D() {
    if (typeof THREE === 'undefined') {
      console.warn('[Monolith3D] Three.js not found.');
      return;
    }

    const canvas = document.getElementById('spheres-canvas');
    if (!canvas) {
      console.warn('[Monolith3D] Canvas #spheres-canvas not found.');
      return;
    }

    // --- 1. Scene & Camera ---
    scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);

    // Initial camera position matching Blender studio view
    updateCameraPlacement();

    // --- 2. WebGL Renderer with High-Fidelity Tone Mapping ---
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    // --- 3. Studio Lighting Setup (Three-Point Cycles Lighting) ---
    const ambientLight = new THREE.AmbientLight(0xf0eae2, 0.45);
    scene.add(ambientLight);

    // Key Sunlight (Top-left, defines sculptural bevels and rich shadows)
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.15);
    keyLight.position.set(-3.5, 6.0, 3.2);
    keyLight.target.position.set(0.75, 0.0, 0.0);
    scene.add(keyLight.target);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0002;
    keyLight.shadow.normalBias = 0.03;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.camera.left = -3;
    keyLight.shadow.camera.right = 3;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -3;
    scene.add(keyLight);

    // Soft Warm Fill Light (Softens right side shadows)
    const fillLight = new THREE.DirectionalLight(0xffecd8, 0.40);
    fillLight.position.set(4.5, 2.0, 4.0);
    scene.add(fillLight);

    // Cool Slate Rim Light (Backlight for crisp silhouette edge)
    const rimLight = new THREE.DirectionalLight(0x90b8d0, 0.75);
    rimLight.position.set(1.0, 5.0, -4.5);
    scene.add(rimLight);

    // Terracotta Core Point Light (Inner warm lantern glow)
    corePointLight = new THREE.PointLight(0xff5010, 2.6, 7.0, 1.6);
    corePointLight.position.set(0.75, 0.5, 0.2);
    scene.add(corePointLight);

    // --- 4. Monolith Group Container ---
    monolithGroup = new THREE.Group();
    updateMonolithGroupPlacement();
    scene.add(monolithGroup);

    // --- 5. High-Precision PBR Materials (Calibrated from Blender Cycles) ---
    const matPolishedSlate = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x16262e), // Deep Slate Teal #16262E
      roughness: 0.40,
      metalness: 0.15
    });

    const matPorcelainIvory = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd5d0c8), // Porcelain Ivory #D5D0C8
      roughness: 0.28,
      metalness: 0.02
    });

    const matTerracottaCore = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd44d24), // Rich Terracotta #D44D24
      emissive: new THREE.Color(0xff4510), // Warm Orange-Amber Emission
      emissiveIntensity: 2.2,
      roughness: 0.50,
      metalness: 0.02
    });

    const matChampagneGold = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd8be96), // Champagne Gold #D8BE96
      roughness: 0.28,
      metalness: 0.85
    });

    // --- 6. Load GLB Model ---
    if (typeof THREE.GLTFLoader === 'function') {
      const gltfLoader = new THREE.GLTFLoader();
      gltfLoader.load(
        './learning_monolith.glb?v=42',
        (gltf) => {
          const rawScene = gltf.scene;

          // Safety filter: strip any internal lights embedded in the file
          const lightsToRemove = [];
          rawScene.traverse((child) => {
            if (child.isLight) lightsToRemove.push(child);
          });
          lightsToRemove.forEach((light) => {
            light.intensity = 0;
            light.visible = false;
            if (light.parent) light.parent.remove(light);
          });

          // Apply calibrated materials
          rawScene.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;

              const matName = child.material ? child.material.name : '';
              const nodeName = child.name || '';

              if (
                matName === 'Mat_Polished_Slate' ||
                nodeName === 'Block_01_Elan' ||
                nodeName === 'Block_03_Vector' ||
                nodeName.includes('Slate')
              ) {
                child.material = matPolishedSlate.clone();
              } else if (
                matName === 'Mat_Terracotta_Core' ||
                nodeName.includes('Core') ||
                nodeName.includes('Gem') ||
                nodeName.includes('Spine')
              ) {
                const emMat = matTerracottaCore.clone();
                child.material = emMat;
                terracottaEmitters.push(child);
              } else if (
                matName === 'Mat_Champagne_Gold' ||
                nodeName.includes('Ring')
              ) {
                child.material = matChampagneGold.clone();
              } else {
                child.material = matPorcelainIvory.clone();
              }

              child.material.needsUpdate = true;
            }
          });

          // Register kinematic blocks for scroll explosion
          blockConfig.forEach((cfg) => {
            const blockObj = rawScene.getObjectByName(cfg.name);
            if (blockObj) {
              const assembledPos = blockObj.position.clone();
              const assembledRot = blockObj.rotation.clone();

              const explodedPos = assembledPos.clone().add(cfg.explodedOffset);
              const explodedRot = new THREE.Euler(
                assembledRot.x + cfg.explodedRot.x,
                assembledRot.y + cfg.explodedRot.y,
                assembledRot.z + cfg.explodedRot.z
              );

              blockModules.push({
                object: blockObj,
                cfg: cfg,
                assembledPos: assembledPos,
                assembledRot: assembledRot,
                explodedPos: explodedPos,
                explodedRot: explodedRot
              });
            }
          });

          monolithGroup.add(rawScene);
          isLoaded = true;
          console.log(`[Monolith3D] Successfully loaded. Modules: ${blockModules.length}, Emitters: ${terracottaEmitters.length}`);
        },
        undefined,
        (err) => {
          console.error('[Monolith3D] Failed loading learning_monolith.glb:', err);
        }
      );
    } else {
      console.error('[Monolith3D] GLTFLoader is not available on THREE object.');
    }

    // --- 7. Floating Kinetic Sparkles ---
    particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    particleVel = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.5 + Math.random() * 1.8;
      particlePos[i * 3 + 0] = Math.cos(angle) * dist;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 3.8;
      particlePos[i * 3 + 2] = Math.sin(angle) * dist;
      particleVel[i] = 0.004 + Math.random() * 0.010;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xe8602c,
      size: 0.035,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    monolithGroup.add(particleSystem);

    // --- 8. Event Listeners ---
    window.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    window.addEventListener('resize', handleResize);

    // Auto-track scroll if scrollytelling doesn't pass it explicitly
    window.addEventListener('scroll', () => {
      if (window.heroTriggerInstance) {
        setMonolithScrollProgress(window.heroTriggerInstance.progress);
      } else {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        if (total > 0) {
          setMonolithScrollProgress(window.scrollY / Math.min(total, 4000));
        }
      }
    }, { passive: true });

    // Start render loop
    startRenderLoop();
  }

  function updateCameraPlacement() {
    if (!camera) return;
    const isMobile = window.innerWidth < 860;
    if (isMobile) {
      camera.position.set(2.8, 1.4, 6.8);
      camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
    } else {
      camera.position.set(3.8, 1.3, 5.6);
      camera.lookAt(new THREE.Vector3(0.75, 0.1, 0.0));
    }
  }

  function updateMonolithGroupPlacement() {
    if (!monolithGroup) return;
    const isMobile = window.innerWidth < 860;
    if (isMobile) {
      monolithGroup.position.set(0.0, -0.3, 0.0);
      monolithGroup.scale.set(0.58, 0.58, 0.58);
    } else {
      monolithGroup.position.set(0.75, -0.25, 0.0);
      monolithGroup.scale.set(0.76, 0.76, 0.76);
    }
  }

  function handleResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    updateCameraPlacement();
    updateMonolithGroupPlacement();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  // --- External API for Scrollytelling ---
  function setMonolithScrollProgress(progress) {
    currentScrollProgress = clamp(progress || 0, 0, 1);

    // Compute explosion factor based on Hero scroll progress
    // At p=0 (top of page): fully assembled monolith (explosionFactor = 0)
    // Between 0.10 and 0.75 (cards entering one by one): levitating open modules (explosionFactor up to 1.0)
    // Past 0.85 (all cards docked / unpinning): reassembling majestically
    if (currentScrollProgress < 0.10) {
      targetExplosionFactor = (currentScrollProgress / 0.10) * 0.4;
    } else if (currentScrollProgress < 0.60) {
      targetExplosionFactor = 0.4 + ((currentScrollProgress - 0.10) / 0.50) * 0.6;
    } else if (currentScrollProgress < 0.85) {
      targetExplosionFactor = 1.0 - ((currentScrollProgress - 0.60) / 0.25) * 0.5;
    } else {
      const snapBack = (currentScrollProgress - 0.85) / 0.15;
      targetExplosionFactor = 0.5 * (1.0 - snapBack);
    }
  }

  function highlightMonolithBlock(index) {
    highlightedBlockIndex = index;
  }

  // --- Render Loop ---
  const clock = new THREE.Clock();

  function startRenderLoop() {
    function animate() {
      requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Smooth explosion interpolation
      currentExplosionFactor += (targetExplosionFactor - currentExplosionFactor) * 0.08;

      if (monolithGroup) {
        // Subtle natural breathing oscillation
        const baseOffsetY = window.innerWidth < 860 ? -0.3 : -0.25;
        const baseOffsetX = window.innerWidth < 860 ? 0.0 : 0.75;

        monolithGroup.position.y = baseOffsetY + Math.sin(elapsedTime * 0.7) * 0.025 + mouseY * 0.03;
        monolithGroup.position.x = baseOffsetX + mouseX * 0.04;
        monolithGroup.rotation.y = mouseX * 0.05;

        // Kinematic blocks interpolation
        blockModules.forEach((mod, idx) => {
          const isHighlighted = highlightedBlockIndex === idx;
          const individualBoost = isHighlighted ? 0.25 : 0.0;
          const effFactor = clamp(currentExplosionFactor + individualBoost, 0, 1);

          // Smooth cubic easing
          const easeFactor = effFactor * effFactor * (3 - 2 * effFactor);

          const floatAmount = easeFactor * 0.025;
          const floatY = Math.sin(elapsedTime * 1.5 + idx * 1.3) * floatAmount;
          const floatRot = Math.cos(elapsedTime * 1.2 + idx) * floatAmount * 0.5;

          mod.object.position.x = lerp(mod.assembledPos.x, mod.explodedPos.x, easeFactor);
          mod.object.position.y = lerp(mod.assembledPos.y, mod.explodedPos.y, easeFactor) + floatY;
          mod.object.position.z = lerp(mod.assembledPos.z, mod.explodedPos.z, easeFactor);

          mod.object.rotation.x = lerp(mod.assembledRot.x, mod.explodedRot.x, easeFactor) + floatRot;
          mod.object.rotation.y = lerp(mod.assembledRot.y, mod.explodedRot.y, easeFactor);
          mod.object.rotation.z = lerp(mod.assembledRot.z, mod.explodedRot.z, easeFactor);
        });

        // Terracotta Core Light Pulse
        const pulseWave = 1.0 + Math.sin(elapsedTime * 3.5) * 0.15;
        const currentEmissive = (2.2 + currentExplosionFactor * 1.4) * pulseWave;

        terracottaEmitters.forEach((emitter) => {
          if (emitter.material && emitter.material.emissive) {
            emitter.material.emissiveIntensity = currentEmissive;
          }
        });

        if (corePointLight) {
          corePointLight.intensity = (2.4 + currentExplosionFactor * 1.2) * pulseWave;
        }

        // Particle kinematics
        if (particleGeo) {
          const positions = particleGeo.attributes.position.array;
          for (let i = 0; i < particleCount; i++) {
            positions[i * 3 + 1] += particleVel[i];
            if (positions[i * 3 + 1] > 2.2) {
              positions[i * 3 + 1] = -1.8;
            }
          }
          particleGeo.attributes.position.needsUpdate = true;
        }
      }

      if (camera && renderer && scene) {
        const lookAtTarget = window.innerWidth < 860
          ? new THREE.Vector3(0.0, 0.0, 0.0)
          : new THREE.Vector3(0.75, 0.1, 0.0);
        camera.lookAt(lookAtTarget);
        renderer.render(scene, camera);
      }
    }

    animate();
  }

  // Export functions to global scope
  window.initMonolith3D = initMonolith3D;
  window.initSpheres3D = initMonolith3D; // Seamless fallback for app.js
  window.setMonolithScrollProgress = setMonolithScrollProgress;
  window.highlightMonolithBlock = highlightMonolithBlock;
})();
