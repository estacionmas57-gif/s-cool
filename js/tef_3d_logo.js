/**
 * S-COOL TEF CANADÁ • 3D INTERACTIVE BRAND EMBLEM (Three.js WebGL)
 * Option B: Procedural 3D Typography & GLTF Model Integration directly in Code.
 * Pinned elegantly on the top-left of the July Destination Canada video journey.
 */

(function () {
  'use strict';

  let canvas, container;
  let scene, camera, renderer;
  let rootGroup, logoScoolGroup, tefBadgeGroup;
  let scoolWrapper, scoolScaleFactor;
  let tefBasePosY = -0.62, scoolBasePosY = 0.46;
  let isInitialized = false;

  // Mouse parallax tracking
  let mouseX = 0, mouseY = 0;
  let targetRotX = 0, targetRotY = 0;
  let currentRotX = 0, currentRotY = 0;

  // Visibility state based on scroll
  let isStageActive = false;

  function init() {
    canvas = document.getElementById('hub-tef-brand-canvas');
    container = document.getElementById('hub-tef-brand-badge');
    if (!canvas || !container) return;

    const width = canvas.clientWidth || 210;
    const height = canvas.clientHeight || 120;

    // 1. Scene & Camera: Option B Centered Crest Framing with clean vertical gap
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50);
    camera.position.set(0.0, -0.05, 4.45); // Perfectly framed stacked crest with breathing room

    // 2. WebGL Renderer with Alpha Transparency
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
    renderer.toneMapping = THREE.LinearToneMapping; // Preserves 100% pure saturated red
    renderer.toneMappingExposure = 1.05;

    // 3. Studio Lighting: Front Key for crisp letter face definition & contrast
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.40);
    scene.add(ambientLight);

    // Front Key Light: directly illuminates the front faces of 'S' and 'cool'
    const frontKey = new THREE.DirectionalLight(0xffffff, 1.45);
    frontKey.position.set(0.2, 1.2, 5.0);
    scene.add(frontKey);

    // Side Key Light for specular bevel glints
    const sideKey = new THREE.DirectionalLight(0xffecea, 0.85);
    sideKey.position.set(3.5, 3.5, 4.0);
    scene.add(sideKey);

    // Canadian Flag Red Rim Light
    const rimRed = new THREE.DirectionalLight(0xff0016, 1.8);
    rimRed.position.set(-4.5, 1.5, 2.5);
    scene.add(rimRed);

    // Warm Quebec Gold Accent Point Light on the maple leaf
    const accentGold = new THREE.PointLight(0xf59e0b, 1.2, 16);
    accentGold.position.set(2.2, -1.2, 3.0);
    scene.add(accentGold);

    // 4. Root Container
    rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 5. Build Procedural 3D TEF Badge (Option B - Pure Code)
    buildProceduralTefBadge();

    // 6. Load / Clone 3D "S-cool" Letters with Canadian TEF Palette
    loadScoolMesh();

    // 7. Event Listeners
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll, { passive: true });

    onResize();
    onScroll();

    isInitialized = true;
    requestAnimationFrame(renderLoop);
  }

  /**
   * Option B: Procedural 3D "TEF" Geometry & Canadian Pill Badge in Three.js
   */
  function buildProceduralTefBadge() {
    tefBadgeGroup = new THREE.Group();

    // Official Deep Canadian Flag Red (#D80016)
    const matPillRuby = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.88, 0.00, 0.06), // Unmistakable vivid Canadian Flag Red
      roughness: 0.26,
      metalness: 0.04,
      side: THREE.DoubleSide
    });

    const matGoldText = new THREE.MeshStandardMaterial({
      color: new THREE.Color(1.0, 1.0, 1.0), // Crisp Silk White
      roughness: 0.05,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    const matGoldRim = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.96, 0.65, 0.08), // Quebec Gold #F5A614
      roughness: 0.18,
      metalness: 0.85,
      side: THREE.DoubleSide
    });

    // --- A. 3D Beveled Pill Capsule ---
    const pillW = 2.1, pillH = 1.0, pillR = 0.45;
    const pillShape = new THREE.Shape();
    pillShape.moveTo(-pillW / 2 + pillR, -pillH / 2);
    pillShape.lineTo(pillW / 2 - pillR, -pillH / 2);
    pillShape.quadraticCurveTo(pillW / 2, -pillH / 2, pillW / 2, -pillH / 2 + pillR);
    pillShape.lineTo(pillW / 2, pillH / 2 - pillR);
    pillShape.quadraticCurveTo(pillW / 2, pillH / 2, pillW / 2 - pillR, pillH / 2);
    pillShape.lineTo(-pillW / 2 + pillR, pillH / 2);
    pillShape.quadraticCurveTo(-pillW / 2, pillH / 2, -pillW / 2, pillH / 2 - pillR);
    pillShape.lineTo(-pillW / 2, -pillH / 2 + pillR);
    pillShape.quadraticCurveTo(-pillW / 2, -pillH / 2, -pillW / 2 + pillR, -pillH / 2);

    const pillGeom = new THREE.ExtrudeGeometry(pillShape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.06,
      bevelThickness: 0.06
    });
    pillGeom.center();
    const pillMesh = new THREE.Mesh(pillGeom, matPillRuby);
    tefBadgeGroup.add(pillMesh);

    // Subtle Gold Inset Rim
    const rimGeom = new THREE.ExtrudeGeometry(pillShape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02
    });
    rimGeom.center();
    const rimMesh = new THREE.Mesh(rimGeom, matGoldRim);
    rimMesh.scale.set(0.94, 0.94, 1.0);
    rimMesh.position.z = 0.12;
    tefBadgeGroup.add(rimMesh);

    // --- B. Procedural 3D Letters 'T', 'E', 'F' ---
    const letterDepth = 0.16;
    const extrudeOpts = {
      depth: letterDepth,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025
    };

    // Letter 'T'
    const shapeT = new THREE.Shape();
    shapeT.moveTo(-0.24, 0.30);
    shapeT.lineTo(0.24, 0.30);
    shapeT.lineTo(0.24, 0.15);
    shapeT.lineTo(0.08, 0.15);
    shapeT.lineTo(0.08, -0.30);
    shapeT.lineTo(-0.08, -0.30);
    shapeT.lineTo(-0.08, 0.15);
    shapeT.lineTo(-0.24, 0.15);
    shapeT.closePath();
    const geomT = new THREE.ExtrudeGeometry(shapeT, extrudeOpts);
    geomT.center();
    const meshT = new THREE.Mesh(geomT, matGoldText);
    meshT.position.set(-0.54, 0.02, 0.18);
    tefBadgeGroup.add(meshT);

    // Letter 'E'
    const shapeE = new THREE.Shape();
    shapeE.moveTo(-0.20, 0.30);
    shapeE.lineTo(0.20, 0.30);
    shapeE.lineTo(0.20, 0.16);
    shapeE.lineTo(-0.05, 0.16);
    shapeE.lineTo(-0.05, 0.07);
    shapeE.lineTo(0.14, 0.07);
    shapeE.lineTo(0.14, -0.06);
    shapeE.lineTo(-0.05, -0.06);
    shapeE.lineTo(-0.05, -0.16);
    shapeE.lineTo(0.20, -0.16);
    shapeE.lineTo(0.20, -0.30);
    shapeE.lineTo(-0.20, -0.30);
    shapeE.closePath();
    const geomE = new THREE.ExtrudeGeometry(shapeE, extrudeOpts);
    geomE.center();
    const meshE = new THREE.Mesh(geomE, matGoldText);
    meshE.position.set(-0.02, 0.02, 0.18);
    tefBadgeGroup.add(meshE);

    // Letter 'F'
    const shapeF = new THREE.Shape();
    shapeF.moveTo(-0.20, 0.30);
    shapeF.lineTo(0.20, 0.30);
    shapeF.lineTo(0.20, 0.16);
    shapeF.lineTo(-0.05, 0.16);
    shapeF.lineTo(-0.05, 0.07);
    shapeF.lineTo(0.14, 0.07);
    shapeF.lineTo(0.14, -0.06);
    shapeF.lineTo(-0.05, -0.06);
    shapeF.lineTo(-0.05, -0.30);
    shapeF.lineTo(-0.20, -0.30);
    shapeF.closePath();
    const geomF = new THREE.ExtrudeGeometry(shapeF, extrudeOpts);
    geomF.center();
    const meshF = new THREE.Mesh(geomF, matGoldText);
    meshF.position.set(0.50, 0.02, 0.18);
    tefBadgeGroup.add(meshF);

    // --- C. Mini 3D Stylized Canadian Maple Leaf Emblem ---
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0.22);
    leafShape.lineTo(0.06, 0.12);
    leafShape.lineTo(0.16, 0.15);
    leafShape.lineTo(0.10, 0.03);
    leafShape.lineTo(0.19, -0.02);
    leafShape.lineTo(0.07, -0.06);
    leafShape.lineTo(0.02, -0.18);
    leafShape.lineTo(-0.02, -0.18);
    leafShape.lineTo(-0.07, -0.06);
    leafShape.lineTo(-0.19, -0.02);
    leafShape.lineTo(-0.10, 0.03);
    leafShape.lineTo(-0.16, 0.15);
    leafShape.lineTo(-0.06, 0.12);
    leafShape.closePath();
    const leafGeom = new THREE.ExtrudeGeometry(leafShape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02
    });
    leafGeom.center();
    const leafMesh = new THREE.Mesh(leafGeom, matGoldRim);
    leafMesh.position.set(0.85, 0.28, 0.16);
    leafMesh.scale.set(0.7, 0.7, 0.7);
    tefBadgeGroup.add(leafMesh);

    // Position TEF badge centered underneath S-cool (Option B Crest) with reduced scale & clear vertical space
    tefBadgeGroup.position.set(0.0, tefBasePosY, -0.05);
    tefBadgeGroup.scale.set(0.64, 0.64, 0.64);
    rootGroup.add(tefBadgeGroup);
  }

  /**
   * Loads or clones the authentic 3D "S-cool" letters with Canadian TEF palette
   */
  function loadScoolMesh() {
    logoScoolGroup = new THREE.Group();
    rootGroup.add(logoScoolGroup);

    let hasBuilt = false;
    function buildScool(sourceScene) {
      if (hasBuilt || !sourceScene) return;
      hasBuilt = true;

      const root = sourceScene.clone();

      // Official High-Contrast Pure Silk White for 'S' (harmonizes S-cool with 100% legibility over red foliage)
      const matS = new THREE.MeshStandardMaterial({
        color: new THREE.Color(1.0, 1.0, 1.0), // Silk White
        roughness: 0.05,
        metalness: 0.02,
        side: THREE.DoubleSide
      });

      const matSRed = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0.92, 0.00, 0.06), // Vivid Pure Canadian Flag Red #EA0014
        roughness: 0.20,
        metalness: 0.08,
        side: THREE.DoubleSide
      });

      // Pure White Hyphen as explicitly requested by user
      const matDash = new THREE.MeshStandardMaterial({
        color: new THREE.Color(1.0, 1.0, 1.0), // Silk White Hyphen
        roughness: 0.05,
        metalness: 0.02,
        side: THREE.DoubleSide
      });

      const matCoolWhite = new THREE.MeshStandardMaterial({
        color: new THREE.Color(1.0, 1.0, 1.0), // Pure Silk White
        roughness: 0.05,
        metalness: 0.02,
        side: THREE.DoubleSide
      });

      const matCoolTeal = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0.55, 0.00, 0.04), // Deep Velvet Burgundy Shadow
        roughness: 0.28,
        metalness: 0.05,
        side: THREE.DoubleSide
      });

      // "S" with Inverse Cool Palette:
      // In "cool": Front is White, Casing is Red/Burgundy.
      // In "S": Front is Red, Casing / Bevel / Sides is Pure Silk White!
      const matSInverseCool = new THREE.MeshStandardMaterial({
        color: new THREE.Color(1.0, 1.0, 1.0),
        roughness: 0.16,
        metalness: 0.04,
        side: THREE.DoubleSide
      });

      matSInverseCool.onBeforeCompile = function (shader) {
        shader.vertexShader = shader.vertexShader.replace(
          '#include <common>',
          `#include <common>
           varying vec3 vViewNormalCustom;`
        );
        shader.vertexShader = shader.vertexShader.replace(
          '#include <defaultnormal_vertex>',
          `#include <defaultnormal_vertex>
           vViewNormalCustom = normalize(normalMatrix * normal);`
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <common>',
          `#include <common>
           varying vec3 vViewNormalCustom;`
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <color_fragment>',
          `#include <color_fragment>
           float facingZ = clamp(vViewNormalCustom.z, 0.0, 1.0);
           float frontMask = smoothstep(0.50, 0.70, facingZ);
           vec3 redFront = vec3(0.92, 0.00, 0.06);   // Canadian Flag Red Front
           vec3 whiteCasing = vec3(1.0, 1.0, 1.0);  // Pure Silk White Casing
           diffuseColor.rgb = mix(whiteCasing, redFront, frontMask);`
        );
      };

      root.traverse((child) => {
        if (child.isMesh) {
          const name = child.name || '';
          const pName = child.parent ? (child.parent.name || '') : '';

          if (name.includes('Cyclorama') || pName.includes('Cyclorama') || name.includes('DIGITAL') || pName.includes('DIGITAL')) {
            child.visible = false;
            return;
          }

          if (name.includes('Letter_S') || name.includes('S_Hero') || pName.includes('Letter_S')) {
            child.material = matSInverseCool;
            window.__tefMeshS = child;
          } else if (name.includes('Dash') || name.includes('Squircle') || pName.includes('Dash')) {
            child.material = matDash;
          } else if (name.includes('Cool_White') || pName.includes('Cool_White')) {
            child.material = matCoolWhite;
          } else if (name.includes('Cool_Teal') || pName.includes('Cool_Teal')) {
            child.material = matCoolTeal;
          }
        }
      });

      window.__setTefSStyle = function(styleName) {
        if (!window.__tefMeshS) return;
        if (styleName === 'white') {
          window.__tefMeshS.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(1.0, 1.0, 1.0),
            roughness: 0.05,
            metalness: 0.02,
            side: THREE.DoubleSide
          });
        } else if (styleName === 'twotone') {
          const matTwoTone = new THREE.MeshStandardMaterial({
            color: new THREE.Color(1.0, 1.0, 1.0),
            roughness: 0.12,
            metalness: 0.04,
            side: THREE.DoubleSide
          });
          matTwoTone.onBeforeCompile = function (shader) {
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <opaque_fragment>',
              `#include <opaque_fragment>
               float facing = clamp(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
               float frontMask = smoothstep(0.32, 0.68, facing);
               vec3 sideRed = vec3(0.88, 0.0, 0.06);
               gl_FragColor.rgb = mix(sideRed, outgoingLight, frontMask);`
            );
          };
          window.__tefMeshS.material = matTwoTone;
        } else if (styleName === 'twotone_burgundy') {
          const matTwoToneBurgundy = new THREE.MeshStandardMaterial({
            color: new THREE.Color(1.0, 1.0, 1.0),
            roughness: 0.12,
            metalness: 0.04,
            side: THREE.DoubleSide
          });
          matTwoToneBurgundy.onBeforeCompile = function (shader) {
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <opaque_fragment>',
              `#include <opaque_fragment>
               float facing = clamp(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
               float frontMask = smoothstep(0.32, 0.68, facing);
               vec3 sideBurgundy = vec3(0.55, 0.0, 0.04);
               gl_FragColor.rgb = mix(sideBurgundy, outgoingLight, frontMask);`
            );
          };
          window.__tefMeshS.material = matTwoToneBurgundy;
        } else if (styleName === 'red') {
          window.__tefMeshS.material = matSRed;
        }
      };

      // Compute bounding box of visible meshes only
      const box = new THREE.Box3();
      root.traverse((child) => {
        if (child.isMesh && child.visible) {
          box.expandByObject(child);
        }
      });
      const center = new THREE.Vector3();
      box.getCenter(center);
      const size = new THREE.Vector3();
      box.getSize(size);

      // Wrapper group for centering & orientation
      scoolWrapper = new THREE.Group();
      root.position.sub(center);
      scoolWrapper.add(root);

      // Frontal orientation (-0.06 rad): makes the iconic S curve 100% readable
      scoolWrapper.rotation.y = -0.06;

      // Scale to match TEF height
      scoolScaleFactor = (1.18 / (size.y || 1)) * 0.90;
      scoolWrapper.scale.set(scoolScaleFactor, scoolScaleFactor, scoolScaleFactor);

      // Position S-cool centered above TEF badge (Option B Crest)
      scoolWrapper.position.set(0.0, scoolBasePosY, 0.0);
      logoScoolGroup.add(scoolWrapper);
      console.log('[TEF Badge] Cloned S-cool from digitalScoolRoot successfully.');
    }

    window.setTefLogoLayout = function(mode) {
      if (!scoolWrapper || !tefBadgeGroup || !camera || !renderer || !canvas) return;

      if (mode === 'separated') {
        // Option A: Separated horizontally with generous breathing room
        scoolBasePosY = 0.0;
        tefBasePosY = 0.02;
        scoolWrapper.position.set(-1.32, scoolBasePosY, 0.0);
        scoolWrapper.scale.set(scoolScaleFactor * 0.96, scoolScaleFactor * 0.96, scoolScaleFactor * 0.96);
        tefBadgeGroup.position.set(1.72, tefBasePosY, 0.0);
        tefBadgeGroup.scale.set(0.92, 0.92, 0.92);

        canvas.style.width = '320px';
        canvas.style.height = '75px';
        camera.position.set(0.14, 0.02, 4.60);
        onResize();
      } else if (mode === 'stacked') {
        // Option B: Centered underneath S-cool with smaller pill and clean breathing room
        scoolBasePosY = 0.46;
        tefBasePosY = -0.62;
        scoolWrapper.position.set(0.0, scoolBasePosY, 0.0);
        scoolWrapper.scale.set(scoolScaleFactor * 0.90, scoolScaleFactor * 0.90, scoolScaleFactor * 0.90);
        tefBadgeGroup.position.set(0.0, tefBasePosY, -0.05);
        tefBadgeGroup.scale.set(0.64, 0.64, 0.64);

        canvas.style.width = '210px';
        canvas.style.height = '120px';
        camera.position.set(0.0, -0.05, 4.45);
        onResize();
      } else if (mode === 'classic') {
        scoolBasePosY = 0.0;
        tefBasePosY = 0.02;
        scoolWrapper.position.set(-1.18, scoolBasePosY, 0.0);
        scoolWrapper.scale.set(scoolScaleFactor, scoolScaleFactor, scoolScaleFactor);
        tefBadgeGroup.position.set(1.40, tefBasePosY, 0.0);
        tefBadgeGroup.scale.set(0.95, 0.95, 0.95);

        canvas.style.width = '270px';
        canvas.style.height = '75px';
        camera.position.set(0.05, 0.02, 4.25);
        onResize();
      }
    };

    window.setTefStackedConfig = function(scoolY, tefY, tefScale, camZ, canvasH) {
      if (!scoolWrapper || !tefBadgeGroup || !camera || !renderer || !canvas) return;
      scoolBasePosY = scoolY !== undefined ? scoolY : scoolBasePosY;
      tefBasePosY = tefY !== undefined ? tefY : tefBasePosY;
      scoolWrapper.position.set(0.0, scoolBasePosY, 0.0);
      tefBadgeGroup.position.set(0.0, tefBasePosY, -0.05);
      if (tefScale !== undefined) tefBadgeGroup.scale.set(tefScale, tefScale, tefScale);
      if (canvasH) canvas.style.height = canvasH + 'px';
      if (camZ) camera.position.set(0.0, -0.05, camZ);
      onResize();
    };

    if (window.__digitalScoolRoot) {
      buildScool(window.__digitalScoolRoot);
    } else {
      window.addEventListener('digitalScoolLoaded', function (e) {
        buildScool(e.detail?.root || window.__digitalScoolRoot);
      });
      // Fallback loader if independent
      if (typeof THREE.GLTFLoader !== 'undefined') {
        const loader = new THREE.GLTFLoader();
        loader.load('./digital_scool.glb', function (gltf) {
          buildScool(gltf.scene);
        });
      }
    }
  }

  function onResize() {
    if (!renderer || !camera || !canvas) return;
    const width = canvas.clientWidth || 280;
    const height = canvas.clientHeight || 75;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function onMouseMove(e) {
    // Parallax relative to window center
    const nx = (e.clientX / window.innerWidth) - 0.5;
    const ny = (e.clientY / window.innerHeight) - 0.5;
    targetRotY = nx * 0.45; // Max ~25 degrees yaw
    targetRotX = -ny * 0.35; // Max ~20 degrees pitch
  }

  function onScroll() {
    const stage = document.getElementById('hub-july-scroll-stage');
    if (!stage || !container) return;

    const rect = stage.getBoundingClientRect();
    // Stage is active while in or entering viewport
    const inView = rect.top <= window.innerHeight * 0.75 && rect.bottom >= window.innerHeight * 0.15;

    if (inView !== isStageActive) {
      isStageActive = inView;
      if (inView) {
        container.classList.add('is-visible');
      } else {
        container.classList.remove('is-visible');
      }
    }
  }

  function renderLoop(time) {
    requestAnimationFrame(renderLoop);

    // Smooth rotational lerp towards mouse target
    currentRotX += (targetRotX - currentRotX) * 0.08;
    currentRotY += (targetRotY - currentRotY) * 0.08;

    // Subtle organic floating bobbing
    const seconds = time * 0.001;
    const bobY = Math.sin(seconds * 1.8) * 0.08;
    const gentleTiltZ = Math.cos(seconds * 1.4) * 0.03;

    if (rootGroup) {
      rootGroup.rotation.x = currentRotX;
      rootGroup.rotation.y = currentRotY;
      rootGroup.rotation.z = gentleTiltZ;
      rootGroup.position.y = bobY;
    }

    if (scoolWrapper) {
      scoolWrapper.position.y = scoolBasePosY;
    }

    if (tefBadgeGroup) {
      // Subtle pulse in the 3D TEF pill
      const pillBob = Math.sin(seconds * 2.4) * 0.04;
      tefBadgeGroup.position.y = tefBasePosY + pillBob;
    }

    renderer.render(scene, camera);
  }

  // Self-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
